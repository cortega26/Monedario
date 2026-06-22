export const CLUSTERS = [
  "ahorro-e-inversion",
  "impuestos-personas",
  "pensiones-afp",
  "deuda-credito",
  "presupuesto-control-financiero",
  "uf-costo-de-vida",
  "seguridad-financiera",
  "sueldo-remuneraciones",
  "empleo-ingresos",
  "bancos-fintech",
  "finanzas-migrantes",
  "general",
] as const;

export type Cluster = (typeof CLUSTERS)[number];
// Los clusters greenfield son válidos para frontmatter y sus hubs shell, pero no
// entran a la navegación global hasta completar sus condiciones de lanzamiento.
// Ver ADR-20260617-bancos-fintech-hub y ADR-20260622-finanzas-migrantes-hub.
export type HubCluster = Exclude<
  Cluster,
  "general" | "bancos-fintech" | "finanzas-migrantes"
>;
export type HubLayer =
  | "ingresos"
  | "prevision"
  | "ahorro-inversion"
  | "impuestos"
  | "deuda"
  | "bolsillo"
  | "otros";

export type GuideHubMeta = {
  nombre: string;
  descripcion: string;
  capa: HubLayer;
  homepageResumen: string;
};

export const GUIDE_HUB_ORDER: HubCluster[] = [
  "sueldo-remuneraciones",
  "empleo-ingresos",
  "presupuesto-control-financiero",
  "pensiones-afp",
  "deuda-credito",
  "uf-costo-de-vida",
  "ahorro-e-inversion",
  "impuestos-personas",
  "seguridad-financiera",
];

export const GUIDE_HUBS: Record<HubCluster, GuideHubMeta> = {
  "pensiones-afp": {
    nombre: "Pensiones y AFP",
    descripcion:
      "Sección sobre previsión obligatoria en Chile: cotización, fondos y decisiones que afectan tu pensión futura.",
    capa: "prevision",
    homepageResumen:
      "¿Cuánto cotizas, en qué fondo estás y cómo te afecta la reforma?",
  },
  "ahorro-e-inversion": {
    nombre: "Ahorro e inversión",
    descripcion:
      "Sección para aprender a ahorrar e invertir según instrumento, costo, impuestos y plazo.",
    capa: "ahorro-inversion",
    homepageResumen:
      "¿Dónde poner el excedente según plazo, riesgo e impuestos?",
  },
  "impuestos-personas": {
    nombre: "Impuestos para personas",
    descripcion:
      "Sección para declarar renta, revisar devoluciones y entender tus principales dudas tributarias.",
    capa: "impuestos",
    homepageResumen:
      "¿Cómo declarar, cuándo hay devolución y qué pagar como independiente?",
  },
  "deuda-credito": {
    nombre: "Deuda y crédito",
    descripcion:
      "Sección para entender el CAE, revisar tus deudas y tomar mejores decisiones de crédito.",
    capa: "deuda",
    homepageResumen: "¿Cuánto te cuesta la deuda real y cómo salir de ella?",
  },
  "presupuesto-control-financiero": {
    nombre: "Presupuesto y control financiero",
    descripcion:
      "Sección para ordenar ingresos, gastos y hábitos de control financiero antes de tomar decisiones más complejas.",
    capa: "ingresos",
    homepageResumen:
      "¿Cómo ordenar tu caja mensual y construir un presupuesto realista?",
  },
  "uf-costo-de-vida": {
    nombre: "UF, inflación y costo de vida",
    descripcion:
      "Sección para entender cómo se conectan UF, IPC y reajustes con tu bolsillo, tu arriendo y otros contratos indexados.",
    capa: "bolsillo",
    homepageResumen:
      "¿Cómo afecta la UF y la inflación a tu arriendo y contratos?",
  },
  "empleo-ingresos": {
    nombre: "Empleo e ingresos",
    descripcion:
      "Sección para cesantía, licencias médicas, finiquito y otros problemas que afectan tu ingreso laboral.",
    capa: "ingresos",
    homepageResumen:
      "¿Qué pasa con tu ingreso si te despiden, renuncias o te enfermas?",
  },
  "sueldo-remuneraciones": {
    nombre: "Sueldo y remuneraciones",
    descripcion:
      "Sección para entender tu sueldo líquido, la liquidación y los descuentos de cada mes.",
    capa: "ingresos",
    homepageResumen:
      "¿Por qué tu sueldo líquido es menor que el bruto y qué descuentan?",
  },
  "seguridad-financiera": {
    nombre: "Seguridad financiera",
    descripcion:
      "Sección para fraudes, cargos no reconocidos y protección de tus cuentas frente a suplantaciones o estafas.",
    capa: "otros",
    homepageResumen:
      "¿Qué hacer si detectas un cargo no reconocido o suplantación?",
  },
};

/** Type guard: is `cluster` one of the canonical guide hubs (i.e. not "general")? */
function isHubCluster(
  cluster: string | undefined | null
): cluster is HubCluster {
  return (
    typeof cluster === "string" &&
    cluster !== "general" &&
    cluster in GUIDE_HUBS
  );
}

/**
 * Canonical cluster → hub resolver. Returns the hub label and href derived from
 * `GUIDE_HUBS`, the single source of truth for guide hubs. Returns `null` for
 * missing or non-hub ("general") clusters so callers can fall back (e.g. to
 * `tagHubMap`) without diverging from the canonical names.
 */
export function getHubFromCluster(
  cluster: string | undefined | null
): { label: string; href: string } | null {
  if (!isHubCluster(cluster)) return null;
  return { label: GUIDE_HUBS[cluster].nombre, href: `/guias/${cluster}/` };
}
