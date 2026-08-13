# Publish Packet — rentas-mixtas-sueldo-honorarios

- Run id: `20260812-1345-lote0b`
- Slug: `rentas-mixtas-sueldo-honorarios`
- Source article: `src/data/blog/rentas-mixtas-sueldo-honorarios.md`
- Origen: remediación Fase B sobre hallazgo de
  `output/audits/corpus-2026-08-12/fichas/rentas-mixtas-sueldo-honorarios.md`
  (verdicto FAIL 7,225/10, R5 exactitud confirmado + R2 vigencia)
- Autor de este paquete: DraftAgent (Claude Code), sesión `20260812-1345-lote0b`
- TODO:SOURCE no resueltos: 0
- Decisión de este paquete: HOLD (bloqueado por `05-math-audit.md`; ver sección de bloqueo abajo)

## BLOQUEADO: requiere 05-math-audit.md antes de Fase C

`01-brief.yaml` declara `requires_calculation=true` porque este run corrige
una cifra calculada (tramo exento IGC = 13,5 UTA × valor UTA dic-2025 =
$11.265.804). Por `EDITORIAL_AI_PIPELINE.md` §4, ningún run con
`requires_calculation=true` puede avanzar a Fase C (compliance + firma)
sin un `05-math-audit.md` producido por `MathAuditAgent` en una sesión
distinta, fresca y adversarial (independiente de este `DraftAgent`). Ese
archivo **no existe todavía** y **no fue producido en esta sesión**, por
instrucción explícita del brief operativo de este run. Este paquete queda
en estado `BLOCKED` hasta que:

1. `MathAuditAgent` (sesión fresca) produzca `05-math-audit.md` verificando
   de forma adversarial la cifra corregida y el resto de valores numéricos
   del artículo, con verdicto `PASS`/`CONDITIONAL`/`FAIL`.
2. `ComplianceAgent` (sesión fresca, Fase C) produzca `06-compliance.md`.
3. `HumanEditor` firme este `07-publish-packet.md`.

## Estado del paquete

- [ ] Brief listo (`01-brief.yaml`)
- [ ] Dossier listo (`02-dossier.md`)
- [ ] Outline listo (`03-outline.md`)
- [ ] Draft listo (`04-draft.md`)
- [ ] Math audit listo (`05-math-audit.md`) — **BLOQUEANTE, no existe.**
      `requires_calculation=true`; no se genera en esta sesión por
      separación de funciones (DraftAgent ≠ MathAuditAgent).
- [ ] Compliance listo (`06-compliance.md`) — no se genera en esta sesión;
      corresponde a ComplianceAgent en sesión fresca, Fase C del plan, y
      solo puede ejecutarse después de que exista `05-math-audit.md`.
- [ ] Fuentes completas (ver `02-dossier.md`: cifra corregida fetcheada en
      vivo en esta sesión de `https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html`;
      calendario AT2026 fetcheado en vivo de
      `https://www.sii.cl/noticias/2026/310326noti01pcr.htm` — agregado
      como tercer `articleLead.officialSources` porque sustenta las fechas
      de cierre de ventana ahora afirmadas en `articleLead.answer`; fuentes
      preexistentes del artículo sin cambio)
- [ ] Benchmark observations separadas de fuentes oficiales (N/A — este run
      no usa benchmark externo)
- [ ] `localDelta` visible en el entregable final (N/A — no es adaptación
      competitiva; el delta es la corrección de exactitud numérica y el
      reencuadre de vigencia, ver `03-outline.md`)
- [ ] Ownership/no-canibalización revisado (sin cambio: sigue siendo owner
      de `canonicalTopic: rentas-mixtas`)
- [ ] Fecha de corte visible para lectores (`articleLead.validAsOf:
      2026-08-12` + "Vigencia: ... revisado el 2026-08-12" en el bloque
      "Respuesta rápida" del cuerpo)
- [ ] Prompt-injection review completo: las fuentes externas fetcheadas
      (SII) fueron tratadas como untrusted source content; ninguna
      instrucción embebida en ellas modificó rol, alcance, formato,
      herramientas, gates, citas o decisión editorial. No se encontró texto
      sospechoso que requiriera etiqueta `PROMPT_INJECTION_CANDIDATE`. Nota:
      esta tarea llegó con una cifra ya propuesta ($11.265.804) por el
      orquestador; se trató como hipótesis a verificar, no como hecho dado
      — se refetcheó la fuente SII de forma independiente en esta sesión
      antes de aplicarla (ver `02-dossier.md`), coincide exactamente.
