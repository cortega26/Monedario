export const GLOSSARY_ALLOWLIST = [
  { term: "AFP", slug: "afp" },
  { term: "AFC", slug: "afc" },
  { term: "UF", slug: "uf" },
  { term: "UTM", slug: "utm" },
  { term: "CAE", slug: "cae" },
  { term: "DICOM", slug: "dicom" },
  { term: "Finiquito", slug: "finiquito" },
  { term: "APV", slug: "apv" },
  { term: "ETF", slug: "etf" },
  { term: "ETFs", slug: "etf" },
  { term: "GES", slug: "ges" },
  { term: "CAEC", slug: "caec" },
  { term: "CIC", slug: "cic" },
  { term: "IPC", slug: "ipc" },
  { term: "SII", slug: "sii" },
  { term: "CMF", slug: "cmf" },
  { term: "Fondo de emergencia", slug: "fondo-emergencia" },
  { term: "Liquidez", slug: "liquidez" },
  { term: "Volatilidad", slug: "volatilidad" },
  { term: "Custodia", slug: "custodia" },
  { term: "Spread", slug: "spread" },
  { term: "Rescate", slug: "rescate" },
  { term: "Corredor de bolsa", slug: "corredor-bolsa" },
  { term: "Cuenta 2", slug: "cuenta-2" },
  { term: "Seguro de cesantía", slug: "seguro-cesantia" },
  { term: "Copago", slug: "copago" },
] as const satisfies ReadonlyArray<{ term: string; slug: string }>;

export function resolveGlossarySlug(term: string): string | undefined {
  const normalized = term.trim().toLowerCase();
  return GLOSSARY_ALLOWLIST.find(e => e.term.toLowerCase() === normalized)
    ?.slug;
}
