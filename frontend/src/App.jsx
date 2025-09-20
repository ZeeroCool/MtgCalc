


import React, { useState } from 'react';
import { useMortgage } from './hooks/useMortgage';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorAlert from './components/ErrorAlert';
import ImprovedMortgageForm from './components/ImprovedMortgageForm';
import MortgageSummary from './components/MortgageSummary';
import AmortizationTable from './components/AmortizationTable';
import EnhancedPaymentResults from './components/EnhancedPaymentResults';
function App() {
  const [inputParams, setInputParams] = useState(null);
  const {
    isLoading,
    error,
    results,
    amortizationSchedule,
    calculateMortgage,
    clearError,
  } = useMortgage();

  const handleCalculate = async (formData) => {
    try {
      setInputParams(formData);
      const payload = {
        loanAmount: Number(formData.principal),
        interestRate: Number(formData.annualRate),
        loanTerm: Number(formData.years),
        propertyTax: Number(formData.propertyTax) || 0,
        insurance: Number(formData.insurance) || 0,
        pmi: Number(formData.pmi) || 0, // This is monthly
        hoaFees: Number(formData.hoaFees) || 0,
      };
      console.log('Payload sent to calculateMortgage:', payload);
      await calculateMortgage(payload);
    } catch (err) {
      // Error is already handled by the hook
      console.error('Calculation failed:', err);
    }
  };

  return (
    <ErrorBoundary>
      <div className="container">
        <header className="header fade-in">
          <h1 className="text-4xl font-bold mb-2">
            Mortgage Calculator Pro
          </h1>
          <p className="text-lg text-gray-600">
            Calculate your monthly mortgage payments with precision and clarity
          </p>
          <div className="grid grid-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">30+</div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">100K+</div>
              <div className="text-sm text-gray-600">Calculations Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">99.9%</div>
              <div className="text-sm text-gray-600">Accuracy Rate</div>
            </div>
          </div>
        </header>
        <main>
          <ImprovedMortgageForm onSubmit={handleCalculate} isLoading={isLoading} />
          {error && <ErrorAlert message={error} onClose={clearError} />}
          {results && (
            <>
              <MortgageSummary results={results} inputParams={inputParams} />
              <EnhancedPaymentResults results={results} />
              <AmortizationTable schedule={amortizationSchedule} />
            </>
          )}
          {!results && !isLoading && (
            <div className="card mt-8 fade-in">
              <h2 className="text-center mb-6">How It Works</h2>
              <div className="grid grid-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Enter Loan Details</h3>
                  <p className="text-gray-600 text-sm">
                    Input your loan amount, interest rate, and loan term
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">View Results</h3>
                  <p className="text-gray-600 text-sm">
                    See your monthly payment and total cost breakdown
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Explore Schedule</h3>
                  <p className="text-gray-600 text-sm">
                    Review the complete amortization schedule
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
        <footer className="mt-12 text-center text-gray-500 text-sm card">
          <p className="mb-4">
            <strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only.
            Actual loan terms may vary. Please consult with a qualified financial advisor for personalized advice.
          </p>
          <div className="flex justify-center gap-6 text-xs">
            <span>© 2024 Mortgage Calculator Pro</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;