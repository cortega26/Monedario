/**
 * Maps article tags to their primary hub.
 * Used by Breadcrumb.astro to show contextual hub breadcrumbs.
 * First matching tag wins — order within each article's tags array determines priority.
 */
export const tagHubMap: Record<string, { label: string; href: string }> = {
  // Sueldo y remuneraciones
  sueldo: { label: "Sueldo y Remuneraciones", href: "/guias/sueldo-remuneraciones/" },
  liquidacion: { label: "Sueldo y Remuneraciones", href: "/guias/sueldo-remuneraciones/" },
  descuentos: { label: "Sueldo y Remuneraciones", href: "/guias/sueldo-remuneraciones/" },
  afc: { label: "Sueldo y Remuneraciones", href: "/guias/sueldo-remuneraciones/" },
  honorarios: { label: "Sueldo y Remuneraciones", href: "/guias/sueldo-remuneraciones/" },
  boletas: { label: "Sueldo y Remuneraciones", href: "/guias/sueldo-remuneraciones/" },

  // Empleo e ingresos
  finiquito: { label: "Empleo e Ingresos", href: "/guias/empleo-ingresos/" },
  indemnizacion: { label: "Empleo e Ingresos", href: "/guias/empleo-ingresos/" },
  cesantia: { label: "Empleo e Ingresos", href: "/guias/empleo-ingresos/" },
  despido: { label: "Empleo e Ingresos", href: "/guias/empleo-ingresos/" },
  contrato: { label: "Empleo e Ingresos", href: "/guias/empleo-ingresos/" },
  "empleo-ingresos": { label: "Empleo e Ingresos", href: "/guias/empleo-ingresos/" },
  "primer-empleo": { label: "Empleo e Ingresos", href: "/guias/empleo-ingresos/" },
  "licencia-medica": { label: "Empleo e Ingresos", href: "/guias/empleo-ingresos/" },

  // Deuda y crédito
  deuda: { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  deudas: { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  dicom: { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  cmf: { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  "boletin-comercial": { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  credito: { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  creditos: { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  "credito-hipotecario": { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  dividendo: { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  cae: { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  renegociacion: { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  sobreendeudamiento: { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  tmc: { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },
  "historial-crediticio": { label: "Deuda y Crédito", href: "/guias/deuda-credito/" },

  // Impuestos
  impuestos: { label: "Impuestos Personas", href: "/guias/impuestos-personas/" },
  "operacion-renta": { label: "Impuestos Personas", href: "/guias/impuestos-personas/" },
  f22: { label: "Impuestos Personas", href: "/guias/impuestos-personas/" },
  sii: { label: "Impuestos Personas", href: "/guias/impuestos-personas/" },
  devolucion: { label: "Impuestos Personas", href: "/guias/impuestos-personas/" },
  retencion: { label: "Impuestos Personas", href: "/guias/impuestos-personas/" },
  "rentas-mixtas": { label: "Impuestos Personas", href: "/guias/impuestos-personas/" },
  tgr: { label: "Impuestos Personas", href: "/guias/impuestos-personas/" },

  // Pensiones y AFP
  afp: { label: "Pensiones y AFP", href: "/guias/pensiones-afp/" },
  pensiones: { label: "Pensiones y AFP", href: "/guias/pensiones-afp/" },
  jubilacion: { label: "Pensiones y AFP", href: "/guias/pensiones-afp/" },
  "cambio-afp": { label: "Pensiones y AFP", href: "/guias/pensiones-afp/" },
  cartola: { label: "Pensiones y AFP", href: "/guias/pensiones-afp/" },
  fondos: { label: "Pensiones y AFP", href: "/guias/pensiones-afp/" },
  "fondos-generacionales": { label: "Pensiones y AFP", href: "/guias/pensiones-afp/" },
  "reforma-pensiones": { label: "Pensiones y AFP", href: "/guias/pensiones-afp/" },
  "reforma-previsional": { label: "Pensiones y AFP", href: "/guias/pensiones-afp/" },
  "cuenta-2": { label: "Pensiones y AFP", href: "/guias/pensiones-afp/" },
  comisiones: { label: "Pensiones y AFP", href: "/guias/pensiones-afp/" },
  suseso: { label: "Pensiones y AFP", href: "/guias/pensiones-afp/" },

  // Ahorro e inversión
  ahorro: { label: "Ahorro e Inversión", href: "/guias/ahorro-e-inversion/" },
  inversion: { label: "Ahorro e Inversión", href: "/guias/ahorro-e-inversion/" },
  inversiones: { label: "Ahorro e Inversión", href: "/guias/ahorro-e-inversion/" },
  etf: { label: "Ahorro e Inversión", href: "/guias/ahorro-e-inversion/" },
  bolsa: { label: "Ahorro e Inversión", href: "/guias/ahorro-e-inversion/" },
  "fondos-mutuos": { label: "Ahorro e Inversión", href: "/guias/ahorro-e-inversion/" },
  "deposito-a-plazo": { label: "Ahorro e Inversión", href: "/guias/ahorro-e-inversion/" },
  "interes-compuesto": { label: "Ahorro e Inversión", href: "/guias/ahorro-e-inversion/" },
  "nasdaq-100": { label: "Ahorro e Inversión", href: "/guias/ahorro-e-inversion/" },
  corredoras: { label: "Ahorro e Inversión", href: "/guias/ahorro-e-inversion/" },

  // UF y costo de vida
  uf: { label: "UF y Costo de Vida", href: "/guias/uf-costo-de-vida/" },
  utm: { label: "UF y Costo de Vida", href: "/guias/uf-costo-de-vida/" },
  uta: { label: "UF y Costo de Vida", href: "/guias/uf-costo-de-vida/" },
  ipc: { label: "UF y Costo de Vida", href: "/guias/uf-costo-de-vida/" },
  inflacion: { label: "UF y Costo de Vida", href: "/guias/uf-costo-de-vida/" },
  arriendos: { label: "UF y Costo de Vida", href: "/guias/uf-costo-de-vida/" },
  vivienda: { label: "UF y Costo de Vida", href: "/guias/uf-costo-de-vida/" },
  presupuesto: { label: "UF y Costo de Vida", href: "/guias/uf-costo-de-vida/" },
  "costo-de-vida": { label: "UF y Costo de Vida", href: "/guias/uf-costo-de-vida/" },
  "control-financiero": { label: "UF y Costo de Vida", href: "/guias/uf-costo-de-vida/" },
  "gasto-hormiga": { label: "UF y Costo de Vida", href: "/guias/uf-costo-de-vida/" },

  // Seguridad financiera
  fraude: { label: "Seguridad Financiera", href: "/guias/seguridad-financiera/" },
  smishing: { label: "Seguridad Financiera", href: "/guias/seguridad-financiera/" },
  vishing: { label: "Seguridad Financiera", href: "/guias/seguridad-financiera/" },
  suplantacion: { label: "Seguridad Financiera", href: "/guias/seguridad-financiera/" },
  "ley-20009": { label: "Seguridad Financiera", href: "/guias/seguridad-financiera/" },
  "seguridad-financiera": { label: "Seguridad Financiera", href: "/guias/seguridad-financiera/" },
  tarjetas: { label: "Seguridad Financiera", href: "/guias/seguridad-financiera/" },

  // Salud
  salud: { label: "Salud y Previsión", href: "/guias/sueldo-remuneraciones/" },
  fonasa: { label: "Salud y Previsión", href: "/guias/sueldo-remuneraciones/" },
  isapre: { label: "Salud y Previsión", href: "/guias/sueldo-remuneraciones/" },
  cobertura: { label: "Salud y Previsión", href: "/guias/sueldo-remuneraciones/" },
};

/**
 * Returns the hub for the first matching tag, or null if none matches.
 */
export function getHubFromTags(
  tags: string[]
): { label: string; href: string } | null {
  for (const tag of tags) {
    const normalized = tag.trim().toLowerCase();
    if (tagHubMap[normalized]) return tagHubMap[normalized];
  }
  return null;
}
