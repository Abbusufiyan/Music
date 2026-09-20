const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin, validateProfileUpdate } = require('../middleware/validate');

// Register (Public, strict auth rate limit, input validation)
router.post('/register', authLimiter, validateRegister, authController.register);

// Login (Public, strict auth rate limit, input validation)
router.post('/login', authLimiter, validateLogin, authController.login);

// Get current user profile (Protected)
router.get('/me', authenticateToken, authController.getMe);

// Update user profile (Protected, input validation)
router.put('/profile', authenticateToken, validateProfileUpdate, authController.updateProfile);

module.exports = router;
