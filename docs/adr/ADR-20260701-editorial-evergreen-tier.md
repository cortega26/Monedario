# ADR-20260701-editorial-evergreen-tier

Date: 2026-07-01
Status: Accepted

## Context

`INVARIANT.EDITORIAL.TIMELINESS_REVIEW_SLA` (vía `scripts/check-editorial-timeliness.mjs`)
obliga a todo artículo publicado a una cadencia de revisión periódica
(`categoryPolicies` + `slugOverrides` en `src/config/editorial-timeliness-policy.json`),
sin excepción. Esto es correcto para contenido con cifras, leyes o productos
financieros vigentes, pero penaliza sin motivo a artículos puramente
conceptuales o metodológicos (ej. qué es el interés compuesto, cómo hacer un
presupuesto, qué hacer ante un fraude con tarjeta) que no dependen de ningún
dato que pueda quedar desactualizado.

Un inventario de los 53 artículos publicados identificó 25 candidatos sin
`volatileData`, sin `articleLead.officialSources` y sin cifras/leyes vigentes
en el cuerpo. Mantenerlos bajo el SLA genérico de 180 días genera trabajo de
revisión recurrente sin valor editorial real, y diluye la señal de "review
vencido" del gate — ahoga los artículos que sí necesitan atención real entre
ruido de artículos que no cambian nunca.

El mismo trabajo de revisión detectó, además, un gap de sensibilidad mal
calibrada en sentido opuesto: `gratificacion-legal-chile` (tope de 4,75 IMM
anual) y `pgu-pension-garantizada-universal` (monto reajustable) citan cifras
legales sensibles en prosa sin ningún `volatileData` que las proteja de drift,
heredando solo la cadencia genérica de 180 días de su categoría. Ese ajuste se
resuelve con el mecanismo de `slugOverrides` ya existente y se aplica junto
con este cambio, aunque es conceptualmente independiente del tier evergreen.

Bajo `AGENTS.md` Rule 4.3, un cambio de semántica del gate de CI requiere ADR.

## Decision

Introducir un cuarto `sourceMode`: `"evergreen"`, junto a los tres existentes
(`manual_review`, `manual_review_with_official_sources`,
`runtime_snapshot_plus_editorial_review`).

- Solo puede asignarse vía `slugOverrides` en
  `src/config/editorial-timeliness-policy.json` — nunca como
  `defaultSourceMode` ni en `categoryPolicies`, para evitar exenciones masivas
  accidentales de una categoría completa. `loadPolicy()` rechaza ambos casos.
- Un artículo evergreen no calcula `dueDate` ni puede marcarse `stale`; el SLA
  de revisión periódica queda exento.
- Sigue requiriendo una fecha de referencia trazable
  (`articleLead.validAsOf` / `updatedDate` / `pubDate`) — el gate no exime de
  tener una fecha, solo del vencimiento.
- Es incompatible con declarar `volatileData`: si un artículo evergreen
  declara cualquier entrada de `volatileData`, el gate falla — la presencia de
  datos volátiles contradice la clasificación evergreen.
- La clasificación de qué slugs son evergreen es una decisión editorial
  explícita y humana, registrada slug por slug en `slugOverrides`. La
  ausencia de `volatileData`/`officialSources` es señal para *proponer*
  candidatos, no para clasificarlos automáticamente — no existe ningún
  mecanismo de auto-detección de "contenido atemporal" en el gate.
- Junto con el mecanismo, se recalibra `cadenceDays` para
  `gratificacion-legal-chile` y `pgu-pension-garantizada-universal` (180d →
  90d, `sourceMode: manual_review_with_official_sources`), formalizando en
  policy lo que su frontmatter ya cumple (ambos ya declaran
  `articleLead.officialSources`).

