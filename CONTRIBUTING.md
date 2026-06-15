# Contribuyendo a Monedario

Gracias por tu interés en contribuir a Monedario. Este documento describe el flujo básico para realizar contribuciones al repositorio.

## Primeros pasos

Si eres nuevo en el proyecto, comienza por leer los siguientes documentos en orden:

1. [`START_HERE.md`](START_HERE.md) — Guía de arranque rápido para configurar el entorno local.
2. [`AGENTS.md`](AGENTS.md) — Protocolo operativo para agentes (humanos y automatizados) en este repositorio.

## Flujo de contribución

1. **Fork** del repositorio (si contribuyes externamente) o crea una **rama** descriptiva siguiendo la convención `tipo/area-descripcion` (ej. `fix/seo-typo`, `feat/utm-calculator`).
2. **Desarrolla** tus cambios siguiendo las convenciones del proyecto:
   - Ejecuta `pnpm install --frozen-lockfile` para instalar dependencias.
   - Asegúrate de que el código pase los checks locales con `pnpm run check`.
   - Ejecuta los tests con `pnpm test`.
3. **CI verde**: Todos los workflows de CI deben pasar antes de solicitar una revisión. Esto incluye linting, type-checking, tests y checks de calidad.
4. **Pull Request**: Abre un PR contra `main` usando la plantilla disponible. Incluye una descripción clara del cambio y, si corresponde, referencia el issue o la tarea asociada.

## Estándares

- **Idioma**: El código, los comentarios y la documentación deben estar en español neutral para mantener consistencia con el resto del proyecto.
- **Commits**: Usa mensajes de commit descriptivos, preferentemente con prefijos como `feat:`, `fix:`, `docs:`, `chore:`, etc.
- **Tests**: Incluye tests para funcionalidad nueva. El proyecto usa Vitest para tests unitarios y Playwright para tests e2e.

## Código de conducta

Este proyecto sigue un código de conducta para garantizar un ambiente respetuoso e inclusivo. Ver [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) para más detalles.

## Reportar issues de seguridad

Si encuentras una vulnerabilidad de seguridad, **no abras un issue público**. Envía un reporte a través de los canales indicados en [`SECURITY.md`](SECURITY.md).
