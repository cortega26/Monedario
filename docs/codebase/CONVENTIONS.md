# Conventions

Resumen de convenciones observables y reglas de trabajo que afectan cambios en el repositorio.

## Autoridad documental

Orden de autoridad operativo:

1. `docs/AI_ENGINEERING_CONSTITUTION.md`
2. `AGENTS.md`
3. `context/*.md`
4. Codigo y comentarios

## Scope y control de cambios

- Los cambios deben declarar scope antes de editar.
- Se prefieren diffs pequenos y enfocados.
- Cambios arquitectonicos requieren ADR.
- La deuda encontrada fuera de scope debe registrarse en `docs/TECH_DEBT_BACKLOG.md`.

## Arquitectura y dependencias

- `src/domain/**` no puede depender de infraestructura.
- `src/application/**` puede depender de dominio.
- `src/infrastructure/**` concentra IO, fetch, filesystem y efectos secundarios.
- Las URLs publicas se derivan de `slug`, nunca de `post.id`.

## Testing y validacion

- Todo cambio en capas runtime debe venir con tests en la carpeta de tests correspondiente.
- `pnpm run lint`, `pnpm run check:boundaries`, `pnpm run format:check`, `pnpm run test` y `pnpm run check` son el baseline operativo.
- Cambios de rutas, canonical, RSS o helpers publicos exigen `check:no-postid-urls`, `check:routes` y `check:rss`.

## Documentacion

- `docs/` usa estructura con autoridad explicita y validacion automatica.
- `docs/codebase/` describe implementacion actual; no redefine normas.
- ADRs viven solo en `docs/adr/`.

## Tooling visible

- Prettier usa `printWidth: 80`, `tabWidth: 2` y `semi: true`.
- ESLint prohibe `console` salvo en scripts permitidos.
- Vitest descubre `tests/**/*.test.ts`.

## Evidence

- `AGENTS.md`
- `docs/AI_ENGINEERING_CONSTITUTION.md`
- `context/INVARIANTS.md`
- `context/CONTRACTS.md`
- `eslint.config.js`
- `.prettierrc.mjs`
- `vitest.config.ts`
- `scripts/check-docs-structure.mjs`