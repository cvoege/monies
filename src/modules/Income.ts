import { ImmutableList } from './Immutable';

export type Income = {
  name: string;
  rateType: 'hourly' | 'annual' | 'monthly';
  incomeType:
    | 'w2' // Fully taxable, subject to automatic withholdings, FICA, etc, example: your job
    | 'self-employment' // Self employment, requires manual withholdings, self employment taxes, FICA, example: contract work
    | 'non-fica'; // requires manual withholdings but no FICA, example: rent, dividends
  rate: number | null;
  retirementMatchPercentage: number | null;
};

export const rateTypeOptions: ImmutableList<{ label: string; value: Income['rateType'] }> =
  ImmutableList([
    { label: 'Hourly', value: 'hourly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'annual' },
  ]);
export const incomeTypeOptions: ImmutableList<{ label: string; value: Income['incomeType'] }> =
  ImmutableList([
    { label: 'W-2 (Standard Salary Job)', value: 'w2' },
    { label: 'Self Employment', value: 'self-employment' },
    { label: 'Non FICA (Dividends, Rent)', value: 'non-fica' },
  ]);
