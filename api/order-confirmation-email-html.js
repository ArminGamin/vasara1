/** Order confirmation email HTML — used by stripe-webhook.js on payment_intent.succeeded */
export function buildOrderConfirmationHtml(orderNumber) {
  return `<!DOCTYPE html>
<html lang="lt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Užsakymas patvirtintas – Vasaros Kampelis</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: #FFF0F5;
      font-family: 'DM Sans', Georgia, sans-serif;
      color: #2C1A0E;
      -webkit-font-smoothing: antialiased;
    }

    .wrapper {
      width: 100%;
      background-color: #FFF0F5;
      padding: 40px 16px;
    }

    .container {
      max-width: 560px;
      margin: 0 auto;
    }

    .top-badge {
      text-align: center;
      margin-bottom: 28px;
    }
    .top-badge span {
      display: inline-block;
      background: #FFD6E8;
      color: #9C1A5E;
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      padding: 6px 18px;
      border-radius: 100px;
    }

    .hero {
      background: linear-gradient(135deg, #F0679E 0%, #FF8C6B 100%);
      border-radius: 24px 24px 0 0;
      padding: 52px 40px 44px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 200px; height: 200px;
      background: rgba(255,255,255,0.12);
      border-radius: 50%;
    }
    .hero::after {
      content: '';
      position: absolute;
      bottom: -60px; left: -30px;
      width: 160px; height: 160px;
      background: rgba(255,255,255,0.08);
      border-radius: 50%;
    }

    .hero-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
    }

    .hero h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      font-weight: 700;
      color: #fff;
      line-height: 1.15;
      margin-bottom: 10px;
      position: relative;
      z-index: 1;
      text-shadow: 0 2px 12px rgba(160,20,80,0.20);
    }

    .hero p {
      color: rgba(255,255,255,0.92);
      font-size: 15px;
      font-weight: 500;
      position: relative;
      z-index: 1;
    }

    .card {
      background: #fff;
      border-radius: 0 0 24px 24px;
      padding: 40px 40px 36px;
      box-shadow: 0 8px 40px rgba(200,50,120,0.10);
    }

    .greeting {
      font-size: 16px;
      color: #2C1A0E;
      margin-bottom: 10px;
      font-weight: 500;
    }

    .intro {
      font-size: 15px;
      color: #8B3060;
      line-height: 1.7;
      margin-bottom: 32px;
    }

    .order-box {
      background: #FFF0F5;
      border: 1.5px solid #F9BDD8;
      border-radius: 14px;
      padding: 22px 24px;
      margin-bottom: 32px;
    }

    .order-box-label {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #C2185B;
      margin-bottom: 8px;
    }

    .order-number {
      font-family: 'Playfair Display', serif;
      font-size: 22px;
      font-weight: 700;
      color: #2C1A0E;
      letter-spacing: 0.5px;
      word-break: break-all;
    }

    .steps {
      margin-bottom: 36px;
    }

    .steps-title {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #C2185B;
      margin-bottom: 16px;
    }

    .step {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 16px;
    }

    .step-dot {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #F9BDD8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: #9C1A5E;
      margin-top: 1px;
    }

    .step-dot.active {
      background: linear-gradient(135deg, #F0679E, #FF8C6B);
      color: #fff;
    }

    .step-text strong {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #2C1A0E;
      margin-bottom: 2px;
    }

    .step-text span {
      font-size: 13px;
      color: #9B4070;
    }

    .cta-wrap {
      text-align: center;
      margin-bottom: 36px;
    }

    .cta-btn {
      display: inline-block;
      background: linear-gradient(135deg, #F0679E, #FF8C6B);
      color: #fff !important;
      text-decoration: none;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.3px;
      padding: 16px 40px;
      border-radius: 100px;
      box-shadow: 0 6px 24px rgba(240,103,158,0.35);
      transition: all 0.2s;
    }

    .divider {
      border: none;
      border-top: 1.5px solid #F9C8DC;
      margin: 0 0 28px;
    }

    .help {
      text-align: center;
    }

    .help p {
      font-size: 14px;
      color: #9B4070;
      margin-bottom: 8px;
    }

    .help a {
      color: #E91E8C;
      text-decoration: none;
      font-weight: 600;
    }

    .footer {
      text-align: center;
      margin-top: 32px;
      padding: 0 16px;
    }

    .footer-brand {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: #D63384;
      margin-bottom: 10px;
    }

    .footer p {
      font-size: 12px;
      color: #D4789A;
      line-height: 1.7;
    }

    .footer a {
      color: #D4789A;
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .hero { padding: 40px 24px 36px; }
      .card { padding: 32px 24px 28px; }
      .hero h1 { font-size: 26px; }
      .order-number { font-size: 18px; }
    }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="container">

    <div class="top-badge">
      <span>☀️ &nbsp;Vasaros Kampelis</span>
    </div>

    <div class="hero">
      <span class="hero-icon">🎉</span>
      <h1>Užsakymas patvirtintas!</h1>
      <p>Ačiū — netrukus pradėsime jį ruošti.</p>
    </div>

    <div class="card">

      <p class="greeting">Sveiki! 👋</p>
      <p class="intro">
        Jūsų užsakymas sėkmingai gautas. Džiaugiamės, kad pasirinkote
        „Vasaros Kampelis“! Šiuo metu jau ruošiame jūsų užsakymą ir pasirūpinsime,
        kad jis būtų išsiųstas kuo greičiau.
      </p>

      <div class="order-box">
        <div class="order-box-label">Užsakymo numeris</div>
        <div class="order-number">${orderNumber}</div>
      </div>

      <div class="steps">
        <div class="steps-title">Užsakymo eiga</div>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
          <tr>
            <td width="28" height="28" style="width:28px;height:28px;border-radius:50%;background:#F0679E;text-align:center;vertical-align:middle;font-size:13px;font-weight:700;color:#fff;font-family:'DM Sans',sans-serif;">✓</td>
            <td style="padding-left:14px;vertical-align:middle;">
              <strong style="display:block;font-size:14px;font-weight:600;color:#2C1A0E;margin-bottom:2px;font-family:'DM Sans',sans-serif;">Užsakymas gautas</strong>
              <span style="font-size:13px;color:#9B4070;font-family:'DM Sans',sans-serif;">Jūsų užsakymas sėkmingai apdorotas.</span>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
          <tr>
            <td width="28" height="28" style="width:28px;height:28px;border-radius:50%;background:#F9BDD8;text-align:center;vertical-align:middle;font-size:13px;font-weight:700;color:#9C1A5E;font-family:'DM Sans',sans-serif;">2</td>
            <td style="padding-left:14px;vertical-align:middle;">
              <strong style="display:block;font-size:14px;font-weight:600;color:#2C1A0E;margin-bottom:2px;font-family:'DM Sans',sans-serif;">Ruošiamas siuntai</strong>
              <span style="font-size:13px;color:#9B4070;font-family:'DM Sans',sans-serif;">Mūsų komanda komplektuoja jūsų prekes.</span>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
          <tr>
            <td width="28" height="28" style="width:28px;height:28px;border-radius:50%;background:#F9BDD8;text-align:center;vertical-align:middle;font-size:13px;font-weight:700;color:#9C1A5E;font-family:'DM Sans',sans-serif;">3</td>
            <td style="padding-left:14px;vertical-align:middle;">
              <strong style="display:block;font-size:14px;font-weight:600;color:#2C1A0E;margin-bottom:2px;font-family:'DM Sans',sans-serif;">Išsiųsta</strong>
              <span style="font-size:13px;color:#9B4070;font-family:'DM Sans',sans-serif;">Gausite el. laišką su sekimo numeriu.</span>
            </td>
          </tr>
        </table>
      </div>

      <div class="cta-wrap">
        <a href="https://www.vasaroskampelis.com/" class="cta-btn">
          Grįžti į parduotuvę →
        </a>
      </div>

      <hr class="divider" />

      <div class="help">
        <p>Turite klausimų apie užsakymą?</p>
        <p>
          Rašykite mums: <a href="mailto:vasaroskampelis@gmail.com">vasaroskampelis@gmail.com</a>
        </p>
      </div>

    </div>

    <div class="footer">
      <div class="footer-brand">🌊 Vasaros Kampelis</div>
      <p>
        Šį laišką gavote, nes pateikėte užsakymą mūsų parduotuvėje.<br />
        <a href="https://www.vasaroskampelis.com/privatumo-politika">Privatumo politika</a>
      </p>
    </div>

  </div>
</div>
</body>
</html>`;
}
