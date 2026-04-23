# Apps & MCP Operations Matrix

Trabajos fuera de CI que conviene resolver con apps/MCPs, qué input necesitan y qué artefacto repo-local deben dejar.

## Matrix

| Job | Preferred capability | Inputs required | Repo-local output |
|---|---|---|---|
| Search Console / Bing weekly review | Playwright + authenticated browser state | semana objetivo, propiedad/sitio, acceso autenticado vigente | bundle semanal bajo `output/operations/weekly-search-performance/<week>/` + issue o scorecard |
| Research exports / dossier support | Drive / web / manual export | fuente, fecha de corte, formato esperado | artefacto bajo `artifacts/editorial/<slug>/<run-id>/` o report en `docs/research/` |
| Calendarized ops reminders | GitHub scheduled workflows; Calendar opcional para coordinación humana | regla, cadencia, owner | issue programado o workflow artifact |
| Sheets/CSV operational bundles | Drive / local CSV exports | semana, propiedad, archivo fuente | CSV/JSON bajo `output/operations/...` o report consolidado |

## Operating rules

- Nunca dejar hallazgos solo en chat o memoria del agente.
- Si una app/MCP entrega datos críticos, aterrízalos en un archivo del repo, issue o artifact de workflow.
- Si el acceso autenticado no puede verificarse, registrar `UNVERIFIED_FROM_AVAILABLE_ENVIRONMENT`.
- Las apps/MCPs amplían ejecución operativa; no reemplazan las fuentes oficiales para claims YMYL.
