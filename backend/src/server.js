import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { testConnection } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import learnerRoutes from './routes/learner.js';
import notesRoutes from './routes/notes.js';
import calendarRoutes from './routes/calendar.js';
import notificationsRoutes from './routes/notifications.js';
import tutorialsRoutes from './routes/tutorials.js';
import messagesRoutes from './routes/messages.js';
import subjectsRoutes from './routes/subjects.js';
import packagesRoutes from './routes/packages.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/learner', learnerRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/tutorials', tutorialsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/packages', packagesRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to IB Innovative Solutions API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      learner: '/api/learner',
      notes: '/api/notes',
      calendar: '/api/calendar',
      notifications: '/api/notifications',
      tutorials: '/api/tutorials',
      messages: '/api/messages',
      subjects: '/api/subjects'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      console.log('💡 Make sure to:');
      console.log('   1. Copy env.example to .env');
      console.log('   2. Configure your database settings');
      console.log('   3. Run: npm run db:setup');
      process.exit(1);
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('\n🚀 ========================================');
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🚀 API: http://localhost:${PORT}`);
      console.log(`🚀 Health: http://localhost:${PORT}/health`);
      console.log('🚀 ========================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


