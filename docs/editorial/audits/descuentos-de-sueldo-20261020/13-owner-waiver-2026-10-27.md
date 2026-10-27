# Waiver del owner — publicación de la corrección `descuentos-de-sueldo`

**Fecha:** 2026-10-27
**Owner:** Carlos Ortega (aprobado en conversación; este documento lo registra)
**PR:** #719 (`fix/descuentos-de-sueldo-art58-2026-10-20`)
**SHA auditado:** `332edf28b714f692e550bc2de2dec26fec4827cf`
**Artefacto de auditoría:** `02-result.json` (veredicto global `CONDITIONAL`)

## Qué autoriza este waiver

Publicar la corrección de `src/data/blog/descuentos-de-sueldo.md` (hallazgos
F01–F08 y defectos D9–D12, D15, D17) **aunque el artefacto de auditoría
conserva veredicto global `CONDITIONAL`**, porque los defectos de producto
abiertos **no pertenecen a la superficie que este PR modifica**.

El veredicto del artefacto **no se altera**: sigue `CONDITIONAL`. Este documento
es la excepción explícita, con alcance y responsables, exigida por
`AI_AUDIT_PROTOCOL` §3 cuando el owner decide publicar con defectos abiertos
fuera de la superficie corregida.

## Base de la decisión

- **D10: PASS** en el alcance delimitado (auditoría R6, SHA `332edf28`).
  Cero defectos de producto abiertos en las superficies editoriales y en las
  calculadoras de nómina que este PR toca.
- **Resueltos:** D9, D10, D11, D12, D15, D17.
- Los defectos restantes viven en **otras páginas** o se cierran en la firma.

## Defectos que NO se resuelven aquí (enumerados)

Se difieren a la **causa 2 (AFC / seguro de cesantía) y al backlog de
remediación**. Ninguno se introduce ni se agrava en este PR; se conservan
abiertos y trazables:

| ID | Sev. | Dónde | Qué |
|---|---|---|---|
| D1 | media | `codigo-del-trabajo.md:54` | Tope de gratificación con IMM vencido ($539.000 → publica $2.560.250) |
| D2 | media | `como-calcular-sueldo-liquido.md` | AFP Capital rotulada con la comisión de Modelo (0,58%) |
| D3 | baja | `primer-empleo…:194` | "3% al FCS" en plazo fijo; el 3% se reparte distinto |
| D4 | baja | `primer-empleo…:134` | SIS 1,87% vs 1,78% vigente |
| D6 | baja | `primer-empleo…:110,222,225` | 10,5% rotulado "ahorro previsional" |
| D7 | baja | `dl-3500-sistema-afp.md:31` | Rango de comisiones 0,58–1,45% vs 0,46–1,45% |
| D8 | media | `primer-empleo…:142,267` | 12 meses para cambiarse de AFP; son 24 |
| D13 | media | `como-calcular-sueldo-liquido.md:104,245,252` | Todos los descuentos "sobre imponible" |
| D14 | baja | `como-calcular-sueldo-liquido.md:133` | Fonasa 7% sin tope de 90 UF |
| D16 | baja | `correcciones.json` | La entrada no consigna el cambio material completo |

**D18** (metadatos de revisión) no se difiere a causa 2: se cierra **en la
firma humana**, moviendo `reviewPolicy.computedAt`, `updatedDate` y
`validAsOf` a la fecha de firma en un solo commit. La semántica de `reviewedBy`
en `ArticleJsonLd` va a issue aparte.

**D5** (`audit-package`) no bloquea publicación por `AI_AUDIT_PROTOCOL` §3: los
defectos del paquete se corrigen sin bloquear.

## Condiciones no negociables

1. **`humanSignoff` lo completa el owner.** Este waiver no sustituye la firma
   ni autoriza publicar sin ella.
2. En el mismo commit de firma se cierran las fechas de D18.
3. No se crean URLs nuevas, no cambia el slug ni el canonical.
4. La entrada de `correcciones.json` para esta corrección queda registrada (D16
   describe que su redacción es incompleta; corregir su texto va con la causa 2
   o con la firma, a decisión del owner).
5. Si la causa 2 no arranca antes de la próxima revisión semestral de la página,
   D1–D8, D13, D14 y D16 se revisan para reasignar prioridad, no para cerrarse
   sin corrección.

## Riesgo residual aceptado

Un lector puede encontrar, en páginas enlazadas desde esta, las afirmaciones
listadas arriba sin corregir. El PR no las empeora y la página corregida no las
reproduce. El owner acepta ese estado de forma explícita y con plazo atado a la
causa 2.

## Rollback

Revert del PR. Si se publicó y se revierte, retirar la entrada de
`correcciones.json` solo si la corrección material también se revierte.
