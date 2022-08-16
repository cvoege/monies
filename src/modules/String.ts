const roundTo = (value: number, digits: number) => {
  const multiplier = 10 ** digits;
  return Math.round(value * multiplier) / multiplier;
};

export const formatDollars = (value: number) => {
  return `$${roundTo(value, 2).toLocaleString()}`;
};

export const formatPercentage = (value: number) => {
  return `${roundTo(value, 2).toLocaleString()}%`;
};
