/**
 * Mortgage Calculator Service
 * Handles all mortgage calculation logic including payment calculations
 * and amortization schedule generation
 */
export class MortgageCalculator {
  constructor(params) {
    this.loanAmount = params.loanAmount;
    this.interestRate = params.interestRate;
    this.loanTerm = params.loanTerm;
    this.downPayment = params.downPayment || 0;
    this.propertyTax = params.propertyTax || 0;
    this.insurance = params.insurance || 0;
    this.pmi = params.pmi || 0;

    // Calculate principal (loan amount after down payment)
    this.principal = this.loanAmount - this.downPayment;

    // Convert annual rate to monthly decimal
    this.monthlyRate = (this.interestRate / 100) / 12;

    // Total number of payments
    this.totalPayments = this.loanTerm * 12;

    this.validateInputs();
  }

  validateInputs() {
    if (this.principal <= 0) {
      throw new Error('Principal amount must be greater than 0');
    }
    if (this.interestRate <= 0) {
      throw new Error('Interest rate must be greater than 0');
    }
    if (this.loanTerm <= 0) {
      throw new Error('Loan term must be greater than 0');
    }
    if (this.downPayment > this.loanAmount) {
      throw new Error('Down payment cannot exceed loan amount');
    }
  }

  /**
   * Calculate monthly principal and interest payment
   * Formula: M = P[r(1+r)^n]/[(1+r)^n-1]
   * Where:
   * M = Monthly payment
   * P = Principal loan amount
   * r = Monthly interest rate
   * n = Total number of payments
   */
  calculatePrincipalAndInterest() {
    if (this.monthlyRate === 0) {
      // No interest loan
      return this.principal / this.totalPayments;
    }

    const monthlyRateCompounded = Math.pow(1 + this.monthlyRate, this.totalPayments);
    const monthlyPayment = this.principal *
      (this.monthlyRate * monthlyRateCompounded) /
      (monthlyRateCompounded - 1);

    return Math.round(monthlyPayment * 100) / 100;
  }

  /**
   * Calculate complete payment breakdown
   */
  calculatePayment() {
    const principalAndInterest = this.calculatePrincipalAndInterest();
    const monthlyPropertyTax = this.propertyTax / 12;
    const monthlyInsurance = this.insurance / 12;
    const monthlyPMI = this.pmi;

    const totalMonthlyPayment = principalAndInterest +
      monthlyPropertyTax + monthlyInsurance + monthlyPMI;

    // Calculate total interest over life of loan
    const totalPayments = principalAndInterest * this.totalPayments;
    const totalInterest = totalPayments - this.principal;

    // Calculate payoff date
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + this.totalPayments);

    return {
      principalAndInterest: Math.round(principalAndInterest * 100) / 100,
      monthlyPropertyTax: Math.round(monthlyPropertyTax * 100) / 100,
      monthlyInsurance: Math.round(monthlyInsurance * 100) / 100,
      monthlyPMI: Math.round(monthlyPMI * 100) / 100,
      totalMonthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,
      loanAmount: this.principal,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayments: Math.round(totalPayments * 100) / 100,
      payoffDate: payoffDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      })
    };
  }

  /**
   * Generate complete amortization schedule
   */
  generateAmortizationSchedule() {
    const monthlyPayment = this.calculatePrincipalAndInterest();
    let remainingBalance = this.principal;
    const schedule = [];
    const startDate = new Date();

    for (let paymentNumber = 1; paymentNumber <= this.totalPayments; paymentNumber++) {
      // Calculate interest for this payment
      const interestPayment = remainingBalance * this.monthlyRate;

      // Calculate principal for this payment
      let principalPayment = monthlyPayment - interestPayment;

      // Handle final payment adjustment
      if (principalPayment > remainingBalance) {
        principalPayment = remainingBalance;
      }

      // Update remaining balance
      remainingBalance = Math.max(0, remainingBalance - principalPayment);

      // Calculate payment date
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + paymentNumber);

      schedule.push({
        paymentNumber,
        date: paymentDate.toISOString().split('T')[0],
        payment: Math.round(monthlyPayment * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        balance: Math.round(remainingBalance * 100) / 100,
        cumulativePrincipal: Math.round((this.principal - remainingBalance) * 100) / 100,
        cumulativeInterest: Math.round(
          schedule.reduce((sum, p) => sum + p.interest, 0) + interestPayment
        ) / 100
      });

      // Break if loan is paid off
      if (remainingBalance <= 0.01) {
        break;
      }
    }

    return schedule;
  }

  /**
   * Calculate payment for different loan amounts (for comparison)
   */
  calculatePaymentComparison(amounts) {
    const currentAmount = this.loanAmount;
    const results = {};

    amounts.forEach(amount => {
      this.loanAmount = amount;
      this.principal = amount - this.downPayment;

      try {
        results[amount] = this.calculatePayment();
      } catch (error) {
        results[amount] = { error: error.message };
      }
    });

    // Restore original amount
    this.loanAmount = currentAmount;
    this.principal = currentAmount - this.downPayment;

    return results;
  }

  /**
   * Calculate total interest saved with extra payments
   */
  calculateExtraPaymentImpact(extraMonthlyPayment) {
    const standardSchedule = this.generateAmortizationSchedule();
    const standardTotalInterest = standardSchedule.reduce(
      (sum, payment) => sum + payment.interest, 0
    );

    // Calculate with extra payments
    const monthlyPayment = this.calculatePrincipalAndInterest() + extraMonthlyPayment;
    let remainingBalance = this.principal;
    let totalInterestWithExtra = 0;
    let paymentsWithExtra = 0;

    while (remainingBalance > 0.01 && paymentsWithExtra < this.totalPayments) {
      const interestPayment = remainingBalance * this.monthlyRate;
      let principalPayment = monthlyPayment - interestPayment;

      if (principalPayment > remainingBalance) {
        principalPayment = remainingBalance;
      }

      totalInterestWithExtra += interestPayment;
      remainingBalance -= principalPayment;
      paymentsWithExtra++;
    }

    const interestSaved = standardTotalInterest - totalInterestWithExtra;
    const timeReduced = this.totalPayments - paymentsWithExtra;

    return {
      standardTotalInterest: Math.round(standardTotalInterest * 100) / 100,
      totalInterestWithExtra: Math.round(totalInterestWithExtra * 100) / 100,
      interestSaved: Math.round(interestSaved * 100) / 100,
      timeReduced: {
        payments: timeReduced,
        years: Math.round((timeReduced / 12) * 10) / 10
      },
      newPayoffTime: {
        payments: paymentsWithExtra,
        years: Math.round((paymentsWithExtra / 12) * 10) / 10
      }
    };
  }
}