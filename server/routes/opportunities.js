const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  res.json({ success: true, data: [], message: 'Opportunities endpoint - coming soon' });
});

module.exports = router;