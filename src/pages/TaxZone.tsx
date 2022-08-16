import { formatDollars, formatPercentage } from '../modules/String';
import { useStore } from '../modules/Store';
import { getProgressiveDeductions, TaxDeduction } from '../modules/Tax';
import { US_STANDARD_TAX_SYSTEM } from '../modules/USTaxSystem';
import { retirementContributionMaxes } from '../modules/RetirementAccount';
import {
  Table,
  TableBody,
  TableEntry,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/Table';
import {
  getCombinedTaxableIncome,
  formatPayrollTaxIncomeRange,
  getBracketTaxableAmount,
  getBracketTaxesPaid,
  getTotalFederalIncomeTaxesPaid,
  getPayrollTaxDetails,
} from 'src/modules/Income';

export const TaxZone = () => {
  const {
    people,
    incomes,
    hsaContribution,
    hsaContributionType,
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
  const maxes = retirementContributionMaxes[filingStatus];
  const taxDetails = taxSystem[filingStatus];

  const totalTaxable = getCombinedTaxableIncome(incomes);

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
      <p>Taxable Income After Deductions: {formatDollars(taxableAfterDeductions)}</p>
      <h1>Federal Income Taxes</h1>
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
            const taxableInThisBracket = getBracketTaxableAmount(bracket, taxableAfterDeductions);
            const taxesPaid = getBracketTaxesPaid(bracket, taxableAfterDeductions);

            return (
              <TableRow key={bracket.id}>
                <TableEntry>{bracket.name}</TableEntry>
                <TableEntry>{formatPercentage(bracket.percentageRate)}</TableEntry>
                <TableEntry>
                  {formatDollars(bracket.startTaxAmount)}
                  {bracket.endTaxAmount ? `-${formatDollars(bracket.endTaxAmount)}` : `+`}
                </TableEntry>
                <TableEntry>{formatDollars(taxableInThisBracket)}</TableEntry>
                <TableEntry>{formatDollars(taxesPaid)}</TableEntry>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <p>Total Federal Income Taxes Paid: {formatDollars(totalFederalIncomeTaxesPaid)}</p>
      <p>Monthly Federal Income Taxes Paid: {formatDollars(totalFederalIncomeTaxesPaid / 12)}</p>
      <h1>Payroll Taxes</h1>
      {/* <p>Income Subject to Standard FICA Taxes: {formatDollars(totalW2Income)}</p>
      <p>
        Income Subject to Double FICA Taxes (Paying as both Employee and Employer):{' '}
        {formatDollars(totalSelfEmploymentIncome)}
      </p>
      <p>Income Subject to No FICA Taxes: {formatDollars(totalNonFicaINcome)}</p> */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Rate</TableHeader>
            <TableHeader>Income Range</TableHeader>
            <TableHeader>Amount Taxed at Rate (1x)</TableHeader>
            <TableHeader>Amount Taxed at Rate (2x)</TableHeader>
            <TableHeader>Taxes Paid</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {taxSystem.payrollTaxes.map((pt) => {
            const taxableAmounts = getPayrollTaxDetails({
              payrollTax: pt,
              incomes,
              filingStatus,
              people,
            });
            return (
              <TableRow key={pt.id}>
                <TableEntry>{pt.name}</TableEntry>
                <TableEntry>{formatPercentage(pt.percentageRate)}</TableEntry>
                <TableEntry>{formatPayrollTaxIncomeRange(pt, filingStatus)}</TableEntry>
                <TableEntry>{formatDollars(taxableAmounts.taxableAmount1x)}</TableEntry>
                <TableEntry>{formatDollars(taxableAmounts.taxableAmount2x)}</TableEntry>
                <TableEntry>{formatDollars(taxableAmounts.taxesPaid)}</TableEntry>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
