import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// Mortgage calculation API
export const mortgageAPI = {
  /**
   * Calculate mortgage details
   * @param {Object} params - Mortgage parameters
   * @param {number} params.principal - Loan amount
   * @param {number} params.annualRate - Annual interest rate (as percentage)
   * @param {number} params.years - Loan term in years
   * @returns {Promise<Object>} Mortgage calculation results
   */
  calculate: async (params) => {
    try {
      console.log('mortgageAPI.calculate called with:', params);
      const response = await api.post('/calculate', params);
      console.log('Raw axios response:', response);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to calculate mortgage:', error);
      console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw new Error(`Failed to calculate mortgage: ${error.message}`);
    }
  },

  /**
   * Get amortization schedule
   * @param {Object} params - Mortgage parameters
   * @param {number} params.principal - Loan amount
   * @param {number} params.annualRate - Annual interest rate (as percentage)
   * @param {number} params.years - Loan term in years
   * @returns {Promise<Array>} Amortization schedule
   */
  getAmortizationSchedule: async (params) => {
    try {
  const response = await api.post('/amortization', params);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get amortization schedule: ${error.message}`);
    }
  },

  /**
   * Validate mortgage parameters
   * @param {Object} params - Mortgage parameters to validate
   * @returns {Promise<Object>} Validation results
   */
  validate: async (params) => {
    try {
      const response = await api.post('/mortgage/validate', params);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to validate parameters: ${error.message}`);
    }
  },
};

export default api;