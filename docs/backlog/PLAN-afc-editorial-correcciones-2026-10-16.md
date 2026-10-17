# Corrección material AFC — plan y especificación 2026-10-16

**Estado:** DRAFT, publicación BLOQUEADA hasta auditoría matemática, compliance independiente y firma humana.

## Objetivo
Rectificar mínimos CIC (10/5), segundo pago (60%), financiamiento de casa particular, causal del art. 163 bis y seguro de lagunas (10,10%) en dos artículos publicados. Preservar URLs, motor del simulador, interlinks, diseño, SEO y contratos.

## Scope declarado
In: dos Markdown de cesantía, `src/data/correcciones.json`, una prueba en `tests/integration/`, dos paquetes editoriales y este plan.
Out: `src/domain/**`, `src/application/**`, calculadora, rutas/RSS, CI, dependencias. No se crean URLs ni se modifica la lógica financiera.

## Fuentes primarias verificadas a 2026-10-16
- AFC requisitos CIC/FCS: https://www.afc.cl/mi-seguro-de-cesantia/requisitos-y-documentos/
- AFC cálculo mensual: https://www.afc.cl/mi-seguro-de-cesantia/beneficios/
- AFC aportes por tipo de contrato: https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/
- AFC Seguro de Lagunas: https://www.afc.cl/afc-informa/noticias/reforma-de-pensiones-asi-funcionara-el-seguro-de-lagunas-previsionales/

## Checklist y verificación reproducible
- [x] Precisión AFC comprobada y scope acotado.
- [x] Propuesta de artículos y registro público en rama.
- [x] Prueba de guardia añadida (aún no ejecutada).
- [ ] `pnpm exec vitest run tests/integration/afc-editorial-consistency.test.ts` — debe pasar.
- [ ] `pnpm run check:correcciones` — debe pasar.
- [ ] `pnpm run check:frontmatter` — debe pasar.
- [ ] `pnpm run check:legal-citations` — debe pasar.
- [ ] `EDITORIAL_ENFORCE=1 pnpm run check:editorial` — debe pasar.
- [ ] `pnpm run check:editorial-timeliness` — debe pasar.
- [ ] `pnpm run check:ci` y CI PR — deben pasar.
- [ ] `05-math-audit.md` por agente distinto al autor, PASS.
- [ ] `06-compliance.md` por Claude Code en sesión fresca, PASS y score >=9.5.
- [ ] `07-publish-packet.md`, firma exclusiva HumanEditor.
- [ ] Verificar fecha real de publicación para `date` en el registro.

## Riesgo/rollback
Riesgo editorial-laboral alto; publicación prohibida antes de gates completos. Reversión mediante revert del commit antes de publicación; nunca borrar silenciosamente un registro de corrección que ya fue público.