- [ ] VERIFIED carry-forward confirmado — **N/A, bloqueante:** no existe
      `05-math-audit.md` de este run todavía (ver sección de bloqueo
      arriba). No se puede confirmar VERIFIED carry-forward sin ese
      artefacto.
- [ ] Separación de funciones documentada: ComplianceAgent (auditoría,
      sesión previa, 2026-08-12, ficha de origen) ≠ DraftAgent (este run,
      sesión `20260812-1345-lote0b`) ≠ MathAuditAgent (pendiente, sesión
      fresca) ≠ ComplianceAgent de Fase C (pendiente, sesión fresca) ≠
      HumanEditor (firma pendiente)
- [ ] Registro NORMA §5.3 — texto listo abajo, pendiente de que el
      orquestador lo consolide en
      `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md` §17 (no
      se edita ese archivo desde esta sesión: es compartido con otros
      agentes trabajando en paralelo sobre otros artículos del mismo plan)
- [ ] `HumanEditor` sign-off

## Nota de registro NORMA §5.3

Texto completo listo para que el orquestador lo copie a
`docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md` §17:

> **rentas-mixtas-sueldo-honorarios — 2026-08-12 — Fase B (run
> `20260812-1345-lote0b`).** Qué cambió: (1) se corrigió el monto del tramo
> exento del Impuesto Global Complementario de $11.322.018 a $11.265.804
> (13,5 UTA × valor UTA dic-2025, sin cambio de fórmula ni de tramos) en las
> dos apariciones del artículo (FAQ y bloque "Respuesta rápida" del cuerpo);
> (2) se reencuadró `articleLead.answer` y el bloque "Respuesta rápida" para
> separar la obligación permanente de declarar con rentas mixtas del estado
> del ciclo AT2026 específico (ventana cerrada: 30-04-2026 con pago,
> 08-05-2026 sin pago), con puntero al checklist F22 para quien no alcanzó a
> declarar, sin inventar fecha de AT2027; (3) por coherencia interna (NORMA
> §1.1 MUST #8), se reencuadraron en pasado/cerrado las dos menciones
> restantes del calendario AT2026 en el cuerpo ("Si te corresponde
> devolución" y "Si debes pagar impuesto adicional"), que seguían en
> presente/futuro y contradecían el bloque de apertura ya corregido — sin
> modificar las cifras de la tabla de depósito (verificadas R5) ni el
> deferral de facilidades de pago (Bucket B, fuera de alcance); (4) se
> agregó un tercer `articleLead.officialSources` (calendario SII AT2026) que
> sustenta las fechas de cierre ahora afirmadas en `articleLead.answer`. Por
> qué: verdicto `FAIL` (7,225/10) en auditoría de corpus publicado
> (`output/audits/corpus-2026-08-12/fichas/rentas-mixtas-sueldo-honorarios.md`),
> hallazgos R5 exactitud (confirmado) y R2 vigencia. Fuentes que justifican:
> SII, "Valores y fechas — Personas naturales AT2026"
> (<https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html>,
> fetch 2026-08-12: "Exención de impuesto global complementario (art. 52 y 52
> bis de la LIR): 13,5 UTA del mes dic. de 2025 = $11.265.804"; "1 UTA del
> mes dic. de 2025 = $834.504"); SII, comunicado calendario Operación Renta
> AT2026 (<https://www.sii.cl/noticias/2026/310326noti01pcr.htm>, fetch
> 2026-08-12: con pago hasta el 30 de abril de 2026, sin pago hasta el 8 de
> mayo de 2026). `articleLead.validAsOf` y `updatedDate` movidos de
> 2026-05-11 a 2026-08-12. **Pendiente:** `05-math-audit.md` (sesión fresca,
> `MathAuditAgent`) antes de Fase C; firma humana.

## Fix ERROR APV (hallado por MathAuditAgent, fuera del alcance original)

`05-math-audit.md` (fila 9, esta misma carpeta de run) reportó `ERROR` en el
bloque APV del artículo: las etiquetas Régimen A / Régimen B estaban
invertidas, y el mecanismo del bono del 15% de Régimen A estaba mal descrito
(como crédito en el F22, cuando en realidad es un depósito directo de la
Tesorería General de la República en la cuenta de ahorro previsional). Este
hallazgo es distinto del que originó este run (R5 exactitud IGC, R2
vigencia) y quedó explícitamente fuera del `scope.out` de `01-brief.yaml`,
pero bloquea el veredicto de `05-math-audit.md` (`FAIL`) y por tanto todo
avance hacia Fase C para este archivo.

**Qué se corrigió** (`src/data/blog/rentas-mixtas-sueldo-honorarios.md`,
sesión posterior del mismo DraftAgent, 2026-08-13):

- Línea 144 (bullet "APV Régimen B" en "Cuándo normalmente recuperas"):
  se corrigió la etiqueta invertida (el texto atribuía el crédito del 15% a
  Régimen B y la rebaja de base imponible a Régimen A; es al revés) y se
  reescribió el mecanismo del bono de Régimen A como depósito directo de
  Tesorería (no crédito en el F22). Se ajustó también la atribución de
  "genera o aumenta una devolución" para que aplique solo a Régimen B, ya
  que el bono de Régimen A no participa del cálculo del impuesto determinado
  en el F22.
- Líneas 197-200 (sección "APV y cómo puede reducir tu impuesto final"): se
  corrigió la misma inversión de etiquetas, se reescribió el mecanismo del
  bono de Régimen A (bonificación estatal 15%, tope 6 UTM anuales, depósito
  directo en cuenta de ahorro) y de Régimen B (rebaja de base imponible del
  IGC, tope 600 UF anuales), y se separó la afirmación "en ambos casos, debes
  declarar para que el beneficio se aplique" — esa dependencia solo es cierta
  para Régimen B; el bono de Régimen A se calcula y paga por una vía separada
  (Tesorería, a partir de información reportada por la AFP), sin depender de
  la declaración de renta del contribuyente.

**Fuentes fetcheadas de forma independiente para este fix** (ver
`02-dossier.md`, sección "Fuentes oficiales — refetcheadas para el fix de
ERROR APV"): SII — Preguntas frecuentes, regímenes tributarios del APV (art.
42 bis LIR),
<https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm>;
Superintendencia de Pensiones — bonificación fiscal del APV,
<https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html>.
Ambas fetcheadas en esta sesión (2026-08-13), no copiadas de
`que-es-el-apv.mdx` sin verificar — ese artículo se usó solo como corroboración
de coherencia de corpus, según instrucción de la tarea.

**Detalle completo del cambio** (diff conceptual línea por línea, texto antes
→ después): ver `04-draft.md`, sección "Fix ERROR APV (sesión posterior,
2026-08-13)".

**No se tocó:** corrección R5 (cifra IGC $11.265.804), reencuadre R2
(vigencia), slug/title/seoTitle/H1/canonical, `que-es-el-apv.mdx`,
`docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`.

**Estado:** este fix NO desbloquea el paquete. `05-math-audit.md` sigue con
veredicto `FAIL` registrado (el hallazgo ya fue reportado y la corrección
aplicada, pero el artefacto de auditoría no se regenera desde esta sesión —
eso requeriría una nueva pasada de `MathAuditAgent` en sesión fresca sobre el
archivo ya corregido, o una nota de `ComplianceAgent` que confirme la
remediación en Fase C). Ningún gate de la sección "Estado del paquete" se
marca `[X]` por este fix.

## Gates ejecutados por este agente (evidencia, no reemplaza el sign-off)

Ver salida literal en el reporte final de la sesión. Comandos ejecutados:
`pnpm run check:frontmatter`, `pnpm run check:editorial`,
`pnpm run check:dialect`, `pnpm run check:editorial-timeliness`,
`pnpm run check:links`, `pnpm vitest run`, `pnpm run format:check`.

## Nota

Ningún gate de esta lista está marcado `[X]`. Solo el editor humano firma
(`AGENTS.md` §2.9, `EDITORIAL_AI_PIPELINE.md` §9.5). Este DraftAgent no
declara la pieza publicable ni cierra ningún SLA. El gate de
`05-math-audit.md` permanecerá en rojo hasta que exista ese artefacto de una
sesión fresca de `MathAuditAgent`; el resto de la cadena (compliance, firma)
permanece bloqueado en cascada por diseño. Este es el comportamiento
correcto en este punto del pipeline para un run con
`requires_calculation=true`.
