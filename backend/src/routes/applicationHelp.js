import express from "express";
import nodemailer from "nodemailer";
import { addApplicationRequest, getAllApplicationRequests } from "./applicationHelpStore.js";

const router = express.Router();

router.post("/send-application-help", async (req, res) => {
  const { name, email, cellphone, message } = req.body;
  if (!name || !email || !cellphone) {
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
    // Store the request
    addApplicationRequest({ name, email, cellphone, message });
    // Send email as before
    await transporter.sendMail({
      from: `IB Innovative Solutions <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: "New Application Assistance Request",
      text: `Name: ${name}\nEmail: ${email}\nCellphone: ${cellphone}\nMessage: ${message || "-"}`,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: "Failed to send email", details: error.message, stack: error.stack });
  }
// Get all application assist requests
router.get("/all-requests", (req, res) => {
  const requests = getAllApplicationRequests();
  res.json({ success: true, requests });
});
});

export default router;
