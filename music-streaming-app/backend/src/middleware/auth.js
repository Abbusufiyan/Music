const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token provided in the Authorization header.
 * Populates req.user with authenticated user information ({ userId, id, username }).
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token missing. Please log in.'
    });
  }

  const secret = process.env.JWT_SECRET || 'supersecretkey';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: err.name === 'TokenExpiredError'
          ? 'Authentication token expired. Please log in again.'
          : 'Invalid authentication token.'
      });
    }

    // Populate req.user consistently with id and userId
    const userId = decoded.userId || decoded.id;
    req.user = {
      ...decoded,
      id: userId,
      userId: userId
    };

    next();
  });
}

module.exports = { authenticateToken };
