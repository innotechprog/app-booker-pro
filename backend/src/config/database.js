import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool with better error handling
// Use 127.0.0.1 instead of localhost to force IPv4 and avoid IPv6 issues
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'app_booker_pro',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Execute query helper with retry logic
export const query = async (sql, params = [], retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      // If it's a connection error and we have retries left, try again
      if (
        (error.code === 'ECONNRESET' || 
         error.code === 'ECONNREFUSED' ||
         error.code === 'PROTOCOL_CONNECTION_LOST' ||
         error.code === 'ETIMEDOUT') &&
        attempt < retries
      ) {
        console.warn(`Database connection error (attempt ${attempt + 1}/${retries + 1}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
        continue;
      }
      
      console.error('Database query error:', error);
      throw error;
    }
  }
};

export default pool;






