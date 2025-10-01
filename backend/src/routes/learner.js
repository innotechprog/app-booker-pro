import express from 'express';
import { query } from '../config/database.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/learner/profile
// @desc    Get learner profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, full_name, email, phone, grade, goals, is_premium, profile_completion FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    // Get subjects
    const subjects = await query(
      `SELECT s.name FROM subjects s 
       INNER JOIN user_subjects us ON s.id = us.subject_id 
       WHERE us.user_id = ?`,
      [user.id]
    );

    res.json({
      success: true,
      profile: {
        ...user,
        fullName: user.full_name,
        isPremium: user.is_premium,
        profileCompletion: user.profile_completion,
        subjects: subjects.map(s => s.name)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
});

// @route   PUT /api/learner/profile
// @desc    Update learner profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, phone, grade, goals } = req.body;

    await query(
      'UPDATE users SET full_name = ?, phone = ?, grade = ?, goals = ? WHERE id = ?',
      [fullName, phone, grade, goals, req.user.id]
    );

    // Calculate profile completion
    const fields = [fullName, req.user.email, grade, goals, phone];
    const completedFields = fields.filter(f => f && f.toString().trim() !== '').length;
    const completion = Math.round((completedFields / 5) * 100);

    await query(
      'UPDATE users SET profile_completion = ? WHERE id = ?',
      [completion, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profileCompletion: completion
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
});

// @route   GET /api/learner/subjects
// @desc    Get user's subjects
// @access  Private
router.get('/subjects', protect, async (req, res) => {
  try {
    const subjects = await query(
      `SELECT s.id, s.name, s.category, s.emoji, us.progress 
       FROM subjects s 
       INNER JOIN user_subjects us ON s.id = us.subject_id 
       WHERE us.user_id = ?
       ORDER BY s.name`,
      [req.user.id]
    );

    res.json({
      success: true,
      subjects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching subjects', error: error.message });
  }
});

// @route   POST /api/learner/subjects
// @desc    Add subject to user
// @access  Private
router.post('/subjects', protect, async (req, res) => {
  try {
    const { subjectName } = req.body;

    // Get subject ID
    const subjects = await query(
      'SELECT id FROM subjects WHERE name = ?',
      [subjectName]
    );

    if (subjects.length === 0) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const subjectId = subjects[0].id;

    // Add to user subjects
    await query(
      'INSERT IGNORE INTO user_subjects (user_id, subject_id) VALUES (?, ?)',
      [req.user.id, subjectId]
    );

    res.json({
      success: true,
      message: 'Subject added successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding subject', error: error.message });
  }
});

// @route   DELETE /api/learner/subjects/:subjectId
// @desc    Remove subject from user
// @access  Private
router.delete('/subjects/:subjectId', protect, async (req, res) => {
  try {
    await query(
      'DELETE FROM user_subjects WHERE user_id = ? AND subject_id = ?',
      [req.user.id, req.params.subjectId]
    );

    res.json({
      success: true,
      message: 'Subject removed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing subject', error: error.message });
  }
});

// @route   GET /api/learner/streak
// @desc    Get study streak
// @access  Private
router.get('/streak', protect, async (req, res) => {
  try {
    const streaks = await query(
      'SELECT current_streak, longest_streak, last_login_date FROM study_streaks WHERE user_id = ?',
      [req.user.id]
    );

    if (streaks.length === 0) {
      return res.json({
        success: true,
        streak: { currentStreak: 0, longestStreak: 0 }
      });
    }

    res.json({
      success: true,
      streak: {
        currentStreak: streaks[0].current_streak,
        longestStreak: streaks[0].longest_streak,
        lastLoginDate: streaks[0].last_login_date
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching streak', error: error.message });
  }
});

// @route   GET /api/learner/achievements
// @desc    Get user achievements
// @access  Private
router.get('/achievements', protect, async (req, res) => {
  try {
    const achievements = await query(
      `SELECT a.*, ua.earned_at 
       FROM achievements a
       INNER JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE ua.user_id = ?
       ORDER BY ua.earned_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      count: achievements.length,
      achievements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching achievements', error: error.message });
  }
});

export default router;

