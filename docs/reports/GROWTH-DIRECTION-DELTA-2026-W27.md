# Delta de dirección — re-secuenciar el crecimiento en dos carriles (2026-W27)

## 1. Ficha de control

- **Estado:** Final
- **Tipo:** Delta read-only sobre `docs/reports/GROWTH-DIRECTION-AUDIT-2026-06-28.md`
  (auditoría canónica, corte de datos W25). Este documento **no la reemplaza**;
  agrega evidencia W26/W27 y una recomendación de re-secuencia.
- **Commit auditado:** `0102b11a` (planeado); drift check corrido contra HEAD
  vivo del worktree (`b8406e55`) — los dos commits de diferencia son refrescos
  automáticos no relacionados (snapshot económico, índice de `lastmod`); no
  invalidan ninguna premisa.
- **Corte de datos:** 2026-W27 (semana más reciente disponible; no existe W28+
  al momento de escribir este delta).
- **Plan de ejecución canónico que este delta actualiza:**
  `docs/backlog/PLAN-calculator-led-growth-2026-06-28.md`.
- **Este documento no autoriza cambios por sí solo.** Toda re-secuencia o
  activación de un carril la decide el mantenedor (Carlos Ortega) sobre el plan
  canónico. Mismo estatus que la auditoría que actualiza.

---

## 2. Premisa que se actualiza

La secuencia canónica (`PLAN-calculator-led-growth-2026-06-28.md`, diagrama de
dependencias, líneas 138–150) encadena el crecimiento en una sola línea serial:

```text
PR-00 → PR-01 → PR-02 → OBS-01 (baseline first-party, 2 semanas)
                            ├── PR-03 journeys ganadores
                            └── PR-04 experimentos SEO + frescura
```

`PR-04` (el carril SEO/GSC) cuelga del mismo nodo `OBS-01` que `PR-03` (el
carril de journeys first-party). La evidencia fresca muestra que esa
serialización es más estricta de lo que el propio plan necesita, y que el
costo de esperar ya es de aproximadamente un mes sin baseline confiable.

### Evidencia

**(1) No hay baseline first-party limpia todavía, un mes después.**
El scorecard `2026-W27`
(`output/operations/weekly-search-performance/2026-W27/weekly-search-scorecard.md:13`)
reporta literalmente:

> `First-party analytics: 2026-W27 — 21 calculators, 0 views · 568 starts · 916 completes`

Dos defectos en una línea: `views = 0` (la vista no llega) y
`completes (916) > starts (568)` (tasa de conversión agregada >100%, embudo
imposible). Este archivo está gitignored y no es verificable en este worktree;
la cita viene verificada por el reviewer de este plan contra el árbol
principal.

Esa misma señal es **verificable de forma independiente en un archivo
tracked**: `docs/backlog/PLAN-calculator-led-growth-2026-06-28.md:1013`
(Progress Log, entrada `2026-07-07`) registra el desglose por calculadora de
W27 — `seguro-cesantia 112 starts, 186 completes`; `prepago-credito 31 starts,
100 completes` — el mismo patrón `completes > starts` ya a nivel de
calculadora individual, no solo como artefacto de agregación. La misma entrada
confirma en prosa: *"`calculator_view` llegó en 0 para W27, por lo que start
rate no es evaluable y completion rates pueden superar 100%."* Esto reduce la
dependencia de este delta en el dato gitignored: el hallazgo central queda
confirmado dos veces, con dos fuentes.

**(2) No son tres semanas con un defecto — son al menos cuatro fixes de
instrumentación distintos, corridos entre el 2026-06-28 y el 2026-07-12.**

- `2026-07-07` (antes de cualquier plan numerado): fix directo en
  `src/scripts/analytics.ts` para emitir `calculator_view` una vez por carga,
  documentado en la misma entrada de Progress Log citada arriba
  (`PLAN-calculator-led-growth-2026-06-28.md:1013`).
