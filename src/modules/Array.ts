export const mapArrayToObject = <T, K extends string | number | symbol, V>(
  array: T[],
  fn: (t: T, index: number) => [K, V],
): Record<K, V> => {
  const result: Record<K, V> = {} as Record<K, V>;
  array.forEach((elem, index) => {
    const [k, v] = fn(elem, index);
    result[k] = v;
  });
  return result;
};
