import { ChangeEventHandler, useCallback } from 'react';
import { ImmutableList } from '../modules/Immutable';

export type SelectOption<T> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type SelectInputProps<T> = {
  /** ID of the input */
  id?: string;
  /** Value of input */
  value: T | undefined;
  /** Name for input in form */
  name?: string;
  /** Event handler for change event */
  onChange: (newValue: T, evt: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Options */
  options: ImmutableList<SelectOption<T>>;
  title?: string;
};

export function SelectInput<T extends string | number | string[] | undefined>({
  onChange,
  value,
  options,
  ...basicProps
}: SelectInputProps<T>) {
  const realOnChange = useCallback(
    (event: Parameters<ChangeEventHandler<HTMLSelectElement>>[0]) => {
      const option = options.get(event.target.selectedIndex);
      if (!option) return;
      onChange(option.value, event);
    },
    [onChange, options],
  );

  return (
    <select {...basicProps} value={value} onChange={realOnChange}>
      {options.map((option, i) => (
        <option key={i} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
