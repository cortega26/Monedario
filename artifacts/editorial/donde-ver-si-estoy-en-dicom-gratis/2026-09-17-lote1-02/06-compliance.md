Status: CONDITIONAL — HOLD, publication blocked until TODO:SOURCE = 0 + human sign-off
Role: ComplianceAgent (fresh session 2026-09-17, zero prior draft context, adversarial)

Slug: `donde-ver-si-estoy-en-dicom-gratis` · run `2026-09-17-lote1-02` · corte `2026-09-17`
Brief: `regulatory_sensitivity=alta` · `requires_calculation=false`
Inputs read (disk only): plan mandate + Progress log,
`context/EDITORIAL_AI_PIPELINE.md` §§2-5 + §9,
`docs/editorial/NORMA_YMYL.md`, run folder completo
(`01-brief.yaml`, `02-dossier.md`, `03-outline.md`, `04-draft.md`,
`metadata.yaml`, `sources.yaml`), artículo vivo
(`src/data/blog/donde-ver-si-estoy-en-dicom-gratis.md`), artículo
owner (`src/data/blog/informe-deudas-cmf-vs-dicom.md` workdir),
fichas repo (`src/data/laws/ley-20575-datos-comerciales.md`,
`src/data/laws/ley-19628-proteccion-datos.md`,
`src/data/laws/ley-21680-registro-deuda-consolidada.md`), precedente
read-only (`.../informe-deudas-cmf-vs-dicom/2026-09-16-pilot-01/06-compliance.md`
+ `06-compliance-delta2.md`, mismo listón, verificación independiente).
No `05-math-audit.md` exists in the run folder (see §1).

Brief cross-check (mandato): `requires_calculation=false` CONFIRMADO
(§1, cero aritmética en el draft — no hay STOP por cálculo oculto);
`regulatory_sensitivity=alta` CONFIRMADO (interpreta alcance CMF,
derechos sobre protestos, acceso autenticado y uso por terceros en
decisiones de crédito/arriendo/contratación — §5 del pipeline exige
este informe + firma humana, pendiente y fuera de mi alcance).

## 1. Cálculo / math-audit — confirmación de `requires_calculation=false`

Barrido completo de `04-draft.md`: los únicos numerales son fechas
(`2026-09-17`, `17 de septiembre de 2026`), conteos editoriales
(`tres` canales, `12 TODO:SOURCE`) y citas normativas
(`19.628/19.812`, `D.S. N° 950`). El único grep numérico con
símbolos (`[0-9]+ ?(%|UF|$|×|*|+|÷|/)`) devuelve solo dígitos de
URL (`w3-article-27663`) y la mención `19.628/19.812` de T6
(cita, no cómputo). Sin operaciones, conversiones, fórmulas, topes
computados, ejemplos trabajados ni etiquetas tipo "7+3". La
declaración del brief (`false` + justificación que descarta la
heurística del scaffold) **coincide con el contenido del draft**.
`05-math-audit.md` = N/A justificado. Si se produjera un `05`
para este run-id, no debe inventar cálculos.

## 2. NORMA_YMYL scorecard (sobre el artefacto draft, no publicable)

