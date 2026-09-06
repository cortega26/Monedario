# Precarga de fuente del resultado de sueldo — 2026-09-05

Estado: COMPLETADO e integrado. Base de medición: `main`, `9cf7fe45`.

PR: https://github.com/cortega26/Monedario/pull/461. Integrado por squash en
`b0db4567` (2026-09-06 UTC), con todos los checks remotos verdes. Rama remota
eliminada; rama local y worktree temporal retirados en el cierre del 2026-09-06.

## Diagnóstico y decisión

Lighthouse desktop (tres cargas frías) reproduce CLS
`0.0002594572347558619` tanto en main como en el merge candidato del PR #460.
El nodo desplazado es el monto de ejemplo de sueldo líquido; Lighthouse
identifica la carga de `fraunces-latin-es-400-700.woff2` como causa.
La fuente usa `swap`, pero el layout excluye todas las calculadoras del preload.
Sueldo líquido es la excepción que ya requiere Fraunces en contenido inicial.

Decisión: precargar esa fuente únicamente en sueldo líquido y preservar su
tipografía. No cambiar `swap`, ocultar el resultado, relajar CLS, ni cargar
Fraunces en calculadoras que no la usan. La precarga adelanta una descarga ya
existente; verificar reutilización y coste móvil. Corrección independiente del
PR #460. Guía técnica: https://web.dev/articles/optimize-cls#web_fonts.

## Alcance y autoridad

En alcance: `src/layouts/Layout.astro`,
`tests/accessibility/font-guardrail.test.ts`, este plan,
`artifacts/lighthouse/sueldo-font-preload-2026-09-05.json`,
`docs/TECH_DEBT_BACKLOG.md` y `todo.md` temporal.
Fuera: fórmulas, APIs, fuentes binarias, CSS global, URLs, contenido editorial,
otros cambios locales y cambios al mecanismo de relacionados.
Constitución > AGENTS > context > código; Constitución §1, §2.3 y §4.3.
Se preservan `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES` y
`RSS.NO_REMOVALS`; sin cambios de contratos públicos o de capas.

## Verificación

| Comando / evidencia | Criterio | Estado |
| --- | --- | --- |
| `pnpm run test` antes de cambios | Baseline conocida | 1406 tests pasan |
| `pnpm exec playwright test tests/accessibility/font-guardrail.test.ts` | Una descarga y preload en sueldo; ninguna en UTM; editorial preservado | PASS: tres tests; regresión falla antes del fix |
| `pnpm run check:ci` | Gates locales verdes | PASS: 1406 tests, 160 archivos, Astro sin diagnósticos |
| `pnpm run build` | Build y enlaces correctos | PASS: 327 HTML, 7024 enlaces, cero internos rotos |
| Lighthouse desktop local, cinco URLs × tres runs | Assertions actuales, incluido CLS 0 | PASS: Performance 100, CLS/TBT 0 en las 15 mediciones |
| Lighthouse mobile local, sueldo y UTM × tres runs | Sin regresión de carga por nueva descarga en UTM | PASS: sin descarga de Fraunces en UTM; comparación abajo |

## Change Control Record

1. Scope: los archivos indicados; corrección de descubrimiento temprano de fuente.
2. Módulos: layout selecciona precarga; test verifica comportamiento de red real.
3. Invariantes: selección de recurso estático, sin cambiar rutas o contenido.
4. Contratos: sin API nueva ni breaking changes; sin ADR arquitectónico requerido.
5. Fronteras: sin imports nuevos ni cambios entre capas.
6. Tests: baseline y regresión de carga; cobertura por capas no aplica.
7. Rollback: revertir esta unidad, sin migraciones ni cambios de datos.
8. Riesgo: priorización de fuente puede afectar móvil; medir con misma config.

## Evidencia y revisión final

Registro completo de métricas por corrida:
`artifacts/lighthouse/sueldo-font-preload-2026-09-05.json`.

- Main y PR #460: CLS idéntico `0.0002594572347558619` (3/3 corridas).
- Fix desktop: CLS 0 (3/3 en sueldo), resto de las cinco páginas también pasa.
- Sueldo móvil, medianas antes/después: LCP 1959/1957 ms (sin regresión
  apreciable), Speed Index 1880/1436 ms, Performance 98/99; CLS/TBT 0.
- UTM móvil: LCP 1353/1265 ms, Performance 100, CLS/TBT 0 y ninguna descarga
  de Fraunces. No se atribuyen pequeñas variaciones temporales al cambio.
- Mobile conserva su política de telemetría warn-only; el objetivo de LCP
  1700 ms no se alcanza en sueldo ni antes ni después y no se modifica.
- No se afirma garantía para toda red/dispositivo: son mediciones de carga
  en laboratorio, no datos de campo. Se elimina el retraso de descubrimiento
  identificado, manteniendo el diseño y el comportamiento de carga `swap`.

Prueba de regresión verificada contra el build previo: solo falla el test nuevo
por ausencia de preload; tras compilar el fix pasan los tres. En este entorno
el puerto 4321 estaba ocupado por otro servidor (404); se usó una configuración
temporal equivalente con servidor exclusivo en 44321 y resultados en `/tmp`.
Los informes del intento inicial se retiraron antes de ejecutar el gate docs.
No se modificó la configuración compartida de Playwright.

Revisión adversarial: fuente, tamaño, peso, estilos y fórmulas permanecen;
se reutiliza una única descarga; el patrón general de exclusión de calculadoras
se conserva con una excepción explícita para un recurso ya necesario.
Decisión: resolver este bug en su propia unidad e integrar después #460,
sin excepción de CLS. Seguimiento de deuda: TD-0106, cerrado por este cambio.
