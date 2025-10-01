import express from 'express';
import { query } from '../config/database.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { unreadOnly } = req.query;

    let sql = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [req.user.id];

    if (unreadOnly === 'true') {
      sql += ' AND is_read = FALSE';
    }

    sql += ' ORDER BY created_at DESC LIMIT 50';

    const notifications = await query(sql, params);

    res.json({
      success: true,
      count: notifications.length,
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        message: n.message,
        read: n.is_read,
        time: n.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating notification', error: error.message });
  }
});

// @route   DELETE /api/notifications
// @desc    Clear all notifications
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await query(
      'DELETE FROM notifications WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'All notifications cleared'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error clearing notifications', error: error.message });
  }
});

export default router;


