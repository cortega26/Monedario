/**
 * Serializa JSON-LD de forma segura para inyección vía set:html en
 * <script type="application/ld+json">. JSON.stringify no escapa '<': un
 * valor con '</script>' terminaría el elemento. Escaparlo como \u003c es
 * la mitigación estándar — el parser JSON lo revierte sin cambio semántico.
 *
 * JSON.stringify puede devolver undefined (input undefined/function/symbol):
 * en ese caso no hay nada que inyectar — devuelve "" en vez de crashear el
 * build con un TypeError oscuro.
 */
export function serializeJsonLd(value: unknown): string {
  const serialized = JSON.stringify(value);
  return serialized ? serialized.replace(/</g, "\\u003c") : "";
}
