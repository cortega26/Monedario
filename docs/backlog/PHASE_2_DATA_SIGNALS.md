# Phase 2 — External Data Signals (GSC API + Cloudflare + Ahrefs)

> Created 2026-04-16.
> Autoridad: `docs/adr/ADR-20260416-external-data-signals.md`.
> Relacionado: `docs/operations/runbooks/weekly-search-performance-ritual.md`, `docs/backlog/PHASE_2_NEXT_BEST_STEP.md`.

---

## Goal

Automatizar la ingestión de señales externas (GSC, Cloudflare, Ahrefs) como **artefactos JSON versionados en el repo**, reemplazando los flujos manuales de CSV/UI, para habilitar:

1. Priorización data-driven de las reglas de Next Best Step (Phase 2).
2. Detección temprana de regresiones de performance real (RUM Cloudflare vs Lighthouse sintético).
3. Inteligencia competitiva trazable y diffable (Ahrefs) alineada con `COMPETITIVE_ADAPTATION_POLICY`.

## Out of scope

- Reemplazar GA4 o el tracking analítico propio.
- Backend propio / base de datos / dashboards custom.
- Integraciones Bing Webmaster, SEMrush, Similarweb (revisitable si hay señal faltante).
- Data lake a largo plazo — sólo snapshots semanales con archivo trimestral.

## Tickets

| ID              | Title                                                                                     | Priority | Effort | Dependencies | Status      |
| --------------- | ----------------------------------------------------------------------------------------- | -------- | ------ | ------------ | ----------- |
| MON-ENV-DATA0   | ADR + plan (este doc)                                                                     | P0       | XS     | —            | ✅ done 2026-04-16 |
| MON-ENV-DATA1a  | GSC Service Account: provisionar + guardar credencial en `GOOGLE_APPLICATION_CREDENTIALS_JSON` GHA secret | P0 | XS | — | ✅ done 2026-04-25 |
| MON-ENV-DATA1b  | `scripts/data-signals/gsc-fetch.mjs` — query / page / sitemap endpoints + schema + tests  | P0       | M      | MON-ENV-DATA1a | ✅ done 2026-04-25 |
| MON-ENV-DATA1c  | GHA workflow `.github/workflows/data-signals.yml` con cron diario + commit automático     | P0       | S      | MON-ENV-DATA1b | ✅ done 2026-04-25 |
| MON-ENV-DATA1d  | Integrar JSON de GSC en `build-weekly-search-report.mjs` (detecta JSON, fallback a CSV)   | P1       | S      | MON-ENV-DATA1b | ✅ done 2026-04-25 |
| MON-ENV-DATA2a  | Cloudflare token con scope `Analytics:Read` + guardar en GHA secret `CLOUDFLARE_ANALYTICS_TOKEN` | P1 | XS | — | ✅ done 2026-04-25 |
| MON-ENV-DATA2b  | `scripts/data-signals/cloudflare-fetch.mjs` — GraphQL Analytics (tráfico + RUM Web Vitals) | P1      | M      | MON-ENV-DATA2a | ✅ done 2026-04-26 — `{week}-traffic.json` + `{week}-rum.json` (LCP/CLS/INP p75 por ruta, ms) |
| MON-ENV-DATA2c  | Agregar bloque "Performance real" al scorecard semanal (lee Cloudflare tráfico)           | P1       | S      | MON-ENV-DATA2b | ✅ done 2026-04-25 |
| MON-ENV-DATA2d  | Alerta CI: fallar workflow si LCP p75 > 4000ms en ruta owner (hard gate)                  | P2       | S      | MON-ENV-DATA2b | ✅ done 2026-04-26 — `scripts/data-signals/lcp-gate.mjs` + step en `data-signals.yml` + 16 tests |
| MON-ENV-DATA3a  | **GATE:** confirmar suscripción Ahrefs con acceso API                                     | P0 | XS | — | 🚫 blocked:license — sin plan Advanced+ confirmado 2026-04-25 |
| MON-ENV-DATA3b  | `scripts/data-signals/ahrefs-fetch.mjs` — site explorer + backlinks + competitors + keyword gap | P2 | M | MON-ENV-DATA3a | 🔲 blocked by DATA3a |
| MON-ENV-DATA3c  | Integrar snapshot Ahrefs a `docs/research/seo/` como input de `COMPETITIVE_ADAPTATION_POLICY` | P2 | S | MON-ENV-DATA3b | 🔲 blocked |
| MON-ENV-DATA4   | `.gitattributes` rule para `output/operations/data-signals/**` (marcar `-diff`) + rotación trimestral a `output/archive/` | P2 | XS | DATA1c | ✅ done 2026-04-25 |
| MON-ENV-DATA5   | Runbook `docs/operations/runbooks/data-signals-maintenance.md` (troubleshooting, rotación de tokens) | P1 | S | DATA1c + DATA2c | ✅ done 2026-04-25 |

## Outputs (estructura)

