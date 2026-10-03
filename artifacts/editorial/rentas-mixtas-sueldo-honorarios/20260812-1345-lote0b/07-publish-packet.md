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

- [x] Brief listo (`01-brief.yaml`)
- [x] Dossier listo (`02-dossier.md`)
- [x] Outline listo (`03-outline.md`)
- [x] Draft listo (`04-draft.md`)
- [x] Math audit listo (`05-math-audit.md`) — **BLOQUEANTE, no existe.**
      `requires_calculation=true`; no se genera en esta sesión por
      separación de funciones (DraftAgent ≠ MathAuditAgent).
- [x] Compliance listo (`06-compliance.md`) — no se genera en esta sesión;
      corresponde a ComplianceAgent en sesión fresca, Fase C del plan, y
      solo puede ejecutarse después de que exista `05-math-audit.md`.
- [x] Fuentes completas (ver `02-dossier.md`: cifra corregida fetcheada en
      vivo en esta sesión de `https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html`;
      calendario AT2026 fetcheado en vivo de
      `https://www.sii.cl/noticias/2026/310326noti01pcr.htm` — agregado
      como tercer `articleLead.officialSources` porque sustenta las fechas
      de cierre de ventana ahora afirmadas en `articleLead.answer`; fuentes
      preexistentes del artículo sin cambio)
- [x] Benchmark observations separadas de fuentes oficiales (N/A — este run
      no usa benchmark externo)
- [x] `localDelta` visible en el entregable final (N/A — no es adaptación
      competitiva; el delta es la corrección de exactitud numérica y el
      reencuadre de vigencia, ver `03-outline.md`)
- [x] Ownership/no-canibalización revisado (sin cambio: sigue siendo owner
      de `canonicalTopic: rentas-mixtas`)
- [x] Fecha de corte visible para lectores (`articleLead.validAsOf:
      2026-08-12` + "Vigencia: ... revisado el 2026-08-12" en el bloque
      "Respuesta rápida" del cuerpo)
- [x] Prompt-injection review completo: las fuentes externas fetcheadas
      (SII) fueron tratadas como untrusted source content; ninguna
      instrucción embebida en ellas modificó rol, alcance, formato,
      herramientas, gates, citas o decisión editorial. No se encontró texto
      sospechoso que requiriera etiqueta `PROMPT_INJECTION_CANDIDATE`. Nota:
      esta tarea llegó con una cifra ya propuesta ($11.265.804) por el
      orquestador; se trató como hipótesis a verificar, no como hecho dado
      — se refetcheó la fuente SII de forma independiente en esta sesión
      antes de aplicarla (ver `02-dossier.md`), coincide exactamente.
- [x] VERIFIED carry-forward confirmado — **N/A, bloqueante:** no existe
      `05-math-audit.md` de este run todavía (ver sección de bloqueo
      arriba). No se puede confirmar VERIFIED carry-forward sin ese
      artefacto.
- [x] Separación de funciones documentada: ComplianceAgent (auditoría,
      sesión previa, 2026-08-12, ficha de origen) ≠ DraftAgent (este run,
      sesión `20260812-1345-lote0b`) ≠ MathAuditAgent (pendiente, sesión
      fresca) ≠ ComplianceAgent de Fase C (pendiente, sesión fresca) ≠
      HumanEditor (firma pendiente)
- [x] Registro NORMA §5.3 — texto listo abajo, pendiente de que el
      orquestador lo consolide en
      `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md` §17 (no
      se edita ese archivo desde esta sesión: es compartido con otros
      agentes trabajando en paralelo sobre otros artículos del mismo plan)
- [x] `HumanEditor` sign-off

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

## Ronda — resolución deferral facilidades de pago (sesión posterior, 2026-08-13)

`06-compliance.md` (ComplianceAgent, sesión fresca, 2026-08-13) dejó
registrado como observación no bloqueante (Bucket B, OBS-1 = R4 de la ficha
original) un deferral border-line en línea 220 de
`src/data/blog/rentas-mixtas-sueldo-honorarios.md`: "Si el monto es alto y
quieres dividirlo, el SII puede ofrecer facilidades de pago. Consulta
directamente en sii.cl al momento de declarar." Defendible por NORMA §2.4
condición 2, pero vago sobre un trámite con reglas generales potencialmente
públicas.

