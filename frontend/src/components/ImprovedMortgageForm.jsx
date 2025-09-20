import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

const ImprovedMortgageForm = ({ onSubmit, isLoading = false }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      principal: 300000,
      annualRate: 6.5,
      years: 30,
      propertyTax: 3600,
      insurance: 1200,
      pmi: 0,
      hoaFees: 0,
      downPayment: 60000,
      downPaymentType: 'amount',
    },
  });

  const watchedValues = watch();
  const homePrice = Number(watchedValues.principal) + Number(watchedValues.downPayment || 0);
  const downPaymentPercent = homePrice > 0 ? ((watchedValues.downPayment || 0) / homePrice * 100).toFixed(1) : 0;

  const validationRules = {
    principal: {
      required: 'Loan amount is required',
      min: {
        value: 1000,
        message: 'Loan amount must be at least $1,000',
      },
      max: {
        value: 10000000,
        message: 'Loan amount cannot exceed $10,000,000',
      },
    },
    annualRate: {
      required: 'Interest rate is required',
      min: {
        value: 0.1,
        message: 'Interest rate must be at least 0.1%',
      },
      max: {
        value: 50,
        message: 'Interest rate cannot exceed 50%',
      },
    },
    years: {
      required: 'Loan term is required',
      min: {
        value: 1,
        message: 'Loan term must be at least 1 year',
      },
      max: {
        value: 50,
        message: 'Loan term cannot exceed 50 years',
      },
    },
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleQuickSelect = (years) => {
    setValue('years', years);
  };

  return (
    <div className="card fade-in">
      <h2 className="text-center mb-6">Calculate Your Mortgage</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Loan Information Section */}
        <div className="form-section">
          <h3>
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Loan Information
          </h3>

          <div className="grid grid-2 gap-4">
            <div className="form-group">
              <label htmlFor="principal">
                Loan Amount
                <span className="tooltip ml-2">
                  <svg className="icon" style={{width: '1rem', height: '1rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="tooltip-text">The amount you're borrowing from the lender</span>
                </span>
              </label>
              <input
                type="number"
                id="principal"
                step="1000"
                className={errors.principal ? 'error' : ''}
                {...register('principal', validationRules.principal)}
              />
              {errors.principal && (
                <p className="error-message">{errors.principal.message}</p>
              )}
              <p className="text-gray-600 mt-1 text-sm">
                {watchedValues.principal && formatCurrency(watchedValues.principal)}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="downPayment">
                Down Payment
                <span className="tooltip ml-2">
                  <svg className="icon" style={{width: '1rem', height: '1rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="tooltip-text">Your upfront payment on the home</span>
                </span>
              </label>
              <input
                type="number"
                id="downPayment"
                step="1000"
                {...register('downPayment', { min: 0 })}
              />
              <p className="text-gray-600 mt-1 text-sm">
                {downPaymentPercent}% of home price • Home Price: {formatCurrency(homePrice)}
              </p>
            </div>
          </div>

          <div className="grid grid-2 gap-4">
            <div className="form-group">
              <label htmlFor="annualRate">
                Interest Rate (%)
                <span className="tooltip ml-2">
                  <svg className="icon" style={{width: '1rem', height: '1rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="tooltip-text">Annual percentage rate (APR) for your loan</span>
                </span>
              </label>
              <input
                type="number"
                id="annualRate"
                step="0.01"
                className={errors.annualRate ? 'error' : ''}
                {...register('annualRate', validationRules.annualRate)}
              />
              {errors.annualRate && (
                <p className="error-message">{errors.annualRate.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="years">
                Loan Term
                <span className="tooltip ml-2">
                  <svg className="icon" style={{width: '1rem', height: '1rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="tooltip-text">Length of your loan in years</span>
                </span>
              </label>
              <input
                type="number"
                id="years"
                className={errors.years ? 'error' : ''}
                {...register('years', validationRules.years)}
              />
              {errors.years && (
                <p className="error-message">{errors.years.message}</p>
              )}
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => handleQuickSelect(15)} className="btn btn-secondary" style={{padding: '0.5rem 1rem', fontSize: '0.875rem'}}>
                  15 years
                </button>
                <button type="button" onClick={() => handleQuickSelect(20)} className="btn btn-secondary" style={{padding: '0.5rem 1rem', fontSize: '0.875rem'}}>
                  20 years
                </button>
                <button type="button" onClick={() => handleQuickSelect(30)} className="btn btn-secondary" style={{padding: '0.5rem 1rem', fontSize: '0.875rem'}}>
                  30 years
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Costs Section */}
        <div className="form-section">
          <h3 onClick={() => setShowAdvanced(!showAdvanced)} style={{cursor: 'pointer'}}>
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Additional Monthly Costs
            <svg className="icon" style={{marginLeft: 'auto', transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </h3>

          {showAdvanced && (
            <div className="grid grid-2 gap-4 fade-in">
              <div className="form-group">
                <label htmlFor="propertyTax">
                  Annual Property Tax ($)
                </label>
                <input
                  type="number"
                  id="propertyTax"
                  step="100"
                  {...register('propertyTax', { min: 0 })}
                />
                <p className="text-gray-600 mt-1 text-sm">
                  Monthly: {formatCurrency((watchedValues.propertyTax || 0) / 12)}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="insurance">
                  Annual Home Insurance ($)
                </label>
                <input
                  type="number"
                  id="insurance"
                  step="100"
                  {...register('insurance', { min: 0 })}
                />
                <p className="text-gray-600 mt-1 text-sm">
                  Monthly: {formatCurrency((watchedValues.insurance || 0) / 12)}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="pmi">
                  Monthly PMI ($)
                </label>
                <input
                  type="number"
                  id="pmi"
                  step="10"
                  {...register('pmi', { min: 0 })}
                />
                <p className="text-gray-600 mt-1 text-sm">
                  {downPaymentPercent < 20 ? 'Usually required if down payment < 20%' : 'Not required with 20% down'}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="hoaFees">
                  Monthly HOA Fees ($)
                </label>
                <input
                  type="number"
                  id="hoaFees"
                  step="10"
                  {...register('hoaFees', { min: 0 })}
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="btn"
            disabled={isLoading}
            style={{minWidth: '200px'}}
          >
            {isLoading ? (
              <>
                <span className="loading"></span>
                <span className="ml-2">Calculating...</span>
              </>
            ) : (
              'Calculate Payment'
            )}
          </button>
        </div>

        {/* Estimated Payment Preview */}
        {watchedValues.principal && watchedValues.annualRate && watchedValues.years && (
          <div className="text-center mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Quick Estimate (P&I Only)</p>
            <p className="text-2xl font-bold text-purple-600">
              ~{formatCurrency(
                (watchedValues.principal * (watchedValues.annualRate / 100 / 12)) /
                (1 - Math.pow(1 + (watchedValues.annualRate / 100 / 12), -(watchedValues.years * 12)))
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">Click calculate for detailed breakdown</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ImprovedMortgageForm;