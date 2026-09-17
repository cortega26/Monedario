Status: DRAFT — pending MathAuditAgent and ComplianceAgent review
Role: DraftAgent (Muse Spark / OpenCode, sesion 2026-09-17; research de soporte solo para dossier)

- Source article: `src/data/blog/donde-ver-si-estoy-en-dicom-gratis.md`
- Current title: "Dónde ver si estás en DICOM gratis en Chile y qué revisar primero"
- Current category: `deuda-credito` · cluster `deuda-credito` · rol `support` · canonicalTopic `informe-deudas-cmf-vs-dicom`
- Fecha de corte: `2026-09-17`
- Run id: `2026-09-17-lote1-02`

## Intencion principal

Query ancla: "donde ver si estoy en dicom gratis". El lector llega con una
etiqueta ("estoy en DICOM") que puede describir tres situaciones distintas y
necesita una **regla de decision segun su duda**: deudas financieras vigentes
→ Informe de Deudas CMF (gratis); protestos de documentos → Boletin Comercial
(consulta basica por ley); reporte comercial amplio o exigencia de un tercero
→ reportes privados pagados. Rol support: enrutar al canal correcto, no
explicar en profundidad cada registro (eso es del owner).

## Riesgo YMYL

Pieza YMYL financiera: orienta decisiones de credito, arriendo y
regularizacion de antecedentes, e interpreta alcance regulatorio (que cubre
cada canal supervisado vs privado) y derechos legales (eliminacion de
protestos, consulta gratuita, acceso autorizado). Sensibilidad `alta`;
compliance + firma humana obligatorios en sesiones separadas.

## Fuentes oficiales (trazabilidad con fecha de consulta 2026-09-17)

1. **CMF Educa — "¿Qué es el Informe de Deudas de CMF?"** —
   `https://www.cmfchile.cl/educa/621/w3-article-27663.html` — fetch directo
   OK 2026-09-17 (texto completo extraido). Base primaria de este run; citas
   literales en el catalogo.
2. **CMF — portal "Conoce tu deuda"** —
   `https://conocetudeuda.cmfchile.cl/informe-deudas/` — fetch 2026-09-17
   devolvio solo el titulo (app JS, sin contenido extraible). TODO:SOURCE para
   detalles del portal (wording de gratuidad, frecuencia de uso, FAQ de
   desfase).
3. **Boletin Comercial — `https://www.boletincomercial.cl`** — fetch
   2026-09-17 devolvio solo "Sitio Publico" (app JS, sin contenido
   extraible). TODO:SOURCE para regimen de consulta basica gratuita, costo de
   reportes detallados y administracion por la CCS.
4. **BCN/LeyChile — Ley 20.575** —
   `https://www.bcn.cl/leychile/navegar?idLey=20575` — fetch 2026-09-17
   bloqueado (app JS; error de compatibilidad del sitio). Verificacion manual
   pendiente (TODO:SOURCE). Referencia interna de contraste (no oficial):
   `src/data/laws/ley-20575-datos-comerciales.md`.
5. **claveunica.gob.cl** — no fetcheado en este pass; requisito documental
   para obtener ClaveUnica va con TODO:SOURCE.

