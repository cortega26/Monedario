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

type GlossaryEntry = (typeof GLOSSARY_ALLOWLIST)[number];

interface GlossaryMatcher {
  re: RegExp;
  byLowerTerm: Map<string, GlossaryEntry>;
  /** linkedSlugs.size when built; the set only grows within a page. */
  linkedSize: number;
}

export function injectGlossaryLinks(html: string): string {
  // Pre-scan for existing data-glossary-term links to prevent double-injection
  const linkedSlugs = new Set<string>();
  for (const m of html.matchAll(/data-glossary-term="([^"]+)"/g)) {
    linkedSlugs.add(m[1]);
  }

  // One compiled RegExp + lookup Map per page, rebuilt only when a link is
  // emitted (the linked set only grows, so a size check detects staleness).
  // Built from exactly the same `available` array the per-node code used, so
  // output is byte-identical to rebuilding per text node.
  let matcher: GlossaryMatcher | null = null;
  const getMatcher = (): GlossaryMatcher | null => {
    if (matcher && matcher.linkedSize === linkedSlugs.size) return matcher;
    const available = GLOSSARY_ALLOWLIST.filter(e => !linkedSlugs.has(e.slug));
    if (available.length === 0) {
      matcher = null;
      return null;
    }
    const pattern = available.map(e => `\\b${escapeRe(e.term)}\\b`).join("|");
    const byLowerTerm = new Map<string, GlossaryEntry>();
    for (const e of available) {
      const key = e.term.toLowerCase();
      if (!byLowerTerm.has(key)) byLowerTerm.set(key, e);
    }
    matcher = {
      re: new RegExp(pattern, "gi"),
      byLowerTerm,
      linkedSize: linkedSlugs.size,
    };
    return matcher;
  };

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
        const result = injectIntoText(
          text,
          linkedSlugs,
          totalLinks,
          getMatcher
        );
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
  currentLinks: number,
  getMatcher: () => GlossaryMatcher | null
): { text: string; newLinks: number } {
  if (currentLinks >= MAX_AUTO_LINKS) {
    return { text, newLinks: 0 };
  }
  const matcher = getMatcher();
  if (!matcher) {
    return { text, newLinks: 0 };
  }

  const re = matcher.re;

  let last = 0;
  let newLinks = 0;
  const parts: string[] = [];

  for (const m of text.matchAll(re)) {
    if (currentLinks + newLinks >= MAX_AUTO_LINKS) break;

    const matched = m[0];
    const entry = matcher.byLowerTerm.get(matched.toLowerCase());
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
