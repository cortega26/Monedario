# Bootstrap Checklist

Checklist minima para validar que un entorno local quedo listo antes de empezar cambios.

## Prerrequisitos

- Node 22 (`.nvmrc`)
- pnpm 10.30.2 (`package.json`)
- Copia local de `.env.example` a `.env` cuando quieras fijar modo snapshot

## Primer arranque

1. `nvm use`
2. `pnpm install --frozen-lockfile`
3. `pnpm run lint`
4. `pnpm run check:boundaries`
5. `pnpm run format:check`
6. `pnpm run test`
7. `pnpm run check`
8. `pnpm run dev`

## Senales esperadas

- `pnpm run test` termina con exit code 0
- `pnpm run check` termina con exit code 0
- `pnpm run dev` levanta el sitio sin necesidad de fetch live a Mindicador cuando el modo economico esta en `snapshot`

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