# Compliance delta — `informe-deudas-cmf-vs-dicom` run `2026-09-16-pilot-01`

Status: HOLD — 2 residuales en artículo publicado (R4-C(c), R9-castigos); draft v2 limpio 14/14
Role: ComplianceAgent (fresh session 2026-09-16, disk-only, adversarial)
Alcance: DELTA ONLY vs `06-compliance.md` v1 HOLD (14 flags R1–R14). Compara (a) artículo hotfixeado
(`src/data/blog/informe-deudas-cmf-vs-dicom.md`, diff workdir 2026-09-16) y (b) `04-draft.md` v2
contra veredictos de `HUMAN-VERIFY-results.md` (A–L). No produce 07, no firma gates, no edita piezas.

## 1. Disposición por flag (v1 → delta)

| Flag | Sev | Artículo hotfixeado | Draft v2 | Veredicto HUMAN-VERIFY mapeado |
|---|---|---|---|---|
| R1 atribución eliminación Boletín | A | RESOLVED — L138: "La **[Ley 19.628](/leyes/ley-19628-proteccion-datos/)** (art. 18, inciso 2.°) establece que no se pueden seguir comunicando los datos de una obligación después de pagada o extinguida: acreditado el pago, puedes pedir la eliminación del registro." | RESOLVED — L93–96: "no se pueden seguir comunicando los datos de una obligacion despues de pagada o extinguida (Ley 19.628, art. 18, inc. 2.°, texto introducido por Ley 19.812, art. 1.° N°4; verificacion humana 2026-09-16 — corrige la atribucion a Ley 20.575…)" | A (RETIRAR 20.575; 19.628 art. 18 inc. 2.° + 19.812). Sin restos de atribución a 20.575 para borrado (grep: única mención 20.575 es L192, carve-out empleadores). |
| R2 heredero presencial | A | RESOLVED — L199: "El trámite es 100% en línea a través de CMF sin papel ([trámite para herederos](https://www.cmfchile.cl/portal/principal/613/w3-article-95399.html)); también existe la vía presencial." | RESOLVED — L77–80: "la via oficial es **CMF sin papel** ([tramite para herederos](…w3-article-95399.html), verificacion humana 2026-09-16…)". Lista documental exacta no afirmada (alcance reducido). | D (digital + presencial alternativa). |
| R3 desfase 10–20 días | A | RESOLVED — L108: "con un desfase de entre 10 y 20 días respecto de la fecha de la consulta (CMF). Además, pagada una deuda, el acreedor debe avisar dentro de 7 días hábiles y el registro debe actualizarse en los 3 días siguientes (Ley 19.628, art. 19)." + FAQ L185 réplica. | RESOLVED — L82–87: "es desfase del snapshot semanal, no plazo de baja… el acreedor avisa dentro de 7 días hábiles y el registro se actualiza en los 3 días siguientes (Ley 19.628, art. 19, verificacion humana 2026-09-16)". | E (snapshot-lag + regla 7+3 art. 19). Nota: artículo dice "días" (no "hábiles") para el 10–20, consistente con E. |
| R4 prescripción 2515 | A | PARTIALLY — cómputo corregido L140: "(Código Civil, arts. 2514 y 2515)… el plazo se cuenta desde que la obligación se hizo exigible, no desde que dejaste de pagar." PERO L142 retiene sin tocar: "Hay que alegarla ante el tribunal si el acreedor te demanda." → **RESIDUAL-1** (sub-item C(c), pre-existente, no removido por el hotfix). | RESOLVED — L102–105: "contados desde que la obligacion se hizo exigible (Codigo Civil, arts. 2514 y 2515, verificacion humana 2026-09-16); no borra registros por si sola. No se afirma el deber de alegarla (matiz procesal no verificado esta sesion)." | C: (a)(b) CONFIRMADO, (c) RETIRAR. Draft acata; artículo no. |
| R5 consulta gratuita mínima | A | RESOLVED — L89 tabla: "Consulta modalidades en boletincomercial.cl"; L148: "El Boletín Comercial se consulta en [boletincomercial.cl](https://www.boletincomercial.cl/) según su modalidad de servicio." Atribución legal retirada. | RESOLVED — L62: "Según modalidad en boletincomercial.cl (sin atribución legal verificada)". | B (RETIRAR atribución 20.575). |
| R6 terceros/arrendador | A | RESOLVED — L52: "un reporte privado pedido por un tercero (por ejemplo, un empleador)"; bloque "Antes de arrendar" eliminado; L192: "La ley permite a los empleadores usar tu historial comercial solo para evaluar tu solvencia al contratar (Ley 20.575, principio de finalidad); fuera de ese caso, ningún tercero puede descargarlo sin tu autorización." Observación: cita ley sin número de artículo (draft sí: art. 1 inc. 3.°); no es claim nuevo. | RESOLVED — L117–120: "(Ley 20.575, art. 1, inc. 3.°)… No se afirma uso por arrendadores (sin fuente)." | F (empleadores CONFIRMADO; arrendadores RETIRAR). grep "arrendador" = 0 en artículo. |
| R7 "ilimitado" | M | RESOLVED — L89: "Gratis" (adjetivo eliminado). | RESOLVED — L62: "Gratis (CMF Educa; "ilimitado" sin respaldo: no se afirma)". | I parcial. grep "ilimitado" = 0 en artículo. |
| R8 OS-9/PDI | M | RESOLVED — L164: "debes hacer la denuncia policial correspondiente además del reclamo a la CMF." Siglas eliminadas. | RESOLVED — L114–115: "haz la denuncia policial correspondiente (canal exacto OS-9/PDI no verificado esta sesion: no se afirma sigla)". | H (RETIRAR siglas). grep OS-9/PDI = 0 en artículo. |
| R9 glosa directas/indirectas/castigos | M | PARTIALLY — directa/indirecta confirmadas (L118–120 intactas, coherentes con J). PERO L122 retiene sin tocar: "**Castigos:** Deudas que el banco ya dio por pérdida contable…" → **RESIDUAL-2** (glosa castigos pre-existente, no removida por el hotfix). | RESOLVED — L44–45: "No se afirma glosa de "castigos" por falta de fuente literal verificada." | J (directa/indirecta CONFIRMADO; castigos PARCIAL). Draft acata; artículo no. |
| R10 alcance entidades | M | RESOLVED — L58: "bancos, cooperativas y demás entidades financieras bajo su fiscalización"; L66: "Otras deudas con entidades financieras bajo supervisión de la CMF." ("emisores de tarjetas" eliminado). | RESOLVED — L41–42: "en general bancos y cooperativas fiscalizadas por la CMF (CMF Educa)". | K. grep "emisores de tarjetas" = 0 en artículo. |
| R11 URL reclamo bancario | M | RESOLVED (vía aceptada en resolución humana) — L162 conserva hub vivo `w3-propertyvalue-43332.html`. `HUMAN-VERIFY-results.md` lo acepta explícito: "G (deep-link en draft; hub vivo ya linkeado en publicado)". | RESOLVED — L111–113: deep-link verificado `https://www.cmfchile.cl/sitio/siac4/ingresoWebCiudadano.php`. | G. Asimetría artículo/draft documentada y aceptada por el verificador; no es hallazgo nuevo. |
| R12 ClaveÚnica doc-number | M | RESOLVED — L106: "con tu RUT." ("y número de documento del carnet" eliminado). | RESOLVED — L75–76: "(requisito "numero de documento" no verificado: no se afirma)". | I parcial. |
| R13 boundary RDC Ley 21.680 | M | RESOLVED — L92: "Desde abril de 2026 opera además el Registro de Deuda Consolidada (Ley 21.680): es un registro distinto al Informe CMF y puedes consultar tu propia información en él." | RESOLVED — L124–126: "Ley 21.680 (Registro de Deuda Consolidada) vigente desde el 01-abr-2026; el deudor accede a su propia informacion (art. 7). Boundary… no lo reemplaza." | L. |
| R14 frescura | B | RESOLVED — `updatedDate: 2026-09-16T12:00:00Z`, `validAsOf: 2026-09-16` (§5: sin otros cambios frontmatter). | RESOLVED — fecha de corte visible L11–13 + vigencia L23–25. | N/A (proceso). |

