import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import MortgageForm from './MortgageForm';
import PaymentResults from './PaymentResults';
import AmortizationTable from './AmortizationTable';
import PaymentChart from './PaymentChart';
import { calculateMortgage } from '../services/mortgageApi';
import '../styles/MortgageCalculator.css';

const MortgageCalculator = () => {
  const [calculationResult, setCalculationResult] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculation = async (formData) => {
    setLoading(true);
    setError(null);
    console.log('Calculation started');
    try {
      const result = await calculateMortgage(formData);
      console.log('Full backend response data:', result);
      if (result && result.payment) {
        console.log('Payment object:', result.payment);
      }
      if (result && result.amortization) {
        console.log('Amortization data:', result.amortization);
      }
      setCalculationResult(result.payment || result);
      setAmortizationSchedule(result.amortization);
    } catch (err) {
      setError('Failed to calculate mortgage. Please try again.');
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetCalculation = () => {
    setCalculationResult(null);
    setAmortizationSchedule(null);
    setError(null);
  };

  return (
    <div className="mortgage-calculator">
      <div className="calculator-grid">
        <div className="form-section">
          <MortgageForm
            onCalculate={handleCalculation}
            onReset={resetCalculation}
            loading={loading}
          />
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {calculationResult && (
          <div className="results-section">
            <PaymentResults result={calculationResult} />

            {amortizationSchedule && amortizationSchedule.length > 0 ? (
              <>
                <PaymentChart data={amortizationSchedule} />
                <AmortizationTable schedule={amortizationSchedule} />
              </>
            ) : (
              <div className="card">
                <p className="text-gray-600">No amortization data available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MortgageCalculator;