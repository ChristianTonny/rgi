const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
const allowedOrigins = (() => {
  if (process.env.NODE_ENV === 'production') {
    return [process.env.FRONTEND_URL].filter(Boolean)
  }

  const localOrigins = [3000, 3001, 3002, 3003].flatMap((port) => [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ])

  return localOrigins
})()

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true)
    }

    const isAllowed = allowedOrigins.some((allowed) => origin === allowed)

    if (isAllowed) {
      return callback(null, true)
    }

    if (!process.env.FRONTEND_URL && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true)
    }

    return callback(new Error(`CORS blocked from origin: ${origin}`))
  },
  credentials: true,
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/intelligence', require('./routes/intelligence'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/ministries', require('./routes/ministries'));
app.use('/api/opportunities', require('./routes/opportunities'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/search', require('./routes/search'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/catalog', require('./routes/catalog'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }
  
  if (err.type === 'authentication') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid credentials or token'
    });
  }
  
  if (err.type === 'authorization') {
    return res.status(403).json({
      error: 'Authorization Error',
      message: 'Insufficient permissions'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'API endpoint not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

const server = app.listen(PORT, async () => {
  console.log(`🚀 Rwanda Government Intelligence API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Load NISR data on startup
  try {
    const { loadAllNISRData } = require('./utils/nisr-loader');
    const { loadCatalog } = require('./utils/catalog-loader');

    await Promise.all([
      loadAllNISRData(),
      loadCatalog(),
    ]);
  } catch (error) {
    console.error('Failed to load NISR data on startup:', error);
  }
});

module.exports = app;