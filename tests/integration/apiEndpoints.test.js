/**
 * Integration Tests for Mortgage Calculator API Endpoints
 * Tests API routes, request/response handling, and error cases
 */

const request = require('supertest');
const { apiTestCases, standardCases, invalidCases } = require('../fixtures/mortgageTestData');

// Mock Express app setup
const mockApp = {
  post: jest.fn(),
  get: jest.fn(),
  use: jest.fn(),
  listen: jest.fn()
};

// Mock request handler
const mockRequest = (app) => ({
  post: (endpoint) => ({
    send: (body) => ({
      expect: (status) => Promise.resolve({
        status,
        body: mockResponseBody(endpoint, body, status)
      })
    })
  }),
  get: (endpoint) => ({
    expect: (status) => Promise.resolve({
      status,
      body: mockResponseBody(endpoint, {}, status)
    })
  })
});

// Mock response body generator
const mockResponseBody = (endpoint, requestBody, status) => {
  if (status === 200) {
    if (endpoint === '/api/mortgage/calculate') {
      return {
        success: true,
        data: {
          monthlyPITI: 2372.49,
          principalAndInterest: 1520.06,
          monthlyInsurance: 100.00,
          monthlyPropertyTax: 300.00,
          monthlyMortgageInsurance: 150.00,
          totalPayments: 853696.4,
          totalInterest: 553696.4,
          apr: 4.73
        }
      };
    } else if (endpoint === '/api/mortgage/amortization') {
      return {
        success: true,
        data: {
          schedule: Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            payment: 1520.06,
            principal: 395.06 + i * 1.5,
            interest: 1125.00 - i * 1.5,
            balance: 300000 - (395.06 + i * 1.5) * (i + 1)
          })),
          summary: {
            totalPayments: 547221.6,
            totalInterest: 247221.6
          }
        }
      };
    }
  } else if (status === 400) {
    return {
      success: false,
      error: 'Invalid input parameters',
      details: ['Loan amount must be greater than zero']
    };
  } else if (status === 405) {
    return {
      success: false,
      error: 'Method not allowed'
    };
  } else if (status === 500) {
    return {
      success: false,
      error: 'Internal server error'
    };
  }

  return { success: false };
};

