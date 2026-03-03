/**
 * Recruiter auth (register / login) for Smart Apply recruiter portal.
 * Supports both legacy (id INT) and normalized (recruiter_id CHAR(36) UUID) schema.
 */
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { query } from '../config/database.js';

function getEmailTransporter() {
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

const router = express.Router();
const JWT_OPTIONS = { expiresIn: process.env.JWT_EXPIRE || '7d' };

function signRecruiterToken(pk) {
  return jwt.sign({ id: pk, type: 'recruiter' }, process.env.JWT_SECRET, JWT_OPTIONS);
}

function recruiterPk(row) {
  return row.recruiter_id ?? row.id;
}

function isRecruiterIdColumnError(err) {
  return err?.code === 'ER_BAD_FIELD_ERROR' ||
    (err?.message && (err.message.includes('recruiter_id') || err.message.includes('Unknown column')));
}

async function protectRecruiter(req, res, next) {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'recruiter') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    const pk = decoded.id;
    let rows = null;
    try {
      rows = await query(
        'SELECT recruiter_id, id, email, full_name, company, phone, deactivated_at FROM recruiters WHERE recruiter_id = ?',
        [pk]
      );
    } catch (e) {
      if (isRecruiterIdColumnError(e)) {
        rows = await query(
          'SELECT id, email, full_name, company, phone, deactivated_at FROM recruiters WHERE id = ?',
          [pk]
        ).catch(() => []);
      } else throw e;
    }
    if (!rows || rows.length === 0) {
      rows = await query(
        'SELECT id, email, full_name, company, phone, deactivated_at FROM recruiters WHERE id = ?',
        [pk]
      ).catch(() => []);
    }
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Recruiter not found' });
    }
    if (rows[0].deactivated_at) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
    }
    req.recruiter = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
}

// ---------- Auth ----------
router.post('/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, company, phone } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email and password required' });
    }
    let existing;
    try {
      existing = await query('SELECT recruiter_id FROM recruiters WHERE email = ?', [String(email).trim()]);
    } catch (e) {
      if (isRecruiterIdColumnError(e)) {
        existing = await query('SELECT id FROM recruiters WHERE email = ?', [String(email).trim()]).catch(() => []);
      } else throw e;
    }
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    const password_hash = await bcrypt.hash(String(password), 10);
    let pk = crypto.randomUUID();
    try {
      await query(
        'INSERT INTO recruiters (recruiter_id, email, password_hash, full_name, company, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [
          pk,
          String(email).trim(),
          password_hash,
          String(fullName).trim(),
          (company && String(company).trim()) || null,
          (phone && String(phone).trim()) || null,
        ]
      );
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR' && err.message?.includes('recruiter_id')) {
        const res = await query(
          'INSERT INTO recruiters (email, password_hash, full_name, company, phone) VALUES (?, ?, ?, ?, ?)',
          [
            String(email).trim(),
            password_hash,
            String(fullName).trim(),
            (company && String(company).trim()) || null,
            (phone && String(phone).trim()) || null,
          ]
        );
        pk = res.insertId;
      } else {
        throw err;
      }
    }
    let recruiterRows;
    try {
      recruiterRows = await query(
        'SELECT recruiter_id, id, email, full_name, company, phone FROM recruiters WHERE recruiter_id = ?',
        [pk]
      );
    } catch (e) {
      if (isRecruiterIdColumnError(e)) {
        recruiterRows = await query(
          'SELECT id, email, full_name, company, phone FROM recruiters WHERE id = ?',
          [pk]
        ).catch(() => []);
      } else throw e;
    }
    const row = recruiterRows && recruiterRows[0];
    const pkFinal = row ? recruiterPk(row) : pk;
    const token = signRecruiterToken(pkFinal);
    const recruiter = row
      ? { id: pkFinal, email: row.email, full_name: row.full_name, company: row.company, phone: row.phone }
      : { id: pkFinal, email: String(email).trim(), full_name: String(fullName).trim(), company: null, phone: null };
    return res.status(201).json({
      success: true,
      message: 'Account created',
      token,
      recruiter,
    });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE' || err.message?.includes('recruiters')) {
      return res.status(503).json({
        success: false,
        message: 'Recruiter tables not set up. Run: npm run db:migrate-recruiter in the backend folder.',
      });
    }
    console.error('Recruiter register error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Registration failed' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const emailTrimmed = String(email).trim();
    let rows;
    try {
      rows = await query(
        'SELECT recruiter_id, id, email, full_name, company, phone, password_hash, deactivated_at FROM recruiters WHERE email = ?',
        [emailTrimmed]
      );
    } catch (e) {
      if (isRecruiterIdColumnError(e)) {
        rows = await query(
          'SELECT id, email, full_name, company, phone, password_hash, deactivated_at FROM recruiters WHERE email = ?',
          [emailTrimmed]
        ).catch(() => []);
      } else throw e;
    }
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const recruiter = rows[0];
    if (recruiter.deactivated_at) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact support to reactivate.' });
    }
    const storedHash = recruiter.password_hash ?? recruiter.PASSWORD_HASH ?? null;
    if (!storedHash || typeof storedHash !== 'string') {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(String(password), storedHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const pk = recruiterPk(recruiter);
    const token = signRecruiterToken(pk);
    return res.status(200).json({
      success: true,
      message: 'Logged in',
      token,
      recruiter: {
        id: pk,
        email: recruiter.email,
        full_name: recruiter.full_name,
        company: recruiter.company,
        phone: recruiter.phone,
      },
    });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE' || err.message?.includes('recruiters')) {
      return res.status(503).json({
        success: false,
        message: 'Recruiter tables not set up. Run: npm run db:migrate-recruiter in the backend folder.',
      });
    }
    console.error('Recruiter login error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
});

