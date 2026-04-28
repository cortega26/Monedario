// Centralized rule catalog for Next Best Step CTAs.
// Authoritative spec: docs/backlog/PHASE_2_NEXT_BEST_STEP.md §Matriz condición → CTA
// Edit guidance: docs/editorial/next-best-step-copy-guide.md
//
// FACTOR_TAX_YEAR: 2026 — revisit thresholds annually when UTM/UF tramos update.
// 1_500_000: sueldoImponible above which APV régimen A/B is competitive (2026).
// 1_000_000: first relevant taxed bracket entry threshold (2026).

import type { Rule } from "@/utils/nextBestStep";

export const RULES: Rule[] = [
  {
    id: "sl-to-apv-midhigh",
    priority: 80,
    mutexGroup: "next-saving",
    when: (profile, ctx) =>
      ctx.calculatorSlug === "sueldo-liquido" &&
      !!profile.sueldoImponible &&
      profile.sueldoImponible >= 1_500_000,
    suggest: () => ({
      href: "/calculadoras/apv",
      headline: "Podrías reducir tu impuesto con APV",
      rationale: "sueldoImponible >= 1_500_000 en sueldo-liquido",
      ctaLabel: "Calcular APV →",
      ymylTag: "tax",
    }),
  },
  {
    id: "sl-to-cesantia",
    priority: 60,
    mutexGroup: "next-labor",
    when: (profile, ctx) =>
      ctx.calculatorSlug === "sueldo-liquido" &&
      profile.contratoTipo === "plazo-fijo",
    suggest: () => ({
      href: "/posts/seguro-de-cesantia/",
      headline: "Calcula tu seguro de cesantía",
      rationale: "contratoTipo === 'plazo-fijo' en sueldo-liquido",
      ctaLabel: "Ver seguro de cesantía →",
      ymylTag: "labor",
    }),
  },
  {
    id: "sl-to-finiquito",
    priority: 40,
    mutexGroup: "next-labor",
    when: (profile, ctx) =>
      ctx.calculatorSlug === "sueldo-liquido" &&
      profile.contratoTipo === "indefinido" &&
      !!profile.sueldoImponible,
    suggest: () => ({
      href: "/calculadoras/finiquito-indemnizacion",
      headline: "Estima tu finiquito",
      rationale:
        "contratoTipo === 'indefinido' y sueldoImponible presente en sueldo-liquido",
      ctaLabel: "Calcular finiquito →",
      ymylTag: "labor",
    }),
  },
  {
    id: "apv-to-opren",
    priority: 80,
    mutexGroup: "next-tax",
    when: (profile, ctx) =>
      ctx.calculatorSlug === "apv" &&
      !!profile.apvRegimenBAnual &&
      profile.apvRegimenBAnual > 0,
    suggest: () => ({
      href: "/calculadoras/operacion-renta",
      headline: "Prepara tu Operación Renta",
      rationale: "apvRegimenBAnual > 0 en apv",
      ctaLabel: "Ir a Operación Renta →",
      ymylTag: "tax",
    }),
  },
  {
    id: "apv-to-sl",
    priority: 70,
    mutexGroup: "prereq",
    when: (profile, ctx) =>
      ctx.calculatorSlug === "apv" && !profile.sueldoImponible,
    suggest: () => ({
      href: "/calculadoras/sueldo-liquido",
      headline: "Primero calcula tu sueldo líquido",
      rationale: "sueldoImponible no disponible en perfil en apv",
      ctaLabel: "Calcular sueldo líquido →",
    }),
  },
  {
    id: "isc-to-sl",
    priority: 70,
    mutexGroup: "prereq",
    when: (profile, ctx) =>
      ctx.calculatorSlug === "impuesto-segunda-categoria" &&
      !profile.sueldoImponible,
    suggest: () => ({
      href: "/calculadoras/sueldo-liquido",
      headline: "Calcula tu sueldo líquido",
      rationale: "sueldoImponible no disponible en impuesto-segunda-categoria",
      ctaLabel: "Calcular sueldo líquido →",
    }),
  },
  {
    id: "isc-to-apv",
    priority: 50,
    mutexGroup: "next-saving",
    when: (profile, ctx) =>
      ctx.calculatorSlug === "impuesto-segunda-categoria" &&
      !!profile.sueldoImponible &&
      profile.sueldoImponible >= 1_500_000,
    suggest: () => ({
      href: "/calculadoras/apv",
      headline: "Reduce impuesto con APV",
      rationale: "sueldoImponible >= 1_500_000 en impuesto-segunda-categoria",
      ctaLabel: "Calcular APV →",
      ymylTag: "tax",
    }),
  },
  {
    id: "afp-to-sl",
    priority: 70,
    mutexGroup: "next-labor",
    when: (profile, ctx) =>
      ctx.calculatorSlug === "comisiones-afp" &&
      !!profile.afpId &&
      !profile.sueldoImponible,
    suggest: () => ({
      href: "/calculadoras/sueldo-liquido",
      headline: "Ahora calcula tu líquido con esa AFP",
      rationale: "afpId presente pero sueldoImponible falta en comisiones-afp",
      ctaLabel: "Calcular sueldo líquido →",
    }),
  },
  {
    id: "fin-to-cesantia",
    priority: 60,
    mutexGroup: "next-labor",
    when: (profile, ctx) =>
      ctx.calculatorSlug === "finiquito-indemnizacion" &&
      profile.contratoTipo === "indefinido",
    suggest: () => ({
      href: "/posts/seguro-de-cesantia/",
      headline: "Verifica tu seguro de cesantía",
      rationale: "contratoTipo === 'indefinido' en finiquito-indemnizacion",
      ctaLabel: "Ver seguro de cesantía →",
      ymylTag: "labor",
    }),
  },
  {
    id: "opren-to-apv",
    priority: 50,
    mutexGroup: "next-tax",
    when: (profile, ctx) =>
      ctx.calculatorSlug === "operacion-renta" &&
      !profile.apvRegimenBAnual &&
      !!profile.sueldoImponible &&
      profile.sueldoImponible >= 1_000_000,
    suggest: () => ({
      href: "/calculadoras/apv",
      headline: "Podrías pagar menos el próximo año con APV",
      rationale:
        "apvRegimenBAnual ausente y sueldoImponible >= 1_000_000 en operacion-renta",
      ctaLabel: "Calcular APV →",
      ymylTag: "tax",
    }),
  },
];
