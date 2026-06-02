// Keyword → calculator intent map for the Reddit mention monitor.
//
// Each group maps a search query to the Monedario calculator that best answers it,
// so an alert can suggest the right link to share (per docs/operations/
// COMMUNITY_SEEDING_KIT.md). This is the intent layer F5Bot lacks: we only alert on
// queries we can actually help with, and we tell the responder which tool fits.
//
// `query` uses Reddit search syntax (supports OR, quotes). Keep groups focused so
// the suggested calculator is unambiguous.

export interface KeywordGroup {
  /** Reddit search query (Reddit search operators allowed). */
  query: string;
  /** Path of the calculator/page that answers this intent. */
  calculator: string;
  /** Human label shown in the Discord alert. */
  label: string;
}

const SITE = "https://monedario.cl";

export const KEYWORD_GROUPS: KeywordGroup[] = [
  {
    query: '"comisión afp" OR "comisiones afp" OR "cuánto descuenta la afp" OR "cambiarse de afp"',
    calculator: `${SITE}/calculadoras/comisiones-afp/`,
    label: "Comparador de comisiones AFP",
  },
  {
    query: '"operación renta" OR "devolución de impuestos" OR "simulador renta" OR "formulario 22"',
    calculator: `${SITE}/calculadoras/operacion-renta/`,
    label: "Simulador Operación Renta",
  },
  {
    query: '"uf a pesos" OR "valor de la uf" OR "cuánto es la uf" OR "convertir uf"',
    calculator: `${SITE}/calculadoras/conversor-uf/`,
    label: "Conversor UF ↔ pesos",
  },
  {
    query: '"calcular finiquito" OR "cuánto me corresponde de finiquito" OR "indemnización despido"',
    calculator: `${SITE}/calculadoras/finiquito-indemnizacion/`,
    label: "Calculadora de finiquito",
  },
  {
    query: '"sueldo líquido" OR "de bruto a líquido" OR "cuánto me descuentan del sueldo"',
    calculator: `${SITE}/calculadoras/sueldo-liquido/`,
    label: "Calculadora de sueldo líquido",
  },
];

// Chilean subreddits worth restricting some searches to. A search without
// restrict_sr covers all of Reddit; these are for optional targeted passes.
export const TARGET_SUBREDDITS = [
  "chile",
  "RepublicaIndependiente",
  "merval",
  "Bolsa",
  "EstoyBienChile",
];
