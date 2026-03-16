export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { orderId, email, name, surname, total, items } = req.body || {};

  if (!orderId || typeof orderId !== "string" || !orderId.trim()) {
    res.status(400).json({ error: "Missing or invalid orderId" });
    return;
  }
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({ error: "Missing or invalid email" });
    return;
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    res.status(500).json({ error: "Missing RESEND_API_KEY" });
    return;
  }

  const fromAddress = process.env.RESEND_FROM || "onboarding@resend.dev";
  const customerName = [name, surname].filter(Boolean).join(" ").trim() || "Kliente";
  const totalStr = total != null ? ` ${Number(total).toFixed(2)} €` : "";
  const itemsList = Array.isArray(items) && items.length
    ? items.map((it) => `  • ${it.name || "Prekė"}${it.quantity ? ` × ${it.quantity}` : ""}`).join("\n")
    : "";

  const text =
    `Sveiki${customerName !== "Kliente" ? `, ${customerName}` : ""}!\n\n` +
    `Dėkojame už pirkinį. Jūsų užsakymas patvirtintas.\n\n` +
    `Užsakymo numeris: ${orderId.trim()}${totalStr ? `\nSuma:${totalStr}` : ""}\n\n` +
    (itemsList ? `Užsakymo turinys:\n${itemsList}\n\n` : "") +
    `Jei turite klausimų, susisiekite su mumis.\n\n` +
    `Su pagarba,\nVasaros Kampelis`;

  const emailPayload = {
    from: fromAddress,
    to: [email.trim()],
    subject: `Užsakymas patvirtintas – ${orderId.trim()}`,
    text,
  };

  try {
    const forward = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!forward.ok) {
      const msg = await forward.json().catch(() => ({ message: await forward.text().catch(() => "") }));
      console.error("Resend order confirmation error:", forward.status, msg);
      res.status(502).json({ error: "Failed to send confirmation email", details: msg });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Send order confirmation error:", err);
    res.status(500).json({ error: "Server error sending email" });
  }
}
