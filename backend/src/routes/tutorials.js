import express from 'express';
import { query } from '../config/database.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/tutorials
// @desc    Get all tutorials with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { subject, grade, difficulty, tutor, search, sortBy } = req.query;

    let sql = `
      SELECT t.*, 
             tu.name as tutor_name, 
             tu.photo_url as tutor_photo,
             tu.bio as tutor_bio
      FROM tutorials t
      LEFT JOIN tutors tu ON t.tutor_id = tu.id
      WHERE 1=1
    `;
    const params = [];

    if (subject) {
      sql += ' AND t.subject = ?';
      params.push(subject);
    }

    if (grade) {
      sql += ' AND t.grade = ?';
      params.push(grade);
    }

    if (difficulty) {
      sql += ' AND t.difficulty = ?';
      params.push(difficulty);
    }

    if (tutor) {
      sql += ' AND tu.name LIKE ?';
      params.push(`%${tutor}%`);
    }

    if (search) {
      sql += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Sorting
    if (sortBy === 'popular') {
      sql += ' ORDER BY t.views DESC';
    } else if (sortBy === 'rating') {
      sql += ' ORDER BY t.rating DESC';
    } else if (sortBy === 'recent') {
      sql += ' ORDER BY t.created_at DESC';
    } else {
      sql += ' ORDER BY t.title';
    }

    const tutorials = await query(sql, params);

    res.json({
      success: true,
      count: tutorials.length,
      tutorials
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tutorials', error: error.message });
  }
});

// @route   GET /api/tutorials/:id
// @desc    Get single tutorial
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tutorials = await query(
      `SELECT t.*, 
              tu.name as tutor_name,
              tu.photo_url as tutor_photo,
              tu.bio as tutor_bio,
              tu.rating as tutor_rating
       FROM tutorials t
       LEFT JOIN tutors tu ON t.tutor_id = tu.id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (tutorials.length === 0) {
      return res.status(404).json({ success: false, message: 'Tutorial not found' });
    }

    // Increment views
    await query('UPDATE tutorials SET views = views + 1 WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      tutorial: tutorials[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching tutorial', error: error.message });
  }
});

// @route   POST /api/tutorials/bookmarks
// @desc    Bookmark a tutorial
// @access  Private
router.post('/bookmarks', protect, async (req, res) => {
  try {
    const { tutorialId } = req.body;

    await query(
      'INSERT IGNORE INTO bookmarks (user_id, tutorial_id) VALUES (?, ?)',
      [req.user.id, tutorialId]
    );

    res.json({
      success: true,
      message: 'Tutorial bookmarked successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error bookmarking tutorial', error: error.message });
  }
});

// @route   DELETE /api/tutorials/bookmarks/:tutorialId
// @desc    Remove bookmark
// @access  Private
router.delete('/bookmarks/:tutorialId', protect, async (req, res) => {
  try {
    await query(
      'DELETE FROM bookmarks WHERE user_id = ? AND tutorial_id = ?',
      [req.user.id, req.params.tutorialId]
    );

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing bookmark', error: error.message });
  }
});

// @route   GET /api/tutorials/bookmarks/my
// @desc    Get user's bookmarked tutorials
// @access  Private
router.get('/bookmarks/my', protect, async (req, res) => {
  try {
    const bookmarks = await query(
      `SELECT t.*, b.created_at as bookmarked_at
       FROM tutorials t
       INNER JOIN bookmarks b ON t.id = b.tutorial_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      count: bookmarks.length,
      bookmarks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookmarks', error: error.message });
  }
});

export default router;






