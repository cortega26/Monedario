import { GLOSSARY_ALLOWLIST } from "./glossaryAllowlist";

const MAX_AUTO_LINKS = 5;

const EXCLUDED_TAG_NAMES = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "code",
  "pre",
  "table",
  "a",
]);

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function injectGlossaryLinks(html: string): string {
  // Pre-scan for existing data-glossary-term links to prevent double-injection
  const linkedSlugs = new Set<string>();
  for (const m of html.matchAll(/data-glossary-term="([^"]+)"/g)) {
    linkedSlugs.add(m[1]);
  }

  let totalLinks = 0;
  const excludedStack: string[] = [];
  const tokenRe = /(<[^>]*>)|([^<]+)/g;
  const parts: string[] = [];

  for (const match of html.matchAll(tokenRe)) {
    const [, tag, text] = match;

    if (tag !== undefined) {
      const tagNameMatch = tag.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/);
      if (tagNameMatch) {
        const tagName = tagNameMatch[1].toLowerCase();
        const isClosing = tag.startsWith("</");
        const isSelfClose =
          tag.endsWith("/>") || (VOID_ELEMENTS.has(tagName) && !isClosing);

        if (!isSelfClose) {
          if (isClosing) {
            if (
              excludedStack.length > 0 &&
              excludedStack[excludedStack.length - 1] === tagName
            ) {
              excludedStack.pop();
            }
          } else if (EXCLUDED_TAG_NAMES.has(tagName)) {
            excludedStack.push(tagName);
          }
        }
      }
      parts.push(tag);
    } else if (text !== undefined) {
      if (excludedStack.length > 0 || totalLinks >= MAX_AUTO_LINKS) {
        parts.push(text);
      } else {
        const result = injectIntoText(text, linkedSlugs, totalLinks);
        totalLinks += result.newLinks;
        parts.push(result.text);
      }
    }
  }

  return parts.join("");
}

function injectIntoText(
  text: string,
  linkedSlugs: Set<string>,
  currentLinks: number
): { text: string; newLinks: number } {
  const available = GLOSSARY_ALLOWLIST.filter(e => !linkedSlugs.has(e.slug));
  if (available.length === 0 || currentLinks >= MAX_AUTO_LINKS) {
    return { text, newLinks: 0 };
  }

  const pattern = available.map(e => `\\b${escapeRe(e.term)}\\b`).join("|");
  const re = new RegExp(pattern, "gi");

  let last = 0;
  let newLinks = 0;
  const parts: string[] = [];

  for (const m of text.matchAll(re)) {
    if (currentLinks + newLinks >= MAX_AUTO_LINKS) break;

    const matched = m[0];
    const entry = available.find(
      e => e.term.toLowerCase() === matched.toLowerCase()
    );
    if (!entry || linkedSlugs.has(entry.slug)) continue;

    const def = entry.shortDefinition.replace(/"/g, "&quot;");
    const titleAttr = ` title="${def}" data-tooltip="${def}"`;
    parts.push(text.slice(last, m.index));
    parts.push(
      `<a href="/glosario/${entry.slug}/" data-glossary-term="${entry.slug}" data-analytics-cta="glossary-inline-link" data-analytics-location="article_body" data-analytics-label="${entry.slug}" class="glossary-inline-link"${titleAttr}>${matched}</a>`
    );
    last = m.index! + matched.length;
    linkedSlugs.add(entry.slug);
    newLinks++;
  }

  parts.push(text.slice(last));
  return { text: parts.join(""), newLinks };
}
