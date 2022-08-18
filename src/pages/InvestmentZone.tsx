import { useMemo } from 'react';
import { NumberInput, TextInput } from 'src/components/Input';
import { SelectInput } from 'src/components/SelectInput';
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableEntry,
} from 'src/components/Table';
import { Account, Balance, Investment } from 'src/modules/Investment';
import { actions, useStore } from 'src/modules/Store';
import { formatDollars } from 'src/modules/String';

type BalanceMap = Record<Investment['id'], Record<Account['id'], Balance>>;

export const InvestmentZone = () => {
  const { investments, accounts, balances } = useStore(
    (s) => ({ investments: s.investments, balances: s.balances, accounts: s.accounts }),
    [],
  );
  const investmentIdToAccountIdToBalance: BalanceMap = useMemo(() => {
    const result: BalanceMap = {};
    balances.forEach((balance) => {
      const a = result[balance.investmentId] || {};
      a[balance.accountId] = balance;
      result[balance.investmentId] = a;
    });
    return result;
  }, [balances]);

  return (
    <div>
      <h1>Accounts</h1>
      {accounts.map((account) => {
        const setField = actions.setAccountField(account.id);
        return (
          <div
            key={account.id}
            style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}
          >
            <b>{account.name}</b>
            Name: <TextInput value={account.name} onChange={setField('name')} />
            Type:{' '}
            <SelectInput
              value={account.type}
              onChange={setField('type')}
              options={[
                { value: 'taxable', label: 'Taxable' },
                { value: 'hsa', label: 'HSA' },
                { value: 'roth', label: 'Roth' },
                { value: 'traditional', label: 'Traditional' },
              ]}
            />
          </div>
        );
      })}
      <button onClick={actions.createAccount}>Create Account</button>
      <h1>Investments</h1>
      <button onClick={actions.createInvestment}>Create Investment</button>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Asset Type</TableHeader>
            <TableHeader>Exposure Type</TableHeader>
            {accounts.map((account) => (
              <TableHeader key={account.id}>{account.name} Balance ($)</TableHeader>
            ))}
            <TableHeader>Total Allocation ($)</TableHeader>
            <TableHeader>Target Allocation (%)</TableHeader>
            <TableHeader>Total Allocation (%)</TableHeader>
            <TableHeader>Difference (%)</TableHeader>
            <TableHeader>Yearly Rebalance</TableHeader>
            <TableHeader>Contribution Rebalance</TableHeader>
            <TableHeader>Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {investments.map((investment) => {
            const setField = actions.setInvestmentField(investment.id);
            return (
              <TableRow key={investment.id}>
                <TableEntry>
                  <TextInput value={investment.name} onChange={setField('name')} />
                </TableEntry>
                <TableEntry>{investment.assetType}</TableEntry>
                <TableEntry>{investment.exposureType}</TableEntry>
                {accounts.map((account) => {
                  const balance = investmentIdToAccountIdToBalance[investment.id]?.[account.id];
                  return (
                    <TableEntry key={account.id}>
                      <NumberInput
                        value={balance?.value || 0}
                        onChange={actions.setBalance(investment.id)(account.id)}
                      />
                    </TableEntry>
                  );
                })}
                <TableEntry>
                  {formatDollars(
                    accounts.reduce((acc, account) => {
                      const b = investmentIdToAccountIdToBalance[investment.id]?.[account.id];
                      return acc + (b?.value || 0);
                    }, 0),
                  )}
                </TableEntry>
                <TableEntry>Target Allocation (%)</TableEntry>
                <TableEntry>Total Allocation (%)</TableEntry>
                <TableEntry>Difference (%)</TableEntry>
                <TableEntry>Yearly Rebalance</TableEntry>
                <TableEntry>Contribution Rebalance</TableEntry>
                <TableEntry>Actions</TableEntry>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {investments.map((investment) => {
        return <div key={investment.id}></div>;
      })}
    </div>
  );
};
