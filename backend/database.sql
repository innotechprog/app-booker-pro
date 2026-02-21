-- =============================================
-- IB Innovative Solutions - Complete Database
-- App Booker Pro - MySQL Database Schema
-- =============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS app_booker_pro;
USE app_booker_pro;

-- =============================================
-- TABLES
-- =============================================

-- 1. Users Table (Learners)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  grade VARCHAR(50),
  goals TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  profile_completion INT DEFAULT 0,
  candidate_category VARCHAR(20) DEFAULT NULL COMMENT 'Smart Apply: general (Grade 12) or professional',
  cv_overview TEXT DEFAULT NULL,
  cv_work_experience TEXT DEFAULT NULL,
  cv_education TEXT DEFAULT NULL,
  cv_certifications TEXT DEFAULT NULL,
  cv_key_skills TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_candidate_category (candidate_category)
);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Subjects (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  subject_id INT NOT NULL,
  progress INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_subject (user_id, subject_id)
);

-- 4. Tutors Table
CREATE TABLE IF NOT EXISTS tutors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  bio TEXT,
  photo_url VARCHAR(500),
  specialization VARCHAR(255),
  experience_years INT,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  hourly_rate DECIMAL(10,2),
  total_students INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tutorials Table
CREATE TABLE IF NOT EXISTS tutorials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  tutor_id INT,
  subject VARCHAR(100),
  grade VARCHAR(50),
  difficulty VARCHAR(50),
  duration_minutes INT,
  video_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  views INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INT DEFAULT 0,
  access_level ENUM('FREE', 'REGISTERED', 'PREMIUM') DEFAULT 'FREE',
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE SET NULL,
  INDEX idx_subject (subject),
  INDEX idx_grade (grade)
);

-- 6. Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_category (user_id, category)
);

-- 7. Calendar Events Table
CREATE TABLE IF NOT EXISTS calendar_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  type ENUM('study', 'tutorial', 'exam', 'assignment', 'other') DEFAULT 'study',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, event_date)
);

-- 8. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  tutor_id INT NOT NULL,
  content TEXT NOT NULL,
  sender_type ENUM('student', 'tutor') NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
  INDEX idx_conversation (user_id, tutor_id)
);

-- 9. Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  tutorial_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE,
  UNIQUE KEY unique_bookmark (user_id, tutorial_id)
);

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('streak', 'achievement', 'calendar', 'message', 'general') DEFAULT 'general',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read)
);

-- 11. Study Streaks Table
CREATE TABLE IF NOT EXISTS study_streaks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_login_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  emoji VARCHAR(10),
  requirement_type VARCHAR(100),
  requirement_value INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. User Achievements (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- 14. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  tutor_id INT NOT NULL,
  tutorial_id INT,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE SET NULL,
  INDEX idx_user_status (user_id, status)
);

-- 15. User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  tutorial_id INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  progress_percent INT DEFAULT 0,
  time_spent_minutes INT DEFAULT 0,
  last_watched_at TIMESTAMP,
  rating INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_tutorial (user_id, tutorial_id)
);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert Subjects
INSERT IGNORE INTO subjects (name, category, emoji) VALUES
('Mathematics', 'Core Subjects', '🔢'),
('Algebra', 'Mathematics', '🔢'),
('Geometry', 'Mathematics', '📐'),
('Calculus', 'Mathematics', '📊'),
('Statistics', 'Mathematics', '📈'),
('Trigonometry', 'Mathematics', '📐'),
('Physical Science', 'Core Subjects', '🔬'),
('Life Science', 'Core Subjects', '🧬'),
('Physics', 'Sciences', '⚛️'),
('Chemistry', 'Sciences', '🧪'),
('Biology', 'Sciences', '🧬'),
('English', 'Core Subjects', '📚'),
('Afrikaans', 'Languages', '🗣️'),
('IsiZulu', 'Languages', '🗣️'),
('IsiXhosa', 'Languages', '🗣️'),
('Sesotho', 'Languages', '🗣️'),
('History', 'Core Subjects', '🏛️'),
('Geography', 'Core Subjects', '🌍'),
('Accounting', 'Core Subjects', '💰'),
('Economics', 'Core Subjects', '📊'),
('Business Studies', 'Business', '💼'),
('Computer Science', 'Technology', '💻'),
('Information Technology', 'Technology', '🖥️'),
('CAT (Computer Applications Technology)', 'Technology', '⌨️'),
('Visual Arts', 'Arts', '🎨'),
('Music', 'Arts', '🎵'),
('Drama', 'Arts', '🎭'),
('Life Orientation', 'Core Subjects', '🎯'),
('Agricultural Science', 'Sciences', '🌾'),
('Tourism', 'Business', '✈️');

