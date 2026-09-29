# Auditorías pendientes — lote 2026-09-28

Briefs adversariales entregados por el mantenedor el 2026-09-28. **No ejecutados.**

| Orden | Brief | Alcance | Estado |
|-------|-------|---------|--------|
| 01 | [Correctitud, consistencia y freshness](01-correctitud-consistencia-freshness.md) | Cálculos, datos, reglas, supuestos y vigencia tratados como caja negra | **REMEDIADO** — informe en `docs/reports/AUDIT-CORRECTNESS-2026-09-28.md`; plan 115 DONE, F04 cerrado (serie IPC 2026 vía BCCh/INE, `TD-0112` resuelto); falta math audit/compliance humano |
| 02 | [SEO técnico y descubrimiento](02-seo-tecnico-descubrimiento.md) | Crawl, indexación, canonicalización y autoridad interna | **REMEDIADO** — informe en `docs/reports/AUDIT-SEO-2026-09-28.md`; plan 116 DONE (Fase 1) + planes 117–120 DONE (Fase 2: SEO-02/05/06/08); remanente: dedupe de contenido YMYL de Operación Renta (`docs/backlog/PLAN-operacion-renta-dedupe-2026-09-29.md`, revisión editorial humana) |
| 03 | [Privacidad y seguridad pasiva](03-privacidad-seguridad-pasiva.md) | Fugas de datos, promesas públicas de privacidad y configuración defensiva | **REMEDIADO** — informe en `docs/reports/AUDIT-PRIVACY-2026-09-29.md`; plan 121 DONE (PRIV-01/02/03 resueltos; `test:privacy` + invariante) |
| 04 | [Resiliencia y performance observable](04-resiliencia-performance-live.md) | Degradación, caché, redes lentas, CLS y calculadoras bajo condiciones adversas | **RESULTADO RECIBIDO** — informe en `docs/reports/AUDIT-RESILIENCE-2026-09-29.md`; remediación en plan 122 (RES-01/02 no reproducidos; RES-03/04 accionables) |

## Bloqueador (resuelto 2026-09-29)

El prerequisito era la optimización E-E-A-T. Según
`docs/backlog/EEAT-STRATEGY-2026-09-28.md` (§Secuencia acordada), las
auditorías 03/04 **pueden correr en paralelo** y no dependen del cierre de los
ítems E-E-A-T. Estado E-E-A-T al desbloquear: #5/#6 (`ProfilePage`) y #8
(freshness/F04) hechos; #1 (revisor externo) es lead time humano en curso; #2
(bloque de verificación) al cerrar el plan 115; #7 (`/correcciones/`) queda
post-2026-11-02 por FOCO ESTRICTO (URL nueva).

## Reglas de ejecución (al desbloquear)

- El brief correspondiente es el contrato de alcance; no ampliarlo a una
  auditoría UX/UI general.
- Técnicas pasivas y no destructivas sobre producción (aplica sobre todo al
  brief 03).
- Evidencia y resultados van a `docs/reports/AUDIT-<tema>-<fecha>.md`.
- Los remedios se planifican en `plans/` con verificación propia.
