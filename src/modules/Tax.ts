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

export type CappedPayrollTax = BasePayrollTax & {
  type: 'capped';
  maximumTaxableAmount: number;
};

export type UncappedWithAdditionalPayrollTax = BasePayrollTax & {
  type: 'uncapped-with-additional';
  additionalPercentageRate: number;
  additionalKickInSingle: number;
  additionalKickInJoint: number;
};

export type PayrollTax = CappedPayrollTax | UncappedWithAdditionalPayrollTax;

export type TaxSystem = {
  single: {
    deductions: Array<TaxDeduction>;
    incomeBrackets: Array<TaxBracket>;
    capitalGainsBrackets: Array<CapitalGainsTaxBracket>;
  };
  joint: {
    deductions: Array<TaxDeduction>;
    incomeBrackets: Array<TaxBracket>;
    capitalGainsBrackets: Array<CapitalGainsTaxBracket>;
  };
  payrollTaxes: Array<PayrollTax>;
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
