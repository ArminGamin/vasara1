import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { email, orderId } = req.body || {};

  if (!orderId || typeof orderId !== "string" || !orderId.trim()) {
    res.status(400).json({ error: "Missing or invalid orderId" });
    return;
  }
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({ error: "Missing or invalid email" });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    res.status(500).json({ error: "Missing RESEND_API_KEY" });
    return;
  }

  const fromAddress = process.env.RESEND_FROM || "onboarding@resend.dev";

  try {
    const html = `
<h1>Užsakymas patvirtintas!</h1>
<p>Užsakymo numeris: <strong>${orderId.trim()}</strong></p>
<p>Ačiū už pirkinį!</p>
`;

    await resend.emails.send({
      from: fromAddress,
      to: email.trim(),
      subject: "Jūsų užsakymas patvirtintas | Vasaros Kampelis",
      html,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Send order confirmation error:", err);
    res.status(500).json({ error: "Failed to send confirmation email", details: err?.message });
  }
}
