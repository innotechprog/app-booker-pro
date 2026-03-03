import express from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pdfParse from "pdf-parse";
import OpenAI from "openai";
import { query } from "../config/database.js";
import { protectSmartApply } from "../middleware/auth.js";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const router = express.Router();

// Simple health check – verifies Smart Apply routes are registered
router.get("/ping", (req, res) => res.json({ ok: true, service: "smart-apply" }));

const CV_TABLE = "smart_apply_cvs";
const PUBLIC_CV_TABLE = "smart_apply_public_cvs";
const CV_ANALYTICS_TABLE = "smart_apply_cv_analytics";
const MAX_CV_SIZE_BASE64 = 6 * 1024 * 1024; // ~6MB base64

function generateSlug() {
  const chars = "abcdefghijkmnopqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function ensurePublicCvsTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS ${PUBLIC_CV_TABLE} (
      id INT PRIMARY KEY AUTO_INCREMENT,
      slug VARCHAR(24) UNIQUE NOT NULL,
      candidate_id INT NOT NULL,
      template_id INT NOT NULL,
      cv_data LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_public_cv_slug (slug)
    )`
  );
}

async function ensureCvAnalyticsTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS ${CV_ANALYTICS_TABLE} (
      id INT PRIMARY KEY AUTO_INCREMENT,
      slug VARCHAR(24) NOT NULL,
      event_type VARCHAR(20) NOT NULL,
      link_url VARCHAR(500) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_cv_analytics_slug (slug),
      INDEX idx_cv_analytics_slug_type (slug, event_type)
    )`
  );
}

async function recordCvAnalyticsEvent(slug, eventType, linkUrl = null) {
  const validTypes = ["view", "download", "link_click"];
  if (!slug || !validTypes.includes(eventType)) return;
  await ensureCvAnalyticsTable();
  await query(
    `INSERT INTO ${CV_ANALYTICS_TABLE} (slug, event_type, link_url) VALUES (?, ?, ?)`,
    [slug, eventType, eventType === "link_click" ? (linkUrl || null) : null]
  );
}

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
// @desc    Register new Smart Apply candidate (sends confirmation email)
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
    const confirmationToken = crypto.randomBytes(32).toString("hex");
    const result = await query(
      "INSERT INTO smart_apply_candidates (email, password_hash, full_name, phone, email_confirmation_token) VALUES (?, ?, ?, ?, ?)",
      [email.trim(), password_hash, fullName.trim(), phone || null, confirmationToken]
    ).catch((e) => {
      if (e.code === "ER_BAD_FIELD_ERROR" || (e.message && e.message.includes("email_confirmation_token"))) {
        return query(
          "INSERT INTO smart_apply_candidates (email, password_hash, full_name, phone) VALUES (?, ?, ?, ?)",
          [email.trim(), password_hash, fullName.trim(), phone || null]
        );
      }
      throw e;
    });
    const id = result.insertId;
    const baseUrl = process.env.FRONTEND_URL || process.env.FRONTEND_URLS?.split(",")?.[0] || "http://localhost:8080";
    const confirmUrl = `${baseUrl.replace(/\/+$/, "")}/smart-apply/confirm-email?token=${confirmationToken}`;
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Smart Apply" <${process.env.EMAIL_USER || "noreply@example.com"}>`,
        to: email.trim(),
        subject: "Confirm your Smart Apply account",
        text: `Hello ${fullName.trim()},\n\nThank you for signing up for Smart Apply. Please confirm your email by clicking the link below:\n\n${confirmUrl}\n\nOnce confirmed, you can upload your CV and start applying to jobs.\n\nIf you did not create this account, you can ignore this email.\n\nBest regards,\nSmart Apply Team`,
      });
    } catch (mailErr) {
      console.error("Confirmation email send error:", mailErr);
    }
    const token = signSmartApplyToken(id);
    return res.status(201).json({
      success: true,
      message: "Account created. Please check your email to confirm your account before uploading your CV.",
      token,
      candidate: { id, fullName: fullName.trim(), email: email.trim(), phone: phone || null, emailConfirmed: false },
    });
  } catch (err) {
    console.error("Smart Apply register error:", err);
    return res.status(500).json({ success: false, message: err.message || "Registration failed" });
  }
});

