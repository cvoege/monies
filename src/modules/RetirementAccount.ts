export const MAX_IRA_CONTRIBUTION = 6000;
export const MAX_INDIVIDUAL_401K_CONTRIBUTION = 20500;
export const MAX_TOTAL_401K_CONTRIBUTION = 61000;

export type RetirementAccountInfo = {
  iraContributionType: 'mixed' | 'max-roth' | 'max-traditional';
  rothIraContribution: number | null;
  traditionalIraContribution: number | null;
  my401kContributionType: 'mixed' | 'max-roth' | 'max-traditional';
  roth401kContribution: number | null;
  traditional401kContribution: number | null;
};

export const defaultRetirementAccountInfo = (): RetirementAccountInfo => {
  return {
    iraContributionType: 'mixed',
    rothIraContribution: 0,
    traditionalIraContribution: 0,
    my401kContributionType: 'mixed',
    roth401kContribution: 0,
    traditional401kContribution: 0,
  };
};