// Deactivate account (requires auth + password)
router.put('/auth/deactivate', protectRecruiter, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({ success: false, message: 'Password is required to deactivate your account' });
    }
    const rid = recruiterPk(req.recruiter);
    let rows;
    try {
      rows = await query('SELECT password_hash, deactivated_at FROM recruiters WHERE recruiter_id = ?', [rid]);
    } catch (e) {
      if (isRecruiterIdColumnError(e)) {
        rows = await query('SELECT password_hash, deactivated_at FROM recruiters WHERE id = ?', [rid]).catch(() => []);
      } else throw e;
    }
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const storedHash = rows[0].password_hash ?? rows[0].PASSWORD_HASH ?? null;
    if (!storedHash || typeof storedHash !== 'string') {
      return res.status(400).json({ success: false, message: 'Deactivation not available.' });
    }
    const valid = await bcrypt.compare(String(password), storedHash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
    try {
      await query('UPDATE recruiters SET deactivated_at = CURRENT_TIMESTAMP WHERE recruiter_id = ?', [rid]);
    } catch (e) {
      if (isRecruiterIdColumnError(e)) {
        await query('UPDATE recruiters SET deactivated_at = CURRENT_TIMESTAMP WHERE id = ?', [rid]);
      } else if (e?.message?.includes('deactivated_at') || e?.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(503).json({ success: false, message: 'Deactivation not set up. Run: npm run db:migrate-recruiter' });
      } else throw e;
    }
    return res.status(200).json({ success: true, message: 'Account deactivated successfully' });
  } catch (err) {
    console.error('Recruiter deactivate error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to deactivate account' });
  }
});

// Change password (requires auth)
router.put('/auth/change-password', protectRecruiter, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password required' });
    }
    if (String(newPassword).trim().length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const rid = recruiterPk(req.recruiter);
    let rows;
    try {
      rows = await query('SELECT password_hash FROM recruiters WHERE recruiter_id = ?', [rid]);
    } catch (e) {
      if (isRecruiterIdColumnError(e)) {
        rows = await query('SELECT password_hash FROM recruiters WHERE id = ?', [rid]).catch(() => []);
      } else throw e;
    }
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Recruiter not found' });
    }
    const storedHash = rows[0].password_hash ?? rows[0].PASSWORD_HASH ?? null;
    if (!storedHash || typeof storedHash !== 'string') {
      return res.status(401).json({ success: false, message: 'Invalid current password' });
    }
    const valid = await bcrypt.compare(String(currentPassword), storedHash);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    const newHash = await bcrypt.hash(String(newPassword).trim(), 10);
    try {
      await query('UPDATE recruiters SET password_hash = ? WHERE recruiter_id = ?', [newHash, rid]);
    } catch (e) {
      if (isRecruiterIdColumnError(e)) {
        await query('UPDATE recruiters SET password_hash = ? WHERE id = ?', [newHash, rid]);
      } else throw e;
    }
    return res.status(200).json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('Recruiter change-password error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update password' });
  }
});

