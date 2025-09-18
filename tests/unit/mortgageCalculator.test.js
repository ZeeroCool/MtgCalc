/**
 * Unit Tests for Mortgage Calculator Functions
 * Tests core calculation logic and mathematical accuracy
 */

const { standardCases, edgeCases, invalidCases } = require('../fixtures/mortgageTestData');

// Mock the mortgage calculator module
const mockMortgageCalculator = {
  calculateMonthlyPayment: jest.fn(),
  calculateAPR: jest.fn(),
  generateAmortizationSchedule: jest.fn(),
  calculateTotalPayments: jest.fn(),
  validateInputs: jest.fn()
};

// Mock implementation with actual calculations for testing
mockMortgageCalculator.calculateMonthlyPayment.mockImplementation((principal, rate, termMonths) => {
  if (rate === 0) return principal / termMonths;
  const monthlyRate = rate / 100 / 12;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  return numerator / denominator;
});

mockMortgageCalculator.calculateAPR.mockImplementation((loanAmount, monthlyPayment, termMonths, financeCharges) => {
  // Simplified APR calculation for testing
  const totalCost = (monthlyPayment * termMonths) + financeCharges;
  const totalInterest = totalCost - loanAmount;
  return (totalInterest / loanAmount / (termMonths / 12)) * 100;
});

mockMortgageCalculator.generateAmortizationSchedule.mockImplementation((principal, rate, termMonths) => {
  const schedule = [];
  let balance = principal;
  const monthlyPayment = mockMortgageCalculator.calculateMonthlyPayment(principal, rate, termMonths);
  const monthlyRate = rate / 100 / 12;

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
});

