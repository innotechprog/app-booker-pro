import express from 'express';
import { query } from '../config/database.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/messages
// @desc    Get all conversations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const conversations = await query(
      `SELECT DISTINCT 
              t.id as tutor_id,
              t.name as tutor_name,
              t.photo_url as tutor_photo,
              t.specialization,
              (SELECT COUNT(*) FROM messages WHERE user_id = ? AND tutor_id = t.id AND is_read = FALSE AND sender_type = 'tutor') as unread_count,
              (SELECT content FROM messages WHERE user_id = ? AND tutor_id = t.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages WHERE user_id = ? AND tutor_id = t.id ORDER BY created_at DESC LIMIT 1) as last_message_time
       FROM messages m
       INNER JOIN tutors t ON m.tutor_id = t.id
       WHERE m.user_id = ?
       ORDER BY last_message_time DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id]
    );

    res.json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching conversations', error: error.message });
  }
});

// @route   GET /api/messages/:tutorId
// @desc    Get messages with specific tutor
// @access  Private
router.get('/:tutorId', protect, async (req, res) => {
  try {
    const messages = await query(
      `SELECT * FROM messages 
       WHERE user_id = ? AND tutor_id = ?
       ORDER BY created_at ASC`,
      [req.user.id, req.params.tutorId]
    );

    // Mark messages as read
    await query(
      'UPDATE messages SET is_read = TRUE WHERE user_id = ? AND tutor_id = ? AND sender_type = "tutor"',
      [req.user.id, req.params.tutorId]
    );

    res.json({
      success: true,
      count: messages.length,
      messages: messages.map(m => ({
        id: m.id,
        tutorId: m.tutor_id,
        content: m.content,
        from: m.sender_type,
        timestamp: m.created_at,
        isRead: m.is_read
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
  }
});

// @route   POST /api/messages
// @desc    Send message to tutor
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { tutorId, content } = req.body;

    if (!tutorId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Tutor ID and message content required' });
    }

    const result = await query(
      'INSERT INTO messages (user_id, tutor_id, content, sender_type) VALUES (?, ?, ?, ?)',
      [req.user.id, tutorId, content, 'student']
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      messageId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
});

export default router;