// @route   GET /api/smart-apply/auth/confirm-email
// @desc    Confirm email via token (sets email_confirmed_at, returns JWT)
// @access  Public
router.get("/auth/confirm-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ success: false, message: "Token required" });
    }
    const rows = await query(
      "SELECT id, full_name, email, phone, deactivated_at FROM smart_apply_candidates WHERE email_confirmation_token = ?",
      [token]
    ).catch(() => []);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "Invalid or expired confirmation link" });
    }
    const candidate = rows[0];
    if (candidate.deactivated_at) {
      return res.status(403).json({ success: false, message: "This account has been deactivated. Please contact support to reactivate." });
    }
    await query(
      "UPDATE smart_apply_candidates SET email_confirmed_at = CURRENT_TIMESTAMP, email_confirmation_token = NULL WHERE id = ?",
      [candidate.id]
    ).catch(() => {});
    const jwtoken = signSmartApplyToken(candidate.id);
    return res.status(200).json({
      success: true,
      message: "Email confirmed. You can now upload your CV.",
      token: jwtoken,
      candidate: { id: candidate.id, fullName: candidate.full_name, email: candidate.email, phone: candidate.phone, emailConfirmed: true },
    });
  } catch (err) {
    console.error("Smart Apply confirm email error:", err);
    return res.status(500).json({ success: false, message: err.message || "Confirmation failed" });
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
      "SELECT id, full_name, email, phone, password_hash, deactivated_at FROM smart_apply_candidates WHERE email = ?",
      [email.trim()]
    ).catch(() => query(
      "SELECT id, full_name, email, phone, password_hash FROM smart_apply_candidates WHERE email = ?",
      [email.trim()]
    ));
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const candidate = rows[0];
    if (candidate.deactivated_at) {
      return res.status(403).json({ success: false, message: "This account has been deactivated. Please contact support to reactivate." });
    }
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

// @route   PUT /api/smart-apply/auth/deactivate
// @desc    Deactivate account (requires password)
// @access  Private (Smart Apply token)
router.put("/auth/deactivate", protectSmartApply, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== "string" || !password.trim()) {
      return res.status(400).json({ success: false, message: "Password is required to deactivate your account" });
    }
    const cid = req.candidate.id;
    const rows = await query("SELECT password_hash, deactivated_at FROM smart_apply_candidates WHERE id = ?", [cid])
      .catch(() => query("SELECT password_hash FROM smart_apply_candidates WHERE id = ?", [cid]));
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const storedHash = rows[0].password_hash ?? rows[0].PASSWORD_HASH ?? null;
    if (!storedHash || typeof storedHash !== "string") {
      return res.status(400).json({ success: false, message: "Deactivation not available for accounts signed in with Google. Contact support." });
    }
    const valid = await bcrypt.compare(String(password), storedHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }
    await query("UPDATE smart_apply_candidates SET deactivated_at = CURRENT_TIMESTAMP WHERE id = ?", [cid]);
    return res.status(200).json({ success: true, message: "Account deactivated successfully" });
  } catch (err) {
    console.error("Smart Apply deactivate error:", err);
    return res.status(500).json({ success: false, message: err.message || "Failed to deactivate account" });
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
        profilePicture: u.profile_picture || null,
        showProfilePictureOnCv: u.show_profile_picture_on_cv != null ? !!u.show_profile_picture_on_cv : true,
        emailConfirmed: !!(u.email_confirmed_at != null && u.email_confirmed_at),
        onboardingTourCompleted: !!(u.onboarding_tour_completed_at != null && u.onboarding_tour_completed_at),
        addresses: u.addresses || [],
      },
    });
  } catch (err) {
    console.error("Smart Apply get profile error:", err);
    return res.status(500).json({ error: err.message || "Failed to get profile" });
  }
});

