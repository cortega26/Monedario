import type { EconomicParameters } from "@/domain/economic/EconomicParameters";
import { calculateSecondCategoryTax } from "@/domain/taxation/TaxEngine";
import {
  calculateMonthlyPayrollBase,
  type PayrollContractType,
} from "@/application/use-cases/CalculateMonthlyPayrollBase";
import { MONTHS_PER_YEAR } from "./shared/financialConstants";

export interface ApvComparisonInput {
  grossSalary: number;
  taxableSalary?: number;
  monthlyApvContribution: number;
  annualDirectApvContribution?: number;
  afpRatePercent: number;
  healthSystem: "fonasa" | "isapre";
  isapreAdditionalPercent?: number;
  contractType?: PayrollContractType;
  economicParameters: Pick<
    EconomicParameters,
    "uf" | "utm" | "afcTopes" | "previsionalTopes"
  >;
}

export interface ApvComparisonOutput {
  grossSalary: number;
  taxableSalary: number;
  nonTaxableIncome: number;
  taxableBase: number;
  taxWithoutApv: number;
  marginalRate: number;
  contractType: PayrollContractType;
  cappedBases: {
    pensionAndHealth: number;
    unemploymentInsurance: number;
  };
  regimeA: {
    monthlyContributionForMaxBonus: number;
    annualContributionForMaxBonus: number;
    effectiveAnnualContribution: number;
    monthlyTax: number;
    monthlyBenefit: number;
    annualBonus: number;
  };
  regimeB: {
    reducedTaxBase: number;
    monthlyTax: number;
    monthlyBenefit: number;
    annualBenefit: number;
    effectiveMonthlyContribution: number;
    effectiveMonthlyPayrollContribution: number;
    effectiveAnnualPayrollContribution: number;
    effectiveAnnualDirectContribution: number;
    effectiveAnnualContribution: number;
    monthlyContributionCap: number;
    annualContributionCap: number;
  };
  mixedStrategy: {
    contributionToRegimeA: number;
    contributionToRegimeB: number;
    annualContributionToRegimeA: number;
    annualContributionToRegimeB: number;
    reducedTaxBase: number;
    monthlyTax: number;
    regimeAMonthlyBenefit: number;
    regimeBMonthlyBenefit: number;
    monthlyBenefit: number;
    annualBenefit: number;
  };
  recommendedStrategy: "A" | "B" | "MIXED";
}


// DL 3500 art. 20 O: bonificacion fiscal Regimen A, 15% del ahorro con tope anual de 6 UTM.
const REGIME_A_STATE_BONUS_RATE = 0.15;
const REGIME_A_ANNUAL_BONUS_CAP_UTM = 6;
const REGIME_A_ANNUAL_CONTRIBUTION_FOR_MAX_BONUS_UTM = 40;

// LIR art. 42 bis: rebaja APV Regimen B con tope 50 UF mensual / 600 UF anual.
const REGIME_B_MONTHLY_PAYROLL_CAP_UF = 50;
const REGIME_B_ANNUAL_CONTRIBUTION_CAP_UF = 600;

// LIR art. 43: tramo superior del IUSC empieza sobre 70 UTM mensuales.
const TOP_MARGINAL_TAX_BRACKET_THRESHOLD_UTM = 70;

function assertInput(input: ApvComparisonInput): void {
  if (!Number.isFinite(input.grossSalary) || input.grossSalary <= 0) {
    throw new Error("grossSalary must be a finite number greater than 0.");
  }
  if (
    !Number.isFinite(input.monthlyApvContribution) ||
    input.monthlyApvContribution < 0
  ) {
    throw new Error(
      "monthlyApvContribution must be a finite number greater than or equal to 0."
    );
  }
  if (
    input.annualDirectApvContribution !== undefined &&
    (!Number.isFinite(input.annualDirectApvContribution) ||
      input.annualDirectApvContribution < 0)
  ) {
    throw new Error(
      "annualDirectApvContribution must be a finite number greater than or equal to 0."
    );
  }
  if (
    input.monthlyApvContribution + (input.annualDirectApvContribution ?? 0) <=
    0
  ) {
    throw new Error("At least one APV contribution must be greater than 0.");
  }
  if (!Number.isFinite(input.afpRatePercent) || input.afpRatePercent <= 0) {
    throw new Error("afpRatePercent must be a finite number greater than 0.");
  }
  if (
    !Number.isFinite(input.economicParameters.utm) ||
    input.economicParameters.utm <= 0
  ) {
    throw new Error(
      "economicParameters.utm must be a finite number greater than 0."
    );
  }
  if (
    !Number.isFinite(input.economicParameters.uf) ||
    input.economicParameters.uf <= 0
  ) {
    throw new Error(
      "economicParameters.uf must be a finite number greater than 0."
    );
  }
}

