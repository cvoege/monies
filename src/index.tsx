import { createRoot } from 'react-dom/client';
import { NumberInput, TextInput } from './components/Input';
import { SelectInput } from './components/SelectInput';
import { incomeTypeOptions, rateTypeOptions } from './modules/Income';
import { actions, useSaved, useStore } from './modules/Store';

const App = () => {
  // const { state, setState, saved, clearState, downloadState } = useStore();
  const saved = useSaved();
  const { incomes } = useStore((s) => ({ incomes: s.incomes }), []);

  return (
    <div>
      <p>
        {saved ? 'Saved' : 'Saving...'}
        {/* <button onClick={clearState}>Clear Saved State</button>
        <button onClick={downloadState}>Download State</button> */}
      </p>
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
      <button onClick={actions.createIncome}>Add Income</button>
    </div>
  );
};

const rootElem = document.getElementById('root');
if (rootElem) {
  const root = createRoot(rootElem);
  root.render(<App />);
} else {
  throw new Error('could not');
}
