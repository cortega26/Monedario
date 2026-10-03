# Seguimiento de cumplimiento — rentas mixtas — round 8

Fecha: 2026-10-02  
Alcance: delta posterior a `06-compliance-round7.md`: condición previsional del
Régimen A y descripción de la corrección en el registro existente.

**Veredicto de la delta: PASS.** El artículo incluye la condición omitida en
R7 y el registro existente la describe. Esto cierra esos dos hallazgos de R7;
no equivale a una nueva firma de publicación.

## Método y evidencia

- Revisé `docs/editorial/NORMA_YMYL.md` §§1.1, 5.1–5.4 y 7;
  `docs/editorial/DEFINITION_OF_DONE.md` §2; el artículo actual y su `git diff
  HEAD`; `src/data/correcciones.json`; y el informe histórico
  `06-compliance-round7.md`.
- Refetcheé el [Compendio de la Superintendencia de Pensiones, Capítulo XII,
  nums. 5–7](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2909.html)
  el 2026-10-02. Los nums. 5–6 condicionan la bonificación a destinar el ahorro
  acogido al Régimen A a anticipar o incrementar la pensión, fijan el 15% y el
  tope anual de 6 UTM; el num. 7 limita los aportes elegibles a diez veces las
  cotizaciones obligatorias del mismo año.
- El artículo refleja esos elementos en “APV y cómo puede reducir tu impuesto
  final” y la FAQ del Régimen A. La ficha JSON conserva el id
  `rentas-mixtas-apv-y-convenios`, apunta mediante
  `/posts/rentas-mixtas-sueldo-honorarios/` al artículo y su texto de `wrong`
  y `fixed` identifica ahora el destino previsional requerido.
- CodeGraph confirma que `src/pages/correcciones.astro` importa
  `@/data/correcciones.json` como `registry` y obtiene `registry.corrections`.
  `pnpm run check:correcciones`: **OK**, 12 entradas válidas.

## Otras afirmaciones y límites

Las comprobaciones R7 sobre obligación F22, propuesta SII, base imponible,
umbral/IGC, APV agregado, tasa de retención, convenio TGR y fechas AT2026/AT2027
siguen como antecedente: el informe R7 las verificó con fuentes primarias y
esta revisión acotada no detecta cambios en ellas. No las refetcheé ni las
reevalué en esta ronda.

La puntuación NORMA §7 de R7 fue **8,6/10** para la versión previa. Este
seguimiento no recalifica integralmente el artículo; no acredita el umbral
9,5/10 ni sustituye firma humana. El gate del registro sí quedó validado.

