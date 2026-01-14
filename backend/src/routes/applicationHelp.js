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
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Store the request
    addApplicationRequest({ name, email, cellphone, message });
    // Send email as before
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
// Get all application assist requests
router.get("/all-requests", (req, res) => {
  const requests = getAllApplicationRequests();
  res.json({ success: true, requests });
});
});

export default router;
