# Publish Packet — devolucion-impuestos-fechas-compensaciones

- Run id: `20260812-1420-lote0c`
- Slug: `devolucion-impuestos-fechas-compensaciones`
- Source article: `src/data/blog/devolucion-impuestos-fechas-compensaciones.md`
- Origen: remediacion Fase B sobre hallazgo de
  `output/audits/corpus-2026-08-12/fichas/devolucion-impuestos-fechas-compensaciones.md`
  (verdicto FAIL 6,75/10, R1 respuesta ancla + R2 vigencia)
- Autor de este paquete: DraftAgent (Claude Code), sesion `20260812-1420-lote0c`

## Estado del paquete

- [ ] Brief listo (`01-brief.yaml`)
- [ ] Dossier listo (`02-dossier.md`)
- [ ] Outline listo (`03-outline.md`)
- [ ] Draft listo (`04-draft.md`)
- [ ] Math audit listo o no aplica (`requires_calculation=false`; no se genera
      `05-math-audit.md` en esta sesion — separacion de funciones)
- [ ] Compliance listo (no se genera `06-compliance.md` en esta sesion —
      separacion de funciones; corresponde a ComplianceAgent en sesion
      fresca, Fase C del plan)
- [ ] Fuentes completas (ver `02-dossier.md`: 5 fuentes ya presentes en el
      articulo publicado se conservan sin cambio + 1 FAQ SII
      (001_140_8954) agregada para sustentar la nueva guia de accion,
      reverificada 2026-08-12)
- [ ] Benchmark observations separadas de fuentes oficiales (N/A — este run
      no usa benchmark externo)
- [ ] `localDelta` visible en el entregable final (N/A — no es adaptacion
      competitiva; el delta es la declaracion explicita de cierre de ciclo
      en la primera pantalla + el `articleLead` nuevo, ver `03-outline.md`)
- [ ] Ownership/no-canibalizacion revisado (sin cambio: sigue siendo owner de
      `canonicalTopic: devolucion-impuestos`)
- [ ] Fecha de corte visible para lectores (`articleLead.validAsOf:
      2026-08-12` + "Revisado el: 2026-08-12" en el cuerpo)
- [ ] Prompt-injection review completo: las fuentes externas fetcheadas/
      reverificadas (SII) y el resultado de la busqueda AT2027 fueron
      tratados como untrusted source content; ninguna instruccion embebida
      en ellas modifico rol, alcance, formato, herramientas, gates, citas o
      decision editorial. No se encontro texto sospechoso que requiriera
      etiqueta `PROMPT_INJECTION_CANDIDATE`.
- [ ] VERIFIED carry-forward confirmado (N/A formalmente — no hay
      `05-math-audit.md` de este run porque `requires_calculation=false`;
      las cifras R5 (calendario de deposito/cheque AT2026) que se conservan
      ya estaban verificadas por la auditoria de origen y no se
      modificaron)
- [ ] Separacion de funciones documentada: ComplianceAgent (auditoria,
      sesion previa, 2026-08-12, ficha en
      `output/audits/corpus-2026-08-12/fichas/`) ≠ DraftAgent (este run) ≠
      ComplianceAgent de Fase C (sesion fresca, pendiente) ≠ HumanEditor
      (firma pendiente)
- [ ] Registro NORMA §5.3 presente en
      `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md` §17
      (pendiente de agregar por el orquestador del plan tras este run —
      texto completo en la seccion "Nota de registro NORMA §5.3" abajo)
- [ ] `HumanEditor` sign-off

## Gates ejecutados por este agente (evidencia, no reemplaza el sign-off)

Ver salida literal en el reporte final de la sesion. Comandos ejecutados:
`pnpm run check:frontmatter`, `pnpm run check:editorial`,
`pnpm run check:dialect`, `pnpm run check:editorial-timeliness`,
`pnpm run check:links`, `pnpm vitest run`, `pnpm run format:check`.

