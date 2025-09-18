/**
 * Global error handling middleware
 */
export const errorHandler = (error, req, res, next) => {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = error.details || error.message;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Not Found';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Conflict';
  } else if (error.name === 'RateLimitError') {
    statusCode = 429;
    message = 'Too Many Requests';
  }

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  const errorResponse = {
    error: message,
    message: error.message || message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Add additional details in development
  if (isDevelopment) {
    errorResponse.stack = error.stack;
    errorResponse.details = details;
  }

  // Add request ID if available
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /health',
      'POST /api/calculate',
      'POST /api/amortization',
      'GET /api/rates',
      'GET /api/rates/history',
      'POST /api/validate'
    ]
  });
};