# PLAN — Auditoría del corpus publicado contra estándares vigentes

**Estado:** LOTE 0 EJECUTADO — PR #423 abierta, pendiente firma humana (§18)
**Fecha:** 2026-08-12 (actualizado 2026-08-13)
**Commit base de la medición:** `8be28d3b`
**Alcance:** los 53 artículos publicados de `src/data/blog/**`
**Autoridad:** `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` → `context/*.md` → código

---

## 1. Problema

El corpus se escribió a lo largo de seis meses mientras el estándar editorial
seguía endureciéndose. Ningún artículo es "viejo" en el sentido de estar
abandonado, pero **la mayoría nunca fue medida contra las reglas que hoy son
obligatorias**, y el mecanismo que hoy vigila la vigencia (`check:editorial-timeliness`)
solo detecta el vencimiento del SLA, no la exactitud del contenido.

Esa distinción ya costó un defecto real: el 2026-08-03 el SLA estaba verde por
snapshot fresco y aun así `que-es-la-uf` afirmaba "la UF vale $44.500" cuando
valía $40.844,79 (−8,2 %). **Snapshot fresco no es contenido verificado.**

Este plan cubre las tres cosas que se piden en conjunto y que deben ejecutarse
por separado para no violar la separación de funciones:

1. **Auditoría de conformidad** contra los estándares vigentes.
2. **Barrido de exactitud**: datos desactualizados, incorrectos o erróneos.
3. **Mejora de prosa e inteligibilidad**, acotada y sin fabricar señal de frescura.

---

## 2. Línea base medida hoy (2026-08-12)

Todo lo que sigue es reproducible con los comandos indicados. No son estimaciones.

| Señal | Valor | Cómo se obtuvo |
|---|---|---|
| Artículos publicados | 53 (0 en `draft`) | inventario de frontmatter |
| **Gate de vigencia** | **FAIL — `stale=4`, `drift=0`** | `pnpm run check:editorial-timeliness` |
| Runs con las 7 etapas del pipeline | 2 / 53 ¹ | `node scripts/audit-editorial-pipeline-evidence.mjs` |
| Artículos con `06-compliance.md` | 4 / 53 ¹ | ídem |
| Sin `articleLead` (sin respuesta ancla estructurada) | **15 / 53** | inventario de frontmatter |
| Con `articleLead.validAsOf` anterior a `updatedDate` | **12 / 53** | inventario de frontmatter |
| Sin ningún dominio oficial en el cuerpo del artículo | 5 / 53 ² | escaneo de cuerpo |
| Sin ninguna fuente oficial en todo el archivo | 1 / 53 (`interes-compuesto-nota-metodologica`) | escaneo de archivo |
| Con H2 `Errores comunes` (exigido por DoD §2) | 5 / 53 | escaneo de encabezados |
| Con H2 de `Fuentes` (exigido por DoD §2) | 16 / 53 | escaneo de encabezados |
| Con H2 `Preguntas frecuentes` (exigido por DoD §2) | 43 / 53 | escaneo de encabezados |
| Sin marca textual de vigencia en el cuerpo | 17 / 53 | escaneo de cuerpo |

¹ El script reescribe en el lugar un snapshot fechado. Estos valores vienen de
una corrida fresca del 2026-08-12; el archivo commiteado
`output/audits/editorial-pipeline-2026-08-02/` conserva deliberadamente los
valores de su fecha (1 run completo, 3 con `06-compliance.md`) y no se
sobrescribió. La diferencia es evolución real entre ambas fechas, no un defecto.

² Cuatro de esos cinco sí muestran fuentes oficiales al lector a través de
`articleLead.officialSources`, que `ArticleDecisionIntro.astro` renderiza. El
único artículo sin fuente oficial en ninguna parte es
`interes-compuesto-nota-metodologica`. Toda cuenta de fuentes en este plan suma
enlaces del cuerpo **más** `articleLead.officialSources`.

### 2.1 Los 4 SLA vencidos hoy son una cohorte nueva

No son los "nueve SLA" de agosto: aquellos se cerraron el 2026-08-03
(`PLAN-reauditoria-timeliness-2026-08-03.md`). Esta es una ola nueva y
concentrada en un solo cluster (`impuestos-personas`), con fecha de revisión
2026-05-11 + 90 días:

- `boleta-honorarios-2026-retencion-cobertura`
- `devolucion-impuestos-fechas-compensaciones`
- `operacion-renta-f22-checklist`
- `rentas-mixtas-sueldo-honorarios`

Son Bucket A (`context/EDITORIAL_AI_PIPELINE.md` §9.2): `sourceMode=manual_review`,
por lo que ningún refresco automático de snapshot los libera. Requieren
verificación de fuentes con criterio humano.

### 2.2 Riesgo estructural detectado en la medición

Los **15 artículos sin `articleLead`** no solo carecen de la respuesta ancla
visible con vigencia y fuentes: como `check-editorial-timeliness.mjs:195` calcula
el SLA con `articleLead.validAsOf ?? updatedDate ?? pubDate`, su reloj de revisión
cuelga de `updatedDate`. Cualquier edición que toque esa fecha —incluso cosmética—
les reinicia el SLA sin que nadie haya verificado el contenido. Los 38 artículos
con `validAsOf` propio están protegidos de eso por diseño.

Los **12 artículos con `validAsOf` anterior a `updatedDate`** son el espejo del
mismo problema: la fecha que ve el lector quedó atrás respecto de la señal de
frescura. Cada caso es una de dos cosas y hay que clasificarlo, no arreglarlo a
ciegas:

- el cambio fue sustantivo y `validAsOf` debió moverse → deuda de revisión; o
- `updatedDate` se movió sin cambio sustantivo → incumplimiento de `NORMA_YMYL` §5.2.

---

## 3. Qué significa "los nuevos estándares" (delta con fechas)

El alcance de la auditoría no es difuso: es el conjunto de reglas que entraron en
vigencia **después** de la última revisión efectiva de cada artículo. La fecha de
revisión efectiva es `min(articleLead.validAsOf, updatedDate)`.

