import express from 'express';
import { query } from '../config/database.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notes
// @desc    Get all notes for user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category } = req.query;

    let sql = 'SELECT * FROM notes WHERE user_id = ?';
    const params = [req.user.id];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY created_at DESC';

    const notes = await query(sql, params);

    res.json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching notes', error: error.message });
  }
});

// @route   POST /api/notes
// @desc    Create new note
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, body, category } = req.body;

    if (!title && !body) {
      return res.status(400).json({ success: false, message: 'Title or body required' });
    }

    const result = await query(
      'INSERT INTO notes (user_id, title, body, category) VALUES (?, ?, ?, ?)',
      [req.user.id, title || 'Untitled', body, category || 'general']
    );

    // Check if this is first note for achievement
    const noteCount = await query(
      'SELECT COUNT(*) as count FROM notes WHERE user_id = ?',
      [req.user.id]
    );

    if (noteCount[0].count === 1) {
      // Award "Note Taker" achievement
      const achievement = await query('SELECT id FROM achievements WHERE requirement_type = ? AND requirement_value = ?', ['notes', 1]);
      if (achievement.length > 0) {
        await query(
          'INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [req.user.id, achievement[0].id]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      noteId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating note', error: error.message });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update note
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, body, category } = req.body;

    // Verify note belongs to user
    const notes = await query(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (notes.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    await query(
      'UPDATE notes SET title = ?, body = ?, category = ? WHERE id = ?',
      [title, body, category, req.params.id]
    );

    res.json({
      success: true,
      message: 'Note updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating note', error: error.message });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete note
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting note', error: error.message });
  }
});

export default router;









