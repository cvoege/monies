import { v4 as uuidv4 } from 'uuid';
import { Person } from './Person';
import { RetirementAccountInfo, RETIREMENT_CONTRIBUTION_MAXES } from './RetirementAccount';
import { formatDollars } from './String';
import {
  getProgressiveDeductions,
  PayrollTax,
  TaxBracket,
  TaxDeduction,
  TaxDetails,
  TaxSystem,
} from './Tax';

export type PaycheckFrequency = 'weekly' | 'every-two-weeks' | 'twice-per-month' | 'monthly';
export const paycheckFrequencyOptions: { label: string; value: PaycheckFrequency }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'every-two-weeks', label: 'Every 2 Weeks' },
  { value: 'twice-per-month', label: 'Twice Per Month' },
  { value: 'monthly', label: 'Monthly' },
];

export const getPaychecksPerYear = (paycheckFrequency: PaycheckFrequency) => {
  if (paycheckFrequency === 'weekly') {
    return 52;
  } else if (paycheckFrequency === 'every-two-weeks') {
    return 26;
  } else if (paycheckFrequency === 'twice-per-month') {
    return 24;
  } else {
    return 12;
  }
};

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

export const WORKING_WEEKS_PER_YEAR = 46;

export const getTaxableIncome = (income: Income): number => {
  const rate = income.rate || 0;
  if (income.rateType === 'annual') {
    return rate;
  } else if (income.rateType === 'monthly') {
    return rate * 12;
  } else if (income.rateType === 'hourly') {
    return rate * (income.hoursPerWeek || 0) * WORKING_WEEKS_PER_YEAR;
  } else {
    throw new Error('Unrecognized rate type');
  }
};

export const getCompanyContribution = (income: Income): number => {
  const taxable = getTaxableIncome(income);
  const companyContribution =
    (((income.rothRetirementMatchPercentage || 0) +
      (income.traditionalRetirementMatchPercentage || 0)) /
      100) *
    taxable;
  return companyContribution;
};

export const getTotalIncome = (income: Income): number => {
  const taxable = getTaxableIncome(income);
  const companyContribution = getCompanyContribution(income);
  return taxable + companyContribution;
};

export const getCombinedTaxableIncome = (incomes: Income[]): number => {
  return incomes.reduce((acc, income) => acc + getTaxableIncome(income), 0);
};

export const getCombinedCompanyContribution = (incomes: Income[]): number => {
  return incomes.reduce((acc, income) => acc + getCompanyContribution(income), 0);
};

export const getCombinedTotalIncome = (incomes: Income[]): number => {
  return incomes.reduce((acc, income) => acc + getTotalIncome(income), 0);
};

export const getBracketTaxableAmount = (bracket: TaxBracket, taxableAfterDeductions: number) => {
  return taxableAfterDeductions >= bracket.startTaxAmount
    ? Math.min(bracket.endTaxAmount || Infinity, taxableAfterDeductions) - bracket.startTaxAmount
    : 0;
};

export const getBracketTaxesPaid = (bracket: TaxBracket, taxableAfterDeductions: number) => {
  return getBracketTaxableAmount(bracket, taxableAfterDeductions) * (bracket.percentageRate / 100);
};

export const getTotalFederalIncomeTaxesPaid = (
  taxDetails: TaxDetails,
  taxableAfterDeductions: number,
) => {
  return taxDetails.incomeBrackets.reduce(
    (acc, bracket) => acc + getBracketTaxesPaid(bracket, taxableAfterDeductions),
    0,
  );
};

export const getPayrollTaxDetails = ({
  payrollTax,
  filingStatus,
  incomes,
  people,
}: {
  payrollTax: PayrollTax;
  filingStatus: 'single' | 'joint';
  incomes: Array<Income>;
  people: [Person] | [Person, Person];
}) => {
  const w2Incomes = incomes.filter((i) => i.incomeType === 'w2');
  const sepIncomes = incomes.filter((i) => i.incomeType === 'self-employment');
  const totalW2Income = getCombinedTaxableIncome(w2Incomes);
  const totalSepIncome = getCombinedTaxableIncome(sepIncomes);

  if (payrollTax.type === 'capped-per-person') {
    const individualDetails = people.map((person) => {
      const personIncomes = incomes.filter((i) => i.personId === person.id);
      const personW2Incomes = personIncomes.filter((i) => i.incomeType === 'w2');
      const personSepIncomes = personIncomes.filter((i) => i.incomeType === 'self-employment');

      const taxableAmount1x = Math.min(
        getCombinedTaxableIncome(personW2Incomes),
        payrollTax.maximumTaxableAmount,
      );
      const taxesLeftToPay = payrollTax.maximumTaxableAmount - taxableAmount1x;
      const taxableAmount2x = Math.min(taxesLeftToPay, getCombinedTaxableIncome(personSepIncomes));
      const taxesPaid =
        taxableAmount1x * (payrollTax.percentageRate / 100) +
        taxableAmount2x * ((payrollTax.percentageRate * 2) / 100);
      return { taxableAmount1x, taxableAmount2x, taxesPaid };
    });

    return individualDetails.reduce(
      (acc, cur) => ({
        taxableAmount1x: cur.taxableAmount1x + acc.taxableAmount1x,
        taxableAmount2x: cur.taxableAmount2x + acc.taxableAmount2x,
        taxesPaid: cur.taxesPaid + acc.taxesPaid,
      }),
      { taxableAmount1x: 0, taxableAmount2x: 0, taxesPaid: 0 },
    );
  } else if (payrollTax.type === 'uncapped') {
    return {
      taxableAmount1x: totalW2Income,
      taxableAmount2x: totalSepIncome,
      taxesPaid:
        totalW2Income * (payrollTax.percentageRate / 100) +
        totalSepIncome * (payrollTax.percentageRate / 100) * 2,
    };
  } else {
    const totalIncome = totalW2Income + totalSepIncome;
    const min =
      filingStatus === 'single'
        ? payrollTax.minimumTaxableAmountSingle
        : payrollTax.minimumTaxableAmountJoint;

    const amountOverMin = Math.max(0, totalIncome - min);
    return {
      taxableAmount1x: amountOverMin,
      taxableAmount2x: 0,
      taxesPaid: amountOverMin * (payrollTax.percentageRate / 100),
    };
  }
};

