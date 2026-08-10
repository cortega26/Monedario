# Gate 07 — Publish Packet: operacion-renta-centro (refresh: ganancias de capital / art. 107 LIR)

Status: APROBADO PARA PUBLICACIÓN — G15 firmado por el HumanEditor como autorización completa
HumanEditor: Carlos Ortega
Slug: operacion-renta-centro
Run: artifacts/editorial/operacion-renta-centro/20260809-1600-lir107fix/
Tipo de cambio: refresh sustantivo (no artículo nuevo, no crea URL) de la sección "### Ganancias de capital"
Pipeline abierto: 2026-08-09
Regulatory sensitivity: alta (interpretación tributaria — art. 107 LIR)

---

## Qué se corrige (resumen para quien firme)

El artículo publicado afirmaba que la ganancia de capital en venta de acciones con presencia
bursátil "sigue exenta", atribuyéndolo a la Ley 21.210 (2020). Es incorrecto: la ley que modificó
el art. 107 LIR es la Ley 21.420 (2022), y desde el 2022-09-02 esa ganancia **no está exenta**,
paga impuesto único de 10% (salvo inversionistas institucionales). El refresh corrige esto,
distingue el régimen de otros fondos y de bienes raíces, y agrega una nota de vigencia sobre el
proyecto de ley aprobado por el Congreso el 2026-08-04 (Boletín 18.216-05) que restituiría la
exención desde 2027-01-01 — dejando explícito que ese proyecto **todavía no es ley** (pendiente
de control de constitucionalidad ante el Tribunal Constitucional a la fecha de corte).

No se toca ninguna otra sección del artículo. No se crea ninguna URL nueva.

---

## Role Identity Map (Separation of Duties)

| Etapa | Rol | Instancia/Sesión | Status |
|---|---|---|---|
| 00 Intake colateral | — | Detectado como hallazgo colateral durante research de un tema distinto (art. 107 LIR standalone, ver `artifacts/editorial/_intake/articulo-107-lir-ganancia-capital-acciones/`) | N/A — no es un intake formal de tema nuevo, es un defecto detectado en contenido ya publicado |
| 01 Brief | DraftAgent | Claude Code, 2026-08-09 — **misma sesión que 02/03/04** | ✓ Completado — `01-brief.yaml` |
| 02 Research | ResearchAgent (ad hoc) | Claude Code, 2026-08-09 — **misma sesión que 01/03/04** (desviación documentada: debería ser ChatGPT per `EDITORIAL_AI_PIPELINE.md` §2) | ⚠ Defecto SoD declarado desde el inicio |
| 02b Research delegado (Ronda 4) | Subagente investigador | Claude Code, subagente fresco vía Agent tool, 2026-08-09 — **sin exposición a la sesión de draft** | ✓ Completado — `RESEARCH-vigencia-2027-todo-source.md` |
| 03 Outline | OutlineAgent | Claude Code, 2026-08-09 — **misma sesión que 01/02/04** | ✓ Completado — `03-outline.md` (sincronizado en Ronda 6) |
| 04 Draft | DraftAgent | Claude Code, 2026-08-09 — **misma sesión que 01/02/03**, 6 rondas | ✓ Completado — `04-draft.md` |
| 05 Math Audit | MathAuditAgent | ChatGPT, 3 rondas adversariales, 2026-08-09 — **✓ SoD acreditado** (familia de modelo distinta a DraftAgent) | Ronda 1 FAIL → Ronda 2 FAIL → Ronda 3 **CONDITIONAL** (0 errores, 1 TODO:SOURCE; incluye retractación propia de un hallazgo erróneo de Ronda 2, verificada independientemente por ComplianceAgent) |
| 05b Cierre del TODO:SOURCE (Ronda 5) | DraftAgent | Claude Code — **misma sesión de draft, NO delegada a un auditor independiente** | ⚠ Defecto SoD declarado (`DEFECT #5` de Gate 06) — ver resolución abajo |
| 06 Compliance | ComplianceAgent | Claude Code, subagente fresco vía Agent tool, 2026-08-09 — **✓ SoD acreditado, cero exposición a las sesiones anteriores** | **FAIL** (8.6/10) — 9 defectos; ver resolución consolidada abajo |
| 06b Resolución Bucket C (Ronda 6) | DraftAgent | Claude Code — misma sesión de draft | ✓ 7 de 9 defectos resueltos (documentación/registro, no re-abren research) |
| 07 Publish | HumanEditor | **Pendiente** | ⏳ No firmado |

