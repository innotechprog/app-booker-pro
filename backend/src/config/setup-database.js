import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  let connection;
  
  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('📦 Creating database...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'app_booker_pro'}`);
    await connection.query(`USE ${process.env.DB_NAME || 'app_booker_pro'}`);
    console.log('✅ Database created successfully!');

    console.log('📋 Creating tables...');

    // Users table (Learners)
    await connection.query(`
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `);
    console.log('✅ Users table created');

    // Subjects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(100) NOT NULL,
        emoji VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Subjects table created');

    // User Subjects (Many-to-Many)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_subjects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        subject_id INT NOT NULL,
        progress INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_subject (user_id, subject_id)
      )
    `);
    console.log('✅ User Subjects table created');

    // Tutors table
    await connection.query(`
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
      )
    `);
    console.log('✅ Tutors table created');

    // Tutorials table
    await connection.query(`
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
      )
    `);
    console.log('✅ Tutorials table created');

    // Notes table
    await connection.query(`
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
      )
    `);
    console.log('✅ Notes table created');

    // Calendar Events table
    await connection.query(`
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
      )
    `);
    console.log('✅ Calendar Events table created');

    // Messages table
    await connection.query(`
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
      )
    `);
    console.log('✅ Messages table created');

    // Bookmarks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        tutorial_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (tutorial_id) REFERENCES tutorials(id) ON DELETE CASCADE,
        UNIQUE KEY unique_bookmark (user_id, tutorial_id)
      )
    `);
    console.log('✅ Bookmarks table created');

    // Notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        type ENUM('streak', 'achievement', 'calendar', 'message', 'general') DEFAULT 'general',
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_read (user_id, is_read)
      )
    `);
    console.log('✅ Notifications table created');

    // Study Streaks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS study_streaks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        current_streak INT DEFAULT 0,
        longest_streak INT DEFAULT 0,
        last_login_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Study Streaks table created');

    // Achievements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        emoji VARCHAR(10),
        requirement_type VARCHAR(100),
        requirement_value INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Achievements table created');

    // User Achievements (Many-to-Many)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        achievement_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_achievement (user_id, achievement_id)
      )
    `);
    console.log('✅ User Achievements table created');

    // Bookings table
    await connection.query(`
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
      )
    `);
    console.log('✅ Bookings table created');

    // User Progress table
    await connection.query(`
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
      )
    `);
    console.log('✅ User Progress table created');

    console.log('\n🎉 All tables created successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Copy env.example to .env and configure your settings');
    console.log('   2. Run: npm run db:seed (to add sample data)');
    console.log('   3. Run: npm run dev (to start the server)');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

setupDatabase();


