# Plan: botón compacto de Ko-fi

## Objetivo

Sustituir el placeholder alto y el widget diferido de Ko-fi por el botón oficial
compacto, enlazado directamente a la página de aportes de Monedario.

## Alcance

- `src/pages/apoyar.astro`
- `public/_headers`
- `tests/integration/csp-hashes.test.ts`

## Fuera de alcance

- Rutas, contenido editorial, analítica de otros CTA y dependencias.

## Contratos preservados

- `URL.PUBLIC.NO_POST_ID` y `CONTRACT.PUBLIC_URLS`: no cambia ninguna URL pública.
- La CSP de Ko-fi mantiene sus orígenes limitados a `/apoyar/*`.

## Decisión

Usar el formato oficial de botón de Ko-fi (taza + CTA) como HTML estático. La
taza se sirve localmente para que la política CSP global no bloquee su carga.
Esto elimina la tarjeta de 200 px y el JavaScript de terceros, conserva la
apertura segura en una pestaña externa y reduce la superficie de CSP.

## Progreso

- [x] Línea base: `pnpm run test` — 1.187 pruebas pasaron.
- [x] Implementación, prueba y build.
- [x] Corrección: taza local para evitar la intersección restrictiva entre las
  políticas CSP global y específica de `/apoyar`.

## Evidencia de cierre

- `pnpm run test`: 1.187 pruebas pasaron.
- `pnpm run astro check`, `pnpm exec astro build`, `pnpm run lint` y
  `pnpm run check:boundaries`: pasaron.
- Se confirmó que el HTML generado no conserva el widget, su reserva de 200 px
  ni el script de Ko-fi; incluye el botón compacto con la taza oficial local.

## Rollback

Revertir los cambios en `src/pages/apoyar.astro` y `public/_headers`. No hay
migración de datos ni de contenido.
