# Auditorías pendientes — lote 2026-09-28

Briefs adversariales entregados por el mantenedor el 2026-09-28. **No ejecutados.**

| Orden | Brief | Alcance | Estado |
|-------|-------|---------|--------|
| 01 | [Correctitud, consistencia y freshness](01-correctitud-consistencia-freshness.md) | Cálculos, datos, reglas, supuestos y vigencia tratados como caja negra | **REMEDIADO** — informe en `docs/reports/AUDIT-CORRECTNESS-2026-09-28.md`; plan 115 DONE, F04 cerrado (serie IPC 2026 vía BCCh/INE, `TD-0112` resuelto); falta math audit/compliance humano |
| 02 | [SEO técnico y descubrimiento](02-seo-tecnico-descubrimiento.md) | Crawl, indexación, canonicalización y autoridad interna | **REMEDIADO (Fase 1)** — informe en `docs/reports/AUDIT-SEO-2026-09-28.md`; plan 116 DONE (SEO-01/03/04/07 + guardas); Fase 2 (SEO-02/05/06/08) pendiente de selección |
| 03 | [Privacidad y seguridad pasiva](03-privacidad-seguridad-pasiva.md) | Fugas de datos, promesas públicas de privacidad y configuración defensiva | PENDIENTE |
| 04 | [Resiliencia y performance observable](04-resiliencia-performance-live.md) | Degradación, caché, redes lentas, CLS y calculadoras bajo condiciones adversas | PENDIENTE |

## Bloqueador

Pendientes por un prerequisito previo indicado por el mantenedor el 2026-09-28
(por confirmar). No iniciar ninguna auditoría hasta resolverlo.

## Reglas de ejecución (al desbloquear)

- El brief correspondiente es el contrato de alcance; no ampliarlo a una
  auditoría UX/UI general.
- Técnicas pasivas y no destructivas sobre producción (aplica sobre todo al
  brief 03).
- Evidencia y resultados van a `docs/reports/AUDIT-<tema>-<fecha>.md`.
- Los remedios se planifican en `plans/` con verificación propia.
