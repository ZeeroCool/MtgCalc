const { AppError } = require('./errorUtils');

/**
 * Round number to 2 decimal places (cents)
 */
const roundToCents = (value) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  return Math.round(value * 100) / 100;
};

/**
 * Round number to specified decimal places
 */
const roundToDecimals = (value, decimals) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Format number as currency
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

/**
 * Format number as percentage
 */
const formatPercentage = (value, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

/**
 * Validate if value is a valid positive number
 */
const validateNumber = (value, fieldName, options = {}) => {
  const { min = 0, max = Infinity, allowZero = true } = options;

  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    throw new AppError(`${fieldName} must be a valid number`, 400);
  }

  if (!allowZero && value === 0) {
    throw new AppError(`${fieldName} cannot be zero`, 400);
  }

  if (value < min) {
    throw new AppError(`${fieldName} cannot be less than ${min}`, 400);
  }

  if (value > max) {
    throw new AppError(`${fieldName} cannot be greater than ${max}`, 400);
  }

  return true;
};

/**
 * Calculate compound interest
 */
const calculateCompoundInterest = (principal, rate, periods, time) => {
  validateNumber(principal, 'Principal');
  validateNumber(rate, 'Interest rate');
  validateNumber(periods, 'Compounding periods');
  validateNumber(time, 'Time');

  const amount = principal * Math.pow(1 + rate / periods, periods * time);
  return roundToCents(amount);
};

/**
 * Calculate present value
 */
const calculatePresentValue = (futureValue, rate, periods) => {
  validateNumber(futureValue, 'Future value');
  validateNumber(rate, 'Interest rate', { allowZero: false });
  validateNumber(periods, 'Number of periods');

  const presentValue = futureValue / Math.pow(1 + rate, periods);
  return roundToCents(presentValue);
};

/**
 * Calculate future value of annuity
 */
const calculateFutureValueAnnuity = (payment, rate, periods) => {
  validateNumber(payment, 'Payment amount');
  validateNumber(rate, 'Interest rate');
  validateNumber(periods, 'Number of periods');

  if (rate === 0) {
    return roundToCents(payment * periods);
  }

  const futureValue = payment * ((Math.pow(1 + rate, periods) - 1) / rate);
  return roundToCents(futureValue);
};

/**
 * Calculate effective annual rate
 */
const calculateEffectiveAnnualRate = (nominalRate, compoundingPeriods) => {
  validateNumber(nominalRate, 'Nominal rate');
  validateNumber(compoundingPeriods, 'Compounding periods', { allowZero: false });

  const effectiveRate = Math.pow(1 + nominalRate / compoundingPeriods, compoundingPeriods) - 1;
  return roundToDecimals(effectiveRate * 100, 4);
};

/**
 * Validate loan parameters
 */
const validateLoanParameters = (loanAmount, interestRate, loanTerm) => {
  validateNumber(loanAmount, 'Loan amount', { min: 1, max: 100000000 });
  validateNumber(interestRate, 'Interest rate', { min: 0, max: 50 });
  validateNumber(loanTerm, 'Loan term', { min: 1, max: 50 });

  return true;
};

/**
 * Calculate percentage change
 */
const calculatePercentageChange = (oldValue, newValue) => {
  validateNumber(oldValue, 'Old value');
  validateNumber(newValue, 'New value');

  if (oldValue === 0) {
    return newValue > 0 ? 100 : 0;
  }

  const change = ((newValue - oldValue) / oldValue) * 100;
  return roundToDecimals(change, 2);
};

/**
 * Calculate payment number for specific balance
 */
const calculatePaymentNumberForBalance = (loanAmount, interestRate, monthlyPayment, targetBalance) => {
  validateNumber(loanAmount, 'Loan amount');
  validateNumber(interestRate, 'Interest rate');
  validateNumber(monthlyPayment, 'Monthly payment');
  validateNumber(targetBalance, 'Target balance');

  if (interestRate === 0) {
    return Math.ceil((loanAmount - targetBalance) / monthlyPayment);
  }

  const monthlyRate = interestRate / 100 / 12;
  const numerator = Math.log(1 + (targetBalance * monthlyRate) / monthlyPayment);
  const denominator = Math.log(1 + monthlyRate);

  return Math.ceil(-numerator / denominator);
};

module.exports = {
  roundToCents,
  roundToDecimals,
  formatCurrency,
  formatPercentage,
  validateNumber,
  calculateCompoundInterest,
  calculatePresentValue,
  calculateFutureValueAnnuity,
  calculateEffectiveAnnualRate,
  validateLoanParameters,
  calculatePercentageChange,
  calculatePaymentNumberForBalance
};