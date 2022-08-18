import { useStore, actions } from '../modules/Store';
import { NumberInput, TextInput } from '../components/Input';
import { SelectInput } from '../components/SelectInput';
import {
  incomeTypeOptions,
  rateTypeOptions,
  getTotalIncome,
  getTaxableIncome,
  getCompanyContribution,
  getCombinedTaxableIncome,
  getCombinedCompanyContribution,
  getCombinedTotalIncome,
} from '../modules/Income';
import { formatDollars } from '../modules/String';

export const IncomeZone = () => {
  const { incomes, people } = useStore((s) => ({ incomes: s.incomes, people: s.people }), []);

  const totalTaxable = getCombinedTaxableIncome(incomes);
  const totalCompanyContribution = getCombinedCompanyContribution(incomes);
  const totalIncome = getCombinedTotalIncome(incomes);

  return (
    <div>
      <h1>Income</h1>
      {incomes.map((income) => {
        const setIncome = actions.setIncome(income.id);

        return (
          <div
            style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}
            key={income.id}
          >
            <strong>{income.name}</strong>
            <div>
              Name: <TextInput value={income.name} onChange={setIncome('name')} />
            </div>
            <div>
              Person:{' '}
              <SelectInput
                value={income.personId}
                options={people.map((person) => ({ label: person.name, value: person.id }))}
                onChange={setIncome('personId')}
              />
            </div>
            <div>
              Income Type:{' '}
              <SelectInput
                value={income.incomeType}
                options={incomeTypeOptions}
                onChange={setIncome('incomeType')}
              />
            </div>
            <div>
              Rate Type:{' '}
              <SelectInput
                value={income.rateType}
                options={rateTypeOptions}
                onChange={setIncome('rateType')}
              />
            </div>
            {income.rateType === 'hourly' && (
              <div>
                Hours Per Week:{' '}
                <NumberInput value={income.hoursPerWeek} onChange={setIncome('hoursPerWeek')} />
              </div>
            )}
            <div>
              Rate: <NumberInput value={income.rate} onChange={setIncome('rate')} />
            </div>
            <div>
              Roth Retirement Match (%):{' '}
              <NumberInput
                value={income.rothRetirementMatchPercentage}
                onChange={setIncome('rothRetirementMatchPercentage')}
              />
            </div>
            <div>
              Traditional Retirement Match (%):{' '}
              <NumberInput
                value={income.traditionalRetirementMatchPercentage}
                onChange={setIncome('traditionalRetirementMatchPercentage')}
              />
            </div>
            <p>Taxable Income: {formatDollars(getTaxableIncome(income))}</p>
            <p>Company Contribution: {formatDollars(getCompanyContribution(income))}</p>
            <p>Total: {formatDollars(getTotalIncome(income))}</p>
            <p>
              <button onClick={actions.deleteIncome(income.id)}>Delete</button>
            </p>
          </div>
        );
      })}
      <button onClick={actions.createIncome}>Add Income</button>

      <h3>Income Details</h3>
      <p>
        Total W2 Income:{' '}
        {formatDollars(getCombinedTaxableIncome(incomes.filter((i) => i.incomeType === 'w2')))}
      </p>
      <p>
        Total Self Employment Income:{' '}
        {formatDollars(
          getCombinedTaxableIncome(incomes.filter((i) => i.incomeType === 'self-employment')),
        )}
      </p>
      <p>
        Total Non-FICA Income (put this on &quot;Additional Income&quot; on W4):{' '}
        {formatDollars(
          getCombinedTaxableIncome(incomes.filter((i) => i.incomeType === 'non-fica')),
        )}
      </p>
      <p>Total Taxable Income: {formatDollars(totalTaxable)}</p>
      <p>Total Company Contribution: {formatDollars(totalCompanyContribution)}</p>
      <p>Total Compensation: {formatDollars(totalIncome)}</p>
    </div>
  );
};