**Estado de aplicación (2026-07-01):** el mecanismo está implementado y
probado, pero **ningún slug fue marcado evergreen todavía**. La lista
verificada de 21 candidatos (y los 11 casos dudosos que quedaron fuera) está
registrada en `docs/TECH_DEBT_BACKLOG.md` como `TD-0096` (aplicación,
pendiente confirmación editorial) y `TD-0095` (dudosos + gap de
`volatileData` en IMM/PGU) — ver esas entradas antes de tocar `slugOverrides`.

## Consequences

### Positive

- Reduce ruido de revisión editorial recurrente sobre contenido que
  genuinamente no cambia, liberando capacidad de revisión hacia artículos con
  sensibilidad real.
- La señal de "review SLA expired" en CI y en el reporte se vuelve más
  representativa de riesgo real.
- El mecanismo reutiliza la misma superficie (`sourceMode` + `slugOverrides`)
  que ya gobierna cadencia y exigencia de fuentes — no se introduce un
  esquema paralelo.
- Cierra un gap de sensibilidad real en dos artículos con cifras legales
  anuales que hoy no tenían ninguna protección de drift.

### Negative

- Riesgo editorial de mala clasificación: un artículo marcado evergreen por
  error (que en realidad depende de una cifra o ley vigente) dejará de
  recibir cualquier señal de vencimiento indefinidamente. Este es un riesgo
  YMYL real, y es la razón por la que la lista de slugs evergreen se aplica
  solo tras confirmación humana explícita, en un cambio separado del
  mecanismo.
- Introduce una cuarta rama de comportamiento en `buildRecord()`/`main()`,
  aumentando la superficie de casos a testear.
- No hay mecanismo de "evergreen con expiración" (ej. revisar de todos modos
  cada N años); si se detecta la necesidad de un techo temporal, requerirá
  una iteración adicional del policy schema.

## Alternatives considered

1. Campo booleano ortogonal `evergreen: true`, independiente de `sourceMode`.
   Rejected: permite combinaciones sin sentido (`evergreen: true` +
   `runtime_snapshot_plus_editorial_review`) y duplica el eje de "disciplina
   de revisión" que `sourceMode` ya representa.

2. Cadencia extremadamente larga (ej. `cadenceDays: 3650`) en vez de exención
   real. Rejected: sigue generando una fecha de vencimiento falsa que algún
   día disparará un failure sin sentido editorial, y no documenta la
   intención ("esto es atemporal") de forma auditable — solo pospone el
   problema.

3. Auto-clasificación heurística de evergreen basada en ausencia de
   `volatileData`/`officialSources`. Rejected: la ausencia de esas señales es
   necesaria pero no suficiente — cifras legales en prosa libre (ej. "tope de
   4,75 IMM") no dejan rastro en `volatileData`. La clasificación debe quedar
   bajo confirmación humana explícita, slug por slug.

4. Cadencia ponderada por tráfico (revisar más seguido lo más visitado).
   Rejected explícitamente por decisión de producto — el tráfico predice
   impacto si hay drift, no probabilidad de drift; fuera de alcance de esta
   decisión.

## Verification

```
pnpm vitest run tests/scripts/check-editorial-timeliness.test.ts
pnpm run check:editorial-timeliness
pnpm run check:frontmatter
pnpm run check:context
```

## Rollback

- Quitar `"evergreen"` de `SOURCE_MODES` en `scripts/check-editorial-timeliness.mjs`.
- Revertir las validaciones de `loadPolicy()` y la bifurcación en
  `buildRecord()`/`main()`.
- Quitar los `slugOverrides` con `sourceMode: evergreen` de
  `src/config/editorial-timeliness-policy.json` (los artículos vuelven a la
  cadencia de su categoría automáticamente, sin acción adicional).
- Revertir los cambios de `context/CONTRACTS.md` / `context/INVARIANTS.md`.
- La recalibración de `gratificacion-legal-chile` /
  `pgu-pension-garantizada-universal` es independiente del rollback del tier
  evergreen (usa `sourceMode`s ya existentes) y puede revertirse por separado
  si corresponde.
