# Menú móvil compacto — Monedario

## Objetivo
Corregir la desalineación y el exceso de espacio del menú de navegación en pantallas pequeñas, sin cambios en las rutas, el contenido editorial ni el navbar de escritorio.

## Alcance
- In scope: `src/components/Header.astro`, `tests/accessibility/mobile-navigation.test.ts`.
- Out of scope: páginas, rutas/SEO, componentes de calculadoras, tokens globales de diseño y lógica de menú desplegable.
- Cambios mínimos en las clases Tailwind; preservar IDs, atributos ARIA, analytics y funcionamiento del menú.

## Comportamiento esperado
- Móvil (<1024px): enlaces Guías, Calculadoras, Glosario y Metodología alineados a la izquierda, cada uno ocupando todo el ancho, espaciado uniforme; Buscar y tema juntos en una fila de utilidades.
- Escritorio (>=1024px): navegación horizontal sin cambios.
- Abrir/cerrar, desplegar Guías y accesos por teclado siguen funcionando.
- Sin cambios en enlaces ni incorporación de dependencias.

## Verificación
| Prueba | Comando | Resultado esperado |
| --- | --- | --- |
| Layout y accesibilidad responsive | `pnpm exec playwright test tests/accessibility/mobile-navigation.test.ts` | Menú móvil alineado, utilidades en fila, escritorio horizontal, Guías interactivo |
| Lint | `pnpm run lint` | Sin errores |
| Formato | `pnpm run format:check` | Sin errores |
| Tests | `pnpm run test` | Sin regresiones |
| Verificación de tipos | `pnpm exec astro check` | Sin errores |

Rollback: revertir los commits del PR; no hay migraciones ni cambios de datos.
