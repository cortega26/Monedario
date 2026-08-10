/**
 * Serializa JSON-LD de forma segura para inyección vía set:html en
 * <script type="application/ld+json">. JSON.stringify no escapa '<': un
 * valor con '</script>' terminaría el elemento. Escaparlo como \u003c es
 * la mitigación estándar — el parser JSON lo revierte sin cambio semántico.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
