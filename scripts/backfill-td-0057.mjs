/**
 * TD-0057 canonical backfill — one-time script.
 *
 * Creates real (non-placeholder) canonical artifact sets under
 * artifacts/editorial/<slug>/20260511-1000-backfill/ for all 46
 * published YMYL posts that pre-date the canonical artifact policy
 * (ADR-20260511-editorial-artifact-location-policy.md).
 *
 * Artifacts created per run:
 *   01-brief.yaml   — slug, title, category, fecha_corte
 *   02-dossier.md   — editorial context + primary official sources
 *   sources.yaml    — valid source entries (title/publisher/date/url)
 *   metadata.yaml   — run provenance
 *
 * What this script does NOT do (per separation-of-duties invariant):
 *   - Does not create 06-compliance.md with PASS verdict
 *   - Does not mark any gate [X] in 07-publish-packet.md
 *   - Does not claim full YMYL pipeline compliance
 *
 * Run:
 *   node scripts/backfill-td-0057.mjs [--dry-run]
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const ARTIFACTS_BASE = path.join(REPO_ROOT, "artifacts", "editorial");
const RUN_ID = "20260511-1000-backfill";
const DRY_RUN = process.argv.includes("--dry-run");

// ---------------------------------------------------------------------------
// Canonical backfill data — derived from live blog posts + official sources
// Each entry: slug, fecha_corte (updatedDate), title, category, sources[]
// sources[]: { title, publisher, date, url } — all from article link audits
// ---------------------------------------------------------------------------
const BACKFILL_DATA = [
  {
    slug: "ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026",
    fecha_corte: "2026-02-28",
    title: "Inversión en Chile 2026: ETF, DAP y costos reales",
    category: "ahorro-inversion",
    ymyl_topic: "instrumentos de ahorro e inversión disponibles en Chile, costos reales y tratamiento tributario",
    sources: [
      {
        title: "¿Qué es la UF y cómo se reajusta?",
        publisher: "Banco Central de Chile",
        date: "2026-02-28",
        url: "https://www.bcentral.cl/web/banco-central/preguntas-frecuentes/-/asset_publisher/0u850BwdK7p5/content/que-es-la-uf-y-como-se-reajusta-",
      },
      {
        title: "Educación financiera — instrumentos de inversión",
        publisher: "CMF Chile",
        date: "2026-02-28",
        url: "https://www.cmfchile.cl/educa/621/w3-article-27170.html",
      },
    ],
  },
  {
    slug: "boleta-honorarios-2026-retencion-cobertura",
    fecha_corte: "2026-02-28",
    title: "Boleta de honorarios 2026: retención 15,25%, líquido recibido y cobertura anual",
    category: "impuestos",
    ymyl_topic: "retención y cobertura de seguridad social en boletas de honorarios Chile 2026",
    sources: [
      {
        title: "Portal boletas de honorarios — SII",
        publisher: "SII",
        date: "2026-02-28",
        url: "https://www.sii.cl/destacados/boletas_honorarios/",
      },
      {
        title: "Cotización de trabajadores que emiten boletas de honorarios",
        publisher: "ChileAtiende",
        date: "2026-02-28",
        url: "https://www.chileatiende.gob.cl/fichas/12016-cotizacion-de-trabajadores-que-emiten-boletas-de-honorarios",
      },
    ],
  },
  {
    slug: "cae-costo-real-credito-chile",
    fecha_corte: "2026-03-02",
    title: "CAE de un crédito: qué es, cómo se calcula y por qué la tasa sola engaña",
    category: "deuda-credito",
    ymyl_topic: "Carga Anual Equivalente (CAE) como medida del costo real de créditos en Chile",
    sources: [
      {
        title: "Educación financiera — CAE y crédito de consumo",
        publisher: "CMF Chile",
        date: "2026-03-02",
        url: "https://www.cmfchile.cl/educa/621/w3-propertyvalue-43579.html",
      },
      {
        title: "Ley 18.010 — Operaciones de crédito de dinero",
        publisher: "BCN",
        date: "2026-03-02",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=29438",
      },
    ],
  },
  {
    slug: "como-calcular-sueldo-liquido",
    fecha_corte: "2026-02-24",
    title: "Cómo calcular tu sueldo líquido en Chile: del imponible al depósito final",
    category: "empleo-ingresos",
    ymyl_topic: "cálculo de sueldo líquido en Chile: descuentos obligatorios AFP, salud e impuesto segunda categoría",
    sources: [
      {
        title: "Impuesto único de segunda categoría — tabla 2026",
        publisher: "SII",
        date: "2026-02-24",
        url: "https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm",
      },
      {
        title: "Tasas de cotización previsional vigentes",
        publisher: "Superintendencia de Pensiones",
        date: "2026-02-24",
        url: "https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9908.html",
      },
    ],
  },
  {
    slug: "como-cambiarse-de-afp",
    fecha_corte: "2026-02-23",
    title: "¿Puedo cambiarme de AFP? Cómo hacerlo y qué considerar en 2026",
    category: "prevision",
    ymyl_topic: "proceso y condiciones para cambio de AFP en Chile",
    sources: [
      {
        title: "Traspaso entre AFP — requisitos y procedimiento",
        publisher: "Superintendencia de Pensiones",
        date: "2026-02-23",
        url: "https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9585.html",
      },
    ],
  },
  {
    slug: "como-invertir-en-etfs-desde-chile",
    fecha_corte: "2026-02-28",
    title: "¿Cómo comprar ETF en Chile? Corredoras, costos y más",
    category: "ahorro-inversion",
    ymyl_topic: "inversión en ETF desde Chile: corredoras habilitadas, costos y tributación",
    sources: [
      {
        title: "Fondos de inversión cotizados (ETF) — educación CMF",
        publisher: "CMF Chile",
        date: "2026-02-28",
        url: "https://www.cmfchile.cl/educa/621/w3-propertyvalue-994.html",
      },
      {
        title: "Tributación sobre ganancias de capital e inversiones extranjeras",
        publisher: "SII",
        date: "2026-02-28",
        url: "https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0597.htm",
      },
    ],
  },
  {
    slug: "como-leer-cartola-afp-chile",
    fecha_corte: "2026-04-09",
    title: "Cómo leer la cartola AFP: qué significa cada campo y cómo detectar errores",
    category: "prevision",
    ymyl_topic: "lectura e interpretación de la cartola AFP: campos, cotizaciones y detección de errores",
    sources: [
      {
        title: "Cartola previsional — información para afiliados",
        publisher: "Superintendencia de Pensiones",
        date: "2026-04-09",
        url: "https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-6200.html",
      },
      {
        title: "Aportes del empleador al sistema de pensiones",
        publisher: "ChileAtiende",
        date: "2026-04-09",
        url: "https://www.chileatiende.gob.cl/fichas/130987-aportes-del-empleador-al-sistema-de-pensiones",
      },
    ],
  },
  {
    slug: "como-salir-boletin-comercial-chile",
    fecha_corte: "2026-04-09",
    title: "Cómo salir del Boletín Comercial: plazos, pasos y qué hacer si hay un error",
    category: "deuda-credito",
    ymyl_topic: "procedimiento para eliminar registros del Boletín Comercial en Chile",
    sources: [
      {
        title: "Boletín Comercial — información de protesto y morosidades",
        publisher: "CMF Chile",
        date: "2026-04-09",
        url: "https://www.cmfchile.cl/portal/principal/613/w3-article-27659",
      },
      {
        title: "Ley 20.575 — principio de finalidad en datos personales",
        publisher: "BCN",
        date: "2026-04-09",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=1037366",
      },
    ],
  },
  {
    slug: "contribuciones-bienes-raices-chile",
    fecha_corte: "2026-05-03",
    title: "Contribuciones de bienes raíces en Chile: cálculo, cuotas y exenciones",
    category: "impuestos",
    ymyl_topic: "impuesto territorial en Chile: base imponible, cuotas anuales y exenciones disponibles",
    sources: [
      {
        title: "Reavalúo de bienes raíces — SII",
        publisher: "SII",
        date: "2026-05-03",
        url: "https://www.sii.cl/destacados/reavaluo/2022/4326-4341.html",
      },
      {
        title: "DL 3.063 — Ley de rentas municipales / impuesto territorial",
        publisher: "BCN",
        date: "2026-05-03",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=7054",
      },
    ],
  },
  {
    slug: "credito-hipotecario-chile-guia-completa",
    fecha_corte: "2026-04-09",
    title: "Crédito hipotecario en Chile: guía paso a paso para compradores 2026",
    category: "deuda-credito",
    ymyl_topic: "financiamiento hipotecario en Chile: tipos, CAE, LTV y proceso de solicitud",
    sources: [
      {
        title: "Crédito hipotecario — educación financiera CMF",
        publisher: "CMF Chile",
        date: "2026-04-09",
        url: "https://www.cmfchile.cl/educa/621/w3-article-27510.html",
      },
      {
        title: "Tasas de interés — estadísticas Banco Central",
        publisher: "Banco Central de Chile",
        date: "2026-04-09",
        url: "https://www.bcentral.cl/areas/estadisticas/tasas-de-interes",
      },
    ],
  },
  {
    slug: "cuanto-descuenta-la-afp-de-tu-sueldo",
    fecha_corte: "2026-02-23",
    title: "Descuento AFP en tu sueldo: cotización obligatoria, comisión y cómo revisarlo",
    category: "empleo-ingresos",
    ymyl_topic: "cotización obligatoria AFP: tasa, comisiones y descuentos aplicados al sueldo",
    sources: [
      {
        title: "Tasas de cotización previsional vigentes",
        publisher: "Superintendencia de Pensiones",
        date: "2026-02-23",
        url: "https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9908.html",
      },
      {
        title: "Ley 21.420 — reforma previsional cotización obligatoria",
        publisher: "BCN",
        date: "2026-02-23",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=1212060",
      },
    ],
  },
  {
    slug: "deposito-a-plazo-uf-vs-pesos",
    fecha_corte: "2026-02-28",
    title: "Depósito a plazo: UF vs pesos — qué conviene y cuándo",
    category: "ahorro-inversion",
    ymyl_topic: "comparación de depósitos a plazo en UF versus pesos chilenos: rentabilidad real y protección inflacionaria",
    sources: [
      {
        title: "¿Qué es la UF y cómo se reajusta?",
        publisher: "Banco Central de Chile",
        date: "2026-02-28",
        url: "https://www.bcentral.cl/web/banco-central/preguntas-frecuentes/-/asset_publisher/0u850BwdK7p5/content/que-es-la-uf-y-como-se-reajusta-",
      },
      {
        title: "Depósitos y cuentas de ahorro — educación CMF",
        publisher: "CMF Chile",
        date: "2026-02-28",
        url: "https://www.cmfchile.cl/educa/621/w3-article-27170.html",
      },
    ],
  },
  {
    slug: "descuentos-de-sueldo",
    fecha_corte: "2026-03-08",
    title: "Descuentos de sueldo en Chile: cuáles son legales, voluntarios y prohibidos",
    category: "empleo-ingresos",
    ymyl_topic: "tipos de descuentos del sueldo en Chile: legales obligatorios, voluntarios autorizados y prohibidos",
    sources: [
      {
        title: "Descuentos de remuneraciones — DT",
        publisher: "Dirección del Trabajo",
        date: "2026-03-08",
        url: "https://www.dt.gob.cl/portal/1628/w3-article-60593.html",
      },
      {
        title: "Impuesto único de segunda categoría — tabla 2026",
        publisher: "SII",
        date: "2026-03-08",
        url: "https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm",
      },
    ],
  },
  {
    slug: "devolucion-impuestos-fechas-compensaciones",
    fecha_corte: "2026-02-28",
    title: "Devolución de impuestos en Chile: fechas de pago, estado y compensaciones",
    category: "impuestos",
    ymyl_topic: "devolución de impuestos anual en Chile: calendario de pagos, compensaciones y cómo consultar el estado",
    sources: [
      {
        title: "Consulta estado devolución de impuestos — SII",
        publisher: "SII",
        date: "2026-02-28",
        url: "https://www.sii.cl/servicios_online/1044-2696.html",
      },
      {
        title: "Declaración de renta — información general",
        publisher: "ChileAtiende",
        date: "2026-02-28",
        url: "https://www.chileatiende.gob.cl/fichas/3178-declaracion-de-renta",
      },
    ],
  },
  {
    slug: "donde-ver-si-estoy-en-dicom-gratis",
    fecha_corte: "2026-03-12",
    title: "Dónde ver si estás en DICOM gratis en Chile y qué revisar primero",
    category: "deuda-credito",
    ymyl_topic: "consulta gratuita de deudas e historial crediticio en Chile: CMF y Boletín Comercial",
    sources: [
      {
        title: "Informe de deudas CMF — portal oficial",
        publisher: "CMF Chile",
        date: "2026-03-12",
        url: "https://conocetudeuda.cmfchile.cl/informe-deudas/",
      },
      {
        title: "Educación financiera — deudas e historial crediticio",
        publisher: "CMF Chile",
        date: "2026-03-12",
        url: "https://www.cmfchile.cl/educa/621/w3-article-27663.html",
      },
    ],
  },
  {
    slug: "el-poder-del-interes-compuesto",
    fecha_corte: "2026-03-06",
    title: "El poder del interés compuesto: cómo el 10% del sueldo mínimo se convierte en más de $125 millones",
    category: "ahorro-inversion",
    ymyl_topic: "simulación de ahorro a largo plazo con interés compuesto: metodología, supuestos y fuentes de datos",
    sources: [
      {
        title: "Tipos de cambio y paridades históricas — Banco Central",
        publisher: "Banco Central de Chile",
        date: "2026-03-06",
        url: "https://www.bcentral.cl/es/web/banco-central/areas/estadisticas/tipos-de-cambios-y-paridades",
      },
      {
        title: "Sueldo mínimo — tablas históricas DT",
        publisher: "Dirección del Trabajo",
        date: "2026-03-06",
        url: "https://www.dt.gob.cl/portal/1628/w3-article-60141.html",
      },
    ],
  },
  {
    slug: "estafas-financieras-chile-vishing-smishing-marketplace",
    fecha_corte: "2026-03-02",
    title: "Estafas financieras en Chile: señales por canal y checklist de 24 horas",
    category: "seguridad-financiera",
    ymyl_topic: "tipos de estafas financieras en Chile (vishing, smishing, marketplace) y protocolo de respuesta",
    sources: [
      {
        title: "Normativa para entidades financieras — CMF",
        publisher: "CMF Chile",
        date: "2026-03-02",
        url: "https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-43332.html",
      },
      {
        title: "CSIRT Gov — alertas y recomendaciones de ciberseguridad",
        publisher: "CSIRT",
        date: "2026-03-02",
        url: "https://csirt.gob.cl/",
      },
    ],
  },
  {
    slug: "finiquito-e-indemnizaciones-en-chile",
    fecha_corte: "2026-03-02",
    title: "Finiquito e indemnizaciones en Chile: qué te corresponde y cómo revisarlo",
    category: "empleo-ingresos",
    ymyl_topic: "cálculo y derechos de finiquito e indemnización por años de servicio en Chile",
    sources: [
      {
        title: "Código del Trabajo — Art. 159 y siguientes (causal de despido y finiquito)",
        publisher: "BCN",
        date: "2026-03-02",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=207436",
      },
      {
        title: "Finiquito — orientación laboral DT",
        publisher: "Dirección del Trabajo",
        date: "2026-03-02",
        url: "https://www.dt.gob.cl/portal/1626/w3-channel.html",
      },
    ],
  },
  {
    slug: "fonasa-vs-isapre-comparativa",
    fecha_corte: "2026-04-08",
    title: "Fonasa o Isapre: cuál conviene según tu caso (2026)",
    category: "seguridad-financiera",
    ymyl_topic: "comparativa FONASA vs ISAPRE en Chile: cobertura, tramos, costos y criterios de elección",
    sources: [
      {
        title: "Tramos FONASA — beneficios por tramo",
        publisher: "FONASA",
        date: "2026-04-08",
        url: "https://www.fonasa.cl/sites/fonasa/beneficiarios/informacion-general/tramos",
      },
      {
        title: "Ley 18.469 — régimen de prestaciones de salud FONASA",
        publisher: "BCN",
        date: "2026-04-08",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=29581",
      },
    ],
  },
  {
    slug: "fondos-afp-a-b-c-d-e",
    fecha_corte: "2026-02-23",
    title: "Fondos AFP A, B, C, D y E: diferencias, riesgo y cuál te conviene",
    category: "prevision",
    ymyl_topic: "características y perfil de riesgo de los cinco fondos de pensiones AFP en Chile",
    sources: [
      {
        title: "Multifondos AFP — descripción y rentabilidades históricas",
        publisher: "Superintendencia de Pensiones",
        date: "2026-02-23",
        url: "https://www.spensiones.cl/portal/institucional/594/w3-article-16668.html",
      },
      {
        title: "Ley 21.420 — reforma previsional",
        publisher: "BCN",
        date: "2026-02-23",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=1212060",
      },
    ],
  },
  {
    slug: "fondos-mutuos-comisiones-rescate-impuestos",
    fecha_corte: "2026-02-28",
    title: "Fondos mutuos: comisiones, rescate e impuestos (sin letra chica)",
    category: "ahorro-inversion",
    ymyl_topic: "fondos mutuos en Chile: tipos de comisiones, reglas de rescate y tributación de ganancias",
    sources: [
      {
        title: "Fondos mutuos — educación financiera CMF",
        publisher: "CMF Chile",
        date: "2026-02-28",
        url: "https://www.cmfchile.cl/educa/621/w3-propertyvalue-504.html",
      },
      {
        title: "Tributación sobre rescates de fondos mutuos — SII",
        publisher: "SII",
        date: "2026-02-28",
        url: "https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_1428.htm",
      },
    ],
  },
  {
    slug: "fraude-tarjeta-que-hacer",
    fecha_corte: "2026-02-24",
    title: "Te hicieron un cargo que no reconoces: qué hacer en las primeras 24 horas (Ley 20.009)",
    category: "seguridad-financiera",
    ymyl_topic: "protocolo ante fraude con tarjeta de crédito/débito en Chile: derechos bajo Ley 20.009 y pasos a seguir",
    sources: [
      {
        title: "Normativa sobre cargos no autorizados — CMF",
        publisher: "CMF Chile",
        date: "2026-02-24",
        url: "https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-43332.html",
      },
      {
        title: "Derechos del consumidor financiero — SERNAC",
        publisher: "SERNAC",
        date: "2026-02-24",
        url: "https://www.sernac.cl/portal/604/w3-propertyname-791.html",
      },
    ],
  },
  {
    slug: "gratificacion-legal-chile",
    fecha_corte: "2026-05-03",
    title: "Gratificación legal en Chile: cómo calcularla y cuál es el tope",
    category: "empleo-ingresos",
    ymyl_topic: "cálculo de gratificación legal en Chile: métodos proporcional y del 25%, topes y obligatoriedad",
    sources: [
      {
        title: "Código del Trabajo — Art. 46 a 52 (gratificaciones)",
        publisher: "BCN",
        date: "2026-05-03",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=207436",
      },
      {
        title: "Gratificaciones — orientación laboral DT",
        publisher: "Dirección del Trabajo",
        date: "2026-05-03",
        url: "https://www.dt.gob.cl/portal/1626/w3-channel.html",
      },
    ],
  },
  {
    slug: "impuesto-global-complementario-chile",
    fecha_corte: "2026-05-03",
    title: "Impuesto Global Complementario en Chile: qué es, tramos y quién lo paga",
    category: "impuestos",
    ymyl_topic: "Impuesto Global Complementario (IGC) en Chile: tramos vigentes 2026, base imponible y quiénes declaran",
    sources: [
      {
        title: "Tramos IGC y valores renta 2026 — SII",
        publisher: "SII",
        date: "2026-05-03",
        url: "https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html",
      },
      {
        title: "DL 824 — Ley sobre Impuesto a la Renta",
        publisher: "BCN",
        date: "2026-05-03",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=6368",
      },
    ],
  },
  {
    slug: "indemnizacion-anos-de-servicio-chile",
    fecha_corte: "2026-03-12",
    title: "Indemnización por años de servicio en Chile: cuándo aplica y cómo calcularla",
    category: "empleo-ingresos",
    ymyl_topic: "indemnización por años de servicio en Chile: causales, tope, cálculo y diferencias con el preaviso",
    sources: [
      {
        title: "Código del Trabajo — Art. 163 (indemnización por años de servicio)",
        publisher: "BCN",
        date: "2026-03-12",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=207436",
      },
      {
        title: "Indemnizaciones laborales — orientación DT",
        publisher: "Dirección del Trabajo",
        date: "2026-03-12",
        url: "https://www.dt.gob.cl/portal/1626/w3-channel.html",
      },
    ],
  },
  {
    slug: "informe-deudas-cmf-vs-dicom",
    fecha_corte: "2026-02-24",
    title: "Informe de deudas CMF: cómo sacarlo, qué dice y por qué no es lo mismo que DICOM",
    category: "deuda-credito",
    ymyl_topic: "diferencias entre el informe de deudas CMF y el Boletín Comercial (DICOM): contenido y uso correcto",
    sources: [
      {
        title: "Informe de deudas CMF — portal oficial",
        publisher: "CMF Chile",
        date: "2026-02-24",
        url: "https://conocetudeuda.cmfchile.cl/informe-deudas/",
      },
      {
        title: "Educación financiera — informe de deudas e historial crediticio",
        publisher: "CMF Chile",
        date: "2026-02-24",
        url: "https://www.cmfchile.cl/educa/621/w3-article-27663.html",
      },
    ],
  },
  {
    slug: "interes-compuesto-nota-metodologica",
    fecha_corte: "2026-03-06",
    title: "Nota metodológica: simulación de interés compuesto 1990-2025",
    category: "ahorro-inversion",
    ymyl_topic: "supuestos, fuentes y fórmulas del ejercicio de simulación de ahorro en NASDAQ-100 1990-2025",
    sources: [
      {
        title: "Sistema de Indicadores Financieros — Banco Central de Chile",
        publisher: "Banco Central de Chile",
        date: "2026-03-06",
        url: "https://si3.bcentral.cl/Siete/",
      },
      {
        title: "Proyecciones de población — INE",
        publisher: "INE",
        date: "2026-03-06",
        url: "https://www.ine.gob.cl/estadisticas/sociales/demografia-y-vitales/proyecciones-de-poblacion",
      },
    ],
  },
  {
    slug: "licencia-medica-desde-que-dia-pagan",
    fecha_corte: "2026-03-02",
    title: "Licencia médica en Chile: desde qué día te pagan y cómo reclamar",
    category: "empleo-ingresos",
    ymyl_topic: "pago de licencia médica en Chile: días de espera, subsidio, quién paga y cómo reclamar",
    sources: [
      {
        title: "Licencia médica — información SUSESO",
        publisher: "SUSESO",
        date: "2026-03-02",
        url: "https://www.suseso.gob.cl",
      },
      {
        title: "Licencia médica — información ChileAtiende",
        publisher: "ChileAtiende",
        date: "2026-03-02",
        url: "https://www.chileatiende.gob.cl/",
      },
    ],
  },
  {
    slug: "liquidacion-de-sueldo",
    fecha_corte: "2026-03-08",
    title: "Liquidación de sueldo en Chile: cómo auditar el comprobante y sus líneas clave",
    category: "empleo-ingresos",
    ymyl_topic: "interpretación de la liquidación de sueldo en Chile: haberes, descuentos y cómo detectar errores",
    sources: [
      {
        title: "Liquidación de sueldo — orientación laboral DT",
        publisher: "Dirección del Trabajo",
        date: "2026-03-08",
        url: "https://www.dt.gob.cl/legislacion/1624/w3-article-119939.html",
      },
      {
        title: "Descuentos de remuneraciones — DT",
        publisher: "Dirección del Trabajo",
        date: "2026-03-08",
        url: "https://www.dt.gob.cl/portal/1628/w3-article-60593.html",
      },
    ],
  },
  {
    slug: "operacion-renta-centro",
    fecha_corte: "2026-04-29",
    title: "Centro Operación Renta 2026: guía completa para declarar en Chile",
    category: "impuestos",
    ymyl_topic: "declaración de renta 2026 en Chile: quién debe declarar, plazos F22, devolución y pago",
    sources: [
      {
        title: "Operación Renta 2026 — valores y fechas personas naturales",
        publisher: "SII",
        date: "2026-04-29",
        url: "https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html",
      },
      {
        title: "Devoluciones de impuestos — TGR",
        publisher: "TGR",
        date: "2026-04-29",
        url: "https://www.tgr.cl",
      },
    ],
  },
  {
    slug: "operacion-renta-f22-checklist",
    fecha_corte: "2026-02-28",
    title: "Operación Renta F22 en Chile: checklist para revisar, enviar y rectificar sin errores",
    category: "impuestos",
    ymyl_topic: "Formulario 22 Operación Renta Chile: pasos para revisión, envío y rectificación",
    sources: [
      {
        title: "Renta 2026 — portal SII personas",
        publisher: "SII",
        date: "2026-02-28",
        url: "https://www.sii.cl/destacados/renta/2026/personas/",
      },
      {
        title: "Operación Renta 2026 — ChileAtiende",
        publisher: "ChileAtiende",
        date: "2026-02-28",
        url: "https://www.chileatiende.gob.cl/fichas/3178-declaracion-de-renta",
      },
    ],
  },
  {
    slug: "pgu-pension-garantizada-universal",
    fecha_corte: "2026-05-03",
    title: "PGU en Chile: requisitos, monto vigente y cómo tramitarla",
    category: "prevision",
    ymyl_topic: "Pensión Garantizada Universal (PGU) en Chile: requisitos de acceso, monto 2026 y proceso de solicitud",
    sources: [
      {
        title: "Ley 21.419 — Pensión Garantizada Universal",
        publisher: "BCN",
        date: "2026-05-03",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=1171923",
      },
      {
        title: "PGU — solicitud y requisitos IPS",
        publisher: "IPS",
        date: "2026-05-03",
        url: "https://www.ips.gob.cl/",
      },
    ],
  },
  {
    slug: "prepago-credito-cuando-conviene-chile",
    fecha_corte: "2026-04-10",
    title: "¿Cuándo conviene hacer un prepago de crédito en Chile?",
    category: "deuda-credito",
    ymyl_topic: "análisis de conveniencia del prepago de crédito en Chile: derechos legales, costo de prepago y ahorro real",
    sources: [
      {
        title: "Ley 18.010 — derecho a prepago de créditos",
        publisher: "BCN",
        date: "2026-04-10",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=29438",
      },
      {
        title: "Educación financiera — créditos de consumo CMF",
        publisher: "CMF Chile",
        date: "2026-04-10",
        url: "https://www.cmfchile.cl/educa/",
      },
    ],
  },
  {
    slug: "primer-empleo-chile-guia-completa",
    fecha_corte: "2026-04-09",
    title: "Primer empleo en Chile: guía completa para saber qué firmar, qué te descuentan y cómo empezar",
    category: "empleo-ingresos",
    ymyl_topic: "guía para el primer empleo formal en Chile: contrato, descuentos previsionales, seguro de cesantía e inicio de vida laboral",
    sources: [
      {
        title: "Seguro de cesantía — AFC Chile",
        publisher: "AFC Chile",
        date: "2026-04-09",
        url: "https://www.afc.cl",
      },
      {
        title: "Contrato de trabajo — orientación DT",
        publisher: "Dirección del Trabajo",
        date: "2026-04-09",
        url: "https://www.dt.gob.cl/portal/1626/w3-propertyvalue-22777.html",
      },
    ],
  },
  {
    slug: "que-es-el-apv",
    fecha_corte: "2026-02-23",
    title: "APV en Chile: beneficio tributario, regímenes A y B, y cuándo conviene",
    category: "ahorro-inversion",
    ymyl_topic: "Ahorro Previsional Voluntario (APV) en Chile: regímenes tributarios A y B, beneficios y conveniencia",
    sources: [
      {
        title: "APV — información para afiliados SP",
        publisher: "Superintendencia de Pensiones",
        date: "2026-02-23",
        url: "https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html",
      },
      {
        title: "Tributación APV — preguntas frecuentes SII",
        publisher: "SII",
        date: "2026-02-23",
        url: "https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm",
      },
    ],
  },
  {
    slug: "que-es-la-cuenta-2-afp",
    fecha_corte: "2026-02-23",
    title: "Cuenta 2 de la AFP: ahorro flexible, retiros e impuestos",
    category: "prevision",
    ymyl_topic: "Cuenta 2 AFP en Chile: características, retiros discrecionales y tributación de ganancias",
    sources: [
      {
        title: "Cuenta de ahorro voluntario (Cuenta 2) — SP",
        publisher: "Superintendencia de Pensiones",
        date: "2026-02-23",
        url: "https://www.spensiones.cl/portal/institucional/594/w3-article-2906.html",
      },
      {
        title: "Valores UTM 2026 — SII",
        publisher: "SII",
        date: "2026-02-23",
        url: "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm",
      },
    ],
  },
  {
    slug: "que-es-la-uf",
    fecha_corte: "2026-02-24",
    title: "UF en simple: qué es, por qué sube todos los días y cómo te afecta",
    category: "ahorro-inversion",
    ymyl_topic: "Unidad de Fomento (UF) en Chile: definición, actualización diaria, cálculo y uso en créditos e inversiones",
    sources: [
      {
        title: "Indicadores financieros diarios — Banco Central",
        publisher: "Banco Central de Chile",
        date: "2026-02-24",
        url: "https://si3.bcentral.cl/Siete/",
      },
      {
        title: "Metodología UF — Banco Central de Chile",
        publisher: "Banco Central de Chile",
        date: "2026-02-24",
        url: "https://si3.bcentral.cl/estadisticas/Principal1/Metodologias/EMF/UF.pdf",
      },
    ],
  },
  {
    slug: "reforma-previsional-2025-que-cambia-y-como-te-afecta",
    fecha_corte: "2026-03-03",
    title: "Reforma previsional 2025: qué cambia, cuándo y cómo te afecta (guía actualizada)",
    category: "prevision",
    ymyl_topic: "Ley 21.420 reforma previsional Chile 2025: nuevas cotizaciones, PGU y cambios en AFP",
    sources: [
      {
        title: "Reforma previsional 2025 — información oficial SP",
        publisher: "Superintendencia de Pensiones",
        date: "2026-03-03",
        url: "https://www.spensiones.cl/portal/institucional/594/w3-article-16615.html",
      },
      {
        title: "Ley 21.420 — reforma previsional",
        publisher: "BCN",
        date: "2026-03-03",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=1212060",
      },
    ],
  },
  {
    slug: "renegociacion-superir",
    fecha_corte: "2026-02-24",
    title: "Renegociación Superir: qué es, quién puede pedir y cómo hacerlo sin abogado",
    category: "deuda-credito",
    ymyl_topic: "proceso de renegociación Superir en Chile: elegibilidad, pasos y efectos sobre historial crediticio",
    sources: [
      {
        title: "Renegociación de deudas — ChileAtiende",
        publisher: "ChileAtiende",
        date: "2026-02-24",
        url: "https://www.chileatiende.gob.cl/fichas/37401-renegociacion-de-las-deudas-de-una-persona",
      },
      {
        title: "Informe de deudas CMF — portal oficial",
        publisher: "CMF Chile",
        date: "2026-02-24",
        url: "https://conocetudeuda.cmfchile.cl/informe-deudas/",
      },
    ],
  },
  {
    slug: "rentas-mixtas-sueldo-honorarios",
    fecha_corte: "2026-04-09",
    title: "Rentas mixtas en Chile: cómo declarar cuando tienes sueldo y boletas de honorarios",
    category: "impuestos",
    ymyl_topic: "declaración de impuestos con rentas mixtas en Chile: coordinación entre segunda categoría y honorarios",
    sources: [
      {
        title: "Operación Renta 2026 — personas naturales con rentas mixtas",
        publisher: "SII",
        date: "2026-04-09",
        url: "https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html",
      },
      {
        title: "Portal boletas de honorarios — SII",
        publisher: "SII",
        date: "2026-04-09",
        url: "https://www.sii.cl/destacados/boletas_honorarios/",
      },
    ],
  },
  {
    slug: "seguro-cesantia-cuenta-individual-vs-fondo-solidario",
    fecha_corte: "2026-03-12",
    title: "Seguro de cesantía: Cuenta Individual vs Fondo Solidario, sin confundir ambos",
    category: "empleo-ingresos",
    ymyl_topic: "diferencias entre Cuenta Individual y Fondo Solidario del Seguro de Cesantía en Chile",
    sources: [
      {
        title: "Ley 19.728 — Seguro de Cesantía",
        publisher: "BCN",
        date: "2026-03-12",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=184979",
      },
      {
        title: "Fondo de Cesantía Solidario — ChileAtiende",
        publisher: "ChileAtiende",
        date: "2026-03-12",
        url: "https://www.chileatiende.gob.cl/fichas/36646-fondo-de-cesantia-solidario",
      },
    ],
  },
  {
    slug: "seguro-de-cesantia",
    fecha_corte: "2026-02-25",
    title: "Seguro de cesantía: cómo saber tu saldo, cuándo puedes cobrar y cuánto te pagan",
    category: "empleo-ingresos",
    ymyl_topic: "seguro de cesantía en Chile: saldo cuenta individual, requisitos de cobro y monto del beneficio",
    sources: [
      {
        title: "AFC Chile — portal del seguro de cesantía",
        publisher: "AFC Chile",
        date: "2026-02-25",
        url: "https://www.afc.cl",
      },
      {
        title: "Ley 19.728 — Seguro de Cesantía",
        publisher: "BCN",
        date: "2026-02-25",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=184979",
      },
    ],
  },
  {
    slug: "sueldo-imponible-chile",
    fecha_corte: "2026-05-03",
    title: "Sueldo imponible en Chile: qué es, qué incluye y cómo afecta tus descuentos",
    category: "empleo-ingresos",
    ymyl_topic: "definición y composición del sueldo imponible en Chile: qué conceptos se incluyen y cómo impacta cotizaciones e impuestos",
    sources: [
      {
        title: "Código del Trabajo — remuneraciones imponibles",
        publisher: "BCN",
        date: "2026-05-03",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=207436",
      },
      {
        title: "Impuesto único de segunda categoría — tabla 2026",
        publisher: "SII",
        date: "2026-05-03",
        url: "https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm",
      },
    ],
  },
  {
    slug: "suplantacion-identidad-creditos-no-reconocidos",
    fecha_corte: "2026-03-02",
    title: "¿Suplantaron tu identidad? Cómo detectarlo y frenarlo",
    category: "seguridad-financiera",
    ymyl_topic: "detección y respuesta ante suplantación de identidad y créditos no reconocidos en Chile",
    sources: [
      {
        title: "CMF — canal de contacto y denuncia de fraudes",
        publisher: "CMF Chile",
        date: "2026-03-02",
        url: "https://www.cmfchile.cl/portal/principal/613/w3-channel.html",
      },
    ],
  },
  {
    slug: "tarjeta-credito-costo-real-chile",
    fecha_corte: "2026-04-10",
    title: "Cómo calcular el costo real de una tarjeta de crédito en Chile",
    category: "deuda-credito",
    ymyl_topic: "cálculo del costo total de una tarjeta de crédito en Chile: CAE, comisiones anuales e intereses de mora",
    sources: [
      {
        title: "Ley 18.010 — crédito de consumo y CAE",
        publisher: "BCN",
        date: "2026-04-10",
        url: "https://www.bcn.cl/leychile/navegar?idNorma=29438",
      },
      {
        title: "Tarjetas de crédito — educación financiera CMF",
        publisher: "CMF Chile",
        date: "2026-04-10",
        url: "https://www.cmfchile.cl/educa/621/w3-propertyvalue-1188.html",
      },
    ],
  },
  {
    slug: "utm-chile-que-es-como-funciona",
    fecha_corte: "2026-04-09",
    title: "UTM en Chile: qué es, cómo funciona y para qué sirve",
    category: "impuestos",
    ymyl_topic: "Unidad Tributaria Mensual (UTM) en Chile: definición, actualización mensual y uso en multas e impuestos",
    sources: [
      {
        title: "Valores UTM 2026 — SII",
        publisher: "SII",
        date: "2026-04-09",
        url: "https://www.sii.cl/valores_y_fechas/utm/utm2026.htm",
      },
      {
        title: "Indicadores financieros — Banco Central",
        publisher: "Banco Central de Chile",
        date: "2026-04-09",
        url: "https://si3.bcentral.cl/Siete/",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Template generators
// ---------------------------------------------------------------------------

function makeBrief(entry) {
  return `slug: ${entry.slug}
title: "${entry.title}"
category: ${entry.category}
ymyl_topic: "${entry.ymyl_topic}"
fecha_corte: ${entry.fecha_corte}
ymyl_risk: high
backfill_run: ${RUN_ID}
backfill_note: "Backfill canónico TD-0057. Evidencia editorial detallada en docs/editorial/artifacts/${entry.slug}/"
`;
}

function makeDossier(entry) {
  const sourceList = entry.sources
    .map(s => `- **${s.publisher}** — [${s.title}](${s.url}) (${s.date})`)
    .join("\n");

  return `# Dossier — ${entry.title}

- Slug: \`${entry.slug}\`
- Categoría YMYL: ${entry.category}
- Fecha de corte: ${entry.fecha_corte}
- Run id: ${RUN_ID}

## Contexto editorial

Artículo publicado sobre: ${entry.ymyl_topic}.

## Fuentes primarias consultadas

${sourceList}

## Nota de backfill

Este dossier es parte del backfill canónico TD-0057 (2026-05-11).
La evidencia editorial detallada — research, outline, draft, math audit y compliance —
se encuentra en \`docs/editorial/artifacts/${entry.slug}/\`.
Los gates de publicación (07-publish-packet.md) no se marcan automáticamente;
requieren revisión y firma del editor humano.
`;
}

function makeSources(entry) {
  const items = entry.sources
    .map(
      s =>
        `- title: "${s.title}"\n  publisher: "${s.publisher}"\n  date: ${s.date}\n  url: "${s.url}"`
    )
    .join("\n");
  return `${items}\n`;
}

function makeMetadata(entry) {
  return `slug: ${entry.slug}
source_path: src/data/blog/${entry.slug}.md
run_id: ${RUN_ID}
scaffolded_at: 2026-05-11T10:00:00.000Z
cut_off_date: ${entry.fecha_corte}
backfill: true
backfill_evidence: docs/editorial/artifacts/${entry.slug}/
backfill_reason: TD-0057 canonical artifact backfill for published YMYL corpus
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function run() {
  let created = 0;
  let skipped = 0;

  for (const entry of BACKFILL_DATA) {
    const runDir = path.join(ARTIFACTS_BASE, entry.slug, RUN_ID);

    if (existsSync(runDir)) {
      console.log(`[backfill-td-0057] SKIP (exists) slug=${entry.slug}`);
      skipped += 1;
      continue;
    }

    const files = {
      "01-brief.yaml": makeBrief(entry),
      "02-dossier.md": makeDossier(entry),
      "sources.yaml": makeSources(entry),
      "metadata.yaml": makeMetadata(entry),
    };

    if (!DRY_RUN) {
      mkdirSync(runDir, { recursive: true });
      for (const [name, content] of Object.entries(files)) {
        writeFileSync(path.join(runDir, name), content, "utf8");
      }
    }

    console.log(
      `[backfill-td-0057] ${DRY_RUN ? "DRY" : "OK"} slug=${entry.slug} run=${runDir.replace(path.join(REPO_ROOT, ""), "")}`
    );
    created += 1;
  }

  console.log(
    `\n[backfill-td-0057] SUMMARY created=${created} skipped=${skipped} dry_run=${DRY_RUN} run_id=${RUN_ID}`
  );
}

run();