- Plan `039` (`plans/archive/039-calculator-funnel-instrumentation.md`,
  merge `a661e61a`): dedup de `calculator_complete` por page-view — cerrado
  como "DONE parcial", con el typo residual desglosado al plan 042.
- Plan `042` (`plans/archive/042-remove-calculator-completed-typo-event.md`,
  merge `afeb9203`): quitar el evento typo `calculator_completed` — el
  ejecutor de 039 verificó independientemente que el typo existía en **8
  archivos**, no 1 (ver `plans/README.md:483-489`).
- Plan `043` (`plans/archive/043-analytics-item-id-shape-decision.md`, merge
  `66fd6a3c`): validar la forma de `item_id`.

Los tres planes numerados se mergearon **2026-07-10 → 2026-07-12**, es decir,
**después** de la ventana de datos de W27 (2026-06-29 → 2026-07-05, según
`plans/README.md`). El fix de `calculator_view` del 2026-07-07 también quedó
fuera de esa ventana. **Conclusión correcta: W27 refleja el estado
*pre-fix*.** No es evidencia de que los fixes hayan fallado — es la ventana de
datos anterior a que existieran. La clasificación honesta es **"sin-datos"**:
el reloj de "2 semanas limpias" del baseline first-party aún no ha arrancado,
porque todavía no existe ninguna semana post-fix (W28+) que confirme la
recuperación del embudo. La propia entrada de Progress Log lo dice de forma
casi idéntica: *"No pasar a PR-03 todavía […] OBS-01 necesita una semana
completa posterior al deploy del fix de `calculator_view`."*

Nota operativa adicional: la ventana de observación de OBS-01 se declaró
formalmente "de 14 días hasta 2026-07-12" (`PLAN-calculator-led-growth-2026-06-28.md:1012`).
Hoy es 2026-07-13 — esa ventana nominal ya venció, pero quedó invalidada por
los cuatro fixes aplicados *dentro* de ella. El reloj de baseline debe
reiniciarse, no darse por cumplido.

**(3) GROWTH-005 (contaminación cross-hostname del RUM) — parcialmente
mitigado, no abierto en su totalidad.**

Verificación directa (`grep -n "requestHost\|hostname\|zoneTag"
scripts/data-signals/cloudflare-fetch.mjs`): la función `fetchRumWebVitals`
(líneas 140–163) sigue consultando `rumWebVitalsEventsAdaptiveGroups` con
`filter: { datetime_geq, datetime_leq }` y `dimensions { requestPath }` —
**sin** dimensión de hostname/`requestHost`. `zoneTag` aparece únicamente en
`fetchDailyTraffic` (líneas 120–136), no en la consulta RUM.

Pero el plan maestro registra una mitigación parcial que la auditoría de
2026-06-28 no tenía: PR-02
(`PLAN-calculator-led-growth-2026-06-28.md:1011`) añadió un
**allowlist de rutas post-fetch** (`SITE_ROUTE_ALLOWLIST` en `gsc-utils.mjs`)
que descarta rutas RUM que no pertenecen al inventario del sitio — W27
descartó "6 rutas ajenas" por este mecanismo
(`PLAN-calculator-led-growth-2026-06-28.md:1013`).

El residual honesto: un allowlist de **rutas** puede descartar
`/llaveros/algo` porque esa ruta no existe en monedario, pero **no puede
distinguir** `monedario.cl/` de `otrositio.cl/` cuando ambas rutas se llaman
literalmente `/` — la contaminación cross-hostname en rutas *compartidas*
(la home, `/` = 60 visitas en el scorecard W27 citado en la auditoría
canónica) sigue sin filtro. GROWTH-005 no está cerrado; está mitigado para
rutas únicas de calculadora, abierto para rutas compartidas.

**(4) El carril SEO tiene backlog surfaced-pero-parcialmente-accionado.**

