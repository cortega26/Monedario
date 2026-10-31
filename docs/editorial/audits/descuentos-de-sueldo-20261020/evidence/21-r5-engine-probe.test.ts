import { expect, it } from "vitest";
import { AFP_COMMISSIONS_PERCENT } from "@/config/afpCommissions";
import { calculateApvComparison } from "@/application/use-cases/CalculateApvComparison";
import {
  calculateNetSalary,
  estimateGrossFromNet,
} from "@/application/use-cases/CalculateNetSalary";

const economicParameters = {
  uf: 41_226.39,
  utm: 72_151,
  afcTopes: { monthlyTaxableCapUf: 135.2 },
  previsionalTopes: { pensionAndHealthMonthlyTaxableCapUf: 90 },
};

const common = {
  healthSystem: "fonasa" as const,
  contractType: "casa-particular" as const,
  economicParameters,
};

it("casa particular has no worker AFC in every payroll path probed", () => {
  const grossToNet = calculateNetSalary({
    grossSalary: 1_000_000,
    afpRatePercent: 11.44,
    ...common,
  });
  const netToGross = estimateGrossFromNet({
    targetNetSalary: 900_000,
    afpRatePercent: 11.44,
    ...common,
  });
  const afpForward = AFP_COMMISSIONS_PERCENT.map(afp => {
    const result = calculateNetSalary({
      grossSalary: 1_000_000,
      afpRatePercent: afp.total,
      ...common,
    });
    return {
      afp: afp.name,
      rate: afp.total,
      workerAfc: result.deductions.unemploymentInsurance,
      net: result.netSalary,
    };
  });
  const afpInverse = AFP_COMMISSIONS_PERCENT.map(afp => {
    const result = estimateGrossFromNet({
      targetNetSalary: 900_000,
      afpRatePercent: afp.total,
      ...common,
    });
    return {
      afp: afp.name,
      rate: afp.total,
      workerAfc: result.deductions.unemploymentInsurance,
      gross: result.grossSalary,
    };
  });
  const apv = calculateApvComparison({
    grossSalary: 1_500_000,
    monthlyApvContribution: 100_000,
    afpRatePercent: 11.44,
    healthSystem: "fonasa",
    contractType: "casa-particular",
    economicParameters,
  });
  const apvOmittedContract = calculateApvComparison({
    grossSalary: 1_500_000,
    monthlyApvContribution: 100_000,
    afpRatePercent: 11.44,
    healthSystem: "fonasa",
    economicParameters,
  });
  const rentaPayroll = calculateNetSalary({
    grossSalary: 1_500_000,
    afpRatePercent: 11.44,
    ...common,
  });

  expect(grossToNet.deductions.unemploymentInsurance).toBe(0);
  expect(netToGross.deductions.unemploymentInsurance).toBe(0);
  expect(afpForward.every(result => result.workerAfc === 0)).toBe(true);
  expect(afpInverse.every(result => result.workerAfc === 0)).toBe(true);
  expect(apv.contractType).toBe("casa-particular");
  expect(apv.taxableBase).toBe(1_223_400);
  expect(apvOmittedContract.contractType).toBe("indefinido");
  expect(apvOmittedContract.taxableBase).toBe(1_214_400);
  expect(rentaPayroll.contractType).toBe("casa-particular");
  expect(rentaPayroll.deductions.unemploymentInsurance).toBe(0);

  process.stdout.write(
    JSON.stringify(
      {
        grossToNet: {
          contractType: grossToNet.contractType,
          workerAfc: grossToNet.deductions.unemploymentInsurance,
          netSalary: grossToNet.netSalary,
        },
        netToGross: {
          contractType: netToGross.contractType,
          workerAfc: netToGross.deductions.unemploymentInsurance,
          grossSalary: netToGross.grossSalary,
          netSalary: netToGross.netSalary,
        },
        afpForward,
        afpInverse,
        apv: {
          explicitHome: {
            contractType: apv.contractType,
            taxableBase: apv.taxableBase,
          },
          omittedContractDefaults: {
            contractType: apvOmittedContract.contractType,
            taxableBase: apvOmittedContract.taxableBase,
          },
          baseDifference: apv.taxableBase - apvOmittedContract.taxableBase,
        },
        renta: {
          contractType: rentaPayroll.contractType,
          workerAfc: rentaPayroll.deductions.unemploymentInsurance,
          monthlyTaxableBase: rentaPayroll.taxableBase,
          annualizedBase: Math.round(rentaPayroll.taxableBase * 12),
        },
      },
      null,
      2
    ) + "\n"
  );
});