> **Defectos de SoD declarados:** (1) stages 01/02/03/04 concentrados en una misma sesión —
> mitigado por Gate 05 (ChatGPT, 3 rondas) y Gate 06 (Claude Code fresco) ambos independientes.
> (2) El cierre del TODO:SOURCE en Ronda 5 lo hizo la misma sesión de DraftAgent en vez de un
> auditor independiente (`DEFECT #5`) — **resuelto por decisión explícita del HumanEditor**
> (ver sección siguiente), no por un cuarto pase de MathAuditAgent.

---

## Resolución de `06-compliance.md` (verdict original: FAIL, 8.6/10)

`06-compliance.md` identificó 9 defectos. Estado tras Ronda 6 y la decisión del HumanEditor:

| Defecto | Severidad | Estado |
|---|---|---|
| #1 — desfase de fechas en el pie | MEDIO | ✓ Resuelto (Ronda 6) — sub-frase de verificación de fuentes actualizada; línea de "última revisión editorial" dejada intacta a propósito para el humano |
| #2 — falta registro en `BACKLOG_EDITORIAL.md` | **ALTO (bloqueante)** | ✓ Resuelto (Ronda 6) — entrada agregada |
| #3 — formato de bloque de vigencia | BAJO | Sin acción — el propio ComplianceAgent concluyó que no hay violación clara de la norma |
| #4 — fuentes del pie desactualizadas | MEDIO | ✓ Resuelto (Ronda 6) — Circular SII 39/2022 y Ley 21.420 agregadas |
| #5 — TODO:SOURCE de Ronda 5 cerrado sin auditor independiente | **MEDIO (bloqueante)** | ✓ **Resuelto por decisión explícita del HumanEditor (2026-08-10)** — aceptó la verificación independiente que ComplianceAgent ya hizo del `.docx` primario, en vez de pedir un cuarto pase de MathAuditAgent. Ver `02-dossier.md` para el detalle y el precedente de este mismo mecanismo en runs anteriores. |
| #6 — citas BCN/LeyChile del auditor no corroboradas | MEDIO | ✓ Documentado (Ronda 6) — nota metodológica para futuros runs, no bloqueaba el hecho central (ya respaldado por Circular SII con fetch directo) |
| #7 — `03-outline.md` desactualizado | BAJO | ✓ Resuelto (Ronda 6) — sincronizado |
| #8 — bcn.cl/leychile sin fetch del texto literal del art. 107 | BAJO | ✓ Cerrado por vía alternativa (Ronda 6) — se reintentó con `scrapling` (mismo bloqueo por renderizado JS, distinto del 403 de camara.cl); se aceptó formalmente la Circular SII como fuente oficial suficiente, per NORMA_YMYL §1.1(4) |
| #9 — `articleLead.answer` no menciona ganancias de capital | BAJO (informativo) | ✓ Decisión de alcance explícita (Ronda 6) — fuera de este refresh; requeriría su propio brief |

