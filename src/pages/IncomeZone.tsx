import { useStore, actions } from '../modules/Store';
import { NumberInput, TextInput } from '../components/Input';
import { SelectInput } from '../components/SelectInput';
import { incomeTypeOptions, rateTypeOptions } from '../modules/Income';

export const IncomeZone = () => {
  const { incomes, people } = useStore((s) => ({ incomes: s.incomes, people: s.people }), []);

  return (
    <div>
      <h1>Income</h1>
      {incomes.map((income) => {
        const setIncome = actions.setIncome(income.id);

        return (
          <div style={{ border: '1px solid black' }} key={income.id}>
            {income.name}
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
          </div>
        );
      })}
      <button onClick={actions.createIncome}>Add Income</button>
    </div>
  );
};
