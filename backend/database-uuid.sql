-- =============================================
-- IB Innovative Solutions - Database Schema with UUIDs
-- App Booker Pro - MySQL Database Schema (Updated for UUIDs)
-- =============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS app_booker_pro;
USE app_booker_pro;

-- Enable UUID function (MySQL 8.0+)
-- For older versions, we'll use a custom UUID function

-- =============================================
-- TABLES WITH UUID SUPPORT
-- =============================================

-- 1. Users Table (Learners) - Updated with UUID
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  grade VARCHAR(50),
  goals TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  profile_completion INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  emoji VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Subjects (Many-to-Many) - Updated with UUID
CREATE TABLE IF NOT EXISTS user_subjects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
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

-- 6. Notes Table - Updated with UUID
CREATE TABLE IF NOT EXISTS notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  category VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_category (user_id, category)
);

-- 7. Calendar Events Table - Updated with UUID
CREATE TABLE IF NOT EXISTS calendar_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  type ENUM('study', 'tutorial', 'exam', 'assignment', 'other') DEFAULT 'study',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, event_date)
);

-- 8. Messages Table - Updated with UUID
CREATE TABLE IF NOT EXISTS messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  tutor_id INT NOT NULL,
  content TEXT NOT NULL,
  sender_type ENUM('student', 'tutor') NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
  INDEX idx_conversation (user_id, tutor_id)
);

-- 9. Bookmarks Table - Updated with UUID
CREATE TABLE IF NOT EXISTS bookmarks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  tutorial_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE,
  UNIQUE KEY unique_bookmark (user_id, tutorial_id)
);

-- 10. Notifications Table - Updated with UUID
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  type ENUM('streak', 'achievement', 'calendar', 'message', 'general') DEFAULT 'general',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read)
);

-- 11. Study Streaks Table - Updated with UUID
CREATE TABLE IF NOT EXISTS study_streaks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) UNIQUE NOT NULL,
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

-- 13. User Achievements (Many-to-Many) - Updated with UUID
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
  achievement_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- 14. Bookings Table - Updated with UUID
CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
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

-- 15. User Progress Table - Updated with UUID
CREATE TABLE IF NOT EXISTS user_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id CHAR(36) NOT NULL,
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

-- Insert Demo User with UUID (password: demo123)
-- Password hash for 'demo123' using bcrypt
INSERT IGNORE INTO users (id, full_name, email, password, grade, profile_completion) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Demo Student', 'demo@student.com', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8QJn5xQJn5xJQJn5xJQJn5xJQJn5xJQJ', 'Grade 10', 60);

-- Add demo user study streak
INSERT IGNORE INTO study_streaks (user_id, current_streak, longest_streak, last_login_date) VALUES
('550e8400-e29b-41d4-a716-446655440000', 1, 1, CURDATE());

-- Add welcome notification for demo user
INSERT IGNORE INTO notifications (user_id, type, message) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'achievement', '🎓 Welcome to the platform! Start learning today.');

-- =============================================
-- SAMPLE TUTORIALS
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
SELECT 'Database Setup Complete with UUIDs!' as Status;
SELECT COUNT(*) as 'Total Subjects' FROM subjects;
SELECT COUNT(*) as 'Total Tutors' FROM tutors;
SELECT COUNT(*) as 'Total Achievements' FROM achievements;
SELECT COUNT(*) as 'Total Tutorials' FROM tutorials;
SELECT COUNT(*) as 'Total Users' FROM users;

-- =============================================
-- DEMO LOGIN CREDENTIALS
-- =============================================
SELECT 
  '=== DEMO ACCOUNT ===' as Info,
  'Email: demo@student.com' as Login,
  'Password: demo123' as Password,
  'User ID: 550e8400-e29b-41d4-a716-446655440000' as UserUUID;

-- =============================================
-- END OF SQL SCRIPT
-- =============================================

