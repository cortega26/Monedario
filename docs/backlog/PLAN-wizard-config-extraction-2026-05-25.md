# PLAN — Wizard Config Extraction (2026-05-25)

Status: completed

## Objetivo

Extraer los wizards publicados que aun viven inline en paginas Astro a configuraciones reutilizables y aplicar la regla transversal de preguntas discriminativas.

## Alcance

- Extraer `licencia-medica` y `fraude-cargo-no-reconocido` a `src/config/`.
- Analizarlos con `analyzeWizardConfig`.
- Simplificar pasos redundantes detectados cuando el mismo diff lo permita sin cambiar la intencion editorial.

## Restricciones

- Sin nuevas rutas publicas.
- Sin cambios a copy legal de fondo fuera de la necesidad del flujo.
- Mantener el comportamiento correcto de los resultados existentes.

## Progreso

- 2026-05-25: Se extrajeron `LICENCIA_MEDICA_WIZARD_CONFIG` y `FRAUDE_CARGO_NO_RECONOCIDO_WIZARD_CONFIG` a `src/config/decisionWizards.ts`.
- 2026-05-25: Se actualizaron las paginas publicadas para consumir las configs compartidas en vez de declarar el arbol inline.
- 2026-05-25: Se simplifico la primera pregunta del wizard de fraude: tarjeta, compra online y suscripcion ya no aparecen como opciones separadas porque antes llevaban a la misma ruta.
- 2026-05-25: Se agregaron pruebas de enforcement para que los wizards publicados no tengan pasos no discriminativos.

## Evidencia

- `pnpm exec vitest run tests/integration/decisionWizards.test.ts tests/domain/analyzeWizardConfig.test.ts tests/integration/articleEntryGuides.test.ts`
- `pnpm exec astro check`