**Conteo delta: 12/14 RESOLVED en artículo · 14/14 RESOLVED en draft v2 · 2 PARTIALLY (residuales abajo).**

## 2. Claims nuevos del hotfix/draft v2 — trazabilidad a veredictos humanos

| Claim nuevo | Ubicación | Veredicto que lo cubre | ¿Sourced? |
|---|---|---|---|
| Regla 7+3 (acreedor 7 días hábiles + registro 3 días, Ley 19.628 art. 19) | Art. L108/L185; draft L85–87 | E | Sí — E la dicta literal. |
| Cita art. 18 inc. 2.° (no comunicar datos post-pago) + re-atribución 19.628/19.812 | Art. L138; draft L93–96 | A (quote idNorma=141599 + 19.812 art. 1.° N°4) | Sí — paráfrasis fiel del quote humano. |
| Cómputo 2514 ("desde que la obligación se hizo exigible", arts. 2514–2515) | Art. L140; draft L102–104 | C(a)(b) | Sí. |
| Carve-out empleadores (20.575 finalidad / art. 1 inc. 3.°) | Art. L192; draft L117–120 | F | Sí. |
| Boundary RDC (Ley 21.680, registro distinto, autoinfo) | Art. L92; draft L124–126 | L (vigente 01-abr-2026, art. 7) | Sí. |
| Heredero online (CMF sin papel + link w3-article-95399, presencial alternativa) | Art. L199; draft L77–80 | D | Sí. |

