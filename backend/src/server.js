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
import applicationHelpRoutes from './routes/applicationHelp.js';
import contactRoutes from './routes/contact.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers

// CORS: allow multiple dev origins via FRONTEND_URLS and FRONTEND_URL merged with sensible defaults
const envOrigins = [
  ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',') : []),
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:8084',
  'http://localhost:8085',
  'http://localhost:8086',
  'http://localhost:8087',
  'http://localhost:8088',
  'http://localhost:8089',
  'http://localhost:8090',
];
const allowedOrigins = Array.from(new Set(envOrigins.map((o) => o.trim()).filter(Boolean)));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin) and configured origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    optionsSuccessStatus: 204,
  })
);

// Handle preflight for all routes
app.options('*', cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  optionsSuccessStatus: 204,
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check (before rate limiting)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks and reset endpoint
    return req.path === '/health' || req.path === '/api/reset-rate-limit';
  }
});
app.use('/api/', limiter);

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
app.use('/api/application-help', applicationHelpRoutes);
app.use('/api/contact', contactRoutes);

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
      console.warn('⚠️  Database connection failed. Server will start but database operations will fail.');
      console.warn('💡 Please make sure:');
      console.warn('   1. MySQL/XAMPP is running');
      console.warn('   2. Database "app_booker_pro" exists');
      console.warn('   3. MySQL is accessible on port 3306');
      console.warn('');
    }

    // Start listening
    app.listen(PORT, () => {
      console.log('\n🚀 ========================================');
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🚀 API: http://localhost:${PORT}`);
      console.log(`🚀 Health: http://localhost:${PORT}/health`);
      if (!dbConnected) {
        console.log('⚠️  WARNING: Database not connected');
      }
      console.log('🚀 ========================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


