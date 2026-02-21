import express from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";
import { protectSmartApply } from "../middleware/auth.js";

const router = express.Router();

const JWT_OPTIONS = { expiresIn: process.env.JWT_EXPIRE || "7d" };
function signSmartApplyToken(id) {
  return jwt.sign({ id, type: "smart_apply" }, process.env.JWT_SECRET, JWT_OPTIONS);
}

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

// ---------- Smart Apply auth (standalone – uses smart_apply_candidates only) ----------

// @route   POST /api/smart-apply/auth/register
// @desc    Register new Smart Apply candidate (no shared users table)
// @access  Public
router.post("/auth/register", async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "Full name, email and password required" });
    }
    const existing = await query("SELECT id FROM smart_apply_candidates WHERE email = ?", [email.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(
      "INSERT INTO smart_apply_candidates (email, password_hash, full_name, phone) VALUES (?, ?, ?, ?)",
      [email.trim(), password_hash, fullName.trim(), phone || null]
    );
    const id = result.insertId;
    const token = signSmartApplyToken(id);
    return res.status(201).json({
      success: true,
      message: "Account created",
      token,
      candidate: { id, fullName: fullName.trim(), email: email.trim(), phone: phone || null },
    });
  } catch (err) {
    console.error("Smart Apply register error:", err);
    return res.status(500).json({ success: false, message: err.message || "Registration failed" });
  }
});

// @route   POST /api/smart-apply/auth/login
// @desc    Login Smart Apply candidate (smart_apply_candidates only)
// @access  Public
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    const rows = await query(
      "SELECT id, full_name, email, phone, password_hash FROM smart_apply_candidates WHERE email = ?",
      [email.trim()]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const candidate = rows[0];
    const valid = await bcrypt.compare(password, candidate.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const token = signSmartApplyToken(candidate.id);
    return res.status(200).json({
      success: true,
      message: "Logged in",
      token,
      candidate: { id: candidate.id, fullName: candidate.full_name, email: candidate.email, phone: candidate.phone },
    });
  } catch (err) {
    console.error("Smart Apply login error:", err);
    return res.status(500).json({ success: false, message: err.message || "Login failed" });
  }
});

// @route   GET /api/smart-apply/profile
// @desc    Get current candidate's profile (smart_apply_candidates)
// @access  Private (Smart Apply token)
router.get("/profile", protectSmartApply, async (req, res) => {
  try {
    const u = req.candidate;
    return res.status(200).json({
      success: true,
      profile: {
        fullName: u.full_name,
        email: u.email,
        phone: u.phone || null,
        category: u.candidate_category || null,
        overview: u.cv_overview || null,
        workExperience: u.cv_work_experience || null,
        education: u.cv_education || null,
        certifications: u.cv_certifications || null,
        keySkills: u.cv_key_skills || null,
      },
    });
  } catch (err) {
    console.error("Smart Apply get profile error:", err);
    return res.status(500).json({ error: err.message || "Failed to get profile" });
  }
});

// @route   PUT /api/smart-apply/profile
// @desc    Save candidate profile (category + CV extract) in smart_apply_candidates
// @access  Private (Smart Apply token)
router.put("/profile", protectSmartApply, async (req, res) => {
  try {
    const { category, overview, workExperience, education, certifications, keySkills } = req.body;
    if (!category || !["general", "professional"].includes(category)) {
      return res.status(400).json({ error: "category must be 'general' or 'professional'" });
    }
    const cid = req.candidate.id;
    await query(
      `UPDATE smart_apply_candidates SET candidate_category = ?, cv_overview = ? WHERE id = ?`,
      [category, overview || null, cid]
    );
    const insertSection = async (table, value) => {
      await query(`DELETE FROM ${table} WHERE candidate_id = ?`, [cid]);
      if (value != null && String(value).trim() !== "") {
        const parts = String(value).split(/\n\n+/).map((s) => s.trim()).filter(Boolean);
        if (parts.length === 0) parts.push(String(value).trim());
        for (let i = 0; i < parts.length; i++) {
          await query(`INSERT INTO ${table} (candidate_id, content, sort_order) VALUES (?, ?, ?)`, [cid, parts[i], i]);
        }
      }
    };
    await insertSection("smart_apply_work_experience", workExperience);
    await insertSection("smart_apply_education", education);
    await insertSection("smart_apply_certifications", certifications);
    await insertSection("smart_apply_key_skills", keySkills);
    return res.status(200).json({ success: true, category });
  } catch (err) {
    console.error("Smart Apply profile update error:", err);
    return res.status(500).json({ error: err.message || "Failed to save profile" });
  }
});

// @route   GET /api/smart-apply/candidates
// @desc    List candidates for recruiters (smart_apply_candidates only); ?category=general|professional
// @access  Public
router.get("/candidates", async (req, res) => {
  try {
    const { category } = req.query;
    let sql = "SELECT id, full_name, email, phone, candidate_category, created_at FROM smart_apply_candidates WHERE candidate_category IS NOT NULL";
    const params = [];
    if (category === "general" || category === "professional") {
      sql += " AND candidate_category = ?";
      params.push(category);
    }
    sql += " ORDER BY created_at DESC";
    const rows = await query(sql, params);
    return res.status(200).json({
      success: true,
      candidates: rows.map((r) => ({
        id: r.id,
        fullName: r.full_name,
        email: r.email,
        phone: r.phone || null,
        category: r.candidate_category,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    console.error("Smart Apply candidates list error:", err);
    return res.status(500).json({ error: err.message || "Failed to list candidates" });
  }
});

export default router;
