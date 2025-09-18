# Mortgage Calculator Backend API

A robust Node.js/Express backend API for mortgage calculations including monthly payments, amortization schedules, APR calculations, and loan comparisons.

## Features

- **Monthly Payment Calculation**: Calculate PITI (Principal, Interest, Taxes, Insurance) + PMI and HOA fees
- **Amortization Schedule**: Generate complete payment-by-payment breakdown
- **APR Calculation**: Calculate Annual Percentage Rate including fees
- **Loan Comparison**: Compare multiple loan scenarios
- **Input Validation**: Comprehensive validation with detailed error messages
- **Security**: Rate limiting, CORS, helmet security headers
- **Error Handling**: Robust error handling with detailed logging

## API Endpoints

### POST /api/mortgage/calculate
Calculate monthly mortgage payment including all components.

**Request Body:**
```json
{
  "loanAmount": 300000,
  "interestRate": 4.5,
  "loanTerm": 30,
  "propertyTax": 6000,
  "insurance": 1200,
  "pmi": 200,
  "hoaFees": 150
}
```

### POST /api/mortgage/amortization
Generate complete amortization schedule.

**Request Body:**
```json
{
  "loanAmount": 300000,
  "interestRate": 4.5,
  "loanTerm": 30
}
```

### POST /api/mortgage/apr
Calculate Annual Percentage Rate including fees.

**Request Body:**
```json
{
  "loanAmount": 300000,
  "interestRate": 4.5,
  "loanTerm": 30,
  "fees": 5000
}
```

### POST /api/mortgage/summary
Get comprehensive loan summary with all calculations.

### POST /api/mortgage/compare
Compare multiple loan scenarios.

**Request Body:**
```json
{
  "loans": [
    {
      "loanAmount": 300000,
      "interestRate": 4.5,
      "loanTerm": 30,
      "fees": 5000
    },
    {
      "loanAmount": 300000,
      "interestRate": 4.25,
      "loanTerm": 15,
      "fees": 3000
    }
  ]
}
```

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: CORS allowed origins

## Project Structure

```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Custom middleware
│   ├── utils/            # Utility functions
│   └── server.js         # Application entry point
├── tests/                # Test files
└── package.json          # Dependencies
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Security Features

- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Error handling without information leakage

## Financial Formulas

### Monthly Payment Calculation
```
M = P * [r(1+r)^n] / [(1+r)^n - 1]
```
Where:
- M = Monthly payment
- P = Principal loan amount
- r = Monthly interest rate
- n = Total number of payments

### APR Calculation
Uses Newton-Raphson method to solve for the rate that makes the present value of payments equal to the loan amount minus fees.

## Error Handling

All errors return a consistent format:
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Validation Rules

- Loan Amount: $1 - $100,000,000
- Interest Rate: 0% - 50%
- Loan Term: 1 - 50 years
- All optional fields validated when provided

## License

MIT