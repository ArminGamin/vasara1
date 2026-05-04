// Using loose types to avoid requiring '@vercel/node' in this Vite app

import { Redis } from '@upstash/redis';

const SUBSCRIBERS_TXT_KEY = 'nl:subscribers_txt';

async function appendNewsletterEmailLine(email: string) {
  const line = `${email}\n`;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    try {
      await new Redis({ url, token }).append(SUBSCRIBERS_TXT_KEY, line);
    } catch (err) {
      console.error('newsletter subscribers append (redis):', err);
    }
    return;
  }
  if (process.env.VERCEL) return;
  try {
    const { mkdir, appendFile } = await import('fs/promises');
    const path = await import('path');
    const file = path.join(process.cwd(), 'data', 'newsletter-subscribers.txt');
    await mkdir(path.dirname(file), { recursive: true });
    await appendFile(file, line, 'utf8');
  } catch (err) {
    console.error('newsletter subscribers append (file):', err);
  }
}

// In-memory rate limit per IP (100 req / 8 h). Use Upstash for multi-instance.
const RATE_LIMIT_WINDOW_MS = 8 * 60 * 60 * 1000;
const RATE_LIMIT_MAX = 100;
const ipCounts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Optional Redis (Upstash) for global dedup
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisGet(key: string) {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  const r = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    cache: 'no-store',
  });
  if (!r.ok) return null;
  const data = await r.json().catch(() => null);
  return data?.result ?? null;
}

