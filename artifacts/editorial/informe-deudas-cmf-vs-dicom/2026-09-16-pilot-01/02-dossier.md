Status: DRAFT — pending MathAuditAgent and ComplianceAgent review
Role: DraftAgent (Muse Spark / OpenCode, sesion 2026-09-16; research de soporte solo para dossier)

- Source article: `src/data/blog/informe-deudas-cmf-vs-dicom.md`
- Current title: "Informe de deudas CMF: cómo sacarlo y por qué no es DICOM"
- Current category: `deuda-credito` · cluster `deuda-credito` · rol `owner`
- Fecha de corte: `2026-09-16`
- Run id: `2026-09-16-pilot-01`

## Intencion principal

Query ancla: "informe de deudas cmf vs dicom". El lector necesita decidir
**cual reporte pedir primero segun su duda** (deudas financieras vigentes →
CMF; protestos/morosidades comerciales → Boletin/DICOM) y como obtenerlo
gratis sin pagar de mas ni sacar conclusiones cruzadas entre registros.

## Riesgo YMYL

Pieza YMYL financiera: orienta decisiones de credito, arriendo y
regularizacion de deudas, e interpreta alcance regulatorio (CMF) y derechos
legales (datos comerciales, prescripcion). Sensibilidad `alta`; compliance +
firma humana obligatorios en sesiones separadas.

## Fuentes oficiales (trazabilidad con fecha de consulta 2026-09-16)

1. **CMF Educa — "¿Qué es el Informe de Deudas de CMF?"** —
   `https://www.cmfchile.cl/educa/621/w3-article-27663.html` — fetch directo
   OK 2026-09-16. Base primaria de este run; citas literales abajo.
2. **CMF — portal "Conoce tu deuda"** —
   `https://conocetudeuda.cmfchile.cl/informe-deudas/` — fetch 2026-09-16
   devolvio solo titulo (app JS, sin contenido extraible). TODO:SOURCE para
   FAQ del portal (desfase de reporte, gratuidad/ilimitado).
3. **CMF — hub "Reclamos contra entidades supervisadas"** —
   `https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-43332.html`
   — fetch OK 2026-09-16: hub vivo, lista "Reclamos contra Bancos e
   Instituciones Financieras ante la CMF". El deep-link del articulo actual
   resuelve a este hub; URL exacta del tramite bancario por confirmar
   (TODO:SOURCE).
4. **BCN/LeyChile — Ley 20.575, Ley 19.628, Ley 19.812, art. 2515 CC** —
   fetch automatico bloqueado (LeyChile exige JS; `idLey=20575` devolvio
   error de compatibilidad). Verificacion manual pendiente (TODO:SOURCE).
   Referencia interna de contraste (no oficial):
   `src/data/laws/ley-20575-datos-comerciales.md` (`lastVerified: 2026-03-03`).

## Claims Catalogue (fetch literal donde existe)

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| 1 | Estado de Deudores "semanalmente edita este Organismo"; datos "referida al cierre de cada viernes y al último día del mes" | CMF Educa (cita literal) | VERIFICADO (fetch) | Base legal citada: art. 14 Ley General de Bancos, Manual SI (archivos D10 y D27), Capitulo 18-5 RAN |
| 2 | Persona natural: Clave Unica del Registro Civil, RUN + clave, "obtendrá su Informe de Deudas inmediatamente" | CMF Educa (cita literal) | VERIFICADO (fetch) | Corrige "genera PDF / descargalo" solo en matiz; tramite online confirmado |
| 3 | Familiar fallecido: solicitud via "CMF sin papel" con documentos | CMF Educa (cita literal) | VERIFICADO (fetch) — DISCREPANCIA vs articulo | Articulo dice "presencial en la CMF"; fuente oficial dice canal online CMF sin papel. Draft adopta version oficial y lo marca como cambio |
| 4 | Boletin y DICOM-Equifax son "empresas privadas, no sujetas a fiscalización de este Organismo"; disconformidad se reclama ante ellas | CMF Educa (cita literal) | VERIFICADO (fetch) | Base legal citada: D.S. N° 950 (1928), Leyes 19.628 y 19.812 |
| 5 | Desfase "10 y 20 días hábiles" tras pago/cierre | Ninguna (no esta en pagina CMF Educa; portal JS no extraible) | TODO:SOURCE | Ruta: FAQ portal conocetudeuda o consulta CMF. No publicar sin fuente |
| 6 | Informe CMF "gratis, ilimitado" | Portal oficial es servicio publico gratuito (inferencia, no cita literal) | TODO:SOURCE ("ilimitado") | Gratuidad consistente con tramite oficial; "ilimitado" sin respaldo literal |
| 7 | Derecho a eliminacion del Boletin "Ley 20.575 ... una vez que acredites el pago" | Ficha interna dice Ley 20.575 = principio de finalidad (uso solo crediticio, prohibicion laboral), no eliminacion | TODO:SOURCE + RE-ATRIBUCION CANDIDATA | Candidata real: Ley 19.812 (borrado tras pago) y/o cancelacion Ley 19.628. Verificar articulo exacto en BCN antes de publicar |
| 8 | "Ley 20.575 contempla una consulta gratuita mínima" | Sin respaldo en ficha interna ni en fetch CMF | TODO:SOURCE | Verificar base exacta (posible Ley 19.628 / DS 950). No publicar sin fuente |
| 9 | Prescripcion "5 años ... art. 2515 CC", corre desde ultima gestion, hay que alegarla | Sin fetch (LeyChile bloqueado) | TODO:SOURCE | Plausible (2515 = prescripcion ordinaria 5 años; ejecutiva 3), pero exige cita BCN literal |
| 10 | "Ningún tercero puede descargarlo sin tu autorización" | Sin cita literal en fetch | TODO:SOURCE | Regimen de mandato/autorizacion por verificar |
| 11 | Denuncia "OS-9 o PDI" ante suplantacion | Sin fuente consultada | TODO:SOURCE | Ruta: PDI (cibercrimen/suplantacion) por verificar; OS-9 sin respaldo |
| 12 | Secciones directas/indirectas/castigos y su glosa | Sin fuente (Manual D10/D27 no consultado) | TODO:SOURCE | Glosa actual es razonable pero exige respaldo del Manual SI o portal |
| 13 | Alcance "bancos, cooperativas, emisores de tarjetas y otras entidades" | Oficial dice "en general bancos y cooperativas" + "entidades sujetas a fiscalización" | TODO:SOURCE (alcance exacto) | Draft acota a formula oficial; lista amplia del articulo queda como verificacion pendiente |