## Nota de registro NORMA §5.3 (texto listo para consolidar en PLAN §17)

- 2026-08-12 — Remediación Fase B, lote 0, `devolucion-impuestos-fechas-compensaciones`
  (run `artifacts/editorial/devolucion-impuestos-fechas-compensaciones/20260812-1420-lote0c/`).
  Qué cambió: se agregó `articleLead` (ausente hasta ahora, hallazgo R1 de la
  ficha de auditoría) con la respuesta ancla "el ciclo AT2026 ya cerró" y las
  tres acciones posibles según situación del lector; se reencuadró el párrafo
  de apertura y la sección "Qué hacer ahora" (renombrada "Ciclo AT2026
  cerrado: qué hacer hoy") para declarar explícitamente en la primera
  pantalla que el calendario AT2026 (calendario de depósito/cheque, cerrado
  el 29 de mayo de 2026) ya terminó, en lugar de presentarlo en presente/
  futuro inmediato como si estuviera vigente (hallazgo R2, principal, de la
  ficha de auditoría); se agregó guía explícita para quien declaró y nunca
  recibió el depósito (consulta de estado/rectificatoria en sii.cl) y para
  quien no alcanzó a declarar dentro de AT2026 (deferral legítimo, sin cifra
  de multa inventada); se señaló que el calendario AT2027 aún no está
  publicado por el SII, sin inventar fecha. Las fechas del calendario AT2026
  en sí (29 abril / 15 mayo / 27 mayo depósito, 29 mayo cheques) no se
  modificaron — ya estaban verificadas correctas contra la fuente oficial
  (R5 PASS en la ficha de auditoría); el defecto corregido es de encuadre
  temporal, no de exactitud. Los deferrals legítimos preexistentes hacia
  SII/TGR para consulta de cuenta individual (R4 PASS/N-A) se conservaron
  sin cambio. Por qué: verdicto FAIL (6,75/10) en la auditoría de conformidad
  del corpus publicado 2026-08-12 — ver
  `output/audits/corpus-2026-08-12/fichas/devolucion-impuestos-fechas-compensaciones.md`.
  Fuentes que lo justifican: SII, comunicado 31-03-2026, calendario AT2026
  (<https://www.sii.cl/noticias/2026/310326noti01pcr.htm>, fetch previo
  2026-08-12 en la ficha de auditoría); SII FAQ 001_140_8954, consulta de
  estado y rectificatoria por internet
  (<https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8954.htm>,
  reverificada 2026-08-12); SII FAQ 001_140_0516, rectificatoria que origina
  devolución vía TGR
  (<https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0516.htm>,
  ya citada en el artículo original); WebSearch dirigida ("SII calendario
  Operación Renta AT2027 fecha publicación", 2026-08-12) que confirma que
  ningún resultado oficial menciona un calendario AT2027 publicado,
  consistente con la verificación ya realizada el mismo día para
  `operacion-renta-f22-checklist`. `updatedDate` movido de
  `2026-05-11T00:00:00Z` a `2026-08-12T00:00:00Z`;
  `articleLead.validAsOf: 2026-08-12` (nuevo campo). Pendiente: compliance en
  sesión fresca (Fase C) y firma humana antes de que el gate de vigencia
  cierre para esta pieza.

## Nota

Ningun gate de esta lista esta marcado `[X]`. Solo el editor humano firma
(`AGENTS.md` §2.9, `EDITORIAL_AI_PIPELINE.md` §9.5). Este DraftAgent no
declara la pieza publicable ni cierra el SLA de `check:editorial-timeliness`;
ese gate permanecera en rojo hasta la firma humana, lo cual es el
comportamiento correcto en este punto del pipeline. Pendiente para Fase C:
`06-compliance.md` en sesion fresca de `ComplianceAgent` + firma humana de
este archivo.

## Ronda 2 — remediacion DEFECT #1-2 (compliance FAIL 8,75/10)

- Origen: `06-compliance.md` (sesion fresca `06-compliance-fresh-20260812`),
  veredicto FAIL 8,75/10 nominal, bloqueado por violacion de NORMA §1.1 MUST
  4 (DEFECT #1) mas un defecto preexistente de trazabilidad (DEFECT #2).
  `06-compliance.md` **no se modifico** en esta ronda — se preserva integro
  como registro historico de la revision de ronda 1.
- Autor de esta ronda: DraftAgent (Claude Code), sesion nueva, sin
  exposicion al draft de ronda 1 ni a la sesion de `06-compliance.md`.
  Fecha de corte: 2026-08-13.
- DEFECT #1 (MAJOR) resuelto: se refetchearon en vivo los tres candidatos de
  fuente senalados en el brief (`001_140_2444` descartada por demasiado
  estrecha — boletas de honorarios, 3 anos anteriores; `001_140_0595` y
  `p7renta.htm` usadas en combinacion) y se agregaron a
  `articleLead.officialSources` y a "Fuentes y referencias primarias"; el
  cuerpo se reformulo condicionando la afirmacion a "si estabas obligado a
  declarar" y usando verbo permisivo, sin inferir cobertura del "ano en
  curso" que ninguna fuente afirma literalmente. Detalle completo en
  `02-dossier.md` y `04-draft.md` (seccion "Ronda 2").
- DEFECT #2 (menor) resuelto: se reemplazo la entrada duplicada/mal
  etiquetada de la FAQ `001_140_8951` en "Fuentes y referencias primarias"
  por la fuente correcta y verificada por fetch, `001_140_8366.htm`, que sí
  trata "causas de no recepcion de la devolucion pese a declaracion
  aceptada (retenciones y datos bancarios)".
- Observacion fuera de alcance (NO resuelta, NO se toco el articulo): al
  fetchear `001_140_8366.htm` se detecto que su texto sobre el umbral de
  $3.000.000 (domicilio vs. BancoEstado) es el inverso del que ya esta
  publicado en el calendario AT2026 del cuerpo (linea R5, respaldada por el
  comunicado SII 31-03-2026, que sí coincide con lo publicado). Es una
  contradiccion entre dos fuentes oficiales del SII, no introducida por este
  run. Documentada en `02-dossier.md`; queda como observacion abierta para
  el proximo ciclo de revision de contenido o para que la sesion fresca de
  ComplianceAgent la evalue.
- `updatedDate` (`2026-08-12T00:00:00Z`) y `articleLead.validAsOf`
  (`2026-08-12`) **no se modificaron** en esta ronda — la correccion se
  documenta como bullet adicional en "Informacion de vigencia" del blog
  file, sin reabrir el marco de vigencia ya establecido en ronda 1.
- Elementos explicitamente NO tocados: el reencuadre de vigencia del ciclo
  AT2026 (primera pantalla), el calendario de fechas AT2026 en si (incluida
  la linea del umbral $3.000.000, ver observacion arriba), slug, title,
  seoTitle, H1, canonical, `06-compliance.md` (preservado sin cambios).
- Ningun gate de esta lista fue marcado `[X]` por esta ronda. Pendiente:
  `06-compliance-round2.md` (sesion fresca de ComplianceAgent, fuera del
  alcance de esta sesion) + firma humana.

## Ronda 3 — investigacion y resolucion de discrepancia SII umbral $3.000.000

- Origen: `06-compliance-round2.md`, veredicto FAIL 8,88/10 (8,875 exacto),
  bloqueado por **DEFECT-NUEVO #1 (MAYOR)**: contradiccion verificada de
  forma independiente por esa ronda entre el comunicado SII 31-03-2026 y la
  FAQ `001_140_8366.htm` sobre el umbral de $3.000.000 (domicilio vs.
  BancoEstado). `06-compliance-round2.md` **no se modifico** en esta ronda —
  se preserva integro como registro historico, igual que `06-compliance.md`.
  Esta ronda tampoco produce `06-compliance-round3.md` (corresponde a otro
  agente, en otra sesion fresca).
- Autor de esta ronda: DraftAgent (Claude Code), sesion nueva, sin
  exposicion a las sesiones de draft anteriores ni a las de compliance.
  Fecha de corte: 2026-08-13.
- Investigacion realizada (detalle completo con citas literales en
  `02-dossier.md`, seccion "Ronda 3"): (1) refetch propio de ambas fuentes en
  conflicto, confirmando la contradiccion como real y literal; (2)
  investigacion de una tercera fuente en tgr.cl — no verificable en esta
  sesion (URL de noticia da 404 en fetch directo, subdominio de ayuda no
  resuelve por DNS desde este entorno; un resumen de busqueda que
  coincidia con el comunicado se descarto por no poder confirmarse); (3)
  hallazgo de una pagina institucional del SII sobre el mecanismo legal de
  pago por caja (`pagodevimpxcaja.html`, fechada AT2016, usada solo como
  corroboracion del mecanismo, no como autoridad del ciclo vigente ni
  citada en el blog file) que documenta un tope real de $3.000.000 para pago
  en caja BancoEstado; (4) comparacion de fechas de actualizacion (FAQ 8366
  creada 01/02/2023, actualizada 14/04/2026; comunicado fechado 31-03-2026) —
  no dirime por si sola.
- **Resolucion: dirimida a favor del comunicado SII 31-03-2026** ("superior a
  $3 millones -> domicilio; inferior -> BancoEstado"), que ya es exactamente
  lo publicado en el cuerpo del articulo (linea del calendario AT2026, cifra
  R5). El argumento que dirime es mecanico, no conteo de fuentes: un tope de
  pago en caja de $3.000.000 solo es compatible con la direccion del
  comunicado (montos dentro del tope se pagan en caja; el excedente se paga
  por la via alternativa, cheque a domicilio); la lectura de la FAQ 8366
  pediria a una caja pagar mas de su propio tope, mecanicamente inconsistente
  con el mecanismo que el propio SII documenta.
- **Cambio aplicado al blog file: solo de citacion, no de contenido/cifra.**
  La entrada de `001_140_8366.htm` en "Fuentes y referencias primarias" se
  amplio con una nota de alcance explicita (se cita solo por su contenido
  sobre retenciones/datos bancarios, no como fuente del umbral). Se agrego un
  bullet nuevo en "Informacion de vigencia" (fechado 13 de agosto de 2026)
  documentando la investigacion y su resolucion.
- `updatedDate` (`2026-08-12T00:00:00Z`), `articleLead.validAsOf`
  (`2026-08-12`) y "Revisado el" en el cuerpo (`2026-08-12`) **no se
  modificaron**: la investigacion confirmo la cifra existente, no la
  corrigio, por lo que no aplica el disparador de NORMA §5.1 "correccion de
  error importante" (`06-compliance-round2.md` §4bis condiciono el
  movimiento de estas fechas a que la investigacion terminara corrigiendo el
  umbral).
- **Hallazgo interno para el SII (no publicado en el blog):** la FAQ
  `001_140_8366.htm` del propio SII contiene una inversion del criterio de
  umbral respecto de su propio comunicado AT2026 y del mecanismo de tope de
  pago por caja que el mismo SII documenta. Se registra en `02-dossier.md`
  como observacion verificada para que el SII corrija su FAQ; no se declara
  en el articulo publico ni se enlaza la contradiccion.
- Elementos explicitamente NO tocados: el parrafo/tabla del calendario AT2026
  con el umbral (sin cambio de valor ni direccion), slug, title, seoTitle,
  H1, canonical, `06-compliance.md` y `06-compliance-round2.md` (preservados
  sin cambios), `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`,
  el resto del articulo y cualquier otro articulo del corpus.
- Ningun gate de esta lista fue marcado `[X]` por esta ronda. Pendiente:
  `06-compliance-round3.md` (sesion fresca de ComplianceAgent, fuera del
  alcance de esta sesion) + firma humana.
