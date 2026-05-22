#!/usr/bin/env node

/**
 * audit-ctr-opportunities.mjs
 *
 * One-off, on-demand full-catalog CTR-opportunity sweep. Complements the
 * weekly search scorecard, which only evaluates the 24-page watchlist —
 * this pass covers every page GSC has data for.
 *
 * Aggregates all weekly GSC "pages" exports in
 * output/operations/data-signals/gsc/ and flags pages that rank on page 1–2
 * but convert poorly: enough impressions to be reliable, average position
 * 4–15, and CTR below target. Writes a dated evidence report to docs/reports/.
 *
 * This is NOT a scheduled job. Run it manually when you want a sweep:
 *   node scripts/audit-ctr-opportunities.mjs
 *
 * It produces evidence only — proposed title/description rewrites are a
 * separate editorial step.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const GSC_DIR = "output/operations/data-signals/gsc";
const MIN_IMPRESSIONS = 150; // aggregate floor — below this, CTR is mostly noise
const POSITION_MIN = 4;
const POSITION_MAX = 15;
const CTR_TARGET = 0.035; // 3.5% — matches build-weekly-search-report.mjs

const pageFiles = readdirSync(GSC_DIR)
  .filter(f => /-pages\.json$/.test(f))
  .sort();

if (pageFiles.length === 0) {
  console.error(`No *-pages.json files found in ${GSC_DIR}`);
  process.exit(1);
}

/** @type {Map<string, {clicks:number,impressions:number,posImpr:number,weeks:Set<string>}>} */
const pages = new Map();
const weeksCovered = new Set();

for (const file of pageFiles) {
  const parsed = JSON.parse(readFileSync(`${GSC_DIR}/${file}`, "utf-8"));
  const week = parsed.week ?? file.replace("-pages.json", "");
  weeksCovered.add(week);
  for (const row of parsed.data ?? []) {
    if (!row.page || !row.impressions) continue;
    const agg = pages.get(row.page) ?? {
      clicks: 0,
      impressions: 0,
      posImpr: 0,
      weeks: new Set(),
    };
    agg.clicks += row.clicks ?? 0;
    agg.impressions += row.impressions;
    agg.posImpr += (row.position ?? 0) * row.impressions;
    agg.weeks.add(week);
    pages.set(row.page, agg);
  }
}

const analyzed = [...pages.entries()].map(([page, a]) => ({
  page: page.replace(/^https?:\/\/[^/]+/, ""),
  clicks: a.clicks,
  impressions: a.impressions,
  ctr: a.clicks / a.impressions,
  position: a.posImpr / a.impressions,
  weeks: a.weeks.size,
}));

const candidates = analyzed
  .filter(
    p =>
      p.impressions >= MIN_IMPRESSIONS &&
      p.position >= POSITION_MIN &&
      p.position <= POSITION_MAX &&
      p.ctr < CTR_TARGET
  )
  .map(p => ({
    ...p,
    missedClicks: Math.round(p.impressions * (CTR_TARGET - p.ctr)),
  }))
  .sort((a, b) => b.missedClicks - a.missedClicks);

// Pages with real volume stuck below page 2 — a ranking problem, not a CTR
// problem. Surfaced separately so they are not mistaken for CTR candidates.
const rankingBound = analyzed
  .filter(p => p.impressions >= MIN_IMPRESSIONS && p.position > POSITION_MAX)
  .sort((a, b) => b.impressions - a.impressions);

const pct = n => `${(n * 100).toFixed(2)}%`;
const today = new Date().toISOString().slice(0, 10);
const weekList = [...weeksCovered].sort().join(", ");
const totalMissed = candidates.reduce((s, c) => s + c.missedClicks, 0);

const candidateRows = candidates.length
  ? candidates
      .map(
        c =>
          `| ${c.page} | ${c.weeks} | ${c.impressions} | ${c.clicks} | ${pct(c.ctr)} | ${c.position.toFixed(1)} | ${c.missedClicks} |`
      )
      .join("\n")
  : "| _(ninguna página supera el umbral)_ | | | | | | |";