-- Insert Tutors
INSERT IGNORE INTO tutors (name, email, phone, bio, photo_url, specialization, experience_years, rating, total_reviews, hourly_rate, total_students, is_verified) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@ibis.com', '0821234567', 'Expert mathematics tutor with 10+ years of experience specializing in algebra and calculus. Helped hundreds of students achieve their goals.', '/tutors/sarah.jpg', 'Mathematics', 10, 4.9, 150, 350, 500, TRUE),
('Prof. Michael Chen', 'michael.chen@ibis.com', '0829876543', 'Physics and Chemistry specialist with a passion for making complex concepts simple. University professor with extensive tutoring experience.', '/tutors/michael.jpg', 'Physical Science', 8, 4.8, 120, 300, 400, TRUE),
('Dr. Emma Williams', 'emma.williams@ibis.com', '0835551234', 'Life Science and Biology expert. PhD in Molecular Biology. Makes learning fun and interactive with real-world examples.', '/tutors/emma.jpg', 'Life Science', 7, 4.7, 100, 280, 350, TRUE),
('Prof. David Brown', 'david.brown@ibis.com', '0827778888', 'English and Literature specialist with 12 years of experience. Focuses on critical thinking, writing skills, and exam preparation.', '/tutors/david.jpg', 'English', 12, 4.9, 200, 400, 600, TRUE);

-- Insert Achievements
INSERT IGNORE INTO achievements (name, description, emoji, requirement_type, requirement_value) VALUES
('Welcome!', 'Joined the platform', '🎓', 'register', 1),
('Complete Profile', '100% profile completion', '✅', 'profile_complete', 100),
('On Fire!', '3-day study streak', '🔥', 'streak', 3),
('Week Warrior', '7-day study streak', '🏆', 'streak', 7),
('Month Master', '30-day study streak', '👑', 'streak', 30),
('Note Taker', 'Created first note', '📝', 'notes', 1),
('Organized', '10+ notes created', '📚', 'notes', 10),
('First Tutorial', 'Complete first tutorial', '🎬', 'tutorials', 1),
('Tutorial Master', 'Complete 10 tutorials', '🎓', 'tutorials', 10),
('Top Student', 'Complete 50 tutorials', '⭐', 'tutorials', 50);

-- Insert Demo User (password: demo123)
-- Password hash for 'demo123' using bcrypt
INSERT IGNORE INTO users (full_name, email, password, grade, profile_completion) VALUES
('Demo Student', 'demo@student.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8QJn5xQJn5xJQJn5xJn5xJQJn5xJQJ', 'Grade 10', 60);

-- Get the demo user ID for following inserts
SET @demo_user_id = (SELECT id FROM users WHERE email = 'demo@student.com');

-- Add demo user study streak
INSERT IGNORE INTO study_streaks (user_id, current_streak, longest_streak, last_login_date) VALUES
(@demo_user_id, 1, 1, CURDATE());

-- Add welcome notification for demo user
INSERT IGNORE INTO notifications (user_id, type, message) VALUES
(@demo_user_id, 'achievement', '🎓 Welcome to the platform! Start learning today.');

