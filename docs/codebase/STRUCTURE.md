# Repository Structure

## Runtime

- `src/pages/`: entry points de Astro y rutas publicas.
- `src/layouts/`: shells y composicion de paginas.
- `src/components/`: componentes UI reutilizables.
- `src/domain/`: logica de dominio pura.
- `src/application/`: casos de uso y orquestacion.
- `src/infrastructure/`: IO, adapters, snapshots y providers.
- `src/data/blog/`: contenido editorial en Markdown y MDX.

## Validation and Tooling

- `scripts/`: gates del repositorio (`check:*`, snapshots, comparadores y utilidades operativas).
- `tests/domain/`: tests del dominio.
- `tests/application/`: tests de casos de uso.
- `tests/infrastructure/`: tests de providers y adapters.
- `tests/e2e/`: validacion browser-level y de workflows.
- `.github/workflows/`: CI y jobs operativos programados (sin deploy repo-managed activo en este árbol).

## Documentation and Governance

- `docs/`: gobernanza, ADRs, reportes, backlog y runbooks.
- `context/`: capa compacta de contexto para agentes.
- `docs/adr/`: decisiones arquitectonicas registradas.
- `artifacts/`: artefactos editoriales y evidencias relacionadas.
- `output/`: salidas generadas por validaciones y operaciones.

## Where to start by intent

- Bootstrap general: `START_HERE.md`
- Reglas operativas: `AGENTS.md`
- Mapa rapido del repo: `context/MODULE_INDEX.md`
- Tareas frecuentes: `docs/operations/runbooks/task-cookbook.md`
