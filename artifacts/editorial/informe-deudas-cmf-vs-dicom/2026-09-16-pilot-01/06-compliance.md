Status: CONDITIONAL — HOLD, publication blocked until TODO:SOURCE = 0 + human sign-off
Role: ComplianceAgent (fresh session 2026-09-16, zero prior draft context, adversarial)

Slug: `informe-deudas-cmf-vs-dicom` · run `2026-09-16-pilot-01` · corte `2026-09-16`
Brief: `regulatory_sensitivity=alta` · `requires_calculation=false`
Inputs read (disk only): plan mandate, `context/EDITORIAL_AI_PIPELINE.md`,
`docs/editorial/NORMA_YMYL.md`, `01-brief.yaml`, `02-dossier.md`,
`03-outline.md`, `04-draft.md`, `metadata.yaml`, `sources.yaml`,
`src/data/blog/informe-deudas-cmf-vs-dicom.md`,
`src/data/laws/ley-20575-datos-comerciales.md`,
`src/data/laws/ley-19628-proteccion-datos.md`,
`src/data/laws/ley-21680-registro-deuda-consolidada.md`.
No `05-math-audit.md` exists in the run folder (see §1).

## 1. Cálculo / math-audit — confirmación de `requires_calculation=false`

Escaneado completo de `04-draft.md`: los únicos numerales son fechas
(`2026-09-16`), plazos legales citados (`5 años`, `10 y 20 días hábiles`) y
conteos de marcadores (`12 sustantivos`). Sin operaciones aritméticas,
conversiones de unidades, fórmulas, topes computados ni ejemplos
trabajados. La declaración del brief (`false` + justificación) **coincide
con el contenido del draft**. No se requiere ni existe auditoría
matemática para este run; `05-math-audit.md` = N/A justificado. Si en el
futuro se produjera un `05` para este run-id, no debe inventar cálculos.

## 2. NORMA_YMYL scorecard (sobre el artefacto draft, no sobre un artículo publicable)

| Dimensión (peso) | Puntaje /10 | Justificación |
|---|---|---|
| Respuesta ancla (35%) | 8,0 | Regla de decisión concreta + excepciones + vigencia + fuente CMF Educa citadas. Descuento: "gratis/ilimitado" parcialmente TODO en la tabla. |
| Precisión + fuentes (25%) | 5,0 | 4 claims VERIFICADO por fetch (dossier #1–4); 12 TODO:SOURCE honestamente marcados; cero citas literales BCN (LeyChile bloquea fetch). Insuficiente para publicar. |
| Vigencia + calendario (15%) | 8,0 | Fecha de corte visible propuesta; stub de vigilancia honesto (N/A sin reforma verificada). Descuento: Ley 21.680 (RDC) no nombrada (R13). |
| Excepciones + cobertura (15%) | 7,5 | Buenos casos borde (desfase, aval, suplantación, heredero, terceros), todos con TODO donde falta respaldo. |
| Claridad + estructura (10%) | 8,5 | Regla-primero, tabla con etiqueta "resumen orientativo" + limitador, sin meta-proceso. |

**Total ponderado: 7,2/10 — bajo el umbral 9,5. HOLD.** Metodología del
drafter sana (todo lo no respaldado va con TODO, sin deferrals
injustificados); el puntaje refleja pendientes de verificación, no
defectos de redacción.

## 3. Risk flags (severidad + acción correctiva)

### Severidad ALTA — bloquean publicación; YMYL legal/regulatorio directo

- **R1 — Atribución legal errónea vigente (eliminación Boletín).**
  Publicado L138 atribuye a Ley 20.575 el derecho a pedir eliminación del
  Boletín tras pago. La ficha interna `ley-20575-datos-comerciales.md`
  (`lastVerified: 2026-03-03`) confirma que la 20.575 regula solo el
  principio de finalidad, sin derecho de borrado. Candidatas reales:
  Ley 19.812 y/o cancelación Ley 19.628 (arts. 12–13). Artículo operativo
  exacto sin verificar (BCN pendiente).
  Acción: humano verifica en BCN, cita cláusula literal primero + glosa
  después, corrige blog y enlace `/leyes/`.
- **R2 — Flujo de heredero contradice fuente oficial.**
  Publicado L201 dice "presencial en la CMF"; dossier claim #3 (fetch
  literal CMF Educa) indica canal **CMF sin papel**. El draft adopta la
  versión oficial (correcto), pero la lista documental exacta sigue TODO.
  Acción: humano confirma requisitos/lista en canal CMF sin papel.