**Ningún claim legal/numérico nuevo sin cobertura en HUMAN-VERIFY-results. Cero TODO:SOURCE sustantivos**
(artículo: grep = 0; draft: única ocurrencia L145 es frase meta de política de deferral, no marcador).

## 3. Sub-items de alcance reducido — prueba de ausencia

| Sub-item | Draft v2 | Artículo | Resultado |
|---|---|---|---|
| Alegación procesal C(c) | Ausente como claim ("No se afirma el deber de alegarla", L105) | **PRESENTE L142**: "Hay que alegarla ante el tribunal…" (pre-existente, no tocado) | FAIL en artículo → RESIDUAL-1 |
| Canal exacto H (sigla OS-9/PDI) | Solo meta "no se afirma sigla" (L115) | Ausente ("denuncia policial correspondiente", L164) | PASS ambos |
| Glosa literal castigos | No afirmada (L44–45) | **PRESENTE L122** (pre-existente, no tocado) | FAIL en artículo → RESIDUAL-2 |
| Doc-number ClaveÚnica | No afirmado (L75–76) | Ausente ("con tu RUT", L106) | PASS ambos |

Sin sinónimos suavizados detectados para los dos PASS (grep "PDI/OS-9/documento" = 0 en artículo).
**Discrepancia reportada (no corregida):** `HUMAN-VERIFY-results.md` declara "castigos sin glosa
afirmada" como resolución aplicada al hotfix, pero el artículo L122 conserva la glosa intacta.
Igual para C(c): la resolución solo documenta retirar "última gestión", sin ordenar retirar L142.

## 4. `requires_calculation=false` — se mantiene en draft v2

Barrido de numerales del draft: fechas (2026-09-16, 01-abr-2026), plazos legales citados
(5 años, 7/3 días), conteos de estado (12/12, 0), números de artículo (18, 19, 2514, 2515, 7).
"7+3" es etiqueta de la regla bipartita E, no suma computada. Cero operaciones, fórmulas,
conversiones o ejemplos trabajados. **N/A de math-audit sigue justificado; ningún `05` requerido.**

## 5. Frontmatter / slug / hero — hotfix acotado (R14)

Diff frontmatter: solo `updatedDate: 2026-04-12T18:30:00Z → 2026-09-16T12:00:00Z` y
`validAsOf: 2026-04-12 → 2026-09-16`. Intactos: title, seoTitle, author, pubDate, slug,
featured, lang, draft, tags, category, cluster, topicRole, canonicalTopic, description,
`heroImage: /images/hero/informe-deudas-cmf-vs-dicom.avif`, resto de `articleLead` y
`reviewPolicy`. Sin cambio de slug/canonical/título/estructura. Hero/AVIF no tocados.

## 6. Separación de deberes (este delta)

Draft/remediación: owner-verificador (HUMAN-VERIFY) · Compliance v1: sesión fresca 2026-09-16 ·
Este delta: sesión fresca 2026-09-16, solo disco, sin editar piezas. Quien redactó no audita.
Packet (07) y firma de gates: pendientes, humanos, fuera de alcance.

## 7. Veredicto

**HOLD — residuales acotados al artículo publicado (draft v2 apto como base de packet tras
resolverlos).** 12/14 flags cerrados en ambas piezas; R4 y R9 cerrados en draft v2 pero
parciales en artículo por texto pre-existente no removido:

- **RESIDUAL-1 (R4-C(c), ALTA-heredada):** art. L142 "Hay que alegarla ante el tribunal…" —
  deber procesal no verificado (C(c) = RETIRAR). Vía: eliminar o reducir a frase sin deber
  ("la prescripción debe invocarse según tu caso; asesoría/cita BCN pendiente").
- **RESIDUAL-2 (R9-castigos, MEDIA):** art. L122 glosa "Castigos" — capítulo normativo no
  cargado (J = PARCIAL). Vía: retirar glosa en artículo como ya hace el draft v2 L44–45.

Publicación/merge bloqueado hasta resolver RESIDUAL-1 + RESIDUAL-2 en el artículo (o decisión
humana documentada de conservarlos con fuente), + packet 07 y firma humana. STOP triggers
activos del plan: `TODO:SOURCE > 0` no aplica (0 sustantivos); compliance `alta` sin firma
sigue vigente → HOLD se mantiene por esa causa además de los residuales.
