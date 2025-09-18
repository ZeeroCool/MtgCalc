import express from 'express';
import Joi from 'joi';
import { MortgageCalculator } from '../services/MortgageCalculator.js';

const router = express.Router();

// Validation schema for mortgage calculation
const mortgageSchema = Joi.object({
  loanAmount: Joi.number().min(1000).max(10000000).required(),
  interestRate: Joi.number().min(0.1).max(30).required(),
  loanTerm: Joi.number().valid(15, 20, 25, 30).required(),
  downPayment: Joi.number().min(0).default(0),
  propertyTax: Joi.number().min(0).default(0),
  insurance: Joi.number().min(0).default(0),
  pmi: Joi.number().min(0).default(0)
});

// Validation middleware
const validateMortgageData = (req, res, next) => {
  const { error, value } = mortgageSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input parameters',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.validatedData = value;
  next();
};

/**
 * POST /api/calculate
 * Calculate mortgage payment and basic loan information
 */
router.post('/calculate', validateMortgageData, async (req, res) => {
  try {
    const calculator = new MortgageCalculator(req.validatedData);
    const results = calculator.calculatePayment();

    res.json({
      success: true,
      payment: results,
      amortization: calculator.generateAmortizationSchedule(),
      metadata: {
        calculatedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Mortgage calculation error:', error);
    res.status(500).json({
      error: 'Calculation Error',
      message: 'Failed to calculate mortgage payment',
      details: error.message
    });
  }
});

/**
 * POST /api/amortization
 * Get detailed amortization schedule
 */
router.post('/amortization', validateMortgageData, async (req, res) => {
  try {
    const calculator = new MortgageCalculator(req.validatedData);
    const schedule = calculator.generateAmortizationSchedule();

    res.json({
      success: true,
      schedule,
      summary: {
        totalPayments: schedule.length,
        totalInterest: schedule.reduce((sum, payment) => sum + payment.interest, 0),
        totalPrincipal: schedule.reduce((sum, payment) => sum + payment.principal, 0)
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        loanDetails: req.validatedData
      }
    });
  } catch (error) {
    console.error('Amortization schedule error:', error);
    res.status(500).json({
      error: 'Schedule Generation Error',
      message: 'Failed to generate amortization schedule',
      details: error.message
    });
  }
});

/**
 * POST /api/validate
 * Validate loan parameters without calculation
 */
router.post('/validate', (req, res) => {
  const { error, value } = mortgageSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      valid: false,
      error: 'Validation Failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }))
    });
  }

  // Additional business logic validation
  const warnings = [];

  if (value.downPayment < value.loanAmount * 0.2) {
    warnings.push({
      field: 'downPayment',
      message: 'Down payment less than 20% may require PMI',
      severity: 'warning'
    });
  }

  if (value.interestRate > 10) {
    warnings.push({
      field: 'interestRate',
      message: 'Interest rate seems unusually high',
      severity: 'warning'
    });
  }

  const loanToValue = ((value.loanAmount - value.downPayment) / value.loanAmount) * 100;
  if (loanToValue > 80) {
    warnings.push({
      field: 'loanToValue',
      message: `High loan-to-value ratio: ${loanToValue.toFixed(1)}%`,
      severity: 'info'
    });
  }

  res.json({
    valid: true,
    data: value,
    warnings,
    metadata: {
      validatedAt: new Date().toISOString(),
      loanToValue: loanToValue.toFixed(2)
    }
  });
});

export default router;