- **R3 — Cifra de desfase "10 y 20 días hábiles" sin fuente.**
  Publicado L108 + FAQ L187 la afirman sin cita; dossier claim #5
  confirma ausencia en la página CMF Educa (portal JS no extraíble).
  El draft la degrada a TODO (correcto).
  Acción: humano verifica en FAQ del portal conocetudeuda o retira la
  magnitud y conserva solo "puede traer desfase".
- **R4 — Prescripción art. 2515 CC sin cita literal.**
  Publicado L140 + draft L99–102: "5 años, desde última gestión, hay que
  alegarla". Plausible pero sin fetch BCN; matiz ordinaria/ejecutiva
  pendiente.
  Acción: humano cita texto literal BCN + matiz, o reduce el alcance de
  la afirmación.
- **R5 — "Consulta gratuita mínima por ley" sin base verificada.**
  Publicado L89/L148 la atribuye a Ley 20.575, sin respaldo en ficha
  interna ni fetch CMF.
  Acción: humano verifica base exacta (posible Ley 19.628 / DS 950) o
  retira la atribución.
- **R6 — Régimen de acceso de terceros sin fuente.**
  Publicado L194 ("ningún tercero sin tu autorización") + usos por
  arrendador/empleador. Régimen de mandato/autorización sin cita literal.
  Acción: humano verifica régimen de acceso + boundary Ley 20.575
  (finalidad) con cita BCN.

### Severidad MEDIA — bloquean publicación como TODO:SOURCE, menor riesgo interpretativo

- **R7 — "Gratis, ilimitado":** "ilimitado" sin respaldo literal.
  Acción: confirmar o retirar el adjetivo.
- **R8 — Vía "OS-9/PDI" ante suplantación:** OS-9 sin respaldo; canal
  vigente (PDI cibercrimen / reclamo CMF) por verificar.
- **R9 — Glosa directas/indirectas/castigos** sin respaldo Manual SI
  D10/D27 ni portal.
- **R10 — Alcance de entidades reportantes:** publicado lista "emisores
  de tarjetas y otras"; oficial dice "bancos y cooperativas" +
  "sujetas a fiscalización". Alcance exacto por verificar.
- **R11 — URL exacta del trámite de reclamo bancario:** el link actual
  resuelve a un hub verificado vivo, no al trámite. Deep-link por
  confirmar.
- **R12 — Requisitos de obtención de ClaveÚnica** (RUT + nº documento)
  sin verificación vigente.
- **R13 — Boundary Ley 21.680 (Registro de Deuda Consolidada) ausente:**
  el repo tiene ficha (`effective: 2024-07-01`, `relatedArticles`
  incluye este slug) y el draft no la nombra; riesgo de confusión
  Informe CMF vs RDC en el lector.
  Acción: humano verifica estado operativo del RDC y agrega línea
  boundary o justificación N/A en vigilancia.

### Severidad BAJA — proceso, no bloquea contenido pero exige acción al publicar

- **R14 — Frescura al publicar:** fecha de corte visible existe solo en
  la propuesta del draft; al publicar, actualizar `updatedDate`,
  `articleLead.validAsOf` y `reviewPolicy` con registro de cambio
  (NORMA_YMYL §5). Sin cambio de slug/título/frontmatter estructural.

**Conteo: 6 alta · 7 media · 1 baja = 14 flags.**

## 4. Verificación explícita de las 4 preguntas abiertas del drafter

