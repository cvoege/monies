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

  // TODO: Estimate additional witholdings per paycheck
  // TODO: Estimate total witholdings per paycheck so you can compare and see if the witholdings are accurate
  // TODO: something to figure out estimated taxes including FICA for all SEP income on a quarterly or per-paycheck basis

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
      <p>W2 Income: {formatDollars(totalW2Income)}</p>
      <p>Self Employment Income: {formatDollars(totalSelfEmploymentIncome)}</p>
      <p>Income Subject to No FICA Taxes: {formatDollars(totalNonFicaINcome)}</p>
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
      <p>Total Payroll Taxes Paid: {formatDollars(totalPayrollTaxesPaid)}</p>
      <h1>State Taxes</h1>
      <p>State Deduction: {formatDollars(stateDeduction)}</p>
      <p>Taxable Income for State: {formatDollars(stateTaxable)}</p>
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
          <TableRow>
            <TableEntry>Indiana State Taxes</TableEntry>
            <TableEntry>{formatPercentage(taxSystem.stateTaxSystem.percentageRate)}</TableEntry>
            <TableEntry>{formatDollars(stateDeduction)}+</TableEntry>
            <TableEntry>{formatDollars(stateTaxable)}</TableEntry>
            <TableEntry>{formatDollars(stateTaxesPaid)}</TableEntry>
          </TableRow>
        </TableBody>
      </Table>
      <h1>County Taxes</h1>
      <p>County Deduction: {formatDollars(0)}</p>
      <p>Taxable Income for County: {formatDollars(totalTaxable)}</p>
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
          <TableRow>
            <TableEntry>Marion County Taxes</TableEntry>
            <TableEntry>{formatPercentage(taxSystem.countyTaxSystem.percentageRate)}</TableEntry>
            <TableEntry>{formatDollars(0)}+</TableEntry>
            <TableEntry>{formatDollars(totalTaxable)}</TableEntry>
            <TableEntry>{formatDollars(countyTaxesPaid)}</TableEntry>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
