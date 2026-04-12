/**
 * Registro de cambios editoriales (fuente única de verdad).
 *
 * Política: docs/editorial/CHANGELOG_POLICY.md
 * Regla de inclusión: solo cambios sustantivos para el lector.
 *
 * Orden: más reciente primero. La primera entrada determina la fecha
 * "Actualizado al …" del trust badge en la homepage.
 */
export interface ChangelogEntry {
  date: string; // ISO YYYY-MM-DD
  title: string;
  description: string;
}

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-04-10",
    title: "Calculadora APV — sección FAQ y schema FAQPage",
    description:
      "Añadida sección de preguntas frecuentes visible y emisión del schema FAQPage como JSON-LD. 6 preguntas sobre régimen A, régimen B y retiro anticipado.",
  },
  {
    date: "2026-04-10",
    title:
      "Calculadora Finiquito — gratificación proporcional y recargo art. 168",
    description:
      "Corregida la regla del año fraccionado (> 6 meses, no ≥ 6). Añadido cálculo de gratificación proporcional anual y recargo por despido injustificado según art. 168 CT (30%, 50% u 80% según antigüedad).",
  },
  {
    date: "2026-04-09",
    title: "Búsqueda instantánea con Pagefind",
    description:
      "Integrada búsqueda en tiempo real (MON-404). Los resultados están disponibles en todas las páginas desde la barra de navegación.",
  },
  {
    date: "2026-04-08",
    title: "Fase 2 — calculadoras, artículos y homepage",
    description:
      "MethodologyBlock en todas las calculadoras, PrimaryCTA en los 16 calculadores, 5 artículos nuevos (Fonasa vs Isapre, Primer empleo, Crédito hipotecario, Cartola AFP, Boletín comercial), 8 entradas de glosario, TOC automático en artículos largos.",
  },
];
