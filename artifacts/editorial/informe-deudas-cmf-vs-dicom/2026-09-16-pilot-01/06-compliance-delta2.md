# Compliance delta 2 (addendum) — `informe-deudas-cmf-vs-dicom`
run `2026-09-16-pilot-01`

Status: LIFT HOLD (article-side) — 14/14 CLOSED in workdir text;
publication still blocked by pipeline causes (alta sin firma, sin 07)
Role: ComplianceAgent (fresh session 2026-09-17, disk-only,
adversarial)
Alcance: ADDENDUM SCOPE ONLY vs `06-compliance-delta.md` HOLD
(12/14 + 2 residuales). No re-litiga flags settled salvo confirmar
que siguen cerrados en el texto workdir actual. No produce 07, no
firma gates, no edita piezas.
Brief: `regulatory_sensitivity=alta` · `requires_calculation=false`
Inputs leídos (disco): plan mandate + Progress log,
`context/EDITORIAL_AI_PIPELINE.md` §§2-5 + §9, run folder completo
(`01-brief.yaml`, `02-dossier.md`, `04-draft.md` v2 workdir,
`06-compliance.md` v1, `06-compliance-delta.md`,
`06-presign-review.md` como insumo NO confiable — cada claim
re-verificado abajo, `HUMAN-VERIFY-checklist.md`,
`HUMAN-VERIFY-results.md`, `metadata.yaml`), artículo vivo
(`src/data/blog/informe-deudas-cmf-vs-dicom.md` workdir), git
(`git diff`, `git status --short`, `git log`, `git show ea0272eb`,
`git show daa0a70f:...` para pre/post-fix).

## 1. Ex-residuales de la delta (R4-C(c), R9-castigos) — veredicto workdir

| Residual | Grep workdir | Resultado |
|---|---|---|
| R4-C(c) L142 "alegarla" | `grep -n -i "alegarla\|tribunal\|juzgado\|demanda" src/data/blog/...` → 0 coincidencias (exit 1) | ABSENT — CLOSED |
| R9-castigos L122 glosa vieja | `grep -n "pérdida contable\|castigada" src/data/blog/...` → 0 coincidencias (exit 1) | ABSENT — CLOSED |

Wording actual que reemplaza (citado literal del workdir):

