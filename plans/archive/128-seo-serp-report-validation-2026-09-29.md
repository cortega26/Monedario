# Plan 128: Validación con datos GSC del informe SEO/SERP externo

> **Executor instructions**: read-only sobre producción. Este plan no toca
> `src/`, contenido, rutas ni indexabilidad; usa los exports GSC locales y las
> herramientas de auditoría existentes. Actualiza
> `docs/backlog/SEO-SERP-STRATEGY-2026-09-29.md` con los resultados.

## Status

- **Priority**: P1 (dirección estratégica; evita ejecutar recomendaciones inválidas)
- **Effort**: S
- **Risk**: LOW (read-only + docs)
- **Depends on**: `docs/backlog/SEO-SERP-STRATEGY-2026-09-29.md`
- **Category**: medición SEO / validación de estrategia
- **Planned at**: commit `9e195743`, 2026-09-29
- **Status**: DONE (2026-09-30) — validación ejecutada (pasos 1–5) y cierre
  atómico: commit a `main` + archivo en `plans/archive/`; índices actualizados
  y enlaces al path anterior eliminados. Sin push (no solicitado).
- **Evidence**: `output/validation/striking-distance/aggregate-8w-striking-distance.json`,
  `output/validation/cannibalization/aggregate-8w-cannibalization.json`
  (gitignored, regenerables), `docs/backlog/SEO-SERP-STRATEGY-2026-09-29.md` §8.

## Scope

**In scope**

- Lectura de exports GSC `2026-W32`..`2026-W39`
  (`output/operations/data-signals/gsc/`).
- `data-signals:gsc:aggregate --weeks=8`, `audit:striking-distance`,
  `audit:cannibalization` (herramientas existentes; no se crea nada nuevo).
- Análisis suplementario: páginas de dinero, glosario, `/archives/`,
  país/dispositivo, indexación (`url-inspection` W39), verificación de las
  afirmaciones del informe.
- Actualización del artifact de estrategia y de los índices de `plans/` y
  `docs/backlog/`.

**Out of scope**

- Fetch GSC en vivo (`gsc-fetch`) o cualquier llamada a API externa.
- Cambios de código, contenido, rutas, sitemap o robots.
- Reabrir decisiones de los planes 116/120: los hallazgos que las rozan quedan
  como evidencia para decisión del owner.
- Medición de AI Overviews: los exports actuales no traen esa dimensión.

## Steps and results

1. **Agregado rolling 8 semanas** — `pnpm run data-signals:gsc:aggregate -- --weeks=8`.
   Resultado: 14.880 filas query×page, ventana 2026-08-03–2026-09-27 (W32–W39).
2. **Striking distance** — `pnpm run audit:striking-distance -- --file=...aggregate-query-page.json --top=30`.
   Resultado: 2.802 pares en banda 8–20 con ≥10 impresiones. Los primeros
   puestos son el conversor UTM (`valor utm`: 116.695i, pos 8,35, CTR 0,34%) y
   el conversor UF (`uf a peso`: 3.300i, pos 10,66, 0 clics).
3. **Cannibalization** — `pnpm run audit:cannibalization -- --file=... --top=25`.
   Resultado: 122 queries canibalizadas; solo **3 grupos fuertes** (2+ páginas
   con ≥100 impresiones) y los tres son UTM calculadora vs. post. Sin
   canibalización relevante de glosario (1 grupo débil: `dicom`).
4. **Análisis suplementario** (Python read-only sobre los JSON):
   páginas de dinero W32→W39, top queries por página, glosario, `/archives/`,
   país/dispositivo W39, indexación W39, y las consultas citadas por el informe.
5. **Actualización de artifactos** — `SEO-SERP-STRATEGY-2026-09-29.md` §8 y
   retriage N1–N7; índice de `plans/` y fila en `docs/backlog/README.md`.

## Hallazgos (validación del informe)