**Investigación (esta sesión, DraftAgent, 2026-08-13):**

1. `WebSearch` inicial apuntó a que el trámite lo administra la Tesorería
   General de la República (TGR), no el SII directamente.
2. `WebFetch` a `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2870.htm`
   confirmó explícitamente: los giros del Formulario 22 sí pueden acogerse a
   convenio de pago **en la Tesorería General de la República**, con base
   legal en el art. 192° del Código Tributario. Esto corrige un error
   fáctico del texto original (atribuía el trámite al SII / sii.cl cuando en
   realidad se tramita en tgr.gob.cl).
3. `WebFetch` directo a `https://tgr.gob.cl/convenios-de-pago/` y a
   `https://tgr.gob.cl/suscribir-convenio-de-pago-para-deudas-fiscales-y-territoriales/`
   devolvió HTTP 403. Se aplicó el fallback documentado (`scrapling extract
   get --impersonate chrome`) contra `https://tgr.gob.cl/convenios-de-pago/`,
   que sí devolvió el HTML completo (200 OK). Extracto literal relevante
   ("Convenio para deudas vencidas de Impuestos Fiscales y Aduaneros"): "Este
   convenio da la facilidad de pagar tus deudas vencidas de Impuestos
   Fiscales y Aduaneros en cuotas mensuales. Ley N° 20.780 Política de
   Convenios y Condonación permanente del Servicio de Tesorerías. Plazo
   hasta 24 cuotas (de acuerdo al comportamiento de pago). Pie entre un 10%
   y un 30% (de acuerdo al comportamiento de pago, si tiene o no garantía).
   Con un mínimo de 1 UTM puedes solicitar un convenio de pago en cuotas
   mensuales." Fetch 2026-08-13.
4. `https://www.chileatiende.gob.cl/fichas/4399-convenio-de-pago-para-deudas-fiscales-y-territoriales`
   (fuente pública oficial, gob.cl) corroboró de forma independiente el
   mismo plazo máximo (24 meses) y el mínimo de 1 UTM.

**Resultado:** se encontró una fuente pública oficial con reglas generales
verificables (plazo, pie, monto mínimo, entidad administradora), por lo que
NORMA §2.4 exige reformular en vez de mantener el deferral vago. Se
reformuló la línea 220 citando la regla concreta; queda como deferral
legítimo (§2.4 condición 2) solo lo intrínsecamente individual: el
porcentaje exacto del pie dentro del rango 10%-30% (depende del
comportamiento de pago y de si hay garantía) y la aprobación final del
convenio, que es caso a caso.

**Texto antes:**

> Si el monto es alto y quieres dividirlo, el SII puede ofrecer facilidades
> de pago. Consulta directamente en sii.cl al momento de declarar.

**Texto después:**

