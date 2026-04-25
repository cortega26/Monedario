export const GLOSSARY_ALLOWLIST = [
  { term: "AFP", slug: "afp" },
  { term: "AFC", slug: "afc" },
  { term: "UF", slug: "uf" },
  { term: "UTM", slug: "utm" },
  { term: "CAE", slug: "cae" },
  { term: "DICOM", slug: "dicom" },
  { term: "Finiquito", slug: "finiquito" },
  { term: "APV", slug: "apv" },
  { term: "IPC", slug: "ipc" },
  { term: "SII", slug: "sii" },
  { term: "CMF", slug: "cmf" },
] as const satisfies ReadonlyArray<{ term: string; slug: string }>;

export function resolveGlossarySlug(term: string): string | undefined {
  const normalized = term.trim().toLowerCase();
  return GLOSSARY_ALLOWLIST.find(e => e.term.toLowerCase() === normalized)
    ?.slug;
}
