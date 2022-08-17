import { formatDollars, formatPercentage } from '../modules/String';
import { useStore } from '../modules/Store';
import { US_STANDARD_TAX_SYSTEM } from '../modules/USTaxSystem';
import {
  Table,
  TableBody,
  TableEntry,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/Table';
import {
  formatPayrollTaxIncomeRange,
  getBracketTaxableAmount,
  getBracketTaxesPaid,
  getPayrollTaxDetails,
  getFullTaxInfo,
  getPaychecksPerYear,
} from 'src/modules/Income';

export const TaxZone = () => {
  const { people, incomes, retirementAccountInfo, w2PaycheckFrequency } = useStore(
    (s) => ({
      people: s.people,
      incomes: s.incomes,
      retirementAccountInfo: s.retirementAccountInfo,
      w2PaycheckFrequency: s.w2PaycheckFrequency,
    }),
    [],
  );
  const taxSystem = US_STANDARD_TAX_SYSTEM;
  const fullTaxInfo = getFullTaxInfo({ incomes, people, retirementAccountInfo, taxSystem });
  const {
    taxDetails,
    totalIncome,
    totalTaxable,
    totalW2Income,
    totalSelfEmploymentIncome,
    totalNonFicaINcome,
    deductions,
    totalDeductionValue,
    progressiveDeductions,
    taxableAfterDeductions,
    totalFederalIncomeTaxesPaid,
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
    filingStatus,
    totalFederalTaxesPaid,
  } = fullTaxInfo;
  const onlyW2FullTaxInfo = getFullTaxInfo({
    incomes: incomes.filter((i) => i.incomeType === 'w2'),
    people,
    retirementAccountInfo,
    taxSystem,
  });
  const w2AndNonFicaTaxInfo = getFullTaxInfo({
    incomes: incomes.filter((i) => i.incomeType === 'w2' || i.incomeType === 'non-fica'),
    people,
    retirementAccountInfo,
    taxSystem,
  });

  const w2PaychecksPerYear = getPaychecksPerYear(w2PaycheckFrequency);

  const ficaFederalDue =
    w2AndNonFicaTaxInfo.totalFederalTaxesPaid - onlyW2FullTaxInfo.totalFederalTaxesPaid;
  const ficaStateDue = w2AndNonFicaTaxInfo.stateTaxesPaid - onlyW2FullTaxInfo.stateTaxesPaid;
  const ficaCountyDue = w2AndNonFicaTaxInfo.countyTaxesPaid - onlyW2FullTaxInfo.countyTaxesPaid;

  const sepFederalDue = totalFederalTaxesPaid - w2AndNonFicaTaxInfo.totalFederalTaxesPaid;
  const sepStateDue = stateTaxesPaid - w2AndNonFicaTaxInfo.stateTaxesPaid;
  const sepCountyDue = countyTaxesPaid - w2AndNonFicaTaxInfo.countyTaxesPaid;

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
      <h1>Tax Summary</h1>
      <p>Total Annual Taxes: {formatDollars(totalTaxes)}</p>
      <p>Total Monthly Taxes: {formatDollars(totalTaxes / 12)}</p>
      <p>
        Total Annual After Tax Income (not including company retirement contributions):{' '}
        {formatDollars(totalAfterTaxIncomeDirect)}
      </p>
      <p>
        Total Monthly After Tax Income (not including company retirement contributions):{' '}
        {formatDollars(totalAfterTaxIncomeDirect / 12)}
      </p>
      <p>Total Annual After Tax Income: {formatDollars(totalAfterTaxIncome)}</p>
      <p>Total Monthly After Tax Income: {formatDollars(totalAfterTaxIncome / 12)}</p>
      <p>
        Top Marginal Federal Tax Rate:{' '}
        {formatPercentage(topMarginalTaxBracket?.percentageRate || 0)}
      </p>
      <p>
        Effective Tax Rate (not including company retirement contributions):{' '}
        {formatPercentage(effectiveTaxRate)}
      </p>
      <p>Effective Tax Rate: {formatPercentage(100 * (totalTaxes / totalIncome))}</p>
      <h1>Non-FICA Taxes</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Federal</TableHeader>
            <TableHeader>State</TableHeader>
            <TableHeader>County</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableEntry>Quarterly Estimated</TableEntry>
            <TableEntry>{formatDollars(ficaFederalDue / 4)}</TableEntry>
            <TableEntry>{formatDollars(ficaStateDue / 4)}</TableEntry>
            <TableEntry>
              {formatDollars(
                (w2AndNonFicaTaxInfo.countyTaxesPaid - onlyW2FullTaxInfo.countyTaxesPaid) / 4,
              )}
            </TableEntry>
          </TableRow>
          <TableRow>
            <TableEntry>Additional Witholdings</TableEntry>
            <TableEntry>{formatDollars(ficaFederalDue / w2PaychecksPerYear)}</TableEntry>
            <TableEntry>{formatDollars(ficaStateDue / w2PaychecksPerYear)}</TableEntry>
            <TableEntry>{formatDollars(ficaCountyDue / w2PaychecksPerYear)}</TableEntry>
          </TableRow>
        </TableBody>
      </Table>
      <h1>SEP Taxes</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Federal</TableHeader>
            <TableHeader>State</TableHeader>
            <TableHeader>County</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableEntry>Quarterly Estimated</TableEntry>
            <TableEntry>{formatDollars(sepFederalDue / 4)}</TableEntry>
            <TableEntry>{formatDollars(sepStateDue / 4)}</TableEntry>
            <TableEntry>{formatDollars(sepCountyDue / 4)}</TableEntry>
          </TableRow>
          <TableRow>
            <TableEntry>Additional Witholdings</TableEntry>
            <TableEntry>{formatDollars(sepFederalDue / w2PaychecksPerYear)}</TableEntry>
            <TableEntry>{formatDollars(sepStateDue / w2PaychecksPerYear)}</TableEntry>
            <TableEntry>{formatDollars(sepCountyDue / w2PaychecksPerYear)}</TableEntry>
          </TableRow>
        </TableBody>
      </Table>
      <h1>Total Additional Taxes</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Federal</TableHeader>
            <TableHeader>State</TableHeader>
            <TableHeader>County</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableEntry>Quarterly Estimated</TableEntry>
            <TableEntry>{formatDollars((sepFederalDue + ficaFederalDue) / 4)}</TableEntry>
            <TableEntry>{formatDollars((sepStateDue + ficaStateDue) / 4)}</TableEntry>
            <TableEntry>{formatDollars((sepCountyDue + ficaCountyDue) / 4)}</TableEntry>
          </TableRow>
          <TableRow>
            <TableEntry>Additional Witholdings</TableEntry>
            <TableEntry>
              {formatDollars((sepFederalDue + ficaFederalDue) / w2PaychecksPerYear)}
            </TableEntry>
            <TableEntry>
              {formatDollars((sepStateDue + ficaStateDue) / w2PaychecksPerYear)}
            </TableEntry>
            <TableEntry>
              {formatDollars((sepCountyDue + ficaCountyDue) / w2PaychecksPerYear)}
            </TableEntry>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};
