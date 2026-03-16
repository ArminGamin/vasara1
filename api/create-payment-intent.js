import Stripe from "stripe";
import { computeOrderTotal } from "./price-table.js";

const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(secretKey || "");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Method not allowed");
    return;
  }

  if (!secretKey) {
    res.status(500).json({ error: "Missing STRIPE_SECRET_KEY" });
    return;
  }

  const { name, surname, email, phone, address, items, giftWrapping, orderId } = req.body || {};

  const computed = computeOrderTotal(items, !!giftWrapping);
  if (!computed.itemsValid || computed.amountCents < 1) {
    res.status(400).json({ error: "Invalid items or amount" });
    return;
  }

  const amountCents = computed.amountCents;
  const MIN_CENTS = 1;
  const MAX_CENTS = 1_000_000; // 10,000 EUR
  if (amountCents < MIN_CENTS || amountCents > MAX_CENTS) {
    res.status(400).json({ error: 'Invalid amount' });
    return;
  }

  try {
    const metadata = {
      name: name || "",
      surname: surname || "",
      email: email || "",
      phone: phone || "",
      address: address || "",
      items: Array.isArray(items) ? items.map((it) => `${it.name}×${it.quantity}`).join(", ") : "",
      order_id: orderId && typeof orderId === "string" ? orderId.trim() : ""
    };

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "eur", // Must be EUR - server enforces
      metadata
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Create PaymentIntent error:", err);
    const message = (err && err.message) ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}


