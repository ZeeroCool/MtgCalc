const { AppError, handleDatabaseError, handleValidationError } = require('../utils/errorUtils');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error Stack:', err.stack);
  console.error('Error Details:', {
    message: err.message,
    statusCode: err.statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = handleDatabaseError(err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Math errors (division by zero, etc.)
  if (err.name === 'RangeError' || err.message.includes('Invalid number')) {
    const message = 'Invalid calculation parameters';
    error = new AppError(message, 400);
  }

  // Rate limiting errors
  if (err.type === 'entity.too.large') {
    const message = 'Request payload too large';
    error = new AppError(message, 413);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  const errorResponse = {
    success: false,
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: error
    })
  };

  // Add request info in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.request = {
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle async errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound
};