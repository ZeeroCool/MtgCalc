import React from 'react';

const MortgageSummary = ({ results, inputParams }) => {
  if (!results || !results.payment) return null;

  const formatCurrency = (value) => {
    const safeValue = isNaN(value) || value === undefined || value === null ? 0 : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeValue);
  };

  const formatPercentage = (value) => {
    if (isNaN(value) || value === undefined || value === null) return '-';
    return `${value.toFixed(2)}%`;
  };

  // Use backend response keys from results.payment
  const data = results.payment;
  const principal = data.loanAmount ?? 0;
  const annualRate = inputParams?.annualRate ?? inputParams?.interestRate ?? 0;
  const years = inputParams?.years ?? inputParams?.loanTerm ?? 0;
  const monthlyPayment = data.principalAndInterest ?? 0;
  const totalMonthlyPayment = data.totalMonthlyPayment ?? 0;
  const totalPaid = data.totalPayments ?? 0;
  const totalInterest = data.totalInterest ?? 0;
  const payoffDate = data.payoffDate ?? '';
  const interestPercentage = principal === 0 ? 0 : (totalInterest / principal) * 100;

  return (
    <div className="card">
      <h2>Mortgage Summary</h2>

      {/* Main Payment Info */}
      <div className="grid grid-2 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <h3 className="text-2xl font-bold text-blue-600">
            {formatCurrency(monthlyPayment)}
          </h3>
          <p className="text-gray-600">Monthly Payment (P&I)</p>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <h3 className="text-xl font-bold text-green-600">
            {formatCurrency(principal)}
          </h3>
          <p className="text-gray-600">Loan Amount</p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-2 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Loan Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Principal:</span>
              <span className="font-semibold">{formatCurrency(principal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Interest Rate:</span>
              <span className="font-semibold">{formatPercentage(annualRate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Loan Term:</span>
              <span className="font-semibold">{years} years</span>
            </div>
            <div className="flex justify-between">
              <span>Total Payments:</span>
              <span className="font-semibold">{data.totalPayments ? `${data.totalPayments.toLocaleString()} payments` : `${years * 12} payments`}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Cost Analysis</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Monthly Payment:</span>
              <span className="font-semibold text-blue-600">
                {formatCurrency(totalMonthlyPayment)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount Paid:</span>
              <span className="font-semibold">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Interest:</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(totalInterest)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Interest as % of Principal:</span>
              <span className="font-semibold text-red-600">
                {formatPercentage(interestPercentage)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Key Insights</h4>
        <div className="grid grid-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">
              <strong>Daily Interest Cost:</strong> {formatCurrency(totalInterest / (years * 365))}
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <strong>Interest vs Principal:</strong> You'll pay {formatPercentage(interestPercentage)} in interest
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageSummary;