Status: DRAFT — pending MathAuditAgent and ComplianceAgent review
Role: DraftAgent (Muse Spark / OpenCode, sesion 2026-09-17)

Slug: `donde-ver-si-estoy-en-dicom-gratis` · run `2026-09-17-lote1-02` · corte `2026-09-17`
Rol: support de `informe-deudas-cmf-vs-dicom` (mismo canonicalTopic)

## Respuesta ancla

- Regla concreta: no existe un solo boton oficial que diga "estas en DICOM".
  Separa tu duda en tres: **deudas financieras vigentes** → Informe de
  Deudas CMF (gratis, ClaveUnica, inmediato); **protestos de documentos** →
  Boletin Comercial (consulta basica por ley); **reporte comercial amplio o
  exigencia de un tercero** → reporte privado pagado.
- Excepciones: CMF no cubre morosidades fuera del sistema supervisado ni
  protestos por si solos; Boletin/privados no muestran tu deuda bancaria
  vigente.
- Vigencia: regla vigente a la **fecha de corte 2026-09-17**; datos CMF al
  cierre del viernes anterior / fin de mes (fuente: CMF Educa, fetch
  2026-09-17).
- Fuente: CMF Educa `w3-article-27663.html` + TODO:SOURCE para ramas Boletin
  y privados (dossier claims #7-10).

## Diferenciacion visible (localDelta)

- H1 se mantiene (sin cambio de slug/titulo). La diferenciacion esta en el
  paquete de respuesta: bloque **"Respuesta rapida"** primero con regla de
  decision por duda + vigencia + fecha de corte visible; tabla de decision
  "¿que quieres saber? → reporte correcto" etiquetada **"Resumen
  orientativo"**; y correccion de atribuciones legales con TODO:SOURCE.
- **Linea de diferenciacion vs el owner:** este support responde *"donde
  consultar gratis segun tu duda"*; el owner `informe-deudas-cmf-vs-dicom`
  responde *"que es cada registro y como operar el Informe CMF"*. El
  cross-link al owner ya existe (`articleLead.nextStepHref`); este refresh no
  reproduce su contenido operativo.
- **Boundary statement (rol support):** ninguna seccion de este refresh
  explica en profundidad el Informe CMF (periodicidad fina, lectura de
  secciones, permanencia, prescripcion); ante esa necesidad el lector se
  deriva al owner. Overlap conocido 0,405 y query canibalizada `credit score
  chile` se mitigan con decision cruzada, no con duplicacion.
- Sin benchmark externo: diferenciacion 100% local, sin superficie de copia.

## Secciones (intencion + fuente dossier)

1. **Respuesta rapida** — regla por duda + excepciones + vigencia + corte
   visible. Fuente: dossier claims #1-3, #13.
2. **El problema con buscar "DICOM gratis"** — DICOM = producto comercial de
   empresa privada, no sistema estatal (CMF Educa, claim #1 VERIFICADO).
3. **Los tres canales y como acceder** — CMF paso a paso (claims #3, #5 con
   TODO:SOURCE en "ilimitado"); Boletin con TODO:SOURCE (claims #7-9);
   privados con TODO:SOURCE (claim #10).
4. **Tabla de decision "¿que quieres saber?"** — sintesis con etiqueta
   "Resumen orientativo" + limitador. Fuente: claim #1 + TODO:SOURCE por
   celda de costo.
5. **Que hacer despues de revisar** — cuatro ramas (ordenar / salida formal /
   reclamo / CMF limpio) con TODO:SOURCE procedural (claims #14-15) y
   desfase TODO:SOURCE (claim #11).
6. **FAQ** — desfase, terceros, "CMF limpio ≠ sin DICOM" (claim #13
   VERIFICADO-inferencia), arriendo, eliminacion con re-atribucion
   TODO:SOURCE (claim #9).
7. **Vigilancia normativa (stub)** — sin reforma verificada con fetch propio
   en este pass; split aprobado/vigencia/aplicacion en N/A; pregunta abierta
   a auditores sobre boundary RDC (dossier pregunta #12).

## Excepciones y casos borde a cubrir

- Deuda pagada que sigue apareciendo (desfase TODO:SOURCE #11).
- Producto no reconocido / suplantacion: reclamo con folio + escalamiento
  TODO:SOURCE (#14); denuncia sin sigla afirmada.
- Heredero / persona juridica: solo via CMF sin papel (claim #3
  VERIFICADO); lista documental con TODO:SOURCE si se detalla.
- Terceros (arrendador/empleador) que piden "DICOM": enrutar a reporte
  privado o Boletin segun lo exigido; acceso al CMF con autorizacion
  TODO:SOURCE (#12); sin afirmaciones sobre uso laboral/arrendador.
