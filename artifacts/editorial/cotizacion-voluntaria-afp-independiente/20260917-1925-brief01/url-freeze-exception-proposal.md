# Propuesta de excepción al freeze de rutas — `cotizacion-voluntaria-afp-independiente`

Contexto: `docs/governance/STRATEGIC_FOCUS_2026Q3.md` (vigente 2026-08-02 a
2026-11-02) bloquea toda URL indexable nueva, incluidos artículos, salvo
excepción con entrada completa y `decision: APPROVED` en
`docs/governance/url-freeze-exceptions.json`.

Esta propuesta cubre los 8 campos sustantivos. Los 4 campos de aprobación
(`decision`, `approvedBy`, `approvedAt`, `expiresAt`) se dejan en blanco a
propósito — son responsabilidad exclusiva del humano aprobador, no de este
agente.

## Campos propuestos

**url:** `/posts/cotizacion-voluntaria-afp-independiente/`

**problem:** Vacío de contenido confirmado en Gate 00 (2026-09-17): cero
artículos en el sitio cubren la afiliación/cotización VOLUNTARIA en AFP para
quien no cotiza por boletas obligatorias (freelance bajo el umbral de 5 IMM,
socios que reciben retiros/dividendos, personas sin actividad remunerada
formal). Es un mecanismo legal distinto (art. 92 J DL 3.500) del que ya
cubren `boleta-honorarios-2026-retencion-cobertura` (obligatorio) y
`rentas-mixtas-sueldo-honorarios` (tributario) — confirmado sin conflicto de
ownership por `audit:topic-overlap`.

**evidence (la parte más débil del caso — léela con ese peso):** Evidencia
de vacío: confirmada por grep exhaustivo sobre `src/data/blog/`, glosario y
leyes (Gate 00, 2026-09-17) — cero cobertura previa. Evidencia de demanda:
**limitada**. No se pudo obtener volumen de búsqueda real: Ahrefs devolvió
`"Insufficient plan"` en la sesión de Gate 00 y no se reintentó desde
entonces. Señal indirecta débil: la Superintendencia de Pensiones, la
Asociación de AFP de Chile (AAFP) y el SII mantienen páginas oficiales
dedicadas específicamente a esta pregunta — sugiere que es una pregunta
recurrente, pero **no es una métrica de demanda medida**. No hay dato de GSC
propio porque la URL nunca existió.

**hypothesis:** Un lector sin boletas obligatorias que busca "cómo cotizar
siendo independiente/freelance sin boletas" no encuentra hoy respuesta en el
sitio y probablemente resuelve la duda en otra fuente (Superintendencia,
AAFP, o un comparador de terceros). Publicar esta pieza captura esa
intención dentro del cluster `pensiones-afp` ya existente, sin crear cluster
nuevo ni calculadora nueva, y sin capturar datos financieros personales del
lector — coherente con el principio rector del foco 2026Q3 aunque su
superficie de validación oficial sea el conversor UTM, no este artículo.

**cost:** Costo de producción ya incurrido en su totalidad: pipeline
editorial completo (Gate 00, brief, dossier con 13 fuentes fetcheadas,
outline, draft, 2 rondas de math-audit independientes, compliance,
corrección de 4 defectos, imagen hero generada y validada). Cero costo
incremental de desarrollo pendiente.

**maintenance:** Cadence semestral ya configurada
(`reviewPolicy.cadenceLabel=semiannual`, `maxDays=180`), mismo patrón que los
artículos hermanos del cluster `pensiones-afp`. Dos valores volátiles
(Ingreso Mínimo para Fines No Remuneracionales, tasa SIS) quedan pendientes
de registro en `editorial-volatile-data-registry.json` para sincronización
automática futura — no bloqueante (DEFECT #4 de `06-compliance.md`).

**metric:** Clics e impresiones en GSC para la URL; interacción con los
enlaces de siguiente-paso hacia `boleta-honorarios-2026-retencion-cobertura`,
`pgu-pension-garantizada-universal` y `fondos-afp-a-b-c-d-e`; ausencia
continuada de señal de canibalización en `audit:topic-overlap`.

**threshold:** Sugerido (a decidir por quien aprueba): revisar junto con el
resto del foco en la ventana del 2026-11-02. Umbral mínimo sugerido — ≥1
clic o ≥50 impresiones en GSC en las primeras 4 semanas post-publicación
como señal de que la intención de búsqueda existe; no se exige conversión
porque el artículo no captura datos financieros.

## Campos de aprobación (llenar tú, no el agente)

```json
{
  "url": "/posts/cotizacion-voluntaria-afp-independiente/",
  "problem": "...",
  "evidence": "...",
  "hypothesis": "...",
  "cost": "...",
  "maintenance": "...",
  "metric": "...",
  "threshold": "...",
  "decision": "APPROVED",
  "approvedBy": "",
  "approvedAt": "",
  "expiresAt": ""
}
```
