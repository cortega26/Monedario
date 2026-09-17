Status: HOLD — no apto para firma en el estado actual
Role: PreSignReviewer (Claude Code — sesión fresca 2026-09-16, sin exposición previa al draft/compliance de esta pieza, adversarial)

Slug: `informe-deudas-cmf-vs-dicom` · run `2026-09-16-pilot-01`
Alcance: cuarta revisión independiente antes de la firma humana. Fuentes leídas directamente
desde disco y git (no se pidió al usuario que pegara archivos: ya existen en el repo).

Archivos revisados (todos leídos completos):
`01-brief.yaml`, `metadata.yaml`, `02-dossier.md`,
`04-draft.md` (v2), `06-compliance.md` (v1), `06-compliance-delta.md`,
`HUMAN-VERIFY-checklist.md`, `HUMAN-VERIFY-results.md`,
`src/data/blog/informe-deudas-cmf-vs-dicom.md` (artículo vivo, working tree = HEAD),
`git show --stat` y diffs completos de `c2f7aef5`, `daa0a70f`, `ea0272eb`.

---

## 1. Tabla de veredictos por chequeo

| # | Chequeo | Veredicto | Evidencia (1 línea) |
|---|---|---|---|
| 1 | Separación de deberes | **HOLD** | `git show --stat c2f7aef5` agrupa `01→04` y `06-compliance.md` en **un solo commit**, mismo autor git (`OpenAI Codex`), mismo timestamp (18:52:37); la separación de sesión/rol descansa solo en líneas autodeclaradas dentro de los artefactos, sin evidencia independiente (sesión, herramienta o identidad distinta verificable desde disco). Igual patrón en `ea0272eb` (delta + hotfix + HUMAN-VERIFY-results en un commit). |
| 2 | Disposición completa de las 14 flags | **HOLD** | Ver tabla §2. R3 no cumple 2(b) (sin URL/cita primaria para la magnitud "10–20 días"); `06-compliance-delta.md` describe como "PRESENTE" (RESIDUAL-1/RESIDUAL-2) texto que el diff de su propio commit (`ea0272eb`) ya había eliminado — el informe de compliance es objetivamente incorrecto sobre el estado del artículo que audita. |
| 3 | Honestidad de reducción de alcance | **PASS** | `grep -in` sobre el artículo vivo para "tribunal/juzgado/demanda/OS-9/PDI/carnet/documento de identidad/pérdida contable/castigada" → 0 coincidencias. Los 4 sub-items retirados (alegación procesal, canal exacto de denuncia, glosa literal de castigos, requisito de n.° de documento) no reaparecen bajo ningún sinónimo. |
| 4 | Precisión de cita en las 4 citas legales de carga | **PASS (con nota asesora)** | Ninguna paráfrasis se presenta entre comillas como si fuera cita literal, y los 4 números de artículo reconcilian con los quotes registrados en `HUMAN-VERIFY-results.md` — el chequeo tal como está definido en el mandato pasa. Nota aparte: ninguna de las 4 usa cita literal entre comillas, que es el ideal de la Regla 3 de `DraftAgent` (§8, Stage 04) — no la trato como bloqueante porque esa regla gobierna el artefacto `04-draft.md`, y no queda claro desde el propio pipeline que se extienda con ese nivel de literalidad al texto de blog final. Ver §4 y §7(d). |
| 5 | Disciplina de veredictos PARCIAL | **PASS** | D, F, I, J confirmados dentro de su alcance exacto en el artículo vivo — ver §5. |
| 6 | Claims retirados siguen retirados | **PASS** | Mismo grep de §3: 0 coincidencias de las 6 frases retiradas (atribución 20.575=borrado, presencial exclusivo, 10–20 días hábiles post-pago, mínimo gratuito por ley, última gestión de cobro, acceso de arrendador). Única mención de "20.575" en el artículo es el carve-out de empleadores (línea 192), dentro de alcance confirmado (ítem F). |

---

## 2. Tabla de disposición por flag (14/14, IDs del propio `06-compliance.md`)

