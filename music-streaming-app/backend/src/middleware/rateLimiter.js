const rateLimit = require('express-rate-limit');

/**
 * Rate Limiting Middleware
 * Protects auth and general API routes against brute-force attacks and abuse.
 */

// Stricter limiter for login and register routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  statusCode: 429
});

// Standard limiter for general API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please slow down.'
  },
  statusCode: 429
});

module.exports = {
  authLimiter,
  apiLimiter
};
