import express from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";
import { protectSmartApply } from "../middleware/auth.js";

const router = express.Router();

const CV_TABLE = "smart_apply_cvs";
const MAX_CV_SIZE_BASE64 = 6 * 1024 * 1024; // ~6MB base64

async function ensureCvsTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS ${CV_TABLE} (
      id INT PRIMARY KEY AUTO_INCREMENT,
      candidate_id INT NOT NULL,
      label VARCHAR(255) NOT NULL,
      role_or_category VARCHAR(255) DEFAULT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_content LONGBLOB NOT NULL,
      mime_type VARCHAR(100) DEFAULT 'application/pdf',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_smart_apply_cvs_candidate (candidate_id)
    )`
  );
}

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
    const dateOfBirth = u.date_of_birth ? (typeof u.date_of_birth === 'string' ? u.date_of_birth : u.date_of_birth.toISOString?.().slice(0, 10)) : null;
    return res.status(200).json({
      success: true,
      profile: {
        fullName: u.full_name,
        email: u.email,
        phone: u.phone || null,
        dateOfBirth,
        gender: u.gender || null,
        nationality: u.nationality || null,
        currentLocation: u.current_location || null,
        jobTitle: u.job_title || null,
        linkedinUrl: u.linkedin_url || null,
        website: u.website || null,
        category: u.candidate_category || null,
        overview: u.cv_overview || null,
        workExperience: u.cv_work_experience || null,
        education: u.cv_education || null,
        certifications: u.cv_certifications || null,
        keySkills: u.cv_key_skills || null,
        primaryCvId: u.primary_cv_id != null ? u.primary_cv_id : null,
        addresses: u.addresses || [],
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
    const { category, fullName, phone, dateOfBirth, gender, nationality, currentLocation, jobTitle, linkedinUrl, website, overview, workExperience, education, certifications, keySkills, primaryCvId, addresses } = req.body;
    if (!category || !["general", "professional"].includes(category)) {
      return res.status(400).json({ error: "category must be 'general' or 'professional'" });
    }
    const cid = req.candidate.id;
    const dob = dateOfBirth && String(dateOfBirth).trim() ? String(dateOfBirth).trim() : null;
    const primaryCvIdVal = primaryCvId != null && primaryCvId !== '' ? parseInt(primaryCvId, 10) : null;
    await query(
      `UPDATE smart_apply_candidates SET candidate_category = ?, cv_overview = ?, full_name = COALESCE(?, full_name), phone = ?, date_of_birth = ?, primary_cv_id = ?, gender = ?, nationality = ?, current_location = ?, job_title = ?, linkedin_url = ?, website = ? WHERE id = ?`,
      [
        category, overview || null, (fullName && fullName.trim()) || null, (phone && phone.trim()) || null, dob || null,
        isNaN(primaryCvIdVal) ? null : primaryCvIdVal,
        (gender && String(gender).trim()) || null, (nationality && String(nationality).trim()) || null,
        (currentLocation && String(currentLocation).trim()) || null, (jobTitle && String(jobTitle).trim()) || null,
        (linkedinUrl && String(linkedinUrl).trim()) || null, (website && String(website).trim()) || null,
        cid
      ]
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
    // Addresses: replace all for this candidate
    await query("DELETE FROM smart_apply_addresses WHERE candidate_id = ?", [cid]).catch(() => null);
    if (Array.isArray(addresses) && addresses.length > 0) {
      for (const a of addresses) {
        const label = (a.label && String(a.label).trim()) ? String(a.label).trim() : "Current";
        const line1 = (a.addressLine1 && String(a.addressLine1).trim()) ? String(a.addressLine1).trim() : null;
        const city = (a.city && String(a.city).trim()) ? String(a.city).trim() : null;
        const country = (a.country && String(a.country).trim()) ? String(a.country).trim() : null;
        if (line1 && city && country) {
          await query(
            `INSERT INTO smart_apply_addresses (candidate_id, label, address_line1, address_line2, city, state_region, postal_code, country, is_primary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              cid, label,
              line1,
              (a.addressLine2 && String(a.addressLine2).trim()) || null,
              city,
              (a.stateRegion && String(a.stateRegion).trim()) || null,
              (a.postalCode && String(a.postalCode).trim()) || null,
              country,
              a.isPrimary ? 1 : 0
            ]
          ).catch(() => null);
        }
      }
    }
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

// ---------- CVs (list, upload, download, delete) ----------

