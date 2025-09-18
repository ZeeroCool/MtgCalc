/**
 * Test Utilities and Helper Functions
 * Reusable functions for testing mortgage calculator
 */

/**
 * Calculate expected monthly payment using standard mortgage formula
 */
const calculateExpectedPayment = (principal, annualRate, termMonths) => {
  if (annualRate === 0) {
    return principal / termMonths;
  }

  const monthlyRate = annualRate / 100 / 12;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;

  return numerator / denominator;
};

/**
 * Calculate expected APR
 */
const calculateExpectedAPR = (loanAmount, monthlyPayment, termMonths, financeCharges) => {
  const totalCost = (monthlyPayment * termMonths) + financeCharges;
  const totalInterest = totalCost - loanAmount;
  return (totalInterest / loanAmount / (termMonths / 12)) * 100;
};

/**
 * Generate test amortization schedule
 */
const generateExpectedSchedule = (principal, annualRate, termMonths) => {
  const schedule = [];
  let balance = principal;
  const monthlyPayment = calculateExpectedPayment(principal, annualRate, termMonths);
  const monthlyRate = annualRate / 100 / 12;

  for (let month = 1; month <= termMonths && balance > 0.01; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: balance
    });
  }

  return schedule;
};

/**
 * Validate mortgage calculation results
 */
