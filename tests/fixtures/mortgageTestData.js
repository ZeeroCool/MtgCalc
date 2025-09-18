/**
 * Test Data Sets for Mortgage Calculator
 * Includes various scenarios, edge cases, and validation data
 */

// Standard mortgage calculation test cases
const standardCases = [
  {
    name: 'Typical 30-year mortgage',
    input: {
      loanAmount: 300000,
      interestRate: 4.5,
      termMonths: 360,
      financeCharges: 3000,
      annualInsurance: 1200,
      annualPropertyTax: 3600,
      mortgageInsurance: 150
    },
    expected: {
      monthlyPITI: 2372.49,
      totalPayments: 853696.4,
      totalInterest: 553696.4,
      apr: 4.73
    }
  },
  {
    name: '15-year mortgage',
    input: {
      loanAmount: 250000,
      interestRate: 3.75,
      termMonths: 180,
      financeCharges: 2500,
      annualInsurance: 1000,
      annualPropertyTax: 3000,
      mortgageInsurance: 0
    },
    expected: {
      monthlyPITI: 2152.78,
      totalPayments: 387500.4,
      totalInterest: 137500.4,
      apr: 4.12
    }
  },
  {
    name: 'High-rate scenario',
    input: {
      loanAmount: 400000,
      interestRate: 7.25,
      termMonths: 360,
      financeCharges: 5000,
      annualInsurance: 1500,
      annualPropertyTax: 4800,
      mortgageInsurance: 200
    },
    expected: {
      monthlyPITI: 3255.42,
      totalPayments: 1171951.2,
      totalInterest: 771951.2,
      apr: 7.63
    }
  }
];

// Edge cases and boundary conditions
const edgeCases = [
  {
    name: 'Minimum loan amount',
    input: {
      loanAmount: 10000,
      interestRate: 3.0,
      termMonths: 60,
      financeCharges: 500,
      annualInsurance: 0,
      annualPropertyTax: 0,
      mortgageInsurance: 0
    },
    expected: {
      monthlyPITI: 179.69,
      totalPayments: 10781.4,
      totalInterest: 781.4,
      apr: 8.77
    }
  },
  {
    name: 'Zero interest rate',
    input: {
      loanAmount: 100000,
      interestRate: 0,
      termMonths: 120,
      financeCharges: 0,
      annualInsurance: 0,
      annualPropertyTax: 0,
      mortgageInsurance: 0
    },
    expected: {
      monthlyPITI: 833.33,
      totalPayments: 100000,
      totalInterest: 0,
      apr: 0
    }
  },
  {
    name: 'Maximum term (50 years)',
    input: {
      loanAmount: 500000,
      interestRate: 5.5,
      termMonths: 600,
      financeCharges: 7500,
      annualInsurance: 2000,
      annualPropertyTax: 6000,
      mortgageInsurance: 250
    },
    expected: {
      monthlyPITI: 3612.50,
      totalPayments: 2167500,
      totalInterest: 1667500,
      apr: 5.84
    }
  }
];

// Invalid input cases for validation testing
const invalidCases = [
  {
    name: 'Negative loan amount',
    input: {
      loanAmount: -100000,
      interestRate: 4.0,
      termMonths: 360,
      financeCharges: 0,
      annualInsurance: 0,
      annualPropertyTax: 0,
      mortgageInsurance: 0
    },
    expectedError: 'Loan amount must be positive'
  },
  {
    name: 'Zero loan amount',
    input: {
      loanAmount: 0,
      interestRate: 4.0,
      termMonths: 360,
      financeCharges: 0,
      annualInsurance: 0,
      annualPropertyTax: 0,
      mortgageInsurance: 0
    },
    expectedError: 'Loan amount must be greater than zero'
  },
  {
    name: 'Negative interest rate',
    input: {
      loanAmount: 200000,
      interestRate: -1.0,
      termMonths: 360,
      financeCharges: 0,
      annualInsurance: 0,
      annualPropertyTax: 0,
      mortgageInsurance: 0
    },
    expectedError: 'Interest rate cannot be negative'
  },
  {
    name: 'Zero term months',
    input: {
      loanAmount: 200000,
      interestRate: 4.0,
      termMonths: 0,
      financeCharges: 0,
      annualInsurance: 0,
      annualPropertyTax: 0,
      mortgageInsurance: 0
    },
    expectedError: 'Term must be at least 1 month'
  },
  {
    name: 'Extremely high interest rate',
    input: {
      loanAmount: 200000,
      interestRate: 50.0,
      termMonths: 360,
      financeCharges: 0,
      annualInsurance: 0,
      annualPropertyTax: 0,
      mortgageInsurance: 0
    },
    expectedError: 'Interest rate seems unusually high'
  }
];

// Performance test cases
const performanceCases = [
  {
    name: 'Large amortization schedule',
    input: {
      loanAmount: 1000000,
      interestRate: 4.0,
      termMonths: 600, // 50 years
      financeCharges: 10000,
      annualInsurance: 3000,
      annualPropertyTax: 12000,
      mortgageInsurance: 500
    }
  },
  {
    name: 'Bulk calculation test',
    batchSize: 1000,
    input: {
      loanAmount: 300000,
      interestRate: 4.5,
      termMonths: 360,
      financeCharges: 3000,
      annualInsurance: 1200,
      annualPropertyTax: 3600,
      mortgageInsurance: 150
    }
  }
];

// API endpoint test data
const apiTestCases = {
  validRequests: [
    {
      method: 'POST',
      endpoint: '/api/mortgage/calculate',
      body: standardCases[0].input,
      expectedStatus: 200
    },
    {
      method: 'POST',
      endpoint: '/api/mortgage/amortization',
      body: standardCases[1].input,
      expectedStatus: 200
    }
  ],
  invalidRequests: [
    {
      method: 'POST',
      endpoint: '/api/mortgage/calculate',
      body: invalidCases[0].input,
      expectedStatus: 400
    },
    {
      method: 'POST',
      endpoint: '/api/mortgage/calculate',
      body: {},
      expectedStatus: 400
    },
    {
      method: 'GET',
      endpoint: '/api/mortgage/calculate',
      expectedStatus: 405
    }
  ]
};

// Frontend component test scenarios
const frontendTestScenarios = [
  {
    name: 'Form validation',
    actions: [
      { type: 'input', field: 'loanAmount', value: '300000' },
      { type: 'input', field: 'interestRate', value: '4.5' },
      { type: 'input', field: 'termMonths', value: '360' },
      { type: 'submit' }
    ],
    expected: {
      formValid: true,
      calculationTriggered: true
    }
  },
  {
    name: 'Invalid input handling',
    actions: [
      { type: 'input', field: 'loanAmount', value: '-100000' },
      { type: 'submit' }
    ],
    expected: {
      formValid: false,
      errorMessage: 'Loan amount must be positive'
    }
  },
  {
    name: 'Results display',
    actions: [
      { type: 'input', field: 'loanAmount', value: '300000' },
      { type: 'input', field: 'interestRate', value: '4.5' },
      { type: 'input', field: 'termMonths', value: '360' },
      { type: 'submit' },
      { type: 'wait', condition: 'resultsVisible' }
    ],
    expected: {
      resultsVisible: true,
      hasAmortizationSchedule: true,
      hasSummary: true
    }
  }
];

module.exports = {
  standardCases,
  edgeCases,
  invalidCases,
  performanceCases,
  apiTestCases,
  frontendTestScenarios
};