| Flag | Sev | Disposición | Nota |
|---|---|---|---|
| R1 — atribución errónea eliminación Boletín | ALTA | **RESOLVED** | L138 vivo: re-atribuido a Ley 19.628 art. 18 inc. 2.° (traza a ítem A CONFIRMADO, quote+URL idNorma=141599). Paráfrasis, no cita literal (ver check 4). |
| R2 — flujo heredero presencial vs digital | ALTA | **RESOLVED** | L199 vivo: "CMF sin papel" + link oficial (traza a ítem D). Lista documental no afirmada (correcto). |
| R3 — cifra "10–20 días" sin fuente | ALTA | **WEAKENED-SUSPICIOUS** | L108/L185 vivo mantienen la magnitud "10–20 días" atribuida a "(CMF)" sin URL ni cita propia. El ítem E de `HUMAN-VERIFY-results.md` **no confirma la cifra con fuente primaria** — solo la reencuadra conceptualmente ("= desfase del snapshot semanal"). El checklist (pregunta 9) exigía explícitamente "Si NO [aparece en fuente]: retirar magnitud"; eso no ocurrió. La regla 7+3 (sí sourced, art. 19) se usó para blindar una cifra que sigue sin fuente propia. |
| R4 — prescripción art. 2514–2515 | ALTA | **RESOLVED** | L140 vivo: cómputo correcto + cita arts. 2514–2515 (traza a ítem C(a)(b), URL idNorma=172986). Sub-ítem (c) "alegarla ante el tribunal" correctamente ausente (grep confirma). |
| R5 — "consulta gratuita mínima por ley" | ALTA | **RESOLVED** | L89/L148 vivo: atribución legal retirada, no reemplazada por otra sin base (traza a ítem B RETIRAR). |
| R6 — régimen de acceso de terceros | ALTA | **RESOLVED** | L192 vivo: carve-out de empleadores únicamente, "arrendador" ausente (traza a ítem F). Nota menor: el artículo vivo omite el número de artículo exacto ("art. 1 inc. 3.°") que sí aparece en `04-draft.md` L98 — solo dice "principio de finalidad". |
| R7 — "ilimitado" | MEDIA | **RESOLVED** | L89 vivo: "Gratis" sin adjetivo. |
| R8 — OS-9/PDI | MEDIA | **RESOLVED** | L164 vivo: "denuncia policial correspondiente", sin sigla (traza a ítem H). |
| R9 — glosa castigos | MEDIA | **RESOLVED** | L122 vivo: glosa "pérdida contable" eliminada, reemplazada por remisión a la institución. **Nota de integridad del proceso:** `06-compliance-delta.md` describe esta línea como "PRESENTE… pre-existente, no tocado" (RESIDUAL-2) — afirmación falsa respecto del propio commit que la contiene (ver `git show ea0272eb`, hunk L119–122). |
| R10 — alcance de entidades reportantes | MEDIA | **RESOLVED (alcance levemente ampliado)** | L58/L66 vivo: "bancos, cooperativas y demás entidades financieras bajo su fiscalización". El ítem K confirmó literalmente "bancos y cooperativas" fiscalizadas; "demás entidades financieras bajo su fiscalización" es una generalización razonable pero no es exactamente lo que K confirmó palabra por palabra. Severidad baja, no bloqueante. |
| R11 — URL reclamo bancario | MEDIA | **RESOLVED** | Asimetría artículo (hub vivo) / draft (deep-link) explícitamente aceptada por el verificador humano en `HUMAN-VERIFY-results.md` (ítem G) — no es un hallazgo nuevo. |
| R12 — requisito n.° documento ClaveÚnica | MEDIA | **RESOLVED** | L106 vivo: "con tu RUT", sin requisito adicional no verificado. |
| R13 — boundary Ley 21.680 (RDC) | MEDIA | **RESOLVED** | L92 vivo: línea boundary presente, coherente con ítem L (CONFIRMADO, vigente 01-abr-2026, art. 7). |
| R14 — frescura al publicar | BAJA | **RESOLVED** | `updatedDate`/`validAsOf` → 2026-09-16T… en el frontmatter vivo; sin cambio de slug/título/estructura. |

**Conteo:** 12/14 RESOLVED sin reservas · 1/14 RESOLVED con nota menor (R10) · 1/14 WEAKENED-SUSPICIOUS (R3).

---

## 3. Honestidad de reducción de alcance — evidencia

Grep sobre `src/data/blog/informe-deudas-cmf-vs-dicom.md` (archivo vivo, no el draft):
`tribunal`, `juzgado`, `demanda`, `OS-9`, `OS9`, `PDI`, `carnet`, `documento de identidad`,
`número de documento`, `pérdida contable`, `castigada` → **0 coincidencias en todos los casos.**

