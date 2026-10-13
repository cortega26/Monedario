# Menú móvil compacto — Monedario

## Objetivo

Corregir la desalineación y el exceso de espacio del menú en pantallas
pequeñas, sin cambiar rutas, contenido editorial o navbar de escritorio.

## Alcance

- Dentro: `src/components/Header.astro` y
  `tests/accessibility/mobile-navigation.test.ts`.
- Fuera: páginas, rutas/SEO, calculadoras, estilos globales y código de
  comportamiento del desplegable.
- Diff mínimo. Preservar IDs, atributos ARIA, eventos de analítica y enlaces.

## Comportamiento esperado

- Móvil (menos de 1024 px): Guías, Calculadoras, Glosario y Metodología
  alineados a la izquierda, cada uno a todo el ancho y con espaciado uniforme.
- Buscar y cambiar tema comparten una fila separada visualmente.
- Escritorio: menú horizontal sin alteraciones.
- Guías, Escape, apertura/cierre y teclado continúan operativos.
- Sin dependencias ni URLs nuevas.

## Comprobaciones

- `pnpm exec playwright test tests/accessibility/mobile-navigation.test.ts`:
  alineación móvil, utilidades, desplegable y escritorio.
- `pnpm run lint`: sin errores.
- `pnpm run format:check`: sin errores.
- `pnpm run test`: sin regresiones.
- `pnpm exec astro check`: sin errores.

Rollback: revertir el PR. No hay migraciones ni cambios de datos.