-- =============================================
-- SAMPLE TUTORIALS (Optional)
-- =============================================

-- Get tutor IDs
SET @sarah_id = (SELECT id FROM tutors WHERE email = 'sarah.johnson@ibis.com');
SET @michael_id = (SELECT id FROM tutors WHERE email = 'michael.chen@ibis.com');
SET @emma_id = (SELECT id FROM tutors WHERE email = 'emma.williams@ibis.com');
SET @david_id = (SELECT id FROM tutors WHERE email = 'david.brown@ibis.com');

-- Insert Sample Tutorials
INSERT IGNORE INTO tutorials (title, description, tutor_id, subject, grade, difficulty, duration_minutes, video_url, thumbnail_url, views, rating, total_ratings, access_level, is_popular) VALUES
('Introduction to Algebra', 'Learn the basics of algebraic expressions and equations', @sarah_id, 'Mathematics', 'Grade 9', 'beginner', 30, '/videos/algebra-intro.mp4', '/thumbnails/algebra.jpg', 1250, 4.8, 95, 'FREE', TRUE),
('Quadratic Equations Masterclass', 'Complete guide to solving quadratic equations', @sarah_id, 'Mathematics', 'Grade 10', 'intermediate', 45, '/videos/quadratic.mp4', '/thumbnails/quadratic.jpg', 980, 4.9, 87, 'REGISTERED', TRUE),
('Physics: Newton\'s Laws', 'Understanding the three laws of motion', @michael_id, 'Physical Science', 'Grade 10', 'intermediate', 35, '/videos/newtons-laws.mp4', '/thumbnails/physics.jpg', 850, 4.7, 68, 'FREE', FALSE),
('Chemistry: Atomic Structure', 'Deep dive into atoms, electrons, and the periodic table', @michael_id, 'Physical Science', 'Grade 11', 'intermediate', 40, '/videos/atomic.mp4', '/thumbnails/chemistry.jpg', 720, 4.8, 54, 'REGISTERED', FALSE),
('Cell Biology Basics', 'Understanding cell structure and function', @emma_id, 'Life Science', 'Grade 10', 'beginner', 30, '/videos/cell-bio.mp4', '/thumbnails/biology.jpg', 1100, 4.9, 92, 'FREE', TRUE),
('DNA and Genetics', 'Explore heredity, genes, and DNA replication', @emma_id, 'Life Science', 'Grade 12', 'advanced', 50, '/videos/genetics.mp4', '/thumbnails/dna.jpg', 650, 4.8, 48, 'PREMIUM', FALSE),
('English Grammar Essentials', 'Master parts of speech, tenses, and sentence structure', @david_id, 'English', 'Grade 8', 'beginner', 25, '/videos/grammar.mp4', '/thumbnails/english.jpg', 1450, 4.7, 112, 'FREE', TRUE),
('Essay Writing Techniques', 'Learn to write compelling essays and arguments', @david_id, 'English', 'Grade 11', 'intermediate', 40, '/videos/essay.mp4', '/thumbnails/writing.jpg', 890, 4.9, 76, 'REGISTERED', TRUE);

-- =============================================
-- VIEWS & STATS
-- =============================================

-- View: User Statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.full_name,
  u.email,
  COUNT(DISTINCT n.id) as total_notes,
  COUNT(DISTINCT us.subject_id) as total_subjects,
  COUNT(DISTINCT b.id) as total_bookmarks,
  COUNT(DISTINCT ce.id) as total_events,
  COALESCE(ss.current_streak, 0) as current_streak,
  COALESCE(ss.longest_streak, 0) as longest_streak,
  u.profile_completion
FROM users u
LEFT JOIN notes n ON u.id = n.user_id
LEFT JOIN user_subjects us ON u.id = us.user_id
LEFT JOIN bookmarks b ON u.id = b.user_id
LEFT JOIN calendar_events ce ON u.id = ce.user_id
LEFT JOIN study_streaks ss ON u.id = ss.user_id
GROUP BY u.id;

