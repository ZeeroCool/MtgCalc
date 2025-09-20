const { roundToCents, validateNumber } = require('../utils/mathUtils');

class MortgageService {
  /**
   * Calculate monthly mortgage payment (Principal & Interest)
   * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
   */
  calculatePrincipalAndInterest(loanAmount, annualRate, termYears) {
    validateNumber(loanAmount, 'Loan amount');
    validateNumber(annualRate, 'Interest rate');
    validateNumber(termYears, 'Loan term');

    if (annualRate === 0) {
      return roundToCents(loanAmount / (termYears * 12));
    }

    const monthlyRate = annualRate / 100 / 12;
    const numPayments = termYears * 12;
    const monthlyPayment = loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    return roundToCents(monthlyPayment);
  }

  /**
   * Calculate total monthly payment including PITI + other costs
   */
  calculateMonthlyPayment({ loanAmount, interestRate, loanTerm, propertyTax, insurance, pmi, hoaFees }) {
    const principalAndInterest = this.calculatePrincipalAndInterest(loanAmount, interestRate, loanTerm);
    const monthlyPropertyTax = roundToCents((propertyTax || 0) / 12);
    const monthlyInsurance = roundToCents((insurance || 0) / 12);
    const monthlyPMI = roundToCents(pmi || 0);
    const monthlyHOA = roundToCents(hoaFees || 0);

    const totalMonthlyPayment = principalAndInterest + monthlyPropertyTax +
                               monthlyInsurance + monthlyPMI + monthlyHOA;

    return {
      principalAndInterest,
      propertyTax: monthlyPropertyTax,
      insurance: monthlyInsurance,
      pmi: monthlyPMI,
      hoaFees: monthlyHOA,
      totalMonthlyPayment: roundToCents(totalMonthlyPayment),
      breakdown: {
        principal: principalAndInterest,
        interest: 0, // Will be calculated in amortization
        propertyTax: monthlyPropertyTax,
        insurance: monthlyInsurance,
        pmi: monthlyPMI,
        hoaFees: monthlyHOA
      }
    };
  }

  /**
   * Generate complete amortization schedule
   */
  generateAmortizationSchedule({ loanAmount, interestRate, loanTerm }) {
    validateNumber(loanAmount, 'Loan amount');
    validateNumber(interestRate, 'Interest rate');
    validateNumber(loanTerm, 'Loan term');

    const monthlyPayment = this.calculatePrincipalAndInterest(loanAmount, interestRate, loanTerm);
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    let balance = loanAmount;
    const schedule = [];

    for (let paymentNumber = 1; paymentNumber <= numPayments; paymentNumber++) {
      const interestPayment = roundToCents(balance * monthlyRate);
      let principalPayment = roundToCents(monthlyPayment - interestPayment);

      // Handle final payment
      if (paymentNumber === numPayments || principalPayment > balance) {
        principalPayment = balance;
      }

      balance = roundToCents(balance - principalPayment);

      schedule.push({
        paymentNumber,
        paymentAmount: roundToCents(principalPayment + interestPayment),
        principalPayment,
        interestPayment,
        remainingBalance: balance,
        cumulativePrincipal: roundToCents(loanAmount - balance),
        cumulativeInterest: schedule.reduce((sum, p) => sum + p.interestPayment, 0) + interestPayment
      });

      if (balance <= 0) break;
    }

    return schedule;
  }

  /**
   * Calculate Annual Percentage Rate (APR)
   */
  calculateAPR({ loanAmount, interestRate, loanTerm, fees }) {
    validateNumber(loanAmount, 'Loan amount');
    validateNumber(interestRate, 'Interest rate');
    validateNumber(loanTerm, 'Loan term');

    if (!fees || fees === 0) {
      return roundToCents(interestRate);
    }

    // Adjust loan amount by fees for APR calculation
    const adjustedLoanAmount = loanAmount - fees;
    const monthlyPayment = this.calculatePrincipalAndInterest(loanAmount, interestRate, loanTerm);

    // Use Newton-Raphson method to solve for APR
    let apr = interestRate; // Initial guess
    const tolerance = 0.0001;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const monthlyAPR = apr / 100 / 12;
      const numPayments = loanTerm * 12;

      // Present value calculation
      const pv = monthlyPayment * (1 - Math.pow(1 + monthlyAPR, -numPayments)) / monthlyAPR;
      const error = pv - adjustedLoanAmount;

      if (Math.abs(error) < tolerance) {
        break;
      }

      // Derivative for Newton-Raphson
      const derivative = -monthlyPayment * (
        (1 - Math.pow(1 + monthlyAPR, -numPayments)) / Math.pow(monthlyAPR, 2) -
        numPayments * Math.pow(1 + monthlyAPR, -numPayments - 1) / monthlyAPR
      ) / 1200; // Convert to annual percentage

      apr = apr - error / derivative;
    }

    return roundToCents(apr);
  }

  /**
   * Get comprehensive loan summary
   */
  getLoanSummary({ loanAmount, interestRate, loanTerm, propertyTax, insurance, pmi, hoaFees, fees }) {
    const monthlyPayment = this.calculateMonthlyPayment({
      loanAmount, interestRate, loanTerm, propertyTax, insurance, pmi, hoaFees
    });

    const schedule = this.generateAmortizationSchedule({ loanAmount, interestRate, loanTerm });
    const totalInterest = schedule.reduce((sum, payment) => sum + payment.interestPayment, 0);
    const totalPayments = monthlyPayment.totalMonthlyPayment * loanTerm * 12;
    // Sum up the actual P&I payments from the schedule for accuracy
    const totalPrincipalAndInterestPaid = schedule.reduce((sum, p) => sum + p.paymentAmount, 0);

    const apr = this.calculateAPR({ loanAmount, interestRate, loanTerm, fees: fees || 0 });

    return {
      loanDetails: {
        loanAmount,
        interestRate,
        apr,
        loanTerm,
        fees: fees || 0
      },
      monthlyPayment,
      totals: {
        totalPayments: roundToCents(totalPayments),
        totalPayments: roundToCents(totalPrincipalAndInterestPaid),
        totalInterest: roundToCents(totalInterest),
        totalPrincipal: loanAmount,
        totalCost: roundToCents(loanAmount + totalInterest + (fees || 0))
      },
      percentages: {
        interestPercentage: roundToCents((totalInterest / loanAmount) * 100),
        monthlyPaymentToIncome: null // Can be calculated if income provided
      },
      payoffDate: this.calculatePayoffDate(loanTerm),
      firstPaymentBreakdown: schedule[0] || null
    };
  }

  /**
   * Find the best loan from comparison
   */
  findBestLoan(comparisons) {
    return comparisons.reduce((best, current) => {
      const bestCost = best.totals.totalCost;
      const currentCost = current.totals.totalCost;
      return currentCost < bestCost ? current : best;
    });
  }

  /**
   * Calculate payoff date
   */
  calculatePayoffDate(loanTermYears) {
    const today = new Date();
    const payoffDate = new Date(today);
    payoffDate.setFullYear(payoffDate.getFullYear() + loanTermYears);

    return {
      date: payoffDate.toISOString().split('T')[0],
      formattedDate: payoffDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  }
}

module.exports = new MortgageService();