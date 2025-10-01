import express from 'express';
import { protect } from '../middleware/auth.js';
import { query } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// @route   GET /api/packages
// @desc    Get all available packages
// @access  Public
router.get('/', async (req, res) => {
  try {
    const packages = await query(
      'SELECT * FROM packages WHERE is_active = TRUE ORDER BY price ASC'
    );

    // Parse JSON fields
    const formattedPackages = packages.map(pkg => ({
      ...pkg,
      features: pkg.features ? JSON.parse(pkg.features) : [],
      limitations: pkg.limitations ? JSON.parse(pkg.limitations) : []
    }));

    res.json({
      success: true,
      count: formattedPackages.length,
      packages: formattedPackages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching packages', error: error.message });
  }
});

// @route   GET /api/packages/user
// @desc    Get user's current package
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const userPackage = await query(
      `SELECT p.*, up.start_date, up.end_date, up.is_active as user_package_active
       FROM user_packages up
       JOIN packages p ON up.package_id = p.id
       WHERE up.user_id = ? AND up.is_active = TRUE
       LIMIT 1`,
      [req.user.id]
    );

    if (userPackage.length === 0) {
      // If user has no package, assign free package
      await query(
        'INSERT INTO user_packages (id, user_id, package_id, start_date, is_active) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), req.user.id, 'free-package-1', new Date().toISOString().split('T')[0], true]
      );

      // Fetch the newly assigned package
      const newUserPackage = await query(
        `SELECT p.*, up.start_date, up.end_date, up.is_active as user_package_active
         FROM user_packages up
         JOIN packages p ON up.package_id = p.id
         WHERE up.user_id = ? AND up.is_active = TRUE
         LIMIT 1`,
        [req.user.id]
      );

      const packageData = newUserPackage[0];
      res.json({
        success: true,
        package: {
          ...packageData,
          features: packageData.features ? JSON.parse(packageData.features) : [],
          limitations: packageData.limitations ? JSON.parse(packageData.limitations) : []
        }
      });
      return;
    }

    // Check if current package has expired (for non-free packages)
    const currentPackage = userPackage[0];
    if (currentPackage.end_date && currentPackage.end_date < new Date().toISOString().split('T')[0] && currentPackage.category !== 'free') {
      // Package has expired, revert to free package
      await query(
        'UPDATE user_packages SET is_active = FALSE WHERE user_id = ? AND is_active = TRUE',
        [req.user.id]
      );

      await query(
        'INSERT INTO user_packages (id, user_id, package_id, start_date, is_active) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), req.user.id, 'free-package-1', new Date().toISOString().split('T')[0], true]
      );

      // Add notification about package expiration
      await query(
        'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
        [req.user.id, 'info', `Your ${currentPackage.name} has expired. You have been reverted to the Free Package.`]
      );

      // Fetch the newly assigned free package
      const newUserPackage = await query(
        `SELECT p.*, up.start_date, up.end_date, up.is_active as user_package_active
         FROM user_packages up
         JOIN packages p ON up.package_id = p.id
         WHERE up.user_id = ? AND up.is_active = TRUE
         LIMIT 1`,
        [req.user.id]
      );

      const packageData = newUserPackage[0];
      res.json({
        success: true,
        package: {
          ...packageData,
          features: packageData.features ? JSON.parse(packageData.features) : [],
          limitations: packageData.limitations ? JSON.parse(packageData.limitations) : []
        }
      });
      return;
    }

    const packageData = userPackage[0];
    res.json({
      success: true,
      package: {
        ...packageData,
        features: packageData.features ? JSON.parse(packageData.features) : [],
        limitations: packageData.limitations ? JSON.parse(packageData.limitations) : []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user package', error: error.message });
  }
});

// @route   POST /api/packages/user/upgrade
// @desc    Upgrade user's package
// @access  Private
router.post('/user/upgrade', protect, async (req, res) => {
  try {
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({ success: false, message: 'Package ID is required' });
    }

    // Verify package exists
    const packageExists = await query(
      'SELECT * FROM packages WHERE id = ? AND is_active = TRUE',
      [packageId]
    );

    if (packageExists.length === 0) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    // Deactivate current package
    await query(
      'UPDATE user_packages SET is_active = FALSE, end_date = ? WHERE user_id = ? AND is_active = TRUE',
      [new Date().toISOString().split('T')[0], req.user.id]
    );

    // Calculate end date based on package duration
    const packageData = packageExists[0];
    let endDate = null;
    
    if (packageData.category !== 'free') {
      const startDate = new Date();
      if (packageData.duration.includes('Month')) {
        const months = parseInt(packageData.duration.match(/\d+/)[0]);
        endDate = new Date(startDate.setMonth(startDate.getMonth() + months));
      } else if (packageData.duration.includes('Year')) {
        const years = parseInt(packageData.duration.match(/\d+/)[0]);
        endDate = new Date(startDate.setFullYear(startDate.getFullYear() + years));
      }
    }

    // Assign new package
    await query(
      'INSERT INTO user_packages (id, user_id, package_id, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), req.user.id, packageId, new Date().toISOString().split('T')[0], endDate ? endDate.toISOString().split('T')[0] : null, true]
    );

    // Add notification
    await query(
      'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
      [req.user.id, 'achievement', `🎉 Package upgraded to ${packageData.name}! Enjoy your new features.`]
    );

    res.json({
      success: true,
      message: 'Package upgraded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error upgrading package', error: error.message });
  }
});

// @route   GET /api/packages/limits
// @desc    Get user's package limits and usage
// @access  Private
router.get('/limits', protect, async (req, res) => {
  try {
    // Get user's current package
    const userPackage = await query(
      `SELECT p.*, up.start_date, up.end_date
       FROM user_packages up
       JOIN packages p ON up.package_id = p.id
       WHERE up.user_id = ? AND up.is_active = TRUE
       LIMIT 1`,
      [req.user.id]
    );

    if (userPackage.length === 0) {
      return res.status(404).json({ success: false, message: 'No active package found' });
    }

    const packageData = userPackage[0];

    // Get current usage
    const notesCount = await query(
      'SELECT COUNT(*) as count FROM notes WHERE user_id = ?',
      [req.user.id]
    );

    const subjectsCount = await query(
      'SELECT COUNT(*) as count FROM user_subjects WHERE user_id = ?',
      [req.user.id]
    );

    const remindersCount = await query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND type = "reminder"',
      [req.user.id]
    );

    // Get tutorials viewed per subject
    const tutorialsPerSubject = await query(
      `SELECT s.name as subject_name, COUNT(ut.id) as tutorial_count
       FROM user_subjects us
       JOIN subjects s ON us.subject_id = s.id
       LEFT JOIN user_tutorials ut ON us.subject_id = ut.subject_id AND ut.user_id = ?
       WHERE us.user_id = ?
       GROUP BY s.id, s.name`,
      [req.user.id, req.user.id]
    );

    res.json({
      success: true,
      limits: {
        max_notes: packageData.max_notes,
        max_tutorials_per_subject: packageData.max_tutorials_per_subject,
        max_reminders: packageData.max_reminders,
        max_subjects: packageData.max_subjects,
        can_view_teacher_profiles: packageData.can_view_teacher_profiles
      },
      usage: {
        notes_count: notesCount[0].count,
        subjects_count: subjectsCount[0].count,
        reminders_count: remindersCount[0].count,
        tutorials_per_subject: tutorialsPerSubject
      },
      package: {
        id: packageData.id,
        name: packageData.name,
        category: packageData.category,
        price: packageData.price
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching package limits', error: error.message });
  }
});

export default router;