## 4. Precisión de cita — detalle

Las 4 citas de carga están presentadas como glosa/paráfrasis con referencia a ley + artículo,
nunca entre comillas como cita literal. Ningún caso presenta una paráfrasis *disfrazada* de cita
textual (no hay comillas alrededor de texto no literal), y los 4 números de artículo reconcilian
con los quotes que sí quedaron registrados en `HUMAN-VERIFY-results.md`. Bajo la definición
propia del chequeo 4 del mandato, esto es un **PASS**:

- Ley 19.628 art. 18 inc. 2.° → L138: glosa ("no se pueden seguir comunicando los datos…
  después de pagada o extinguida") vs. quote humano registrado ("Tampoco se podrá continuar
  comunicando los datos relativos a dicha obligación después de haber sido pagada o haberse
  extinguido por otro modo legal.", `HUMAN-VERIFY-results.md` ítem A) — número de artículo
  reconciliado, contenido fiel.
- Ley 19.628 art. 19 → L108: glosa de la regla 7+3, artículo reconciliado.
- Código Civil arts. 2514–2515 → L140: glosa del cómputo, artículos reconciliados.
- Ley 20.575 art. 1 inc. 3.° → L192: glosa, y aquí sí hay una imprecisión menor: el artículo
  vivo omite el número de inciso (solo dice "principio de finalidad"), mientras `04-draft.md`
  L98 sí lo cita completo ("art. 1, inc. 3.°"). No es una cita literal fallida, es un dato de
  atribución perdido entre draft y publicación.

**Nota asesora (no bloqueante):** la Regla 3 de `DraftAgent` (`context/EDITORIAL_AI_PIPELINE.md`
§8, Stage 04) pide *"quote the operative clause literally first, then gloss. Never paraphrase
without first quoting."* Esa regla está escrita para el artefacto `04-draft.md`; el propio §8
dice que el output de esa etapa es `04-draft.md` *y* el archivo de blog correspondiente, así que
hay una lectura razonable en la que también debería aplicar al texto publicado — pero el mandato
de este pre-sign review no pide auditar contra esa regla del pipeline, sino contra la presencia
de paráfrasis-como-cita y la reconciliación de artículos, y en eso el artículo aprueba. Dejo la
ambigüedad de alcance de la Regla 3 como recomendación para el owner en §7(d), no como HOLD.
Ningún artefacto de compliance (v1 ni delta) señaló esta brecha de literalidad tampoco.

**No re-verifiqué directamente contra BCN LeyChile en esta sesión** (sitio con render JS que
bloquea fetch automático, documentado en `sources.yaml`); esto se apoya en los quotes ya
registrados en `HUMAN-VERIFY-results.md`, no en un re-fetch propio. Ver §7(c).

## 5. Disciplina de veredictos PARCIAL — verificación

| Item | Alcance confirmado | Alcance en artículo vivo | Resultado |
|---|---|---|---|
| D (heredero) | online CONFIRMADO / lista documental no verificada | L199: canal online + link; sin lista documental | Dentro de alcance |
| F (terceros) | empleadores CONFIRMADO / arrendadores RETIRAR | L192: solo empleadores | Dentro de alcance |
| I (gratuidad/ClaveÚnica) | "gratuito" CONFIRMADO / "ilimitado" RETIRAR / n.° documento no verificado | L89 "Gratis"; L106 solo RUT | Dentro de alcance |
| J (glosa deudas) | directa/indirecta CONFIRMADO / castigos PARCIAL | L118–120 directa/indirecta; L122 castigos sin glosa | Dentro de alcance |

## 6. Claims retirados — verificación

Mismo grep de §3, ampliado a los 6 patrones de retiro exigidos por el mandato: atribución
20.575→borrado, "presencial en la CMF" como canal exclusivo, "10–20 días hábiles" post-pago,
"mínimo gratuito por ley", "última gestión de cobro", acceso de arrendador.
**0 coincidencias en el artículo vivo para los 6 patrones.**

---

## 7. Asesoría (informativa — decide el owner)

**(a) Flags que considero realmente cerradas:** 13 de 14 (R1, R2, R4, R5, R6, R7, R8, R9, R10,
R11, R12, R13, R14) — de esas, R10 y R6 con nota menor de precisión (alcance levemente ampliado
y número de inciso perdido, respectivamente; ninguna cambia el sentido del claim). **No
considero cerrada R3** (magnitud "10–20 días" sin fuente propia pese a estar marcada RESOLVED
en la delta; el propio `02-dossier.md` claim #5 ya la había marcado `TODO:SOURCE` con la nota
"No publicar sin fuente", y esa condición sigue sin cumplirse en el texto vivo).

**(b) Top 3 riesgos residuales, en orden:**

1. **`06-compliance-delta.md` describe como presentes dos defectos (RESIDUAL-1, RESIDUAL-2) que
   el propio commit que lo contiene (`ea0272eb`) ya había eliminado del artículo.** Esto
   significa que **no existe ningún informe de compliance que audite con precisión el texto
   realmente publicado**: el v1 audita una versión anterior, la delta audita un estado
   intermedio que nunca coincidió con el commit final. Es un defecto de integridad del propio
   pipeline de auditoría, no solo del artículo.
2. **Correlación temporal a confirmar sobre `HUMAN-VERIFY-results.md`.** El archivo se
   autodeclara `Verificador: owner (sesión browser, fuentes primarias)` — no encontré nada en
   disco que lo contradiga, y aplico el mismo estándar de confianza en las líneas de rol
   autodeclaradas que acepté en el resto del paquete (§1 ya deja constancia de que ese estándar
   es débil en general, no solo aquí). Dicho eso, hay un dato puntual que vale la pena que el
   owner confirme explícitamente: el contexto de esta sesión registra un run previo en este
   mismo proyecto que verificó automáticamente (Playwright, fetch de BCN/CMF) los mismos 12
   ítems A–L con los mismos veredictos CONFIRMADO/RETIRAR/PARCIAL, y ese run cerró a las 19:33
   del 2026-09-16 — cuatro minutos antes de que `HUMAN-VERIFY-results.md` (mtime 19:37) quedara
   listo para commit. Puede ser coincidencia de que el owner haya usado ese informe automático
   como insumo para su propia verificación en navegador, lo cual sería un uso legítimo. Pido
   confirmación directa del owner de que personalmente abrió las URLs del checklist, más que
   asumir automáticamente que el label "owner" basta.
3. **R3 (cifra "10–20 días")**: defecto de fondo que ningún informe de compliance existente
   detectó, pese a que el propio dossier ya la había marcado `TODO:SOURCE — no publicar sin
   fuente`.

**(c) Verificación que el owner debería repetir personalmente en navegador:**
Abrir directamente y confirmar cita literal + vigencia de:
- `https://www.bcn.cl/leychile/navegar?idNorma=141599` (Ley 19.628, arts. 18 inc. 2.° y 19)
- `https://www.bcn.cl/leychile/navegar?idNorma=172986&idParte=8720591` (Código Civil, arts. 2514–2515)
- `https://www.bcn.cl/leychile/navegar?idNorma=1037366` (Ley 20.575, art. 1 inc. 3.°)
- `https://conocetudeuda.cmfchile.cl/informe-deudas/` (buscar específicamente si el portal
  publica la magnitud "10–20 días"; si no aparece, esa cifra debe retirarse o marcarse como
  estimación propia, no como dato CMF)

**(d) Recomendación: HOLD.** No hay `07-publish-packet.md` en ningún run-id de este slug —
no existe un paquete que firmar, por lo que "SIGN" no es una opción disponible en este momento
bajo ningún escenario. Independientemente de eso, tampoco recomendaría avanzar a la creación
del packet hasta resolver: (1) una re-auditoría de compliance en sesión fresca que examine el
commit `ea0272eb` tal como quedó (no un estado intermedio), (2) confirmación directa del owner
de que personalmente abrió las URLs de `HUMAN-VERIFY-checklist.md` (§7(b) ítem 2), (3) fuente
propia para la magnitud "10–20 días" (R3) o su retiro. Como mejora opcional, no bloqueante:
(4) citas literales entre comillas para las 4 referencias legales de carga en el artículo
publicado, si se decide que la Regla 3 de `DraftAgent` (§8) alcanza también al output final en
`src/data/blog/`.

---

## 8. Lo que esta sesión NO hizo

No se creó `07-publish-packet.md`. No se marcó ningún gate. No se editó `src/data/blog/**`,
`04-draft.md`, `06-compliance.md` ni `06-compliance-delta.md`. No se firmó nada en nombre de un
humano. Este informe es asesoría de pre-firma, no una decisión de publicación.