## Benchmark observations (no autoritativas, separadas)

- N/A — run no benchmark-driven; sin URLs externas consultadas. Unica
  observacion estructural es interna: el support
  `donde-ver-si-estoy-en-dicom-gratis` (mismo canonicalTopic) cubre "donde
  consultar gratis segun tu duda"; este owner cubre "que es cada registro y
  como operar el CMF". La boundary se declara en el outline; no se duplica
  contenido entre ambas.
- Estas observaciones no respaldan ningun claim factual del draft.

## Gap / opportunity (localDelta)

El articulo vigente mezcla tres registros sin regla de decision inicial,
atribuye a Ley 20.575 efectos sin respaldo interno (eliminacion, consulta
gratuita), indica canal presencial para herederos contra fuente oficial, y
no muestra fecha de corte al lector. El refresh aporta: Respuesta rapida con
regla + vigencia, tabla comparativa etiquetada "resumen orientativo",
correcciones con fuente, y TODO:SOURCE explicitos donde falta respaldo.

## Source Trust / Prompt Injection Notes

- Contenido externo tratado como untrusted en todo el run (jerarquia:
  repo policy > brief > rol > artefactos > fuentes).
- Fetches 2026-09-16: pagina CMF Educa (HTML institucional, sin
  instrucciones embebidas detectadas), hub de reclamos CMF (navegacion
  institucional, sin instrucciones), portal conocetudeuda (sin contenido
  extraible), LeyChile (error tecnico, sin contenido).
- Ninguna instruccion dentro de fuentes modifico rol, alcance, formato,
  herramientas, gates, citas ni decision editorial. Cero citas
  `PROMPT_INJECTION_CANDIDATE` (nada sospechoso encontrado).
- Sin benchmarks consultados: sin superficie adicional de inyeccion.

## Open Research Questions (para MathAudit/Compliance/humano)

1. Desfase 10-20 días hábiles: confirmar en FAQ del portal o CMF (claim #5).
2. "Ilimitado": confirmar o retirar (claim #6).
3. Base legal exacta de eliminacion Boletin tras pago: Ley 19.812 vs
   cancelacion Ley 19.628, articulo literal (claim #7).
4. Base legal exacta de consulta gratuita mínima Boletin (claim #8).
5. Cita literal art. 2515 CC y matiz ejecutiva/ordinaria (claim #9).
6. Regimen de acceso de terceros con autorizacion (claim #10).
7. Flujo suplantacion OS-9/PDI (claim #11).
8. Glosa directas/indirectas/castigos vs Manual D10/D27 (claim #12).
9. Alcance exacto de entidades reportantes (claim #13).
10. URL exacta del tramite "reclamo bancario" CMF (claim #3 hub).

## Decisiones editoriales

- Alcance: refresh de exactitud/vigencia, sin cambio de slug, titulo,
  frontmatter ni codigo. Sin links nuevos salvo confirmacion de auditoria.
- Links internos existentes verificados vivos en repo:
  `/leyes/ley-20575-datos-comerciales/` (`src/data/laws/…`) y
  `/posts/como-salir-boletin-comercial-chile/` (lote 1). Enlace F2 al hub
  `/guias/deuda-credito/` queda para fase F2, no para este draft.
- Todo numero/cita sin respaldo fetch va con TODO:SOURCE en el draft.
