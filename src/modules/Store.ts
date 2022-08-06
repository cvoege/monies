import { Income } from './Income';
import { createStore } from './SavedStore';

type State = {
  incomes: Array<Income>;
};

const defaultState: State = {
  incomes: [],
};

export const { useStore } = createStore('monies', defaultState);
