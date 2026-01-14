import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { name, email, cellphone, message } = req.body;
  if (!name || !email || !cellphone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Configure your SMTP details here
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `App Booker Pro <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || "your@email.com",
      subject: "New Application Assistance Request",
      text: `Name: ${name}\nEmail: ${email}\nCellphone: ${cellphone}\nMessage: ${message || "-"}`,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send email" });
  }
}
