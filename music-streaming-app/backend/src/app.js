const express = require('express');
const securityHeaders = require('./middleware/security');
const corsMiddleware = require('./middleware/cors');
const requestLogger = require('./middleware/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// 1. Security HTTP Headers (Helmet)
app.use(securityHeaders);

// 2. CORS configuration
app.use(corsMiddleware);

// 3. Body parser with payload size limit protection
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Sanitized HTTP Request Logging
app.use(requestLogger);

// 5. Global API Rate Limiter
app.use('/api', apiLimiter);

// Root endpoint for health & server check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'StreamWave API is running', version: '1.0.0' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// 6. API Routes
app.use('/api', routes);

// 7. 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// 8. Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
