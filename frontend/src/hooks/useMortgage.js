import { useState, useCallback } from 'react';
import { mortgageAPI } from '../services/api';

export const useMortgage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);

  const calculateMortgage = useCallback(async (params) => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate basic mortgage info
      const mortgageResults = await mortgageAPI.calculate(params);
      setResults(mortgageResults);

      // Get amortization schedule
      const schedule = await mortgageAPI.getAmortizationSchedule(params);
      setAmortizationSchedule(schedule);

      return { results: mortgageResults, schedule };
    } catch (err) {
      setError(err.message);
      setResults(null);
      setAmortizationSchedule([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setAmortizationSchedule([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    results,
    amortizationSchedule,
    calculateMortgage,
    clearResults,
    clearError,
  };
};