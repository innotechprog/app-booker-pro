import pool from './database.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    console.log('🌱 Seeding database...');

    // Insert Subjects
    console.log('📚 Adding subjects...');
    const subjects = [
      ['Mathematics', 'Core Subjects', '🔢'],
      ['Algebra', 'Mathematics', '🔢'],
      ['Geometry', 'Mathematics', '📐'],
      ['Physical Science', 'Core Subjects', '🔬'],
      ['Life Science', 'Core Subjects', '🧬'],
      ['Physics', 'Sciences', '⚛️'],
      ['Chemistry', 'Sciences', '🧪'],
      ['Biology', 'Sciences', '🧬'],
      ['English', 'Core Subjects', '📚'],
      ['Afrikaans', 'Languages', '🗣️'],
      ['History', 'Core Subjects', '🏛️'],
      ['Geography', 'Core Subjects', '🌍'],
      ['Accounting', 'Core Subjects', '💰'],
      ['Economics', 'Core Subjects', '📊'],
      ['Computer Science', 'Technology', '💻'],
      ['Life Orientation', 'Core Subjects', '🎯']
    ];

    for (const [name, category, emoji] of subjects) {
      await connection.query(
        'INSERT IGNORE INTO subjects (name, category, emoji) VALUES (?, ?, ?)',
        [name, category, emoji]
      );
    }
    console.log('✅ Subjects added');

    // Insert Sample Tutors
    console.log('👨‍🏫 Adding tutors...');
    const tutors = [
      ['Dr. Sarah Johnson', 'sarah.johnson@ibis.com', '0821234567', 'Expert mathematics tutor with 10+ years of experience', '/tutors/sarah.jpg', 'Mathematics', 10, 4.9, 150, 350, 500, true],
      ['Prof. Michael Chen', 'michael.chen@ibis.com', '0829876543', 'Physics and Chemistry specialist', '/tutors/michael.jpg', 'Physical Science', 8, 4.8, 120, 300, 400, true],
      ['Dr. Emma Williams', 'emma.williams@ibis.com', '0835551234', 'Life Science and Biology expert', '/tutors/emma.jpg', 'Life Science', 7, 4.7, 100, 280, 350, true],
      ['Prof. David Brown', 'david.brown@ibis.com', '0827778888', 'English and Literature specialist', '/tutors/david.jpg', 'English', 12, 4.9, 200, 400, 600, true]
    ];

    for (const tutor of tutors) {
      await connection.query(
        `INSERT IGNORE INTO tutors 
        (name, email, phone, bio, photo_url, specialization, experience_years, rating, total_reviews, hourly_rate, total_students, is_verified) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        tutor
      );
    }
    console.log('✅ Tutors added');

    // Insert Achievements
    console.log('🏆 Adding achievements...');
    const achievements = [
      ['Welcome!', 'Joined the platform', '🎓', 'register', 1],
      ['Complete Profile', '100% profile completion', '✅', 'profile_complete', 100],
      ['On Fire!', '3-day study streak', '🔥', 'streak', 3],
      ['Week Warrior', '7-day study streak', '🏆', 'streak', 7],
      ['Month Master', '30-day study streak', '👑', 'streak', 30],
      ['Note Taker', 'Created first note', '📝', 'notes', 1],
      ['Organized', '10+ notes created', '📚', 'notes', 10],
      ['First Tutorial', 'Complete first tutorial', '🎬', 'tutorials', 1],
      ['Tutorial Master', 'Complete 10 tutorials', '🎓', 'tutorials', 10],
      ['Top Student', 'Complete 50 tutorials', '⭐', 'tutorials', 50]
    ];

    for (const achievement of achievements) {
      await connection.query(
        'INSERT IGNORE INTO achievements (name, description, emoji, requirement_type, requirement_value) VALUES (?, ?, ?, ?, ?)',
        achievement
      );
    }
    console.log('✅ Achievements added');

    // Create demo user
    console.log('👤 Creating demo user...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    await connection.query(
      `INSERT IGNORE INTO users (full_name, email, password, grade, profile_completion) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Demo Student', 'demo@student.com', hashedPassword, 'Grade 10', 60]
    );
    console.log('✅ Demo user created (email: demo@student.com, password: demo123)');

    console.log('\n🎉 Database seeded successfully!');
    console.log('📝 You can now:');
    console.log('   1. Login with: demo@student.com / demo123');
    console.log('   2. Start the server: npm run dev');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit();
  }
};

seedDatabase();




