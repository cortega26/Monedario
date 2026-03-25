# BACKLOG_SITE_AUDIT

Fecha de corte: 2026-03-25

Estado inicial del backlog derivado de `docs/editorial/SITE_AUDIT_2026-03-25.md`.

## Reglas de uso

- Todo hallazgo `Crítico` o `Alto` del informe maestro entra aquí.
- Los hallazgos `Medio` entran si afectan varias superficies o requieren cambio estructural.
- Este backlog controla remediación editorial/IA/UX; no reemplaza `docs/TECH_DEBT_BACKLOG.md`.

## Items

| ID | Superficie | URL o ruta | Tipo | Problema | Destino(s) afectados | Severidad | Acción requerida | Owner sugerido | Estado | Fecha detección | Última revisión | Dependencias | Notas |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SA-001 | Hub | `/guias/impuestos-personas/` | duplicación | Triple salida al checklist F22 dentro de la misma vista | `/posts/operacion-renta-f22-checklist/` | Crítico | Dejar una sola salida prominente al owner F22 y redistribuir dudas vecinas | Editorial + Frontend | pendiente | 2026-03-25 | 2026-03-25 | none | Caso más claro de carga cognitiva innecesaria |
| SA-002 | Hub | `/guias/pensiones-afp/` | hub inflation | El hub mezcla hero decisional, core, listado, related y onboarding repetido | varios owners del cluster | Crítico | Rediseñar el hub con una sola matriz principal de decisión | Editorial IA + Frontend | pendiente | 2026-03-25 | 2026-03-25 | SA-008 | Cuenta 2 aparece 4 veces; APV 3 veces |
| SA-003 | Hub | `/guias/ahorro-e-inversion/` | duplicación | Los owners se repiten entre listado y “Empieza aquí” | owners de ahorro | Alto | Fusionar bloques y dejar solo rutas núcleo | Editorial + Frontend | pendiente | 2026-03-25 | 2026-03-25 | none | Pseudo-hub inflado |
| SA-004 | Hub | `/guias/seguridad-financiera/` | duplicación | Las 3 piezas del hub se repiten sin cambio real de contexto | owners de seguridad | Alto | Quitar una capa de entrada y mantener solo una guía de decisión | Editorial + Frontend | pendiente | 2026-03-25 | 2026-03-25 | none | Misma estructura defectuosa que otros hubs |
| SA-005 | Hub | `/guias/empleo-ingresos/` | duplicación | Repetición de owners entre listado y arranque | cesantía, licencia, finiquito | Alto | Simplificar la entrada del hub | Editorial + Frontend | pendiente | 2026-03-25 | 2026-03-25 | none | Sobrecarga para un cluster simple |
| SA-006 | Hub | `/guias/uf-costo-de-vida/` | duplicación | UF, IPC y arriendo se reofrecen en varias zonas | owners del cluster | Alto | Convertirlo en hub con una sola secuencia conceptual -> práctica | Editorial + Frontend | pendiente | 2026-03-25 | 2026-03-25 | none | El hub es sano en ownership, no en UX |
| SA-007 | Índice | `/calculadoras/` | CTA inflation | Mismas calculadoras reaparecen 3 a 5 veces entre selector y catálogo | herramientas clave | Crítico | Mantener solo una capa primaria de decisión o degradar visualmente el catálogo | Producto editorial + Frontend | pendiente | 2026-03-25 | 2026-03-25 | SA-008 | Índice funciona como inventario duplicado |
| SA-008 | Sistema | `src/components/ContextLinkSection.astro`, `RelatedPosts.astro`, `ArticleDecisionIntro.astro`, `CalculatorCard.astro` | IA | Los componentes contextuales no tienen budget de repetición por destino | múltiples superficies | Crítico | Definir regla sistémica para no repetir un destino ya mostrado en la misma vista | Arquitectura Frontend + Editorial | pendiente | 2026-03-25 | 2026-03-25 | none | Causa transversal del problema |
| SA-009 | Navegación global | `/` | navegación | La home redistribuye mal la atención y refuerza clusters ya dominantes | hubs principales | Alto | Separar función de hero, rail temático y recientes | Editorial + Frontend | pendiente | 2026-03-25 | 2026-03-25 | none | El sitio descubre poco fuera de sus winners |
| SA-010 | Índice | `/leyes/` | duplicación | Cada ficha tiene título enlazado y CTA idéntico “Ver ficha →” | fichas legales | Alto | Dejar una sola salida primaria por tarjeta | Frontend + Contenido legal | pendiente | 2026-03-25 | 2026-03-25 | none | Duplicación mecánica de catálogo |
| SA-011 | Artículos cluster deuda | `/posts/cae-costo-real-credito-chile/`, `/posts/renegociacion-superir/`, `/posts/informe-deudas-cmf-vs-dicom/`, `/posts/donde-ver-si-estoy-en-dicom-gratis/` | canibalización editorial | Owners y supports se reinyectan circularmente | deuda-credito | Alto | Redefinir un solo “siguiente paso” por artículo y recortar related/context repetido | Editorial cluster deuda | pendiente | 2026-03-25 | 2026-03-25 | SA-008 | El cluster funciona como malla sobreenlazada |
| SA-012 | Artículos cluster sueldo | `/posts/como-calcular-sueldo-liquido/`, `/posts/liquidacion-de-sueldo/`, `/posts/descuentos-de-sueldo/`, `/posts/cuanto-descuenta-la-afp-de-tu-sueldo/` | canibalización editorial | Owners vecinos se empujan entre sí demasiadas veces | sueldo-remuneraciones | Alto | Rebalancear linking para que cada owner conserve foco dominante | Editorial cluster sueldo | pendiente | 2026-03-25 | 2026-03-25 | SA-008 | Riesgo alto de saturación contextual |
| SA-013 | Artículos previsión | `/posts/que-es-el-apv/`, `/posts/que-es-la-cuenta-2-afp/`, `/posts/fondos-afp-a-b-c-d-e/`, `/posts/reforma-previsional-2025-que-cambia-y-como-te-afecta/` | owner ambiguity | La UX no separa con suficiente fuerza owner, comparación y siguiente paso | pensiones-afp / ahorro-e-inversion | Alto | Reescribir journeys y limitar rutas contextuales repetidas | Editorial previsión + Frontend | pendiente | 2026-03-25 | 2026-03-25 | SA-008 | APV y Cuenta 2 compiten demasiado |
| SA-014 | Política editorial visible | sitio completo | IA | La política de ownership es mejor que su representación en UX | múltiples superficies | Alto | Traducir `owner/support/reference/tool` a patrones visibles de interfaz | Arquitectura editorial | pendiente | 2026-03-25 | 2026-03-25 | SA-008 | Problema sistémico, no local |
| SA-015 | Sistemas de soporte | `/tags/`, `/glosario/`, `/search/` | microcopy | Falta definición visible de rol de superficie: inventario, referencia o decisión | surfaces de soporte | Medio | Aclarar intención de cada sistema y evitar que compita con hubs | Editorial UX | pendiente | 2026-03-25 | 2026-03-25 | none | Especialmente importante para tags |

## Próxima revisión sugerida

- Revisar este backlog al cerrar la primera ronda de simplificación de hubs.
- No abrir nuevos hubs ni nuevas piezas owner en clusters críticos sin consultar `SA-002`, `SA-007`, `SA-011`, `SA-012` y `SA-013`.
