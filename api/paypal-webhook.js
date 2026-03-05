// PayPal webhook handler: verifies signature, enriches with order details,
// and forwards a normalized payload to /api/notify-discord.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const event = req.body || {};
    const type = event.event_type || event.eventType || '';
    const resource = event.resource || {};

    // ---- 1) Verify PayPal webhook signature ----
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const apiBase =
      process.env.PAYPAL_API_BASE ||
      (process.env.PAYPAL_ENV === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com');

    if (!webhookId || !clientId || !clientSecret) {
      console.error('Missing PayPal env vars. Set PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_WEBHOOK_ID.');
      return res.status(500).send('Server not configured for PayPal verification');
    }

    // Get OAuth token
    const authResp = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    if (!authResp.ok) {
      const txt = await authResp.text();
      console.error('PayPal auth failed:', txt);
      return res.status(401).send('PayPal auth failed');
    }
    const { access_token } = await authResp.json();

    const transmissionId = req.headers['paypal-transmission-id'];
    const transmissionTime = req.headers['paypal-transmission-time'];
    const certUrl = req.headers['paypal-cert-url'];
    const authAlgo = req.headers['paypal-auth-algo'];
    const transmissionSig = req.headers['paypal-transmission-sig'];

    const verifyResp = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: event
      })
    });
    const verifyJson = await verifyResp.json().catch(() => ({}));
    if (!verifyResp.ok || verifyJson.verification_status !== 'SUCCESS') {
      console.error('PayPal signature verification failed:', verifyJson);
      return res.status(400).send('Invalid signature');
    }

    // Try to extract core data from common PayPal events
    let orderNumber = resource.id || resource.invoice_id || '';
    let total = '';
    let currency = 'EUR';
    let customer = {};
    let items = [];

    // For CHECKOUT.ORDER.APPROVED: amount lives in purchase_units[0].amount
    if (type === 'CHECKOUT.ORDER.APPROVED' && Array.isArray(resource.purchase_units)) {
      const pu = resource.purchase_units[0] || {};
      if (pu.amount && pu.amount.value) {
        total = String(pu.amount.value);
        currency = pu.amount.currency_code || currency;
      }
      const payer = resource.payer || {};
      customer = {
        name: payer.name?.given_name || '',
        surname: payer.name?.surname || '',
        email: payer.email_address || '',
      };
      // Fetch full order to get items/shipping
      try {
        const orderResp = await fetch(`${apiBase}/v2/checkout/orders/${resource.id}`, {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        if (orderResp.ok) {
          const orderJson = await orderResp.json();
          const pu0 = orderJson.purchase_units?.[0] || {};
          if (!total && pu0.amount?.value) {
            total = String(pu0.amount.value);
            currency = pu0.amount.currency_code || currency;
          }
          const orderItems = Array.isArray(pu0.items) ? pu0.items : [];
          items = orderItems.map((it) => ({
            name: it.name,
            quantity: Number(it.quantity || 1),
            price: Number(it.unit_amount?.value || 0)
          }));
          const ship = pu0.shipping || {};
          const addr = ship.address || {};
          if (!customer.name && ship.name?.full_name) {
            const parts = String(ship.name.full_name).split(' ');
            customer.name = parts[0] || '';
            customer.surname = parts.slice(1).join(' ') || '';
          }
          customer.address = [addr.address_line_1, addr.address_line_2].filter(Boolean).join(', ');
          customer.city = addr.admin_area_2 || '';
          customer.postalCode = addr.postal_code || '';
        }
      } catch (e) {
        console.warn('Failed to fetch order details:', e);
      }
    }

    // For PAYMENT.CAPTURE.COMPLETED: amount lives in resource.amount
    if (!total && resource.amount && resource.amount.value) {
      total = String(resource.amount.value);
      currency = resource.amount.currency_code || currency;
    }

    // Fallback: if we have purchase_units with amount
    if (!total && Array.isArray(resource.purchase_units)) {
      const pu = resource.purchase_units[0] || {};
      if (pu.amount && pu.amount.value) {
        total = String(pu.amount.value);
        currency = pu.amount.currency_code || currency;
      }
    }

    // If capture event -> try to get order + items via capture lookup
    if (type === 'PAYMENT.CAPTURE.COMPLETED' && resource.id) {
      try {
        const capResp = await fetch(`${apiBase}/v2/payments/captures/${resource.id}`, {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        if (capResp.ok) {
          const capJson = await capResp.json();
          const upLink = (capJson.links || []).find((l) => l.rel === 'up');
          const orderLink = (capJson.links || []).find((l) => l.rel === 'up' && /checkout\\/orders/.test(l.href));
          const orderHref = (orderLink || upLink)?.href;
          if (orderHref) {
            const oResp = await fetch(orderHref, { headers: { Authorization: `Bearer ${access_token}` } });
            if (oResp.ok) {
              const orderJson = await oResp.json();
              const pu0 = orderJson.purchase_units?.[0] || {};
              const orderItems = Array.isArray(pu0.items) ? pu0.items : [];
              items = orderItems.map((it) => ({
                name: it.name,
                quantity: Number(it.quantity || 1),
                price: Number(it.unit_amount?.value || 0)
              }));
              const ship = pu0.shipping || {};
              const addr = ship.address || {};
              if (!customer.name && ship.name?.full_name) {
                const parts = String(ship.name.full_name).split(' ');
                customer.name = parts[0] || '';
                customer.surname = parts.slice(1).join(' ') || '';
              }
              customer.address = [addr.address_line_1, addr.address_line_2].filter(Boolean).join(', ');
              customer.city = addr.admin_area_2 || '';
              customer.postalCode = addr.postal_code || '';
            }
          }
        }
      } catch (e) {
        console.warn('Failed to expand capture->order details:', e);
      }
    }

    // Basic guard - require a total
    if (!total) {
      return res.status(400).json({ error: 'No total in webhook payload' });
    }

    const base = process.env.NEXT_PUBLIC_URL || 'https://vasaroskampelis.com';
    await fetch(`${base}/api/notify-discord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'paypal',
        orderNumber,
        total,
        customer,
        items,
      }),
    });

    return res.status(200).send('OK');
  } catch (err) {
    console.error('PayPal webhook error:', err);
    return res.status(500).send('Internal error');
  }
}