// ---------- Profile ----------
router.get('/profile', protectRecruiter, async (req, res) => {
  try {
    const r = req.recruiter;
    return res.status(200).json({
      success: true,
      profile: {
        id: recruiterPk(r),
        fullName: r.full_name ?? r.fullName ?? '',
        email: r.email ?? '',
        company: r.company ?? null,
        phone: r.phone ?? null,
      },
    });
  } catch (err) {
    console.error('Recruiter get profile error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to load profile' });
  }
});

router.put('/profile', protectRecruiter, async (req, res) => {
  try {
    const { fullName, company, phone } = req.body;
    const rid = recruiterPk(req.recruiter);
    const updates = [];
    const params = [];
    if (fullName != null) { updates.push('full_name = ?'); params.push(String(fullName).trim()); }
    if (company != null) { updates.push('company = ?'); params.push(String(company).trim() || null); }
    if (phone != null) { updates.push('phone = ?'); params.push(String(phone).trim() || null); }
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    params.push(rid);
    const sql = `UPDATE recruiters SET ${updates.join(', ')} WHERE recruiter_id = ?`;
    try {
      await query(sql, params);
    } catch (e) {
      if (isRecruiterIdColumnError(e)) {
        await query(`UPDATE recruiters SET ${updates.join(', ')} WHERE id = ?`, params);
      } else throw e;
    }
    return res.status(200).json({ success: true, message: 'Profile updated' });
  } catch (err) {
    console.error('Recruiter update profile error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update' });
  }
});

// ---------- Recruitments ----------
router.get('/recruitments', protectRecruiter, async (req, res) => {
  try {
    const rid = String(recruiterPk(req.recruiter));
    const rows = await query(
      'SELECT id, name, description, created_at, updated_at FROM recruiter_recruitments WHERE recruiter_pk = ? ORDER BY updated_at DESC',
      [rid]
    ).catch(() => []);
    const list = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    return res.status(200).json({ success: true, recruitments: list });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE' && err.message?.includes('recruiter_recruitments')) {
      return res.status(503).json({ success: false, message: 'Recruitments table not set up. Run: npm run db:migrate-recruiter' });
    }
    console.error('Recruiter get recruitments error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to load' });
  }
});

router.post('/recruitments', protectRecruiter, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const rid = String(recruiterPk(req.recruiter));
    const result = await query(
      'INSERT INTO recruiter_recruitments (recruiter_pk, name, description) VALUES (?, ?, ?)',
      [rid, String(name).trim(), (description && String(description).trim()) || null]
    );
    return res.status(201).json({
      success: true,
      recruitment: { id: result.insertId, name: String(name).trim(), description: description || null },
    });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({ success: false, message: 'Recruitments table not set up. Run: npm run db:migrate-recruiter' });
    }
    console.error('Recruiter create recruitment error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to create' });
  }
});

router.get('/recruitments/:id', protectRecruiter, async (req, res) => {
  try {
    const rid = String(recruiterPk(req.recruiter));
    const recId = parseInt(req.params.id, 10);
    if (!Number.isFinite(recId)) {
      return res.status(400).json({ success: false, message: 'Invalid recruitment id' });
    }
    const rows = await query(
      'SELECT id, name, description, created_at, updated_at FROM recruiter_recruitments WHERE id = ? AND recruiter_pk = ?',
      [recId, rid]
    ).catch(() => []);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Recruitment not found' });
    }
    const r = rows[0];
    const candRows = await query(
      `SELECT c.id, c.full_name, c.email, c.phone, c.candidate_category
       FROM smart_apply_candidates c
       INNER JOIN recruiter_recruitment_candidates rc ON rc.candidate_id = c.id
       WHERE rc.recruitment_id = ?
       ORDER BY rc.added_at DESC`,
      [recId]
    ).catch(() => []);
    const candidates = candRows.map((c) => ({
      id: c.id,
      fullName: c.full_name,
      email: c.email,
      phone: c.phone || null,
      category: c.candidate_category || null,
    }));
    return res.status(200).json({
      success: true,
      recruitment: {
        id: r.id,
        name: r.name,
        description: r.description || null,
        candidates,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      },
    });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({ success: false, message: 'Recruitments table not set up. Run: npm run db:migrate-recruiter' });
    }
    console.error('Recruiter get recruitment error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to load' });
  }
});

