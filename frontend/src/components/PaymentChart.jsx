import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import '../styles/PaymentChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PaymentChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Prepare data for yearly aggregation
  const yearlyData = {};
  data.forEach(payment => {
    const year = new Date(payment.date).getFullYear();
    if (!yearlyData[year]) {
      yearlyData[year] = {
        principal: 0,
        interest: 0,
        balance: 0
      };
    }
    yearlyData[year].principal += payment.principal;
    yearlyData[year].interest += payment.interest;
    yearlyData[year].balance = payment.balance;
  });

  const years = Object.keys(yearlyData).sort();

  // Line chart data for balance over time
  const balanceChartData = {
    labels: years,
    datasets: [
      {
        label: 'Remaining Balance',
        data: years.map(year => yearlyData[year].balance),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true
      }
    ]
  };

  // Bar chart data for principal vs interest by year
  const paymentBreakdownData = {
    labels: years,
    datasets: [
      {
        label: 'Principal',
        data: years.map(year => yearlyData[year].principal),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      },
      {
        label: 'Interest',
        data: years.map(year => yearlyData[year].interest),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: $${value.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            });
          }
        }
      }
    }
  };

  const stackedBarOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      x: {
        stacked: true,
      },
      y: {
        ...chartOptions.scales.y,
        stacked: true,
      }
    }
  };

  return (
    <div className="payment-charts">
      <h3>Payment Analysis</h3>

      <div className="charts-grid">
        <div className="chart-container">
          <h4>Loan Balance Over Time</h4>
          <div className="chart-wrapper">
            <Line data={balanceChartData} options={chartOptions} />
          </div>
          <p className="chart-description">
            Shows how your loan balance decreases over the life of the loan.
          </p>
        </div>

        <div className="chart-container">
          <h4>Annual Principal vs Interest</h4>
          <div className="chart-wrapper">
            <Bar data={paymentBreakdownData} options={stackedBarOptions} />
          </div>
          <p className="chart-description">
            Shows the breakdown of how much goes to principal vs interest each year.
            Early payments go mostly to interest, later payments mostly to principal.
          </p>
        </div>
      </div>

      <div className="chart-summary">
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-label">Total Interest:</span>
            <span className="stat-value">
              ${Object.values(yearlyData)
                .reduce((sum, year) => sum + year.interest, 0)
                .toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Principal:</span>
            <span className="stat-value">
              ${Object.values(yearlyData)
                .reduce((sum, year) => sum + year.principal, 0)
                .toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentChart;