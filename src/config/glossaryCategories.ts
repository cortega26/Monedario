export type GlossaryCategoryId =
  | "prevision-pensiones"
  | "empleo-remuneraciones"
  | "impuestos"
  | "deuda-credito"
  | "ahorro-inversion"
  | "vivienda-hipotecario"
  | "indicadores"
  | "salud"
  | "banca-seguridad";

export const GLOSSARY_CATEGORY_ORDER: GlossaryCategoryId[] = [
  "prevision-pensiones",
  "empleo-remuneraciones",
  "impuestos",
  "deuda-credito",
  "ahorro-inversion",
  "vivienda-hipotecario",
  "indicadores",
  "salud",
  "banca-seguridad",
];

export const GLOSSARY_CATEGORY_LABELS: Record<GlossaryCategoryId, string> = {
  "prevision-pensiones": "Previsión y pensiones",
  "empleo-remuneraciones": "Empleo y remuneraciones",
  impuestos: "Impuestos",
  "deuda-credito": "Deuda y crédito",
  "ahorro-inversion": "Ahorro e inversión",
  "vivienda-hipotecario": "Vivienda e hipotecario",
  indicadores: "Indicadores y costo de vida",
  salud: "Salud previsional",
  "banca-seguridad": "Banca, trámites y seguridad",
};

export const GLOSSARY_CATEGORY_BY_SLUG: Record<string, GlossaryCategoryId> = {
  afp: "prevision-pensiones",
  apv: "prevision-pensiones",
  "cuenta-2": "prevision-pensiones",
  multifondo: "prevision-pensiones",
  "tope-imponible": "prevision-pensiones",
  afc: "prevision-pensiones",
  cic: "prevision-pensiones",
  "fondo-solidario": "prevision-pensiones",
  "seguro-cesantia": "prevision-pensiones",
  finiquito: "empleo-remuneraciones",
  gratificacion: "empleo-remuneraciones",
  indemnizacion: "empleo-remuneraciones",
  "sueldo-bruto": "empleo-remuneraciones",
  "renta-imponible": "empleo-remuneraciones",
  "boleta-honorarios": "impuestos",
  "global-complementario": "impuestos",
  "impuesto-unico": "impuestos",
  iva: "impuestos",
  "operacion-renta": "impuestos",
  sii: "impuestos",
  uta: "impuestos",
  cae: "deuda-credito",
  caec: "deuda-credito",
  "credito-aval-estado": "deuda-credito",
  ctc: "deuda-credito",
  dicom: "deuda-credito",
  lpc: "deuda-credito",
  spread: "deuda-credito",
  tmc: "deuda-credito",
  "corredor-bolsa": "ahorro-inversion",
  custodia: "ahorro-inversion",
  etf: "ahorro-inversion",
  "fondo-emergencia": "ahorro-inversion",
  "fondo-mutuo": "ahorro-inversion",
  liquidez: "ahorro-inversion",
  "renta-variable": "ahorro-inversion",
  rescate: "ahorro-inversion",
  volatilidad: "ahorro-inversion",
  "credito-hipotecario": "vivienda-hipotecario",
  "dividendo-hipotecario": "vivienda-hipotecario",
  inflacion: "indicadores",
  ipc: "indicadores",
  tpm: "indicadores",
  uf: "indicadores",
  utm: "indicadores",
  copago: "salud",
  fonasa: "salud",
  ges: "salud",
  isapre: "salud",
  "clave-unica": "banca-seguridad",
  cmf: "banca-seguridad",
  "cuenta-rut": "banca-seguridad",
  sbif: "banca-seguridad",
  sernac: "banca-seguridad",
};
