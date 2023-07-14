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
import { defaultUserData, getActions, useUserData } from 'src/modules/Firebase';
import { Account, Balance, Investment } from 'src/modules/Investment';
import { formatDollars, formatPercentage } from 'src/modules/String';

type BalanceMap = Record<Investment['id'], Record<Account['id'], Balance>>;

export const InvestmentZone = () => {
  const { userData, setUserData } = useUserData();

  const { balances, investments, accounts, newInvestmentValue } = userData || defaultUserData;

  const actions = getActions(userData || defaultUserData, setUserData);

  const investmentIdToAccountIdToBalance: BalanceMap = useMemo(() => {
    const result: BalanceMap = {};
    balances.forEach((balance) => {
      const a = result[balance.investmentId] || {};
      a[balance.accountId] = balance;
      result[balance.investmentId] = a;
    });
    return result;
  }, [balances]);

  const totalInvestmentValue = useMemo(() => {
    return investments.reduce((totalAcc, curInvestment) => {
      return (
        totalAcc +
        accounts.reduce((accountAcc, curAccount) => {
          const b = investmentIdToAccountIdToBalance[curInvestment.id]?.[curAccount.id];
          return accountAcc + (b?.value || 0);
        }, 0)
      );
    }, 0);
  }, [investments, accounts, investmentIdToAccountIdToBalance]);

  const investmentDetails = useMemo(() => {
    return investments.map((investment) => {
      const currentInvestmentValue = accounts.reduce((acc, account) => {
        const b = investmentIdToAccountIdToBalance[investment.id]?.[account.id];
        return acc + (b?.value || 0);
      }, 0);
      const currentAllocationPercentage = (100 * currentInvestmentValue) / totalInvestmentValue;
      const currentAllocatinPercentageWithNewInvestment =
        (100 * currentInvestmentValue) / (totalInvestmentValue + (newInvestmentValue || 0));
      const difference = currentAllocationPercentage - (investment.targetPercentage || 0);
      const differenceWithNewInvestment =
        currentAllocatinPercentageWithNewInvestment - (investment.targetPercentage || 0);
      const yearlyRebalance = 0 - (difference / 100) * totalInvestmentValue;
      const yearlyRebalanceWithNewInvestment =
        0 - (differenceWithNewInvestment / 100) * totalInvestmentValue;

      return {
        ...investment,
        currentInvestmentValue,
        currentAllocationPercentage,
        difference,
        yearlyRebalance,
        differenceWithNewInvestment,
        yearlyRebalanceWithNewInvestment,
      };
    });
  }, [
    investments,
    accounts,
    investmentIdToAccountIdToBalance,
    totalInvestmentValue,
    newInvestmentValue,
  ]);

  const fullInvestmentDetails = useMemo(() => {
    const negativeInvestments = investmentDetails.filter((i) => i.differenceWithNewInvestment < 0);
    const totalNegativeRebalance = negativeInvestments.reduce(
      (acc, i) => i.yearlyRebalanceWithNewInvestment + acc,
      0,
    );
    return investmentDetails.map((investment) => {
      const contributionRebalance =
        investment.differenceWithNewInvestment < 0
          ? (newInvestmentValue || 0) *
            (investment.yearlyRebalanceWithNewInvestment / totalNegativeRebalance)
          : 0;

      return {
        ...investment,
        contributionRebalance,
      };
    });
  }, [investmentDetails, newInvestmentValue]);

  if (!userData) {
    return <div>Loading...</div>;
  }

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
            <div>
              <b>{account.name}</b>
            </div>
            <div>
              Name: <TextInput value={account.name} onChange={setField('name')} />
            </div>
            <div>
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
          </div>
        );
      })}
      <button onClick={actions.createAccount}>Create Account</button>
      <h1>Investments</h1>
      <p>
        New investment:{' '}
        <NumberInput value={newInvestmentValue} onChange={actions.setField('newInvestmentValue')} />
      </p>
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
          {fullInvestmentDetails.map((investment) => {
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
                <TableEntry>{formatDollars(investment.currentInvestmentValue)}</TableEntry>
                <TableEntry>
                  <NumberInput
                    value={investment.targetPercentage}
                    onChange={setField('targetPercentage')}
                  />
                </TableEntry>
                <TableEntry>{formatPercentage(investment.currentAllocationPercentage)}</TableEntry>
                <TableEntry>{formatPercentage(investment.difference)}</TableEntry>
                <TableEntry>{formatDollars(investment.yearlyRebalance)}</TableEntry>
                <TableEntry>{formatDollars(investment.contributionRebalance)}</TableEntry>
                <TableEntry>Actions</TableEntry>
              </TableRow>
            );
          })}
          <TableRow>
            <TableEntry>Total</TableEntry>
            <TableEntry>Total</TableEntry>
            <TableEntry>Total</TableEntry>
            {accounts.map((account) => {
              const value = fullInvestmentDetails.reduce(
                (acc, investment) =>
                  acc + (investmentIdToAccountIdToBalance[investment.id]?.[account.id]?.value || 0),
                0,
              );
              return <TableEntry key={account.id}>{formatDollars(value)}</TableEntry>;
            })}
            <TableEntry>
              {formatDollars(
                fullInvestmentDetails.reduce(
                  (acc, investment) => acc + investment.currentInvestmentValue,
                  0,
                ),
              )}
            </TableEntry>
            <TableEntry>100%</TableEntry>
            <TableEntry>-</TableEntry>
            <TableEntry>-</TableEntry>
            <TableEntry>-</TableEntry>
            <TableEntry>-</TableEntry>
            <TableEntry>Actions</TableEntry>
          </TableRow>
        </TableBody>
      </Table>

      {investments.map((investment) => {
        return <div key={investment.id}></div>;
      })}
    </div>
  );
};