async function redisSetNX(key: string, value: string, ttlSeconds: number) {
  if (!REDIS_URL || !REDIS_TOKEN) return false;
  const r = await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?NX=1&EX=${ttlSeconds}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  if (!r.ok) return false;
  const data = await r.json().catch(() => null);
  return data?.result === 'OK';
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Per daug bandymų. Bandykite vėliau.' });
  }

  try {
    const { email } = (req.body || {}) as { email?: string };
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    const e = email.trim().toLowerCase();

    // Global dedup with Redis (24h TTL extendable)
    if (REDIS_URL && REDIS_TOKEN) {
      const key = `nl:email:${e}`;
      const exists = await redisGet(key);
      if (exists) {
        return res.status(409).json({ error: 'Šis el. paštas jau užregistruotas.' });
      }
      const ok = await redisSetNX(key, '1', 60 * 60 * 24);
      if (!ok) {
        return res.status(409).json({ error: 'Šis el. paštas jau užregistruotas.' });
      }
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return res.status(500).json({ error: 'Missing RESEND_API_KEY' });
    }

    const fromAddress = process.env.RESEND_FROM || 'onboarding@resend.dev';

    // Notify you of a new subscriber
    const forward = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: ['vasaroskampelis@gmail.com'],
        subject: 'Naujas naujienlaiškio prenumeratorius',
        text: `Gautas naujas prenumeratos adresas: ${e}`,
      }),
    });

    if (!forward.ok) {
      const msg = await forward.json().catch(async () => ({ message: await forward.text().catch(() => '') }));
      return res.status(502).json({ error: 'Failed to deliver', details: msg });
    }

    await appendNewsletterEmailLine(e);

    // Send confirmation email to the subscriber
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [e],
          subject: 'Ačiū už prenumeratą! | Vasaros Kampelis',
          html: `<!DOCTYPE html>
<html lang="lt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sveiki atvykę į Vasaros Kampelis!</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background-color: #f0f4f8;
      font-family: 'Nunito', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.10);
    }

    /* HEADER */
    .header {
      background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
      padding: 28px 40px 24px;
      text-align: center;
    }

    .header .logo {
      font-size: 22px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    .header .logo span {
      color: #fde68a;
    }

    .header .tagline {
      font-size: 13px;
      color: rgba(255,255,255,0.8);
      margin-top: 4px;
      letter-spacing: 0.5px;
    }

    /* HERO IMAGE */
    .hero-image {
      width: 100%;
      display: block;
      background: #0c1a2e;
    }

    .hero-image img {
      width: 100%;
      display: block;
      max-height: 320px;
      object-fit: cover;
      object-position: center;
    }

    /* BODY */
    .body {
      padding: 40px 44px 36px;
    }

    .greeting {
      font-size: 26px;
      font-weight: 900;
      color: #0c1a2e;
      margin-bottom: 8px;
    }

    .intro {
      font-size: 16px;
      color: #374151;
      line-height: 1.6;
      margin-bottom: 28px;
    }

    .intro .fire {
      font-size: 18px;
    }

    /* PERKS */
    .perks {
      background: #f0f9ff;
      border-left: 4px solid #0ea5e9;
      border-radius: 0 12px 12px 0;
      padding: 20px 24px;
      margin-bottom: 28px;
    }

    .perks p {
      font-size: 14px;
      font-weight: 700;
      color: #0369a1;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 12px;
    }

    .perk-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 10px;
    }

    .perk-item:last-child {
      margin-bottom: 0;
    }

    .perk-icon {
      font-size: 16px;
      line-height: 1.4;
      flex-shrink: 0;
    }

    .perk-text {
      font-size: 15px;
      color: #1e3a5f;
      font-weight: 700;
      line-height: 1.4;
    }

    /* CTA */
    .cta-block {
      text-align: center;
      margin-bottom: 32px;
    }

    .cta-pre {
      font-size: 15px;
      color: #6b7280;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .cta-pre strong {
      color: #0c1a2e;
    }

    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 17px;
      font-weight: 900;
      padding: 16px 44px;
      border-radius: 50px;
      letter-spacing: 0.3px;
      box-shadow: 0 4px 20px rgba(14, 165, 233, 0.4);
    }

    /* SIGN OFF */
    .signoff {
      border-top: 1px solid #e5e7eb;
      padding-top: 24px;
      font-size: 15px;
      color: #374151;
      line-height: 1.7;
    }

    .signoff .name {
      font-weight: 900;
      color: #0369a1;
      font-size: 16px;
    }

    /* FOOTER */
    .footer {
      background: #0c1a2e;
      padding: 24px 40px;
      text-align: center;
    }

    .footer p {
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      line-height: 1.7;
    }

    .footer a {
      color: rgba(255,255,255,0.6);
      text-decoration: underline;
    }

    /* MOBILE */
    @media (max-width: 620px) {
      .wrapper { margin: 0; border-radius: 0; }
      .body { padding: 28px 24px; }
      .footer { padding: 20px 24px; }
      .header { padding: 22px 24px; }
      .greeting { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- HEADER -->
    <div class="header">
      <div class="logo">☀️ Vasaros <span>Kampelis</span></div>
      <div class="tagline">Vandens šautuvai · Vasaros žaidimai · Lietuva</div>
    </div>

    <!-- HERO IMAGE -->
    <div class="hero-image">
      <img
        src="https://www.vasaroskampelis.com/blue1-1024w.webp"
        alt="Elektrinis vandens šautuvas – Vasaros Kampelis"
        width="600"
      />
    </div>

    <!-- BODY -->
    <div class="body">

      <div class="greeting">Sveiki! 👋</div>

      <div class="intro">
        Vasaros Kampelis čia. Ir džiaugiamės, kad esate su mumis. <span class="fire">🔥</span>
      </div>

      <div class="perks">
        <p>Dabar oficialiai esate pirmieji, kurie sužinos:</p>
        <div class="perk-item">
          <span class="perk-icon">⚡</span>
          <span class="perk-text">Geriausias akcijas</span>
        </div>
        <div class="perk-item">
          <span class="perk-icon">⚡</span>
          <span class="perk-text">Naujus produktus dar prieš visiems</span>
        </div>
        <div class="perk-item">
          <span class="perk-icon">⚡</span>
          <span class="perk-text">Vasaros idėjas, kurios iš tiesų veikia</span>
        </div>
      </div>

      <div class="cta-block">
        <p class="cta-pre">Vienas dalykas prieš baigiant —<br><strong>jūsų šautuvas jau laukia.</strong></p>
        <a href="https://vasaroskampelis.com" class="cta-button">Pirk dabar →</a>
      </div>

      <div class="signoff">
        Iki greito,<br>
        <span class="name">Vasaros Kampelis ☀️</span>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p>
        Gavote šį laišką, nes užsiprenumeravote Vasaros Kampelio naujienlaiškį.<br>
        <a href="mailto:vasaroskampelis@gmail.com?subject=atsisakyti%20prenumeratos">Atsisakyti prenumeratos</a>
      </p>
    </div>

  </div>
</body>
</html>`,
        }),
      });
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
    }

    // Notify Discord (newsletter channel)
    try {
      const webhook = process.env.DISCORD_NEWSLETTER_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1433587314684071961/pjDZLwaQJE21dQMkXVivP-dRxLgvx75DrlSbChvOfUTLsJ6V-kuN3KVjaQ1y0EgbmbAO';
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [
            {
              title: 'Naujas naujienlaiškio prenumeratorius',
              color: 0x3498db,
              timestamp: new Date().toISOString(),
              fields: [
                { name: 'El. paštas', value: e, inline: false }
              ]
            }
          ]
        })
      });
    } catch {}

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}
