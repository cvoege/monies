import { Income } from './Income';
import { createStore } from './SavedStore';
import { v4 as uuidv4 } from 'uuid';

type State = {
  incomes: Array<Income>;
  downloadStateLink: string | null;
};

const defaultState: State = {
  incomes: [],
  downloadStateLink: null,
};

export const { useStore, useSaved, actions } = createStore({
  storageKey: 'monies',
  defaultState,
  createActions: ({ get, set, encode, getMemoryState }) => {
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
      clearState: () => {
        set(() => defaultState);
      },
      downloadState: () => {
        const data = encode(getMemoryState());
        const blob = new Blob([data], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        set((s) => ({ ...s, downloadStateLink: url }));
      },
    };
  },
});