// Shared handler for saving profile (used by both PUT and POST)
async function saveProfileHandler(req, res) {
  try {
    const { category, fullName, phone, dateOfBirth, gender, nationality, currentLocation, jobTitle, linkedinUrl, website, overview, workExperience, education, certifications, keySkills, primaryCvId, addresses, profilePicture, showProfilePictureOnCv } = req.body;
    if (!category || !["general", "professional"].includes(category)) {
      return res.status(400).json({ error: "category must be 'general' or 'professional'" });
    }
    const cid = req.candidate.id;
    const dob = dateOfBirth && String(dateOfBirth).trim() ? String(dateOfBirth).trim() : null;
    const primaryCvIdVal = primaryCvId != null && primaryCvId !== '' ? parseInt(primaryCvId, 10) : null;
    const profilePicVal = profilePicture && String(profilePicture).trim() ? String(profilePicture).trim() : null;
    const showPicOnCv = showProfilePictureOnCv === true || showProfilePictureOnCv === "true" || showProfilePictureOnCv === 1 ? 1 : 0;
    await query(
      `UPDATE smart_apply_candidates SET candidate_category = ?, cv_overview = ?, full_name = COALESCE(?, full_name), phone = ?, date_of_birth = ?, primary_cv_id = ?, gender = ?, nationality = ?, current_location = ?, job_title = ?, linkedin_url = ?, website = ?, profile_picture = ?, show_profile_picture_on_cv = ? WHERE id = ?`,
      [
        category, overview || null, (fullName && fullName.trim()) || null, (phone && phone.trim()) || null, dob || null,
        isNaN(primaryCvIdVal) ? null : primaryCvIdVal,
        (gender && String(gender).trim()) || null, (nationality && String(nationality).trim()) || null,
        (currentLocation && String(currentLocation).trim()) || null, (jobTitle && String(jobTitle).trim()) || null,
        (linkedinUrl && String(linkedinUrl).trim()) || null, (website && String(website).trim()) || null,
        profilePicVal, showPicOnCv, cid
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
}

// @route   PUT/POST /api/smart-apply/profile + POST /api/smart-apply/save-profile (alternate path)
router.put("/profile", protectSmartApply, saveProfileHandler);
router.post("/profile", protectSmartApply, saveProfileHandler);
router.get("/save-profile", (req, res) => res.json({ ok: true, route: "save-profile" })); // test: open in browser
router.post("/save-profile", protectSmartApply, saveProfileHandler);

// @route   GET /api/smart-apply/candidates
// @desc    List candidates for recruiters; ?category=&search=&skills=&location=&experience=
// @access  Public
router.get("/candidates", async (req, res) => {
  try {
    const { category, search, skills, location, experience } = req.query;
    let sql = "SELECT c.id, c.full_name, c.email, c.phone, c.candidate_category, c.current_location, c.job_title, c.cv_overview, c.created_at, c.profile_picture FROM smart_apply_candidates c WHERE c.candidate_category IS NOT NULL";
    const params = [];
    if (category === "general" || category === "professional") {
      sql += " AND c.candidate_category = ?";
      params.push(category);
    }
    if (search && String(search).trim()) {
      const term = `%${String(search).trim().replace(/%/g, "\\%")}%`;
      sql += " AND (c.full_name LIKE ? OR c.email LIKE ? OR c.job_title LIKE ? OR c.cv_overview LIKE ?)";
      params.push(term, term, term, term);
    }
    if (location && String(location).trim()) {
      const loc = `%${String(location).trim().replace(/%/g, "\\%")}%`;
      sql += " AND c.current_location LIKE ?";
      params.push(loc);
    }
    if (skills && String(skills).trim()) {
      const skillTerms = String(skills).trim().split(/[,\s]+/).filter(Boolean);
      if (skillTerms.length > 0) {
        const subConditions = skillTerms.map(() => "content LIKE ?").join(" OR ");
        sql += ` AND c.id IN (SELECT candidate_id FROM smart_apply_key_skills WHERE ${subConditions})`;
        skillTerms.forEach((t) => params.push(`%${t.replace(/%/g, "\\%")}%`));
      }
    }
    if (experience && String(experience).trim()) {
      const expTerm = `%${String(experience).trim().replace(/%/g, "\\%")}%`;
      sql += " AND c.id IN (SELECT candidate_id FROM smart_apply_work_experience WHERE content LIKE ?)";
      params.push(expTerm);
    }
    sql += " ORDER BY c.created_at DESC";
    const rows = await query(sql, params);
    let candidates = rows.map((r) => ({
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone || null,
      category: r.candidate_category,
      createdAt: r.created_at,
      profilePicture: r.profile_picture || null,
    }));
    try {
      await ensurePublicCvsTable();
      const baseUrl = process.env.FRONTEND_URL || process.env.SITE_URL || "https://ib-innovativesolutions.com";
      const pubRows = await query(`SELECT candidate_id, slug FROM ${PUBLIC_CV_TABLE} ORDER BY created_at DESC`);
      const slugByCid = {};
      for (const row of pubRows) {
        if (!slugByCid[row.candidate_id]) slugByCid[row.candidate_id] = row.slug;
      }
      candidates = candidates.map((c) => ({
        ...c,
        publicCvUrl: slugByCid[c.id] ? `${String(baseUrl).replace(/\/$/, "")}/cv/${slugByCid[c.id]}` : null,
      }));
    } catch (e) {
      /* ignore */
    }
    return res.status(200).json({
      success: true,
      candidates,
    });
  } catch (err) {
    console.error("Smart Apply candidates list error:", err);
    return res.status(500).json({ error: err.message || "Failed to list candidates" });
  }
});

// Helper: load candidate profile by id (for recruiters)
async function loadCandidateProfileById(cid) {
  const rows = await query(
    "SELECT id, full_name, email, phone, date_of_birth, primary_cv_id, gender, nationality, current_location, job_title, linkedin_url, website, candidate_category, cv_overview, profile_picture, show_profile_picture_on_cv FROM smart_apply_candidates WHERE id = ?",
    [cid]
  );
  if (rows.length === 0) return null;
  const u = rows[0];
  const [we, edu, cert, skills, addrs] = await Promise.all([
    query("SELECT content FROM smart_apply_work_experience WHERE candidate_id = ? ORDER BY sort_order", [cid]),
    query("SELECT content FROM smart_apply_education WHERE candidate_id = ? ORDER BY sort_order", [cid]),
    query("SELECT content FROM smart_apply_certifications WHERE candidate_id = ? ORDER BY sort_order", [cid]),
    query("SELECT content FROM smart_apply_key_skills WHERE candidate_id = ? ORDER BY sort_order", [cid]),
    query("SELECT id, label, address_line1, address_line2, city, state_region, postal_code, country, is_primary FROM smart_apply_addresses WHERE candidate_id = ? ORDER BY is_primary DESC, id", [cid]).catch(() => []),
  ]);
  const parseContent = (arr) => {
    if (!arr || !arr.length) return [];
    return arr.map((r) => {
      const c = r.content;
      if (c == null || c === "") return null;
      try {
        const o = typeof c === "string" ? JSON.parse(c) : c;
        return o && typeof o === "object" ? o : { description: String(c) };
      } catch {
        return { description: String(c) };
      }
    }).filter(Boolean);
  };
  const workExperience = parseContent(we);
  const education = parseContent(edu);
  const certifications = parseContent(cert);
  const keySkills = parseContent(skills);
  const addresses = Array.isArray(addrs)
    ? addrs.map((a) => ({
        id: a.id,
        label: a.label,
        addressLine1: a.address_line1,
        addressLine2: a.address_line2 || null,
        city: a.city,
        stateRegion: a.state_region || null,
        postalCode: a.postal_code || null,
        country: a.country,
        isPrimary: !!a.is_primary,
      }))
    : [];
  const dateOfBirth = u.date_of_birth ? (typeof u.date_of_birth === "string" ? u.date_of_birth : u.date_of_birth.toISOString?.().slice(0, 10)) : null;
  let publicCvSlug = null;
  let publicCvUrl = null;
  try {
    await ensurePublicCvsTable();
    const pubRows = await query(`SELECT slug FROM ${PUBLIC_CV_TABLE} WHERE candidate_id = ? ORDER BY created_at DESC LIMIT 1`, [cid]);
    if (pubRows.length > 0) {
      publicCvSlug = pubRows[0].slug;
      const baseUrl = process.env.FRONTEND_URL || process.env.SITE_URL || "https://ib-innovativesolutions.com";
      publicCvUrl = `${String(baseUrl).replace(/\/$/, "")}/cv/${publicCvSlug}`;
    }
  } catch (e) {
    /* ignore */
  }
  return {
    id: u.id,
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
    workExperience,
    education,
    certifications,
    keySkills,
    primaryCvId: u.primary_cv_id != null ? u.primary_cv_id : null,
    profilePicture: u.profile_picture || null,
    showProfilePictureOnCv: u.show_profile_picture_on_cv != null ? !!u.show_profile_picture_on_cv : true,
    addresses,
    publicCvSlug,
    publicCvUrl,
  };
}

// @route   GET /api/smart-apply/candidates/:id
// @desc    Get candidate profile for recruiters (full profile, public CV link, profile pic)
// @access  Public
router.get("/candidates/:id", async (req, res) => {
  try {
    const cid = parseInt(req.params.id, 10);
    if (!Number.isFinite(cid)) {
      return res.status(400).json({ error: "Invalid candidate id" });
    }
    const profile = await loadCandidateProfileById(cid);
    if (!profile) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error("Smart Apply get candidate by id error:", err);
    return res.status(500).json({ error: err.message || "Failed to load profile" });
  }
});

// ---------- Premium credits and vouchers ----------

const PREMIUM_PACKAGES = [
  { id: "starter", name: "Starter", credits: 5, price: 199, currency: "ZAR", description: "5 auto-apply credits" },
  { id: "growth", name: "Growth", credits: 15, price: 499, currency: "ZAR", description: "15 credits (save 17%)" },
  { id: "pro", name: "Pro", credits: 30, price: 899, currency: "ZAR", description: "30 credits (save 25%)" },
];

// @route   GET /api/smart-apply/premium/credits
router.get("/premium/credits", protectSmartApply, async (req, res) => {
  try {
    const cid = req.candidate.id;
    const rows = await query("SELECT premium_credits FROM smart_apply_candidates WHERE id = ?", [cid]).catch(() => []);
    const credits = rows[0]?.premium_credits ?? 0;
    return res.status(200).json({ credits });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to get credits" });
  }
});

// @route   GET /api/smart-apply/premium/packages
router.get("/premium/packages", protectSmartApply, async (req, res) => {
  return res.status(200).json({ packages: PREMIUM_PACKAGES });
});

// @route   POST /api/smart-apply/premium/purchase
router.post("/premium/purchase", protectSmartApply, async (req, res) => {
  try {
    const { packageId } = req.body;
    const pkg = PREMIUM_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return res.status(400).json({ error: "Invalid package" });
    }
    // In production: integrate PayFast, charge card, then add credits. For now, return payment URL or success.
    return res.status(200).json({
      success: true,
      message: "Redirect to PayFast or complete payment",
      packageId: pkg.id,
      credits: pkg.credits,
      price: pkg.price,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Purchase failed" });
  }
});

// @route   GET /api/smart-apply/premium/matches (placeholder – returns empty for now)
router.get("/premium/matches", protectSmartApply, async (req, res) => {
  return res.status(200).json({ matches: [] });
});

// @route   POST /api/smart-apply/premium/matches/:matchId/accept
router.post("/premium/matches/:matchId/accept", protectSmartApply, async (req, res) => {
  return res.status(400).json({ error: "No match found or not enough credits" });
});

// @route   POST /api/smart-apply/premium/matches/:matchId/decline
router.post("/premium/matches/:matchId/decline", protectSmartApply, async (req, res) => {
  return res.status(200).json({ success: true });
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
    const emailConfirmed = req.candidate.email_confirmed_at !== undefined
      ? !!(req.candidate.email_confirmed_at != null && req.candidate.email_confirmed_at)
      : true;
    if (!emailConfirmed) {
      return res.status(403).json({ error: "Please confirm your email before uploading a CV. Check your inbox for the confirmation link." });
    }
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

// @route   POST /api/smart-apply/extract-cv
// @desc    Extract structured profile data from CV PDF using OpenAI
// @access  Private (Smart Apply token)
router.post("/extract-cv", protectSmartApply, async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: "OpenAI is not configured. Set OPENAI_API_KEY in environment." });
    }
    let base64 = typeof req.body?.fileBase64 === "string" ? req.body.fileBase64.replace(/\s/g, "") : "";
    if (!base64) {
      return res.status(400).json({ error: "fileBase64 is required" });
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

    let cvText = "";
    try {
      const pdfData = await pdfParse(buffer);
      cvText = (pdfData?.text || "").trim();
    } catch (e) {
      console.error("PDF parse error:", e);
      return res.status(400).json({ error: "Could not extract text from PDF. Ensure it is a valid PDF." });
    }
    if (!cvText || cvText.length < 50) {
      return res.status(400).json({ error: "No text could be extracted from the PDF. The file may be image-based or empty." });
    }

    const systemPrompt = `You are a CV/resume parser. Extract structured information from the CV text. Do NOT extract personal data (no name, phone, email, address, etc.). Focus only on professional and educational information.

Return valid JSON only, no markdown. Use this exact structure:
{
  "summary": "A brief overview or summary of the candidate's profile.",
  "skills": ["skill1", "skill2", "skill3"],
  "work_experience": [
    {
      "company": "Company name",
      "position": "Job title or position held",
      "start_date": "Start date or empty string if not available",
      "end_date": "End date or empty string if not available. Use empty string if 'present' or 'current'",
      "description": "Job responsibilities, achievements, or relevant details",
      "employment_status": "Current" if end_date is present/current, otherwise "Past"
    }
  ],
  "education": [
    {
      "institution": "Educational institution name",
      "degree": "Degree obtained",
      "field_of_study": "Field of study or major",
      "start_date": "Start date or empty string if not available",
      "end_date": "End date or empty string if not available"
    }
  ]
}

Guidelines:
- Ensure all relevant professional and educational data is extracted; leave nothing out.
- For dates not in recognizable format, use empty strings for start_date and end_date.
- If end_date is "present" or "current", set employment_status to "Current"; otherwise "Past".
- If employment_status cannot be determined, default to "Past".
- Omit fields if not found. Keep arrays empty [] if none found.`;

    const userPrompt = `Extract the professional and educational information from this CV (no personal data):\n\n${cvText.slice(0, 12000)}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_CV_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return res.status(500).json({ error: "OpenAI did not return valid data" });
    }

    let extracted;
    try {
      extracted = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({ error: "Could not parse extracted data" });
    }

    const we = Array.isArray(extracted.work_experience) ? extracted.work_experience.map((w) => ({
      company: w.company ?? "",
      jobTitle: w.position ?? w.jobTitle ?? "",
      startDate: w.start_date ?? "",
      endDate: w.end_date ?? "",
      description: [w.description, w.employment_status ? `(Status: ${w.employment_status})` : ""].filter(Boolean).join(" "),
    })) : [];
    const edu = Array.isArray(extracted.education) ? extracted.education.map((e) => ({
      institution: e.institution ?? "",
      qualification: [e.degree, e.field_of_study].filter(Boolean).join(e.degree && e.field_of_study ? " in " : ""),
      startDate: e.start_date ?? "",
      endDate: e.end_date ?? "",
    })) : [];
    const skills = Array.isArray(extracted.skills) ? extracted.skills.map((s) => ({ name: typeof s === "string" ? s : String(s), level: "" })) : [];

    return res.status(200).json({
      success: true,
      profile: {
        overview: extracted.summary ?? null,
        category: ["general", "professional"].includes(extracted.category) ? extracted.category : "professional",
        workExperience: we,
        education: edu,
        certifications: [],
        keySkills: skills,
      },
    });
  } catch (err) {
    console.error("Smart Apply extract CV error:", err);
    return res.status(500).json({ error: err.message || "Failed to extract CV data" });
  }
});

// ---------- Public CV (shareable link, no auth for GET) ----------

// @route   POST /api/smart-apply/public-cv
// @desc    Create public CV link; returns slug and url
// @access  Private (Smart Apply token)
router.post("/public-cv", protectSmartApply, async (req, res) => {
  try {
    await ensurePublicCvsTable();
    const cid = req.candidate.id;
    const { cvData, templateId, baseUrl: clientBaseUrl } = req.body;
    if (!cvData || typeof cvData !== "object") {
      return res.status(400).json({ error: "cvData is required" });
    }
    const tid = Math.max(1, Math.min(20, parseInt(templateId, 10) || 1));
    let slug = generateSlug();
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await query(`SELECT id FROM ${PUBLIC_CV_TABLE} WHERE slug = ?`, [slug]);
      if (existing.length === 0) break;
      slug = generateSlug();
    }
    await query(
      `INSERT INTO ${PUBLIC_CV_TABLE} (slug, candidate_id, template_id, cv_data) VALUES (?, ?, ?, ?)`,
      [slug, cid, tid, JSON.stringify(cvData)]
    );
    const baseUrl = (clientBaseUrl && String(clientBaseUrl).trim()) || process.env.FRONTEND_URL || process.env.SITE_URL || "https://ib-innovativesolutions.com";
    const url = `${String(baseUrl).replace(/\/$/, "")}/cv/${slug}`;
    return res.status(200).json({ slug, url });
  } catch (err) {
    console.error("Smart Apply create public CV error:", err);
    return res.status(500).json({ error: err.message || "Failed to create public CV" });
  }
});

// @route   GET /api/smart-apply/public-cv/:slug
// @desc    Get public CV by slug (no auth)
// @access  Public
router.get("/public-cv/:slug", async (req, res) => {
  try {
    await ensurePublicCvsTable();
    const slug = (req.params.slug || "").trim();
    if (!slug) return res.status(400).json({ error: "Slug required" });
    const rows = await query(
      `SELECT template_id, cv_data FROM ${PUBLIC_CV_TABLE} WHERE slug = ?`,
      [slug]
    );
    if (rows.length === 0) return res.status(404).json({ error: "CV not found" });
    const cvData = typeof rows[0].cv_data === "string" ? JSON.parse(rows[0].cv_data) : rows[0].cv_data;
    recordCvAnalyticsEvent(slug, "view").catch(() => {});
    return res.status(200).json({ templateId: rows[0].template_id, cvData });
  } catch (err) {
    console.error("Smart Apply get public CV error:", err);
    return res.status(500).json({ error: err.message || "Failed to get CV" });
  }
});

// @route   POST /api/smart-apply/public-cv/:slug/analytics
// @desc    Record download or link_click (no auth – called from public CV page)
// @access  Public
router.post("/public-cv/:slug/analytics", async (req, res) => {
  try {
    const slug = (req.params.slug || "").trim();
    const { eventType, linkUrl } = req.body || {};
    if (!slug) return res.status(400).json({ error: "Slug required" });
    const valid = ["download", "link_click"];
    if (!valid.includes(eventType)) return res.status(400).json({ error: "eventType must be download or link_click" });
    const rows = await query(`SELECT id FROM ${PUBLIC_CV_TABLE} WHERE slug = ?`, [slug]);
    if (rows.length === 0) return res.status(404).json({ error: "CV not found" });
    await recordCvAnalyticsEvent(slug, eventType, eventType === "link_click" ? linkUrl : null);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Smart Apply record analytics error:", err);
    return res.status(500).json({ error: err.message || "Failed to record" });
  }
});

// @route   GET /api/smart-apply/resume-analytics
// @desc    Get analytics for candidate's public CVs
// @access  Private (Smart Apply token)
router.get("/resume-analytics", protectSmartApply, async (req, res) => {
  try {
    const cid = req.candidate.id;
    await ensurePublicCvsTable();
    await ensureCvAnalyticsTable();
    const baseUrl = process.env.FRONTEND_URL || process.env.SITE_URL || "https://ib-innovativesolutions.com";
    const publicRows = await query(
      `SELECT slug, created_at FROM ${PUBLIC_CV_TABLE} WHERE candidate_id = ? ORDER BY created_at DESC`,
      [cid]
    );
    const slugs = publicRows.map((r) => r.slug);
    let viewCount = 0; let downloadCount = 0; let linkClickCount = 0;
    const bySlug = {};
    if (slugs.length > 0) {
      const placeholders = slugs.map(() => "?").join(",");
      const analytics = await query(
        `SELECT slug, event_type, COUNT(*) as cnt FROM ${CV_ANALYTICS_TABLE} WHERE slug IN (${placeholders}) GROUP BY slug, event_type`,
        slugs
      );
      for (const row of analytics) {
        const cnt = Number(row.cnt) || 0;
        if (!bySlug[row.slug]) bySlug[row.slug] = { viewCount: 0, downloadCount: 0, linkClickCount: 0 };
        if (row.event_type === "view") { bySlug[row.slug].viewCount = cnt; viewCount += cnt; }
        else if (row.event_type === "download") { bySlug[row.slug].downloadCount = cnt; downloadCount += cnt; }
        else if (row.event_type === "link_click") { bySlug[row.slug].linkClickCount = cnt; linkClickCount += cnt; }
      }
    }
    const publicCvs = publicRows.map((r) => ({
      slug: r.slug,
      url: `${String(baseUrl).replace(/\/$/, "")}/cv/${r.slug}`,
      createdAt: r.created_at,
      viewCount: (bySlug[r.slug] || {}).viewCount || 0,
      downloadCount: (bySlug[r.slug] || {}).downloadCount || 0,
      linkClickCount: (bySlug[r.slug] || {}).linkClickCount || 0,
    }));
    return res.status(200).json({
      totals: { viewCount, downloadCount, linkClickCount },
      publicCvs,
    });
  } catch (err) {
    console.error("Smart Apply resume analytics error:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch analytics" });
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

// @route   POST /api/smart-apply/onboarding-tour-complete
// @desc    Mark onboarding tour as completed
// @access  Private (Smart Apply token)
router.post("/onboarding-tour-complete", protectSmartApply, async (req, res) => {
  try {
    const cid = req.candidate.id;
    await query(
      "UPDATE smart_apply_candidates SET onboarding_tour_completed_at = CURRENT_TIMESTAMP WHERE id = ?",
      [cid]
    ).catch(() => {});
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to update" });
  }
});

export default router;
