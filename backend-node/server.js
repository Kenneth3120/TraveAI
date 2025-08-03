const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const winston = require('winston');
require('dotenv').config();

// Import routes
const itineraryRoutes = require('./routes/itinerary');
const chatRoutes = require('./routes/chat');
const routeRoutes = require('./routes/routes');
const destinationRoutes = require('./routes/destinations');
const vendorRoutes = require('./routes/vendors');
const eventRoutes = require('./routes/events');
const dashboardRoutes = require('./routes/dashboard');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8001;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Configure Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Security middleware
app.use(helmet());

// Rate limiting (more permissive for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // increased limit for development
  message: 'Too many requests from this IP, please try again later.',
  trustProxy: true,
  skip: (req) => {
    // Skip rate limiting for localhost and development
    const clientIp = req.ip || req.connection.remoteAddress;
    return clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('10.');
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection (remove deprecated options)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traveai')
.then(() => {
  logger.info('🗄️  MongoDB connected successfully');
})
.catch((error) => {
  logger.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🙏 Welcome to TraveAI!',
    description: 'Your AI-powered travel companion for exploring incredible India',
    api_docs: '/api/docs',
    version: '1.0.0',
    status: '🚀 Ready for adventure!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/', (req, res) => {
  res.json({
    message: '🌟 TraveAI Backend is running!',
    description: 'Your AI-powered travel companion for exploring India',
    version: '1.0.0',
    features: [
      'AI Itinerary Generation',
      'Smart Chat Assistant', 
      'Route Analysis',
      'Personalized Recommendations',
      'Local Insights',
      'Vendor Collaboration',
      'Event Management'
    ]
  });
});

// Enhanced health check endpoint
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    service: 'TraveAI API',
    version: '1.0.0',
    features: [
      'AI Itinerary Generation',
      'Smart Route Analysis', 
      'Travel Chat Assistant',
      'Vendor Collaboration',
      'Tourism Event Management'
    ],
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    ai_model: 'Gemini 2.0 Flash',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
  
  res.json(healthStatus);
});

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api';
app.use(`${apiPrefix}/itineraries`, itineraryRoutes);
app.use(`${apiPrefix}`, chatRoutes);
app.use(`${apiPrefix}`, routeRoutes);
app.use(`${apiPrefix}/destinations`, destinationRoutes);
app.use(`${apiPrefix}/vendors`, vendorRoutes);
app.use(`${apiPrefix}/events`, eventRoutes);
app.use(`${apiPrefix}`, dashboardRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🌟 TraveAI Backend started successfully!`);
  logger.info(`🚀 Server running on http://0.0.0.0:${PORT}`);
  logger.info(`🤖 AI Models: Gemini 2.0 Flash`);
  logger.info(`🗄️  Database: MongoDB Connected`);
  logger.info(`✅ Ready to help travelers explore India!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 TraveAI Backend shutting down gracefully...');
  mongoose.connection.close(() => {
    logger.info('✅ Database connections closed!');
    process.exit(0);
  });
});

module.exports = app;