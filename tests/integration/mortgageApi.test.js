/**
 * Integration Tests for Mortgage Calculator API
 * Tests the complete API endpoint functionality including validation, processing, and responses
 */

const request = require('supertest');
const { standardCases, edgeCases, invalidCases } = require('../fixtures/mortgageTestData');

// Mock the backend server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import middleware and routes
const mortgageRoutes = require('../../backend/src/routes/mortgage');
const { validateMortgageInput } = require('../../backend/src/middleware/validation');

// Create test app
const createTestApp = () => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting (more lenient for tests)
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP'
  });
  app.use('/api/', limiter);

  // Routes
  app.use('/api/mortgage', mortgageRoutes);

  // Error handling middleware
  app.use((error, req, res, next) => {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal server error',
      data: null
    });
  });

  return app;
};

describe('POST /api/mortgage/calculate - Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('Valid Requests', () => {
    test.each(standardCases)('should calculate monthly payment for $name', async ({ input, expected }) => {
      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');

      const { data } = response.body;
      expect(data).toHaveProperty('totalMonthlyPayment');
      expect(data).toHaveProperty('principalAndInterest');
      expect(data).toHaveProperty('breakdown');

      // Verify calculation accuracy (within 1% tolerance)
      expect(data.totalMonthlyPayment).toBeCloseTo(expected.monthlyPITI, 0);
    });

    test('should handle basic mortgage calculation', async () => {
      const input = {
        loanAmount: 300000,
        interestRate: 4.5,
        loanTerm: 30
      };

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalMonthlyPayment).toBeGreaterThan(0);
      expect(response.body.data.principalAndInterest).toBeGreaterThan(0);
    });

    test('should handle mortgage with all optional parameters', async () => {
      const input = {
        loanAmount: 400000,
        interestRate: 5.0,
        loanTerm: 30,
        propertyTax: 5000,
        insurance: 1500,
        pmi: 200,
        hoaFees: 150
      };

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      const { data } = response.body;
      expect(data.propertyTax).toBeCloseTo(5000 / 12, 2);
      expect(data.insurance).toBeCloseTo(1500 / 12, 2);
      expect(data.pmi).toBe(200);
      expect(data.hoaFees).toBe(150);

      // Total should include all components
      const expectedTotal = data.principalAndInterest + data.propertyTax +
                           data.insurance + data.pmi + data.hoaFees;
      expect(data.totalMonthlyPayment).toBeCloseTo(expectedTotal, 2);
    });

    test('should handle zero interest rate', async () => {
      const input = {
        loanAmount: 100000,
        interestRate: 0,
        loanTerm: 10
      };

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      const { data } = response.body;
      expect(data.principalAndInterest).toBeCloseTo(100000 / (10 * 12), 2);
    });
  });

  describe('Validation Tests', () => {
    test.each(invalidCases)('should reject invalid input: $name', async ({ input }) => {
      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
      expect(response.body.data).toBeNull();
    });

    test('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('should reject non-numeric values', async () => {
      const input = {
        loanAmount: 'not-a-number',
        interestRate: 4.5,
        loanTerm: 30
      };

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('number');
    });

    test('should reject values outside allowed ranges', async () => {
      const input = {
        loanAmount: 200000000, // Exceeds max
        interestRate: 4.5,
        loanTerm: 30
      };

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should sanitize and strip unknown fields', async () => {
      const input = {
        loanAmount: 300000,
        interestRate: 4.5,
        loanTerm: 30,
        unknownField: 'should be removed',
        anotherUnknown: 12345
      };

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Verify calculation still works with sanitized input
      expect(response.body.data.totalMonthlyPayment).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send('invalid json')
        .expect(400);
    });

    test('should handle extremely large requests', async () => {
      const largeObject = {
        loanAmount: 300000,
        interestRate: 4.5,
        loanTerm: 30,
        // Add a large string to test payload limits
        largeField: 'x'.repeat(20 * 1024 * 1024) // 20MB
      };

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(largeObject)
        .expect(413); // Payload too large
    });

    test('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/mortgage/calculate')
        .type('text')
        .send('plain text')
        .expect(400);
    });
  });

  describe('Response Format Validation', () => {
    test('should return consistent response structure', async () => {
      const input = standardCases[0].input;

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      // Verify top-level structure
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');

      // Verify data structure
      const { data } = response.body;
      expect(data).toHaveProperty('principalAndInterest');
      expect(data).toHaveProperty('propertyTax');
      expect(data).toHaveProperty('insurance');
      expect(data).toHaveProperty('pmi');
      expect(data).toHaveProperty('hoaFees');
      expect(data).toHaveProperty('totalMonthlyPayment');
      expect(data).toHaveProperty('breakdown');

      // Verify data types
      expect(typeof data.principalAndInterest).toBe('number');
      expect(typeof data.totalMonthlyPayment).toBe('number');
      expect(typeof data.breakdown).toBe('object');
    });

    test('should return proper Content-Type header', async () => {
      const input = standardCases[0].input;

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    test('should include security headers', async () => {
      const input = standardCases[0].input;

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      // Verify security headers from helmet
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('Edge Cases', () => {
    test.each(edgeCases)('should handle edge case: $name', async ({ input, expected }) => {
      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalMonthlyPayment).toBeCloseTo(expected.monthlyPITI, 0);
    });

    test('should handle very small loan amounts', async () => {
      const input = {
        loanAmount: 1000,
        interestRate: 3.0,
        loanTerm: 5
      };

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      expect(response.body.data.totalMonthlyPayment).toBeGreaterThan(0);
      expect(Number.isFinite(response.body.data.totalMonthlyPayment)).toBe(true);
    });

    test('should handle maximum allowed values', async () => {
      const input = {
        loanAmount: 100000000, // 100M
        interestRate: 50,       // 50%
        loanTerm: 50           // 50 years
      };

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      expect(response.body.data.totalMonthlyPayment).toBeGreaterThan(0);
      expect(Number.isFinite(response.body.data.totalMonthlyPayment)).toBe(true);
    });
  });

  describe('Performance Tests', () => {
    test('should respond within acceptable time limits', async () => {
      const input = standardCases[0].input;
      const startTime = Date.now();

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    test('should handle concurrent requests', async () => {
      const input = standardCases[0].input;
      const requests = [];

      // Create 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/mortgage/calculate')
            .send(input)
            .expect(200)
        );
      }

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.totalMonthlyPayment).toBeGreaterThan(0);
      });
    });

    test('should handle rate limiting gracefully', async () => {
      const input = standardCases[0].input;
      const requests = [];

      // Exceed rate limit (1000 requests per minute in test setup)
      for (let i = 0; i < 1200; i++) {
        requests.push(
          request(app)
            .post('/api/mortgage/calculate')
            .send(input)
        );
      }

      const responses = await Promise.allSettled(requests);

      // Some requests should succeed, some should be rate limited
      const successful = responses.filter(r => r.status === 'fulfilled' && r.value.status === 200);
      const rateLimited = responses.filter(r => r.status === 'fulfilled' && r.value.status === 429);

      expect(successful.length).toBeGreaterThan(0);
      expect(rateLimited.length).toBeGreaterThan(0);
    }, 30000); // Increase timeout for this test
  });

  describe('HTTP Method Testing', () => {
    test('should reject GET requests', async () => {
      const response = await request(app)
        .get('/api/mortgage/calculate')
        .expect(404); // Route not found for GET
    });

    test('should reject PUT requests', async () => {
      const response = await request(app)
        .put('/api/mortgage/calculate')
        .send(standardCases[0].input)
        .expect(404);
    });

    test('should reject DELETE requests', async () => {
      const response = await request(app)
        .delete('/api/mortgage/calculate')
        .expect(404);
    });

    test('should handle OPTIONS requests (CORS preflight)', async () => {
      const response = await request(app)
        .options('/api/mortgage/calculate')
        .expect(204); // No content for OPTIONS
    });
  });

  describe('Security Tests', () => {
    test('should prevent XSS in input fields', async () => {
      const input = {
        loanAmount: 300000,
        interestRate: 4.5,
        loanTerm: 30,
        // Try to inject script tag
        propertyTax: '<script>alert("xss")</script>'
      };

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(400); // Should fail validation

      expect(response.body.success).toBe(false);
    });

    test('should handle SQL injection attempts', async () => {
      const input = {
        loanAmount: "300000; DROP TABLE users; --",
        interestRate: 4.5,
        loanTerm: 30
      };

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(400); // Should fail validation

      expect(response.body.success).toBe(false);
    });

    test('should validate input encoding', async () => {
      const input = {
        loanAmount: 300000,
        interestRate: 4.5,
        loanTerm: 30,
        // Test with various encoded characters
        propertyTax: decodeURIComponent('%3Cscript%3Ealert%28%27xss%27%29%3C%2Fscript%3E')
      };

      const response = await request(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(400);
    });
  });
});

describe('Additional Mortgage API Endpoints', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/mortgage/summary', () => {
    test('should return comprehensive loan summary', async () => {
      const input = standardCases[0].input;

      const response = await request(app)
        .post('/api/mortgage/summary')
        .send(input)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('loanDetails');
      expect(response.body.data).toHaveProperty('monthlyPayment');
      expect(response.body.data).toHaveProperty('totals');
      expect(response.body.data).toHaveProperty('percentages');
    });
  });

  describe('POST /api/mortgage/amortization', () => {
    test('should generate amortization schedule', async () => {
      const input = {
        loanAmount: 200000,
        interestRate: 4.0,
        loanTerm: 15
      };

      const response = await request(app)
        .post('/api/mortgage/amortization')
        .send(input)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('schedule');
      expect(response.body.data.schedule).toBeInstanceOf(Array);
      expect(response.body.data.schedule.length).toBe(180); // 15 years * 12 months
    });
  });

  describe('POST /api/mortgage/compare', () => {
    test('should compare multiple loan scenarios', async () => {
      const input = {
        loans: [
          standardCases[0].input,
          standardCases[1].input
        ]
      };

      const response = await request(app)
        .post('/api/mortgage/compare')
        .send(input)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('comparisons');
      expect(response.body.data).toHaveProperty('recommendedLoan');
      expect(response.body.data.comparisons).toHaveLength(2);
    });

    test('should reject comparison with less than 2 loans', async () => {
      const input = {
        loans: [standardCases[0].input]
      };

      const response = await request(app)
        .post('/api/mortgage/compare')
        .send(input)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});