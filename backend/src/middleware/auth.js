import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export const protect = async (req, res, next) => {
  let token;

  // Check for token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const users = await query(
      'SELECT id, full_name, email, grade, is_premium FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

export const checkPremium = (req, res, next) => {
  if (!req.user.is_premium) {
    return res.status(403).json({
      success: false,
      message: 'This feature requires a premium subscription'
    });
  }
  next();
};

/** Smart Apply only: verify token with type 'smart_apply' and load candidate from smart_apply_candidates */
export const protectSmartApply = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'smart_apply') {
      return res.status(401).json({ success: false, message: 'Invalid token for Smart Apply' });
    }
    const rows = await query(
      'SELECT id, full_name, email, phone, date_of_birth, primary_cv_id, gender, nationality, current_location, job_title, linkedin_url, website, candidate_category, cv_overview, profile_picture, show_profile_picture_on_cv FROM smart_apply_candidates WHERE id = ?',
      [decoded.id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Candidate not found' });
    }
    const candidate = rows[0];
    const cid = candidate.id;
    const [we, edu, cert, skills, addrs] = await Promise.all([
      query('SELECT content FROM smart_apply_work_experience WHERE candidate_id = ? ORDER BY sort_order', [cid]),
      query('SELECT content FROM smart_apply_education WHERE candidate_id = ? ORDER BY sort_order', [cid]),
      query('SELECT content FROM smart_apply_certifications WHERE candidate_id = ? ORDER BY sort_order', [cid]),
      query('SELECT content FROM smart_apply_key_skills WHERE candidate_id = ? ORDER BY sort_order', [cid]),
      query('SELECT id, label, address_line1, address_line2, city, state_region, postal_code, country, is_primary FROM smart_apply_addresses WHERE candidate_id = ? ORDER BY is_primary DESC, id', [cid]).catch(() => []),
    ]);
    candidate.cv_work_experience = we.length ? we.map((r) => r.content).join('\n\n') : null;
    candidate.cv_education = edu.length ? edu.map((r) => r.content).join('\n\n') : null;
    candidate.cv_certifications = cert.length ? cert.map((r) => r.content).join('\n\n') : null;
    candidate.cv_key_skills = skills.length ? skills.map((r) => r.content).join('\n\n') : null;
    candidate.addresses = Array.isArray(addrs) ? addrs.map((a) => ({
      id: a.id,
      label: a.label,
      addressLine1: a.address_line1,
      addressLine2: a.address_line2 || null,
      city: a.city,
      stateRegion: a.state_region || null,
      postalCode: a.postal_code || null,
      country: a.country,
      isPrimary: !!a.is_primary,
    })) : [];
    req.candidate = candidate;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};









