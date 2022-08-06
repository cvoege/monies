import { render } from 'react-dom';
import { NumberInput, TextInput } from './components/Input';
import { SelectInput } from './components/SelectInput';
import { Income, incomeTypeOptions, rateTypeOptions } from './modules/Income';
import { useStore } from './modules/Store';

const App = () => {
  const { state, setState, saved, clearState, downloadState } = useStore();

  return (
    <div>
      <p>
        {saved ? 'Saved' : 'Saving...'}
        <button onClick={clearState}>Clear Saved State</button>
        <button onClick={downloadState}>Download State</button>
      </p>
      <h1>Income</h1>
      {state.incomes.map((income, i) => {
        const setIncome =
          <K extends keyof Income>(key: K) =>
          (value: Income[K]) =>
            setState({
              ...state,
              incomes: [
                ...state.incomes.slice(0, i),
                { ...income, [key]: value },
                ...state.incomes.slice(i + 1),
              ],
            });
        return (
          <div style={{ border: '1px solid black' }}>
            {income.name}
            <div>
              Name: <TextInput value={income.name} onChange={setIncome('name')} />
            </div>
            <div>
              Income Type Type:{' '}
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
              Retirement Match (%):{' '}
              <NumberInput
                value={income.retirementMatchPercentage}
                onChange={setIncome('retirementMatchPercentage')}
              />
            </div>
          </div>
        );
      })}
      <button
        onClick={() =>
          setState({
            ...state,
            incomes: [
              ...state.incomes,
              {
                name: '',
                rateType: 'annual',
                incomeType: 'w2',
                rate: 0,
                retirementMatchPercentage: 0,
              },
            ],
          })
        }
      >
        Add Income
      </button>
    </div>
  );
};

render(<App />, document.getElementById('root'));
