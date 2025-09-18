const mortgageService = require('../services/mortgageService');
const { AppError } = require('../utils/errorUtils');

class MortgageController {
  /**
   * Calculate monthly mortgage payment
   */
  async calculatePayment(req, res, next) {
    try {
      const { loanAmount, interestRate, loanTerm, propertyTax, insurance, pmi, hoaFees } = req.body;

      const result = mortgageService.calculateMonthlyPayment({
        loanAmount,
        interestRate,
        loanTerm,
        propertyTax: propertyTax || 0,
        insurance: insurance || 0,
        pmi: pmi || 0,
        hoaFees: hoaFees || 0
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Monthly payment calculated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate full amortization schedule
   */
  async generateAmortization(req, res, next) {
    try {
      const { loanAmount, interestRate, loanTerm } = req.body;

      const schedule = mortgageService.generateAmortizationSchedule({
        loanAmount,
        interestRate,
        loanTerm
      });

      res.status(200).json({
        success: true,
        data: {
          schedule,
          totalPayments: schedule.length,
          totalInterest: schedule.reduce((sum, payment) => sum + payment.interestPayment, 0),
          totalPrincipal: loanAmount
        },
        message: 'Amortization schedule generated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate Annual Percentage Rate (APR)
   */
  async calculateAPR(req, res, next) {
    try {
      const { loanAmount, interestRate, loanTerm, fees } = req.body;

      const apr = mortgageService.calculateAPR({
        loanAmount,
        interestRate,
        loanTerm,
        fees: fees || 0
      });

      res.status(200).json({
        success: true,
        data: {
          apr: apr,
          interestRate: interestRate,
          difference: apr - interestRate
        },
        message: 'APR calculated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comprehensive loan summary
   */
  async getLoanSummary(req, res, next) {
    try {
      const { loanAmount, interestRate, loanTerm, propertyTax, insurance, pmi, hoaFees, fees } = req.body;

      const summary = mortgageService.getLoanSummary({
        loanAmount,
        interestRate,
        loanTerm,
        propertyTax: propertyTax || 0,
        insurance: insurance || 0,
        pmi: pmi || 0,
        hoaFees: hoaFees || 0,
        fees: fees || 0
      });

      res.status(200).json({
        success: true,
        data: summary,
        message: 'Loan summary calculated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Compare multiple loan scenarios
   */
  async compareLoans(req, res, next) {
    try {
      const { loans } = req.body;

      if (!Array.isArray(loans) || loans.length < 2) {
        throw new AppError('At least 2 loan scenarios required for comparison', 400);
      }

      const comparisons = loans.map((loan, index) => ({
        scenario: index + 1,
        ...mortgageService.getLoanSummary(loan)
      }));

      res.status(200).json({
        success: true,
        data: {
          comparisons,
          recommendedLoan: mortgageService.findBestLoan(comparisons)
        },
        message: 'Loan comparison completed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MortgageController();