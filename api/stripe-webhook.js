import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-11-08" });
const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on("data", (chunk) => chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", (err) => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const sig = req.headers["stripe-signature"];
  const rawBody = await buffer(req);
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const payment = event.data.object;
    const md = payment.metadata || {};

    const orderNumber = md.order_id || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const amount = (payment.amount / 100).toFixed(2);

    try {
      const base = process.env.NEXT_PUBLIC_URL || "https://vasaroskampelis.com";
      await fetch(`${base}/api/notify-discord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'stripe',
          orderNumber,
          total: amount,
          customer: {
            name: md.name || '',
            surname: md.surname || '',
            email: md.email || '',
            phone: md.phone || '',
            address: md.address || ''
          },
          // If you pass a detailed item list in metadata later, send it here
          items: []
        })
      });
    } catch (err) {
      console.error("Discord webhook error:", err);
    }

    // Send order confirmation email for every successful payment (inline + redirect)
    if (md.email) {
      try {
        const html = `<!DOCTYPE html>
<html lang="lt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Užsakymo patvirtinimas</title>

<style>
body{
  margin:0;
  font-family:Arial, Helvetica, sans-serif;
  background:#f5f7fb;
}

.container{
  max-width:600px;
  margin:40px auto;
  background:#ffffff;
  border-radius:10px;
  overflow:hidden;
  box-shadow:0 6px 20px rgba(0,0,0,0.08);
}

.header{
  background:linear-gradient(90deg,#1e90ff,#00c2ff);
  color:white;
  text-align:center;
  padding:30px 20px;
}

.header h1{
  margin:0;
  font-size:24px;
}

.content{
  padding:30px;
  color:#333;
  line-height:1.6;
}

.order-box{
  background:#f3f6fb;
  padding:15px;
  border-radius:8px;
  margin:20px 0;
  text-align:center;
  font-weight:bold;
}

.button{
  display:inline-block;
  padding:14px 28px;
  background:#22c55e;
  color:white;
  text-decoration:none;
  border-radius:8px;
  font-weight:bold;
  margin-top:20px;
}

.contact{
  margin-top:25px;
  text-align:center;
}

.contact a{
  color:#1e90ff;
  font-weight:bold;
  text-decoration:none;
}

.footer{
  text-align:center;
  font-size:13px;
  color:#888;
  padding:20px;
}
</style>

</head>
<body>

<div class="container">

<div class="header">
<h1>💦 Vasaros Kampelis</h1>
<p>Užsakymas patvirtintas!</p>
</div>

<div class="content">

<p>Sveiki!</p>

<p>
Ačiū už jūsų užsakymą!  
Jūsų užsakymas sėkmingai gautas ir netrukus pradėsime jį ruošti.
</p>

<div class="order-box">
Užsakymo numeris: <b>${orderNumber}</b>
</div>

<p>
Mes jums pranešime, kai užsakymas bus išsiųstas.
</p>

<center>
<a href="https://vasaroskampelis.com" class="button">
Grįžti į parduotuvę
</a>
</center>

<div class="contact">
<p>Turite klausimų apie užsakymą?</p>

<p>
Susisiekite su mumis:  
<a href="mailto:vasaroskampelis@gmail.com">
vasaroskampelis@gmail.com
</a>
</p>
</div>

</div>

<div class="footer">
<p><b>VasarosKampelis.com</b></p>
<p>Elektriniai vandens šautuvai visai vasarai 🔫💦</p>
</div>

</div>

</body>
</html>`;

        const { error } = await resend.emails.send({
          from: process.env.RESEND_FROM || "onboarding@resend.dev",
          to: md.email,
          subject: "Jūsų užsakymas patvirtintas | Vasaros Kampelis",
          html,
        });

        if (error) console.error("Resend error:", error);
      } catch (err) {
        console.error("Email send failed:", err);
      }
    }
  }

  res.status(200).send("OK");
}