// @route   GET /api/smart-apply/cvs
// @desc    List current candidate's CVs (no file content)
// @access  Private (Smart Apply token)
router.get("/cvs", protectSmartApply, async (req, res) => {
  try {
    const cid = req.candidate.id;
    try {
      const rows = await query(
        `SELECT id, label, role_or_category, file_name, mime_type, created_at FROM ${CV_TABLE} WHERE candidate_id = ? ORDER BY created_at DESC`,
        [cid]
      );
      return res.status(200).json({
        cvs: rows.map((r) => ({
          id: r.id,
          label: r.label,
          roleOrCategory: r.role_or_category || null,
          fileName: r.file_name,
          mimeType: r.mime_type || "application/pdf",
          createdAt: r.created_at,
        })),
      });
    } catch (e) {
      if (e.code === "ER_NO_SUCH_TABLE" || (e.message && e.message.includes(CV_TABLE))) {
        await ensureCvsTable();
        const rows = await query(
          `SELECT id, label, role_or_category, file_name, mime_type, created_at FROM ${CV_TABLE} WHERE candidate_id = ? ORDER BY created_at DESC`,
          [cid]
        );
        return res.status(200).json({
          cvs: rows.map((r) => ({
            id: r.id,
            label: r.label,
            roleOrCategory: r.role_or_category || null,
            fileName: r.file_name,
            mimeType: r.mime_type || "application/pdf",
            createdAt: r.created_at,
          })),
        });
      }
      throw e;
    }
  } catch (err) {
    console.error("Smart Apply list CVs error:", err);
    return res.status(500).json({ error: err.message || "Failed to list CVs" });
  }
});

// @route   GET /api/smart-apply/cvs/:id
// @desc    Get one CV file (blob); ?download=true for attachment
// @access  Private (Smart Apply token)
router.get("/cvs/:id", protectSmartApply, async (req, res) => {
  try {
    const cid = req.candidate.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid CV id" });
    }
    const rows = await query(
      `SELECT file_name, file_content, mime_type FROM ${CV_TABLE} WHERE id = ? AND candidate_id = ?`,
      [id, cid]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "CV not found" });
    }
    const row = rows[0];
    const buf = row.file_content instanceof Buffer ? row.file_content : Buffer.from(row.file_content);
    const mime = row.mime_type || "application/pdf";
    const fileName = row.file_name || "cv.pdf";
    if (req.query.download === "true") {
      res.setHeader("Content-Disposition", `attachment; filename="${fileName.replace(/"/g, '\\"')}"`);
    }
    res.setHeader("Content-Type", mime);
    return res.send(buf);
  } catch (err) {
    console.error("Smart Apply get CV error:", err);
    return res.status(500).json({ error: err.message || "Failed to get CV" });
  }
});

// @route   POST /api/smart-apply/cvs
// @desc    Upload a CV (label, roleOrCategory?, fileName, fileBase64)
// @access  Private (Smart Apply token)
router.post("/cvs", protectSmartApply, async (req, res) => {
  try {
    const cid = req.candidate.id;
    const { label, roleOrCategory, fileName, fileBase64 } = req.body;
    if (!label || typeof label !== "string" || !label.trim()) {
      return res.status(400).json({ error: "Label is required" });
    }
    let base64 = typeof fileBase64 === "string" ? fileBase64.replace(/\s/g, "") : "";
    if (!base64) {
      return res.status(400).json({ error: "File content (fileBase64) is required" });
    }
    if (base64.length > MAX_CV_SIZE_BASE64) {
      return res.status(400).json({ error: "File too large" });
    }
    let buffer;
    try {
      buffer = Buffer.from(base64, "base64");
    } catch (e) {
      return res.status(400).json({ error: "Invalid base64 file content" });
    }
    if (buffer.length === 0) {
      return res.status(400).json({ error: "File content is empty" });
    }
    const name = (fileName && typeof fileName === "string" && fileName.trim()) ? fileName.trim() : "cv.pdf";
    const mime = "application/pdf";

    const insertOne = async () => {
      const result = await query(
        `INSERT INTO ${CV_TABLE} (candidate_id, label, role_or_category, file_name, file_content, mime_type) VALUES (?, ?, ?, ?, ?, ?)`,
        [cid, label.trim(), (roleOrCategory && String(roleOrCategory).trim()) || null, name, buffer, mime]
      );
      return result.insertId;
    };

    try {
      const insertId = await insertOne();
      return res.status(201).json({ success: true, id: insertId });
    } catch (e) {
      if (e.code === "ER_NO_SUCH_TABLE" || (e.message && e.message.includes(CV_TABLE))) {
        await ensureCvsTable();
        const insertId = await insertOne();
        return res.status(201).json({ success: true, id: insertId });
      }
      throw e;
    }
  } catch (err) {
    console.error("Smart Apply upload CV error:", err);
    return res.status(500).json({ error: err.message || "Failed to save CV" });
  }
});

// @route   DELETE /api/smart-apply/cvs/:id
// @desc    Delete a CV
// @access  Private (Smart Apply token)
router.delete("/cvs/:id", protectSmartApply, async (req, res) => {
  try {
    const cid = req.candidate.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid CV id" });
    }
    const result = await query(`DELETE FROM ${CV_TABLE} WHERE id = ? AND candidate_id = ?`, [id, cid]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "CV not found" });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Smart Apply delete CV error:", err);
    return res.status(500).json({ error: err.message || "Failed to delete CV" });
  }
});

export default router;
