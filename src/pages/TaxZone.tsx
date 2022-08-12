import { formatDollars, formatPercentage } from '../modules/String';
import { useStore } from '../modules/Store';
import { US_STANDARD_TAX_SYSTEM } from '../modules/TaxBracket';
import {
  MAX_INDIVIDUAL_401K_CONTRIBUTION,
  MAX_IRA_CONTRIBUTION,
} from '../modules/RetirementAccount';

export const TaxZone = () => {
  const {
    people,

    traditional401kContribution,
    traditionalIraContribution,
    iraContributionType,
    my401kContributionType,
  } = useStore(
    (s) => ({
      people: s.people,
      traditional401kContribution: s.traditional401kContribution,
      traditionalIraContribution: s.traditionalIraContribution,
      iraContributionType: s.iraContributionType,
      my401kContributionType: s.my401kContributionType,
    }),
    [],
  );
  const taxSystem = US_STANDARD_TAX_SYSTEM;
  const filingStatus = people.length === 1 ? 'single' : 'joint';
  const taxDetails = taxSystem[filingStatus];
  return (
    <div>
      <h1>Taxes</h1>
      <h3>Deductions</h3>
      {taxDetails.deductions.map((d) => {
        return (
          <div key={d.id}>
            <p>
              {d.name}: {formatDollars(d.amount)}
            </p>
          </div>
        );
      })}
      <p>
        Traditional Retirement Deduction:{' '}
        {formatDollars(
          (iraContributionType === 'max-traditional'
            ? MAX_IRA_CONTRIBUTION
            : traditionalIraContribution || 0) +
            (my401kContributionType === 'max-traditional'
              ? MAX_INDIVIDUAL_401K_CONTRIBUTION
              : traditional401kContribution || 0),
        )}
      </p>
      <h3>Income Taxes</h3>
      {taxDetails.incomeBrackets.map((bracket) => (
        <div key={bracket.id}>
          {bracket.name} | {formatPercentage(bracket.percentageRate)} |{' '}
          {formatDollars(bracket.startTaxAmount)}
          {bracket.endTaxAmount ? `-${formatDollars(bracket.endTaxAmount)}` : `+`}
        </div>
      ))}
    </div>
  );
};