```
output/operations/data-signals/
├── gsc/
│   ├── 2026-W16-queries.json     # top N queries con clicks/impressions/CTR/position
│   ├── 2026-W16-pages.json       # métricas por URL
│   └── 2026-W16-sitemaps.json    # estado de indexación
├── cloudflare/
│   ├── 2026-W16-rum.json         # LCP/CLS/FID p75 por ruta
│   └── 2026-W16-cache.json       # hit ratio por asset class
└── ahrefs/                       # solo si DATA3a ✅
    ├── 2026-W16-backlinks.json
    ├── 2026-W16-competitors.json
    └── 2026-W16-keywords-gap.json
```

Schema header obligatorio (validado en cada script):

```json
{
  "source": "gsc",
  "fetchedAt": "2026-04-16T06:00:00Z",
  "schemaVersion": 1,
  "window": { "from": "2026-04-09", "to": "2026-04-15" },
  "data": [ /* ... */ ]
}
```

Rechazar reads con `schemaVersion` distinta es intencional — fuerza ADR al cambiar formato.

## Configuración operativa (secrets + env)

| Secret name                           | Scope               | Dónde vive                         | Rotación  |
| ------------------------------------- | ------------------- | ---------------------------------- | --------- |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | GSC read-only       | GHA secret + `.env.local` (dev)    | 6 meses   |
| `CLOUDFLARE_ANALYTICS_TOKEN`          | Zone Analytics:Read | GHA secret                         | 6 meses   |
| `CLOUDFLARE_ZONE_ID`                  | Cloudflare zone id    | GHA variable/env local explícita   | al cambiar infra |
| `CLOUDFLARE_ACCOUNT_ID`               | Cloudflare account id | GHA variable/env local explícita   | al cambiar infra |
| `AHREFS_API_TOKEN`                    | Site Explorer read  | GHA secret (si DATA3a ✅)          | 6 meses   |

Ninguno se commitea, loguea ni se expone al cliente. Runbook MON-ENV-DATA5 documenta rotación.

## Consumo downstream

| Output                                     | Consumidor                                 | Nota |
| ------------------------------------------ | ------------------------------------------ | ---- |
| `gsc/*-queries.json`                       | `build-weekly-search-report.mjs`           | Reemplaza CSV cuando existe |
| `gsc/*-pages.json`                         | Phase 2 priorización de reglas (MON-509)   | CTR por URL = señal de dónde meter más NextBestStep |
| `cloudflare/*-rum.json`                    | Scorecard (DATA2c) + alert DATA2d          | Dato real vs Lighthouse sintético |
| `ahrefs/*-competitors.json`                | Input `COMPETITIVE_ADAPTATION_POLICY`      | Solo si DATA3 desbloqueado |
| `ahrefs/*-keywords-gap.json`               | Backlog editorial (`ux-backlog.md` u otro) | Candidato a futuro plan Phase 2.5 |

## Risks

1. **Cuota de API / rate limits (severidad media).** GSC y Ahrefs tienen quotas. Mitigación: scripts serializados con backoff exponencial; chequear quota restante antes de correr.
2. **Secret leak por error de script (severidad alta).** Un `console.log` errante con token plano. Mitigación: code review obligatorio en PRs de DATA1b/2b/3b; revisión de logs GHA antes del primer merge.
3. **Cambio breaking en API externa (severidad media).** GSC cambia respuesta, script se rompe silencioso. Mitigación: `schemaVersion` en script rechaza formato inesperado; alert si 2 corridas seguidas fallan.
4. **Data de competidores impuesta a la estrategia (severidad media).** Ahrefs puede tentar a copiar sin diferenciación. Mitigación: `INVARIANT.STRATEGY.DIFFERENTIATED_ADOPTION_REQUIRED` ya existente — PR review bloquea cambios que sean copia pura.
5. **Repo bloat (severidad baja).** JSONs versionados acumulan. Mitigación: DATA4 (rotación trimestral a archive, `.gitattributes -diff`).

## Verification per ticket

- DATA1b: `pnpm run data-signals:gsc -- --week=2026-W16 --dry-run` imprime el JSON sin commitear; con `--commit` escribe el archivo. Test unitario con fixture de respuesta GSC.
- DATA1c: primer run exitoso en GHA (cron manual) produce commit con los 3 JSONs.
- DATA2b: script reporta al menos 6 rutas owner con LCP p75 numérico.
- DATA2d: test negativo — injectar RUM mockeado con LCP=5000ms y verificar que el job falla.
- DATA3b (si aplica): response incluye ≥ 1 backlink conocido a `monedario.cl`.

## Definition of done for Phase 2 Data Signals

Completa cuando:

- ADR `ADR-20260416-external-data-signals.md` Status: Accepted.
- MON-ENV-DATA1a..1d todos ✅ (GSC automatizado end-to-end).
- MON-ENV-DATA2a..2c todos ✅ (Cloudflare RUM en scorecard).
- MON-ENV-DATA3a con decisión documentada (✅ implementado / 🚫 bloqueado por licencia, explícito).
- MON-ENV-DATA4 + DATA5 ✅ (repo health + runbook).
- Primer ciclo semanal (2026-Wxx) produce scorecard consumiendo solo JSON (CSV manual queda fallback).
