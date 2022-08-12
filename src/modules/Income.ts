import { v4 as uuidv4 } from 'uuid';

export type Income = {
  id: string;
  name: string;
  personId: string;
  incomeType:
    | 'w2' // Fully taxable, subject to automatic withholdings, FICA, etc, example: your job
    | 'self-employment' // Self employment, requires manual withholdings, self employment taxes, FICA, example: contract work
    | 'non-fica'; // requires manual withholdings but no FICA, example: rent, dividends
  rate: number | null;
  hoursPerWeek: number | null;
  traditionalRetirementMatchPercentage: number | null;
  rothRetirementMatchPercentage: number | null;
  rateType: 'hourly' | 'annual' | 'monthly';
};

export const rateTypeOptions: Array<{ label: string; value: Income['rateType'] }> = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'annual' },
];
export const incomeTypeOptions: Array<{ label: string; value: Income['incomeType'] }> = [
  { label: 'W-2 (Standard Salary Job)', value: 'w2' },
  { label: 'Self Employment', value: 'self-employment' },
  { label: 'Non FICA (Dividends, Rent)', value: 'non-fica' },
];

export const defaultIncome = (personId: string): Income => {
  return {
    id: uuidv4(),
    personId: personId,
    name: '',
    rateType: 'annual',
    incomeType: 'w2',
    rate: 0,
    hoursPerWeek: null,
    rothRetirementMatchPercentage: 0,
    traditionalRetirementMatchPercentage: 0,
  };
};

export const totalTaxableIncomePerYear = (income: Income): number => {
  const rate = income.rate || 0;
  if (income.rateType === 'annual') {
    return rate;
  } else if (income.rateType === 'monthly') {
    return rate * 12;
  } else if (income.rateType === 'hourly') {
    return rate * (income.hoursPerWeek || 0) * 46;
  } else {
    throw new Error('Unrecognized rate type');
  }
};

export const totalCompanyContributionPerYear = (income: Income): number => {
  const taxable = totalTaxableIncomePerYear(income);
  const companyContribution =
    (((income.rothRetirementMatchPercentage || 0) +
      (income.traditionalRetirementMatchPercentage || 0)) /
      100) *
    taxable;
  return companyContribution;
};

export const totalIncomePerYear = (income: Income): number => {
  const taxable = totalTaxableIncomePerYear(income);
  const companyContribution = totalCompanyContributionPerYear(income);
  return taxable + companyContribution;
};
