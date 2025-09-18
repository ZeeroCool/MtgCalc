const Joi = require('joi');
const { AppError } = require('../utils/errorUtils');

// Mortgage input validation schema
const mortgageSchema = Joi.object({
  loanAmount: Joi.number()
    .positive()
    .max(100000000) // 100 million max
    .required()
    .messages({
      'number.base': 'Loan amount must be a number',
      'number.positive': 'Loan amount must be positive',
      'number.max': 'Loan amount cannot exceed $100,000,000',
      'any.required': 'Loan amount is required'
    }),

  interestRate: Joi.number()
    .min(0)
    .max(50)
    .precision(3)
    .required()
    .messages({
      'number.base': 'Interest rate must be a number',
      'number.min': 'Interest rate cannot be negative',
      'number.max': 'Interest rate cannot exceed 50%',
      'any.required': 'Interest rate is required'
    }),

  loanTerm: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .required()
    .messages({
      'number.base': 'Loan term must be a number',
      'number.integer': 'Loan term must be a whole number',
      'number.min': 'Loan term must be at least 1 year',
      'number.max': 'Loan term cannot exceed 50 years',
      'any.required': 'Loan term is required'
    }),

  propertyTax: Joi.number()
    .min(0)
    .max(1000000)
    .optional()
    .messages({
      'number.base': 'Property tax must be a number',
      'number.min': 'Property tax cannot be negative',
      'number.max': 'Property tax seems unreasonably high'
    }),

  insurance: Joi.number()
    .min(0)
    .max(100000)
    .optional()
    .messages({
      'number.base': 'Insurance must be a number',
      'number.min': 'Insurance cannot be negative',
      'number.max': 'Insurance amount seems unreasonably high'
    }),

  pmi: Joi.number()
    .min(0)
    .max(10000)
    .optional()
    .messages({
      'number.base': 'PMI must be a number',
      'number.min': 'PMI cannot be negative',
      'number.max': 'PMI amount seems unreasonably high'
    }),

  hoaFees: Joi.number()
    .min(0)
    .max(10000)
    .optional()
    .messages({
      'number.base': 'HOA fees must be a number',
      'number.min': 'HOA fees cannot be negative',
      'number.max': 'HOA fees seem unreasonably high'
    }),

  fees: Joi.number()
    .min(0)
    .max(100000)
    .optional()
    .messages({
      'number.base': 'Fees must be a number',
      'number.min': 'Fees cannot be negative',
      'number.max': 'Fees seem unreasonably high'
    })
});

// Loan comparison validation schema
const loanComparisonSchema = Joi.object({
  loans: Joi.array()
    .items(mortgageSchema)
    .min(2)
    .max(10)
    .required()
    .messages({
      'array.base': 'Loans must be an array',
      'array.min': 'At least 2 loan scenarios required',
      'array.max': 'Cannot compare more than 10 loan scenarios',
      'any.required': 'Loans array is required'
    })
});

/**
 * Middleware to validate mortgage input
 */
const validateMortgageInput = (req, res, next) => {
  const { error, value } = mortgageSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join('; ');
    return next(new AppError(errorMessage, 400));
  }

  // Replace request body with validated and sanitized data
  req.body = value;
  next();
};

/**
 * Middleware to validate loan comparison input
 */
const validateLoanComparison = (req, res, next) => {
  const { error, value } = loanComparisonSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join('; ');
    return next(new AppError(errorMessage, 400));
  }

  req.body = value;
  next();
};

/**
 * Generic validation middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join('; ');
      return next(new AppError(errorMessage, 400));
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validateMortgageInput,
  validateLoanComparison,
  validate,
  mortgageSchema,
  loanComparisonSchema
};