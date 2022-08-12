import { defaultIncome, Income } from './Income';
import { createStore, Decode, Encode } from './SavedStore';
import { defaultPerson, Person } from './Person';

type State = {
  people: [Person] | [Person, Person];
  incomes: Array<Income>;
  downloadStateLink: string | null;
  rothIraContribution: number | null;
  traditionalIraContribution: number | null;
  iraContributionType: 'mixed' | 'max-roth' | 'max-traditional';
  roth401kContribution: number | null;
  traditional401kContribution: number | null;
  my401kContributionType: 'mixed' | 'max-roth' | 'max-traditional';
};

const defaultState: State = {
  people: [defaultPerson()],
  incomes: [],
  downloadStateLink: null,
  rothIraContribution: 0,
  traditionalIraContribution: 0,
  iraContributionType: 'mixed',
  roth401kContribution: 0,
  traditional401kContribution: 0,
  my401kContributionType: 'mixed',
};

/* eslint-disable @typescript-eslint/no-explicit-any */
type Migration = { migrate: (previousState: any) => any };

const migrations: Array<Migration> = [];
/* eslint-enable @typescript-eslint/no-explicit-any */

const CURRENT_STATE_VERSION = migrations.length;

const encode: Encode<State> = (value) => JSON.stringify(value);
const decode: Decode<State> = (value, version) => {
  const base = JSON.parse(value);
  const migrated = migrations
    .slice(version)
    .reduce((acc, migration) => migration.migrate(acc), base);
  return migrated;
};

export const { useStore, useSaved, actions } = createStore({
  storageKey: 'monies',
  defaultState,
  encode,
  decode,
  currentVersion: CURRENT_STATE_VERSION,
  createActions: ({ get, set, getMemoryState, encodeMemoryState }) => {
    return {
      createIncome: () => {
        set((state) => ({
          ...state,
          incomes: [...state.incomes, defaultIncome(state.people[0].id)],
        }));
      },
      setIncome:
        (id: Income['id']) =>
        <K extends keyof Income>(key: K) =>
        (value: Income[K]) => {
          const incomeIndex = get().incomes.findIndex((income) => income.id === id);
          const income = get().incomes[incomeIndex];
          const updates =
            key === 'rateType' && value === 'hourly'
              ? { rateType: 'hourly' as const, hoursPerWeek: 0 }
              : { [key]: value };
          if (!income) return;

          set((state) => ({
            ...state,
            incomes: [
              ...state.incomes.slice(0, incomeIndex),
              { ...income, ...updates },
              ...state.incomes.slice(incomeIndex + 1),
            ],
          }));
        },
      switchPersonSetting: () => {
        const { people } = get();
        if (people.length === 1) {
          set((state) => ({
            ...state,
            people: [people[0], defaultPerson()],
          }));
        } else {
          set((state) => ({
            ...state,
            people: [people[0]],
          }));
        }
      },
      setPerson:
        (id: Person['id']) =>
        <K extends keyof Person>(key: K) =>
        (value: Person[K]) => {
          const { people } = get();
          const personIndex = people.findIndex((person) => person.id === id);
          const result: typeof people = [
            personIndex === 0 ? { ...people[0], [key]: value } : people[0],
          ];
          if (people.length === 2)
            result.push(personIndex === 1 ? { ...people[1], [key]: value } : people[1]);

          set((state) => ({
            ...state,
            people: result,
          }));
        },
      clearState: () => {
        set(() => defaultState);
      },
      downloadState: () => {
        const data = encodeMemoryState(getMemoryState());
        const blob = new Blob([data], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        set((s) => ({ ...s, downloadStateLink: url }));
      },
      setField:
        <K extends keyof State>(key: K) =>
        (value: State[K]) => {
          set((s) => ({ ...s, [key]: value }));
        },
    };
  },
});
