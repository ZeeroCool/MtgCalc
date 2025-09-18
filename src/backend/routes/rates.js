import express from 'express';

const router = express.Router();

/**
 * GET /api/rates
 * Get current interest rates (mock data for demo)
 * In a real application, this would fetch from a financial data API
 */
router.get('/rates', (req, res) => {
  try {
    // Mock interest rate data
    const currentRates = {
      fixed: {
        '15-year': {
          rate: 6.125,
          apr: 6.234,
          points: 0.5,
          lastUpdated: new Date().toISOString()
        },
        '30-year': {
          rate: 6.625,
          apr: 6.798,
          points: 0.5,
          lastUpdated: new Date().toISOString()
        }
      },
      adjustable: {
        '5/1-arm': {
          rate: 5.875,
          apr: 7.234,
          points: 0.25,
          margin: 2.75,
          index: 'SOFR',
          lastUpdated: new Date().toISOString()
        },
        '7/1-arm': {
          rate: 6.125,
          apr: 7.445,
          points: 0.25,
          margin: 2.75,
          index: 'SOFR',
          lastUpdated: new Date().toISOString()
        }
      },
      trends: {
        direction: 'stable',
        change: 0.125,
        period: '30-day',
        forecast: 'Rates expected to remain stable in the near term'
      },
      factors: [
        'Federal Reserve policy decisions',
        'Economic growth indicators',
        'Inflation rates',
        'Housing market conditions'
      ],
      metadata: {
        source: 'Mock Financial Data Provider',
        disclaimer: 'Rates shown are examples for demonstration purposes only',
        lastUpdated: new Date().toISOString(),
        nextUpdate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours from now
      }
    };

    res.json({
      success: true,
      rates: currentRates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Rates fetch error:', error);
    res.status(500).json({
      error: 'Rates Fetch Error',
      message: 'Failed to retrieve current interest rates',
      details: error.message
    });
  }
});

/**
 * GET /api/rates/history
 * Get historical rate data for charting
 */
router.get('/rates/history', (req, res) => {
  try {
    const { period = '30d', type = '30-year' } = req.query;

    // Generate mock historical data
    const generateHistoricalRates = (days, baseRate) => {
      const rates = [];
      const today = new Date();

      for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Add some realistic variation
        const variation = (Math.random() - 0.5) * 0.5; // ±0.25%
        const rate = Math.round((baseRate + variation) * 1000) / 1000;

        rates.push({
          date: date.toISOString().split('T')[0],
          rate: Math.max(3.0, Math.min(10.0, rate)) // Keep within realistic bounds
        });
      }

      return rates;
    };

    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const baseRates = {
      '15-year': 6.125,
      '30-year': 6.625,
      '5/1-arm': 5.875,
      '7/1-arm': 6.125
    };

    const days = periodDays[period] || 30;
    const baseRate = baseRates[type] || 6.625;

    const historicalData = generateHistoricalRates(days, baseRate);

    res.json({
      success: true,
      data: {
        type,
        period,
        rates: historicalData,
        statistics: {
          min: Math.min(...historicalData.map(r => r.rate)),
          max: Math.max(...historicalData.map(r => r.rate)),
          avg: historicalData.reduce((sum, r) => sum + r.rate, 0) / historicalData.length,
          current: historicalData[historicalData.length - 1]?.rate
        }
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'Mock Historical Data',
        disclaimer: 'Historical data shown is simulated for demonstration purposes'
      }
    });
  } catch (error) {
    console.error('Historical rates error:', error);
    res.status(500).json({
      error: 'Historical Data Error',
      message: 'Failed to retrieve historical rate data',
      details: error.message
    });
  }
});

export default router;