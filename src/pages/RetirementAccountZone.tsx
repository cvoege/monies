import { NumberInput } from '../components/Input';
import { SelectInput } from '../components/SelectInput';
import {
  MAX_INDIVIDUAL_401K_CONTRIBUTION,
  MAX_IRA_CONTRIBUTION,
} from '../modules/RetirementAccount';
import { useStore, actions } from '../modules/Store';

export const RetirementAccountZone = () => {
  const {
    roth401kContribution,
    rothIraContribution,
    traditional401kContribution,
    traditionalIraContribution,
    iraContributionType,
    my401kContributionType,
  } = useStore((s) => s.retirementAccountInfo, []);

  return (
    <div>
      <h1>Retirement Accounts</h1>
      IRA Contribution Setting:{' '}
      <SelectInput
        value={iraContributionType}
        onChange={actions.setRetirementInfoField('iraContributionType')}
        options={[
          { value: 'mixed', label: 'Custom' },
          { value: 'max-roth', label: 'Max Roth' },
          { value: 'max-traditional', label: 'Max Traditional' },
        ]}
      />
      {iraContributionType === 'mixed' && (
        <>
          <div>
            Roth IRA Contribution:{' '}
            <NumberInput
              value={rothIraContribution}
              onChange={actions.setRetirementInfoField('rothIraContribution')}
              min={0}
              max={MAX_IRA_CONTRIBUTION - (traditionalIraContribution || 0)}
            />
          </div>
          <div>
            Traditional IRA Contribution:{' '}
            <NumberInput
              value={traditionalIraContribution}
              onChange={actions.setRetirementInfoField('traditionalIraContribution')}
              min={0}
              max={MAX_IRA_CONTRIBUTION - (rothIraContribution || 0)}
            />
          </div>
        </>
      )}
      <br />
      401k Contribution Setting:{' '}
      <SelectInput
        value={my401kContributionType}
        onChange={actions.setRetirementInfoField('my401kContributionType')}
        options={[
          { value: 'mixed', label: 'Custom' },
          { value: 'max-roth', label: 'Max Roth' },
          { value: 'max-traditional', label: 'Max Traditional' },
        ]}
      />
      {my401kContributionType === 'mixed' && (
        <>
          <div>
            Roth 401k Contribution:{' '}
            <NumberInput
              value={roth401kContribution}
              min={0}
              max={MAX_INDIVIDUAL_401K_CONTRIBUTION - (traditional401kContribution || 0)}
              onChange={actions.setRetirementInfoField('roth401kContribution')}
            />
          </div>
          <div>
            Traditional 401k Contribution:{' '}
            <NumberInput
              value={traditional401kContribution}
              min={0}
              max={MAX_INDIVIDUAL_401K_CONTRIBUTION - (roth401kContribution || 0)}
              onChange={actions.setRetirementInfoField('traditional401kContribution')}
            />
          </div>
        </>
      )}
    </div>
  );
};