-- =============================================
-- INITIAL DATA VERIFICATION
-- =============================================

-- Show what was created
SELECT 'Database Setup Complete!' as Status;
SELECT COUNT(*) as 'Total Subjects' FROM subjects;
SELECT COUNT(*) as 'Total Tutors' FROM tutors;
SELECT COUNT(*) as 'Total Achievements' FROM achievements;
SELECT COUNT(*) as 'Total Tutorials' FROM tutorials;
SELECT COUNT(*) as 'Total Users' FROM users;

-- =============================================
-- PACKAGES AND USER PACKAGES TABLES
-- =============================================

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duration VARCHAR(100),
  features JSON,
  limitations JSON,
  category ENUM('free', 'basic', 'premium', 'enterprise') DEFAULT 'free',
  max_notes INT DEFAULT 5,
  max_tutorials_per_subject INT DEFAULT 5,
  max_reminders INT DEFAULT 2,
  max_subjects INT DEFAULT 2,
  can_view_teacher_profiles BOOLEAN DEFAULT FALSE,
  is_recommended BOOLEAN DEFAULT FALSE,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User packages table (tracks which package a user has)
CREATE TABLE IF NOT EXISTS user_packages (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  package_id VARCHAR(36) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE,
  UNIQUE KEY unique_active_package (user_id, is_active)
);

-- Insert default packages
INSERT INTO packages (id, name, description, price, duration, features, limitations, category, max_notes, max_tutorials_per_subject, max_reminders, max_subjects, can_view_teacher_profiles, is_recommended, is_popular) VALUES
('free-package-1', 'Free Package', 'Perfect for trying out our platform with basic features', 0.00, 'Forever Free', 
 JSON_ARRAY('Create up to 5 notes', 'View 5 tutorials per subject', 'Book tutoring sessions', 'Set up to 2 reminders', 'Choose 2 subjects maximum', 'Basic progress tracking', 'Email support'),
 JSON_ARRAY('Cannot view teacher profiles', 'Limited to 5 notes total', 'Limited to 5 tutorials per subject', 'Maximum 2 reminders', 'Maximum 2 subjects'),
 'free', 5, 5, 2, 2, FALSE, TRUE, FALSE),
('basic-package-1', 'Starter Package', 'Perfect for students just getting started with tutoring', 1499.00, '1 Month',
 JSON_ARRAY('10 hours of tutoring', 'Basic study materials', 'Email support', 'Progress tracking', 'Mobile app access'),
 JSON_ARRAY(),
 'basic', 50, 20, 10, 5, TRUE, FALSE, FALSE),
('premium-package-1', 'Premium Package', 'Most popular choice for serious learners', 2999.00, '3 Months',
 JSON_ARRAY('20 hours of tutoring', 'Premium study materials', 'Priority support', 'Advanced progress tracking', 'Group study sessions', 'Exam preparation', '24/7 chat support'),
 JSON_ARRAY(),
 'premium', 100, 50, 20, 10, TRUE, FALSE, TRUE),
('enterprise-package-1', 'Enterprise Package', 'Complete learning solution for advanced students', 5999.00, '6 Months',
 JSON_ARRAY('50 hours of tutoring', 'All premium materials', 'Dedicated tutor', 'Custom study plans', 'Unlimited group sessions', 'Exam preparation', 'Career counseling', '24/7 priority support', 'Certificate of completion'),
 JSON_ARRAY(),
 'enterprise', 500, 100, 50, 20, TRUE, FALSE, FALSE);

-- =============================================
-- DEMO LOGIN CREDENTIALS
-- =============================================
SELECT 
  '=== DEMO ACCOUNT ===' as Info,
  'Email: demo@student.com' as Login,
  'Password: demo123' as Password;

-- =============================================
-- END OF SQL SCRIPT
-- =============================================


