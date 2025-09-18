const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getUpline, getDownline, getProfile } = require('../controllers/userController');

const router = express.Router();

// Apply JWT authentication to all user routes
router.use(authenticateToken);

// GET /api/users/profile
router.get('/profile', getProfile);

// GET /api/users/upline
router.get('/upline', getUpline);

// GET /api/users/downline
router.get('/downline', getDownline);

module.exports = router;