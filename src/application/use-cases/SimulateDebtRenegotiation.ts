import { calculateAnnuityPayment } from "./shared/creditAmortization";

export interface DebtItemInput {
  amount: number;
  overdueDays: number;
  /**
   * Identidad del acreedor. La Ley 20.720 art. 260 exige dos o más
   * obligaciones vencidas "provenientes de obligaciones diversas"; sin
   * identificar al acreedor no es posible verificar que sean distintas.
   */
  creditor: string;
}

export interface DebtRenegotiationInput {
  debts: DebtItemInput[];
  monthlyIncome: number;
  termMonths: number;
  monthlyRatePercent: number;
  ufValue: number;
  hasFirstCategoryActivityLast24Months: boolean;
  hasNotifiedExecutiveProceeding: boolean;
  hasRequiredDocuments: boolean;
  minimumOverdueDays?: number;
  minimumDebtUf?: number;
}

export interface DebtRenegotiationOutput {
  totalDebtClp: number;
  totalDebtUf: number;
  qualifiedDebtUf: number;
  qualifiedDebtCount: number;
  minimumOverdueDays: number;
  minimumDebtUf: number;
  qualifiedCreditorCount: number;
  requirementChecks: {
    hasTwoOrMoreDebts: boolean;
    hasTwoOrMoreQualifiedDebts: boolean;
    hasTwoOrMoreDistinctCreditors: boolean;
    reachesMinimumUf: boolean;
    hasNoFirstCategoryActivity: boolean;
    hasNoNotifiedExecutiveProceeding: boolean;
    hasRequiredDocuments: boolean;
  };
  meetsBasicEligibility: boolean;
  canSubmitApplication: boolean;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  incomeBurdenPercent: number;
}

function assertInput(input: DebtRenegotiationInput): void {
  if (!Array.isArray(input.debts) || input.debts.length === 0) {
    throw new Error("debts must include at least one item.");
  }
  for (const debt of input.debts) {
    if (
      typeof debt.creditor !== "string" ||
      debt.creditor.trim().length === 0
    ) {
      throw new Error("Cada deuda debe indicar su acreedor.");
    }
  }
  if (!Number.isFinite(input.monthlyIncome) || input.monthlyIncome <= 0) {
    throw new Error("monthlyIncome must be a finite number greater than 0.");
  }
  if (!Number.isFinite(input.termMonths) || input.termMonths <= 0) {
    throw new Error("termMonths must be a finite number greater than 0.");
  }
  if (
    !Number.isFinite(input.monthlyRatePercent) ||
    input.monthlyRatePercent < 0
  ) {
    throw new Error("monthlyRatePercent must be a finite number >= 0.");
  }
  if (!Number.isFinite(input.ufValue) || input.ufValue <= 0) {
    throw new Error("ufValue must be a finite number greater than 0.");
  }
  if (typeof input.hasFirstCategoryActivityLast24Months !== "boolean") {
    throw new Error(
      "hasFirstCategoryActivityLast24Months must be a boolean value."
    );
  }
  if (typeof input.hasNotifiedExecutiveProceeding !== "boolean") {
    throw new Error("hasNotifiedExecutiveProceeding must be a boolean value.");
  }
  if (typeof input.hasRequiredDocuments !== "boolean") {
    throw new Error("hasRequiredDocuments must be a boolean value.");
  }
}

export function simulateDebtRenegotiation(
  input: DebtRenegotiationInput
): DebtRenegotiationOutput {
  assertInput(input);

  const minimumOverdueDays = input.minimumOverdueDays ?? 91;
  const minimumDebtUf = input.minimumDebtUf ?? 80;

  const totalDebtClp = input.debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalDebtUf = totalDebtClp / input.ufValue;
  const qualifiedDebts = input.debts.filter(
    debt => debt.amount > 0 && debt.overdueDays >= minimumOverdueDays
  );
  const qualifiedDebtUf =
    qualifiedDebts.reduce((sum, debt) => sum + debt.amount, 0) / input.ufValue;

  const hasTwoOrMoreDebts =
    input.debts.filter(debt => debt.amount > 0).length >= 2;
  const hasTwoOrMoreQualifiedDebts = qualifiedDebts.length >= 2;
  const qualifiedCreditors = new Set(
    qualifiedDebts.map(debt => debt.creditor.trim().toLowerCase())
  );
  const qualifiedCreditorCount = qualifiedCreditors.size;
  const hasTwoOrMoreDistinctCreditors = qualifiedCreditorCount >= 2;
  const reachesMinimumUf = qualifiedDebtUf >= minimumDebtUf;
  const hasNoFirstCategoryActivity =
    !input.hasFirstCategoryActivityLast24Months;
  const hasNoNotifiedExecutiveProceeding =
    !input.hasNotifiedExecutiveProceeding;
  const meetsBasicEligibility =
    hasTwoOrMoreDebts &&
    hasTwoOrMoreQualifiedDebts &&
    hasTwoOrMoreDistinctCreditors &&
    reachesMinimumUf &&
    hasNoFirstCategoryActivity &&
    hasNoNotifiedExecutiveProceeding;
  const canSubmitApplication =
    meetsBasicEligibility && input.hasRequiredDocuments;

  const monthlyRateDecimal = input.monthlyRatePercent / 100;
  const monthlyPayment = calculateAnnuityPayment(
    totalDebtClp,
    monthlyRateDecimal,
    input.termMonths
  );
  const totalPaid = monthlyPayment * input.termMonths;
  const totalInterest = totalPaid - totalDebtClp;
  const incomeBurdenPercent = (monthlyPayment / input.monthlyIncome) * 100;

  return {
    totalDebtClp,
    totalDebtUf,
    qualifiedDebtUf,
    qualifiedDebtCount: qualifiedDebts.length,
    qualifiedCreditorCount,
    minimumOverdueDays,
    minimumDebtUf,
    requirementChecks: {
      hasTwoOrMoreDebts,
      hasTwoOrMoreQualifiedDebts,
      hasTwoOrMoreDistinctCreditors,
      reachesMinimumUf,
      hasNoFirstCategoryActivity,
      hasNoNotifiedExecutiveProceeding,
      hasRequiredDocuments: input.hasRequiredDocuments,
    },
    meetsBasicEligibility,
    canSubmitApplication,
    monthlyPayment,
    totalPaid,
    totalInterest,
    incomeBurdenPercent,
  };
}
