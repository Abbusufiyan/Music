const morgan = require('morgan');

/**
 * Request Logging Middleware
 * Logs HTTP method, URL, status code, response time, and timestamp.
 * Protects secrets by omitting request bodies and authorization tokens.
 */
const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms [:date[iso]]');

module.exports = requestLogger;
