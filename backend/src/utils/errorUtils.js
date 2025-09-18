/**
 * Custom error class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle database errors
 */
const handleDatabaseError = (err) => {
  const message = 'Database operation failed';
  return new AppError(message, 500);
};

/**
 * Handle validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => val.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR:', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

/**
 * Create error response object
 */
const createErrorResponse = (message, statusCode = 500, details = null) => {
  return {
    success: false,
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  };
};

/**
 * Validate if value is a valid number
 */
const validateNumber = (value, fieldName) => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    throw new AppError(`${fieldName} must be a valid number`, 400);
  }
  if (value < 0) {
    throw new AppError(`${fieldName} cannot be negative`, 400);
  }
};

module.exports = {
  AppError,
  handleDatabaseError,
  handleValidationError,
  sendErrorDev,
  sendErrorProd,
  createErrorResponse,
  validateNumber
};