import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all available subjects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;

    let sql = 'SELECT * FROM subjects WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY category, name';

    const subjects = await query(sql, params);

    res.json({
      success: true,
      count: subjects.length,
      subjects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching subjects', error: error.message });
  }
});

// @route   GET /api/subjects/categories
// @desc    Get all subject categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await query(
      'SELECT DISTINCT category FROM subjects ORDER BY category'
    );

    res.json({
      success: true,
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching categories', error: error.message });
  }
});

// @route   POST /api/subjects/enroll
// @desc    Enroll user in subjects
// @access  Private (requires userId)
router.post('/enroll', async (req, res) => {
  try {
    const { userId, subjectIds } = req.body;

    if (!userId || !subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and subject IDs are required' 
      });
    }

    // Insert enrollments (ignore duplicates)
    const enrollments = [];
    for (const subjectId of subjectIds) {
      try {
        await query(
          'INSERT INTO user_subjects (user_id, subject_id, progress) VALUES (?, ?, 0) ON DUPLICATE KEY UPDATE user_id = user_id',
          [userId, subjectId]
        );
        enrollments.push({ userId, subjectId });
      } catch (error) {
        console.error(`Error enrolling subject ${subjectId}:`, error);
      }
    }

    res.json({
      success: true,
      message: `Successfully enrolled in ${enrollments.length} subject(s)`,
      enrollments
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error enrolling in subjects', 
      error: error.message 
    });
  }
});

// @route   GET /api/subjects/enrolled/:userId
// @desc    Get enrolled subjects for a user
// @access  Private
router.get('/enrolled/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const enrolledSubjects = await query(`
      SELECT 
        s.id,
        s.name,
        s.category,
        s.emoji,
        us.progress,
        us.created_at as enrolled_date
      FROM user_subjects us
      JOIN subjects s ON us.subject_id = s.id
      WHERE us.user_id = ?
      ORDER BY us.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      count: enrolledSubjects.length,
      subjects: enrolledSubjects
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching enrolled subjects', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/subjects/unenroll
// @desc    Unenroll user from a subject
// @access  Private
router.delete('/unenroll', async (req, res) => {
  try {
    const { userId, subjectId } = req.body;

    if (!userId || !subjectId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and subject ID are required' 
      });
    }

    await query(
      'DELETE FROM user_subjects WHERE user_id = ? AND subject_id = ?',
      [userId, subjectId]
    );

    res.json({
      success: true,
      message: 'Successfully unenrolled from subject'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error unenrolling from subject', 
      error: error.message 
    });
  }
});

export default router;





