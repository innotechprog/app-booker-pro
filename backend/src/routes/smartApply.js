import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// Same nodemailer setup as contact route
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

router.post("/send-emails", async (req, res) => {
  const { emails, userEmail, userName, cvBase64, cvFileName } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: "No emails to send" });
  }
  if (!userEmail || !userEmail.trim()) {
    return res.status(400).json({ error: "User email is required (reply-to)" });
  }

  // Build attachments: CV if provided
  const attachments = [];
  if (cvBase64 && cvFileName) {
    try {
      const buffer = Buffer.from(cvBase64, "base64");
      attachments.push({
        filename: cvFileName,
        content: buffer,
      });
    } catch (e) {
      console.error("CV attachment error:", e);
    }
  }

  const transporter = getTransporter();
  const sent = [];
  const failed = [];

  for (const item of emails) {
    const { to, subject, body } = item;
    if (!to || !subject || !body) {
      failed.push({ to: to || "unknown", error: "Missing to, subject or body" });
      continue;
    }

    try {
      await transporter.sendMail({
        from: `"${userName || "Job Applicant"}" <${process.env.EMAIL_USER}>`,
        to: to.trim(),
        replyTo: userEmail.trim(),
        bcc: userEmail.trim(),
        subject: subject.trim(),
        text: body.trim(),
        attachments: attachments.length ? attachments : undefined,
      });
      sent.push({ to, subject });
    } catch (error) {
      console.error("Smart Apply send error:", error);
      failed.push({ to, error: error.message || "Failed to send" });
    }
  }

  return res.status(200).json({ success: true, sent, failed });
});

export default router;
