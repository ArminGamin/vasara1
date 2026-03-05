import Stripe from "stripe";
const { computeOrderTotal } = require("./price-table");

const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(secretKey || "");
const ALLOWED_ORIGINS = ["https://vasaroskampelis.com", "http://localhost:5173", "http://localhost:3000"];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!secretKey) {
    res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
    return;
  }

  const {
    name,
    surname,
    email,
    phone,
    address,
    items,
    orderId,
    giftWrapping,
  } = req.body || {};

  const computed = computeOrderTotal(items, !!giftWrapping);
  if (!computed.itemsValid || computed.amountCents < 1) {
    res.status(400).json({ error: 'Invalid items or amount' });
    return;
  }

  const amountCents = computed.amountCents;
  const MIN_CENTS = 1;
  const MAX_CENTS = 1_000_000; // 10,000 EUR
  if (amountCents < MIN_CENTS || amountCents > MAX_CENTS) {
    res.status(400).json({ error: 'Invalid amount' });
    return;
  }
  // Never use client-provided URLs - open redirect risk. Always use request origin or allowlisted domain.
  const baseOrigin = ALLOWED_ORIGINS.includes(req.headers.origin) ? req.headers.origin : 'https://vasaroskampelis.com';
  const finalSuccessUrl = `${baseOrigin}/?status=paid`;
  const finalCancelUrl = baseOrigin;

  const itemsDisplay = Array.isArray(items)
    ? items.map((it) => `${it.name || 'Prekė'} × ${it.quantity || 1}`).join(', ')
    : 'Užsakymas';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: itemsDisplay },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      customer_email: email,
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ['LT', 'LV', 'EE'] },
      payment_intent_data: {
        metadata: {
          name: name || '',
          surname: surname || '',
          email: email || '',
          phone: phone || '',
          address: address || '',
          items: itemsDisplay || '',
          order_id: orderId || '',
        },
      },
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Create Checkout Session error:', err);
    const message = (err && err.message) ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
}