1. **Desfase 10–20 días:** VERIFICADO COMO NO RESPALDADO. Confirmo que
   la cifra no está en el fetch CMF Educa (dossier #5) y que el publicado
   la afirma dos veces sin fuente. El TODO del draft es correcto.
   Bloquea publicación (R3).
2. **Base del derecho de eliminación (20.575 vs 19.812/19.628):**
   VERIFICADA LA ATRIBUCIÓN ERRÓNEA. El publicado atribuye a Ley 20.575
   un efecto que su propia ficha interna niega (finalidad ≠ borrado).
   La re-atribución candidata del draft (Ley 19.812 y/o cancelación
   Ley 19.628, coherente con ficha ley-19628 arts. 12–13) va en la
   dirección correcta pero sin artículo literal. Bloquea publicación (R1).
3. **Flujo heredero presencial vs CMF sin papel:** VERIFICADA LA
   DISCREPANCIA a favor de la fuente oficial. El publicado está
   desactualizado; el draft corrige bien el canal, falta la lista
   documental. Bloquea publicación en ese punto (R2).
4. **Citas LeyChile/BCN pendientes de chequeo manual:** VERIFICADO
   PENDIENTE. LeyChile bloquea fetch automático (documentado en dossier
   + `sources.yaml`); fichas internas (marzo 2026) son secundarias, no
   sustituyen cita literal. Toda cita legal del draft (2515, 19.812,
   19.628, 20.575-gratuidad) exige verificación humana con quote
   operativo literal. Bloquea publicación (R1, R4, R5, R6).

## 5. Disposición TODO:SOURCE — 12 marcados, 12 bloquean

| # | Marcador (draft §resumen) | Flag | Bloquea |
|---|---|---|---|
| 1 | Desfase de reporte | R3 | SÍ |
| 2 | "Ilimitado" | R7 | SÍ |
| 3 | Requisitos ClaveÚnica | R12 | SÍ |
| 4 | Documental de heredero | R2 | SÍ |
| 5 | Base de eliminación Boletín | R1 | SÍ |
| 6 | Base de consulta gratuita | R5 | SÍ |
| 7 | Cita art. 2515 + matiz | R4 | SÍ |
| 8 | Acceso de terceros | R6 | SÍ |
| 9 | URL reclamo bancario | R11 | SÍ |
| 10 | Vía OS-9/PDI | R8 | SÍ |
| 11 | Glosa directas/indirectas/castigos | R9 | SÍ |
| 12 | Alcance entidades reportantes | R10 | SÍ |

Regla de plan + pipeline: `TODO:SOURCE > 0` = HALT; packet final exige
`TODO:SOURCE = 0`. **Bloqueantes: 12/12.** (R13/R14 son hallazgos propios
de compliance, fuera del conteo del drafter.)

Deferral check (NORMA_YMYL §2.4): los únicos deferrals del draft
(reclamo ante acreedora/CMF, denuncia policial) son caso-dependientes =
  legítimos. Sin deferral de información fetcheable. Sin hallazgos de
  prompt-injection (dossier §Source Trust limpio; benchmarks no
  consultados; nada etiquetable `PROMPT_INJECTION_CANDIDATE`).

## 6. Separación de deberes

| Etapa | Agente / sesión |
|---|---|
| 01-brief, 02-dossier, 03-outline, 04-draft | Muse Spark (OpenCode), sesión 2026-09-16 (role lines en artefactos) |
| 05-math-audit | N/A justificado (`requires_calculation=false`, §1); nada producido |
| 06-compliance (este informe) | Sesión fresca 2026-09-16, sin contexto previo del draft; trabajo solo desde disco |
| 07-publish-packet + firma de gates | NO producido (prohibido para agentes); humano pendiente |

Sin violación de `SEPARATION_OF_DUTIES`: quien redactó no audita.

## 7. Escalación humana — obligatoria (`regulatory_sensitivity=alta`)

Solo un humano puede (Bucket A, no delegable):

1. Resolver los 12 TODO:SOURCE con verificación viva BCN/CMF/portal
   (fetches manuales + citas literales) y re-emitir el draft sin
   marcadores.
2. Decidir el boundary Ley 21.680/RDC (R13) y completar aprobado /
   vigencia / aplicación si aplica.
3. Firmar gates de `07-publish-packet.md` y la decisión de publicación;
   ningún agente puede marcar `[X]` ni producir el packet.
4. Actualizar `updatedDate` / `validAsOf` / `reviewPolicy` con registro
   de cambio al publicar (R14).
5. Si alguna verificación contradice al draft (p. ej. BCN niega la
   re-atribución R1), este informe escala a FAIL y exige re-auditoría
   en sesión fresca antes de cualquier packet.

## 8. Veredicto

**HOLD — CONDITIONAL. Publicación bloqueada** hasta: (a) `TODO:SOURCE =
0` con citas literales BCN/CMF, (b) boundary RDC resuelto, (c) firma
humana en packet. El draft es metodológicamente sólido y publicable en
principio una vez verificadas sus propias advertencias; el artículo
publicado vigente contiene mientras tanto al menos dos afirmaciones
incorrectas o sin respaldo (R1 atribución legal, R2 canal heredero, más
R3 cifra de desfase) que el refresh debe corregir antes de merge. No se
tocó `src/data/blog/**`, `src/config/*` ni código; no se produce `07`;
no se firma ningún gate.
