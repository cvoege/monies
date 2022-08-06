import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';

const SAVE_DEBOUNCE_BUFFER = 1000;

export const createStore = <State>(key: string, defaultState: State) => {
  const encode = (value: State) => JSON.stringify(state);
  const decode = (value: string): State => JSON.parse(value);

  const fetchSavedState = () => {
    let savedStateStr = localStorage.getItem(key);
    const savedState = savedStateStr ? decode(savedStateStr) : defaultState;
    return savedState;
  };

  let saved = true;
  let savedState = fetchSavedState();
  let state = savedState;
  let onChangeListeners: Array<() => unknown> = [];

  const subscribe = (fn: () => unknown) => {
    onChangeListeners.push(fn);
    return () => {
      const index = onChangeListeners.indexOf(fn);
      onChangeListeners.splice(index, 1);
    };
  };

  const setSavedState = debounce((value: State) => {
    localStorage.setItem(key, encode(value));
    saved = true;
    savedState = value;
    onChangeListeners.forEach((listener) => listener());
  }, SAVE_DEBOUNCE_BUFFER);

  const setState = (value: State) => {
    state = value;
    saved = false;
    onChangeListeners.forEach((listener) => listener());
    setSavedState(value);
  };

  const clearState = () => {
    setState(defaultState);
  };

  const downloadState = () => {
    const data = encode(state);
    const blob = new Blob([data], {
      type: 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const useStore = () => {
    const [memorySaved, setMemorySaved] = useState<boolean>(saved);
    const [memoryState, setMemoryState] = useState<State>(savedState);
    useEffect(() => {
      const unsub = subscribe(() => {
        setMemoryState(state);
        setMemorySaved(saved);
      });
      return () => {
        unsub();
      };
    }, []);

    return { state: memoryState, setState, saved: memorySaved, clearState, downloadState };
  };

  return { useStore };
};