- L142 (era "Hay que alegarla ante el tribunal si el acreedor te
  demanda."): ahora `> ⚠️ La prescripción no borra la deuda
  automáticamente. No la confundas con la eliminación automática de
  registros.` — sin deber procesal afirmado, sin "tribunal/juzgado/
  demanda" en todo el archivo.
- L122 (era "Deudas que el banco ya dio por pérdida contable… la
  sacó de sus registros activos…"): ahora `**Castigos:** Etiqueta
  que algunas instituciones usan para ciertas deudas. Si aparece en
  tu informe, pide a la institución acreedora que te explique qué
  significa en tu caso y si la deuda sigue exigible.` — remisión al
  acreedor, sin glosa contable afirmada.

Ambos ex-residuales quedan CLOSED en texto workdir. La delta v1 los
describió como PRESENTE; esa descripción es falsa contra el estado
commiteado `ea0272eb` y contra el workdir (ver §4: observación
stale, no reporte vigente).

## 2. R3 ("10-20 días") — disposición workdir

Grep magnitud (ambos archivos, workdir):

- Artículo: `grep -n "10.*20" src/data/blog/...` → 0 coincidencias
  de magnitud (exit 1). Sin "10-20", "10 y 20", "10–20", "10.*20
  días" en todo el archivo.
- Draft v2: `grep -n "10" 04-draft.md` → solo L84 y L156, ambas
  menciones META de retiro ("la magnitud "10-20 dias" se retira por
  carecer de fuente primaria"), no afirmaciones de la cifra.

Reemplazo vigente (citado literal del workdir):

- Art. L108: `El informe se actualiza semanalmente, con antecedentes
  al cierre de cada viernes y al último día del mes (CMF). Además,
  pagada una deuda, el acreedor debe avisar dentro de 7 días hábiles
  y el registro debe actualizarse en los 3 días siguientes
  (Ley 19.628, art. 19).`
- Art. L185 (FAQ): `La CMF informa una actualización semanal, con
  datos al cierre de cada viernes y al último día del mes. Tras un
  pago, la actualización sigue la regla legal de 7 + 3 días hábiles
  (Ley 19.628, art. 19).`
- Draft v2 L82-88: idéntico reemplazo + nota explícita de retiro por
  falta de fuente primaria (dossier claim #5 "No publicar sin
  fuente").

Mapeo a fuentes verificadas:

- "semanalmente + cierre viernes / fin de mes" → `02-dossier.md`
  claim #1, estado VERIFICADO por fetch directo CMF Educa
  2026-09-16 (cita literal registrada en dossier).
- Regla "acreedor 7 días hábiles + banco de datos 3 días, art. 19"
  → `HUMAN-VERIFY-results.md` ítem E (única parte sourced de E;
  E ordena RETIRAR la magnitud "tal como está" por mezclar dos
  conceptos). La "7+3" es etiqueta de la regla bipartita, no suma
  computada.
- La parte conceptual de E ("10–20 = desfase del snapshot semanal,
  real") NO es fuente primaria de la magnitud: el checklist E
  pregunta 9 exigía quote+URL si la cifra aparecía en el portal, o
  "retirar magnitud" si no. El workdir acata el fallback (retiro),
  que es lo que la delta v1 no hizo y el presign marcó
  WEAKENED-SUSPICIOUS contra el HEAD `ea0272eb`.

¿Resta alguna magnitud numérica sin fuente? NO precisa. Resto
numérico del reemplazo: "7 días hábiles / 3 días" (sourced E +
art. 19 citado), "semanal / viernes / fin de mes" (sourced
dossier #1). La única frase de rango restante es FAQ L206
("El desfase puede ser de días o semanas según el momento del
reporte…"), cualitativa y sin magnitud afirmada como dato CMF —
no es claim numérico publicable que exija cita propia; va
hedgeada y subordinada a la regla sourced. R3: CLOSED en workdir.

## 3. R6 número de inciso — veredicto workdir

Art. L192 workdir (literal): `…(Ley 20.575, art. 1, inc. 3.°);
fuera de ese caso, ningún tercero puede descargarlo sin tu
autorización.` → CITA PRESENTE "art. 1, inc. 3.°". La nota del
presign (§2 R6: inciso ausente, solo "principio de finalidad")
era cierta contra el HEAD `ea0272eb` (`grep` HEAD L192: sin
inciso) pero queda RESUELTA por el diff workdir no commiteado
(`git diff` L192: "principio de finalidad" → "art. 1,
inc. 3.°"). R6: CLOSED, sin claim nuevo (carve-out empleadores =
ítem F CONFIRMADO; "arrendador" grep = 0).

## 4. Adjudicación del cargo de integridad del presign (§7(b)(1))

Cargo: la delta describe como PRESENTE (RESIDUAL-1/2) dos líneas
que su propio commit (`ea0272eb`) ya había eliminado → informe
"objetivamente incorrecto sobre el estado del artículo que
audita".

Verificación propia (disco + git, sin sesiones inventadas):

- Predicado fáctico CONFIRMADO. `git show ea0272eb` (diff del
  artículo): hunk castigos elimina "Deudas que el banco ya dio por
  pérdida contable…" y escribe la remisión suave; hunk
  prescripción elimina "Hay que alegarla ante el tribunal…".
  `git show ea0272eb:...` L122/L142 traen el texto NUEVO;
  `grep` workdir confirma ausencia total (ver §1). La delta,
  commiteada EN `ea0272eb`, afirma lo contrario ("PRESENTE L142",
  "PRESENTE L122… no tocado"). Es objetivamente falsa contra el
  árbol que la contiene.
- Mecanismo: STALE-OBSERVATION, no false-report deliberado (lo
  deliberado no es determinable desde disco+git y no se afirma).
  Evidencia: el contenido que la delta cita como PRESENTE coincide
  verbatim con el estado padre `daa0a70f` (`git show
  daa0a70f:...` L122 = glosa "pérdida contable" íntegra; L142 =
  "Hay que alegarla ante el tribunal…" íntegra, mismos números
  de línea L122/L142). La delta observó el workdir pre-fix y sus
  fixes aterrizaron en el mismo commit atómico DESPUÉS de
  redactada, sin re-correr la delta. Git no guarda timestamps por
  hunk ni logs de sesión, así que el orden intra-commit no es
  demostrable por reloj — pero la coincidencia verbatim
  padre↔delta es evidencia de observación stale, no de invención.
- Matiz obligatorio: la staleness fue parcial. La fila R3 de la
  delta describe correctamente el estado POST-fix `ea0272eb`
  ("desfase de entre 10 y 20 días… (CMF)" + 7+3), que NO es el
  texto padre (`daa0a70f`: "10 y 20 días hábiles respecto de la
  operación real", sin 7+3). La delta mezcló observaciones de dos
  momentos del workdir (R3 post-fix, R4/R9 pre-fix) en un solo
  commit atómico. Eso explica por qué el presign —que auditó el
  commit final— la encontró incorrecta en R4/R9 y débil en R3.
- Correlato §7(b)(2) del presign (coincidencia temporal
  auto-verificación vs run automático previo, mtime 19:37 vs
  cierre 19:33): NO VERIFICABLE desde disco+git. No hay logs de
  sesión, runs Playwright ni historial browser en el repo;
  `HUMAN-VERIFY-results.md` se autodeclara "owner (sesión
  browser)" y nada en disco lo contradice ni lo confirma. Sin
  hallazgo; fuera del alcance addendum. No se inventan runs.

## 5. Cálculo, frontmatter/slug/hero, claims nuevos del reemplazo R3

- `requires_calculation=false` SE MANTIENE (brief + v1 §1).
  Barrido workdir: artículo solo trae fechas (2026-09-16…),
  plazos legales citados (5 años; 7/3 días art. 19), números de
  artículo (18, 19, 2514, 2515, 7; 21.680) y conteos de estado.
  Draft v2 idem + fechas 01-abr-2026. "7+3" es etiqueta de regla
  bipartita, no operación. Cero fórmulas, conversiones, topes
  computados o ejemplos trabajados. `05` sigue N/A justificado.
- Frontmatter/slug/hero: diff workdir vs HEAD `ea0272eb` en
  frontmatter = VACÍO (`git diff | grep ^[+-](title|slug|…)`
  sin salida). Estado workdir: `updatedDate: 2026-09-16T12:00:00Z`,
  `validAsOf: 2026-09-16`; intactos title, seoTitle, author,
  pubDate, slug, featured, lang, draft, tags, category, cluster,
  topicRole, canonicalTopic, description, `heroImage:
  /images/hero/informe-deudas-cmf-vs-dicom.avif`, resto
  `articleLead`/`reviewPolicy`. Vs padre `daa0a70f` el único
  cambio es updatedDate/validAsOf (R14). Sin cambio de
  slug/canonical/título/estructura; hero/AVIF no tocados.
- Claims nuevos del reemplazo R3: ninguno sin cobertura. Weekly +
  cierre → dossier #1 fetch-verificado; 7+3 art. 19 → ítem E;
  inciso R6 → ítem F; "días o semanas" L206 es hedge cualitativo
  subordinado, no magnitud nueva. `TODO:SOURCE` sustantivos = 0
  en artículo (`grep TODO:SOURCE` = 0); draft solo menciona la
  política de deferral en meta, sin marcadores pendientes.

## 6. Tabla final por flag (14) contra texto workdir actual

| Flag | Sev | Estado workdir | Evidencia (1 línea) |
|---|---|---|---|
| R1 atribución eliminación | A | CLOSED | L138: 19.628 art. 18 inc. 2.° + link /leyes/; única mención 20.575 es L192 carve-out empleadores (ítem A/F). |
| R2 heredero presencial | A | CLOSED | L199: CMF sin papel + link w3-article-95399 + presencial alternativa; sin lista documental (ítem D). |
| R3 desfase 10-20 | A | CLOSED | Magnitud AUSENTE ambos archivos (§2); reemplazo weekly+cierre (dossier #1) + 7+3 art. 19 (ítem E). |
| R4 prescripción 2514/2515 | A | CLOSED | L140 cómputo exigible arts. 2514-2515 (C(a)(b)); alegarla AUSENTE, L142 sin deber procesal (§1). |
| R5 consulta gratuita | A | CLOSED | L89/L148 sin atribución legal, solo modalidad boletincomercial.cl (ítem B RETIRAR acatado). |
| R6 terceros/arrendador | A | CLOSED | L192 con art. 1 inc. 3.° (§3); L52 empleador ejemplo; `arrendador` = 0 (ítem F). |
| R7 "ilimitado" | M | CLOSED | L89 "Gratis" sin adjetivo; `ilimitado` = 0 (ítem I). |
| R8 OS-9/PDI | M | CLOSED | L164 "denuncia policial correspondiente"; `OS-9/PDI` = 0 (ítem H). |
| R9 castigos | M | CLOSED | Glosa vieja AUSENTE; L122 remisión al acreedor; L118-120 directa/indirecta intactas (ítem J). |
| R10 entidades | M | CLOSED | L58/L66 "bajo su fiscalización/supervisión"; `emisores de tarjetas` = 0 (ítem K; ver nota). |
| R11 URL reclamo | M | CLOSED | Hub vivo conservado L162; asimetría hub/draft aceptada explícita en ítem G. |
| R12 ClaveÚnica doc-number | M | CLOSED | L106 "con tu RUT"; `número de documento/carnet` = 0 (ítem I). |
| R13 boundary RDC | M | CLOSED | L92 boundary Ley 21.680 distinto al Informe, autoinfo (ítem L). |
| R14 frescura | B | CLOSED | updatedDate/validAsOf 2026-09-16; sin otros cambios frontmatter (§5). |

Nota R10: "y demás entidades financieras bajo su fiscalización"
(L58) amplía el literal K ("bancos y cooperativas") pero acotado
por la fórmula oficial que el propio dossier #13 registra
("entidades sujetas a fiscalización"). Generalización acotada
verificada, no claim nuevo; severidad baja, no bloqueante (el
presign la marcó igual: RESOLVED con nota menor).

**Conteo addendum: 14/14 CLOSED en artículo workdir · 14/14
CLOSED en draft v2** (draft v2 ya estaba 14/14 en delta v1 salvo
R3, ahora también R3-corregido 2026-09-17).

## 7. Disposición del resto del presign (insumo no confiable verificado)

| Chequeo presign | Veredicto propio contra workdir |
|---|---|
| 1 SoD (mismo commit/autor) | Sin hallazgo accionable desde disco+git: `c2f7aef5` agrupa 01→04+06 y `ea0272eb` agrupa delta+hotfix+results con mismo autor/timestamp, pero git no registra sesiones/herramientas; las role lines declaran sesiones distintas y nada en disco las refuta. No es prueba de violación ni de cumplimiento. |
| 3 alcance reducido (4 sub-items) | PASS confirmado: `tribunal/juzgado/demanda/OS-9/PDI/carnet/pérdida contable/castigada` = 0 en artículo vivo. |
| 4 precisión de cita (4 citas) | PASS confirmado: ninguna paráfrasis entrecomillada como literal; artículos reconcilian (18 inc. 2.° / 19 / 2514-2515 / 20.575 art. 1 inc. 3.° — este último ahora presente, §3). Nota asesora Regla 3 (cita literal primero) sigue vigente como mejora opcional, no bloqueante. |
| 5 disciplina PARCIAL (D/F/I/J) | PASS confirmado: D/F/I/J dentro de alcance en texto vivo (§6). |
| 6 retirados siguen retirados | PASS confirmado: 6 patrones (20.575=borrado, presencial exclusivo, 10-20 post-pago, mínimo gratuito por ley, última gestión, arrendador) = 0; R3 ahora también 0 en sentido estricto (§2). |
| 7(b)(1) integridad delta | Adjudicado en §4: predicado CIERTO, mecanismo STALE (parcial). |
| 7(b)(2) correlación temporal | Sin hallazgo: no verificable desde disco+git (§4). |
| 7(b)(3) R3 fondo | RESUELTO en workdir por el diff no commiteado (§2); era WEAKENED-SUSPICIOUS válido contra HEAD `ea0272eb`. |

## 8. Separación de deberes (este addendum) + veredicto

Draft/remediación: owner-verificador (HUMAN-VERIFY) + edits
workdir R3/R6 pendientes de atribución. Compliance v1: sesión
fresca 2026-09-16. Delta v1: sesión fresca 2026-09-16. Presign:
sesión fresca 2026-09-16 (asesoría, sin gates). Este addendum
(delta2): sesión fresca 2026-09-17, solo disco+git, sin editar
piezas. Quien redactó no audita. Packet (07) y firma de gates:
pendientes, humanos, fuera de alcance.

**Veredicto: LIFT HOLD (article-side).** Los 2 residuales de la
delta v1 están cerrados en texto workdir (ex-RESIDUAL-1/2 → §1),
R3 retirado y reemplazado con fuentes (§2), R6 con inciso (§3),
14/14 CLOSED (§6). "LIFT HOLD (article-side)" levanta solo el
bloqueo atribuible al texto del artículo; NO autoriza publicar:
siguen vigentes los STOP del plan ajenos al texto — compliance
`alta` sin firma humana + packet 07 inexistente (ningún run-id
de este slug tiene `07-publish-packet.md`; no hay nada que
firmar). STOP triggers de contenido: ninguno activo
(`TODO:SOURCE` sustantivos = 0; `requires_calculation=false`
confirmado; sin slug/canonical/título/hero tocados; sin claims
legales/numéricos nuevos sin cobertura).
