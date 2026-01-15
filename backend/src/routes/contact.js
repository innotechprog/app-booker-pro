import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();


router.post("/send-contact", async (req, res) => {
  console.log('BODY:', req.body);
  const { firstName, lastName, email, phone, service, message } = req.body;
  if (!firstName || !lastName || !email || !message || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Configure your SMTP details here
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `IB Innovative Solutions <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: "New Contact Us Message",
      text:
        `First Name: ${firstName}\n` +
        `Last Name: ${lastName}\n` +
        `Email: ${email}\n` +
        `Cellphone: ${phone}\n` +
        `Service Interested In: ${service || "-"}\n` +
        `Message: ${message}`,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: "Failed to send email", details: error.message });
  }
});

export default router;
