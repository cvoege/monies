import {
  List as ImmutableList,
  Set as ImmutableSet,
  OrderedMap as ImmutableOrderedMap,
} from 'immutable';

export {
  List as ImmutableList,
  Map as ImmutableMap,
  Set as ImmutableSet,
  Repeat as ImmutableRepeat,
  Range as ImmutableRange,
  Collection as ImmutableCollection,
  isList,
} from 'immutable';

export const partition = <T>(list: ImmutableList<T>, fn: (t: T) => unknown) => {
  return list.reduce<[ImmutableList<T>, ImmutableList<T>]>(
    ([left, right], value) => (fn(value) ? [left.push(value), right] : [left, right.push(value)]),
    [ImmutableList(), ImmutableList()],
  );
};

export const reverseIf = <T>(condition: boolean, list: ImmutableList<T>) => {
  return condition ? list.reverse() : list;
};

export const setToggle = <T>(set: ImmutableSet<T>, item: T) => {
  return set.has(item) ? set.delete(item) : set.add(item);
};

export const choice = <T>(list: ImmutableList<T>): T => {
  return list.get(Math.floor(Math.random() * list.size), list.first());
};

export const uniq = <T, K>(list: ImmutableList<T>, fn?: (item: T) => K): ImmutableList<T> => {
  return ImmutableOrderedMap(list.map((item) => [fn ? fn(item) : item, item])).toList();
};

const cleanString = (str: string) => {
  return str
    .replace('&', 'and')
    .replace(/[^a-z0-9]/gi, '')
    .trim()
    .toLowerCase();
};

export const searchFilter = <T>(
  query: string,
  items: ImmutableList<T>,
  nameMapper: (item: T) => string,
): ImmutableList<T> =>
  items.filter((item) => {
    const itemName = nameMapper(item);
    const cleanSearch = cleanString(query);
    const cleanItemName = cleanString(itemName);

    return (
      cleanItemName.includes(cleanSearch) ||
      itemName.includes(cleanSearch) ||
      itemName.includes(query)
    );
  });

export const compact = <T>(list: ImmutableList<T | undefined | null>) => {
  return list.filter(Boolean) as ImmutableList<T>;
};
