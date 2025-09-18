import React, { useState, useMemo } from 'react';

const AmortizationTable = ({ schedule }) => {
  const [viewMode, setViewMode] = useState('yearly'); // 'monthly' or 'yearly'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const roundToCents = (value) => {
    return Math.round(value * 100) / 100;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(roundToCents(value));
  };

  // Transform backend amortization data to match component format
  const transformedSchedule = useMemo(() => {
    console.log('AmortizationTable received schedule:', schedule);
    if (!schedule?.schedule || !schedule.schedule.length) {
      console.log('Schedule is empty or null');
      return [];
    }
    console.log('First payment in schedule:', schedule.schedule[0]);
    
    return schedule.schedule.map((payment, index) => {
      const transformed = {
        paymentNumber: index + 1,
        monthlyPayment: roundToCents(payment.payment || 0),
        principalPayment: roundToCents(payment.principal || 0),
        interestPayment: roundToCents(payment.interest || 0),
        remainingBalance: index === schedule.schedule.length - 1 ? 0 : roundToCents(payment.balance || 0)
      };
      if (index === 0) console.log('First transformed payment:', transformed);
      return transformed;
    });
  }, [schedule]);

  // Group monthly payments by year for yearly view
  const yearlySchedule = useMemo(() => {
    if (!transformedSchedule.length) return [];

    const years = {};
    transformedSchedule.forEach((payment) => {
      const year = Math.ceil(payment.paymentNumber / 12);
      if (!years[year]) {
        years[year] = {
          year,
          totalPayment: 0,
          totalPrincipal: 0,
          totalInterest: 0,
          remainingBalance: 0,
          payments: [],
        };
      }
      years[year].totalPayment += payment.monthlyPayment;
      years[year].totalPrincipal += payment.principalPayment;
      years[year].totalInterest += payment.interestPayment;
      years[year].remainingBalance = payment.remainingBalance;
      years[year].payments.push(payment);
    });

    return Object.values(years);
  }, [transformedSchedule]);

  const displayData = viewMode === 'yearly' ? yearlySchedule : transformedSchedule;

  // Pagination
  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = displayData.slice(startIndex, endIndex);

  if (!transformedSchedule.length) {
    return (
      <div className="card">
        <h2>Amortization Schedule</h2>
        <p className="text-gray-600">
          Calculate your mortgage to see the amortization schedule.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <h2>Amortization Schedule</h2>
        <div className="flex gap-2 mt-2 md:mt-0">
          <button
            onClick={() => {
              setViewMode('yearly');
              setCurrentPage(1);
            }}
            className={`btn ${viewMode === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Yearly View
          </button>
          <button
            onClick={() => {
              setViewMode('monthly');
              setCurrentPage(1);
            }}
            className={`btn ${viewMode === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Monthly View
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr>
              <th>{viewMode === 'yearly' ? 'Year' : 'Payment #'}</th>
              {viewMode === 'monthly' && <th>Month/Year</th>}
              <th>Payment</th>
              <th>Principal</th>
              <th>Interest</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <tr key={viewMode === 'yearly' ? item.year : item.paymentNumber}>
                <td className="font-semibold">
                  {viewMode === 'yearly' ? item.year : item.paymentNumber}
                </td>
                {viewMode === 'monthly' && (
                  <td className="text-gray-600">
                    {(() => {
                      const startDate = new Date();
                      const paymentDate = new Date(startDate);
                      paymentDate.setMonth(startDate.getMonth() + (item.paymentNumber - 1));
                      return paymentDate.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      });
                    })()}
                  </td>
                )}
                <td>
                  {formatCurrency(
                    viewMode === 'yearly' ? item.totalPayment : item.monthlyPayment
                  )}
                </td>
                <td className="text-green-600">
                  {formatCurrency(
                    viewMode === 'yearly' ? item.totalPrincipal : item.principalPayment
                  )}
                </td>
                <td className="text-red-600">
                  {formatCurrency(
                    viewMode === 'yearly' ? item.totalInterest : item.interestPayment
                  )}
                </td>
                <td className="font-semibold">
                  {formatCurrency(item.remainingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary"
          >
            Previous
          </button>

          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      {/* Summary for entire schedule */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">
          {viewMode === 'yearly' ? 'Yearly' : 'Monthly'} Summary
        </h4>
        <div className="grid grid-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Payments:</span>
            <div className="font-semibold">
              {formatCurrency(
                (viewMode === 'yearly'
                  ? yearlySchedule.reduce((sum, item) => sum + item.totalPayment, 0)
                  : transformedSchedule.reduce((sum, item) => sum + item.monthlyPayment, 0)
                )
              )}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Total Principal:</span>
            <div className="font-semibold text-green-600">
              {formatCurrency(
                (viewMode === 'yearly'
                  ? yearlySchedule.reduce((sum, item) => sum + item.totalPrincipal, 0)
                  : transformedSchedule.reduce((sum, item) => sum + item.principalPayment, 0)
                )
              )}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Total Interest:</span>
            <div className="font-semibold text-red-600">
              {formatCurrency(
                (viewMode === 'yearly'
                  ? yearlySchedule.reduce((sum, item) => sum + item.totalInterest, 0)
                  : transformedSchedule.reduce((sum, item) => sum + item.interestPayment, 0)
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmortizationTable;