/**
 * Authentication middleware
 * Simple API key validation for demonstration
 */
export const validateApiKey = (req, res, next) => {
  // Skip auth in development mode
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKeys = (process.env.API_KEYS || '').split(',').filter(Boolean);

  // If no API keys are configured, skip validation
  if (validApiKeys.length === 0) {
    return next();
  }

  if (!apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'API key is required',
      code: 'MISSING_API_KEY'
    });
  }

  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key',
      code: 'INVALID_API_KEY'
    });
  }

  // API key is valid
  req.apiKey = apiKey;
  next();
};

/**
 * Rate limiting per API key
 */
export const apiKeyRateLimit = (req, res, next) => {
  // Implementation would go here for per-API-key rate limiting
  // For now, just pass through
  next();
};