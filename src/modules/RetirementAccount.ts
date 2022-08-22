export const RETIREMENT_CONTRIBUTION_MAXES = {
  single: {
    ira: 6000,
    hsa: 3600,
    individual401k: 20500,
    total401k: 61000,
  },
  joint: {
    ira: 12000,
    hsa: 7200,
    individual401k: 41000,
    total401k: 122000,
  },
};
export type RetirementAccountInfo = {
  hsaContributionType: 'custom' | 'max';
  hsaContribution: number | null;
  iraContributionType: 'custom' | 'max-roth' | 'max-traditional';
  rothIraContribution: number | null;
  traditionalIraContribution: number | null;
  my401kContributionType: 'custom' | 'max-roth' | 'max-traditional';
  roth401kContribution: number | null;
  traditional401kContribution: number | null;
};

export const defaultRetirementAccountInfo = (): RetirementAccountInfo => {
  return {
    hsaContributionType: 'custom',
    hsaContribution: 0,
    iraContributionType: 'custom',
    rothIraContribution: 0,
    traditionalIraContribution: 0,
    my401kContributionType: 'custom',
    roth401kContribution: 0,
    traditional401kContribution: 0,
  };
};
