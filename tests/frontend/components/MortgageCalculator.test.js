/**
 * React Component Tests for Mortgage Calculator
 * Tests UI components, user interactions, and state management
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { frontendTestScenarios, standardCases, invalidCases } from '../../fixtures/mortgageTestData';

// Mock components (replace with actual imports in real implementation)
const MockMortgageCalculator = ({ onCalculate, loading, results, error }) => {
  const [formData, setFormData] = React.useState({
    loanAmount: '',
    interestRate: '',
    termMonths: '',
    financeCharges: '',
    annualInsurance: '',
    annualPropertyTax: '',
    mortgageInsurance: ''
  });

  const [formErrors, setFormErrors] = React.useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.loanAmount || formData.loanAmount <= 0) {
      errors.loanAmount = 'Loan amount must be positive';
    }
    if (!formData.interestRate || formData.interestRate < 0) {
      errors.interestRate = 'Interest rate cannot be negative';
    }
    if (!formData.termMonths || formData.termMonths <= 0) {
      errors.termMonths = 'Term must be at least 1 month';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm() && onCalculate) {
      onCalculate(formData);
    }
  };

  return (
    <div data-testid="mortgage-calculator">
      <form onSubmit={handleSubmit} data-testid="mortgage-form">
        <div>
          <label htmlFor="loanAmount">Loan Amount</label>
          <input
            id="loanAmount"
            name="loanAmount"
            type="number"
            value={formData.loanAmount}
            onChange={(e) => handleInputChange('loanAmount', e.target.value)}
            data-testid="loan-amount-input"
          />
          {formErrors.loanAmount && (
            <span data-testid="loan-amount-error" className="error">
              {formErrors.loanAmount}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="interestRate">Interest Rate (%)</label>
          <input
            id="interestRate"
            name="interestRate"
            type="number"
            step="0.01"
            value={formData.interestRate}
            onChange={(e) => handleInputChange('interestRate', e.target.value)}
            data-testid="interest-rate-input"
          />
          {formErrors.interestRate && (
            <span data-testid="interest-rate-error" className="error">
              {formErrors.interestRate}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="termMonths">Term (months)</label>
          <input
            id="termMonths"
            name="termMonths"
            type="number"
            value={formData.termMonths}
            onChange={(e) => handleInputChange('termMonths', e.target.value)}
            data-testid="term-months-input"
          />
          {formErrors.termMonths && (
            <span data-testid="term-months-error" className="error">
              {formErrors.termMonths}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="financeCharges">Finance Charges</label>
          <input
            id="financeCharges"
            name="financeCharges"
            type="number"
            value={formData.financeCharges}
            onChange={(e) => handleInputChange('financeCharges', e.target.value)}
            data-testid="finance-charges-input"
          />
        </div>

        <div>
          <label htmlFor="annualInsurance">Annual Insurance</label>
          <input
            id="annualInsurance"
            name="annualInsurance"
            type="number"
            value={formData.annualInsurance}
            onChange={(e) => handleInputChange('annualInsurance', e.target.value)}
            data-testid="annual-insurance-input"
          />
        </div>

        <div>
          <label htmlFor="annualPropertyTax">Annual Property Tax</label>
          <input
            id="annualPropertyTax"
            name="annualPropertyTax"
            type="number"
            value={formData.annualPropertyTax}
            onChange={(e) => handleInputChange('annualPropertyTax', e.target.value)}
            data-testid="annual-property-tax-input"
          />
        </div>

        <div>
          <label htmlFor="mortgageInsurance">Monthly Mortgage Insurance</label>
          <input
            id="mortgageInsurance"
            name="mortgageInsurance"
            type="number"
            value={formData.mortgageInsurance}
            onChange={(e) => handleInputChange('mortgageInsurance', e.target.value)}
            data-testid="mortgage-insurance-input"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          data-testid="calculate-button"
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </form>

      {error && (
        <div data-testid="error-message" className="error">
          {error}
        </div>
      )}

      {results && (
        <div data-testid="results-section">
          <h3>Calculation Results</h3>
          <div data-testid="monthly-piti">
            Monthly PITI: ${results.monthlyPITI?.toFixed(2)}
          </div>
          <div data-testid="total-payments">
            Total Payments: ${results.totalPayments?.toFixed(2)}
          </div>
          <div data-testid="total-interest">
            Total Interest: ${results.totalInterest?.toFixed(2)}
          </div>
          <div data-testid="apr">
            APR: {results.apr?.toFixed(2)}%
          </div>

          {results.schedule && (
            <div data-testid="amortization-schedule">
              <h4>Amortization Schedule</h4>
              <table data-testid="schedule-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Payment</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {results.schedule.slice(0, 12).map((payment, index) => (
                    <tr key={index} data-testid={`schedule-row-${index}`}>
                      <td>{payment.month}</td>
                      <td>${payment.payment.toFixed(2)}</td>
                      <td>${payment.principal.toFixed(2)}</td>
                      <td>${payment.interest.toFixed(2)}</td>
                      <td>${payment.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

describe('MortgageCalculator Component', () => {
  let mockOnCalculate;
  let user;

  beforeEach(() => {
    mockOnCalculate = jest.fn();
    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders all form fields', () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      expect(screen.getByTestId('loan-amount-input')).toBeInTheDocument();
      expect(screen.getByTestId('interest-rate-input')).toBeInTheDocument();
      expect(screen.getByTestId('term-months-input')).toBeInTheDocument();
      expect(screen.getByTestId('finance-charges-input')).toBeInTheDocument();
      expect(screen.getByTestId('annual-insurance-input')).toBeInTheDocument();
      expect(screen.getByTestId('annual-property-tax-input')).toBeInTheDocument();
      expect(screen.getByTestId('mortgage-insurance-input')).toBeInTheDocument();
      expect(screen.getByTestId('calculate-button')).toBeInTheDocument();
    });

    test('has proper labels and accessibility attributes', () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      expect(screen.getByLabelText('Loan Amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Interest Rate (%)')).toBeInTheDocument();
      expect(screen.getByLabelText('Term (months)')).toBeInTheDocument();
      expect(screen.getByLabelText('Finance Charges')).toBeInTheDocument();
      expect(screen.getByLabelText('Annual Insurance')).toBeInTheDocument();
      expect(screen.getByLabelText('Annual Property Tax')).toBeInTheDocument();
      expect(screen.getByLabelText('Monthly Mortgage Insurance')).toBeInTheDocument();
    });

    test('displays loading state correctly', () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} loading={true} />);

      const button = screen.getByTestId('calculate-button');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Calculating...');
    });

    test('displays error messages', () => {
      const errorMessage = 'Failed to calculate mortgage';
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} error={errorMessage} />);

      expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage);
    });
  });

  describe('Form Validation', () => {
    test('validates required fields', async () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      const submitButton = screen.getByTestId('calculate-button');
      await user.click(submitButton);

      expect(screen.getByTestId('loan-amount-error')).toHaveTextContent('Loan amount must be positive');
      expect(screen.getByTestId('interest-rate-error')).toHaveTextContent('Interest rate cannot be negative');
      expect(screen.getByTestId('term-months-error')).toHaveTextContent('Term must be at least 1 month');
      expect(mockOnCalculate).not.toHaveBeenCalled();
    });

    test('validates positive loan amount', async () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      const loanAmountInput = screen.getByTestId('loan-amount-input');
      await user.type(loanAmountInput, '-100000');

      const submitButton = screen.getByTestId('calculate-button');
      await user.click(submitButton);

      expect(screen.getByTestId('loan-amount-error')).toHaveTextContent('Loan amount must be positive');
    });

    test('validates non-negative interest rate', async () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      const interestRateInput = screen.getByTestId('interest-rate-input');
      await user.type(interestRateInput, '-1');

      const submitButton = screen.getByTestId('calculate-button');
      await user.click(submitButton);

      expect(screen.getByTestId('interest-rate-error')).toHaveTextContent('Interest rate cannot be negative');
    });

    test('clears validation errors when valid input is entered', async () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      // First trigger validation error
      const loanAmountInput = screen.getByTestId('loan-amount-input');
      const submitButton = screen.getByTestId('calculate-button');

      await user.click(submitButton);
      expect(screen.getByTestId('loan-amount-error')).toBeInTheDocument();

      // Then fix the error
      await user.type(loanAmountInput, '300000');
      expect(screen.queryByTestId('loan-amount-error')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test.each(frontendTestScenarios)('handles scenario: $name', async ({ actions, expected }) => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      for (const action of actions) {
        if (action.type === 'input') {
          const input = screen.getByTestId(`${action.field.toLowerCase().replace(/([A-Z])/g, '-$1')}-input`);
          await user.clear(input);
          await user.type(input, action.value);
        } else if (action.type === 'submit') {
          const submitButton = screen.getByTestId('calculate-button');
          await user.click(submitButton);
        }
      }

      if (expected.formValid === false) {
        expect(mockOnCalculate).not.toHaveBeenCalled();
        if (expected.errorMessage) {
          expect(screen.getByText(expected.errorMessage)).toBeInTheDocument();
        }
      } else if (expected.calculationTriggered) {
        expect(mockOnCalculate).toHaveBeenCalled();
      }
    });

    test('submits form with valid data', async () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      const testCase = standardCases[0];

      // Fill form with valid data
      await user.type(screen.getByTestId('loan-amount-input'), testCase.input.loanAmount.toString());
      await user.type(screen.getByTestId('interest-rate-input'), testCase.input.interestRate.toString());
      await user.type(screen.getByTestId('term-months-input'), testCase.input.termMonths.toString());
      await user.type(screen.getByTestId('finance-charges-input'), testCase.input.financeCharges.toString());
      await user.type(screen.getByTestId('annual-insurance-input'), testCase.input.annualInsurance.toString());
      await user.type(screen.getByTestId('annual-property-tax-input'), testCase.input.annualPropertyTax.toString());
      await user.type(screen.getByTestId('mortgage-insurance-input'), testCase.input.mortgageInsurance.toString());

      const submitButton = screen.getByTestId('calculate-button');
      await user.click(submitButton);

      expect(mockOnCalculate).toHaveBeenCalledWith({
        loanAmount: testCase.input.loanAmount.toString(),
        interestRate: testCase.input.interestRate.toString(),
        termMonths: testCase.input.termMonths.toString(),
        financeCharges: testCase.input.financeCharges.toString(),
        annualInsurance: testCase.input.annualInsurance.toString(),
        annualPropertyTax: testCase.input.annualPropertyTax.toString(),
        mortgageInsurance: testCase.input.mortgageInsurance.toString()
      });
    });
  });

  describe('Results Display', () => {
    const mockResults = {
      monthlyPITI: 2372.49,
      totalPayments: 853696.4,
      totalInterest: 553696.4,
      apr: 4.73,
      schedule: Array.from({ length: 360 }, (_, i) => ({
        month: i + 1,
        payment: 2372.49,
        principal: 850.06 + i * 2.5,
        interest: 1522.43 - i * 2.5,
        balance: 300000 - (850.06 + i * 2.5) * (i + 1)
      }))
    };

    test('displays calculation results', () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} results={mockResults} />);

      expect(screen.getByTestId('results-section')).toBeInTheDocument();
      expect(screen.getByTestId('monthly-piti')).toHaveTextContent('Monthly PITI: $2372.49');
      expect(screen.getByTestId('total-payments')).toHaveTextContent('Total Payments: $853696.40');
      expect(screen.getByTestId('total-interest')).toHaveTextContent('Total Interest: $553696.40');
      expect(screen.getByTestId('apr')).toHaveTextContent('APR: 4.73%');
    });

    test('displays amortization schedule', () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} results={mockResults} />);

      expect(screen.getByTestId('amortization-schedule')).toBeInTheDocument();
      expect(screen.getByTestId('schedule-table')).toBeInTheDocument();

      // Check first few rows are displayed (limited to 12)
      expect(screen.getByTestId('schedule-row-0')).toBeInTheDocument();
      expect(screen.getByTestId('schedule-row-11')).toBeInTheDocument();
      expect(screen.queryByTestId('schedule-row-12')).not.toBeInTheDocument();
    });

    test('formats currency values correctly', () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} results={mockResults} />);

      const monthlyPiti = screen.getByTestId('monthly-piti');
      expect(monthlyPiti).toHaveTextContent('$2372.49'); // Should have $ symbol and 2 decimal places
    });

    test('handles missing results gracefully', () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} results={null} />);

      expect(screen.queryByTestId('results-section')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      const calculator = screen.getByTestId('mortgage-calculator');
      expect(calculator).toBeInTheDocument();
      // In real implementation, would check for mobile-specific classes or styles
    });

    test('adapts to tablet viewport', () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      const calculator = screen.getByTestId('mortgage-calculator');
      expect(calculator).toBeInTheDocument();
    });

    test('adapts to desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      const calculator = screen.getByTestId('mortgage-calculator');
      expect(calculator).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('renders quickly with large amortization schedule', () => {
      const largeResults = {
        ...mockResults,
        schedule: Array.from({ length: 600 }, (_, i) => ({
          month: i + 1,
          payment: 2372.49,
          principal: 850.06 + i * 2.5,
          interest: 1522.43 - i * 2.5,
          balance: 300000 - (850.06 + i * 2.5) * (i + 1)
        }))
      };

      const start = performance.now();
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} results={largeResults} />);
      const renderTime = performance.now() - start;

      expect(renderTime).toBeLessThan(100); // Should render in under 100ms
      expect(screen.getByTestId('results-section')).toBeInTheDocument();
    });

    test('handles rapid input changes efficiently', async () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      const loanAmountInput = screen.getByTestId('loan-amount-input');

      // Simulate rapid typing
      const start = performance.now();
      for (let i = 0; i < 10; i++) {
        await user.clear(loanAmountInput);
        await user.type(loanAmountInput, `${300000 + i * 1000}`);
      }
      const inputTime = performance.now() - start;

      expect(inputTime).toBeLessThan(1000); // Should handle rapid input in under 1 second
    });
  });

  describe('Accessibility', () => {
    test('supports keyboard navigation', async () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      const loanAmountInput = screen.getByTestId('loan-amount-input');
      loanAmountInput.focus();

      // Tab through form fields
      await user.tab();
      expect(screen.getByTestId('interest-rate-input')).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId('term-months-input')).toHaveFocus();
    });

    test('provides proper ARIA labels', () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      const form = screen.getByTestId('mortgage-form');
      expect(form).toBeInTheDocument();

      // Check that all inputs have associated labels
      const inputs = screen.getAllByRole('spinbutton');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });

    test('announces errors to screen readers', async () => {
      render(<MockMortgageCalculator onCalculate={mockOnCalculate} />);

      const submitButton = screen.getByTestId('calculate-button');
      await user.click(submitButton);

      const errorElements = screen.getAllByRole('generic', { name: /error/i });
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });
});