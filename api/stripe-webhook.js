import Stripe from "stripe";
import { Resend } from "resend";
import { buildOrderConfirmationHtml } from "./order-confirmation-email-html.js";

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
        const html = buildOrderConfirmationHtml(orderNumber);

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