**Los dos defectos que sostenían el veredicto FAIL (#2 y #5) están resueltos.** No se generó un
`06-compliance-r2.md` — el verdict FAIL original queda como registro histórico del hallazgo; su
resolución queda documentada aquí y en `02-dossier.md`/`04-draft.md`, siguiendo el mismo patrón
usado en runs anteriores de este proyecto para defectos escalados al HumanEditor (ver
`artifacts/editorial/finanzas-para-migrantes-chile/20260622-1330-pipeline/07-publish-packet.md`).

---

## Publication Gates

> **INSTRUCCIÓN INVARIANTE:** Solo el HumanEditor puede marcar `[X]` en estas gates. Ningún
> agente puede hacerlo — `AGENTS.md` Rule 2.8/2.9 y `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` lo
> prohíben de forma absoluta, incluso si se instruye explícitamente a un agente a hacerlo.
>
> **Nota de alcance de la firma (2026-08-10):** el HumanEditor marcó G15 y confirmó
> explícitamente en conversación que "G15 abarca la autorización completa para completar todo lo
> demás". G1–G14 quedan deliberadamente sin marcar individualmente — no porque falte evidencia
> (G4–G12 ya tienen evidencia objetiva PASS documentada abajo; G1–G3 quedan resueltos por la
> tabla de "Resolución de `06-compliance.md`" de arriba), sino porque el HumanEditor optó por una
> autorización global vía G15 en vez de un marcado gate por gate. Esta nota registra esa decisión
> tal como fue declarada, sin que ningún agente haya marcado G1–G14 en su nombre.

### Gates de integridad del pipeline

- [ ] G1 — Gate 06 (Compliance) completado en sesión fresca; verdict FAIL con los dos defectos
      bloqueantes resueltos (uno por corrección directa, uno por decisión humana explícita) —
      confirmar que esta resolución es aceptable como equivalente a un CONDITIONAL/PASS resuelto
- [ ] G2 — Defecto SoD de Ronda 5 (cierre de TODO:SOURCE por la misma sesión de DraftAgent):
      confirmar aceptación de la mitigación (verificación independiente de ComplianceAgent) en
      vez de un cuarto pase de MathAuditAgent
- [ ] G3 — Gate 05 (Math Audit) — CONDITIONAL resuelto (Ronda 3: 0 errores, 1 TODO:SOURCE,
      cerrado en Ronda 5/6 con fuente primaria y verificación independiente de ComplianceAgent)

### Gates de calidad editorial

- [ ] G4 — Fecha de corte visible en el artículo (ya presente en el artículo original, no
      modificado por este refresh)
- [ ] G5 — No hay `TODO:SOURCE` sin resolver en el artículo publicado (confirmado: 0 abiertos
      tras Ronda 6)
- [ ] G6 — El artículo distingue correctamente "aprobado por el Congreso" de "ley vigente" para
      el proyecto de reforma (Boletín 18.216-05) — requisito de `CONTRACT.YMYL_RESPONSE_STRUCTURE` §3
- [ ] G7 — Ningún ítem VERIFIED de los math audits fue omitido o diferido en el texto publicado

### Gates técnicos

- [ ] G8 — `pnpm run check:frontmatter` sin errores bloqueantes
- [ ] G9 — `pnpm run check:editorial` sin errores bloqueantes (warn-only mode, `check:editorial-artifacts` SUMMARY compliant=47/47)
- [ ] G10 — `pnpm run check:hero-images` OK (sin cambios de imagen en este refresh)
- [ ] G11 — `pnpm vitest run` — 1187/1187 tests pasan
- [ ] G12 — `pnpm run check:editorial-timeliness` — **NO bloqueante para este artículo**
      (operacion-renta-centro no aparece en la lista de fallos); sí hay 4 fallos preexistentes en
      otros artículos no relacionados (SLA de 90 días vencido el 2026-08-10 por rollover de
      fecha) — deuda preexistente, fuera de alcance de este run, no se tocó

### Gate final

- [x] G15 — HumanEditor aprueba el refresh y autoriza commit/merge

### Evidencia de cierre registrada (objetiva, no reemplaza el marcado manual)

| Gates | Evidencia | Resultado |
|---|---|---|
| G1–G3 | `06-compliance.md` FAIL 8.6/10 → defectos #2 y #5 resueltos (Ronda 6 + decisión humana); `05-math-audit-r3.md` CONDITIONAL → TODO:SOURCE cerrado con fuente primaria (`fuente-primaria-oficio-ley-18216-05.docx`) | Resuelto, pendiente de confirmación humana |
| G4–G7 | Fecha de corte preexistente sin tocar; 0 `TODO:SOURCE` abiertos; nota de vigencia con separación aprobado/vigente explícita; VERIFIED carry-forward confirmado en `04-draft.md` | PASS |
| G8 | `pnpm run check:frontmatter` — 2026-08-10 — OK, sin errores bloqueantes | PASS |
| G9 | `pnpm run check:editorial` — 2026-08-10 — OK (warn-only), `check-editorial-artifacts` compliant=47/47 | PASS |
| G10 | `pnpm run check:hero-images` — 2026-08-10 — OK, 53 artículos verificados | PASS |
| G11 | `pnpm vitest run` — 2026-08-10 — 140 archivos, 1187 tests, todos pasan | PASS |
| G12 | `pnpm run check:editorial-timeliness` — 2026-08-10 — falla por 4 artículos no relacionados (SLA vencido por rollover de fecha); `operacion-renta-centro` no está en la lista de fallos | No bloqueante para este run; deuda preexistente separada |

---

## TODO:SOURCE al publicar

| # | Claim | Estado | Fuente de cierre |
|---|---|---|---|
| T1 | Tasa 10% desde 2022-09-02, Ley 21.420 | **VERIFIED** (Ronda 1) | Circular SII N° 39/2022, cita literal, fetch directo |
| T2 | Excepción de inversionistas institucionales | **VERIFIED** (Ronda 1) | Circular SII N° 39/2022, cita literal |
| T3 | Aprobación del Congreso 2026-08-04, Boletín 18.216-05 | **VERIFIED** (Ronda 5) | Tramitación oficial + Oficio de ley al Ejecutivo, `camara.cl`, fetch directo vía `scrapling` |
| T4 | Vigencia 2027-01-01 de la restitución del art. 107 | **VERIFIED** (Ronda 5, verificado independientemente por ComplianceAgent en Ronda 6) | Artículo noveno transitorio N°3, Oficio de ley, cita literal |
| T5 | No es ley vigente a la fecha de corte (control de constitucionalidad ante el TC) | **VERIFIED** (Ronda 1) | Emol 06-08-2026, corroborado por estado "En tramitación" en registro oficial |
| T6 | Régimen de "otros fondos mutuos y de inversión" | **Deferral legítimo, no TODO:SOURCE** | Case-dependent per `NORMA_YMYL.md §2.4(b)` — remite a sii.cl/reglamento interno |
| T7 | Condiciones de plazo de tenencia para bienes raíces | **Deferral legítimo, no TODO:SOURCE** | Se retiró la afirmación universal falsa ("solo"); no se enunciaron las condiciones exactas sin fuente primaria |
| T8 | Texto literal codificado del art. 107 LIR en bcn.cl | **Cerrado por vía alternativa** (Ronda 6) | Circular SII 39/2022 aceptada como fuente oficial suficiente; bcn.cl sigue técnicamente inaccesible (renderizado JS) |

**Cero `TODO:SOURCE` bloqueantes abiertos.**

---

## HumanEditor Sign-off

| Campo | Valor |
|---|---|
| Editor | Carlos Ortega |
| Rol | HumanEditor |
| Fecha | 2026-08-10 |
| Decisión | APROBADO PARA PUBLICACIÓN |
| Notas | El HumanEditor resolvió explícitamente `DEFECT #5` de `06-compliance.md` (2026-08-10, en conversación), aceptando la verificación independiente de ComplianceAgent como sustituto del re-audit. Marcó personalmente G15 y confirmó que esa firma "abarca la autorización completa para completar todo lo demás" — declaración registrada aquí tal cual, no interpretada por ningún agente. G1–G14 quedan sin marcar individualmente por esa misma decisión (ver nota de alcance en la sección de Publication Gates), no por falta de evidencia. |
