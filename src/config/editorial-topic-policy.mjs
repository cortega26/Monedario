export const TOPIC_ROLES = ["owner", "support", "reference"];

export const HARDENED_OWNERSHIP_CLUSTERS = [
  "sueldo-remuneraciones",
  "pensiones-afp",
  "ahorro-e-inversion",
  "uf-costo-de-vida",
];

export const PRIMARY_CATEGORY_BY_CLUSTER = {
  "pensiones-afp": ["prevision"],
  "sueldo-remuneraciones": ["empleo-ingresos"],
  "empleo-ingresos": ["empleo-ingresos"],
  "impuestos-personas": ["impuestos"],
  "ahorro-e-inversion": ["ahorro-inversion"],
  "deuda-credito": ["deuda-credito"],
  "seguridad-financiera": ["seguridad-financiera"],
  "uf-costo-de-vida": ["general"],
};

export const CANONICAL_TOPIC_REGISTRY = {
  "sueldo-remuneraciones": {
    "gratificacion-legal-calculo-tope": {
      ownerSlug: "gratificacion-legal-chile",
      intentLabel: "calcular gratificacion legal y tope IMM",
    },
    "sueldo-imponible-base-descuentos": {
      ownerSlug: "sueldo-imponible-chile",
      intentLabel: "entender sueldo imponible y su efecto en descuentos",
    },
    "calcular-sueldo-liquido": {
      ownerSlug: "como-calcular-sueldo-liquido",
      intentLabel: "calcular sueldo liquido",
    },
    "auditar-liquidacion-sueldo": {
      ownerSlug: "liquidacion-de-sueldo",
      intentLabel: "auditar liquidacion de sueldo",
    },
    "clasificacion-descuentos-sueldo": {
      ownerSlug: "descuentos-de-sueldo",
      intentLabel: "clasificar descuentos de sueldo",
    },
    "descuento-afp-trabajador": {
      ownerSlug: "cuanto-descuenta-la-afp-de-tu-sueldo",
      intentLabel: "descuento AFP del trabajador",
    },
  },
  "empleo-ingresos": {
    "seguro-cesantia-cobertura": {
      ownerSlug: "seguro-de-cesantia",
      intentLabel: "seguro de cesantia cobertura y cobro",
    },
    "finiquito-indemnizaciones": {
      ownerSlug: "finiquito-e-indemnizaciones-en-chile",
      intentLabel: "finiquito e indemnizaciones",
    },
    "licencia-medica-pago": {
      ownerSlug: "licencia-medica-desde-que-dia-pagan",
      intentLabel: "licencia medica pago y rechazo",
    },
    "primer-empleo-integral": {
      ownerSlug: "primer-empleo-chile-guia-completa",
      intentLabel: "guia integral de primer empleo en Chile",
    },
  },
  "impuestos-personas": {
    "contribuciones-bienes-raices-tramite": {
      ownerSlug: "contribuciones-bienes-raices-chile",
      intentLabel: "calcular y pagar contribuciones de bienes raices en Chile",
    },
    "igc-impuesto-global-complementario": {
      ownerSlug: "impuesto-global-complementario-chile",
      intentLabel: "entender y calcular el impuesto global complementario",
    },
    "f22-revisar-enviar": {
      ownerSlug: "operacion-renta-f22-checklist",
      intentLabel: "operacion renta F22 checklist",
    },
    "devolucion-impuestos": {
      ownerSlug: "devolucion-impuestos-fechas-compensaciones",
      intentLabel: "devolucion de impuestos fechas y compensaciones",
    },
    "honorarios-retencion-cobertura": {
      ownerSlug: "boleta-honorarios-2026-retencion-cobertura",
      intentLabel: "boleta honorarios retencion y cobertura anual",
    },
    "rentas-mixtas": {
      ownerSlug: "rentas-mixtas-sueldo-honorarios",
      intentLabel: "tributacion de rentas mixtas sueldo y honorarios",
    },
  },
  "pensiones-afp": {
    "pgu-pension-garantizada": {
      ownerSlug: "pgu-pension-garantizada-universal",
      intentLabel: "requisitos y tramite de la PGU en Chile",
    },
    "cambio-afp": {
      ownerSlug: "como-cambiarse-de-afp",
      intentLabel: "cambiarse de AFP",
    },
    "elegir-fondos-afp": {
      ownerSlug: "fondos-afp-a-b-c-d-e",
      intentLabel: "elegir fondos AFP",
    },
    "cuenta2-afp": {
      ownerSlug: "que-es-la-cuenta-2-afp",
      intentLabel: "cuenta 2 AFP",
    },
    "reforma-previsional-cambios": {
      ownerSlug: "reforma-previsional-2025-que-cambia-y-como-te-afecta",
      intentLabel: "reforma previsional y cambios vigentes",
    },
    "cartola-afp": {
      ownerSlug: "como-leer-cartola-afp-chile",
      intentLabel: "leer e interpretar la cartola AFP",
    },
    "afiliacion-cotizacion-voluntaria": {
      ownerSlug: "cotizacion-voluntaria-afp-independiente",
      intentLabel:
        "afiliacion y cotizacion voluntaria AFP para quien no cotiza por boletas",
    },
  },
  "ahorro-e-inversion": {
    "elegir-instrumento-ahorro-inversion": {
      ownerSlug:
        "ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026",
      intentLabel: "elegir instrumento de ahorro e inversion",
    },
    "fondos-mutuos-costos-rescate-impuestos": {
      ownerSlug: "fondos-mutuos-comisiones-rescate-impuestos",
      intentLabel: "fondos mutuos costos rescate impuestos",
    },
    "invertir-etfs-desde-chile": {
      ownerSlug: "como-invertir-en-etfs-desde-chile",
      intentLabel: "invertir ETFs desde Chile",
    },
    "apv-beneficio-tributario": {
      ownerSlug: "que-es-el-apv",
      intentLabel: "APV beneficio tributario",
    },
    "deposito-plazo-uf-vs-pesos": {
      ownerSlug: "deposito-a-plazo-uf-vs-pesos",
      intentLabel: "deposito a plazo UF vs pesos",
    },
    "interes-compuesto-caso": {
      ownerSlug: "el-poder-del-interes-compuesto",
      intentLabel: "interes compuesto caso",
    },
  },
  "presupuesto-control-financiero": {
    "presupuesto-mensual-control-financiero": {
      ownerSlug: "como-hacer-presupuesto-mensual-chile",
      intentLabel: "hacer presupuesto mensual y controlar gastos",
    },
    "fondo-emergencia-colchon": {
      ownerSlug: "fondo-emergencia-chile",
      intentLabel: "construir fondo de emergencia en Chile",
    },
  },
  "deuda-credito": {
    "cae-costo-real": {
      ownerSlug: "cae-costo-real-credito-chile",
      intentLabel: "CAE costo real del credito",
    },
    "informe-deudas-cmf-vs-dicom": {
      ownerSlug: "informe-deudas-cmf-vs-dicom",
      intentLabel: "informe deudas CMF vs DICOM",
    },
    "renegociacion-superir": {
      ownerSlug: "renegociacion-superir",
      intentLabel: "renegociacion Superir",
    },
    "credito-hipotecario-proceso": {
      ownerSlug: "credito-hipotecario-chile-guia-completa",
      intentLabel:
        "entender y obtener un credito hipotecario en Chile paso a paso",
    },
    "boletin-comercial-eliminacion": {
      ownerSlug: "como-salir-boletin-comercial-chile",
      intentLabel: "eliminar anotaciones del Boletin Comercial",
    },
    "tarjeta-credito-costo-interes": {
      ownerSlug: "tarjeta-credito-costo-real-chile",
      intentLabel: "calcular costo real tarjeta de credito",
    },
    "prepago-credito-calculo": {
      ownerSlug: "prepago-credito-cuando-conviene-chile",
      intentLabel: "cuando conviene hacer un prepago de credito",
    },
  },
  "uf-costo-de-vida": {
    "uf-reajustes-costo-de-vida": {
      ownerSlug: "que-es-la-uf",
      intentLabel: "entender UF y reajustes de costo de vida",
    },
    "ipc-inflacion-costo-de-vida": {
      ownerSlug: "que-es-el-ipc-chile-como-se-calcula",
      intentLabel: "entender IPC e inflacion de costo de vida",
    },
    "reajuste-arriendo-contrato-uf-ipc": {
      ownerSlug: "reajuste-arriendo-uf-ipc-chile",
      intentLabel: "interpretar reajuste de arriendo en UF o IPC",
    },
    "utm-uta-unidades-tributarias": {
      ownerSlug: "utm-chile-que-es-como-funciona",
      intentLabel:
        "entender UTM y UTA como unidades tributarias reajustables en Chile",
    },
  },
  "seguridad-financiera": {
    "fonasa-vs-isapre": {
      ownerSlug: "fonasa-vs-isapre-comparativa",
      intentLabel: "comparar Fonasa e Isapre segun cobertura y costo",
    },
    "estafas-financieras-prevencion": {
      ownerSlug: "estafas-financieras-chile-vishing-smishing-marketplace",
      intentLabel: "detectar y prevenir estafas financieras por canal",
    },
    "fraude-tarjeta-ley-20009": {
      ownerSlug: "fraude-tarjeta-que-hacer",
      intentLabel: "actuar ante fraude con tarjeta segun Ley 20.009",
    },
    "suplantacion-identidad-creditos": {
      ownerSlug: "suplantacion-identidad-creditos-no-reconocidos",
      intentLabel:
        "detectar y frenar suplantacion de identidad con creditos no reconocidos",
    },
  },
  "bancos-fintech": {
    "tipos-de-cuenta-banco-vs-fintech-chile": {
      ownerSlug: "bancos-y-fintech-chile",
      intentLabel: "comparar tipos de cuenta entre bancos y fintech en Chile",
    },
  },
  "finanzas-migrantes": {
    "finanzas-iniciales-migrantes-chile": {
      ownerSlug: "finanzas-para-migrantes-chile",
      intentLabel: "primeros pasos financieros para migrantes en Chile",
    },
  },
};

