/**
 * Recruiter auth (register / login) for Smart Apply recruiter portal.
 * Supports both legacy (id INT) and normalized (recruiter_id CHAR(36) UUID) schema.
 */
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/database.js';

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
        'SELECT recruiter_id, id, email, full_name, company, phone FROM recruiters WHERE recruiter_id = ?',
        [pk]
      );
    } catch (e) {
      if (isRecruiterIdColumnError(e)) {
        rows = await query(
          'SELECT id, email, full_name, company, phone FROM recruiters WHERE id = ?',
          [pk]
        ).catch(() => []);
      } else throw e;
    }
    if (!rows || rows.length === 0) {
      rows = await query(
        'SELECT id, email, full_name, company, phone FROM recruiters WHERE id = ?',
        [pk]
      ).catch(() => []);
    }
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Recruiter not found' });
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
        'SELECT recruiter_id, id, email, full_name, company, phone, password_hash FROM recruiters WHERE email = ?',
        [emailTrimmed]
      );
    } catch (e) {
      if (isRecruiterIdColumnError(e)) {
        rows = await query(
          'SELECT id, email, full_name, company, phone, password_hash FROM recruiters WHERE email = ?',
          [emailTrimmed]
        ).catch(() => []);
      } else throw e;
    }
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const recruiter = rows[0];
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
