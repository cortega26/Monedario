# ADR-20260520-retire-cambios-contacto-routes

Date: 2026-05-20
Status: Accepted

## Context

`/cambios/` (Novedades) y `/contacto/` son dos rutas en la sección Confianza del footer que presentan un tradeoff negativo:

- `/cambios/` requiere actualización manual continua, genera drift cuando no se actualiza, y tiene tráfico negligible. La fuente de verdad (`changelog.ts`) sigue siendo útil para el trust badge de la homepage, pero no justifica una página expuesta.
- `/contacto/` es una página mínima (un email obfuscado + disclaimers) que duplica información que puede vivir en `/autor/`, donde el usuario ya va a conocer quién está detrás del sitio.

## Decision

1. **`/cambios/`** → 301 a `/metodologia/`. La página se elimina del sitio. `changelog.ts` sigue siendo la fuente de la fecha en el trust badge. Todas las referencias internas a `/cambios/` se actualizan a `/metodologia/` o a la sección de reporte de errores en `/autor/`.

2. **`/contacto/`** → 301 a `/autor/`. La página se elimina. El email de contacto, los casos de uso del canal y el aviso legal se integran en `/autor/` como sección `#contacto`. Se añade además un formulario estructurado de reporte de errores (`#reportar-error`) con categorización por tipo.

## Consequences

- **Positivo**: Reduce la superficie de mantenimiento en 2 páginas. Elimina el riesgo de drift en el changelog. La información de contacto es más descubrible (el usuario ya está en la página del autor). El formulario de reporte mejora la UX sobre el modelo de "copiar email".
- **Trade-off**: URLs históricas rompen si alguien tiene el email guardado con `/contacto/`, mitigado por 301. El `Person` schema `@id` en `/autor/` no cambia.
- **Costo operativo**: Ninguno post-implementación. El form usa mailto estructurado — cero backend, upgradeable a Formspree sin cambiar la interfaz.

## Alternatives considered

- **Mantener `/cambios/` sin link**: Orphan page, sigue en sitemap, sigue siendo superficie de drift. Descartado.
- **Formulario con Formspree/Web3Forms**: Profesional, pero requiere cuenta externa y gestión de keys. Diferido — la implementación actual es upgradeable sin cambiar el HTML del form.
- **Mantener `/contacto/` como página independiente**: Requiere sincronizar cambios en dos lugares. No hay contenido suficiente para justificarlo.

## Verification

```bash
# Redirects presentes en _redirects
grep "cambios\|contacto" public/_redirects

# Páginas fuente eliminadas
test ! -f src/pages/cambios.astro && echo "OK" || echo "MISSING"
test ! -f src/pages/contacto.astro && echo "OK" || echo "MISSING"

# Sin referencias internas colgadas a /cambios/
grep -r '"/cambios/' src/ --include="*.astro" --include="*.ts"

# Build limpio
pnpm build 2>&1 | tail -5
```