const validateCalculationResults = (results, input, tolerance = 0.01) => {
  const errors = [];

  // Validate monthly payment
  const expectedPayment = calculateExpectedPayment(
    input.loanAmount,
    input.interestRate,
    input.termMonths
  );

  const expectedMonthlyPITI = expectedPayment +
    (input.annualInsurance + input.annualPropertyTax) / 12 +
    input.mortgageInsurance;

  if (Math.abs(results.monthlyPITI - expectedMonthlyPITI) > tolerance) {
    errors.push(`Monthly PITI mismatch: expected ${expectedMonthlyPITI}, got ${results.monthlyPITI}`);
  }

  // Validate total payments
  const expectedTotalPayments = expectedPayment * input.termMonths;
  if (Math.abs(results.totalPayments - expectedTotalPayments) > tolerance * input.termMonths) {
    errors.push(`Total payments mismatch: expected ${expectedTotalPayments}, got ${results.totalPayments}`);
  }

  // Validate total interest
  const expectedTotalInterest = expectedTotalPayments - input.loanAmount;
  if (Math.abs(results.totalInterest - expectedTotalInterest) > tolerance * input.termMonths) {
    errors.push(`Total interest mismatch: expected ${expectedTotalInterest}, got ${results.totalInterest}`);
  }

  // Validate APR is reasonable
  if (results.apr < input.interestRate || results.apr > input.interestRate + 5) {
    errors.push(`APR out of reasonable range: ${results.apr}% (base rate: ${input.interestRate}%)`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create mock API response
 */
const createMockAPIResponse = (input, success = true) => {
  if (!success) {
    return {
      success: false,
      error: 'Calculation failed',
      details: ['Invalid input parameters']
    };
  }

  const monthlyPayment = calculateExpectedPayment(
    input.loanAmount,
    input.interestRate,
    input.termMonths
  );

  const monthlyPITI = monthlyPayment +
    (input.annualInsurance + input.annualPropertyTax) / 12 +
    input.mortgageInsurance;

  const totalPayments = monthlyPayment * input.termMonths;
  const totalInterest = totalPayments - input.loanAmount;
  const apr = calculateExpectedAPR(input.loanAmount, monthlyPayment, input.termMonths, input.financeCharges);

  return {
    success: true,
    data: {
      monthlyPITI: Math.round(monthlyPITI * 100) / 100,
      principalAndInterest: Math.round(monthlyPayment * 100) / 100,
      monthlyInsurance: Math.round((input.annualInsurance / 12) * 100) / 100,
      monthlyPropertyTax: Math.round((input.annualPropertyTax / 12) * 100) / 100,
      monthlyMortgageInsurance: input.mortgageInsurance,
      totalPayments: Math.round(totalPayments * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      apr: Math.round(apr * 100) / 100
    }
  };
};

/**
 * Create mock amortization response
 */
const createMockAmortizationResponse = (input) => {
  const schedule = generateExpectedSchedule(
    input.loanAmount,
    input.interestRate,
    input.termMonths
  );

  const totalPayments = schedule.reduce((sum, payment) => sum + payment.payment, 0);
  const totalInterest = totalPayments - input.loanAmount;

  return {
    success: true,
    data: {
      schedule: schedule.map(payment => ({
        month: payment.month,
        payment: Math.round(payment.payment * 100) / 100,
        principal: Math.round(payment.principal * 100) / 100,
        interest: Math.round(payment.interest * 100) / 100,
        balance: Math.round(payment.balance * 100) / 100
      })),
      summary: {
        totalPayments: Math.round(totalPayments * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100
      }
    }
  };
};

/**
 * Performance testing utilities
 */
const performanceHelpers = {
  /**
   * Measure function execution time
   */
  measureExecutionTime: async (func) => {
    const start = performance.now();
    const result = await func();
    const duration = performance.now() - start;
    return { result, duration };
  },

  /**
   * Run function multiple times and get statistics
   */
  benchmark: async (func, iterations = 100) => {
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await func();
      const duration = performance.now() - start;
      times.push(duration);
    }

    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];

    return {
      average: avg,
      minimum: min,
      maximum: max,
      median: median,
      iterations: iterations,
      times: times
    };
  },

  /**
   * Check if performance meets threshold
   */
  assertPerformance: (duration, threshold, operation) => {
    if (duration > threshold) {
      throw new Error(`Performance threshold exceeded for ${operation}: ${duration}ms > ${threshold}ms`);
    }
  }
};

/**
 * Data generation utilities
 */
const dataGenerators = {
  /**
   * Generate random valid mortgage input
   */
  randomValidInput: () => ({
    loanAmount: Math.floor(Math.random() * 1000000) + 50000, // $50k - $1M
    interestRate: Math.random() * 8 + 2, // 2% - 10%
    termMonths: [180, 240, 300, 360][Math.floor(Math.random() * 4)], // 15, 20, 25, 30 years
    financeCharges: Math.floor(Math.random() * 10000), // $0 - $10k
    annualInsurance: Math.floor(Math.random() * 5000), // $0 - $5k
    annualPropertyTax: Math.floor(Math.random() * 20000), // $0 - $20k
    mortgageInsurance: Math.floor(Math.random() * 500) // $0 - $500
  }),

  /**
   * Generate edge case inputs
   */
  edgeCaseInputs: () => [
    // Minimum values
    {
      loanAmount: 1000,
      interestRate: 0,
      termMonths: 1,
      financeCharges: 0,
      annualInsurance: 0,
      annualPropertyTax: 0,
      mortgageInsurance: 0
    },
    // Maximum reasonable values
    {
      loanAmount: 10000000,
      interestRate: 20,
      termMonths: 600,
      financeCharges: 100000,
      annualInsurance: 50000,
      annualPropertyTax: 200000,
      mortgageInsurance: 2000
    },
    // Zero interest
    {
      loanAmount: 200000,
      interestRate: 0,
      termMonths: 240,
      financeCharges: 5000,
      annualInsurance: 1200,
      annualPropertyTax: 3600,
      mortgageInsurance: 150
    }
  ],

  /**
   * Generate batch of test inputs
   */
  generateBatch: (count = 100) => {
    return Array.from({ length: count }, () => dataGenerators.randomValidInput());
  }
};

/**
 * Assertion helpers
 */
const assertionHelpers = {
  /**
   * Assert number is within tolerance
   */
  assertWithinTolerance: (actual, expected, tolerance, message) => {
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(`${message}: expected ${expected} ± ${tolerance}, got ${actual}`);
    }
  },

  /**
   * Assert all schedule payments sum to total
   */
  assertScheduleIntegrity: (schedule, loanAmount, tolerance = 0.01) => {
    const totalPrincipal = schedule.reduce((sum, payment) => sum + payment.principal, 0);

    if (Math.abs(totalPrincipal - loanAmount) > tolerance) {
      throw new Error(`Schedule integrity check failed: principal sum ${totalPrincipal} != loan amount ${loanAmount}`);
    }

    // Check balance decreases monotonically
    for (let i = 1; i < schedule.length; i++) {
      if (schedule[i].balance > schedule[i - 1].balance) {
        throw new Error(`Balance should decrease: month ${i} balance ${schedule[i].balance} > month ${i - 1} balance ${schedule[i - 1].balance}`);
      }
    }

    // Check final balance is near zero
    const finalBalance = schedule[schedule.length - 1].balance;
    if (finalBalance > tolerance) {
      throw new Error(`Final balance should be near zero: ${finalBalance}`);
    }
  },

  /**
   * Assert API response has required structure
   */
  assertAPIResponseStructure: (response, expectedKeys) => {
    if (!response.success) {
      throw new Error(`API response not successful: ${response.error}`);
    }

    for (const key of expectedKeys) {
      if (!(key in response.data)) {
        throw new Error(`Missing required field in API response: ${key}`);
      }
    }

    // Check all numeric values are finite
    for (const [key, value] of Object.entries(response.data)) {
      if (typeof value === 'number' && !Number.isFinite(value)) {
        throw new Error(`Invalid numeric value for ${key}: ${value}`);
      }
    }
  }
};

module.exports = {
  calculateExpectedPayment,
  calculateExpectedAPR,
  generateExpectedSchedule,
  validateCalculationResults,
  createMockAPIResponse,
  createMockAmortizationResponse,
  performanceHelpers,
  dataGenerators,
  assertionHelpers
};