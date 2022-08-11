import { v4 as uuidv4 } from 'uuid';

export type Income = {
  id: string;
  name: string;
  personId: string;
  rateType: 'hourly' | 'annual' | 'monthly';
  incomeType:
    | 'w2' // Fully taxable, subject to automatic withholdings, FICA, etc, example: your job
    | 'self-employment' // Self employment, requires manual withholdings, self employment taxes, FICA, example: contract work
    | 'non-fica'; // requires manual withholdings but no FICA, example: rent, dividends
  rate: number | null;
  traditionalRetirementMatchPercentage: number | null;
  rothRetirementMatchPercentage: number | null;
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
    rothRetirementMatchPercentage: 0,
    traditionalRetirementMatchPercentage: 0,
  };
};
