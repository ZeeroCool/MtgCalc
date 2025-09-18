import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Configure axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      throw new Error(data.message || `Server error: ${status}`);
    } else if (error.request) {
      // Network error
      throw new Error('Network error: Unable to connect to server');
    } else {
      // Request setup error
      throw new Error('Request error: ' + error.message);
    }
  }
);

/**
 * Calculate mortgage payment and amortization schedule
 * @param {Object} loanData - Loan parameters
 * @param {number} loanData.loanAmount - Principal loan amount
 * @param {number} loanData.interestRate - Annual interest rate (percentage)
 * @param {number} loanData.loanTerm - Loan term in years
 * @param {number} loanData.downPayment - Down payment amount
 * @param {number} loanData.propertyTax - Annual property tax
 * @param {number} loanData.insurance - Annual home insurance
 * @param {number} loanData.pmi - Monthly PMI
 * @returns {Promise<Object>} Calculation results
 */
export const calculateMortgage = async (loanData) => {
  try {
    console.log('calculateMortgage called with:', loanData);
    const response = await api.post('/calculate', loanData);
    console.log('Raw axios response:', response);
    return response.data;
  } catch (error) {
    console.error('Mortgage calculation failed:', error);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
};

/**
 * Get detailed amortization schedule
 * @param {Object} loanData - Loan parameters
 * @returns {Promise<Array>} Amortization schedule
 */
export const getAmortizationSchedule = async (loanData) => {
  try {
    const response = await api.post('/amortization', loanData);
    return response.data;
  } catch (error) {
    console.error('Amortization schedule failed:', error);
    throw error;
  }
};

/**
 * Get current interest rates (mock data)
 * @returns {Promise<Object>} Current rates
 */
export const getCurrentRates = async () => {
  try {
    const response = await api.get('/rates');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch rates:', error);
    throw error;
  }
};

/**
 * Validate loan parameters
 * @param {Object} loanData - Loan parameters to validate
 * @returns {Promise<Object>} Validation result
 */
export const validateLoanParameters = async (loanData) => {
  try {
    const response = await api.post('/validate', loanData);
    return response.data;
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
};

export default api;