| Estándar | Vigente desde | Artículos cuya última revisión es anterior |
|---|---|---|
| `NORMA_YMYL v1.0` + `CONTRACT.YMYL_RESPONSE_STRUCTURE` | 2026-03-02 | 0 / 53 |
| Contrato de vigencia editorial (`timeliness`) | 2026-03-22 | 6 / 53 |
| `COMPETITIVE_ADAPTATION_POLICY` + expectativas de benchmark | 2026-04-11 | 15 / 53 |
| Pipeline v2: SoD por **instancia** de agente + sesión fresca; `EDITORIAL_PIPELINE_APPLICABILITY` | 2026-04-25 | **30 / 53** |
| `NORMA_YMYL` §2.4 (política de deferral) + carry-forward de `VERIFIED` | 2026-05-06 | **34 / 53** |
| `seoTitle` ≤ 65 caracteres | 2026-08-10 | aplicado a 41 (2 diferidos, issue #408) |

Lectura operativa: la brecha grande no es de estructura básica —eso ya lo
cubren los gates— sino de **§2.4 (deferral) y trazabilidad de valores
verificados**, que 34 de 53 artículos nunca enfrentaron.

---

## 4. Restricciones no negociables

Estas reglas determinan la forma del plan. Un plan que las ignore no es ejecutable.

| Restricción | Fuente | Consecuencia en este plan |
|---|---|---|
| Un mismo agente no puede redactar y auditar/cumplir la misma pieza YMYL | `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` | Fases A, B y C se ejecutan en sesiones distintas. Siempre. |
| Ningún agente marca gates `[X]` en `07-publish-packet.md` | `AGENTS.md` §2.9 · pipeline §9.5 | El cierre de cada lote es humano. |
| No se fabrica evidencia histórica de pipeline | `EDITORIAL_PIPELINE_APPLICABILITY.md` | Cero backfill de artefactos. Un run nuevo se abre solo cuando hay refresh sustantivo real. |
| `updatedDate` solo con cambio sustantivo, con registro de 1 línea | `NORMA_YMYL` §5.2–5.3 | Prosa y correcciones sustantivas viajan en **PRs separados**. |
| No cambiar slugs públicos sin snapshot de rutas/RSS + ADR | `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS` | Fuera de alcance. Los títulos SEO ya se trataron en #409. |
| `FOCO ESTRICTO / VALIDACIÓN UTILITY-LED` | `docs/backlog/README.md` (desde 2026-08-02) | Se permite instrumentación de medición read-only; no se crea superficie pública nueva. |

---

## 5. Alcance y exclusiones

**Dentro:** los 53 archivos de `src/data/blog/**` (contenido, frontmatter,
`articleLead`, fuentes citadas, prosa).

**Fuera (candidatos a Fase 2, no se mezclan aquí):**

- `src/data/glossary/**` (54 fichas) — contrato distinto, riesgo YMYL menor.
- `src/data/laws/**` (23 fichas) — ya cubiertas por `check:legal-citations`.
- Hubs `/guias/**` y calculadoras — cubiertos por `SITE_AUDIT` y `audit:calculator-interlinks`.
- Reescritura de arquitectura de enlaces internos — ya cerrada en `BACKLOG_SITE_AUDIT` (SA-001..SA-015).

---

## 6. Rúbrica de auditoría

Proyección operativa de `PUBLISH_CHECKLIST.md`, `NORMA_YMYL.md` y
`DEFINITION_OF_DONE.md`. **No introduce reglas nuevas**: donde haya divergencia,
manda `NORMA_YMYL.md`.

| ID | Dimensión | Regla | ¿Ya automatizado? |
|---|---|---|---|
| R1 | Respuesta ancla | `articleLead.answer` concreto (número/regla/criterio) visible en ≤ 2 pantallas | No — **brecha** |
| R2 | Vigencia | `validAsOf` presente, coherente con `updatedDate` y con lo que dice el cuerpo | Parcial (`check:editorial-timeliness` solo el SLA) |
| R3 | Fuentes oficiales | Mínimos por cluster de `DoD` §1, con link directo y visible al lector; cuenta cuerpo + `articleLead.officialSources` | No — **brecha** |
| R4 | Deferral §2.4 | Todo "consulta el SII / verifica en" es legítimo (fuente no pública o respuesta individual) | No — **brecha** |
| R5 | Exactitud numérica | Cada cifra crítica coincide con la fuente oficial vigente | No — requiere fetch (Fase A2) |
| R6 | Reformas y calendario | Separación aprobado / vigencia / implementación (`NORMA` §4) | No — **brecha** |
| R7a | Estructura base | Sin H1 en cuerpo, TOC, secciones no vacías, descripción y su longitud, placeholders YMYL | Sí — `check:editorial-structure`, `check:editorial-guard` |
| R7b | Estructura DoD §2 | Los seis H2 nombrados del DoD + al menos un ejemplo numérico | No — **brecha** (ver nota de precedencia) |
| R8 | Frontmatter y ownership | Schema, `topicRole`, `canonicalTopic`, `seoTitle`, descripción | Sí — `check:frontmatter` |
| R9 | Prosa e inteligibilidad | Dialecto es-CL, sin voz editorial interna, legibilidad | Parcial — `check:dialect`, `audit:reader-copy` |
| R10 | Enlazado | Pilar ↔ satélites ↔ calculadora, sin canibalización | Sí — `check:editorial`, `audit:cannibalization` |

**La auditoría manual trabaja R1–R6, R7b y R9.** R7a, R8 y R10 se dan por
cubiertos ejecutando los gates existentes; no se re-auditan a mano.

**Nota de precedencia sobre R7b.** `check-editorial-structure.mjs` exige
`MIN_H2_SECTIONS = 2`, no los seis H2 nombrados del DoD §2 — por eso el gate está
verde con 5/53 artículos que tienen `Errores comunes`. Pero `NORMA_YMYL` §1.1
(MUST) tampoco los exige; §1.2 solo pide "qué hacer / pasos cuando aplica" como
SHOULD. Como la norma manda sobre el DoD y sobre el checklist, **en retrofit R7b
se registra como SHOULD, no como bloqueante**: un H2 faltante genera observación,
nunca verdicto `FAIL`. Sin esta regla, la Fase A2 emitiría ~48 fallos por un
encabezado que ninguna política vigente obliga a agregar retroactivamente.

**Puntaje:** scorecard de `NORMA_YMYL` §7 (respuesta ancla 35 %, precisión y
fuentes 25 %, vigencia 15 %, excepciones 15 %, claridad 10 %). Umbral 9,5.
El puntaje se registra, **no se publica como aprobación**: aprobar es acto humano.

---

## 7. Arquitectura de ejecución

Tres fases, sesiones separadas, en este orden. Nunca en la misma sesión sobre la
misma pieza.

### Fase A — Auditoría read-only (no toca contenido)

**A1 · Instrumentación.** Un script nuevo `scripts/audit-corpus-standards.mjs`,
estrictamente read-only, que emite `output/audits/corpus-2026-08-12/report.{json,md}` con,
por artículo: fecha de revisión efectiva, estándares posteriores aplicables,
estado de `articleLead`, deriva `validAsOf` vs `updatedDate`, conteo de fuentes
oficiales por cluster contra el mínimo del DoD (sumando enlaces del cuerpo y
`articleLead.officialSources`), candidatos a deferral, H2 faltantes del DoD y
cifras con formato monetario/porcentual sin fuente adyacente.

Lo que el script **no** hace: decidir si un deferral es legítimo, si una cifra es
correcta o si la prosa es buena. Eso es juicio, y va en A2. El script produce la
cola de trabajo; no produce hallazgos.

**A2 · Auditoría por artículo (ComplianceAgent, sesión fresca por lote).**
Aplica R1–R6 y R9 con fetch en vivo de las fuentes oficiales declaradas. Si un
fetch falla con 403 o timeout, intentar `scrapling extract get --impersonate chrome`
antes de declarar la fuente irrecuperable. Cada artículo produce una ficha
(formato en §9) con verdicto `PASS` / `CONDITIONAL` / `FAIL` y scorecard.

**Salida de la fase A:** una cola triada. No se modifica ni un archivo de
contenido.

### Fase B — Remediación (sesión distinta de la que auditó)

Por artículo con verdicto `CONDITIONAL` o `FAIL`:

- Si el arreglo es **sustantivo** (cifra, regla, umbral, vigencia, calendario de
  reforma, resolución de deferral): se abre un run nuevo
  `artifacts/editorial/<slug>/<run-id>/` con `01-brief.yaml` que declare el
  origen (esta auditoría), y se ejecuta el pipeline aplicable. Se mueve
  `validAsOf` y `updatedDate`, con la línea de registro que exige `NORMA` §5.3.
- Si el arreglo es **estructural sin cambio de contenido** (H2 faltante,
  `articleLead` ausente que solo formaliza lo que el cuerpo ya afirma con
  fuente): Bucket C, sin run nuevo, **sin tocar `updatedDate`**.
- Si el arreglo es **de prosa**: ver §11, PR aparte.

### Fase C — Cumplimiento y firma

ComplianceAgent en sesión fresca sobre cada pieza remediada sustantivamente
(playbook de `EDITORIAL_AI_PIPELINE.md` §8, etapa 06), y luego firma humana del
`07-publish-packet.md`. Ningún agente marca gates.

---

## 8. Lotes y prioridad

Orden por riesgo regulatorio y por gate rojo, no por comodidad.

| Lote | Contenido | Tamaño | Por qué primero | Fase inicial |
|---|---|---|---|---|
| **0** | Los 4 SLA vencidos (`impuestos-personas`) | 4 | Gate en rojo hoy; bloquea `pnpm run check` | A2 → B (Bucket A: verificación de fuentes con criterio humano) |
| **1** | Los 15 sin `articleLead` | 15 | Sin ancla de vigencia propia; su SLA es frágil por diseño (§2.2) | A2 completa |
| **2** | Los 12 con deriva `validAsOf` < `updatedDate` | 12 | Clasificar deuda de revisión vs. bump indebido | A2 acotada a R2 |
| **3** | Resto de `impuestos-personas`, `deuda-credito`, `pensiones-afp` | ~14 | Mayor sensibilidad regulatoria | A2 completa |
| **4** | `seguridad-financiera`, `empleo-ingresos`, `sueldo-remuneraciones` | ~12 | Riesgo medio | A2 completa |
| **5** | `ahorro-e-inversion`, `uf-costo-de-vida`, `presupuesto`, resto | ~11 | Menor sensibilidad; muchos ya revisados en agosto | A2 acotada a R1/R4/R9 |

Los lotes 1 y 2 se solapan parcialmente; la cola de A1 resuelve el solapamiento
para que ningún artículo se audite dos veces.

**Caso especial — `interes-compuesto-nota-metodologica`:** único artículo sin
ninguna fuente oficial en todo el archivo. Es `topicRole: reference` y nota
metodológica, así que puede ser legítimo, pero requiere decisión explícita:
o se le agregan fuentes, o se documenta por qué no las necesita.

---

## 9. Formato de ficha por artículo (entregable de Fase A2)

```
FICHA DE AUDITORÍA — <slug> — 2026-08-XX
Revisión efectiva previa: <fecha>  ·  Cluster: <cluster>  ·  topicRole: <rol>
Estándares posteriores aplicables: <lista con fechas>

R1 respuesta ancla    : PASS | FAIL — <evidencia textual>
R2 vigencia           : PASS | FAIL — validAsOf=<f> updatedDate=<f> cuerpo=<f>
R3 fuentes oficiales  : PASS | FAIL — <n> de <mínimo DoD>; faltan: <cuáles>
R4 deferral §2.4      : PASS | FAIL — <cita literal> → legítimo/ilegítimo por <razón>
R5 exactitud          : PASS | FAIL — <cifra en artículo> vs <valor oficial> (<URL>, fetch <fecha>)
R6 reformas           : PASS | N/A | FAIL — <detalle>
R7b estructura DoD    : OBSERVACIÓN (no bloqueante) — H2 faltantes: <cuáles>
R9 prosa              : <observaciones acotadas y accionables>

Scorecard NORMA §7: <desglose ponderado> = <total>/10
Verdicto: PASS | CONDITIONAL | FAIL
Bucket por hallazgo: A (humano) | B (re-auditoría fresca) | C (esta sesión)
Tipo de remediación: sustantiva | estructural | prosa
```

Las fichas se guardan en `output/audits/corpus-2026-08-12/fichas/<slug>.md`.
Cuando una ficha desemboque en refresh sustantivo, su contenido alimenta el
`02-dossier.md` del run nuevo — no lo reemplaza.

---

## 10. Barrido de datos desactualizados o erróneos

Es la parte con mayor valor y la que más fácilmente se degrada en teatro de
verificación. Reglas:

1. **Inventario primero.** Toda cifra monetaria, porcentaje, tope, plazo legal y
   fecha de trámite en los 53 artículos, con su fuente adyacente si existe.
   Lo produce A1 mecánicamente.
2. **Verificación contra fuente oficial en vivo**, no contra memoria del modelo
   ni contra el propio artículo. Registrar URL y fecha de recuperación.
3. **Prioridad por volatilidad**: UTM/UTA, IMM, topes imponibles, tramos de
   impuesto, comisiones AFP, tasa máxima convencional, exenciones, plazos SII.
   El registro de `volatileData` cubre 20 declaraciones en 15 artículos; **el
   resto de las cifras no está declarado y es exactamente ahí donde vive el
   riesgo silencioso**.
4. **Cifra sin fuente verificable** → no se "actualiza" con un valor plausible.
   Se marca `TODO:SOURCE` en el artefacto (nunca en el archivo publicado) y se
   escala como Bucket A.
5. **Un hallazgo de exactitud siempre es sustantivo**: run nuevo, compliance
   fresca, firma humana. Sin excepción, incluso si es "solo un número".
6. **Ampliación propuesta de `volatileData`**: toda cifra que resulte
   desactualizada en este barrido se declara en el registro para que el gate la
   vigile a futuro. Es la única forma de que esta auditoría no haya que repetirla
   completa en seis meses.

---

## 11. Prosa e inteligibilidad

Vale el 10 % del scorecard. Se acota para que no se convierta en reescritura
abierta de contenido YMYL.

**Sí entra:**

- Legibilidad de la respuesta ancla: que la regla concreta aparezca antes que la
  explicación (`NORMA` §2.1).
- Eliminación de patrones prohibidos de §2.2 ("depende…" sin decir de qué,
  "primero hay que entender…" antes del número).
- Frases dirigidas al autor/editor en texto visible (`DoD` §7).
- Dialecto es-CL y ortografía (`check:dialect`).
- Oraciones excesivamente largas y párrafos-muro en las secciones de decisión.

**No entra:** reordenar secciones, cambiar el enfoque de la pieza, reescribir
explicaciones normativas. Cambiar la redacción de una afirmación normativa **es**
un cambio sustantivo y dispara el pipeline completo.

**Disciplina de PR (importante):** los cambios de prosa van en PRs propios,
**sin tocar `updatedDate`** (`NORMA` §5.2). Mezclar prosa con correcciones
sustantivas en el mismo commit fabrica señal de frescura y hace imposible
auditar después qué se verificó realmente.

---

## 12. Gates por lote

Antes de cerrar cualquier lote de Fase B:

```bash
pnpm run check:frontmatter
pnpm run check:editorial
pnpm run check:editorial-timeliness
pnpm run check:dialect
pnpm run check:legal-citations
pnpm run audit:reader-copy
pnpm vitest run
```

Para el lote 0, además, `pnpm run check` completo debe pasar a verde: hoy falla
solo por esos 4 SLA.

Si un lote toca enlaces internos: `pnpm run check:links` y `pnpm run check:routes`.

---

## 13. Criterio de salida

| Nivel | Criterio |
|---|---|
| Por artículo | Ficha con verdicto, y si fue `FAIL`/`CONDITIONAL`: remediado, compliance fresca ejecutada y firma humana registrada |
| Por lote | Gates de §12 en verde + fichas commiteadas + registro de `updatedDate` por artículo modificado |
| Del plan | 53 fichas emitidas · `check:editorial-timeliness` en `stale=0` · cero deferrals ilegítimos · cero cifras críticas sin fuente · deriva `validAsOf`/`updatedDate` resuelta o justificada |

**Lo que este plan explícitamente NO promete:** que los 53 artículos queden con
la cadena de siete artefactos. Eso sería fabricar evidencia histórica y está
prohibido. Promete que **todo control verificable hoy esté verificado hoy**, y
que cada refresh sustantivo abra su run real.

---

## 14. Riesgos

| Riesgo | Mitigación |
|---|---|
| Teatro de verificación: bumps de fecha sin revisión real | Toda ficha exige cita literal + URL + fecha de fetch; sin evidencia no se mueve `validAsOf` |
| Violación de SoD por hacer todo en una sesión | Fases A/B/C en sesiones separadas, declaradas en cada ficha |
| Regresión SEO por editar 53 artículos | Sin cambios de slug; `check:routes` + `check:rss` por lote; títulos congelados por #409/#408 |
| Volumen que hace abandonar el plan a medio camino | Lotes cerrables de forma independiente; el lote 0 (4 artículos) ya entrega el gate en verde |
| Fuentes oficiales que bloquean el fetch | Fallback `scrapling --impersonate chrome` antes de declarar irrecuperable |
| El barrido se repite en 6 meses | Toda cifra hallada desactualizada se incorpora a `volatileData` (§10.6) |

---

## 15. Esfuerzo estimado

| Fase | Trabajo | Estimación |
|---|---|---|
| A1 | Script read-only + cola triada | 1 sesión |
| A2 | 53 fichas con fetch en vivo | 5–6 sesiones (lotes de ~10) |
| B | Remediación (esperado: 15–25 artículos con hallazgo real) | 4–6 sesiones + runs de pipeline |
| C | Compliance fresca por pieza sustantiva | 1 sesión por lote |
| Prosa | PRs separados por cluster | 2–3 sesiones |

El lote 0 se puede cerrar de forma aislada y es lo único urgente hoy.

---

## 16. Reconciliación de backlog

Al aprobar este plan hay que corregir bookkeeping desactualizado:

- `docs/backlog/README.md`, "Siguiente orden recomendado" #4 ("Revisar nueve SLA
  editoriales vencidos") está **obsoleto**: se cerraron el 2026-08-03
  (`PLAN-reauditoria-timeliness-2026-08-03.md`). La cohorte vigente es otra y son
  cuatro (§2.1).
- `PLAN-utility-led-validation-2026-08-02.md` sigue listando los nueve SLA como
  bloqueador abierto (`TD-0098`). Debe apuntar a este plan y a la cohorte real.

---

## 17. Registro

- 2026-08-12 — Plan creado. Línea base medida sobre `8be28d3b`: 53 artículos,
  `stale=4`, 15 sin `articleLead`, 12 con deriva `validAsOf`, 34/53 con última
  revisión anterior a la política de deferral (2026-05-06). Sin cambios de
  contenido en esta sesión.
- 2026-08-12 — Remediación Fase B, lote 0, `operacion-renta-f22-checklist`
  (run `artifacts/editorial/operacion-renta-f22-checklist/20260812-1312-lote0b/`).
  Qué cambió: se reencuadró el segundo párrafo del cuerpo (ventana AT2026
  presentada en presente indicativo → declaración explícita de cierre de
  ventana en la primera pantalla, con las mismas fechas conservadas como
  referencia fechada); se agregó una sección nueva "Fuera de la ventana
  AT2026: qué puedes hacer hoy" (rectificatoria, consulta de estado/
  observaciones, consulta de devolución, próximo ciclo AT2027 sin fecha
  inventada); se agregó nota de cierre a la tabla "Cuándo llega la
  devolución"; se agregó `articleLead` (ausente pese a `featured`/
  `homepagePriority: 200`); se actualizó "Información de vigencia". Por qué:
  hallazgo R2 vigencia (FAIL) de la ficha de auditoría — ciclo cerrado
  descrito como vigente, el hallazgo más severo del lote por ser pieza
  `featured`. Fuentes que lo justifican: SII, comunicado 31-03-2026
  (calendario AT2026, ya citado en el artículo); SII FAQ 001_140_8954
  (consulta de estado y rectificatoria, fetch 2026-08-12); SII FAQ
  001_140_0516 (rectificatoria que origina devolución, ya citado en el
  artículo); búsqueda dirigida confirmando que el SII aún no publica el
  calendario AT2027 (2026-08-12). `updatedDate` 2026-05-11 → 2026-08-12;
  `articleLead.validAsOf` (nuevo) 2026-08-12. No se tocaron las cifras R5
  (crédito educación, calendario de depósito, Préstamo Solidario) ni los
  otros 3 artículos del lote. Pendiente: `06-compliance.md` en sesión fresca
  y firma humana del `07-publish-packet.md` (Fase C); ningún gate del
  publish packet fue marcado por este agente.