router.put('/recruitments/:id', protectRecruiter, async (req, res) => {
  try {
    const rid = String(recruiterPk(req.recruiter));
    const recId = parseInt(req.params.id, 10);
    const { name, description } = req.body;
    if (!Number.isFinite(recId)) {
      return res.status(400).json({ success: false, message: 'Invalid recruitment id' });
    }
    const updates = [];
    const params = [];
    if (name != null) { updates.push('name = ?'); params.push(String(name).trim()); }
    if (description != null) { updates.push('description = ?'); params.push(String(description).trim() || null); }
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    params.push(recId, rid);
    const result = await query(
      `UPDATE recruiter_recruitments SET ${updates.join(', ')} WHERE id = ? AND recruiter_pk = ?`,
      params
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Recruitment not found' });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({ success: false, message: 'Recruitments table not set up. Run: npm run db:migrate-recruiter' });
    }
    console.error('Recruiter update recruitment error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update' });
  }
});

router.delete('/recruitments/:id', protectRecruiter, async (req, res) => {
  try {
    const rid = String(recruiterPk(req.recruiter));
    const recId = parseInt(req.params.id, 10);
    if (!Number.isFinite(recId)) {
      return res.status(400).json({ success: false, message: 'Invalid recruitment id' });
    }
    const result = await query('DELETE FROM recruiter_recruitments WHERE id = ? AND recruiter_pk = ?', [recId, rid]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Recruitment not found' });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({ success: false, message: 'Recruitments table not set up. Run: npm run db:migrate-recruiter' });
    }
    console.error('Recruiter delete recruitment error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete' });
  }
});

router.post('/recruitments/:recruitmentId/candidates', protectRecruiter, async (req, res) => {
  try {
    const rid = String(recruiterPk(req.recruiter));
    const recruitmentId = parseInt(req.params.recruitmentId, 10);
    const { candidateId } = req.body;
    const cid = parseInt(candidateId, 10);
    if (!Number.isFinite(recruitmentId) || !Number.isFinite(cid)) {
      return res.status(400).json({ success: false, message: 'Invalid recruitment or candidate id' });
    }
    const owned = await query('SELECT id FROM recruiter_recruitments WHERE id = ? AND recruiter_pk = ?', [recruitmentId, rid]);
    if (!owned || owned.length === 0) {
      return res.status(404).json({ success: false, message: 'Recruitment not found' });
    }
    await query('INSERT IGNORE INTO recruiter_recruitment_candidates (recruitment_id, candidate_id) VALUES (?, ?)', [recruitmentId, cid]);
    return res.status(200).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({ success: false, message: 'Recruitments table not set up. Run: npm run db:migrate-recruiter' });
    }
    console.error('Recruiter add candidate error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to add' });
  }
});

router.delete('/recruitments/:recruitmentId/candidates/:candidateId', protectRecruiter, async (req, res) => {
  try {
    const rid = String(recruiterPk(req.recruiter));
    const recruitmentId = parseInt(req.params.recruitmentId, 10);
    const candidateId = parseInt(req.params.candidateId, 10);
    if (!Number.isFinite(recruitmentId) || !Number.isFinite(candidateId)) {
      return res.status(404).json({ success: false, message: 'Recruitment or candidate not found' });
    }
    const owned = await query('SELECT id FROM recruiter_recruitments WHERE id = ? AND recruiter_pk = ?', [recruitmentId, rid]);
    if (!owned || owned.length === 0) {
      return res.status(404).json({ success: false, message: 'Recruitment not found' });
    }
    await query('DELETE FROM recruiter_recruitment_candidates WHERE recruitment_id = ? AND candidate_id = ?', [recruitmentId, candidateId]);
    return res.status(200).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({ success: false, message: 'Recruitments table not set up. Run: npm run db:migrate-recruiter' });
    }
    console.error('Recruiter remove candidate error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to remove' });
  }
});