export const formatPayrollTaxIncomeRange = (pt: PayrollTax, filingStatus: 'single' | 'joint') => {
  if (pt.type === 'capped-per-person') {
    return `${formatDollars(0)}-${formatDollars(pt.maximumTaxableAmount)} Per Person`;
  } else if (pt.type === 'uncapped') {
    return 'All';
  } else {
    return `${formatDollars(
      filingStatus === 'single' ? pt.minimumTaxableAmountSingle : pt.minimumTaxableAmountJoint,
    )}+`;
  }
};

export const getFullTaxInfo = ({
  incomes,
  people,
  retirementAccountInfo,
  taxSystem,
}: {
  incomes: Array<Income>;
  people: [Person] | [Person, Person];
  retirementAccountInfo: RetirementAccountInfo;
  taxSystem: TaxSystem;
}) => {
  const filingStatus: 'single' | 'joint' = people.length === 1 ? 'single' : 'joint';
  const maxes = RETIREMENT_CONTRIBUTION_MAXES[filingStatus];
  const {
    hsaContribution,
    hsaContributionType,
    traditional401kContribution,
    traditionalIraContribution,
    iraContributionType,
    my401kContributionType,
  } = retirementAccountInfo;
  const taxDetails = taxSystem[filingStatus];

  const totalIncome = getCombinedTotalIncome(incomes);
  const totalDirectIncome = totalIncome - getCombinedCompanyContribution(incomes);
  const totalTaxable = getCombinedTaxableIncome(incomes);

  const totalW2Income = getCombinedTaxableIncome(incomes.filter((i) => i.incomeType === 'w2'));
  const totalSelfEmploymentIncome = getCombinedTaxableIncome(
    incomes.filter((i) => i.incomeType === 'self-employment'),
  );
  const totalNonFicaINcome = getCombinedTaxableIncome(
    incomes.filter((i) => i.incomeType === 'non-fica'),
  );

  const traditionalDeduction: TaxDeduction = {
    id: 'traditional-accounts',
    name: 'Traditional Accounts',
    amount:
      (hsaContributionType === 'max' ? maxes.hsa : hsaContribution || 0) +
      (iraContributionType === 'max-traditional' ? maxes.ira : traditionalIraContribution || 0) +
      (my401kContributionType === 'max-traditional'
        ? maxes.individual401k
        : traditional401kContribution || 0),
  };

  const deductions = [...taxDetails.deductions, traditionalDeduction];

  const totalDeductionValue = deductions.reduce((acc, deduction) => acc + deduction.amount, 0);
  const progressiveDeductions = getProgressiveDeductions({ totalTaxable, deductions });

  const taxableAfterDeductions =
    progressiveDeductions.length > 0
      ? progressiveDeductions[progressiveDeductions.length - 1]?.incomeAfter || totalTaxable
      : totalTaxable;

  const totalFederalIncomeTaxesPaid = getTotalFederalIncomeTaxesPaid(
    taxDetails,
    taxableAfterDeductions,
  );

  const totalPayrollTaxesPaid = taxSystem.payrollTaxes.reduce(
    (acc, cur) =>
      getPayrollTaxDetails({ payrollTax: cur, incomes, filingStatus, people }).taxesPaid + acc,
    0,
  );

  const stateDeduction = taxSystem.stateTaxSystem.deductionPerPerson * people.length;
  const stateTaxable = totalTaxable - stateDeduction;
  const stateTaxesPaid = stateTaxable * (taxSystem.stateTaxSystem.percentageRate / 100);

  const countyTaxesPaid = totalTaxable * (taxSystem.countyTaxSystem.percentageRate / 100);

  const totalFederalTaxesPaid = totalFederalIncomeTaxesPaid + totalPayrollTaxesPaid;

  const totalTaxes = totalFederalTaxesPaid + stateTaxesPaid + countyTaxesPaid;

  const totalAfterTaxIncomeDirect = totalTaxable - totalTaxes;
  const totalAfterTaxIncome = totalIncome - totalTaxes;

  const topMarginalTaxBracket =
    taxDetails.incomeBrackets
      .slice(0)
      .reverse()
      .find((bracket) => getBracketTaxableAmount(bracket, taxableAfterDeductions) > 0) ||
    taxDetails.incomeBrackets[0];

  const effectiveTaxRate = 100 * (totalTaxes / totalDirectIncome);

  return {
    filingStatus,
    taxDetails,
    totalIncome,
    totalDirectIncome,
    totalTaxable,
    totalW2Income,
    totalSelfEmploymentIncome,
    totalNonFicaINcome,
    traditionalDeduction,
    deductions,
    totalDeductionValue,
    progressiveDeductions,
    taxableAfterDeductions,
    totalFederalIncomeTaxesPaid,
    totalFederalTaxesPaid,
    totalPayrollTaxesPaid,
    stateDeduction,
    stateTaxable,
    stateTaxesPaid,
    countyTaxesPaid,
    totalTaxes,
    totalAfterTaxIncomeDirect,
    totalAfterTaxIncome,
    topMarginalTaxBracket,
    effectiveTaxRate,
  };
};
