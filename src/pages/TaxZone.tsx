import { formatDollars, formatPercentage } from '../modules/String';
import { useStore } from '../modules/Store';
import { getProgressiveDeductions, TaxDeduction } from '../modules/Tax';
import { US_STANDARD_TAX_SYSTEM } from '../modules/USTaxSystem';
import {
  MAX_INDIVIDUAL_401K_CONTRIBUTION,
  MAX_IRA_CONTRIBUTION,
} from '../modules/RetirementAccount';
import {
  Table,
  TableBody,
  TableEntry,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/Table';
import { getCombinedTaxableIncome } from 'src/modules/Income';

export const TaxZone = () => {
  const {
    people,
    incomes,
    traditional401kContribution,
    traditionalIraContribution,
    iraContributionType,
    my401kContributionType,
  } = useStore(
    (s) => ({
      people: s.people,
      incomes: s.incomes,
      ...s.retirementAccountInfo,
    }),
    [],
  );
  const taxSystem = US_STANDARD_TAX_SYSTEM;
  const filingStatus = people.length === 1 ? 'single' : 'joint';
  const taxDetails = taxSystem[filingStatus];

  const totalTaxable = getCombinedTaxableIncome(incomes);

  const traditionalDeduction: TaxDeduction = {
    id: 'traditional-accounts',
    name: 'Traditional Accounts',
    amount:
      (iraContributionType === 'max-traditional'
        ? MAX_IRA_CONTRIBUTION
        : traditionalIraContribution || 0) +
      (my401kContributionType === 'max-traditional'
        ? MAX_INDIVIDUAL_401K_CONTRIBUTION
        : traditional401kContribution || 0),
  };

  const deductions = [...taxDetails.deductions, traditionalDeduction];

  const totalDeductionValue = deductions.reduce((acc, deduction) => acc + deduction.amount, 0);
  const progressiveDeductions = getProgressiveDeductions({ totalTaxable, deductions });

  const taxableAfterDeductions = progressiveDeductions[0]
    ? progressiveDeductions[0].incomeAfter
    : totalTaxable;

  return (
    <div>
      <h1>Deductions</h1>
      {deductions.map((d) => {
        return (
          <div key={d.id}>
            <p>
              {d.name}: {formatDollars(d.amount)}
            </p>
          </div>
        );
      })}
      <p>Total Deductions: {formatDollars(totalDeductionValue)}</p>
      <h1>Income Taxes</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Rate</TableHeader>
            <TableHeader>Income Range</TableHeader>
            <TableHeader>Amount Taxed at Rate</TableHeader>
            <TableHeader>Taxes Paid</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {progressiveDeductions.map((d) => {
            return (
              <TableRow key={d.id}>
                <TableEntry>{d.name}</TableEntry>
                <TableEntry>{formatPercentage(0)}</TableEntry>
                <TableEntry>{formatDollars(d.amount)}</TableEntry>
                <TableEntry>{formatDollars(d.amountDeducted)}</TableEntry>
                <TableEntry>{formatDollars(0)}</TableEntry>
              </TableRow>
            );
          })}
          {taxDetails.incomeBrackets.map((bracket) => {
            const taxableInThisBracket =
              taxableAfterDeductions >= bracket.startTaxAmount
                ? Math.min(bracket.endTaxAmount || Infinity, taxableAfterDeductions) -
                  bracket.startTaxAmount
                : 0;
            return (
              <TableRow key={bracket.id}>
                <TableEntry>{bracket.name}</TableEntry>
                <TableEntry>{formatPercentage(bracket.percentageRate)}</TableEntry>
                <TableEntry>
                  {formatDollars(bracket.startTaxAmount)}
                  {bracket.endTaxAmount ? `-${formatDollars(bracket.endTaxAmount)}` : `+`}
                </TableEntry>
                <TableEntry>{formatDollars(taxableInThisBracket)}</TableEntry>
                <TableEntry>
                  {formatDollars(taxableInThisBracket * (bracket.percentageRate / 100))}
                </TableEntry>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
