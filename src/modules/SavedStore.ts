import { useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';

const SAVE_DEBOUNCE_BUFFER = 200;
const CURRENT_MIGRATION_VERSION = 0;

const shallowEquals = <T>(obj1: T, obj2: T): boolean => {
  if (
    typeof obj1 === 'bigint' ||
    typeof obj1 === 'boolean' ||
    typeof obj1 === 'number' ||
    typeof obj1 === 'string' ||
    typeof obj1 === 'symbol' ||
    obj1 === undefined ||
    obj1 === null ||
    typeof obj2 === 'bigint' ||
    typeof obj2 === 'boolean' ||
    typeof obj2 === 'number' ||
    typeof obj2 === 'string' ||
    typeof obj2 === 'symbol' ||
    obj2 === undefined ||
    obj2 === null
  ) {
    return obj1 === obj2;
  }
  if (Array.isArray(obj1)) {
    if (!Array.isArray(obj2)) return false;
    return obj1.length === obj2.length && obj1.every((v, i) => v === obj2[i]);
  }
  return (
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every(
      (key) => (obj1 as Record<string, unknown>)[key] === (obj2 as Record<string, unknown>)[key],
    )
  );
};
type SavedState<State> = {
  version: number;
  state: State;
};

type MemoryState<State> = SavedState<State> & { saved: boolean };

type Encode<State> = (value: MemoryState<State>) => string;
type Decode<State> = (value: string) => MemoryState<State>;

export const createStore = <State, Actions>({
  storageKey,
  defaultState,
  createActions,
}: {
  storageKey: string;
  defaultState: State;
  createActions: (opts: {
    get: () => State;
    set: (fn: (s: State) => State) => unknown;
    encode: Encode<State>;
    decode: Decode<State>;
    getMemoryState: () => MemoryState<State>;
  }) => Actions;
}) => {
  const encode: Encode<State> = (value) =>
    JSON.stringify({ state: value.state, version: CURRENT_MIGRATION_VERSION });
  const decode: Decode<State> = (value) => JSON.parse(value);

  const fetchSavedState = (): SavedState<State> => {
    const savedStateStr = localStorage.getItem(storageKey);
    const savedState = savedStateStr
      ? decode(savedStateStr)
      : { state: defaultState, version: CURRENT_MIGRATION_VERSION };
    return savedState;
  };

  const initialSavedState = fetchSavedState();
  let memoryState: MemoryState<State> = {
    ...initialSavedState,
    saved: true,
  };
  const onChangeListeners: Array<() => unknown> = [];
  const onSaveListeners: Array<() => unknown> = [];

  const subscribe = (fn: () => unknown) => {
    onChangeListeners.push(fn);
    return () => {
      const index = onChangeListeners.indexOf(fn);
      onChangeListeners.splice(index, 1);
    };
  };

  const subscribeToSave = (fn: () => unknown) => {
    onSaveListeners.push(fn);
    return () => {
      const index = onSaveListeners.indexOf(fn);
      onSaveListeners.splice(index, 1);
    };
  };

  const setSavedState = debounce(() => {
    localStorage.setItem(storageKey, encode(memoryState));
    memoryState = { ...memoryState, saved: true };
    onSaveListeners.forEach((listener) => listener());
  }, SAVE_DEBOUNCE_BUFFER);

  const setState = (fn: (oldState: State) => State) => {
    memoryState = { ...memoryState, state: fn(memoryState.state), saved: false };
    onSaveListeners.forEach((listener) => listener());
    onChangeListeners.forEach((listener) => listener());
    setSavedState();
  };

  const actions = createActions({
    get: () => memoryState.state,
    set: setState,
    encode,
    decode,
    getMemoryState: () => memoryState,
  });

  const useStore = <SelectedState>(
    selector: (currentState: State) => SelectedState,
    dependencies: Array<unknown>,
  ) => {
    const selectedState = selector(memoryState.state);
    const [hookState, setHookState] = useState<SelectedState>(selectedState);
    const currentHookStateRef = useRef<SelectedState>(selectedState);
    const previousDependenciesRef = useRef<Array<unknown>>(dependencies);

    // Separate useEffect hooks avoid the first hook re-subscribing every render
    // because dependencies are just passed in as a flat array, which will be a
    // different object every render

    useEffect(() => {
      const unsub = subscribe(() => {
        const oldHookState = currentHookStateRef.current;
        const newHookState = selector(memoryState.state);
        if (!shallowEquals(oldHookState, newHookState)) {
          currentHookStateRef.current = newHookState;
          setHookState(newHookState);
        }
      });
      return () => {
        unsub();
      };
    }, [selector]);

    useEffect(() => {
      const newHookState = selector(memoryState.state);
      const oldDependencies = previousDependenciesRef.current;
      if (
        dependencies.length !== oldDependencies.length ||
        dependencies.some((dependency, i) => !shallowEquals(dependency, oldDependencies[i]))
      ) {
        currentHookStateRef.current = newHookState;
        previousDependenciesRef.current = dependencies;
        setHookState(newHookState);
      }
    }, [selector, dependencies]);

    return hookState;
  };

  const useSaved = () => {
    const [hookSaved, setHookSaved] = useState<boolean>(memoryState.saved);
    useEffect(() => {
      const unsub = subscribeToSave(() => {
        setHookSaved(memoryState.saved);
      });
      return () => {
        unsub();
      };
    }, []);

    return hookSaved;
  };
  return { useStore, useSaved, actions };
};
