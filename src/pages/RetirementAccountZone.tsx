import { defaultUserData, getActions, useUserData } from 'src/modules/Firebase';
import { NumberInput } from '../components/Input';
import { SelectInput } from '../components/SelectInput';
import { RETIREMENT_CONTRIBUTION_MAXES } from '../modules/RetirementAccount';

export const RetirementAccountZone = () => {
  const { userData, setUserData } = useUserData();

  const {
    retirementAccountInfo: {
      hsaContribution,
      hsaContributionType,
      roth401kContribution,
      rothIraContribution,
      traditional401kContribution,
      traditionalIraContribution,
      iraContributionType,
      my401kContributionType,
    },
    people,
  } = userData || defaultUserData;

  const actions = getActions(userData || defaultUserData, setUserData);

  const filingStatus = people.length === 1 ? 'single' : 'joint';
  const maxes = RETIREMENT_CONTRIBUTION_MAXES[filingStatus];

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Retirement Accounts</h1>
      IRA Contribution Setting:{' '}
      <SelectInput
        value={iraContributionType}
        onChange={actions.setRetirementInfoField('iraContributionType')}
        options={[
          { value: 'custom', label: 'Custom' },
          { value: 'max-roth', label: 'Max Roth' },
          { value: 'max-traditional', label: 'Max Traditional' },
        ]}
      />
      {iraContributionType === 'custom' && (
        <>
          <div>
            Roth IRA Contribution:{' '}
            <NumberInput
              value={rothIraContribution}
              onChange={actions.setRetirementInfoField('rothIraContribution')}
              min={0}
              max={maxes.ira - (traditionalIraContribution || 0)}
            />
          </div>
          <div>
            Traditional IRA Contribution:{' '}
            <NumberInput
              value={traditionalIraContribution}
              onChange={actions.setRetirementInfoField('traditionalIraContribution')}
              min={0}
              max={maxes.ira - (rothIraContribution || 0)}
            />
          </div>
        </>
      )}
      <br />
      HSA Contribution Setting:{' '}
      <SelectInput
        value={hsaContributionType}
        onChange={actions.setRetirementInfoField('hsaContributionType')}
        options={[
          { value: 'custom', label: 'Custom' },
          { value: 'max', label: 'Max' },
        ]}
      />
      {hsaContributionType === 'custom' && (
        <div>
          HSA Contribution:{' '}
          <NumberInput
            value={hsaContribution}
            onChange={actions.setRetirementInfoField('hsaContribution')}
            min={0}
            max={maxes.hsa}
          />
        </div>
      )}
      <br />
      <br />
      401k Contribution Setting:{' '}
      <SelectInput
        value={my401kContributionType}
        onChange={actions.setRetirementInfoField('my401kContributionType')}
        options={[
          { value: 'custom', label: 'Custom' },
          { value: 'max-roth', label: 'Max Roth' },
          { value: 'max-traditional', label: 'Max Traditional' },
        ]}
      />
      {my401kContributionType === 'custom' && (
        <>
          <div>
            Roth 401k Contribution:{' '}
            <NumberInput
              value={roth401kContribution}
              min={0}
              max={maxes.individual401k - (traditional401kContribution || 0)}
              onChange={actions.setRetirementInfoField('roth401kContribution')}
            />
          </div>
          <div>
            Traditional 401k Contribution:{' '}
            <NumberInput
              value={traditional401kContribution}
              min={0}
              max={maxes.individual401k - (roth401kContribution || 0)}
              onChange={actions.setRetirementInfoField('traditional401kContribution')}
            />
          </div>
        </>
      )}
    </div>
  );
};
