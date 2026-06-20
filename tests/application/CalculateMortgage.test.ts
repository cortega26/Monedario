import { describe, expect, it } from "vitest";
import { calculateMortgage } from "@/application/use-cases/CalculateMortgage";
import { calculateAnnuityPayment } from "@/application/use-cases/shared/creditAmortization";
import { mortgageWorkedExample } from "@/application/use-cases/CalculateMortgage.methodology";

const UF_VALUE = 39841.72;

describe("calculateMortgage", () => {
  it("standard UF loan: 20% down, 4.5% annual, 20 years", () => {
    const result = calculateMortgage({
      propertyValue: 5000,
      currency: "uf",
      downPaymentPercent: 20,
      annualRatePercent: 4.5,
      termYears: 20,
      ufValuePesos: UF_VALUE,
    });

    // Loan = 5000 * 0.80 = 4000 UF
    expect(result.loanAmountUF).toBeCloseTo(4000, 4);
    expect(result.downPaymentAmountUF).toBeCloseTo(1000, 4);

    // Monthly rate = (1.045)^(1/12) - 1
    const expectedMonthlyRate = Math.pow(1.045, 1 / 12) - 1;
    expect(result.monthlyRateDecimal).toBeCloseTo(expectedMonthlyRate, 8);

    // Verify base payment via annuity formula
    const expectedPayment = calculateAnnuityPayment(4000, expectedMonthlyRate, 240);
    expect(result.basePaymentUF).toBeCloseTo(expectedPayment, 4);

    // Amortization schedule: 240 months
    expect(result.amortizationSchedule.length).toBe(240);

    // Month 1: interest + capital ≈ basePayment
    const row1 = result.amortizationSchedule[0];
    expect(row1.interestUF + row1.capitalUF).toBeCloseTo(result.basePaymentUF, 6);

    // Month 1 interest = loanAmount * monthlyRate
    expect(row1.interestUF).toBeCloseTo(4000 * expectedMonthlyRate, 6);

    // No insurance inputs → desgravamen and fire = 0
    expect(row1.desgravamenUF).toBe(0);
    expect(row1.fireInsuranceUF).toBe(0);
    expect(row1.totalMonthlyUF).toBeCloseTo(result.basePaymentUF, 6);

    // Final balance should be (approximately) zero
    const lastRow = result.amortizationSchedule[239];
    expect(lastRow.balanceUF).toBeCloseTo(0, 1);

    // Pesos amounts are consistent
    expect(result.loanAmountPesos).toBeCloseTo(4000 * UF_VALUE, 0);
    expect(result.basePaymentPesos).toBeCloseTo(result.basePaymentUF * UF_VALUE, 0);
  });

  it("pesos input: $200.000.000 property, 80% financing", () => {
    const result = calculateMortgage({
      propertyValue: 200_000_000,
      currency: "pesos",
      downPaymentPercent: 20,
      annualRatePercent: 4.5,
      termYears: 20,
      ufValuePesos: UF_VALUE,
    });

    const expectedLoanUF = (200_000_000 * 0.8) / UF_VALUE;
    expect(result.loanAmountUF).toBeCloseTo(expectedLoanUF, 4);
    expect(result.loanAmountPesos).toBeCloseTo(200_000_000 * 0.8, 0);
    expect(result.downPaymentAmountPesos).toBeCloseTo(200_000_000 * 0.2, 0);
  });

  it("with desgravamen: rate declines as balance decreases", () => {
    const result = calculateMortgage({
      propertyValue: 4000,
      currency: "uf",
      downPaymentPercent: 20,
      annualRatePercent: 4.5,
      termYears: 20,
      ufValuePesos: UF_VALUE,
      monthlyDesgravamenRatePercent: 0.025,
    });

    const row1 = result.amortizationSchedule[0];
    const row2 = result.amortizationSchedule[1];

    // Month 1 desgravamen = loanAmount * (rate/100)
    const loanUF = 4000 * 0.8; // 3200 UF
    expect(row1.desgravamenUF).toBeCloseTo(loanUF * 0.00025, 6);

    // Month 2 balance is lower → desgravamen must be smaller
    expect(row2.desgravamenUF).toBeLessThan(row1.desgravamenUF);

    // insuranceMonth1 includes desgravamen (fire = 0)
    expect(result.insuranceMonth1UF).toBeCloseTo(row1.desgravamenUF, 6);
  });

  it("with fire insurance: fireInsuranceUF is constant across all months", () => {
    const fireInsurance = 0.5;
    const result = calculateMortgage({
      propertyValue: 3000,
      currency: "uf",
      downPaymentPercent: 20,
      annualRatePercent: 4.5,
      termYears: 15,
      ufValuePesos: UF_VALUE,
      monthlyFireInsuranceUF: fireInsurance,
    });

    for (const row of result.amortizationSchedule) {
      expect(row.fireInsuranceUF).toBe(fireInsurance);
    }

    // insuranceMonth1 = 0 (no desgravamen) + fireInsurance
    expect(result.insuranceMonth1UF).toBeCloseTo(fireInsurance, 6);
    expect(result.totalPaymentMonth1UF).toBeCloseTo(
      result.basePaymentUF + fireInsurance,
      6
    );
  });

  it("validation: downPaymentPercent = 0 throws", () => {
    expect(() =>
      calculateMortgage({
        propertyValue: 5000,
        currency: "uf",
        downPaymentPercent: 0,
        annualRatePercent: 4.5,
        termYears: 20,
        ufValuePesos: UF_VALUE,
      })
    ).toThrow();
  });

  it("validation: termYears = 40 throws", () => {
    expect(() =>
      calculateMortgage({
        propertyValue: 5000,
        currency: "uf",
        downPaymentPercent: 20,
        annualRatePercent: 4.5,
        termYears: 40,
        ufValuePesos: UF_VALUE,
      })
    ).toThrow();
  });

  it("validation: annualRatePercent = 0 throws", () => {
    expect(() =>
      calculateMortgage({
        propertyValue: 5000,
        currency: "uf",
        downPaymentPercent: 20,
        annualRatePercent: 0,
        termYears: 20,
        ufValuePesos: UF_VALUE,
      })
    ).toThrow();
  });

  describe("ejemplo de metodología — anti-drift", () => {
    it("el crédito y el dividendo reales coinciden con el ejemplo publicado", () => {
      // Si la fórmula cambia y el ejemplo mostrado al usuario queda
      // desactualizado, este test falla.
      const result = calculateMortgage(mortgageWorkedExample.input);
      const expected = mortgageWorkedExample.expected;
      expect(result.loanAmountUF).toBeCloseTo(expected.loanAmountUF, 6);
      // La UI muestra el dividendo en pesos redondeado a peso entero.
      expect(Math.round(result.basePaymentPesos)).toBe(
        expected.basePaymentPesosRounded
      );
    });
  });
});
