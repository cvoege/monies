import { newIncome, Income } from './Income';
import { createStore, Decode, Encode } from './SavedStore';
import { defaultPerson, Person } from './Person';
import { defaultRetirementAccountInfo, RetirementAccountInfo } from './RetirementAccount';
import { Account, Balance, Investment, newAccount, newBalance, newInvestment } from './Investment';

type State = {
  w2PaycheckFrequency: 'weekly' | 'every-two-weeks' | 'monthly' | 'twice-per-month';
  downloadStateLink: string | null;
  people: [Person] | [Person, Person];
  incomes: Array<Income>;
  retirementAccountInfo: RetirementAccountInfo;
  newInvestmentValue: number | null;
  investments: Array<Investment>;
  accounts: Array<Account>;
  balances: Array<Balance>;
};

const defaultState: State = {
  w2PaycheckFrequency: 'twice-per-month',
  people: [defaultPerson()],
  incomes: [],
  downloadStateLink: null,
  retirementAccountInfo: defaultRetirementAccountInfo(),
  investments: [],
  accounts: [],
  balances: [],
  newInvestmentValue: 0,
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
  createActions: ({ get, set, getMemoryState, encodeMemoryState, setMemoryState }) => {
    return {
      load: () => {
        set((state) => ({ ...state, investments: [], accounts: [], balances: [] }));
      },
      createIncome: () => {
        set((state) => ({
          ...state,
          incomes: [...state.incomes, newIncome(state.people[0].id)],
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
      setRetirementInfoField:
        <K extends keyof RetirementAccountInfo>(key: K) =>
        (value: RetirementAccountInfo[K]) => {
          set((s) => ({
            ...s,
            retirementAccountInfo: { ...s.retirementAccountInfo, [key]: value },
          }));
        },
      deletePerson: (id: Person['id']) => () => {
        set((s) => {
          if (s.people.length !== 2) return s;
          const index = s.people.findIndex((p) => p.id === id);
          const person = s.people[index];
          if (!person) return s;

          return {
            ...s,
            people: [s.people[index === 0 ? 1 : 0]],
            incomes: s.incomes.filter((i) => i.personId !== id),
          };
        });
      },
      uploadState: (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;
        const file = files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = function (evt) {
          const text = evt.target?.result;
          if (!text) return;

          setMemoryState(text as string);
        };
        reader.onerror = function () {
          alert("Couldn't process the file you sent");
        };
      },
      deleteIncome: (id: Income['id']) => () => {
        set((s) => ({ ...s, incomes: s.incomes.filter((i) => i.id !== id) }));
      },
      setAccountField:
        (id: Account['id']) =>
        <K extends keyof Account>(key: K) =>
        (value: Account[K]) => {
          const accountIndex = get().accounts.findIndex((account) => account.id === id);
          const account = get().accounts[accountIndex];
          if (!account) return;

          set((state) => ({
            ...state,
            accounts: [
              ...state.accounts.slice(0, accountIndex),
              { ...account, [key]: value },
              ...state.accounts.slice(accountIndex + 1),
            ],
          }));
        },
      createAccount: () => {
        set((s) => ({ ...s, accounts: [...s.accounts, newAccount()] }));
      },
      deleteAccount: (id: Account['id']) => () => {
        set((s) => ({ ...s, accounts: s.accounts.filter((a) => a.id !== id) }));
      },
      setInvestmentField:
        (id: Investment['id']) =>
        <K extends keyof Investment>(key: K) =>
        (value: Investment[K]) => {
          const investmentIndex = get().investments.findIndex((investment) => investment.id === id);
          const investment = get().investments[investmentIndex];
          if (!investment) return;

          set((state) => ({
            ...state,
            investments: [
              ...state.investments.slice(0, investmentIndex),
              { ...investment, [key]: value },
              ...state.investments.slice(investmentIndex + 1),
            ],
          }));
        },
      createInvestment: () => {
        set((s) => ({ ...s, investments: [...s.investments, newInvestment()] }));
      },
      deleteInvestment: (id: Investment['id']) => () => {
        set((s) => ({ ...s, investments: s.investments.filter((a) => a.id !== id) }));
      },
      setBalance: (investmentId: string) => (accountId: string) => (value: number | null) => {
        const existingBalance =
          get().balances.find(
            (b) => b.investmentId === investmentId && b.accountId === accountId,
          ) || newBalance({ investmentId, accountId });
        set((s) => ({
          ...s,
          balances: [
            ...s.balances.filter((b) => b.id !== existingBalance.id),
            { ...existingBalance, value: value || 0 },
          ],
        }));
      },
    };
  },
});