- 2026-08-12 — Re-confirmación de vigencia (sin cambio de contenido),
  `boleta-honorarios-2026-retencion-cobertura`. Qué se confirmó: las tres
  cifras críticas del artículo (retención 2026 = 15,25%; umbral de exención
  de cotización = 5 IMM/$2.767.765 base 2025; base de cotización = 80% del
  bruto boleteado) se verificaron `PASS` contra fuente oficial en vivo el
  2026-08-12, sin discrepancia respecto al contenido publicado (ficha de
  auditoría, verdicto `CONDITIONAL` 8,95/10). Por qué no cambia
  `updatedDate`: no hubo cambio sustantivo — NORMA §5.2 prohíbe mover esa
  fecha sin cambio real; se movió solo `articleLead.validAsOf`
  2026-05-11 → 2026-08-12. Fuentes: SII — aumento gradual retención boletas
  (fetch 2026-08-12); ChileAtiende — ficha 12016 cotización honorarios
  (fetch 2026-08-12). Efecto en el gate: `stale=4` → `stale=3`.
- 2026-08-12 — Remediación Fase B, lote 0, `rentas-mixtas-sueldo-honorarios`
  (run `artifacts/editorial/rentas-mixtas-sueldo-honorarios/20260812-1345-lote0b/`).
  Qué cambió: se corrigió el tramo exento del Global Complementario
  ($11.322.018 → **$11.265.804**, líneas 53 y 69 del artículo publicado —
  13,5 UTA × $834.504 UTA dic-2025, cálculo exacto); se reencuadró
  `articleLead.answer` y el bloque "Respuesta rápida" para separar la
  obligación permanente de declarar de la acción inmediata sobre el ciclo
  AT2026 ya cerrado, sin inventar fecha AT2027; se corrigieron dos menciones
  adicionales del calendario AT2026 detectadas en autorrevisión de
  coherencia interna. Por qué: hallazgo R5 (exactitud, FAIL confirmado) +
  R2 (vigencia, FAIL) de la ficha de auditoría. Fuentes: SII, "Valores y
  fechas — Personas naturales AT2026"
  (https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html,
  fetch 2026-08-12, cita literal "13,5 UTA del mes dic. de 2025 =
  $11.265.804"); SII, comunicado 31-03-2026 (fechas de cierre de ventana).
  `articleLead.validAsOf` 2026-05-11 → 2026-08-12; `updatedDate`
  2026-05-11 → 2026-08-12. Pendiente en ese momento: `05-math-audit.md`
  (`requires_calculation=true`) antes de Fase C.
- 2026-08-12 — Math audit (Claude Code, sustituto de ChatGPT por
  indisponibilidad de herramienta, aprobado por el editor humano el
  2026-08-12), `rentas-mixtas-sueldo-honorarios`. Confirmó de forma
  independiente la cifra corregida (recálculo propio 834.504 × 13,5 =
  11.265.804) y diagnosticó la causa raíz del error original (se había
  usado la UTA de marzo 2026, $838.668, en vez de la de diciembre 2025).
  Al desafiar el resto de las cifras del artículo (tramos Art. 52 LIR,
  retención de boletas, calendario AT2026), encontró un **ERROR nuevo,
  fuera del alcance original**: el bloque APV describía los Regímenes A y B
  invertidos frente al artículo canónico del corpus (`que-es-el-apv.mdx`) y
  frente a la fuente primaria. Veredicto: `FAIL` (bloqueante, no por el
  hallazgo original sino por el ERROR nuevo). No se marcó ningún gate; no
  se editó contenido.
- 2026-08-13 — Fix ERROR APV (fuera del alcance original, hallado por
  MathAuditAgent), `rentas-mixtas-sueldo-honorarios`. Qué cambió: se
  corrigieron las líneas 144 y 197-200 — Régimen A = bonificación estatal
  del 15% sobre los aportes (tope 6 UTM anuales), depositada por la
  Tesorería General de la República directamente en la cuenta de ahorro
  previsional, **no** un crédito en el F22; Régimen B = rebaja de la base
  imponible del IGC (tope 600 UF anuales). Se acotó correctamente la
  afirmación de que el APV "genera o aumenta una devolución" solo al
  Régimen B. Por qué: ERROR confirmado en `05-math-audit.md` — la etiqueta
  invertida es un defecto real de exactitud sobre el mecanismo de ahorro
  previsional, no cosmético. Fuentes: SII, preguntas frecuentes — regímenes
  tributarios del APV (art. 42 bis LIR),
  https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm
  (fetch 2026-08-13); Superintendencia de Pensiones — bonificación fiscal
  del APV, https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html
  (fetch 2026-08-13, cita literal: la bonificación "deberá ser ingresada en
  la cuenta individual de ahorro previsional voluntario"). No se tocó la
  corrección R5 ni el reencuadre R2 ya aplicados.
- 2026-08-13 — Compliance Fase C, `rentas-mixtas-sueldo-honorarios`
  (sesión fresca). Verificó de forma independiente, con fetch propio, los
  tres hallazgos del run (cifra IGC, vigencia, fix APV — incluida
  corroboración cruzada con `que-es-el-apv.mdx` y fuentes de industria) y
  declaró el `FAIL` de `05-math-audit.md` resuelto por evidencia
  independiente (no se abrió un segundo math audit dedicado porque la
  corrección APV restaura cifras ya canónicas del corpus, no introduce
  cálculo nuevo). **Veredicto: `CONDITIONAL` (9,275/10).** No alcanza `PASS`
  por deuda ya conocida y fuera de alcance de este run (deferral
  border-line de "facilidades de pago" + estructura DoD §2), no por los
  hallazgos que motivaron el run, todos resueltos. Sin defectos nuevos.
  Separación de funciones confirmada: 6 sesiones distintas (auditoría
  original, draft R5/R2, math audit, draft fix-APV, compliance, editor
  humano pendiente). Ningún gate marcado.
- 2026-08-12/13 — Remediación Fase B (rondas 1-3) + investigación dedicada,
  `devolucion-impuestos-fechas-compensaciones`
  (run `artifacts/editorial/devolucion-impuestos-fechas-compensaciones/20260812-1420-lote0c/`).
  **Ronda 1 (2026-08-12):** se agregó `articleLead` (ausente); se reencuadró
  la apertura y "Qué hacer ahora" (renombrada "Ciclo AT2026 cerrado: qué
  hacer hoy") para declarar el cierre de ventana en la primera pantalla, con
  guía nueva para quien declaró y no recibió el depósito y para quien no
  alcanzó a declarar, sin inventar fecha AT2027. Por qué: hallazgo R2
  (FAIL) + R1 respuesta ancla (FAIL) de la ficha de auditoría.
  `updatedDate`/`articleLead.validAsOf` (nuevo) → 2026-08-12.
  **Ronda 2 (2026-08-13):** compliance de ronda 1 encontró una afirmación
  procedural sin fuente ("aún puedes declarar fuera de plazo... Servicios
  online → Renta") y una cita duplicada mal etiquetada. Se corrigió citando
  SII FAQ 001_140_0595.htm (mecanismo/ruta) +
  https://www.sii.cl/contribuyentes/p7renta.htm (aplicabilidad general, ya
  validada en el run hermano `operacion-renta-f22-checklist`), reformulado
  con verbo permisivo y condicionado a la obligación de declarar; se
  reemplazó la cita duplicada de 001_140_8951.htm por 001_140_8366.htm
  (fuente real de "causas de no recepción/retenciones/datos bancarios").
  **Ronda 3 (2026-08-13):** la compliance de ronda 2 encontró y confirmó por
  refetch propio que 001_140_8366.htm contradice, en sentido exactamente
  invertido, al comunicado SII 31-03-2026 ya citado sobre el umbral de
  $3.000.000 (domicilio vs. BancoEstado). Investigación dedicada dirimió a
  favor del comunicado (ya publicado, sin cambio de cifra) con evidencia
  mecánica independiente: la página institucional SII sobre pago por caja
  (https://www.sii.cl/portales/renta/2016/pagodevimpxcaja.html) fija el tope
  de BancoEstado en $3.000.000, lo cual solo es compatible con la dirección
  del comunicado — bajo la lectura de la FAQ 8366 se le pediría a la caja
  pagar por sobre su propio tope. Se acotó la cita de 001_140_8366.htm en
  "Fuentes y referencias primarias" para que ya no respalde el umbral
  (queda solo para retenciones/datos bancarios). **Fix de fechas
  (2026-08-13):** compliance de ronda 3 encontró que el fix de ronda 2
  (corrección de un incumplimiento MUST #4) nunca movió `updatedDate` ni
  `articleLead.validAsOf` de 2026-08-12 — se corrigieron a 2026-08-13 con
  bullet de registro en "Información de vigencia". Compliance final
  (ronda 3, sesión fresca): **veredicto `FAIL` (9,075/10)** — la
  discrepancia del umbral quedó confirmada de forma independiente y con
  evidencia adicional no documentada por la ronda 3 original (se descartó
  explícitamente el riesgo de sesgo de confirmación); el único defecto
  restante era el desfase de fechas, ya corregido tras esa ronda pero sin
  una cuarta verificación de compliance dedicada (fix mecánico verificado
  directamente por gates: `check:frontmatter` OK, `check:editorial-timeliness`
  ya no lista el artículo como stale, `format:check` OK — no ameritaba una
  ronda adversarial adicional por no introducir claim nuevo). No se tocaron
  las cifras del calendario AT2026 en ningún momento; el umbral publicado
  no cambió de valor.

---

## 18. Estado del lote 0 — cierre técnico, pendiente firma humana

**Fecha de cierre técnico:** 2026-08-13
**Ejecución:** subagentes independientes en sesiones separadas (Fases A/B/C
del §7), despachados y consolidados en una sesión de orquestación; ningún
agente marcó gates de publicación ni firmó en nombre del editor humano.

### 18.1 Resultado por artículo (estado final, post cierre de papeleo)

| Artículo | Hallazgos remediados | Verdicto final de compliance | Bucket abierto |
|---|---|---|---|
| `boleta-honorarios-2026-retencion-cobertura` | SLA vencido, sin defecto de contenido (ficha original: `CONDITIONAL` 8,95/10) | No requirió nueva ronda de compliance — re-confirmación de vigencia sin cambio sustantivo | Ninguno |
| `operacion-renta-f22-checklist` | R2 vigencia → 3 defectos de ronda 1 compliance → resueltos (ronda 2) → 3 ítems Bucket C (`TODO:SOURCE` + 2 precisiones de cita/matiz) → resueltos (ronda 3) → desfase de `updatedDate` hallado por compliance ronda 3 → corregido | **`CONDITIONAL` 9,325/10** (ronda 4, `06-compliance-round4.md`) | DEFECT-NUEVO #2 (informativo, no bloqueante): cobertura opcional sobre "citación a las unidades del SII" que la fuente `p7renta.htm` menciona y el artículo no — no bloquea, follow-up si se desea |
| `devolucion-impuestos-fechas-compensaciones` | R1 respuesta ancla + R2 vigencia → defecto de cita → discrepancia de fuentes SII sobre umbral $3M → dos desfases de fecha (rondas 3-4) → contradicción interna "29 de mayo" hallada por revisor externo (ronda 6) → todo corregido | **`CONDITIONAL` 9,450/10** (ronda 6, `06-compliance-round6.md`) | Ninguno — cero `TODO:SOURCE`, cero defectos abiertos; no alcanza `PASS` solo por estar bajo el umbral 9,5/10 |
| `rentas-mixtas-sueldo-honorarios` | R5 cifra IGC + R2 vigencia → ERROR APV fuera de alcance hallado por math audit → corregido → deferral border-line "facilidades de pago" → fortalecido con regla pública verificable (TGR) → math audit formal re-emitido (PASS) tras hallazgo de revisor externo sobre sustitución de rol | **`CONDITIONAL` 9,350/10** (ronda 3, `06-compliance-round3.md`) | Bucket C: estructura DoD §2 (SHOULD, no bloqueante) |

Los tres artículos sustantivos terminaron en `CONDITIONAL` en el rango
9,3-9,45/10, **sin ningún defecto bloqueante abierto**. Ninguno alcanza
`PASS` puro (NORMA §7 exige ≥9,5/10 + cero ítems abiertos, y en dos casos
queda una décima de margen bajo el umbral); esa última fracción de puntaje
es la que el editor humano decide si amerita otra ronda o si el estado
actual es aceptable para publicar.

### 18.1bis Revisión externa (bot Codex, PR #423) — 3 hallazgos, 3 resueltos

Un revisor automático dejó 3 comentarios sobre el primer commit del PR,
antes del cierre de papeleo. Se investigó cada uno de forma independiente
en vez de descartarlos:

1. **P1 — `rentas-mixtas`, defecto de proceso real.** El bot señaló que
   `05-math-audit.md` terminaba en `FAIL` y que ninguna sesión posterior
   había generado un math audit formal que lo superara — la ronda 2 de
   compliance había "declarado resuelto" el hallazgo APV con su propia
   verificación, sin `MathAuditAgent` fresco de por medio, citando
   `AGENTS.md`. Válido: aunque la corrección de contenido ya estaba bien
   verificada, el registro formal seguía sin cerrar. Se despachó un
   `MathAuditAgent` fresco que re-auditó el artículo completo de forma
   independiente y emitió `05-math-audit-round2.md` con veredicto **PASS**
   (12/12 VERIFIED), preservando el `FAIL` original como histórico.
2. **P1 — `f22-checklist`, ya resuelto.** El bot señaló sobre el commit
   inicial que "igual debes hacerlo" no estaba condicionado a la
   obligación real de declarar. Correcto en ese momento — pero ya lo había
   resuelto la ronda 2/3 de este mismo lote (commit `2837802d`), antes de
   que el bot revisara. Verificado contra el texto actual: sin acción
   adicional.
3. **P2 — `devolucion-impuestos`, hallazgo real que sobrevivió 5 rondas de
   compliance.** El bot encontró que la línea 56 describía el 29 de mayo
   como el fin de todo pago posible de devolución del año tributario,
   contradiciendo las líneas 74 y 76 del mismo artículo sobre rectificatoria
   y regularización tardía. Se reformuló para distinguir "calendario
   ordinario" de "posibilidad de devolución del año tributario", verificado
   por una sexta ronda de compliance dedicada.

Lección explícita (ver también §18.6): una revisión externa independiente
—humana o de otro sistema— encontró en minutos algo que 5 rondas propias
de compliance adversarial no atraparon. La separación de funciones reduce
el riesgo, no lo elimina; una segunda fuente de revisión externa al propio
proceso vale la pena en contenido YMYL, incluso después de un pipeline
riguroso.

### 18.2 Registro de artefactos por run

- `artifacts/editorial/operacion-renta-f22-checklist/20260812-1312-lote0b/` — `06-compliance.md` (ronda 1, FAIL) → `06-compliance-round2.md` (ronda 2, CONDITIONAL 8,73) → `06-compliance-round3.md` (ronda 3, CONDITIONAL 9,25) → `06-compliance-round4.md` (ronda 4, CONDITIONAL 9,325 — vigente). Las tres primeras se preservan como registro histórico.
- `artifacts/editorial/devolucion-impuestos-fechas-compensaciones/20260812-1420-lote0c/` — `06-compliance.md` (ronda 1, FAIL) → `06-compliance-round2.md` (ronda 2, FAIL) → `06-compliance-round3.md` (ronda 3, FAIL) → `06-compliance-round4.md` (ronda 4, FAIL 9,0 — segundo desfase de fecha) → `06-compliance-round5.md` (ronda 5, CONDITIONAL 9,45) → `06-compliance-round6.md` (ronda 6, CONDITIONAL 9,45 — vigente, verifica el fix de la contradicción "29 de mayo" hallada por revisor externo). Las cinco primeras se preservan como registro histórico.
- `artifacts/editorial/rentas-mixtas-sueldo-honorarios/20260812-1345-lote0b/` — `05-math-audit.md` (ronda 1, FAIL por ERROR APV — preservado como histórico) → `05-math-audit-round2.md` (ronda 2, **PASS** 12/12, vigente — re-auditoría formal tras hallazgo de revisor externo sobre sustitución de rol) + `06-compliance.md` (ronda 1, CONDITIONAL 9,275) → `06-compliance-round2.md` (ronda 2, CONDITIONAL 9,35) → `06-compliance-round3.md` (ronda 3, CONDITIONAL 9,35 — vigente, verifica el math audit PASS).
- `boleta-honorarios-2026-retencion-cobertura` no tiene run de pipeline nuevo — remediación fue metadata-only (Bucket C), documentada en el registro (§17).

### 18.3 Qué falta — exclusivamente Bucket A (humano)

Ningún agente puede completar lo que sigue (`INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`,
`AGENTS.md` §2.9, pipeline §9.5):

1. **Firma humana de `07-publish-packet.md`** en los tres runs con artefactos
   (`operacion-renta-f22-checklist`, `devolucion-impuestos-fechas-compensaciones`,
   `rentas-mixtas-sueldo-honorarios`). Los tres están en `CONDITIONAL`
   9,3-9,45/10, sin defectos bloqueantes abiertos — el editor debe revisar
   el `06-compliance-round*.md` vigente de cada uno (§18.2) y decidir si ese
   estado es aceptable para publicar.
2. **DEFECT-NUEVO #2 de `f22-checklist`** (§18.1): cobertura opcional, no
   bloqueante — decidir si se agrega o se descarta.
3. **Revisión de la discrepancia SII no resuelta por el sitio**: la FAQ
   001_140_8366.htm del propio SII contradice su comunicado 31-03-2026 sobre
   el umbral de $3.000.000. El sitio ya resolvió esto editorialmente con
   evidencia mecánica (§17), pero es una inconsistencia real en fuente
   oficial que el editor podría considerar reportar al SII o monitorear en
   la próxima revisión de vigencia.

### 18.4 Hallazgo nuevo, fuera de alcance de este lote

`impuesto-global-complementario-chile.md` — SLA de revisión vencido el
2026-08-12 (cadencia 90 días, `sourceMode=manual_review`), detectado por
`check:editorial-timeliness` durante la ejecución de este lote. Es una
cohorte nueva y distinta de los 4 artículos de §2.1 — no se tocó en esta
sesión. Candidato natural para el siguiente lote de la Fase A/B/C de este
mismo plan (§8, tabla de lotes), dado que ya comparte cluster
(`impuestos-personas`) y patrón de riesgo con el lote 0.

### 18.5 Verificación de no-regresión

`pnpm vitest run` (1358/1358 tests, 157 archivos), `check:frontmatter`,
`check:links`, `check:dialect`, `format:check` pasaron en cada ronda que
tocó contenido. `check:editorial-timeliness` final:
`published=53 stale=1 drift=0` — el único `stale` es el hallazgo de §18.4,
no relacionado con este lote. Ningún cambio de slug, ruta, canonical ni
título SEO. Ningún gate de publicación fue marcado por ningún agente en
ningún momento de esta ejecución.

### 18.6 Lección operativa: subagentes y aciertos del proceso

Vale la pena dejar constancia de qué funcionó, no solo qué falta:

- La separación de funciones por sesión (nunca el mismo agente redacta y
  audita la misma pieza) atrapó defectos reales tres veces sobre el mismo
  patrón de falla (afirmación procedural sin fuente al cubrir "qué hacer
  fuera de la ventana AT2026"), en `f22-checklist` y en
  `devolucion-impuestos` — el patrón se repitió porque ambos artículos
  comparten estructura, no porque el proceso fallara en detectarlo.
- El math audit (con sustituto Claude por indisponibilidad de ChatGPT,
  aprobado explícitamente) encontró un error real fuera del alcance del
  brief original (APV) precisamente por estar instruido a desafiar *todas*
  las cifras, no solo la que motivó el run — justifica el costo de una
  auditoría adversarial completa en vez de una verificación puntual.
  La compliance final de `devolucion-impuestos` (ronda 3) demostró la misma
  disciplina a la inversa: descartó explícitamente una fuente que coincidía
  con la conclusión que estaba verificando, precisamente por no poder
  confirmarla — comportamiento opuesto al sesgo de confirmación.
- Cuando el proveedor cortó tres agentes en paralelo por límite de sesión,
  ninguno dejó estado corrupto: dos no habían escrito nada (verificado con
  `git status`/`ls` antes de redespachar) y uno (`06-compliance-round2.md`
  de `f22-checklist`) ya había completado el archivo en disco antes del
  corte — el mensaje de reporte fue lo único que se perdió. La instrucción
  de "escribe el archivo antes de redactar el reporte final" evitó perder
  trabajo real en los redespachos posteriores.