// Landings de guías (páginas .astro fuera de las colecciones) que cubren un
// cluster. `role: "hub"` declara la landing como centro de recursos; el owner
// del topic sigue siendo el post registrado en CANONICAL_TOPIC_REGISTRY
// (plan 119, SEO-018). Piloto: Operación Renta.
export const GUIDE_INTENT_REGISTRY = {
  "/guias/impuestos-personas/operacion-renta/": {
    cluster: "impuestos-personas",
    canonicalTopic: "f22-revisar-enviar",
    role: "hub",
    note: "Centro del cluster; el owner del topic es el checklist F22.",
  },
};

export function getGuideIntentEntry(pathname) {
  return GUIDE_INTENT_REGISTRY[pathname] ?? null;
}

export const TRANSITIONAL_OWNERSHIP_REGISTRY = {};

export function getTransitionalOwnershipEntry(slug) {
  return TRANSITIONAL_OWNERSHIP_REGISTRY[slug] ?? null;
}

export function isDocumentedTransitionalPlacement({ slug, cluster, category }) {
  const entry = getTransitionalOwnershipEntry(slug);
  if (!entry) return false;
  return entry.currentCluster === cluster && entry.currentCategory === category;
}

function isHardenedOwnershipCluster(cluster) {
  return HARDENED_OWNERSHIP_CLUSTERS.includes(cluster);
}

export function getAllowedCategoriesForCluster(cluster) {
  return PRIMARY_CATEGORY_BY_CLUSTER[cluster] ?? null;
}

export function getCanonicalTopicEntry(cluster, canonicalTopic) {
  return CANONICAL_TOPIC_REGISTRY[cluster]?.[canonicalTopic] ?? null;
}

export function allowsGeneralCategoryInCluster({
  cluster,
  topicRole,
  unlisted,
}) {
  if (!isHardenedOwnershipCluster(cluster)) return true;
  if (cluster === "uf-costo-de-vida") {
    return ["owner", "support", "reference"].includes(topicRole ?? "");
  }
  return topicRole === "reference" && unlisted === true;
}
