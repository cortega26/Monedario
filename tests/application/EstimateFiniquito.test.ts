import { describe, expect, it } from "vitest";
import { estimateFiniquito } from "@/application/use-cases/EstimateFiniquito";
import { finiquitoWorkedExample } from "@/application/use-cases/EstimateFiniquito.methodology";

describe("estimateFiniquito", () => {
  it("estimates years of service, substitute notice and proportional vacation", () => {
    const result = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 4,
      additionalMonthsWorked: 7,
      pendingSalaryDays: 12,
      monthsSinceLastVacationCycle: 8,
      additionalVacationDaysWorked: 15,
      terminationCause: "necesidad",
      noticeGiven: false,
    });

    expect(result.serviceYearsCounted).toBe(5);
    expect(result.cappedServiceYears).toBe(5);
    expect(result.pendingSalaryAmount).toBe(360000);
    expect(result.proportionalVacationDays).toBeCloseTo(10.625, 6);
    expect(result.proportionalVacationAmount).toBeCloseTo(318750, 6);
    expect(result.yearsOfServiceIndemnity).toBe(4500000);
    expect(result.substituteNoticeIndemnity).toBe(900000);
    // No judicial cause → no surcharge, no gratificación
    expect(result.art168SurchargePercent).toBe(0);
    expect(result.art168SurchargeAmount).toBe(0);
    expect(result.gratificacionProporcionalAmount).toBe(0);
    expect(result.totalEstimate).toBeCloseTo(6078750, 6);
  });

  it("applies the 11-year cap and removes legal indemnities when the cause does not qualify", () => {
    const result = estimateFiniquito({
      monthlySalary: 1200000,
      yearsWorked: 14,
      additionalMonthsWorked: 2,
      monthsSinceLastVacationCycle: 3,
      terminationCause: "renuncia",
      noticeGiven: false,
    });

    expect(result.serviceYearsCounted).toBe(14);
    expect(result.cappedServiceYears).toBe(11);
    expect(result.yearsOfServiceIndemnity).toBe(0);
    expect(result.substituteNoticeIndemnity).toBe(0);
    expect(result.proportionalVacationAmount).toBeCloseTo(150000, 6);
  });

  it("marks judicial cases for professional review while keeping a base estimate", () => {
    const result = estimateFiniquito({
      monthlySalary: 1000000,
      yearsWorked: 2,
      additionalMonthsWorked: 6,
      terminationCause: "judicial",
      noticeGiven: true,
    });

    expect(result.compensationProfile.appliesYearsOfService).toBe(true);
    expect(result.compensationProfile.appliesSubstituteNotice).toBe(false);
    expect(result.compensationProfile.requiresProfessionalReview).toBe(true);
    // 6 meses exactos no suman año (fracción debe ser SUPERIOR a 6, art. 163).
    expect(result.serviceYearsCounted).toBe(2);
    expect(result.yearsOfServiceIndemnity).toBe(2000000);
  });

  // ── TD-0109: art. 168 CT vigente (recargo por causal declarada) ─────────
  it("art. 168: improcedente art. 161 → 30% de recargo", () => {
    const result = estimateFiniquito({
      monthlySalary: 800000,
      yearsWorked: 2,
      terminationCause: "judicial",
      noticeGiven: true,
      judicialDeclarationType: "improcedente-161",
    });

    expect(result.art168SurchargePercent).toBe(0.3);
    expect(result.yearsOfServiceIndemnity).toBe(1600000);
    expect(result.art168SurchargeAmount).toBe(480000);
    expect(result.compensationProfile.requiresProfessionalReview).toBe(true);
  });

  it("art. 168: injustificada art. 159 o sin causal → 50% de recargo", () => {
    const result = estimateFiniquito({
      monthlySalary: 1000000,
      yearsWorked: 4,
      additionalMonthsWorked: 7,
      terminationCause: "judicial",
      noticeGiven: false,
      judicialDeclarationType: "injustificada-159",
    });

    expect(result.serviceYearsCounted).toBe(5);
    expect(result.art168SurchargePercent).toBe(0.5);
    expect(result.yearsOfServiceIndemnity).toBe(5000000);
    expect(result.art168SurchargeAmount).toBe(2500000);
  });

  it("art. 168: indebida art. 160 → 80% de recargo", () => {
    const result = estimateFiniquito({
      monthlySalary: 1200000,
      yearsWorked: 8,
      terminationCause: "judicial",
      noticeGiven: true,
      judicialDeclarationType: "indebida-160",
    });

    expect(result.art168SurchargePercent).toBe(0.8);
    expect(result.yearsOfServiceIndemnity).toBe(9600000);
    expect(result.art168SurchargeAmount).toBe(7680000);
  });

  it("art. 168: sin tipo de declaración no se estima recargo", () => {
    const result = estimateFiniquito({
      monthlySalary: 1000000,
      yearsWorked: 5,
      terminationCause: "judicial",
      noticeGiven: true,
    });

    expect(result.art168SurchargePercent).toBe(0);
    expect(result.art168SurchargeAmount).toBe(0);
  });

  it("non-judicial cause has zero art. 168 surcharge", () => {
    const result = estimateFiniquito({
      monthlySalary: 1000000,
      yearsWorked: 10,
      terminationCause: "necesidad",
      noticeGiven: false,
    });

    expect(result.art168SurchargePercent).toBe(0);
    expect(result.art168SurchargeAmount).toBe(0);
  });

  // ── TD-0109: tope 90 UF (art. 172) ──────────────────────────────────────
  it("FIN-01: topa la base de las indemnizaciones a 90 UF", () => {
    const ufValue = 40000; // 90 UF = 3.600.000
    const result = estimateFiniquito({
      monthlySalary: 5000000,
      ufValue,
      yearsWorked: 10,
      terminationCause: "necesidad",
      noticeGiven: false,
    });

    expect(result.baseSalaryCappedByUf).toBe(true);
    expect(result.cappedSalaryBase).toBe(3600000);
    // Indemnización y aviso previo usan la base topada.
    expect(result.yearsOfServiceIndemnity).toBe(36000000);
    expect(result.substituteNoticeIndemnity).toBe(3600000);
  });

  it("FIN-01: sin tope cuando la remuneración está bajo 90 UF", () => {
    const result = estimateFiniquito({
      monthlySalary: 2000000,
      ufValue: 40000,
      yearsWorked: 3,
      terminationCause: "necesidad",
      noticeGiven: true,
    });

    expect(result.baseSalaryCappedByUf).toBe(false);
    expect(result.cappedSalaryBase).toBe(2000000);
    expect(result.yearsOfServiceIndemnity).toBe(6000000);
  });

  // ── TD-0109: requisito de 1 año y fracción >6 meses (art. 163) ──────────
  it("FIN-02: contrato bajo 1 año no genera indemnización por años de servicio", () => {
    const result = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 0,
      additionalMonthsWorked: 8,
      terminationCause: "necesidad",
      noticeGiven: false,
    });

    expect(result.compensationProfile.appliesYearsOfService).toBe(false);
    expect(result.yearsOfServiceIndemnity).toBe(0);
    // El aviso previo no depende de la antigüedad (art. 162 inc. 4).
    expect(result.substituteNoticeIndemnity).toBe(900000);
  });

  it("FIN-03: exactamente 6 meses no suma año; 7 meses sí", () => {
    const sixMonths = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 1,
      additionalMonthsWorked: 6,
      terminationCause: "necesidad",
      noticeGiven: true,
    });
    const sevenMonths = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 1,
      additionalMonthsWorked: 7,
      terminationCause: "necesidad",
      noticeGiven: true,
    });

    expect(sixMonths.serviceYearsCounted).toBe(1);
    expect(sixMonths.yearsOfServiceIndemnity).toBe(900000);
    expect(sevenMonths.serviceYearsCounted).toBe(2);
    expect(sevenMonths.yearsOfServiceIndemnity).toBe(1800000);
  });

  // ── TD-0109: obra o faena (art. 163 inc. 3) ─────────────────────────────
  it("FIN-05: obra o faena paga 2,5 días por mes trabajado", () => {
    const result = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 1,
      additionalMonthsWorked: 6,
      terminationCause: "vencimiento-obra",
      noticeGiven: true,
    });

    // 18 meses × 2,5 días × (900.000/30) = 18 × 2,5 × 30.000 = 1.350.000
    expect(result.obraFaenaIndemnity).toBe(1350000);
    expect(result.yearsOfServiceIndemnity).toBe(0);
  });

  it("FIN-05: obra o faena bajo 1 mes no genera indemnización", () => {
    const result = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 0,
      additionalMonthsWorked: 0,
      terminationCause: "vencimiento-obra",
      noticeGiven: true,
    });

    expect(result.obraFaenaIndemnity).toBe(0);
  });

  it("FIN-06: los supuestos advierten excluir horas extra y bonos anuales", () => {
    const result = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 3,
      terminationCause: "necesidad",
      noticeGiven: true,
    });

    expect(result.assumptions.join(" ")).toContain("horas extra");
    expect(result.assumptions.join(" ")).toContain("90 UF");
  });

  // ── BUG-FINIQ-001: gratificación proporcional ────────────────────────────
  it("art. 50 (gratificacionAnual = false): proportional gratification is zero", () => {
    const result = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 3,
      additionalMonthsWorked: 6,
      terminationCause: "renuncia",
      gratificacionAnual: false,
    });

    expect(result.gratificacionProporcionalAmount).toBe(0);
  });

  it("art. 47 (gratificacionAnual = true): adds proportional gratification to total", () => {
    // 3 years + 8 months; gratificacion pro-rated over 8 months
    const result = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 3,
      additionalMonthsWorked: 8,
      terminationCause: "necesidad",
      noticeGiven: true,
      gratificacionAnual: true,
    });

    // proportional gratification = 900000 × 8 / 12 = 600000
    expect(result.gratificacionProporcionalAmount).toBeCloseTo(600000, 6);
    // totalEstimate must include it
    expect(result.totalEstimate).toBeCloseTo(
      result.yearsOfServiceIndemnity +
        result.substituteNoticeIndemnity +
        result.proportionalVacationAmount +
        result.pendingSalaryAmount +
        result.art168SurchargeAmount +
        result.gratificacionProporcionalAmount,
      2
    );
  });

  it("art. 47 with zero additionalMonthsWorked results in zero proportional gratification", () => {
    const result = estimateFiniquito({
      monthlySalary: 900000,
      yearsWorked: 3,
      additionalMonthsWorked: 0,
      terminationCause: "necesidad",
      noticeGiven: true,
      gratificacionAnual: true,
    });

    expect(result.gratificacionProporcionalAmount).toBe(0);
  });

  it("preserves optional input range validation after the refactor", () => {
    expect(() =>
      estimateFiniquito({
        monthlySalary: 900000,
        yearsWorked: 3,
        additionalMonthsWorked: 12,
        terminationCause: "renuncia",
      })
    ).toThrow("additionalMonthsWorked must be a finite number between 0 and 11.");

    expect(() =>
      estimateFiniquito({
        monthlySalary: 900000,
        yearsWorked: 3,
        pendingSalaryDays: 31,
        terminationCause: "renuncia",
      })
    ).toThrow("pendingSalaryDays must be a finite number between 0 and 30.");
  });

  describe("ejemplo de metodología — anti-drift", () => {
    it("la indemnización real coincide con el ejemplo publicado", () => {
      // Si la fórmula cambia y el ejemplo mostrado al usuario queda
      // desactualizado, este test falla.
      const result = estimateFiniquito(finiquitoWorkedExample.input);
      const expected = finiquitoWorkedExample.expected;
      expect(result.yearsOfServiceIndemnity).toBe(
        expected.yearsOfServiceIndemnity
      );
      expect(result.substituteNoticeIndemnity).toBe(
        expected.substituteNoticeIndemnity
      );
      expect(result.totalEstimate).toBe(expected.totalEstimate);
    });
  });
});
