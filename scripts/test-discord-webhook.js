#!/usr/bin/env node
/**
 * Test script: sends a fake order to the Discord webhook via the notify-discord API.
 * Run: node scripts/test-discord-webhook.js
 * Uses production URL by default. Set BASE_URL=http://localhost:5173 for local dev (with vercel dev).
 */
const BASE = process.env.BASE_URL || 'https://vasaroskampelis.com';
const url = `${BASE}/api/notify-discord`;

const payload = {
  provider: 'stripe',
  orderNumber: 'TEST-ORD-' + Date.now(),
  total: '35.99',
  customer: {
    name: 'Test',
    surname: 'Customer',
    email: 'test@example.com',
    phone: '+37060000000',
    address: 'Test St 1',
    city: 'Vilnius',
    postalCode: 'LT-01001',
  },
  items: [
    { name: 'Vandens šautuvai – Vasaros Kampelis', quantity: 1, price: 35.99, selectedColor: 'Mėlyna' },
  ],
};

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})
  .then((r) => r.json().then((d) => ({ status: r.status, data: d })))
  .then(({ status, data }) => {
    console.log('Status:', status);
    console.log('Response:', data);
    if (status === 200) console.log('\n✅ Check your Discord channel – you should see the test order!');
    else console.log('\n❌ Request failed. Is the site deployed? Try BASE_URL=http://localhost:5173 node scripts/test-discord-webhook.js for local.');
  })
  .catch((err) => {
    console.error('Error:', err.message);
    console.log('\nTip: If testing locally, run "vercel dev" first, then: BASE_URL=http://localhost:3000 node scripts/test-discord-webhook.js');
  });
