import React from 'react';

const EnhancedPaymentResults = ({ results }) => {
  const formatCurrency = (amount) => {
    const safeAmount = isNaN(amount) || amount === undefined || amount === null ? 0 : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(safeAmount);
  };

  const formatPercentage = (decimal) => {
    return (decimal * 100).toFixed(1) + '%';
  };

  if (!results || !results.payment) return null;

  const data = results.payment;

  // Calculate percentages for pie chart display
  const totalCost = data.totalPayments || 0;
  const principalPercent = totalCost > 0 ? (data.loanAmount / totalCost) : 0;
  const interestPercent = totalCost > 0 ? (data.totalInterest / totalCost) : 0;

  // Calculate monthly breakdown percentages
  const monthlyTotal = data.totalMonthlyPayment || 0;
  const piPercent = monthlyTotal > 0 ? (data.principalAndInterest / monthlyTotal) : 0;
  const taxPercent = monthlyTotal > 0 ? (data.monthlyPropertyTax / monthlyTotal) : 0;
  const insurancePercent = monthlyTotal > 0 ? (data.monthlyInsurance / monthlyTotal) : 0;
  const pmiPercent = monthlyTotal > 0 ? (data.monthlyPMI / monthlyTotal) : 0;

  return (
    <div className="payment-results fade-in" style={{color: 'black'}}>
      {/* Main Payment Cards */}
      <div className="grid grid-2 gap-6 mb-8">
        <div className="card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center'}}>
          <h3 style={{color: 'white', marginBottom: '1rem'}}>Monthly Payment (P&I)</h3>
          <div style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
            {formatCurrency(data.principalAndInterest)}
          </div>
          <small style={{opacity: 0.9}}>Principal & Interest Only</small>
        </div>

        <div className="card" style={{background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', color: 'white', textAlign: 'center'}}>
          <h3 style={{color: 'white', marginBottom: '1rem'}}>Total Monthly (PITI)</h3>
          <div style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
            {formatCurrency(data.totalMonthlyPayment)}
          </div>
          <small style={{opacity: 0.9}}>Including taxes, insurance & PMI</small>
        </div>
      </div>

      {/* Monthly Breakdown Visualization */}
      <div className="card mb-6">
        <h3 className="text-center mb-6">Monthly Payment Breakdown</h3>

        {/* Visual Bar Chart */}
        <div style={{background: '#f7fafc', borderRadius: '1rem', padding: '1rem', marginBottom: '2rem'}}>
          <div style={{display: 'flex', height: '80px', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                width: `${piPercent * 100}%`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              {piPercent > 0.15 && 'P&I'}
            </div>
            {taxPercent > 0 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
                  width: `${taxPercent * 100}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}
              >
                {taxPercent > 0.1 && 'Tax'}
              </div>
            )}
            {insurancePercent > 0 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  width: `${insurancePercent * 100}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}
              >
                {insurancePercent > 0.08 && 'Ins'}
              </div>
            )}
            {pmiPercent > 0 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                  width: `${pmiPercent * 100}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.875rem'
                }}
              >
                {pmiPercent > 0.08 && 'PMI'}
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Details */}
        <div className="grid grid-2 gap-4">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div style={{width: '12px', height: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%'}}></div>
              <span className="font-medium">Principal & Interest</span>
            </div>
            <div>
              <div className="font-bold">{formatCurrency(data.principalAndInterest)}</div>
              <div className="text-sm text-gray-600">{formatPercentage(piPercent)}</div>
            </div>
          </div>

          {data.monthlyPropertyTax > 0 && (
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div style={{width: '12px', height: '12px', background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)', borderRadius: '50%'}}></div>
                <span className="font-medium">Property Tax</span>
              </div>
              <div>
                <div className="font-bold">{formatCurrency(data.monthlyPropertyTax)}</div>
                <div className="text-sm text-gray-600">{formatPercentage(taxPercent)}</div>
              </div>
            </div>
          )}

          {data.monthlyInsurance > 0 && (
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div style={{width: '12px', height: '12px', background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', borderRadius: '50%'}}></div>
                <span className="font-medium">Home Insurance</span>
              </div>
              <div>
                <div className="font-bold">{formatCurrency(data.monthlyInsurance)}</div>
                <div className="text-sm text-gray-600">{formatPercentage(insurancePercent)}</div>
              </div>
            </div>
          )}

          {data.monthlyPMI > 0 && (
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div style={{width: '12px', height: '12px', background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)', borderRadius: '50%'}}></div>
                <span className="font-medium">PMI</span>
              </div>
              <div>
                <div className="font-bold">{formatCurrency(data.monthlyPMI)}</div>
                <div className="text-sm text-gray-600">{formatPercentage(pmiPercent)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loan Summary with Charts */}
      <div className="grid grid-2 gap-6">
        {/* Principal vs Interest Chart */}
        <div className="card">
          <h3 className="text-center mb-4">Principal vs Interest</h3>
          <div style={{position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{position: 'relative', width: '160px', height: '160px'}}>
              <svg width="160" height="160" style={{transform: 'rotate(-90deg)'}}>
                <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="20"/>
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke="url(#gradient1)"
                  strokeWidth="20"
                  strokeDasharray={`${principalPercent * 440} 440`}
                  style={{transition: 'stroke-dasharray 1s ease-in-out'}}
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor: '#667eea'}} />
                    <stop offset="100%" style={{stopColor: '#764ba2'}} />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center'}}>
                <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea'}}>
                  {formatPercentage(principalPercent)}
                </div>
                <div style={{fontSize: '0.75rem', color: '#718096'}}>Principal</div>
              </div>
            </div>
          </div>
          <div className="grid grid-2 gap-4 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div style={{width: '12px', height: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%'}}></div>
                <span className="text-sm font-medium">Principal</span>
              </div>
              <div className="font-bold">{formatCurrency(data.loanAmount)}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div style={{width: '12px', height: '12px', background: '#e2e8f0', borderRadius: '50%'}}></div>
                <span className="text-sm font-medium">Interest</span>
              </div>
              <div className="font-bold text-red-600">{formatCurrency(data.totalInterest)}</div>
            </div>
          </div>
        </div>

        {/* Loan Summary Details */}
        <div className="card">
          <h3 className="mb-4">Loan Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <span className="font-medium">Loan Amount</span>
              <span className="font-bold text-lg">{formatCurrency(data.loanAmount)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
              <span className="font-medium">Total Interest</span>
              <span className="font-bold text-lg text-red-600">{formatCurrency(data.totalInterest)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
              <span className="font-medium">Total Payments</span>
              <span className="font-bold text-lg">{formatCurrency(data.totalPayments)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <span className="font-medium">Payoff Date</span>
              <span className="font-bold text-lg">{data.payoffDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPaymentResults;