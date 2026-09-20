/**
 * Centralized Error Handling Middleware
 * Ensures consistent error responses and masks internal details in production.
 */
function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || res.statusCode || 500;

  // Log error internally for debugging
  console.error(`[Error] ${req.method} ${req.url} -> Status ${statusCode}:`, isProd ? err.message : err);

  const response = {
    success: false,
    error: isProd && statusCode === 500 ? 'Internal Server Error' : (err.message || 'An unexpected error occurred')
  };

  if (!isProd && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode === 200 ? 500 : statusCode).json(response);
}

module.exports = errorHandler;
