# Auditorías pendientes — lote 2026-09-28

Briefs adversariales entregados por el mantenedor el 2026-09-28. **No ejecutados.**

| Orden | Brief | Alcance | Estado |
|-------|-------|---------|--------|
| 01 | [Correctitud, consistencia y freshness](01-correctitud-consistencia-freshness.md) | Cálculos, datos, reglas, supuestos y vigencia tratados como caja negra | **RESULTADO RECIBIDO** — informe en `docs/reports/AUDIT-CORRECTNESS-2026-09-28.md`; remediación en plan 115 |
| 02 | [SEO técnico y descubrimiento](02-seo-tecnico-descubrimiento.md) | Crawl, indexación, canonicalización y autoridad interna | **RESULTADO RECIBIDO** — informe en `docs/reports/AUDIT-SEO-2026-09-28.md` (sin plan aún) |
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
