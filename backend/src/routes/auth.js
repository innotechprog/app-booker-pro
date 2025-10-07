import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register new learner
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, grade } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (let database auto-generate ID)
    const result = await query(
      'INSERT INTO users (full_name, email, password, grade, profile_completion) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, hashedPassword, grade || '', 40]
    );
    
    const userId = result.insertId;

    // Create study streak record
    await query(
      'INSERT INTO study_streaks (user_id, current_streak, last_login_date) VALUES (?, ?, ?)',
      [userId, 1, new Date().toISOString().split('T')[0]]
    );

    // Add welcome notification
    await query(
      'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
      [userId, 'achievement', '🎓 Welcome to the platform! Start learning today.']
    );

    // Assign free package to new user
    await query(
      'INSERT INTO user_packages (user_id, package_id, start_date, is_active) VALUES (?, ?, ?, ?)',
      [userId, 'free-package-1', new Date().toISOString().split('T')[0], true]
    );

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        fullName,
        email,
        grade: grade || '',
        isPremium: false
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login learner
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Get user
    const users = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update study streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const streaks = await query(
      'SELECT * FROM study_streaks WHERE user_id = ?',
      [user.id]
    );

    if (streaks.length > 0) {
      const streak = streaks[0];
      let newStreak = streak.current_streak;

      if (streak.last_login_date === today) {
        // Already logged in today
        newStreak = streak.current_streak;
      } else if (streak.last_login_date === yesterday) {
        // Consecutive day
        newStreak = streak.current_streak + 1;
      } else {
        // Streak broken
        newStreak = 1;
      }

      const longestStreak = Math.max(newStreak, streak.longest_streak);

      await query(
        'UPDATE study_streaks SET current_streak = ?, longest_streak = ?, last_login_date = ? WHERE user_id = ?',
        [newStreak, longestStreak, today, user.id]
      );

      // Add streak notification if new milestone
      if (newStreak === 3 || newStreak === 7 || newStreak % 30 === 0) {
        await query(
          'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
          [user.id, 'streak', `🔥 ${newStreak} day streak! Keep it up!`]
        );
      }
    }

    // Get user subjects
    const userSubjects = await query(
      'SELECT s.name FROM subjects s INNER JOIN user_subjects us ON s.id = us.subject_id WHERE us.user_id = ?',
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        grade: user.grade,
        goals: user.goals,
        isPremium: user.is_premium,
        profileCompletion: user.profile_completion,
        subjects: userSubjects.map(s => s.name)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, full_name, email, phone, grade, goals, is_premium, profile_completion FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    // Get user subjects
    const userSubjects = await query(
      'SELECT s.name FROM subjects s INNER JOIN user_subjects us ON s.id = us.subject_id WHERE us.user_id = ?',
      [user.id]
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        grade: user.grade,
        goals: user.goals,
        isPremium: user.is_premium,
        profileCompletion: user.profile_completion,
        subjects: userSubjects.map(s => s.name)
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Error logging out', error: error.message });
  }
});

export default router;
