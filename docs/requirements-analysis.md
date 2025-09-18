# Mortgage Calculator Web App - Requirements Analysis

## Project Overview
A full-stack reactive mortgage calculator web application that provides comprehensive mortgage calculations including PITI payments, amortization schedules, APR calculations, and responsive UI presentation.

## 1. Functional Requirements

### 1.1 Core Calculation Inputs
**Required Fields:**
- **Loan Amount** (Principal): $1,000 - $10,000,000
- **Interest Rate**: 0.01% - 50% (annual percentage)
- **Loan Term**: 1-480 months (1-40 years)
- **Finance Charges**: $0 - $100,000 (one-time costs)
- **Annual Insurance**: $0 - $50,000 (property insurance)
- **Property Taxes**: $0 - $200,000 (annual)
- **Mortgage Insurance**: $0 - $10,000 (monthly PMI)

### 1.2 Core Calculations
**Monthly PITI Calculation:**
- **P**: Principal and Interest payment
- **I**: Property Insurance (monthly portion)
- **T**: Property Taxes (monthly portion)
- **I**: Mortgage Insurance (PMI)

**Advanced Calculations:**
- **APR**: Annual Percentage Rate including finance charges
- **Amortization Schedule**: Month-by-month breakdown
- **Total Payment Amount**: Sum of all payments over loan term
- **Total Interest Percentage**: Interest as percentage of principal
- **Payment Breakdown**: Principal vs Interest per payment
- **Remaining Balance**: Outstanding balance per month

### 1.3 Output Requirements
**Summary Display:**
- Monthly PITI payment (prominent display)
- APR with finance charges included
- Total amount paid over loan term
- Total interest paid and percentage
- Payoff date

**Detailed Schedule:**
- Monthly amortization table
- Payment number, date, payment amount
- Principal and interest breakdown per payment
- Remaining balance after each payment
- Cumulative interest paid
- Export capabilities (CSV, PDF)

## 2. API Contract Specification

### 2.1 Calculate Endpoint
```typescript
POST /api/calculate
Content-Type: application/json

interface MortgageRequest {
  loanAmount: number;          // Required: 1000-10000000
  interestRate: number;        // Required: 0.01-50 (annual %)
  termMonths: number;          // Required: 1-480
  financeCharges?: number;     // Optional: 0-100000
  annualInsurance?: number;    // Optional: 0-50000
  propertyTaxes?: number;      // Optional: 0-200000
  mortgageInsurance?: number;  // Optional: 0-10000 (monthly)
}

interface MortgageResponse {
  monthlyPITI: number;
  monthlyPI: number;
  monthlyInsurance: number;
  monthlyTaxes: number;
  monthlyMortgageInsurance: number;
  apr: number;
  totalPayments: number;
  totalInterest: number;
  totalInterestPercentage: number;
  payoffDate: string;
  amortizationSchedule: AmortizationEntry[];
}

interface AmortizationEntry {
  paymentNumber: number;
  paymentDate: string;
  paymentAmount: number;
  principalAmount: number;
  interestAmount: number;
  remainingBalance: number;
  cumulativeInterest: number;
}
```