| Dimensión (peso) | Puntaje /10 | Justificación |
|---|---|---|
| Respuesta ancla (35%) | 8,0 | Regla de decisión por duda concreta + excepciones + vigencia + corte visible + fuente CMF Educa. Descuento: "gratis" afirmado en el ancla sin cita literal (T2) y costos Boletín/privados pendientes (T5/T7). |
| Precisión + fuentes (25%) | 5,0 | 5 claims VERIFICADO por fetch CMF Educa (dossier #1-3, #13) + 1 VERIFICADO repo (links internos #16); 12 TODO:SOURCE honestos; cero citas literales BCN (LeyChile bloquea fetch, documentado). Insuficiente para publicar. |
| Vigencia + calendario (15%) | 7,5 | Corte visible propuesto; periodicidad semanal/cierre sourced; stub de vigilancia honesto (N/A). Descuento: Ley 21.680 (RDC) sin boundary decidida (R13, pregunta abierta del drafter). |
| Excepciones + cobertura (15%) | 7,0 | Buenos bordes (desfase, reclamo, suplantación sin sigla, "CMF limpio ≠ sin DICOM"). Descuento: fila arrendador/empleador sin boundary Ley 20.575 (R4). |
| Claridad + estructura (10%) | 8,5 | Regla-primero, tabla con etiqueta "resumen orientativo" + limitador, sin meta-proceso, boundary owner declarada. |

**Total ponderado: 7,1/10 — bajo el umbral 9,5. HOLD.**
Cálculo: 8,0×0,35 (2,80) + 5,0×0,25 (1,25) + 7,5×0,15 (1,13) +
7,0×0,15 (1,05) + 8,5×0,10 (0,85) = 7,08 ≈ **7,1/10**.
Metodología del drafter sana (todo lo no respaldado va con TODO,
sin deferrals injustificados, sin reproducir conclusiones del
piloto); el puntaje refleja pendientes de verificación, no
defectos de redacción.

## 3. Risk flags (severidad + acción correctiva)

### Severidad ALTA — bloquean publicación; YMYL legal/regulatorio directo

- **R1 — Atribución legal errónea vigente (eliminación Boletín).**
  Publicado L88 atribuye a Ley 20.575 el derecho a pedir
  eliminación del protesto tras pago. Verificación independiente:
  `rg "19.628|19.812"` en el artículo vivo = 0; única mención
  "20.575" = L88; ficha interna `ley-20575-datos-comerciales.md`
  confirma que la 20.575 regula solo principio de finalidad, sin
  derecho de borrado (mismo listón que piloto R1/delta2 §6-R1).
  El draft lo degrada a TODO T6 con re-atribución candidata
  (no-comunicación post-pago 19.628/vía 19.812) — dirección
  correcta, artículo literal sin verificar.
  Acción: humano verifica en BCN, cita cláusula literal primero +
  glosa después, corrige L88 y enlace `/leyes/`.
- **R2 — "Consulta básica gratuita por ley" sin base verificada.**
  Publicado L86 ("La ley contempla una modalidad de consulta
  básica gratuita") + tabla L105 ("Gratuito básico") sin cita;
  dossier claims #7-8 confirman fetch Boletín no extraíble.
  El draft lo degrada a TODO T5 (correcto), pero la tabla del
  draft L134 repite "Por verificar (T5)" como celda de costo —
  aceptable en draft, impublicable así.
  Acción: humano verifica base exacta artículo por artículo
  (posible Ley 19.628 / D.S. 950) o retira la atribución legal y
  deja solo modalidad de servicio verificada en el sitio.
- **R3 — Cifra de desfase "10 a 20 días hábiles" sin fuente.**
  Publicado L124 la afirma sin cita; dossier claim #11 confirma
  ausencia en CMF Educa y portal JS no extraíble (mismo listón
  que piloto R3/delta2 §2). El draft la degrada a TODO T9
  (correcto) y conserva solo lo sourced (semanal + cierre
  viernes/fin de mes).
  Acción: humano verifica en FAQ del portal conocetudeuda o
  retira la magnitud; no publicar el rango sin fuente primaria.
- **R4 — Régimen de terceros + fila arrendador/empleador sin
  boundary Ley 20.575.**
  Publicado L127 ("Ningún tercero puede acceder sin tu
  autorización") + L107/L92 (empleador que pide "DICOM" como
  flujo normal). Draft T10 TODOea el régimen, pero la tabla del
  draft L136 ("El arrendador o empleador me pide DICOM → El que
  te exijan") y el FAQ de arriendo L180-184 normalizan el pedido
  del empleador sin el carve-out que el listón delta2 exige a
  nivel de inciso: la ficha 20.575 prohíbe el uso en selección
  laboral (art. 2.°; principio de finalidad art. 1.°). El outline
  prometía "sin afirmaciones sobre uso laboral" — la tabla lo
  incumple por implicación.
  Acción: humano verifica régimen de mandato/autorización con
  cita BCN y agrega boundary explícita (prohibición uso laboral
  Ley 20.575, con inciso) o retira "empleador" de la fila.

### Severidad MEDIA — bloquean publicación como TODO:SOURCE

- **R5 — Alcance de entidades reportantes (T1).** Publicado L65
  lista "emisores de tarjetas y otras"; el literal oficial según
  dossier #4 dice "en general bancos y cooperativas" +
  "entidades sujetas a fiscalización". El draft lo acota con T1
  (correcto). Acción: acotar a fórmula oficial o verificar
  nómina de reportantes.
- **R6 — Wording literal de gratuidad (T2).** "Gratis" es
  consistente con el trámite oficial pero sin cita literal;
  "las veces que quieras, sin costo" / "ilimitado" sin respaldo.
  Nota positiva verificada: el draft NO afirma "ilimitado" en
  el cuerpo (solo lo nombra en T2 para prohibirlo) — mejor que
  el publicado L63/L76. Acción: confirmar literal del portal o
  retirar adjetivos de frecuencia.
- **R7 — Requisito documental ClaveÚnica (T3).** Publicado L78
  ("número de serie del carnet") sin fetch; draft lo TODOea
  inline (correcto). Acción: verificar en claveunica.gob.cl /
  Registro Civil.
- **R8 — Cobertura/administración Boletín (T4).** Publicado L82
  (CCS + definición protestos) sin fuente extraíble; draft lo
  TODOea (correcto). Acción: verificar en boletincomercial.cl +
  base normativa (D.S. 950 / 19.628 / 19.812 citadas por la CMF).
- **R9 — Composición reportes privados (T7).** Publicado L92
  (Boletín + retail + telecom + bienes/vehículos) sin fuente;
  bloque draft L106-111 íntegramente TODO (correcto).
  Acción: verificar por emisor o etiquetar como orientación no
  exhaustiva explícita.
- **R10 — Flujo reclamo con folio + escalamiento CMF (T8).**
  Publicado L117 afirma folio y escalamiento directo sin fuente
  procedural; draft lo TODOea y evita sigla policial
  (correcto). Acción: verificar en hub de reclamos CMF +
  política de acreedores.
- **R11 — Calificación "probablemente" (T11).** Draft FAQ
  L180-184: antecedente "probablemente" en reporte privado.
  Glosa editorial de descarte sin fuente; marcada T11
  (correcto). Acción: verificar o suavizar a ruta de descarte
  explícita sin adverbio probabilístico.
- **R12 — Reglas de eliminación por tipo (T12 resto).** Draft
  FAQ L187-189 TODOea las tres ramas (CMF deja de aparecer /
  protesto requiere solicitud / privados por emisor); rama
  protesto subsumida en R1-ALTA. Acción: cita literal por rama
  o reducir alcance de la respuesta.
- **R13 — Boundary Ley 21.680 / RDC sin decidir.** El draft
  (L198-206) deja N/A + pregunta abierta a auditores (dossier
  Q12); el owner ya trae boundary RDC (L92, autoinfo CMF).
  Riesgo de confusión Informe CMF vs RDC ante "CMF limpio".
  Acción: humano decide — una línea de boundary con cross-link
  al owner, o justificación N/A registrada. Severidad media por
  precedente piloto R13.

### Severidad BAJA — proceso, exigen acción al publicar

- **R14 — Frescura al publicar.** Corte visible solo propuesto
  en draft; al publicar actualizar `updatedDate`,
  `articleLead.validAsOf` y `reviewPolicy` con registro de
  cambio (NORMA_YMYL §5). Sin cambio de slug/título/frontmatter
  estructural. `sources.yaml` del run sigue plantilla vacía
  (0 entradas válidas — el gate estricto lo exige); poblar al
  resolver TODOs. `metadata.yaml` trae agentes "pending-*"
  (stale del scaffold; las role lines reales están en los
  artefactos).
- **R15 — Nota "resumen orientativo" genérica.** La tabla de
  decisión trae etiqueta + limitador (cumple), pero el texto es
  más breve que la nota canónica de NORMA_YMYL §3.2. Aceptable
  para tabla de enrutamiento (no es síntesis de impacto por
  causal); mejora opcional al publicar, no bloqueante.

**Conteo: 4 alta · 9 media · 2 baja = 15 flags.**

## 4. Paridad con el listón piloto (verificación independiente)

| Claim piloto | Estado en este run | Veredicto propio |
|---|---|---|
| Atribuciones 19.628 (eliminación art. 18 inc. 2.°, 7+3 art. 19) | El draft NO afirma ninguna: T6 propone re-atribución como candidata sin artículo literal; sin "7+3" en todo el draft (`rg` = 0) | Paridad OK: el drafter no copió las conclusiones del piloto (brief nonCopyBoundaries acatado); todo pendiente va con TODO |
| Canal heredero (CMF sin papel) | N/A en esta pieza: el vivo no trae flujo de heredero; el draft no detalla ninguno (outline lo cita como borde del owner) | Sin defecto; cobertura del owner, no duplicar (boundary §6) |
| Regla de desfase (lag rule) | Vivo L124 afirma "10 a 20 días hábiles" sin fuente; draft T9 lo TODOea y conserva solo weekly+cierre sourced | Mismo listón que delta2 §2 aplicado: R3 bloquea hasta verificar o retirar |
| Carve-out empleador (20.575 inc. 3.°) | Vivo L107 y draft L136 listan "empleador" sin boundary; ficha 20.575 prohíbe uso en selección (art. 2.°) | R4-ALTA: exige cita a nivel de inciso o retiro de "empleador" (listón delta2 §3) |

## 5. Disposición TODO:SOURCE — 12 marcados, 12 bloquean

`rg -c TODO:SOURCE 04-draft.md` = 16 ocurrencias de 12
marcadores distintos (T1-T12; el resumen y la línea de fuentes
los re-mencionan). Tabla uno por uno:

| # | Marcador (draft) | Flag | Bloquea |
|---|---|---|---|
| T1 | Nómina exacta de reportantes | R5 | SÍ |
| T2 | Wording literal gratuidad/frecuencia | R6 | SÍ |
| T3 | Documental ClaveÚnica | R7 | SÍ |
| T4 | Boletín cobertura/admin CCS | R8 | SÍ |
| T5 | Consulta básica + costos Boletín | R2 | SÍ |
| T6 | Eliminación protestos (re-atrib. 19.628/19.812) | R1 | SÍ |
| T7 | Composición reportes privados | R9 | SÍ |
| T8 | Reclamo folio + escalamiento CMF | R10 | SÍ |
| T9 | Desfase "10 a 20 días hábiles" | R3 | SÍ |
| T10 | Acceso terceros/autorización | R4 | SÍ |
| T11 | Calificación "probablemente" | R11 | SÍ |
| T12 | Eliminación por tipo de antecedente | R1/R12 | SÍ |

Regla de plan + pipeline: `TODO:SOURCE > 0` = HALT; packet
final exige `TODO:SOURCE = 0`. **Bloqueantes: 12/12.**
(R13/R14/R15 son hallazgos propios de compliance, fuera del
conteo del drafter.)

Deferral check (NORMA_YMYL §2.4): los únicos deferrals del
draft (reclamo ante acreedora/CMF caso-individual con T8;
denuncia policial sin sigla; derivaciones a owners del mismo
cluster con slugs verificados en repo) son legítimos. Sin
deferral de información fetcheable: todo valor concreto sin
fuente va con TODO:SOURCE, no con "consulta la web".
Prompt-injection: dossier §Source Trust limpio (página CMF
institucional sin instrucciones embebidas; portales JS sin
contenido; LeyChile con error técnico); `rg` de patrones de
instrucción en el draft = 0. Nada etiquetable
`PROMPT_INJECTION_CANDIDATE`. Benchmarks no consultados: sin
superficie adicional.

## 6. Boundary support vs owner (no duplicación, no canibalización)

- Roles declarados y consistentes: vivo `topicRole: support`,
  `canonicalTopic: informe-deudas-cmf-vs-dicom`; owner vivo
  `topicRole: owner` del mismo canonical. Sin double-owner.
- División real: el support enruta ("dónde consultar gratis
  según tu duda", regla de 3 + tabla de decisión); el owner
  opera y profundiza (qué es cada registro, paso a paso CMF,
  lectura de secciones directas/indirectas/castigos,
  permanencia, prescripción, RDC boundary, heredero, reclamo
  con URL). El draft reproduce el mínimo operativo para
  enrutar (3 pasos CMF a nivel titular) sin copiar la
  profundidad del owner — solape funcional, no duplicación.
- Omisiones correctas del support (del owner, no se reproducen):
  prescripción 2514/2515, glosa castigos, detalle heredero,
  lectura de secciones, RDC operativo. Verificado por `rg`
  (prescripci/heredero/OS-9/RDC = 0 en cuerpo del draft salvo
  meta-pregunta abierta).
- Cross-links bidireccionales verificados en disco: support
  `articleLead.nextStepHref` → `/posts/informe-deudas-cmf-vs-dicom/`;
  owner `nextStepHref` → `/posts/donde-ver-si-estoy-en-dicom-gratis/`;
  draft deriva a ambas guías sin reproducirlas. Queries
  distintas (owner: qué es cada registro; support: dónde ver
  gratis según duda); overlap 0,405 conocido mitigado con regla
  cruzada. Sin cambio de slug/título.
- Brecha a cerrar al remediar: la fila arrendador/empleador
  (R4) y la boundary RDC (R13) deben resolverse en espejo con
  el owner (que ya trae inciso 20.575 y línea RDC), sin copiar
  su texto operativo.

**Boundary: GENUINA con dos reparos menores (R4, R13) que no
la invalidan pero bloquean publicación hasta resolverse.**

## 7. Separación de deberes

| Etapa | Agente / sesión |
|---|---|
| 01-brief, 02-dossier, 03-outline, 04-draft | Muse Spark (OpenCode), sesión 2026-09-17 (role lines en artefactos) |
| 05-math-audit | N/A justificado (`requires_calculation=false`, §1); nada producido |
| 06-compliance (este informe) | Sesión fresca 2026-09-17, sin contexto previo del draft; trabajo solo desde disco |
| 07-publish-packet + firma de gates | NO producido (prohibido para agentes); humano pendiente |

Sin violación de `SEPARATION_OF_DUTIES`: quien redactó no
audita. `sources.yaml`/`metadata.yaml` con valores de scaffold
pendientes (R14) no implican coautoría de auditoría.

## 8. Escalación humana — obligatoria (`regulatory_sensitivity=alta`)

Solo un humano puede (Bucket A, no delegable):

1. Resolver los 12 TODO:SOURCE con verificación viva y citas
   literales (cláusula primero, glosa después):
   - CMF Educa `https://www.cmfchile.cl/educa/621/w3-article-27663.html`
     (alcance reportantes T1; gratuidad T2).
   - Portal `https://conocetudeuda.cmfchile.cl/informe-deudas/`
     (wording gratuidad/frecuencia T2; desfase T9; terceros T10).
   - `https://www.boletincomercial.cl` (cobertura/admin T4;
     consulta básica y costos T5).
   - BCN `https://www.bcn.cl/leychile/navegar?idLey=20575`
     (confirmar que 20.575 NO funda borrado ni consulta
     gratuita; carve-out empleador T10/R4 a nivel de inciso).
   - BCN Ley 19.628 / Ley 19.812 / D.S. 950 (re-atribución
     eliminación T6/T12; base consulta T5).
   - `https://www.claveunica.gob.cl` (documental T3).
   - Hub reclamos CMF + política acreedores (folio T8);
     reglas por emisor privado (T7).
2. Decidir boundary RDC (R13) y fila empleador (R4) en espejo
   con el owner ya publicado.
3. Re-emitir el draft con `TODO:SOURCE = 0` y poblar
   `sources.yaml` con fecha de recupero por fuente.
4. Firmar gates de `07-publish-packet.md` y la decisión de
   publicación; ningún agente puede marcar `[X]` ni producir
   el packet.
5. Actualizar `updatedDate` / `validAsOf` / `reviewPolicy` con
   registro de cambio al publicar (R14).
6. Si alguna verificación contradice al draft (p. ej. BCN
   niega la re-atribución T6 o no existe consulta básica
   gratuita), este informe escala a FAIL y exige re-auditoría
   en sesión fresca antes de cualquier packet.

## 9. Veredicto

**CONDITIONAL — HOLD. Publicación bloqueada** hasta: (a)
`TODO:SOURCE = 0` con citas literales BCN/CMF/portales,
(b) boundary empleador Ley 20.575 a nivel de inciso (R4),
(c) boundary RDC decidida (R13), (d) firma humana en packet.
El draft es metodológicamente sólido y publicable en principio
una vez verificadas sus propias advertencias; el artículo
publicado vigente contiene mientras tanto al menos tres
afirmaciones incorrectas o sin respaldo (R1 atribución 20.575,
R3 cifra de desfase, R2 consulta gratuita + R4 régimen de
terceros) que el refresh debe corregir antes de merge. No
CONDITIONAL por ausencia de errores presentados como
verificados en el draft (cero ERRORs nuevos; TODOs honestos) —
pero cualquier contradicción en la verificación humana lo
convierte en FAIL. No se tocó `src/data/blog/**`,
`src/config/*` ni código; no se produce `07`; no se firma
ningún gate.