| Afirmación / recomendación | Dato GSC (W32–W39) | Veredicto |
|---|---|---|
| «Calculadora sueldo líquido fuera del top 8–10» | Peor: queries head en posición media **57,9–71,3**; 377i/0c en 19 queries ≥10i; página con 600–2.900i semanales solo de long tail | **Confirmado y agravado** — el snippet no puede arreglar posición ~60 |
| «APV fuera del top 10; atacar A vs B» | `simulador apv` 32i pos **45,5**; `simulador apv habitat` 46i pos 23,1; 115i/0c en queries ≥10i | **Confirmado y agravado** — la promesa A/B ya está en título; el problema es posición/authority |
| «Sueldo: diferenciar con bruto↔líquido» (QW3) | Título/H1 ya diferenciados; posición ~60 en head terms | **Refutado como palanca prioritaria** |
| «No perseguir `valor UF hoy` (commodity)» | UF: 83.104i y 12 clics en W39; `uf a peso` 3.300i/0c pos 10,7 | **Confirmado** |
| «Defender posiciones #2/#3» | `calcular seguro de cesantia` 506i/28c pos 4,74 CTR 5,5%; `calculo impuesto unico` 271i/13c pos 6,8 CTR 4,8% | **Confirmado** — los convertidores de intención fuerte convierten |
| «Prepago: atender intención de decisión» | `conviene prepagar un credito de consumo` 97i/0c pos 14,8; long tail de cálculo convierte 8–15% | **Confirmado** |
| «Renegociación: invertir (#3)» | Demanda real pequeña: página con 31–73i/semana; `calculadora de renegociacion` 10i pos 3,2 | **Matizado** — oportunidad de intención, volumen limitado |
| «Glosario posible canibalización (55 URLs)» | 55/55 indexadas (PASS); solo **17 entradas con impresiones**, 15 de ellas 0 clics, **37 sin ninguna impresión**; canibalización real ≈ nula | **Matizado** — el problema no es canibalizar: es demanda inexistente sobre índice ya indexado |
| «Glosario: auditar antes de expandir» (QW6) | `renta-imponible` 1.877i/0c pos 10–11; índice `/glosario/` 436i/0c | **Confirmado, con datos** para N2 |
| «`/archives/` fuera del índice» (QW7) | **0i/0c en 8 semanas**; coverage W39: «Crawled - currently not indexed» | **Evidencia recibida** — decisión del owner vía contrato plan 120; contradice mantener del plan 116 SEO-03 a la luz de estos datos |
| «Link earning / déficit de autoridad» | Coherente con posiciones 45–71 en head terms pese a títulos diferenciados; sin datos de backlinks en repo | **Hipótesis plausible** — requiere GSC Links/Ahrefs (bloqueado) |
| «Mobile/desktop» (no tratado por el informe) | Móvil 65% de impresiones, CTR 0,12% vs escritorio 0,22% con posición similar (8,1 vs 8,6) | **Nuevo hallazgo** — brecha de CTR móvil |
| «AIO/Generative AI» | No medible con exports actuales (dims: query/page/country/device) | **No verificable aún** (N7) |

## Verificación

| Comando / comprobación | Resultado |
|---|---|
| `pnpm run data-signals:gsc:aggregate -- --weeks=8` | 14.880 filas, W32–W39, ventana 2026-08-03–2026-09-27 |
| `pnpm run audit:striking-distance -- --file=... --top=30 --json` | exit 0; 2.802 oportunidades; reporte escrito en `output/validation/` |
| `pnpm run audit:cannibalization -- --file=... --top=25 --json` | exit 0; 122 grupos; 3 fuertes (solo UTM) |
| Indexación W39 (`url-inspection`) | 173/185 PASS; glosario 55/55 PASS; `/archives/` crawled-not-indexed |
| País/dispositivo W39 | Chile 98,7% de impresiones; móvil 65% con CTR mitad que escritorio |
| `pnpm exec prettier --check` / `pnpm run check:docs` | OK (2026-09-30): prettier sin cambios en los 4 archivos; `check:docs` trackedMarkdown=919 |

## STOP / HALT

- **No** interpretar caídas/picos de una semana como efecto del spam update en
  curso; el análisis usa cortes multi-semana → respetado.
- **No** derivar acciones de contenido desde este plan (solo priorización) →
  respetado; toda ejecución va a plan numerado nuevo con gate.
- **No** cambiar indexabilidad de `/archives/` ni del glosario sin contrato
  (plan 120) + decisión del owner → respetado.

Sin condiciones STOP activadas.

## Rollback

- Revertir las ediciones de `docs/backlog/SEO-SERP-STRATEGY-2026-09-29.md`,
  `docs/backlog/README.md` y `plans/README.md`.
- Los reportes de `output/validation/` son regenerables y están gitignored;
  sin rollback.

## Progress log

- 2026-09-29 — Plan creado y ejecutado en la misma sesión (spike read-only):
  agregado W32–W39, ambos audits corridos, análisis suplementario completo,
  hallazgos volcados al artifact de estrategia §8 con retriage N1–N7.
  Nada tocó `src/` ni rutas. Cierre (commit + archivo atómico) pendiente de
  solicitud explícita.
- 2026-09-30 — Cierre solicitado por el owner: commit `docs(seo): cierra plan
  128 (validación GSC del informe SEO/SERP)` a `main` + archivo atómico a
  `plans/archive/128-seo-serp-report-validation-2026-09-29.md`; fila retirada
  de pendientes y añadida a los índices de completados de `plans/README.md` y
  `plans/archive/README.md`; allowlist `!docs/backlog/SEO-SERP-STRATEGY-*.md`
  en `.gitignore` para versionar el artifact. `prettier --check` y
  `check:docs` en verde. Sin push (no solicitado).
