import { Income } from './Income';
import { createStore } from './SavedStore';
import { v4 as uuidv4 } from 'uuid';

type State = {
  incomes: Array<Income>;
};

const defaultState: State = {
  incomes: [],
};

export const { useStore, useSaved, actions } = createStore({
  storageKey: 'monies',
  defaultState,
  createActions: ({ get, set }) => {
    return {
      createIncome: () => {
        set((state) => ({
          ...state,
          incomes: [
            ...state.incomes,
            {
              id: uuidv4(),
              name: '',
              rateType: 'annual',
              incomeType: 'w2',
              rate: 0,
              retirementMatchPercentage: 0,
            },
          ],
        }));
      },
      setIncome:
        (id: Income['id']) =>
        <K extends keyof Income>(key: K) =>
        (value: Income[K]) => {
          const incomeIndex = get().incomes.findIndex((income) => income.id === id);
          const income = get().incomes[incomeIndex];
          if (!income) return;

          set((state) => ({
            ...state,
            incomes: [
              ...state.incomes.slice(0, incomeIndex),
              { ...income, [key]: value },
              ...state.incomes.slice(incomeIndex + 1),
            ],
          }));
        },
    };
  },
});
