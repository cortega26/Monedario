// Keyword → calculator intent map for the Reddit mention monitor.
//
// Each group maps a search query to the Monedario calculator that best answers it,
// so an alert can suggest the right link to share (per docs/operations/
// COMMUNITY_SEEDING_KIT.md). This is the intent layer F5Bot lacks: we only alert on
// queries we can actually help with, and we tell the responder which tool fits.
//
// `query` uses Reddit search syntax (supports OR, quotes). Keep groups focused so
// the suggested calculator is unambiguous.
//
// SCOPE CONTRACT (docs/adr/ADR-20260919-reddit-scope-contract.md, RM-005):
// this worker is POSTS-ONLY by construction (Reddit /search returns posts;
// we never poll /comments). Comment coverage — including calculator-bound
// terms from all 5 groups below when they appear in comments — belongs
// exclusively to the Python research system (reddit-monitor/). Lexical
// overlap between both keyword sets is intentional, NOT a violation:
// the partition is by access-pattern x channel, not by string. A thread
// surfacing in both Discord and the digest is expected, NOT a bug.

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

// Chilean subreddits every keyword group is restricted to (via restrict_sr).
// Keeps the monitor on-topic for Monedario's audience and cuts false positives
// from other Spanish-speaking markets that share AFP/finiquito/UF terminology
// (e.g. Peru, Colombia, Mexico).
export const TARGET_SUBREDDITS = [
  "chile",
  "RepublicaIndependiente",
  "merval",
  "Bolsa",
  "EstoyBienChile",
];

// Reddit multi-subreddit search accepts a "+"-joined path segment
// (r/chile+merval+.../search); this keeps the restriction to one request per
// keyword group instead of one per subreddit.
export const SUBREDDIT_SCOPE = TARGET_SUBREDDITS.join("+");
