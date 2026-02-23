/**
 * Recruiter auth (register / login) for Smart Apply recruiter portal.
 * Uses recruiters table; run db:migrate-recruiter to create it.
 */
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const router = express.Router();
const JWT_OPTIONS = { expiresIn: process.env.JWT_EXPIRE || '7d' };

function signRecruiterToken(id) {
  return jwt.sign({ id, type: 'recruiter' }, process.env.JWT_SECRET, JWT_OPTIONS);
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
    const rows = await query('SELECT id, email, full_name, company, phone FROM recruiters WHERE id = ?', [decoded.id]);
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
    const existing = await query('SELECT id FROM recruiters WHERE email = ?', [String(email).trim()]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    const password_hash = await bcrypt.hash(String(password), 10);
    const result = await query(
      'INSERT INTO recruiters (email, password_hash, full_name, company, phone) VALUES (?, ?, ?, ?, ?)',
      [
        String(email).trim(),
        password_hash,
        String(fullName).trim(),
        (company && String(company).trim()) || null,
        (phone && String(phone).trim()) || null,
      ]
    );
    const id = result.insertId;
    const token = signRecruiterToken(id);
    const recruiterRows = await query('SELECT id, email, full_name, company, phone FROM recruiters WHERE id = ?', [id]);
    const recruiter = recruiterRows && recruiterRows[0] ? recruiterRows[0] : { id, email: String(email).trim(), full_name: String(fullName).trim(), company: null, phone: null };
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
    const rows = await query(
      'SELECT id, email, full_name, company, phone, password_hash FROM recruiters WHERE email = ?',
      [emailTrimmed]
    );
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
    const token = signRecruiterToken(recruiter.id);
    return res.status(200).json({
      success: true,
      message: 'Logged in',
      token,
      recruiter: {
        id: recruiter.id,
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
    const rid = req.recruiter.id;
    const rows = await query('SELECT password_hash FROM recruiters WHERE id = ?', [rid]);
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
    await query('UPDATE recruiters SET password_hash = ? WHERE id = ?', [newHash, rid]);
    return res.status(200).json({ success: true, message: 'Password updated' });
  } catch (err) {
    console.error('Recruiter change-password error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update password' });
  }
});

export default router;
