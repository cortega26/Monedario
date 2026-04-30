export const HERO_P0_ORDER = [
  "como-calcular-sueldo-liquido",
  "liquidacion-de-sueldo",
  "cuanto-descuenta-la-afp-de-tu-sueldo",
  "descuentos-de-sueldo",
  "informe-deudas-cmf-vs-dicom",
  "licencia-medica-desde-que-dia-pagan",
  "operacion-renta-f22-checklist",
  "devolucion-impuestos-fechas-compensaciones",
];

export const HERO_P0_METADATA = {
  "como-calcular-sueldo-liquido": {
    priority: "P0-1",
    subgroup: "Payroll mechanics",
    whyFirst: "Core payroll explainer; needs precision before warmth.",
    concept:
      "Vertical payslip with five stacked deduction blocks flowing into one final net deposit block.",
    passCue:
      "The reader should see gross-to-net transformation, not generic money imagery.",
    observedFailures: [
      "Background drifted into a visible gradient/vignette instead of a perfectly flat fill.",
      "Interior deduction blocks came out too soft or translucent instead of solid and architectural.",
      "The downward arrow was too timid and did not guide the eye strongly enough.",
      "The final bottom block did not stand out enough as the net deposit outcome.",
      "Overall feel leaned toward a generic form instead of a payroll-calculation mechanism.",
    ],
    revisionGoal:
      "Push the image toward stricter flatness, stronger visual hierarchy, and more explicit gross-to-net flow.",
  },
  "liquidacion-de-sueldo": {
    priority: "P0-2",
    subgroup: "Payroll mechanics",
    whyFirst:
      "Document-audit article; trust depends on reading it as a payslip review.",
    concept: "Vertical payslip with three highlighted lines and one magnifier.",
    passCue:
      "It should feel like line-by-line verification, not salary calculation.",
  },
  "cuanto-descuenta-la-afp-de-tu-sueldo": {
    priority: "P0-3",
    subgroup: "Payroll mechanics",
    whyFirst:
      "High-frequency payroll doubt; users confuse the mandatory 10% with the AFP commission.",
    concept:
      "Horizontal deduction strip split into one large pension segment and one smaller commission segment beside a payslip edge.",
    passCue:
      "The split between cotizacion and comision must be obvious at thumbnail size.",
  },
  "descuentos-de-sueldo": {
    priority: "P0-4",
    subgroup: "Payroll mechanics",
    whyFirst:
      "Legal vs authorized vs prohibited deductions is a trust-critical distinction.",
    concept:
      "Three deduction cards in a row: mandatory, consent-based, blocked.",
    passCue:
      "The trio should read as classification, not one undifferentiated payroll scene.",
  },
  "informe-deudas-cmf-vs-dicom": {
    priority: "P0-5",
    subgroup: "Debt-report comparison",
    whyFirst:
      "High-stigma topic; the image must clarify without dramatizing debt.",
    concept: "Two overlapping debt-report cards inside one large magnifier.",
    passCue:
      "It must read as comparison and clarity, never punishment or panic.",
  },
  "licencia-medica-desde-que-dia-pagan": {
    priority: "P0-6",
    subgroup: "Medical leave timing",
    whyFirst:
      "Procedural YMYL topic; payment timing matters more than health symbolism.",
    concept:
      "Horizontal calendar strip with shaded leave days and one payment-start marker.",
    passCue:
      "The reader should instantly understand from which day the payment starts.",
  },
  "operacion-renta-f22-checklist": {
    priority: "P0-7",
    subgroup: "Tax workflow",
    whyFirst:
      "Institutional workflow article; the image must feel methodical and review-oriented.",
    concept:
      "Flat tax checklist form with five checked boxes and one review magnifier.",
    passCue:
      "It should feel like revision before submission, not generic taxes.",
  },
  "devolucion-impuestos-fechas-compensaciones": {
    priority: "P0-8",
    subgroup: "Tax workflow",
    whyFirst:
      "Refund timing is a strong intent query and needs a timing-first image.",
    concept:
      "Calendar page connected to a deposit arrow and one offset/status block.",
    passCue:
      "It should convey payment timing plus possible delay or compensation in one glance.",
  },
};
