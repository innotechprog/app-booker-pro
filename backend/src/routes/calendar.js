import express from 'express';
import { query } from '../config/database.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/calendar
// @desc    Get all calendar events
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { upcoming } = req.query;
    
    let sql = 'SELECT * FROM calendar_events WHERE user_id = ?';
    const params = [req.user.id];

    if (upcoming === 'true') {
      sql += ' AND completed = FALSE AND event_date >= CURDATE()';
    }

    sql += ' ORDER BY event_date, event_time';

    const events = await query(sql, params);

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching calendar events', error: error.message });
  }
});

// @route   POST /api/calendar
// @desc    Create calendar event
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, eventDate, eventTime, type } = req.body;

    if (!title || !eventDate || !eventTime) {
      return res.status(400).json({ success: false, message: 'Title, date, and time are required' });
    }

    const result = await query(
      'INSERT INTO calendar_events (user_id, title, event_date, event_time, type) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, eventDate, eventTime, type || 'study']
    );

    // Add notification
    await query(
      'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
      [req.user.id, 'calendar', `📅 New event: ${title} on ${new Date(eventDate).toLocaleDateString()}`]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      eventId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating event', error: error.message });
  }
});

// @route   PUT /api/calendar/:id
// @desc    Update calendar event
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, eventDate, eventTime, type, completed } = req.body;

    // Verify event belongs to user
    const events = await query(
      'SELECT id FROM calendar_events WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (eventDate !== undefined) { updates.push('event_date = ?'); params.push(eventDate); }
    if (eventTime !== undefined) { updates.push('event_time = ?'); params.push(eventTime); }
    if (type !== undefined) { updates.push('type = ?'); params.push(type); }
    if (completed !== undefined) { updates.push('completed = ?'); params.push(completed); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(req.params.id);

    await query(
      `UPDATE calendar_events SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({
      success: true,
      message: 'Event updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating event', error: error.message });
  }
});

// @route   DELETE /api/calendar/:id
// @desc    Delete calendar event
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM calendar_events WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting event', error: error.message });
  }
});

export default router;




