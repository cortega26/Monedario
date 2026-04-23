# START_HERE

Guia minima para arrancar en este repositorio sin tener que reconstruir el flujo desde varios documentos.

## Bootstrap en 60 segundos

1. Usa Node 22 y pnpm 10.
2. Ejecuta `pnpm install --frozen-lockfile`.
3. Usa `.env.example` como base para fijar modo local reproducible (`TPI_ECONOMIC_PROVIDER_MODE=snapshot`).
4. Ejecuta `pnpm run check`.
5. Ejecuta `pnpm run dev`.

## Leer en este orden

1. `README.md`
2. `AGENTS.md`
3. `context/AGENT_PREFLIGHT.md`
4. `context/AGENT_ENTRYPOINTS.md`
5. `context/MODULE_INDEX.md`
6. `docs/operations/AGENT_TASK_INDEX.md`
7. `docs/operations/runbooks/bootstrap-checklist.md`
8. `docs/operations/runbooks/task-cookbook.md`

## Entry points por intencion

- Quiero arrancar una sesion de agente rapido: `context/AGENT_PREFLIGHT.md`
- Quiero elegir el camino mínimo por intención: `context/AGENT_ENTRYPOINTS.md`
- Quiero entender la estructura del repo: `docs/codebase/README.md`
- Quiero ubicar el entry point correcto para una tarea: `docs/operations/AGENT_TASK_INDEX.md`
- Quiero validar que mi entorno local quedo bien: `docs/operations/runbooks/bootstrap-checklist.md`
- Quiero cambiar contenido o crear un articulo: `docs/operations/runbooks/task-cookbook.md`
- Quiero tocar rutas, slugs o URLs publicas: `context/INVARIANTS.md`
- Quiero revisar contratos y gates: `context/CONTRACTS.md`
- Quiero entender decisiones pasadas: `docs/adr/README.md`

## Hechos no obvios del repositorio

- La identidad publica de una URL sale de `slug`, nunca de `post.id`.
- Los gates editoriales, de imagenes, rutas, RSS y URLs forman parte del flujo normal, no son validaciones opcionales.
- Los cambios de CI, docs de gobernanza y workflows ahora pasan por `pnpm run check:policy-registry`.
- `docs/` tiene estructura con autoridad explicita y se valida con `pnpm run check:docs`.

## Comandos comunes

```sh
pnpm run lint
pnpm run check:boundaries
pnpm run format:check
pnpm run test
pnpm run check
```
