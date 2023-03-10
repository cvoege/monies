import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

type TextInputProps = {
  value: string;
  onChange?: (newValue: string, event: React.ChangeEvent<HTMLInputElement>) => unknown;
};
export const TextInput = ({ value, onChange }: TextInputProps) => {
  const realOnChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      onChange?.(event.target.value, event);
    },
    [onChange],
  );
  return <input type="text" value={value} onChange={realOnChange} />;
};

type NumberInputProps = {
  value: number | null;
  onChange?: (
    newValue: number | null,
    stringValue: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => unknown;
  min?: number;
  max?: number;
};

export const clamp = ({ min, max, value }: { min?: number; max?: number; value: number }) => {
  const ceilinged = typeof max === 'number' ? Math.min(max, value) : value;
  const floored = typeof min === 'number' ? Math.max(min, ceilinged) : ceilinged;
  return floored;
};

export const NumberInput = ({ onChange, value, min, max, ...basicProps }: NumberInputProps) => {
  const numberValueRef = useRef(value);
  const [stringValue, setStringValue] = useState(String(value));

  useEffect(() => {
    if (typeof value === 'number' && value !== numberValueRef.current) {
      numberValueRef.current = value;
      setStringValue(String(value));
    }
  }, [value]);

  const realOnChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const baseStringValue = event.target.value;
      const trimmedStringValue = baseStringValue.replaceAll(/[,$\s]/g, '');
      const baseNumberValue = parseFloat(trimmedStringValue);
      const newNumberValue = Number.isNaN(baseNumberValue)
        ? null
        : clamp({ value: baseNumberValue, min, max });
      console.log({baseStringValue, trimmedStringValue, baseNumberValue, newNumberValue})
      numberValueRef.current = newNumberValue;
      const newStringValue =
        typeof newNumberValue === 'number' && newNumberValue !== baseNumberValue
          ? String(newNumberValue)
          : baseStringValue;

      setStringValue(newStringValue);
      onChange?.(numberValueRef.current, newStringValue, event);
    },
    [onChange, min, max],
  );

  return (
    <input
      {...basicProps}
      type="number"
      value={stringValue}
      onChange={realOnChange}
      onKeyDown={(event) => event.stopPropagation()}
      min={min}
      max={max}
    />
  );
};