export function calculateApvComparison(
  input: ApvComparisonInput
): ApvComparisonOutput {
  assertInput(input);

  const annualDirectApvContribution = input.annualDirectApvContribution ?? 0;
  const payroll = calculateMonthlyPayrollBase({
    grossSalary: input.grossSalary,
    taxableSalary: input.taxableSalary,
    afpRatePercent: input.afpRatePercent,
    healthSystem: input.healthSystem,
    isapreAdditionalPercent: input.isapreAdditionalPercent,
    contractType: input.contractType,
    economicParameters: input.economicParameters,
  });
  const taxableBase = payroll.incomeTaxBase;

  const taxWithoutApv = calculateSecondCategoryTax({
    taxableIncome: taxableBase,
    utm: input.economicParameters.utm,
  });

  const monthlyContributionForMaxBonus =
    (REGIME_A_ANNUAL_CONTRIBUTION_FOR_MAX_BONUS_UTM *
      input.economicParameters.utm) /
    MONTHS_PER_YEAR;
  const annualContributionForMaxBonus =
    REGIME_A_ANNUAL_CONTRIBUTION_FOR_MAX_BONUS_UTM *
    input.economicParameters.utm;
  const annualApvContribution =
    input.monthlyApvContribution * MONTHS_PER_YEAR +
    annualDirectApvContribution;
  const annualBonus = Math.min(
    annualApvContribution * REGIME_A_STATE_BONUS_RATE,
    REGIME_A_ANNUAL_BONUS_CAP_UTM * input.economicParameters.utm
  );
  const monthlyBenefitA = annualBonus / MONTHS_PER_YEAR;

  const monthlyContributionCap =
    REGIME_B_MONTHLY_PAYROLL_CAP_UF * input.economicParameters.uf;
  const annualContributionCap =
    REGIME_B_ANNUAL_CONTRIBUTION_CAP_UF * input.economicParameters.uf;
  const effectiveMonthlyPayrollContribution = Math.min(
    input.monthlyApvContribution,
    monthlyContributionCap
  );
  const effectiveAnnualPayrollContribution = Math.min(
    effectiveMonthlyPayrollContribution * MONTHS_PER_YEAR,
    annualContributionCap
  );
  const effectiveAnnualDirectContribution = Math.min(
    annualDirectApvContribution,
    Math.max(0, annualContributionCap - effectiveAnnualPayrollContribution)
  );
  const effectiveAnnualContribution =
    effectiveAnnualPayrollContribution + effectiveAnnualDirectContribution;
  const effectiveMonthlyContribution =
    effectiveAnnualContribution / MONTHS_PER_YEAR;
  const reducedTaxBase = Math.max(
    0,
    taxableBase - effectiveMonthlyContribution
  );
  const taxWithRegimeB = calculateSecondCategoryTax({
    taxableIncome: reducedTaxBase,
    utm: input.economicParameters.utm,
  });
  const monthlyBenefitB = taxWithoutApv.taxAmount - taxWithRegimeB.taxAmount;
  const highRateThresholdTaxableBase =
    TOP_MARGINAL_TAX_BRACKET_THRESHOLD_UTM * input.economicParameters.utm;
  const annualContributionToRegimeBHighRate = Math.min(
    effectiveAnnualContribution,
    Math.max(0, taxableBase - highRateThresholdTaxableBase) * MONTHS_PER_YEAR
  );
  const remainingAnnualContribution = Math.max(
    0,
    annualApvContribution - annualContributionToRegimeBHighRate
  );
  const annualContributionToRegimeA = Math.min(
    remainingAnnualContribution,
    annualContributionForMaxBonus
  );
  const annualContributionToRegimeBRemaining = Math.min(
    Math.max(0, remainingAnnualContribution - annualContributionToRegimeA),
    Math.max(0, annualContributionCap - annualContributionToRegimeBHighRate)
  );
  const annualContributionToRegimeB =
    annualContributionToRegimeBHighRate + annualContributionToRegimeBRemaining;
  const contributionToRegimeA = annualContributionToRegimeA / MONTHS_PER_YEAR;
  const contributionToRegimeB = annualContributionToRegimeB / MONTHS_PER_YEAR;
  const mixedReducedTaxBase = Math.max(0, taxableBase - contributionToRegimeB);
  const taxWithMixedStrategy = calculateSecondCategoryTax({
    taxableIncome: mixedReducedTaxBase,
    utm: input.economicParameters.utm,
  });
  const mixedRegimeBMonthlyBenefit =
    taxWithoutApv.taxAmount - taxWithMixedStrategy.taxAmount;
  const mixedRegimeAMonthlyBenefit =
    Math.min(
      annualContributionToRegimeA * REGIME_A_STATE_BONUS_RATE,
      REGIME_A_ANNUAL_BONUS_CAP_UTM * input.economicParameters.utm
    ) / MONTHS_PER_YEAR;
  const mixedMonthlyBenefit =
    mixedRegimeAMonthlyBenefit + mixedRegimeBMonthlyBenefit;
  const mixedAnnualBenefit =
    mixedRegimeAMonthlyBenefit * MONTHS_PER_YEAR +
    mixedRegimeBMonthlyBenefit * MONTHS_PER_YEAR;

  const recommendedStrategy =
    mixedMonthlyBenefit > monthlyBenefitA &&
    mixedMonthlyBenefit > monthlyBenefitB
      ? "MIXED"
      : monthlyBenefitA >= monthlyBenefitB
        ? "A"
        : "B";

  return {
    grossSalary: input.grossSalary,
    taxableSalary: payroll.taxableSalary,
    nonTaxableIncome: payroll.nonTaxableIncome,
    taxableBase,
    taxWithoutApv: taxWithoutApv.taxAmount,
    marginalRate: taxWithoutApv.marginalRate,
    contractType: payroll.contractType,
    cappedBases: payroll.cappedBases,
    regimeA: {
      monthlyContributionForMaxBonus,
      annualContributionForMaxBonus,
      effectiveAnnualContribution: Math.min(
        annualApvContribution,
        annualContributionForMaxBonus
      ),
      monthlyTax: taxWithoutApv.taxAmount,
      monthlyBenefit: monthlyBenefitA,
      annualBonus,
    },
    regimeB: {
      reducedTaxBase,
      monthlyTax: taxWithRegimeB.taxAmount,
      monthlyBenefit: monthlyBenefitB,
      annualBenefit: monthlyBenefitB * MONTHS_PER_YEAR,
      effectiveMonthlyContribution,
      effectiveMonthlyPayrollContribution,
      effectiveAnnualPayrollContribution,
      effectiveAnnualDirectContribution,
      effectiveAnnualContribution,
      monthlyContributionCap,
      annualContributionCap,
    },
    mixedStrategy: {
      contributionToRegimeA,
      contributionToRegimeB,
      annualContributionToRegimeA,
      annualContributionToRegimeB,
      reducedTaxBase: mixedReducedTaxBase,
      monthlyTax: taxWithMixedStrategy.taxAmount,
      regimeAMonthlyBenefit: mixedRegimeAMonthlyBenefit,
      regimeBMonthlyBenefit: mixedRegimeBMonthlyBenefit,
      monthlyBenefit: mixedMonthlyBenefit,
      annualBenefit: mixedAnnualBenefit,
    },
    recommendedStrategy,
  };
}
