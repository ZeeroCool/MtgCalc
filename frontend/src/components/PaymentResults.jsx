import React from 'react';
import '../styles/PaymentResults.css';

const PaymentResults = ({ results }) => {
  console.log('PaymentResults received:', results);
  const formatCurrency = (amount) => {
    const safeAmount = isNaN(amount) || amount === undefined || amount === null ? 0 : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(safeAmount);
  };

  if (!results || !results.payment) return null;
  const data = results.payment;

  return (
    <div className="payment-results" style={{color: 'black'}}>
      <h2>Payment Summary</h2>

      <div className="results-grid">
        <div className="result-card primary">
          <h3 className="black-text">Monthly Payment (P&I)</h3>
          <div className="amount-large">
            {formatCurrency(data.principalAndInterest)}
          </div>          
          <small className="black-text">Principal & Interest Only</small>
        </div>

        <div className="result-card">
          <h4>Total Monthly Payment (PITI)</h4>
          <div className="amount">
            {formatCurrency(data.totalMonthlyPayment)}
          </div>
          <small>Includes taxes, insurance, PMI, HOA</small>
        </div>

        <div className="result-card">
          <h4>Property Tax</h4>
          <div className="amount">
            {formatCurrency(data.monthlyPropertyTax)}
          </div>
        </div>

        <div className="result-card">
          <h4>Home Insurance</h4>
          <div className="amount">
            {formatCurrency(data.monthlyInsurance)}
          </div>
        </div>

        {data.monthlyPMI > 0 && (
          <div className="result-card">
            <h4>PMI</h4>
            <div className="amount">
              {formatCurrency(data.monthlyPMI)}
            </div>
          </div>
        )}
      </div>

      <div className="loan-summary">
        <h3>Loan Summary</h3>
        <div className="summary-grid">          
          <div className="summary-item">
            <span className="label">Loan Amount:</span>
            <span className="value">{formatCurrency(data.loanAmount)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Total Interest:</span>
            <span className="value">{formatCurrency(data.totalInterest)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Total of Payments:</span>
            <span className="value">{formatCurrency(data.totalPayments)}</span>
          </div>
          <div className="summary-item">
            <span className="label">Payoff Date:</span>
            <span className="value">{data.payoffDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResults;