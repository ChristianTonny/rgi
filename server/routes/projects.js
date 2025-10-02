const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();

// GET /api/projects - Get all projects
router.get('/', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Projects endpoint - coming soon'
  });
});

module.exports = router;