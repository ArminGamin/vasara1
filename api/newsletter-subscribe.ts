// Using loose types to avoid requiring '@vercel/node' in this Vite app

// In-memory rate limit per IP (5 req / 15 min). Use Upstash for multi-instance.
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
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
        to: ['info@vasaroskampelis.com'],
        subject: 'Naujas naujienlaiškio prenumeratorius',
        text: `Gautas naujas prenumeratos adresas: ${e}`,
      }),
    });

    if (!forward.ok) {
      const msg = await forward.json().catch(async () => ({ message: await forward.text().catch(() => '') }));
      return res.status(502).json({ error: 'Failed to deliver', details: msg });
    }

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
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.08)">
              <div style="background:linear-gradient(90deg,#1e90ff,#00c2ff);padding:30px 20px;text-align:center">
                <h1 style="color:white;margin:0;font-size:24px">🌿 Vasaros Kampelis</h1>
                <p style="color:white;margin:8px 0 0">Ačiū už prenumeratą!</p>
              </div>
              <div style="padding:30px;color:#333;line-height:1.6">
                <p>Sveiki!</p>
                <p>Esate sėkmingai užsiregistravę gauti Vasaros Kampelio naujienas. Informuosime jus apie akcijas ir naujausius pasiūlymus.</p>
                <p style="margin-top:30px;color:#999;font-size:13px">Jei neprenumeravote — tiesiog ignoruokite šį laišką.</p>
                <p style="color:#999;font-size:13px">Norite atsisakyti prenumeratos? <a href="mailto:info@vasaroskampelis.com?subject=Atsisakyti%20prenumeratos" style="color:#999">Spauskite čia</a>.</p>
              </div>
            </div>
          `,
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
