import { v4 as uuidv4 } from 'uuid';

export type Person = {
  id: string;
  name: string;
};

export const defaultPerson = () => {
  return { id: uuidv4(), name: 'Me' };
};
