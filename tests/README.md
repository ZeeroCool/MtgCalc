# Mortgage Calculator Test Suite

Comprehensive test suite ensuring quality, reliability, and performance of the mortgage calculator application.

## Test Structure

```
tests/
├── unit/                    # Unit tests for core calculation logic
├── integration/             # API endpoint and service integration tests
├── frontend/               # React component and UI tests
├── e2e/                    # End-to-end user workflow tests
├── fixtures/               # Test data sets and scenarios
├── utils/                  # Test helpers and utilities
├── coverage/               # Test coverage reports (generated)
├── jest.config.js          # Jest configuration
├── setup.js               # Global test setup
└── package.json           # Test dependencies and scripts
```

## Test Categories

### 1. Unit Tests (`/unit`)
- **Mortgage calculation functions**: Payment, APR, amortization
- **Input validation**: Range checking, type validation
- **Mathematical accuracy**: Precision and formula correctness
- **Edge cases**: Zero interest, extreme values, boundary conditions
- **Performance**: Calculation speed and memory usage

### 2. Integration Tests (`/integration`)
- **API endpoints**: `/api/mortgage/calculate`, `/api/mortgage/amortization`
- **Request/response handling**: Validation, error responses
- **Data flow**: End-to-end data processing
- **Security**: Input sanitization, injection prevention
- **Concurrent requests**: Load handling and race conditions

### 3. Frontend Tests (`/frontend`)
- **React components**: Form rendering, state management
- **User interactions**: Input validation, form submission
- **Results display**: Formatting, chart rendering
- **Responsive design**: Mobile, tablet, desktop layouts
- **Accessibility**: Keyboard navigation, screen readers

### 4. End-to-End Tests (`/e2e`)
- **Complete workflows**: User journeys from input to results
- **Cross-browser compatibility**: Chrome, Firefox, Safari
- **Performance**: Load times, calculation speed
- **Visual regression**: Layout consistency
- **Error recovery**: Network failures, invalid states

## Test Data

### Standard Test Cases
- 30-year conventional mortgage ($300k @ 4.5%)
- 15-year mortgage ($250k @ 3.75%)
- High-rate scenario ($400k @ 7.25%)

### Edge Cases
- Minimum loan amount ($10k)
- Zero interest rate scenarios
- Maximum term (50 years)
- Extreme loan amounts ($10M+)

### Invalid Input Cases
- Negative values
- Non-numeric inputs
- Out-of-range values
- Missing required fields

## Running Tests

### Quick Start
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Test Categories
```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Frontend component tests
npm run test:frontend

# End-to-end tests
npm run test:e2e

# Performance tests
npm run test:performance
```

### Development Workflow
```bash
# Watch mode for development
npm run test:watch

# Continuous integration
npm run test:ci

# Run all test suites
npm run test:all
```

## Coverage Requirements

### Minimum Thresholds
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Coverage Reports
- Console summary during test run
- HTML report: `tests/coverage/lcov-report/index.html`
- LCOV format for CI integration

## Performance Benchmarks

### Unit Test Performance
- 1000 calculations: < 100ms
- Large amortization (600 payments): < 50ms
- Bulk validation (1000 inputs): < 200ms

### API Response Times
- Simple calculation: < 500ms
- Amortization generation: < 1000ms
- Concurrent requests (10): < 2000ms

### Frontend Performance
- Initial render: < 100ms
- Form interaction response: < 50ms
- Results display: < 200ms

## Test Configuration

### Jest Configuration
- Multi-project setup (unit, integration, frontend)
- Custom test environments (node, jsdom)
- Coverage collection and thresholds
- Setup files and global mocks

### Mock Strategy
- API endpoints mocked for frontend tests
- Database operations mocked for unit tests
- External services isolated
- Realistic test data generation

## Accessibility Testing

### WCAG 2.1 Compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast requirements
- Focus management

### Testing Tools
- @testing-library/jest-dom
- Accessibility assertions
- Keyboard navigation simulation
- ARIA attribute validation

## Browser Compatibility

### Supported Browsers
- Chrome 90+ (Chromium-based)
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Testing
- iOS Safari
- Chrome Mobile
- Samsung Internet
- Responsive design validation

## Security Testing

### Input Validation
- SQL injection prevention
- XSS attack mitigation
- Input sanitization
- Type safety validation

### API Security
- Request rate limiting
- Input validation at API level
- Error message information disclosure
- Authentication (if applicable)

## Continuous Integration

### CI Pipeline Integration
```bash
# CI-optimized test run
npm run test:ci

# Includes:
# - All test suites
# - Coverage reporting
# - Performance benchmarks
# - Accessibility checks
```

### Quality Gates
- All tests must pass
- Coverage thresholds met
- Performance benchmarks satisfied
- No accessibility violations

## Test Maintenance

### Adding New Tests
1. Follow existing file structure
2. Use descriptive test names
3. Include edge cases
4. Update test data fixtures
5. Maintain coverage thresholds

### Test Data Management
- Centralized in `/fixtures`
- Versioned test scenarios
- Realistic but anonymized data
- Regular data validation

### Performance Monitoring
- Benchmark trend tracking
- Performance regression detection
- Memory usage monitoring
- CI performance metrics

## Troubleshooting

### Common Issues
- **Tests timing out**: Increase Jest timeout
- **Coverage gaps**: Check excluded files
- **Flaky tests**: Review async operations
- **Mock issues**: Verify mock implementations

### Debug Commands
```bash
# Debug specific test
npm test -- --testNamePattern="specific test"

# Verbose output
npm test -- --verbose

# Update snapshots
npm test -- --updateSnapshot
```

## Contributing

### Test Guidelines
1. Write tests before implementation (TDD)
2. Test one behavior per test case
3. Use descriptive test names
4. Mock external dependencies
5. Follow AAA pattern (Arrange, Act, Assert)

### Code Review Checklist
- [ ] All tests pass
- [ ] Coverage thresholds met
- [ ] Edge cases covered
- [ ] Performance acceptable
- [ ] Accessibility compliant
- [ ] Documentation updated

---

*For questions or issues with the test suite, see the project's main documentation or contact the development team.*