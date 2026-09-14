# Bootstrap Checklist

Checklist minima para validar que un entorno local quedo listo antes de empezar cambios.

## Prerrequisitos

- Node 22 (`.nvmrc`)
- pnpm 11.7.0 (`package.json#packageManager`; `.nvmrc` fija Node 22)
- Copia local de `.env.example` a `.env` cuando quieras fijar modo snapshot

## Primer arranque — etapa 1 (offline, no destructiva)

1. `nvm use`
2. `pnpm install --frozen-lockfile`
3. `pnpm run lint`
4. `pnpm run check:boundaries`
5. `pnpm run format:check`
6. `pnpm run test`
7. `pnpm run dev`

## Primer arranque — etapa 2 (con red / destructiva, explícita)

Solo cuando la etapa 1 este en verde:

1. `pnpm run check` — set editorial/contexto ampliado. Incluye
   `check:links` (con red) y `check:images` (regenera assets y borra
   PNGs locales, DX-03). No lo ejecutes antes de `dev` en un checkout
   limpio.
2. Python (herramientas auxiliares en `scripts/` y `tests/`):
   `uv sync`, luego humo con `uv run ruff check scripts/ tests/` y
   `uv run pytest`.
3. Auditoria Python solo con el venv del proyecto:
   `.venv/bin/python -m pip_audit` o
   `uv run --project . --frozen pip-audit`. El `uv run pip-audit`
   desnudo puede resolver otro interprete (p. ej. hereda un
   `VIRTUAL_ENV` externo) y no es señal valida — ver la nota 2026-09-14
   del plan 106 en `docs/TECH_DEBT_BACKLOG.md` (TD-0097) y el comentario
   del job `python-audit` en `.github/workflows/security-scans.yml`.

## Senales esperadas

- Etapa 1: `pnpm run test` termina con exit code 0; `pnpm run dev`
  levanta el sitio sin necesidad de fetch live a Mindicador cuando el
  modo economico esta en `snapshot`.
- Etapa 2: `pnpm run check` termina con exit code 0 (requiere red).

## Fallos comunes

- Version incorrecta de Node
- `pnpm` fuera de la version declarada
- Dependencias no instaladas con lockfile congelado
- Ambiente local sin modo `snapshot` cuando se busca reproducibilidad

## Referencias

- `START_HERE.md`
- `README.md`
- `.env.example`
- `package.json`
- `.github/workflows/ci.yml`