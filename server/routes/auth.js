const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Mock user database (replace with actual database)
const users = [
  {
    id: '1',
    email: 'minister@gov.rw',
    password: '$2b$12$EJ4i2r5H/10DtnDGMxCVMuB4flaTAgFA1K2yXH49g1BVm2Ts6QGrG', // password123
    name: 'Hon. Minister of ICT',
    role: 'MINISTER',
    ministry: 'ICT',
    permissions: ['READ', 'UPDATE'],
    isActive: true
  },
  {
    id: '2',
    email: 'ps@gov.rw',
    password: '$2b$12$EJ4i2r5H/10DtnDGMxCVMuB4flaTAgFA1K2yXH49g1BVm2Ts6QGrG', // password123
    name: 'Permanent Secretary',
    role: 'PERMANENT_SECRETARY',
    ministry: 'Finance',
    permissions: ['READ', 'UPDATE', 'CREATE'],
    isActive: true
  }
];

// Login endpoint
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (req.headers.origin) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.email === email && u.isActive);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        ministry: user.ministry
      },
      process.env.JWT_SECRET || 'rwanda-gov-intelligence-secret-key',
      { expiresIn: '8h' }
    );

    // Update last login (in production, update database)
    user.lastLogin = new Date();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        ministry: user.ministry,
        permissions: user.permissions
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'rwanda-gov-intelligence-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = decoded;
    next();
  });
};

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      ministry: user.ministry,
      department: user.department,
      permissions: user.permissions,
      lastLogin: user.lastLogin
    }
  });
});

// Refresh token
router.post('/refresh', authenticateToken, (req, res) => {
  // Generate new token
  const newToken = jwt.sign(
    { 
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      ministry: req.user.ministry
    },
    process.env.JWT_SECRET || 'rwanda-gov-intelligence-secret-key',
    { expiresIn: '8h' }
  );

  res.json({
    success: true,
    token: newToken
  });
});

// Logout (client-side token invalidation in production would use token blacklist)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;