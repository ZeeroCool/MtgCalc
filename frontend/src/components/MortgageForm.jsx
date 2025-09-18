import React from 'react';
import { useForm } from 'react-hook-form';

const MortgageForm = ({ onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      principal: 300000,
      annualRate: 6.5,
      years: 30,
      propertyTax: 10000,
      insurance: 1000,
      pmi: 0,
    },
  });

  const watchedValues = watch();

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

  return (
    <div className="card">
      <h2>Mortgage Calculator</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-group">
          <label htmlFor="principal">Loan Amount</label>
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
          <p className="text-gray-600 mt-1">
            {watchedValues.principal && formatCurrency(watchedValues.principal)}
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="propertyTax">Annual Property Tax ($)</label>
          <input
            type="number"
            id="propertyTax"
            step="100"
            className={errors.propertyTax ? 'error' : ''}
            {...register('propertyTax', { min: 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="insurance">Annual Home Insurance ($)</label>
          <input
            type="number"
            id="insurance"
            step="100"
            className={errors.insurance ? 'error' : ''}
            {...register('insurance', { min: 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="pmi">Monthly PMI ($)</label>
          <input
            type="number"
            id="pmi"
            step="10"
            className={errors.pmi ? 'error' : ''}
            {...register('pmi', { min: 0 })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="annualRate">Annual Interest Rate (%)</label>
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
          <label htmlFor="years">Loan Term (Years)</label>
          <input
            type="number"
            id="years"
            className={errors.years ? 'error' : ''}
            {...register('years', validationRules.years)}
          />
          {errors.years && (
            <p className="error-message">{errors.years.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading"></span>
              <span className="ml-2">Calculating...</span>
            </>
          ) : (
            'Calculate Mortgage'
          )}
        </button>
      </form>
    </div>
  );
};

export default MortgageForm;