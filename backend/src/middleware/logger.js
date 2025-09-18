/**
 * Request logging middleware
 */
const logger = (req, res, next) => {
  const start = Date.now();

  // Log request
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}`);

  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields if they exist
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    delete sanitizedBody.apiKey;

    console.log('Request Body:', JSON.stringify(sanitizedBody, null, 2));
  }

  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;

    // Log response
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);

    // Log response body for errors or in development
    if (res.statusCode >= 400 || process.env.NODE_ENV === 'development') {
      try {
        const responseData = typeof data === 'string' ? JSON.parse(data) : data;
        console.log('Response:', JSON.stringify(responseData, null, 2));
      } catch (e) {
        console.log('Response (raw):', data);
      }
    }

    originalSend.call(this, data);
  };

  next();
};

module.exports = logger;