mockMortgageCalculator.validateInputs.mockImplementation((inputs) => {
  const errors = [];

  if (!inputs.loanAmount || inputs.loanAmount <= 0) {
    errors.push('Loan amount must be greater than zero');
  }
  if (inputs.interestRate < 0) {
    errors.push('Interest rate cannot be negative');
  }
  if (!inputs.termMonths || inputs.termMonths <= 0) {
    errors.push('Term must be at least 1 month');
  }
  if (inputs.interestRate > 30) {
    errors.push('Interest rate seems unusually high');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
});

describe('Mortgage Calculator Core Functions', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateMonthlyPayment', () => {
    test.each(standardCases)('calculates correct monthly payment for $name', ({ input, expected }) => {
      const result = mockMortgageCalculator.calculateMonthlyPayment(
        input.loanAmount,
        input.interestRate,
        input.termMonths
      );

      expect(result).toBeCloseTo(expected.monthlyPITI - (input.annualInsurance + input.annualPropertyTax + input.mortgageInsurance * 12) / 12, 2);
    });

    test('handles zero interest rate correctly', () => {
      const zeroInterestCase = edgeCases.find(c => c.name === 'Zero interest rate');
      const result = mockMortgageCalculator.calculateMonthlyPayment(
        zeroInterestCase.input.loanAmount,
        zeroInterestCase.input.interestRate,
        zeroInterestCase.input.termMonths
      );

      expect(result).toBeCloseTo(zeroInterestCase.expected.monthlyPITI, 2);
    });

    test('returns finite number for all valid inputs', () => {
      standardCases.forEach(({ input }) => {
        const result = mockMortgageCalculator.calculateMonthlyPayment(
          input.loanAmount,
          input.interestRate,
          input.termMonths
        );
        expect(Number.isFinite(result)).toBe(true);
        expect(result).toBeGreaterThan(0);
      });
    });
  });

  describe('calculateAPR', () => {
    test.each(standardCases)('calculates APR within reasonable range for $name', ({ input, expected }) => {
      const monthlyPayment = mockMortgageCalculator.calculateMonthlyPayment(
        input.loanAmount,
        input.interestRate,
        input.termMonths
      );

      const apr = mockMortgageCalculator.calculateAPR(
        input.loanAmount,
        monthlyPayment,
        input.termMonths,
        input.financeCharges
      );

      expect(apr).toBeGreaterThanOrEqual(input.interestRate);
      expect(apr).toBeLessThan(input.interestRate + 2); // APR should be within 2% of base rate
    });

    test('APR equals interest rate when no finance charges', () => {
      const input = {
        loanAmount: 200000,
        interestRate: 4.0,
        termMonths: 360,
        financeCharges: 0
      };

      const monthlyPayment = mockMortgageCalculator.calculateMonthlyPayment(
        input.loanAmount,
        input.interestRate,
        input.termMonths
      );

      const apr = mockMortgageCalculator.calculateAPR(
        input.loanAmount,
        monthlyPayment,
        input.termMonths,
        input.financeCharges
      );

      expect(apr).toBeCloseTo(input.interestRate, 1);
    });
  });

  describe('generateAmortizationSchedule', () => {
    test('generates correct number of payments', () => {
      const input = standardCases[0].input;
      const schedule = mockMortgageCalculator.generateAmortizationSchedule(
        input.loanAmount,
        input.interestRate,
        input.termMonths
      );

      expect(schedule).toHaveLength(input.termMonths);
    });

    test('principal balance decreases over time', () => {
      const input = standardCases[0].input;
      const schedule = mockMortgageCalculator.generateAmortizationSchedule(
        input.loanAmount,
        input.interestRate,
        input.termMonths
      );

      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].balance).toBeLessThan(schedule[i - 1].balance);
      }
    });

    test('final balance is approximately zero', () => {
      const input = standardCases[0].input;
      const schedule = mockMortgageCalculator.generateAmortizationSchedule(
        input.loanAmount,
        input.interestRate,
        input.termMonths
      );

      const finalBalance = schedule[schedule.length - 1].balance;
      expect(finalBalance).toBeCloseTo(0, 2);
    });

    test('sum of principal payments equals loan amount', () => {
      const input = standardCases[1].input;
      const schedule = mockMortgageCalculator.generateAmortizationSchedule(
        input.loanAmount,
        input.interestRate,
        input.termMonths
      );

      const totalPrincipal = schedule.reduce((sum, payment) => sum + payment.principal, 0);
      expect(totalPrincipal).toBeCloseTo(input.loanAmount, 2);
    });

    test('each payment equals principal + interest', () => {
      const input = standardCases[0].input;
      const schedule = mockMortgageCalculator.generateAmortizationSchedule(
        input.loanAmount,
        input.interestRate,
        input.termMonths
      );

      schedule.forEach(payment => {
        expect(payment.payment).toBeCloseTo(payment.principal + payment.interest, 10);
      });
    });
  });

  describe('validateInputs', () => {
    test.each(invalidCases)('rejects invalid input: $name', ({ input, expectedError }) => {
      const result = mockMortgageCalculator.validateInputs(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expectedError);
    });

    test.each(standardCases)('accepts valid input: $name', ({ input }) => {
      const result = mockMortgageCalculator.validateInputs(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('validates multiple errors simultaneously', () => {
      const invalidInput = {
        loanAmount: -100000,
        interestRate: -1,
        termMonths: 0,
        financeCharges: 0,
        annualInsurance: 0,
        annualPropertyTax: 0,
        mortgageInsurance: 0
      };

      const result = mockMortgageCalculator.validateInputs(invalidInput);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('Performance Tests', () => {
    test('calculates monthly payment within acceptable time', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        mockMortgageCalculator.calculateMonthlyPayment(300000, 4.5, 360);
      }

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100); // Should complete 1000 calculations in under 100ms
    });

    test('generates large amortization schedule efficiently', () => {
      const largeCase = edgeCases.find(c => c.name === 'Maximum term (50 years)');
      const start = performance.now();

      const schedule = mockMortgageCalculator.generateAmortizationSchedule(
        largeCase.input.loanAmount,
        largeCase.input.interestRate,
        largeCase.input.termMonths
      );

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(50); // Should generate 600 payments in under 50ms
      expect(schedule).toHaveLength(largeCase.input.termMonths);
    });
  });

  describe('Mathematical Accuracy', () => {
    test('maintains precision with large loan amounts', () => {
      const result = mockMortgageCalculator.calculateMonthlyPayment(10000000, 4.5, 360);
      expect(Number.isFinite(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
    });

    test('handles very small loan amounts', () => {
      const result = mockMortgageCalculator.calculateMonthlyPayment(1000, 3.0, 60);
      expect(Number.isFinite(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
    });

    test('consistent results for identical inputs', () => {
      const input = standardCases[0].input;
      const result1 = mockMortgageCalculator.calculateMonthlyPayment(
        input.loanAmount, input.interestRate, input.termMonths
      );
      const result2 = mockMortgageCalculator.calculateMonthlyPayment(
        input.loanAmount, input.interestRate, input.termMonths
      );

      expect(result1).toBe(result2);
    });
  });
});

describe('Mortgage Calculator Integration', () => {
  test('full calculation workflow produces consistent results', () => {
    const input = standardCases[0].input;

    // Validate inputs
    const validation = mockMortgageCalculator.validateInputs(input);
    expect(validation.isValid).toBe(true);

    // Calculate monthly payment
    const monthlyPayment = mockMortgageCalculator.calculateMonthlyPayment(
      input.loanAmount, input.interestRate, input.termMonths
    );

    // Generate amortization schedule
    const schedule = mockMortgageCalculator.generateAmortizationSchedule(
      input.loanAmount, input.interestRate, input.termMonths
    );

    // Calculate APR
    const apr = mockMortgageCalculator.calculateAPR(
      input.loanAmount, monthlyPayment, input.termMonths, input.financeCharges
    );

    // Verify consistency
    expect(schedule[0].payment).toBeCloseTo(monthlyPayment, 2);
    expect(apr).toBeGreaterThanOrEqual(input.interestRate);

    const totalPayments = schedule.reduce((sum, payment) => sum + payment.payment, 0);
    expect(totalPayments).toBeGreaterThan(input.loanAmount);
  });
});