// ---------- Jobs ----------
// @route   GET /api/recruiter/jobs
// @desc    List jobs for recruiter
// @access  Private
router.get('/jobs', protectRecruiter, async (req, res) => {
  try {
    const pk = recruiterPk(req.recruiter);
    const jobs = await query(
      `SELECT j.job_id, j.job_id AS jobId, j.recruiter_id, j.title, j.description, j.status, j.created_at, j.updated_at,
       j.job_intro, j.job_title, j.job_desc, j.reporting_to, j.min_salary, j.max_salary, j.job_salary, j.currency, j.sal_interval,
       j.post_type, j.work_method, j.start_date, j.application_link, j.qualification, j.experience, j.position_level, j.num_pos,
       j.date_posted, j.closing_date, j.external_job_id, j.comp_id, j.company_id,
       (SELECT COUNT(*) FROM recruiter_job_applications a WHERE a.job_id = j.job_id) AS applicationCount
       FROM recruiter_jobs j WHERE j.recruiter_id = ?
       ORDER BY j.updated_at DESC`,
      [pk]
    ).catch(() => []);
    return res.json({ success: true, jobs: jobs || [] });
  } catch (err) {
    if (isRecruiterIdColumnError(err)) {
      const pk = req.recruiter.id;
      const jobs = await query(
        `SELECT j.job_id, j.job_id AS jobId, j.recruiter_id, j.title, j.description, j.status, j.created_at, j.updated_at,
         j.job_intro, j.job_title, j.job_desc, j.reporting_to, j.min_salary, j.max_salary, j.job_salary, j.currency, j.sal_interval,
         j.post_type, j.work_method, j.start_date, j.application_link, j.qualification, j.experience, j.position_level, j.num_pos,
         j.date_posted, j.closing_date, j.external_job_id, j.comp_id, j.company_id,
         (SELECT COUNT(*) FROM recruiter_job_applications a WHERE a.job_id = j.job_id) AS applicationCount
         FROM recruiter_jobs j WHERE j.recruiter_id = ?
         ORDER BY j.updated_at DESC`,
        [pk]
      ).catch(() => []);
      return res.json({ success: true, jobs: jobs || [] });
    }
    console.error('Recruiter list jobs error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to list jobs' });
  }
});

