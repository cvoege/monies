export type TaxDeduction = {
  id: string;
  name: string;
  amount: number;
};

export type TaxBracket = {
  id: string;
  name: string;
  percentageRate: number;
  startTaxAmount: number;
  // null means final tax bracket, applies to infinite income
  endTaxAmount: number | null;
};

export type CapitalGainsTaxBracket = {
  id: string;
  name: string;
  percentageRate: number;
  startTotalIncomeAmount: number;
  // null means final tax bracket, applies to infinite income
  endTotalIncomeAmount: number | null;
};

export type BasePayrollTax = {
  id: string;
  name: string;
  percentageRate: number;
  affectedByDeductions: boolean;
};

export type CappedPerPersonPayrollTax = BasePayrollTax & {
  type: 'capped-per-person';
  maximumTaxableAmount: number;
};

export type UncappedPayrollTax = BasePayrollTax & {
  type: 'uncapped';
};
export type AdditionalPayrollTax = BasePayrollTax & {
  type: 'additional';
  minimumTaxableAmountSingle: number;
  minimumTaxableAmountJoint: number;
};

export type PayrollTax = CappedPerPersonPayrollTax | UncappedPayrollTax | AdditionalPayrollTax;

export type TaxDetails = {
  deductions: Array<TaxDeduction>;
  incomeBrackets: Array<TaxBracket>;
  capitalGainsBrackets: Array<CapitalGainsTaxBracket>;
};
export type StateTaxSystem = {
  type: 'flat';
  percentageRate: number;
  deductionPerPerson: number;
};

export type CountyTaxSystem = {
  type: 'flat';
  percentageRate: number;
};

export type TaxSystem = {
  single: TaxDetails;
  joint: TaxDetails;
  payrollTaxes: Array<PayrollTax>;
  stateTaxSystem: StateTaxSystem;
  countyTaxSystem: CountyTaxSystem;
};

type ProgressiveDeduction = TaxDeduction & {
  incomeBefore: number;
  incomeAfter: number;
  amountDeducted: number;
};

export const getProgressiveDeductions = ({
  totalTaxable,
  deductions,
}: {
  totalTaxable: number;
  deductions: TaxDeduction[];
}): Array<ProgressiveDeduction> => {
  const progressiveDeductionInfo: Array<ProgressiveDeduction> = [];
  let currentRemainingIncome = totalTaxable;
  deductions.forEach((deduction) => {
    const old = currentRemainingIncome;
    currentRemainingIncome = Math.max(old - deduction.amount, 0);
    const amountDeducted = old - currentRemainingIncome;
    const info: ProgressiveDeduction = {
      ...deduction,
      incomeBefore: old,
      incomeAfter: currentRemainingIncome,
      amountDeducted,
    };
    progressiveDeductionInfo.push(info);
  });

  return progressiveDeductionInfo;
};