El scorecard W27 vuelve a marcar `APV`, `conversor-uf` y `credito-consumo`
como candidatos de refresh (posición 4–15, CTR débil) — la misma clase de
señal que ya generó el plan 040
(`plans/archive/040-seo-title-snippet-refresh-brief.md`, merge `013b59b0`).

Matiz importante para no sobre-simplificar: plan 040 **ya evaluó** dos de los
tres — `apv` y `conversor-uf` — para el ángulo title/snippet, y decidió
explícitamente no tocarlos por "bajo valor esperado"
(`plans/README.md:772`). No es que nadie los haya mirado; es que hubo una
decisión previa de no accionar, con datos de esa fecha. `credito-consumo` no
tiene una evaluación equivalente registrada en los planes tracked. Antes de
accionar cualquiera de los tres bajo el patrón 040, alguien debe confirmar si
la señal W27 (más reciente) cambia esa evaluación de "bajo valor esperado" o
si sigue vigente — este delta no lo decide, solo documenta que el chequeo no
se ha hecho.

Ese carril usa **GSC** (fiable: semanas W16–W27 presentes en
`output/operations/data-signals/gsc/`, según la auditoría canónica §3.3 y
§4.2), no el embudo first-party.

**La observación central del delta:** la secuencia canónica hace esperar el
carril SEO detrás del baseline first-party mediante un diagrama de
dependencias (líneas 138–150), pero el propio texto de `PR-04` no impone esa
dependencia — su **"Gate de entrada" declarado es "baseline GSC de 4 semanas
por URL"** (`PLAN-calculator-led-growth-2026-06-28.md:760`), no el baseline
first-party de `OBS-01` (línea 708, ese es el gate de `PR-03`). Es decir: el
plan maestro tiene una inconsistencia interna entre su diagrama (que serializa
PR-04 bajo OBS-01) y su propia especificación de gate para PR-04 (que solo
pide GSC). El carril SEO no depende técnicamente del embudo first-party; el
carril de journeys first-party sí.

---

## 3. Recomendación — dos carriles con relojes independientes

