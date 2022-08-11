type TaxDeduction = {
  id: string;
  name: string;
  amount: number;
};

type TaxBracket = {
  id: string;
  name: string;
  percentageRate: number;
  startTaxAmount: number;
  // null means final tax bracket, applies to infinite income
  endTaxAmount: number | null;
};

type CapitalGainsTaxBracket = {
  id: string;
  name: string;
  percentageRate: number;
  startTotalIncomeAmount: number;
  // null means final tax bracket, applies to infinite income
  endTotalIncomeAmount: number | null;
};

type BasePayrollTax = {
  id: string;
  name: string;
  percentageRate: number;
  affectedByDeductions: boolean;
};

type CappedPayrollTax = BasePayrollTax & {
  type: 'capped';
  maximumTaxableAmount: number;
};

type UncappedWithAdditionalPayrollTax = BasePayrollTax & {
  type: 'uncapped-with-additional';
  additionalPercentageRate: number;
  additionalKickInSingle: number;
  additionalKickInJoint: number;
};

type PayrollTax = CappedPayrollTax | UncappedWithAdditionalPayrollTax;

type TaxSystem = {
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

export const US_STANDARD_TAX_SYSTEM: TaxSystem = {
  single: {
    deductions: [
      {
        id: 'us-standard-deduction',
        name: 'US Standard Deduction',
        amount: 12950,
      },
    ],
    incomeBrackets: [
      {
        id: 'us-tax-bracket-1',
        name: 'US Tax Bracket 1',
        percentageRate: 10,
        startTaxAmount: 0,
        endTaxAmount: 10275,
      },
      {
        id: 'us-tax-bracket-2',
        name: 'US Tax Bracket 2',
        percentageRate: 12,
        startTaxAmount: 10276,
        endTaxAmount: 41775,
      },
      {
        id: 'us-tax-bracket-3',
        name: 'US Tax Bracket 3',
        percentageRate: 22,
        startTaxAmount: 41776,
        endTaxAmount: 89075,
      },
      {
        id: 'us-tax-bracket-4',
        name: 'US Tax Bracket 4',
        percentageRate: 24,
        startTaxAmount: 89076,
        endTaxAmount: 170050,
      },
      {
        id: 'us-tax-bracket-5',
        name: 'US Tax Bracket 5',
        percentageRate: 32,
        startTaxAmount: 170051,
        endTaxAmount: 215950,
      },
      {
        id: 'us-tax-bracket-6',
        name: 'US Tax Bracket 6',
        percentageRate: 35,
        startTaxAmount: 215951,
        endTaxAmount: 539900,
      },
      {
        id: 'us-tax-bracket-7',
        name: 'US Tax Bracket 7',
        percentageRate: 37,
        startTaxAmount: 539901,
        endTaxAmount: null,
      },
    ],
    capitalGainsBrackets: [
      {
        id: 'us-capital-gains-bracket-1',
        name: 'US Capital Gains Bracket 1',
        percentageRate: 0,
        startTotalIncomeAmount: 0,
        endTotalIncomeAmount: 40400,
      },
      {
        id: 'us-capital-gains-bracket-2',
        name: 'US Capital Gains Bracket 2',
        percentageRate: 15,
        startTotalIncomeAmount: 40401,
        endTotalIncomeAmount: 445850,
      },
      {
        id: 'us-capital-gains-bracket-3',
        name: 'US Capital Gains Bracket 3',
        percentageRate: 20,
        startTotalIncomeAmount: 445851,
        endTotalIncomeAmount: null,
      },
    ],
  },
  joint: {
    deductions: [
      {
        id: 'us-joint-standard-deduction',
        name: 'US Joint Standard Deduction',
        amount: 25900,
      },
    ],
    incomeBrackets: [
      {
        id: 'us-joint-tax-bracket-1',
        name: 'US Joint Tax Bracket 1',
        percentageRate: 10,
        startTaxAmount: 0,
        endTaxAmount: 20550,
      },
      {
        id: 'us-joint-tax-bracket-2',
        name: 'US Joint Tax Bracket 2',
        percentageRate: 12,
        startTaxAmount: 20551,
        endTaxAmount: 83550,
      },
      {
        id: 'us-joint-tax-bracket-3',
        name: 'US Joint Tax Bracket 3',
        percentageRate: 22,
        startTaxAmount: 83551,
        endTaxAmount: 178150,
      },
      {
        id: 'us-joint-tax-bracket-4',
        name: 'US Joint Tax Bracket 4',
        percentageRate: 24,
        startTaxAmount: 178151,
        endTaxAmount: 340100,
      },
      {
        id: 'us-joint-tax-bracket-5',
        name: 'US Joint Tax Bracket 5',
        percentageRate: 32,
        startTaxAmount: 340101,
        endTaxAmount: 431900,
      },
      {
        id: 'us-joint-tax-bracket-6',
        name: 'US Joint Tax Bracket 6',
        percentageRate: 35,
        startTaxAmount: 431901,
        endTaxAmount: 647850,
      },
      {
        id: 'us-joint-tax-bracket-7',
        name: 'US Joint Tax Bracket 7',
        percentageRate: 37,
        startTaxAmount: 647851,
        endTaxAmount: null,
      },
    ],
    capitalGainsBrackets: [
      {
        id: 'us-joint-capital-gains-bracket-1',
        name: 'US Joint Capital Gains Bracket 1',
        percentageRate: 0,
        startTotalIncomeAmount: 0,
        endTotalIncomeAmount: 80800,
      },
      {
        id: 'us-joint-capital-gains-bracket-2',
        name: 'US Joint Capital Gains Bracket 2',
        percentageRate: 15,
        startTotalIncomeAmount: 40401,
        endTotalIncomeAmount: 501600,
      },
      {
        id: 'us-joint-capital-gains-bracket-3',
        name: 'US Joint Capital Gains Bracket 3',
        percentageRate: 20,
        startTotalIncomeAmount: 501600,
        endTotalIncomeAmount: null,
      },
    ],
  },
  payrollTaxes: [
    {
      id: 'social-security-tax',
      name: 'Social Security Tax',
      type: 'capped',
      percentageRate: 6.2,
      affectedByDeductions: false,
      maximumTaxableAmount: 142800,
    },
    {
      id: 'medicare-tax',
      name: 'Medicare Tax',
      type: 'uncapped-with-additional',
      percentageRate: 1.45,
      affectedByDeductions: false,
      additionalPercentageRate: 0.9,
      additionalKickInSingle: 200000,
      additionalKickInJoint: 250000,
    },
  ],
};
