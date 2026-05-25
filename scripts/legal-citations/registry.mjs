export const BCN_HISTORY_BASE_URL = "https://www.bcn.cl/historiadelaley/nc/historia-de-la-ley";

export const LEGAL_CITATION_REGISTRY = [
  {
    slug: "ley-18010-credito-dinero",
    numero: "18.010",
    historyPageId: "7525",
    canonicalIdNorma: "29438",
    aliases: ["29371", "29748"],
  },
  {
    slug: "ley-19496-proteccion-consumidor",
    numero: "19.496",
    historyPageId: "6746",
    canonicalIdNorma: "61438",
    aliases: [],
  },
  {
    slug: "ley-19628-proteccion-datos",
    numero: "19.628",
    historyPageId: "6814",
    canonicalIdNorma: "141599",
    aliases: [],
  },
  {
    slug: "ley-19728-seguro-cesantia",
    numero: "19.728",
    historyPageId: "6053",
    canonicalIdNorma: "184979",
    aliases: ["196871"],
  },
  {
    slug: "ley-20009-tarjetas-fraude",
    numero: "20.009",
    historyPageId: "5611",
    canonicalIdNorma: "236736",
    aliases: ["237343", "236552"],
  },
  {
    slug: "ley-20555-sernac-financiero",
    numero: "20.555",
    historyPageId: "4528",
    canonicalIdNorma: "1032865",
    aliases: ["1038840"],
  },
  {
    slug: "ley-20575-datos-comerciales",
    numero: "20.575",
    historyPageId: "4533",
    canonicalIdNorma: "1037366",
    aliases: ["1035276"],
  },
  {
    slug: "ley-21133-honorarios-retencion",
    numero: "21.133",
    historyPageId: "7623",
    canonicalIdNorma: "1128420",
    aliases: ["1126386", "1129870"],
  },
  {
    slug: "ley-21236-portabilidad-financiera",
    numero: "21.236",
    historyPageId: "7757",
    canonicalIdNorma: "1146340",
    aliases: ["1147782"],
  },
  {
    slug: "ley-21521-fintech",
    numero: "21.521",
    historyPageId: "8102",
    canonicalIdNorma: "1187323",
    aliases: ["1181122"],
  },
  {
    slug: "ley-21680-registro-deuda-consolidada",
    numero: "21.680",
    historyPageId: "8310",
    canonicalIdNorma: "1204681",
    aliases: ["1202320"],
  },
  {
    slug: "ley-21719-proteccion-datos-modernizacion",
    numero: "21.719",
    historyPageId: "8352",
    canonicalIdNorma: "1209272",
    aliases: [],
  },
  {
    slug: "proyecto-reforma-previsional-2025",
    numero: "21.735",
    historyPageId: "8372",
    canonicalIdNorma: "1212060",
    aliases: [],
  },
  {
    slug: "ley-20255-reforma-previsional-2008",
    numero: "20.255",
    historyPageId: "5981",
    canonicalIdNorma: "269892",
    aliases: [],
  },
  {
    slug: "codigo-del-trabajo",
    numero: "CÓDIGO DEL TRABAJO",
    historyPageId: null,
    canonicalIdNorma: "207436",
    aliases: [],
  },
  {
    slug: "dfl-1-1998-impuesto-territorial",
    numero: "DFL-1/1998",
    historyPageId: null,
    canonicalIdNorma: "128563",
    aliases: [],
  },
  {
    slug: "ley-18469-fonasa",
    numero: "18.469",
    historyPageId: null,
    canonicalIdNorma: "29872",
    aliases: ["29581"],
  },
  {
    slug: "ley-18933-isapres",
    numero: "18.933",
    historyPageId: "7333",
    canonicalIdNorma: "30304",
    aliases: ["30208"],
  },
  {
    slug: "ley-20027-credito-aval-estado",
    numero: "20.027",
    historyPageId: "5827",
    canonicalIdNorma: "238989",
    aliases: [],
  },
  {
    slug: "ley-21130-modernizacion-bancaria",
    numero: "21.130",
    historyPageId: "7613",
    canonicalIdNorma: "1129754",
    aliases: [],
  },
  {
    slug: "ley-21561-reduccion-jornada",
    numero: "21.561",
    historyPageId: "8153",
    canonicalIdNorma: "1195526",
    aliases: [],
  },
];

/**
 * BCN idNorma values that appear in content but belong to laws without a
 * dedicated page in src/data/laws/. Each entry must be manually verified
 * against BCN before addition.
 *
 * Format: { idNorma, label } — label is for human reference only.
 */
export const KNOWN_IDS_WITHOUT_LAW_PAGES = [
  { idNorma: "7054", label: "DL 3.063 — Ley de Rentas Municipales" },
  { idNorma: "1171923", label: "Ley 21.419 — Crea la Pensión Garantizada Universal" },
];

export function getHistoryUrl(historyPageId) {
  return `${BCN_HISTORY_BASE_URL}/${historyPageId}/`;
}
