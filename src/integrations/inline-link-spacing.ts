import type { AstroIntegration } from "astro";
import { glob } from "node:fs/promises";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const READING_TAGS = new Set([
  "p",
  "li",
  "blockquote",
  "figcaption",
  "dd",
  "td",
  "th",
]);
const EXCLUDED_TAGS = new Set(["code", "pre", "script", "style", "textarea"]);
const VOID_TAGS = new Set([
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

// Tag plausible: '<' seguido de letra (apertura/cierre), '/' (cierre) o '!'
// (comentarios/declaraciones). El contenido del tag excluye '<' (un tag válido
// nunca contiene otro '<'; con '[^>]*' una comparación JS como `a<b && c`
// dentro de un <script> tragaba el `</script>` y dejaba excludedStack sin pop).
// Todo lo demás es texto — incluye '<' literal (alternativa (.) final).
const TAG_OR_TEXT = /(<[a-zA-Z\/!][^<>]*>)|([^<]+)|(.)/g;
const TAG_NAME = /^<\/?([a-zA-Z][a-zA-Z0-9-]*)/;
const NEEDS_SPACE_BEFORE_LINK = /[\p{L}\p{N}\p{M}.,:;…—!?]$/u;
const STARTS_WITH_WORD = /^[\p{L}\p{N}\p{M}]/u;

function tagDetails(tag: string) {
  const match = tag.match(TAG_NAME);
  if (!match) return null;

  const name = match[1].toLowerCase();
  const closing = tag.startsWith("</");
  const selfClosing = tag.endsWith("/>") || (VOID_TAGS.has(name) && !closing);
  return { name, closing, selfClosing };
}

function isHardTextBoundary(name: string): boolean {
  return READING_TAGS.has(name) || EXCLUDED_TAGS.has(name) || name === "br";
}

function lastVisibleCharacter(parts: string[]): string | null {
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index];
    const details = tagDetails(part);

    if (details) {
      if (isHardTextBoundary(details.name)) return null;
      continue;
    }

    return part.at(-1) ?? null;
  }

  return null;
}

/**
 * Adds missing spaces at direct text-to-anchor boundaries in readable HTML.
 *
 * Astro intentionally strips template whitespace around inline elements. This
 * pass restores word boundaries after rendering, while keeping punctuation such
 * as `</a>,` and `</a>.` untouched.
 */
export function normalizeInlineLinkSpacing(html: string): string {
  const parts: string[] = [];
  const readingStack: string[] = [];
  const excludedStack: string[] = [];
  let needsSpaceAfterAnchor = false;

  for (const match of html.matchAll(TAG_OR_TEXT)) {
    const [, tag, text, stray] = match;

    if (tag !== undefined) {
      const details = tagDetails(tag);
      const isReadable = readingStack.length > 0 && excludedStack.length === 0;

      if (
        details?.name === "a" &&
        !details.closing &&
        isReadable &&
        NEEDS_SPACE_BEFORE_LINK.test(lastVisibleCharacter(parts) ?? "")
      ) {
        parts.push(" ");
      }

      parts.push(tag);
      if (details?.name === "a" && details.closing) {
        needsSpaceAfterAnchor = true;
      } else if (details?.name === "a") {
        needsSpaceAfterAnchor = false;
      } else if (details && isHardTextBoundary(details.name)) {
        needsSpaceAfterAnchor = false;
      }

      if (!details || details.selfClosing) continue;
      if (details.closing) {
        if (readingStack.at(-1) === details.name) readingStack.pop();
        if (excludedStack.at(-1) === details.name) excludedStack.pop();
      } else {
        if (READING_TAGS.has(details.name)) readingStack.push(details.name);
        if (EXCLUDED_TAGS.has(details.name)) excludedStack.push(details.name);
      }
      continue;
    }

    const textPart = text ?? stray;
    if (textPart !== undefined) {
      if (
        needsSpaceAfterAnchor &&
        readingStack.length > 0 &&
        excludedStack.length === 0 &&
        STARTS_WITH_WORD.test(textPart)
      ) {
        parts.push(" ");
      }
      parts.push(textPart);
      needsSpaceAfterAnchor = false;
    }
  }

  return parts.join("");
}

export function inlineLinkSpacingIntegration(): AstroIntegration {
  return {
    name: "inline-link-spacing",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        let updatedPages = 0;

        for await (const file of glob("**/*.html", { cwd: distDir })) {
          const filePath = join(distDir, file);
          const source = readFileSync(filePath, "utf8");
          const normalized = normalizeInlineLinkSpacing(source);
          if (normalized !== source) {
            writeFileSync(filePath, normalized, "utf8");
            updatedPages += 1;
          }
        }

        logger.info(
          `inline-link-spacing: normalized ${updatedPages} static HTML page(s)`
        );
      },
    },
  };
}