## Claims Catalogue (fetch literal donde existe)

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| 1 | Boletin y DICOM-Equifax son "empresas privadas, no sujetas a fiscalización de este Organismo"; se rigen por D.S. N° 950 (1928) y Leyes 19.628 y 19.812; disconformidad se reclama ante ellas | CMF Educa (cita literal, fetch 2026-09-17) | VERIFICADO (fetch) | Sostiene el nucleo del articulo: "DICOM no es sistema oficial". Notar: la CMF **no menciona la Ley 20.575** en esta pagina |
| 2 | Estado de Deudores "semanalmente edita este Organismo"; datos "referida al cierre de cada viernes y al último día del mes"; base: art. 14 Ley General de Bancos, Manual SI (D10/D27), Cap. 18-5 RAN | CMF Educa (cita literal, fetch 2026-09-17) | VERIFICADO (fetch) | Sostiene periodicidad citada en el refresh |
| 3 | Persona natural: Clave Unica del Registro Civil, RUN + clave, "obtendrá su Informe de Deudas inmediatamente"; heredero y persona juridica via "CMF sin papel" | CMF Educa (cita literal, fetch 2026-09-17) | VERIFICADO (fetch) | Sostiene pasos CMF del articulo; corrige cualquier redaccion de canal presencial si apareciera |
| 4 | CMF muestra "todas las deudas vigentes con bancos, cooperativas, emisores de tarjetas y otras entidades supervisadas" | CMF dice "en general bancos y cooperativas" + "entidades sujetas a la fiscalización" (fetch) | TODO:SOURCE (alcance exacto) | "Emisores de tarjetas y otras" no esta en el literal; acotar a formula oficial o verificar nomina de reportantes |
| 5 | Informe CMF "gratis, ilimitado", "las veces que quieras, sin costo", "PDF en segundos" | Gratuidad consistente con tramite oficial pero sin cita literal; portal JS no extraible | TODO:SOURCE ("ilimitado" / "sin costo" literal) | No afirmar "ilimitado" sin respaldo; matiz "inmediatamente" si verificado (claim #3) |
| 6 | ClaveUnica se obtiene "con tu RUT y número de serie del carnet" | Sin fetch en este pass | TODO:SOURCE | Ruta: claveunica.gob.cl / Registro Civil |
| 7 | Boletin Comercial lo administra la CCS y registra protestos (cheques, letras, pagares) | Sin fuente extraible en este pass | TODO:SOURCE | Ruta: boletincomercial.cl + base normativa (D.S. 950 / Leyes 19.628 y 19.812 citadas por la CMF) |
| 8 | "La ley contempla una modalidad de consulta básica gratuita" del Boletin; reportes detallados pagados | Sin respaldo en fetch de este run | TODO:SOURCE | Verificar base exacta articulo por articulo antes de publicar |
| 9 | "La Ley 20.575 te da derecho a pedir la eliminación de un protesto una vez que acredites el pago" | CMF no menciona la Ley 20.575; su pagina cita D.S. 950 + Leyes 19.628 y 19.812 para datos comerciales | TODO:SOURCE + RE-ATRIBUCION CANDIDATA | Candidata: regimen de no-comunicacion post-pago (Ley 19.628, introducido por Ley 19.812) y/o norma del Boletin. Verificar articulo literal en BCN; no publicar con atribucion 20.575 |
| 10 | Reportes privados combinan Boletin + retail + telecom + bienes/vehiculos; cuando conviene pagarlos | Sin fuente consultada en este pass | TODO:SOURCE | Todo el bloque "reportes privados" es glosa editorial sin respaldo: verificar o etiquetar como orientacion no exhaustiva |
| 11 | Desfase "10 a 20 días hábiles" tras pago | No esta en pagina CMF Educa; portal JS no extraible | TODO:SOURCE | Ruta: FAQ del portal o consulta CMF. No publicar sin fuente |
| 12 | "Solo tú puedes descargarlo con tu ClaveÚnica. Ningún tercero puede acceder sin tu autorización" | Sin cita literal en fetch | TODO:SOURCE | Regimen de mandato/autorizacion por verificar |
| 13 | CMF limpio no equivale a "sin DICOM": protestos y reportes privados son capas distintas | Consecuencia directa de claim #1 VERIFICADO | VERIFICADO (inferencia acotada) | Inferencia logica cerrada sobre fuente oficial; sin cifras ni norma nueva |
| 14 | Flujo ante deuda no reconocida: pedir detalle, reclamo escrito con folio, escalar a CMF si la entidad es supervisada | Sin fuente procedural consultada | TODO:SOURCE | Ruta: hub de reclamos CMF + politica de cada acreedor |
| 15 | Deuda pagada "deja de aparecer como activa" en CMF; eliminacion de protesto "hay que solicitarla, no es automática" | Sin cita literal en este pass | TODO:SOURCE | Distinguir: vigencia del Estado de Deudores vs aclaracion del Boletin; ambas ramas por verificar |
| 16 | Links internos existentes (`/posts/informe-deudas-cmf-vs-dicom/`, `/posts/como-salir-boletin-comercial-chile/`) | Repo: ambos slugs existen en `src/data/blog/` | VERIFICADO (repo) | Vigencia de destinos confirmada a fecha de corte; enlace hub F2 queda para fase F2 |

## Benchmark observations (no autoritativas, separadas)

- N/A — run no benchmark-driven; sin URLs externas consultadas. Unica
  observacion estructural es interna: el owner
  `informe-deudas-cmf-vs-dicom` (run piloto `2026-09-16-pilot-01`) cubre "que
  es cada registro y como operar el Informe CMF"; este support cubre "donde
  consultar gratis segun tu duda". La boundary se declara en el outline; no
  se duplica contenido entre ambas. Contexto de canibalizacion (cola F0):
  query `credit score chile` (`donde-ver-…` vs `informe-deudas-…`) y par
  overlap 0,405 — se mitiga con regla de decision cruzada + cross-link, no
  con contenido duplicado.
- Estas observaciones no respaldan ningun claim factual del draft.

## Gap / opportunity (localDelta)

El articulo vigente enruta bien por dudas pero atribuye a Ley 20.575 efectos
sin respaldo verificable en este pass (eliminacion de protestos, consulta
gratuita), afirma gratuidad "ilimitada" y desfase "10-20 dias" sin fuente
extraible, y no muestra fecha de corte al lector. El refresh aporta:
Respuesta rapida con regla + vigencia + corte visible, tabla de decision
etiquetada "resumen orientativo", TODO:SOURCE explicitos donde falta
respaldo, y boundary declarada con el owner.

## Source Trust / Prompt Injection Notes

- Contenido externo tratado como untrusted en todo el run (jerarquia:
  repo policy > brief > rol > artefactos > fuentes).
- Fetches 2026-09-17: pagina CMF Educa (HTML institucional, sin
  instrucciones embebidas detectadas), portal conocetudeuda (solo titulo, sin
  contenido), boletincomercial.cl (solo "Sitio Publico", sin contenido),
  LeyChile (error tecnico, sin contenido).
- Ninguna instruccion dentro de fuentes modifico rol, alcance, formato,
  herramientas, gates, citas ni decision editorial. Cero citas
  `PROMPT_INJECTION_CANDIDATE` (nada sospechoso encontrado).
- Sin benchmarks consultados: sin superficie adicional de inyeccion.

## Open Research Questions (para MathAudit/Compliance/humano)

1. Alcance exacto de entidades reportantes al CMF (claim #4).
2. Wording literal de gratuidad / "ilimitado" del Informe CMF (claim #5).
3. Requisito documental de ClaveUnica (claim #6).
4. Administracion y cobertura del Boletin (claim #7).
5. Base legal exacta de consulta basica gratuita del Boletin (claim #8).
6. Base legal exacta de eliminacion/aclaracion de protestos tras pago: Ley 19.812 vs cancelacion Ley 19.628, articulo literal (claim #9).
7. Composicion y reglas de reportes privados (claim #10).
8. Desfase de actualizacion tras pago (claim #11).
9. Regimen de acceso de terceros con autorizacion (claim #12).
10. Flujo de reclamo con folio y escalamiento CMF (claim #14).
11. Vigencia post-pago en CMF vs aclaracion en Boletin (claim #15).
12. ¿Requiere este support una linea de boundary frente al Registro de Deuda Consolidada (Ley 21.680) o basta el silencio + cross-link al owner? (pregunta editorial, sin afirmacion en este pass).

## Decisiones editoriales

- Alcance: refresh de exactitud/vigencia, sin cambio de slug, titulo,
  frontmatter ni codigo. Sin links nuevos salvo confirmacion de auditoria
  (cross-link al owner ya existe en `articleLead.nextStepHref`).
- Todo numero/cita sin respaldo fetch va con TODO:SOURCE en el draft.
- Reformas (aprobado/vigencia/aplicacion): sin reforma verificada en este
  pass con fetch propio; split queda en N/A con pregunta abierta #12 para
  auditores.