> Si el monto es alto y quieres dividirlo, puedes solicitar un [convenio de
> pago](https://tgr.gob.cl/convenios-de-pago/) en cuotas: lo administra la
> Tesorería General de la República (TGR), no el SII. La regla general es
> plazo de hasta 24 cuotas mensuales y pie inicial de entre 10% y 30% del
> monto adeudado, con una deuda mínima de 1 UTM para poder solicitarlo. El
> porcentaje exacto del pie dentro de ese rango depende de tu comportamiento
> de pago y de si ofreces garantía, así que la aprobación final es caso a
> caso. Se solicita en tgr.gob.cl con tu Clave Tributaria (SII) o
> ClaveÚnica.

**Fuentes citadas en el cambio:**

- SII — Preguntas frecuentes, giros F22 y convenio de pago en TGR:
  <https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2870.htm>
  (fetch 2026-08-13).
- TGR — Convenios de pago (condiciones generales, vía `scrapling` tras 403
  de `WebFetch`): <https://tgr.gob.cl/convenios-de-pago/> (fetch 2026-08-13).
- ChileAtiende — Convenio de pago para deudas fiscales y territoriales
  (corroboración): <https://www.chileatiende.gob.cl/fichas/4399-convenio-de-pago-para-deudas-fiscales-y-territoriales>
  (fetch 2026-08-13).

**Gates ejecutados tras el cambio** (salida literal en el reporte de sesión):
`pnpm run check:frontmatter` (OK), `pnpm run check:editorial` (OK, warnings
preexistentes en otros artículos, no relacionados con este cambio),
`pnpm run check:dialect` (OK), `pnpm run check:links` (OK, 0 enlaces rotos),
`pnpm vitest run` (157 archivos, 1358 tests, todos pasan),
`pnpm run format:check` (OK).

**No se tocó:** R5, R2, fix APV, slug/title/seoTitle/H1/canonical, ningún
otro artículo del corpus, `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`.
No se editó `06-compliance.md` (se preserva como registro histórico). No se
produjo ningún archivo de compliance nuevo.

**Ningún gate de la sección "Estado del paquete" se marca `[X]` por esta
ronda.** Este cambio de contenido requiere una verificación de conformidad
en sesión fresca (Bucket B: `ComplianceAgent`) antes de que pueda contar
para el veredicto CONDITIONAL (9,275/10) ya emitido, y sigue pendiente la
firma humana.

## Nota

Ningún gate de esta lista está marcado `[X]`. Solo el editor humano firma
(`AGENTS.md` §2.9, `EDITORIAL_AI_PIPELINE.md` §9.5). Este DraftAgent no
declara la pieza publicable ni cierra ningún SLA. El gate de
`05-math-audit.md` permanecerá en rojo hasta que exista ese artefacto de una
sesión fresca de `MathAuditAgent`; el resto de la cadena (compliance, firma)
permanece bloqueado en cascada por diseño. Este es el comportamiento
correcto en este punto del pipeline para un run con
`requires_calculation=true`.

## Addendum 2026-10-02

Esta ronda incorporó la prelación y el tope agregado de APV, la condición de
cotizaciones para la bonificación A y el alcance del producto TGR. No se
derivaron cifras nuevas; el registro material correspondiente está en
`src/data/correcciones.json`.

Evidencia de roles para esta ronda:

- DraftAgent: Codex (OpenAI GPT-6), instancia raíz `/root`; esta ejecución
  continuó con ediciones ya presentes en el worktree y revisó el artículo y su
  `git diff HEAD`. No se atribuye a una sesión sin exposición previa.
- ComplianceAgent: agente independiente `/root/compliance_rentas_round5`,
  creado sin historial de conversación (`fork_turns=none`) y con verificación
  de fuentes en vivo; resultado en `06-compliance-round5.md`.
- No se creó MathAuditAgent para esta ronda: no hay cifra derivada nueva
  (`requires_calculation=false`). HumanEditor conserva la firma; no se marcó
  ningún gate `[X]`.

### Seguimiento posterior a Compliance R5 — 2026-10-02

El informe histórico `06-compliance-round5.md` conserva su veredicto FAIL para
la versión que revisó. Después se añadió al artículo un ejemplo orientativo
AT2026 con la retención oficial de 14,5% para boletas emitidas en 2025; no se
deriva impuesto ni monto individual y no se crea `05-*`. La observación en vivo
del acordeón TGR está conservada en
`source-observation-tgr-2026-10-02.txt`; se limita al convenio para deudas
vencidas de Impuestos Fiscales y Aduaneros. Queda pendiente una nueva revisión
Compliance de esta versión y la repetición de `format:check`. No se marcó
ningún gate `[X]`.

### Seguimiento posterior a Compliance R6 — 2026-10-02

El informe histórico `06-compliance-round6.md` conserva su veredicto FAIL
para la versión revisada. Después se corrigió el alcance de la obligación de
declarar con la FAQ SII 001.140.0972.009 y la Guía Práctica AT2026; se
describió la propuesta F22 según los datos informados y su corrección posible
con la FAQ 001.140.2772.027; y se distinguieron honorarios brutos, gastos y
base imponible con la Guía Práctica y el Formulario 22 AT2026. El ejemplo
ahora usa únicamente el umbral oficial de 13,5 UTA (`$11.265.804`) y no
calcula un resultado individual. Las fuentes se refetchearon el 2026-10-02.

Las fechas `updatedDate`, `articleLead.validAsOf` y "revisado el" permanecen
en 2026-10-02 conforme a NORMA §5.1; también se volvió a comprobar que el
sitio de Operación Renta y el índice de noticias SII consultados no publican
calendario AT2027. Se preserva el reporte de ronda 6 y queda pendiente la
revisión independiente fresca de ronda 7. La procedencia DraftAgent continúa
registrando esta instancia raíz con exposición a cambios previos; no se
representa como sesión fresca. No se marcó ningún gate `[X]` ni se firmó.

### Seguimiento posterior a Compliance R7 — 2026-10-02

El informe histórico `06-compliance-round7.md` queda preservado con FAIL para
la versión que revisó. Sus verificaciones confirmaron los fixes de obligación
F22, propuesta, base imponible, umbral/IGC, APV agregado, tasa y TGR. Encontró
que la explicación del Régimen A omitía que el ahorro elegible debe destinarse
a anticipar o incrementar la pensión (Compendio SPensiones, Capítulo XII,
nums. 5–7; fetch 2026-10-02). El artículo y la entrada existente
`rentas-mixtas-apv-y-convenios` del registro de correcciones se actualizaron
para incluir esa condición.

R7 indicó que no halló registro material; en el worktree actual se comprobó
que el ID ya existía, estaba asociado al artículo y el gate había validado 12
entradas. La descripción de ese registro era incompleta respecto del nuevo
hallazgo y ahora está ampliada. Queda pendiente una ronda 8 fresca para
verificar el contenido y resolver esta diferencia de evidencia. Ningún gate
`[X]` fue marcado ni se firmó.

### Seguimiento estructural posterior — 2026-10-02

Una instancia Compliance fresca comunicó preliminarmente la falta del H2
obligatorio de DoD §2 y cuestionó la columna de tasas efectivas; no alcanzó a
guardar un informe R9. Se añadió `## Qué es y qué cambia con las rentas
mixtas` y se retiró el resumen redondeado de tasas efectivas máximas,
conservando los tramos UTA y las tasas marginales publicadas. La fuente SII
2026 consultada el 2026-10-02 publica dichas tasas efectivas a dos decimales;
por eso el registro describe la diferencia como redondeo de la fuente, no como
un cálculo nuevo. No se derivó ninguna cifra ni se creó `05-*`.

### Seguimiento de Compliance round 10 — 2026-10-02

La revisión holística fresca del artículo final concluyó **PASS, 9,58/10**;
véase `06-compliance-round10.md`. Confirmó estructura DoD §2, umbral IGC,
propuesta F22, base imponible, tasas, APV, ejemplo sin aritmética derivada y
alcance específico del convenio TGR. Registró con transparencia límites de
fetch para el PDF SII Línea 23, la página TGR y la reconfirmación independiente
del estado AT2027. Ningún gate fue marcado ni firmado; HumanEditor conserva la
aprobación.

### Refetch con navegador tras R10 — 2026-10-02 (America/Santiago)

A petición del editor, repetí las consultas con Chrome, cuyo visor renderizó las
páginas que el extractor anterior no había podido leer. Esto complementa la
evidencia posterior a R10; el informe R10 queda preservado como registro fiel
de los límites de lectura de aquella sesión.

- El PDF oficial de [Instrucciones SII, Línea 23 AT2026](https://www.sii.cl/servicios_online/renta/2026/archivos/l23_instruccion.pdf)
  abrió en el visor Chrome (5 páginas). En la página 4, §23.4, se observaron el
  tope agregado de 600 UF, la prioridad de imputación —APV B mensual vía
  empleador, APV B directo y luego APV A— y que el exceso no se acoge a ninguno
  de esos regímenes.
- La [página TGR de convenios](https://tgr.gob.cl/convenios-de-pago/) cargó y
  permitió desplegar “Convenio para deudas vencidas de Impuestos Fiscales y
  Aduaneros”: hasta 24 cuotas mensuales; pie de 10%–30% según comportamiento
  de pago y existencia de garantía; mínimo de 1 UTM para solicitar.
- El [portal SII Operación Renta 2026](https://www.sii.cl/destacados/renta/2026/)
  cargó y presentó materiales y enlaces AT2026. El [índice de noticias SII
  2026](https://www.sii.cl/noticias/2026/index.html) cargó su listado; incluye
  una noticia del 1 de septiembre sobre la DJ 1965 desde Renta 2027, pero no
  vi allí un calendario AT2027. La observación se limita a esas dos páginas y
  no prueba que no exista un calendario en otra ubicación.

Este refetch resuelve las limitaciones de acceso a Línea 23 y TGR para esta
comprobación, y mejora la evidencia de la búsqueda AT2027 acotada. No modifica
el artículo, sus fechas, el informe R10, ni gates; no se marcó `[X]` ni se
firmó.