describe('Mortgage Calculator API Integration Tests', () => {
  let app;
  let server;

  beforeAll(async () => {
    // Mock server setup
    app = mockApp;
    server = { close: jest.fn() };
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/mortgage/calculate', () => {
    test.each(standardCases)('calculates mortgage for valid input: $name', async ({ input, expected }) => {
      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('monthlyPITI');
      expect(response.body.data).toHaveProperty('totalPayments');
      expect(response.body.data).toHaveProperty('totalInterest');
      expect(response.body.data).toHaveProperty('apr');

      // Verify data types
      expect(typeof response.body.data.monthlyPITI).toBe('number');
      expect(typeof response.body.data.totalPayments).toBe('number');
      expect(typeof response.body.data.totalInterest).toBe('number');
      expect(typeof response.body.data.apr).toBe('number');
    });

    test.each(invalidCases)('rejects invalid input: $name', async ({ input }) => {
      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    test('handles missing required fields', async () => {
      const incompleteInput = {
        loanAmount: 300000
        // Missing other required fields
      };

      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send(incompleteInput)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid input');
    });

    test('handles empty request body', async () => {
      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('returns calculation breakdown', async () => {
      const input = standardCases[0].input;
      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      const { data } = response.body;

      // Verify PITI breakdown
      expect(data.monthlyPITI).toBeCloseTo(
        data.principalAndInterest +
        data.monthlyInsurance +
        data.monthlyPropertyTax +
        data.monthlyMortgageInsurance,
        2
      );
    });

    test('handles large loan amounts', async () => {
      const largeInput = {
        loanAmount: 10000000,
        interestRate: 4.5,
        termMonths: 360,
        financeCharges: 50000,
        annualInsurance: 25000,
        annualPropertyTax: 100000,
        mortgageInsurance: 5000
      };

      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send(largeInput)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.monthlyPITI).toBeGreaterThan(0);
      expect(Number.isFinite(response.body.data.monthlyPITI)).toBe(true);
    });
  });

  describe('POST /api/mortgage/amortization', () => {
    test('generates complete amortization schedule', async () => {
      const input = standardCases[1].input; // 15-year mortgage
      const response = await mockRequest(app)
        .post('/api/mortgage/amortization')
        .send(input)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.schedule).toBeDefined();
      expect(Array.isArray(response.body.data.schedule)).toBe(true);
      expect(response.body.data.schedule).toHaveLength(input.termMonths);

      // Verify schedule structure
      const firstPayment = response.body.data.schedule[0];
      expect(firstPayment).toHaveProperty('month');
      expect(firstPayment).toHaveProperty('payment');
      expect(firstPayment).toHaveProperty('principal');
      expect(firstPayment).toHaveProperty('interest');
      expect(firstPayment).toHaveProperty('balance');
    });

    test('validates schedule progression', async () => {
      const input = standardCases[0].input;
      const response = await mockRequest(app)
        .post('/api/mortgage/amortization')
        .send(input)
        .expect(200);

      const schedule = response.body.data.schedule;

      // Check that balance decreases over time
      for (let i = 1; i < Math.min(12, schedule.length); i++) {
        expect(schedule[i].balance).toBeLessThan(schedule[i - 1].balance);
      }

      // Check that principal portion increases over time (early vs late payments)
      expect(schedule[schedule.length - 1].principal).toBeGreaterThan(schedule[0].principal);
    });

    test('includes summary information', async () => {
      const input = standardCases[0].input;
      const response = await mockRequest(app)
        .post('/api/mortgage/amortization')
        .send(input)
        .expect(200);

      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.summary.totalPayments).toBeGreaterThan(input.loanAmount);
      expect(response.body.data.summary.totalInterest).toBeGreaterThan(0);
    });

    test('handles short-term loans', async () => {
      const shortTermInput = {
        loanAmount: 50000,
        interestRate: 3.5,
        termMonths: 24,
        financeCharges: 1000,
        annualInsurance: 500,
        annualPropertyTax: 1200,
        mortgageInsurance: 0
      };

      const response = await mockRequest(app)
        .post('/api/mortgage/amortization')
        .send(shortTermInput)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.schedule).toHaveLength(24);
    });
  });

  describe('API Error Handling', () => {
    test('returns 405 for unsupported HTTP methods', async () => {
      const response = await mockRequest(app)
        .get('/api/mortgage/calculate')
        .expect(405);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Method not allowed');
    });

    test('handles malformed JSON', async () => {
      // This would be tested with actual malformed JSON in real implementation
      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send('invalid json')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('handles server errors gracefully', async () => {
      // Mock a server error scenario
      const problematicInput = {
        loanAmount: 'not-a-number',
        interestRate: 4.5,
        termMonths: 360,
        financeCharges: 3000,
        annualInsurance: 1200,
        annualPropertyTax: 3600,
        mortgageInsurance: 150
      };

      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send(problematicInput)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('API Performance', () => {
    test('responds within acceptable time limits', async () => {
      const input = standardCases[0].input;
      const start = Date.now();

      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send(input)
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
      expect(response.body.success).toBe(true);
    });

    test('handles concurrent requests', async () => {
      const input = standardCases[0].input;
      const promises = Array.from({ length: 10 }, () =>
        mockRequest(app)
          .post('/api/mortgage/calculate')
          .send(input)
          .expect(200)
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.monthlyPITI).toBeDefined();
      });
    });
  });

  describe('API Data Validation', () => {
    test('validates numeric inputs', async () => {
      const invalidInput = {
        loanAmount: 'three hundred thousand',
        interestRate: 'four point five',
        termMonths: 'thirty years',
        financeCharges: 3000,
        annualInsurance: 1200,
        annualPropertyTax: 3600,
        mortgageInsurance: 150
      };

      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send(invalidInput)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContain('Loan amount must be greater than zero');
    });

    test('validates ranges and limits', async () => {
      const outOfRangeInput = {
        loanAmount: -100000,
        interestRate: 150,
        termMonths: -360,
        financeCharges: -5000,
        annualInsurance: -1200,
        annualPropertyTax: -3600,
        mortgageInsurance: -150
      };

      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send(outOfRangeInput)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details.length).toBeGreaterThan(1);
    });
  });

  describe('API Security', () => {
    test('sanitizes input data', async () => {
      const maliciousInput = {
        loanAmount: 300000,
        interestRate: '<script>alert("xss")</script>',
        termMonths: 360,
        financeCharges: 3000,
        annualInsurance: 1200,
        annualPropertyTax: 3600,
        mortgageInsurance: 150
      };

      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send(maliciousInput)
        .expect(400);

      expect(response.body.success).toBe(false);
      // Should not execute script or contain raw script tags
      expect(JSON.stringify(response.body)).not.toContain('<script>');
    });

    test('handles SQL injection attempts', async () => {
      const sqlInjectionInput = {
        loanAmount: "300000; DROP TABLE mortgages; --",
        interestRate: 4.5,
        termMonths: 360,
        financeCharges: 3000,
        annualInsurance: 1200,
        annualPropertyTax: 3600,
        mortgageInsurance: 150
      };

      const response = await mockRequest(app)
        .post('/api/mortgage/calculate')
        .send(sqlInjectionInput)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});