### 2.2 Validation Endpoint
```typescript
POST /api/validate
Content-Type: application/json

interface ValidationResponse {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

## 3. UI/UX Requirements

### 3.1 Responsive Design
**Breakpoints:**
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

**Layout Structure:**
- Header with app title and navigation
- Input form (left panel on desktop, top on mobile)
- Results summary (right panel on desktop, below form on mobile)
- Amortization table (full width, scrollable)
- Footer with disclaimers

### 3.2 Input Form Design
**Form Layout:**
- Logical grouping of related fields
- Clear labels with tooltip explanations
- Input validation with real-time feedback
- Currency formatting for monetary fields
- Percentage formatting for rates
- Slider controls for common values

**Accessibility:**
- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode compatibility
- Focus indicators
- Error announcements

### 3.3 Results Display
**Summary Card:**
- Large, prominent monthly payment display
- Color-coded sections for different components
- Comparison indicators (good/fair/poor APR)
- Quick action buttons (recalculate, save, share)

**Amortization Table:**
- Sortable columns
- Pagination or virtual scrolling
- Search/filter capabilities
- Export functionality
- Mobile-optimized view (stacked layout)

## 4. Validation Rules and Edge Cases

### 4.1 Input Validation
**Loan Amount:**
- Minimum: $1,000 (prevent trivial calculations)
- Maximum: $10,000,000 (reasonable upper bound)
- Must be positive integer

**Interest Rate:**
- Minimum: 0.01% (prevent zero/negative rates)
- Maximum: 50% (reasonable upper bound for edge cases)
- Accept up to 3 decimal places

**Term Months:**
- Minimum: 1 month
- Maximum: 480 months (40 years)
- Must be positive integer

**Optional Fields:**
- Must be non-negative if provided
- Default to 0 if not specified

### 4.2 Edge Cases
**Mathematical Edge Cases:**
- Very low interest rates (near 0%)
- Very high interest rates (above 30%)
- Very short terms (1-12 months)
- Very long terms (above 30 years)
- Large loan amounts (above $1M)

**Business Logic Edge Cases:**
- Finance charges exceeding 10% of loan amount
- Property taxes exceeding loan amount annually
- Insurance costs exceeding monthly payment
- PMI removal scenarios (80% LTV reached)

**Technical Edge Cases:**
- Floating point precision in calculations
- Rounding differences in payment schedules
- Date calculations across leap years
- Timezone handling for payment dates

### 4.3 Error Handling
**User Input Errors:**
- Invalid number formats
- Out of range values
- Missing required fields
- Conflicting parameters

**Calculation Errors:**
- Division by zero scenarios
- Overflow/underflow conditions
- Precision loss warnings
- Impossible payment scenarios

## 5. Technical Specifications

### 5.1 Frontend Technologies
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS or styled-components
- **State Management**: React Context or Zustand
- **Form Handling**: React Hook Form with validation
- **Charts**: Chart.js or Recharts for visualizations
- **Date Handling**: date-fns or dayjs
- **Number Formatting**: Intl.NumberFormat

### 5.2 Backend Technologies
- **Runtime**: Node.js with Express or Fastify
- **Language**: TypeScript
- **Validation**: Joi or Zod
- **Testing**: Jest with Supertest
- **Documentation**: OpenAPI/Swagger
- **Logging**: Winston or Pino

### 5.3 Performance Requirements
- **Initial Load Time**: < 2 seconds
- **Calculation Response**: < 500ms
- **UI Responsiveness**: < 100ms for interactions
- **Bundle Size**: < 500KB gzipped
- **Accessibility**: WCAG 2.1 AA compliance

## 6. Security and Privacy

### 6.1 Data Protection
- No personal financial data storage
- Session-based calculations only
- No tracking of user inputs
- HTTPS enforcement

### 6.2 Input Sanitization
- Strict input validation
- SQL injection prevention
- XSS protection
- CSRF tokens for state-changing operations

## 7. Testing Requirements

### 7.1 Unit Tests
- Mathematical calculation accuracy
- Input validation logic
- Error handling scenarios
- Edge case coverage

### 7.2 Integration Tests
- API endpoint functionality
- Database operations (if applicable)
- Third-party service integration

### 7.3 End-to-End Tests
- Complete user workflows
- Cross-browser compatibility
- Mobile device testing
- Accessibility testing

## 8. Deployment and Infrastructure

### 8.1 Environment Requirements
- Development, staging, and production environments
- CI/CD pipeline with automated testing
- Environment-specific configuration
- Health checks and monitoring

### 8.2 Scalability Considerations
- Stateless application design
- Horizontal scaling capability
- CDN for static assets
- Caching strategies for common calculations

---

This requirements analysis provides the foundation for development team coordination and implementation planning.