- **Carril A (SEO/GSC), desbloqueado ya.** Usa GSC, que está sano (W16–W27 sin
  huecos salvo W20). Puede accionar candidatos de refresh por el patrón del
  plan 040 (title/snippet, con firma de copy humana) sin esperar el baseline
  first-party, porque su propio gate de entrada (`baseline GSC de 4 semanas
  por URL`) ya está satisfecho.

  **Caveat obligatorio — esto no es upside gratis.** La auditoría canónica
  clasificó el carril SEO (`GROWTH-003`,
  `GROWTH-DIRECTION-AUDIT-2026-06-28.md:241-254`) como **apuesta secundaria**,
  con confianza HIGH sobre que existe oportunidad pero solo MED sobre su
  magnitud, y riesgo explícito de zero-click ("conversiones numéricas suelen
  resolverse sin click"). Los candidatos actuales son precisamente los
  expuestos a ese riesgo: `conversor-uf` (2.375 impresiones, posición ~14,65,
  CTR 0,13%) y patrones similares a `conversor-utm` (4.453 impresiones, CTR
  0,16%) — consultas de conversión numérica con alto zero-click esperado.
  Desbloquear el carril A no es una predicción de que rendirá; es solo quitar
  una dependencia serial que no estaba justificada.

- **Carril B (journeys first-party), correctamente aún tras baseline.** No
  desplegar cambios de journey (`PR-03`) hasta que el embudo dé ≥2 semanas
  consecutivas que cumplan el checklist de la sección 4. Este carril sigue
  bloqueado por diseño — la auditoría original lo puso ahí a propósito
  (`GROWTH-002`), y la evidencia de esta semana confirma que el bloqueo sigue
  siendo necesario, no que deba levantarse antes de tiempo.

- **Esto no contradice el veredicto canónico** (crecimiento liderado por
  calculadoras, `GROWTH-DIRECTION-AUDIT-2026-06-28.md` §2). Solo desanuda el
  orden serial que hoy hace esperar al carril A por el carril B sin que el
  propio plan lo exija — el veredicto de fondo (calculadoras como motor
  principal, medición como habilitador) permanece vigente.

---

## 4. Checklist de verificación de baseline

Correr cada semana, antes de usar cualquier número first-party para decidir
sobre journeys:

- [ ] `views > 0` en la línea first-party del scorecard semanal.
- [ ] `completes ≤ starts` (tasa de conversión ≤100%) en la línea agregada
  **y** en el desglose por calculadora.
- [ ] Dos semanas consecutivas cumpliendo ambos puntos anteriores antes de
  declarar el baseline vigente (no basta una semana buena).
- [ ] GROWTH-005 cerrado para rutas compartidas (filtro por hostname en
  `fetchRumWebVitals`) antes de usar cualquier métrica RUM de una ruta
  compartida (ej. `/`) para decisión de producto.

---

## 5. Follow-up especificado (no ejecutado aquí)

**GROWTH-005, residual de rutas compartidas.** Ubicación exacta:
`scripts/data-signals/cloudflare-fetch.mjs`, función `fetchRumWebVitals`
(líneas 140–163). Especificación para quien tome el plan de implementación:

- Añadir dimensión `requestHost` (o el nombre equivalente que exponga el
  schema de `rumWebVitalsEventsAdaptiveGroups` de Cloudflare Analytics GraphQL
  para RUM) a `dimensions { requestPath }`.
- Filtrar o segmentar por `requestHost = "monedario.cl"` (más `www.`, si
  aplica) antes de agregar `count`/`quantiles`, análogo a como
  `fetchDailyTraffic` ya filtra por `zoneTag` en su nivel.
- Si el dataset RUM de Cloudflare no expone `requestHost` como dimensión
  filtrable (a diferencia del dataset de tráfico), documentar esa limitación
  como hallazgo del propio plan de implementación — no asumir que la API lo
  soporta sin confirmarlo contra el schema real.
- Mantener el `SITE_ROUTE_ALLOWLIST` existente (mitiga rutas únicas) como
  defensa en profundidad, no como reemplazo del filtro por hostname.
- Este follow-up es un plan de implementación aparte, con sus propios gates
  (`pnpm run test`, `check:boundaries`, etc.) — no se implementa en este
  delta.

---

## 6. Compuerta de decisión humana

La adopción de la re-secuencia en dos carriles, y la decisión de accionar
cualquiera de los candidatos de refresh SEO (`APV`, `conversor-uf`,
`credito-consumo`), es decisión del owner (Carlos Ortega) sobre
`docs/backlog/PLAN-calculator-led-growth-2026-06-28.md`. Este delta recomienda
y documenta evidencia; no edita el plan maestro ni acciona ningún carril.

---

## Notas de mantenimiento

- Este delta no cierra GROWTH-005 ni el embudo first-party; los diagnostica y
  deja un follow-up especificado.
- El checklist de la sección 4 debe correrse cada semana hasta acumular 2
  semanas limpias consecutivas — recién ahí se puede fijar un baseline.
- Un revisor debe confirmar que este documento no editó producto
  (`scripts/`, `src/`, `workers/`) ni el plan maestro, y que su tono no fuerza
  la tesis de re-secuencia más allá de lo que la evidencia sostiene (en
  particular, el caveat de zero-click del carril A y el estado "mitigado
  parcialmente" de GROWTH-005, no "abierto sin más").
- Relación con el plan 046 (spike de conversor de recurrencia/return-hook): su
  premisa usa rutas únicas de monedario, no contaminadas por el residual de
  GROWTH-005 descrito en la sección 2.3, así que es válida aun antes de cerrar
  GROWTH-005 en su totalidad.
