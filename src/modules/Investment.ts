import { v4 as uuidv4 } from 'uuid';

export type Investment = {
  id: string;
  name: string;
  assetType: 'stock' | 'bond' | 'balanced';
  exposureType: 'us' | 'international' | 'mixed';
  targetPercentage: number | null;
};

export type Account = {
  id: string;
  name: string;
  type: 'taxable' | 'roth' | 'traditional' | 'hsa';
};

export type Balance = {
  id: string;
  investmentId: string;
  accountId: string;
  value: number;
};

export const newAccount = (): Account => {
  return {
    id: uuidv4(),
    name: '',
    type: 'taxable',
  };
};

export const newInvestment = (): Investment => {
  return {
    id: uuidv4(),
    name: '',
    assetType: 'stock',
    exposureType: 'us',
    targetPercentage: 0,
  };
};

export const newBalance = ({
  investmentId,
  accountId,
}: {
  investmentId: string;
  accountId: string;
}): Balance => {
  return {
    id: uuidv4(),
    investmentId,
    accountId,
    value: 0,
  };
};
