


import React, { useState } from 'react';
import { useMortgage } from './hooks/useMortgage';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorAlert from './components/ErrorAlert';
import MortgageForm from './components/MortgageForm';
import MortgageSummary from './components/MortgageSummary';
import AmortizationTable from './components/AmortizationTable';
import PaymentResults from './components/PaymentResults';
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
        loanAmount: Number(formData.loanAmount ?? formData.principal),
        interestRate: Number(formData.interestRate ?? formData.annualRate),
        loanTerm: Number(formData.loanTerm ?? formData.years),
        propertyTax: Number(formData.propertyTax) || 0,
        insurance: Number(formData.insurance) || 0,
        pmi: Number(formData.pmi) || 0,
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
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Mortgage Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Calculate your monthly mortgage payments and see the complete amortization schedule
          </p>
        </header>
        <main>
          <MortgageForm onSubmit={handleCalculate} isLoading={isLoading} />
          {error && <ErrorAlert message={error} onClose={clearError} />}
          {results && (
            <>
              <MortgageSummary results={results} inputParams={inputParams} />
              <PaymentResults results={results} />
              <AmortizationTable schedule={amortizationSchedule} />
            </>
          )}
          {!results && !isLoading && (
            <div className="card mt-8">
              <h2>How to Use</h2>
              <div className="grid md:grid-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Enter Loan Details</h3>
                  <p className="text-gray-600 text-sm">
                    Input your loan amount, interest rate, and loan term
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">View Results</h3>
                  <p className="text-gray-600 text-sm">
                    See your monthly payment and total cost breakdown
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">3</span>
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
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            This calculator provides estimates for educational purposes.
            Consult with a financial advisor for actual loan terms.
          </p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;