// @route   POST /api/recruiter/jobs
router.post('/jobs', protectRecruiter, async (req, res) => {
  try {
    const pk = recruiterPk(req.recruiter);
    const jobId = crypto.randomUUID();
    const { title, description, status, jobIntro, jobTitle, jobDesc, reportingTo, minSalary, maxSalary, jobSalary, currency, salInterval, postType, workMethod, startDate, applicationLink, qualification, experience, positionLevel, numPos, datePosted, closingDate, externalJobId, compId, companyId } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Title required' });
    }
    await query(
      `INSERT INTO recruiter_jobs (job_id, recruiter_id, title, description, status, job_intro, job_title, job_desc, reporting_to, min_salary, max_salary, job_salary, currency, sal_interval, post_type, work_method, start_date, application_link, qualification, experience, position_level, num_pos, date_posted, closing_date, external_job_id, comp_id, company_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [jobId, pk, String(title).trim(), description?.trim() || null, status === 'posted' ? 'posted' : 'draft', jobIntro?.trim() || null, jobTitle?.trim() || null, jobDesc?.trim() || null, reportingTo?.trim() || null, minSalary != null ? Number(minSalary) : null, maxSalary != null ? Number(maxSalary) : null, jobSalary?.trim() || null, currency?.trim() || null, salInterval?.trim() || null, postType?.trim() || null, workMethod?.trim() || null, startDate || null, applicationLink?.trim() || null, qualification?.trim() || null, experience?.trim() || null, positionLevel?.trim() || null, numPos != null ? Number(numPos) : null, datePosted || null, closingDate || null, externalJobId?.trim() || null, compId != null ? Number(compId) : null, companyId != null ? Number(companyId) : null]
    );
    const rows = await query('SELECT * FROM recruiter_jobs WHERE job_id = ?', [jobId]);
    const job = rows && rows[0] ? { ...rows[0], jobId: rows[0].job_id, applicationCount: 0 } : { job_id: jobId, jobId, title: String(title).trim(), status: status === 'posted' ? 'posted' : 'draft', applicationCount: 0 };
    return res.status(201).json({ success: true, job });
  } catch (err) {
    console.error('Recruiter create job error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to create job' });
  }
});

// @route   GET /api/recruiter/jobs/:id
router.get('/jobs/:id', protectRecruiter, async (req, res) => {
  try {
    const jobIdParam = req.params.id;
    const pk = recruiterPk(req.recruiter);
    const jobs = await query(
      'SELECT * FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?',
      [jobIdParam, pk]
    ).catch(() => []);
    if (!jobs || jobs.length === 0) {
      const fallback = await query('SELECT * FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?', [jobIdParam, req.recruiter.id]).catch(() => []);
      if (!fallback || fallback.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const job = (jobs && jobs[0]) || (await query('SELECT * FROM recruiter_jobs WHERE job_id = ?', [jobIdParam]))[0];
    const applications = await query(
      `SELECT a.application_id, a.application_id AS id, a.job_id, a.candidate_id AS candidateId, a.status, a.stage, a.interview_invite_sent_at AS interviewInviteSentAt, a.created_at AS appliedAt,
       c.full_name AS fullName, c.email, c.phone, cat.name AS category
       FROM recruiter_job_applications a
       LEFT JOIN smart_apply_candidates c ON c.id = a.candidate_id
       LEFT JOIN smart_apply_candidate_categories cat ON cat.id = c.category_id
       WHERE a.job_id = ?
       ORDER BY a.created_at DESC`,
      [jobIdParam]
    ).catch(() => []);
    const jobWithApps = { ...job, jobId: job.job_id, applications: applications || [] };
    return res.json({ success: true, job: jobWithApps });
  } catch (err) {
    if (isRecruiterIdColumnError(err)) {
      const jobIdParam = req.params.id;
      const jobs = await query('SELECT * FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?', [jobIdParam, req.recruiter.id]).catch(() => []);
      if (!jobs || jobs.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
      const job = jobs[0];
      const applications = await query(
        `SELECT a.application_id, a.application_id AS id, a.job_id, a.candidate_id AS candidateId, a.status, a.stage, a.interview_invite_sent_at AS interviewInviteSentAt, a.created_at AS appliedAt,
         c.full_name AS fullName, c.email, c.phone, cat.name AS category
         FROM recruiter_job_applications a
         LEFT JOIN smart_apply_candidates c ON c.id = a.candidate_id
         LEFT JOIN smart_apply_candidate_categories cat ON cat.id = c.category_id
         WHERE a.job_id = ? ORDER BY a.created_at DESC`,
        [jobIdParam]
      ).catch(() => []);
      const jobWithApps = { ...job, jobId: job.job_id, applications: applications || [] };
      return res.json({ success: true, job: jobWithApps });
    }
    console.error('Recruiter get job error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to get job' });
  }
});

// @route   PUT /api/recruiter/jobs/:id
router.put('/jobs/:id', protectRecruiter, async (req, res) => {
  try {
    const jobIdParam = req.params.id;
    const pk = recruiterPk(req.recruiter);
    const jobs = await query('SELECT job_id FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?', [jobIdParam, pk]).catch(() => []);
    if (!jobs || jobs.length === 0) {
      const fb = await query('SELECT job_id FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?', [jobIdParam, req.recruiter.id]).catch(() => []);
      if (!fb || fb.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const { title, description, status } = req.body;
    const updates = [];
    const vals = [];
    if (title != null) { updates.push('title = ?'); vals.push(String(title).trim()); }
    if (description != null) { updates.push('description = ?'); vals.push(description?.trim() || null); }
    if (status === 'posted' || status === 'draft') { updates.push('status = ?'); vals.push(status); }
    if (updates.length === 0) return res.json({ success: true, message: 'No changes' });
    vals.push(jobIdParam);
    await query(`UPDATE recruiter_jobs SET ${updates.join(', ')} WHERE job_id = ?`, vals);
    return res.json({ success: true });
  } catch (err) {
    console.error('Recruiter update job error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update job' });
  }
});

// @route   DELETE /api/recruiter/jobs/:id
router.delete('/jobs/:id', protectRecruiter, async (req, res) => {
  try {
    const jobIdParam = req.params.id;
    const pk = recruiterPk(req.recruiter);
    const jobs = await query('SELECT job_id FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?', [jobIdParam, pk]).catch(() => []);
    if (!jobs || jobs.length === 0) {
      const fb = await query('SELECT job_id FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?', [jobIdParam, req.recruiter.id]).catch(() => []);
      if (!fb || fb.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
    }
    await query('DELETE FROM recruiter_jobs WHERE job_id = ?', [jobIdParam]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Recruiter delete job error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to delete job' });
  }
});

// @route   POST /api/recruiter/jobs/:id/applications
router.post('/jobs/:id/applications', protectRecruiter, async (req, res) => {
  try {
    const jobIdParam = req.params.id;
    const { candidateId } = req.body;
    const pk = recruiterPk(req.recruiter);
    const jobs = await query('SELECT job_id FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?', [jobIdParam, pk]).catch(() => []);
    if (!jobs || jobs.length === 0) {
      const fb = await query('SELECT job_id FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?', [jobIdParam, req.recruiter.id]).catch(() => []);
      if (!fb || fb.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const cId = parseInt(candidateId, 10);
    if (!Number.isFinite(cId)) return res.status(400).json({ success: false, message: 'Valid candidateId required' });
    const appId = crypto.randomUUID();
    await query(
      'INSERT INTO recruiter_job_applications (application_id, job_id, candidate_id, status, stage) VALUES (?, ?, ?, ?, ?)',
      [appId, jobIdParam, cId, 'pending', 'applied']
    );
    return res.status(201).json({ success: true, applicationId: appId });
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Candidate already applied' });
    console.error('Recruiter add application error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to add application' });
  }
});

// @route   PATCH /api/recruiter/jobs/:id/applications/:appId
router.patch('/jobs/:id/applications/:appId', protectRecruiter, async (req, res) => {
  try {
    const { id: jobIdParam, appId } = req.params;
    const pk = recruiterPk(req.recruiter);
    const jobs = await query('SELECT job_id FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?', [jobIdParam, pk]).catch(() => []);
    if (!jobs || jobs.length === 0) {
      const fb = await query('SELECT job_id FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?', [jobIdParam, req.recruiter.id]).catch(() => []);
      if (!fb || fb.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const { status, stage } = req.body;
    const updates = []; const vals = [];
    if (status === 'accepted' || status === 'rejected') { updates.push('status = ?'); vals.push(status); }
    if (stage && ['applied', 'shortlisted', 'interview', 'hired', 'rejected'].includes(stage)) { updates.push('stage = ?'); vals.push(stage); }
    if (updates.length === 0) return res.json({ success: true });
    vals.push(appId);
    await query(`UPDATE recruiter_job_applications SET ${updates.join(', ')} WHERE application_id = ? AND job_id = ?`, [...vals, jobIdParam]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Recruiter patch application error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update application' });
  }
});

// @route   PATCH /api/recruiter/jobs/:id/applications/:appId/stage
router.patch('/jobs/:id/applications/:appId/stage', protectRecruiter, async (req, res) => {
  try {
    const { id: jobIdParam, appId } = req.params;
    const { stage } = req.body;
    const pk = recruiterPk(req.recruiter);
    const jobs = await query('SELECT job_id FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?', [jobIdParam, pk]).catch(() => []);
    if (!jobs || jobs.length === 0) {
      const fb = await query('SELECT job_id FROM recruiter_jobs WHERE job_id = ? AND recruiter_id = ?', [jobIdParam, req.recruiter.id]).catch(() => []);
      if (!fb || fb.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const validStages = ['applied', 'shortlisted', 'interview', 'hired', 'rejected'];
    if (!stage || !validStages.includes(stage)) return res.status(400).json({ success: false, message: 'Valid stage required: applied, shortlisted, interview, hired, rejected' });
    await query('UPDATE recruiter_job_applications SET stage = ? WHERE application_id = ? AND job_id = ?', [stage, appId, jobIdParam]);
    return res.json({ success: true });
  } catch (err) {
    console.error('Recruiter set stage error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to set stage' });
  }
});

// @route   POST /api/recruiter/jobs/:id/applications/:appId/send-interview-invite
router.post('/jobs/:id/applications/:appId/send-interview-invite', protectRecruiter, async (req, res) => {
  try {
    const { id: jobIdParam, appId } = req.params;
    const pk = recruiterPk(req.recruiter);
    let jobRows = await query('SELECT j.job_id, j.title FROM recruiter_jobs j WHERE j.job_id = ? AND j.recruiter_id = ?', [jobIdParam, pk]).catch(() => []);
    if (!jobRows || jobRows.length === 0) {
      jobRows = await query('SELECT j.job_id, j.title FROM recruiter_jobs j WHERE j.job_id = ? AND j.recruiter_id = ?', [jobIdParam, req.recruiter.id]).catch(() => []);
      if (!jobRows || jobRows.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
    }
    const job = jobRows[0];
    const apps = await query(
      'SELECT a.application_id, a.candidate_id, c.full_name, c.email FROM recruiter_job_applications a LEFT JOIN smart_apply_candidates c ON c.id = a.candidate_id WHERE a.application_id = ? AND a.job_id = ?',
      [appId, jobIdParam]
    ).catch(() => []);
    if (!apps || apps.length === 0) return res.status(404).json({ success: false, message: 'Application not found' });
    const app = apps[0];
    if (!app.email) return res.status(400).json({ success: false, message: 'Candidate has no email' });
    const transporter = getEmailTransporter();
    const jobTitle = job.title || 'Position';
    const candidateName = app.full_name || 'Candidate';
    await transporter.sendMail({
      from: `"${req.recruiter.full_name || 'Recruiter'}" <${process.env.EMAIL_USER || 'noreply@example.com'}>`,
      to: app.email,
      subject: `Interview invitation – ${jobTitle}`,
      text: `Hello ${candidateName},\n\nYou have been shortlisted for the position: ${jobTitle}.\n\nWe would like to invite you for an interview. Our team will be in touch with further details.\n\nBest regards,\n${req.recruiter.full_name || 'Recruiting Team'}`,
    });
    await query(
      'UPDATE recruiter_job_applications SET interview_invite_sent_at = CURRENT_TIMESTAMP, stage = ? WHERE application_id = ? AND job_id = ?',
      ['interview', appId, jobIdParam]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('Recruiter send interview invite error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to send invitation' });
  }
});

// ---------- Search suggestions (talent search) ----------
// @route   GET /api/recruiter/search-suggestions
router.get('/search-suggestions', protectRecruiter, async (req, res) => {
  try {
    const pk = String(recruiterPk(req.recruiter));
    const rows = await query(
      'SELECT query FROM recruiter_search_suggestions WHERE recruiter_pk = ? ORDER BY created_at DESC LIMIT 30',
      [pk]
    ).catch(() => []);
    const suggestions = (rows || []).map((r) => r.query);
    return res.json({ success: true, suggestions });
  } catch (err) {
    console.error('Recruiter get search suggestions error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to get suggestions' });
  }
});

// @route   POST /api/recruiter/search-suggestions
router.post('/search-suggestions', protectRecruiter, async (req, res) => {
  try {
    const pk = String(recruiterPk(req.recruiter));
    const queryStr = req.body?.query;
    if (!queryStr || typeof queryStr !== 'string') {
      return res.status(400).json({ success: false, message: 'Query required' });
    }
    const trimmed = String(queryStr).trim().slice(0, 500);
    if (!trimmed) return res.json({ success: true });
    await query('DELETE FROM recruiter_search_suggestions WHERE recruiter_pk = ? AND LOWER(TRIM(query)) = LOWER(?)', [pk, trimmed]);
    await query('INSERT INTO recruiter_search_suggestions (recruiter_pk, query) VALUES (?, ?)', [pk, trimmed]);
    const all = await query('SELECT id FROM recruiter_search_suggestions WHERE recruiter_pk = ? ORDER BY created_at ASC', [pk]).catch(() => []);
    if (all && all.length > 30) {
      const toDelete = all.slice(0, all.length - 30).map((r) => r.id);
      if (toDelete.length) {
        const placeholders = toDelete.map(() => '?').join(',');
        await query(`DELETE FROM recruiter_search_suggestions WHERE id IN (${placeholders})`, toDelete).catch(() => {});
      }
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Recruiter add search suggestion error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to add suggestion' });
  }
});

// ---------- Candidate CV download (Smart Apply candidates) ----------
// @route   GET /api/recruiter/candidates/:id/cv
// @desc    Download candidate's primary CV (PDF blob)
// @access  Private (recruiter token)
router.get('/candidates/:id/cv', protectRecruiter, async (req, res) => {
  try {
    const candidateId = parseInt(req.params.id, 10);
    if (!Number.isFinite(candidateId)) {
      return res.status(400).json({ success: false, message: 'Invalid candidate id' });
    }
    const candidates = await query(
      'SELECT id, primary_cv_id FROM smart_apply_candidates WHERE id = ?',
      [candidateId]
    ).catch(() => []);
    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    const primaryCvId = candidates[0].primary_cv_id;
    if (primaryCvId == null) {
      return res.status(404).json({ success: false, message: 'Candidate has no CV uploaded' });
    }
    const cvs = await query(
      'SELECT file_name, file_content, mime_type FROM smart_apply_cvs WHERE id = ? AND candidate_id = ?',
      [primaryCvId, candidateId]
    ).catch(() => []);
    if (!cvs || cvs.length === 0) {
      return res.status(404).json({ success: false, message: 'CV not found' });
    }
    const cv = cvs[0];
    const buf = cv.file_content;
    const filename = cv.file_name || 'cv.pdf';
    const mime = cv.mime_type || 'application/pdf';
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buf);
  } catch (err) {
    console.error('Recruiter get candidate CV error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to get CV' });
  }
});

export default router;
