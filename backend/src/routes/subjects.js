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

export default router;


