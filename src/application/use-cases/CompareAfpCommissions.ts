import type { AfpCommission } from "@/config/afpCommissions";

const PERCENT_DENOMINATOR = 100;
const MONTHS_PER_YEAR = 12;

export interface AfpCommissionComparisonRow extends AfpCommission {
  monthlyCommissionCost: number;
  extraMonthlyCostVsCheapest: number;
  isCheapest: boolean;
}

export interface AfpCommissionComparisonOutput {
  taxableSalary: number;
  cheapestCommissionPercent: number;
  mostExpensiveCommissionPercent: number;
  maxExtraMonthlyCost: number;
  maxExtraAnnualCost: number;
  rows: AfpCommissionComparisonRow[];
}

function assertCommissions(commissions: AfpCommission[]): void {
  if (commissions.length === 0) {
    throw new Error("commissions must include at least one AFP.");
  }

  commissions.forEach(({ name, commission, total }) => {
    if (!name.trim()) {
      throw new Error("commission name must not be empty.");
    }
    if (!Number.isFinite(commission) || commission < 0) {
      throw new Error(
        "commission must be a finite number greater than or equal to 0."
      );
    }
    if (!Number.isFinite(total) || total < commission) {
      throw new Error("total must be a finite number greater than commission.");
    }
  });
}

export function compareAfpCommissions(
  taxableSalary: number,
  commissions: AfpCommission[]
): AfpCommissionComparisonOutput {
  if (!Number.isFinite(taxableSalary) || taxableSalary < 0) {
    throw new Error(
      "taxableSalary must be a finite number greater than or equal to 0."
    );
  }
  assertCommissions(commissions);

  const sortedCommissions = [...commissions].sort(
    (a, b) => a.commission - b.commission
  );
  const cheapestCommissionPercent = sortedCommissions[0].commission;
  const mostExpensiveCommissionPercent =
    sortedCommissions[sortedCommissions.length - 1].commission;

  const rows = sortedCommissions.map(afp => {
    const monthlyCommissionCost =
      (afp.commission / PERCENT_DENOMINATOR) * taxableSalary;
    const extraMonthlyCostVsCheapest =
      ((afp.commission - cheapestCommissionPercent) / PERCENT_DENOMINATOR) *
      taxableSalary;

    return {
      ...afp,
      monthlyCommissionCost,
      extraMonthlyCostVsCheapest,
      isCheapest: afp.commission === cheapestCommissionPercent,
    };
  });

  const maxExtraMonthlyCost =
    ((mostExpensiveCommissionPercent - cheapestCommissionPercent) /
      PERCENT_DENOMINATOR) *
    taxableSalary;

  return {
    taxableSalary,
    cheapestCommissionPercent,
    mostExpensiveCommissionPercent,
    maxExtraMonthlyCost,
    maxExtraAnnualCost: maxExtraMonthlyCost * MONTHS_PER_YEAR,
    rows,
  };
}