const rankingRows = rankingBound.length
  ? rankingBound
      .slice(0, 10)
      .map(
        p =>
          `| ${p.page} | ${p.impressions} | ${pct(p.ctr)} | ${p.position.toFixed(1)} |`
      )
      .join("\n")
  : "| _(ninguna)_ | | | |";

const report = `# Auditoría de oportunidades de CTR

**Fecha:** ${today}
**Alcance:** catálogo completo — todas las páginas con datos en Google Search Console
**Ventana de datos:** ${weekList} (${weeksCovered.size} semanas)
**Generado por:** \`scripts/audit-ctr-opportunities.mjs\` — barrido puntual, no programado

## Por qué existe este informe

El scorecard semanal (\`build-weekly-search-report.mjs\`) solo evalúa la
watchlist de 24 páginas. Este barrido cubre **las ${analyzed.length} páginas**
con datos en GSC, para detectar oportunidades de CTR fuera de esa lista.

## Método

Se agregan todos los export semanales de GSC (\`*-pages.json\`) sumando clics e
impresiones por página y calculando la posición media ponderada por
impresiones. Una página es **candidata** si cumple las tres condiciones:

- Impresiones agregadas ≥ ${MIN_IMPRESSIONS} (por debajo, el CTR es ruido).
- Posición media entre ${POSITION_MIN} y ${POSITION_MAX} (ya rankea en página 1–2; el problema es el clic, no el ranking).
- CTR agregado < ${pct(CTR_TARGET)} (mismo umbral que el scorecard semanal).

\`Clics perdidos\` estima cuántos clics adicionales se obtendrían si la página
alcanzara un CTR de ${pct(CTR_TARGET)}: \`impresiones × (${pct(CTR_TARGET)} − CTR actual)\`.

## Resumen

- Páginas analizadas: **${analyzed.length}**
- Candidatas a refresh de title/snippet: **${candidates.length}**
- Clics perdidos estimados (total): **~${totalMissed}**

## Candidatas — refresh de title/meta description

Ordenadas por tamaño de oportunidad (clics perdidos estimados).

| Página | Semanas | Impresiones | Clics | CTR | Posición | Clics perdidos |
|---|---|---|---|---|---|---|
${candidateRows}

## Fuera de alcance — problema de ranking, no de CTR

Páginas con volumen real pero ancladas por debajo de la posición ${POSITION_MAX}.
Reescribir el title no las arregla: necesitan trabajo de contenido y enlazado,
no de CTR. Se listan aquí solo para no confundirlas con candidatas.

| Página | Impresiones | CTR | Posición |
|---|---|---|---|
${rankingRows}

## Advertencias

- **Volumen bajo.** Monedario es un sitio joven (fundado en enero de 2026); la
  mayoría de las páginas tienen pocas impresiones y cero clics. Con este
  volumen, el valor principal de esta auditoría es **fijar método y línea
  base** — será accionable de verdad cuando el tráfico crezca.
- **Una semana es ruido.** Por eso se agregan ${weeksCovered.size} semanas. Aun
  así, conviene confirmar la tendencia antes de actuar sobre una página con
  pocas semanas de cobertura (columna \`Semanas\`).
- **Las reescrituras pasan por el proceso editorial.** Este informe es
  evidencia, no contenido. Cambiar el title o la meta description de una página
  YMYL es trabajo del pipeline editorial, no una edición unilateral.

## Próximos pasos

1. Revisar las candidatas y decidir cuáles ameritan reescritura.
2. Enrutar las elegidas al pipeline editorial para reescribir title/snippet.
3. Re-ejecutar este barrido tras ~4 semanas para medir el efecto.
4. Si el barrido rinde candidatas reales de forma recurrente, recién entonces
   evaluar automatizarlo en cadencia trimestral.
`;

const outPath = `docs/reports/CTR-AUDIT-${today}.md`;
writeFileSync(outPath, report);
console.log(
  `CTR audit: ${analyzed.length} pages analyzed, ${candidates.length} candidate(s), ~${totalMissed} estimated missed clicks.`
);
console.log(`CTR audit: report written to ${outPath}`);
