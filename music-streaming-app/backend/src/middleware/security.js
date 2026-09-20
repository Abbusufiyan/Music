const helmet = require('helmet');

/**
 * Security Headers Middleware using Helmet
 */
const securityHeaders = helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows audio asset streaming cross-origin
  contentSecurityPolicy: false, // Prevents breaking inline assets in development
  hidePoweredBy: true,
  xssFilter: true,
  noSniff: true
});

module.exports = securityHeaders;
