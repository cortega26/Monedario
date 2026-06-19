/**
 * Pure helpers for parsing Spanish long-form dates out of scraped HTML/text.
 * No I/O, no side effects — safe to import in tests.
 */

const MONTHS = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9, // accepted variant
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

/**
 * Parses a Spanish long date like "1 de octubre de 2025" into ISO "2025-10-01".
 * Returns null if no such date is present. Month names are matched
 * case-insensitively; weekday prefixes and surrounding text are ignored.
 * @param {string} text
 * @returns {string | null}
 */
export function parseSpanishLongDate(text) {
  if (typeof text !== "string") return null;
  const match = text.match(
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i
  );
  if (!match) return null;
  const day = Number(match[1]);
  const month = MONTHS[match[2].toLowerCase()];
  const year = Number(match[3]);
  if (!month || day < 1 || day > 31) return null;
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  // Reject impossible calendar dates (e.g. 31 de febrero).
  const asDate = new Date(`${iso}T00:00:00.000Z`);
  if (
    Number.isNaN(asDate.getTime()) ||
    asDate.toISOString().slice(0, 10) !== iso
  ) {
    return null;
  }
  return iso;
}

/**
 * Locates the AFP "A partir de ..." effective-date sentence in the news HTML and
 * returns the parsed ISO date, or null if not found. Anchors on "A partir de" so
 * an unrelated date elsewhere on the page is not picked up.
 * @param {string} html
 * @returns {string | null}
 */
export function extractEffectiveDateFromHtml(html) {
  if (typeof html !== "string") return null;
  // Grab the text from "A partir de" up to the next period (sentence-bounded),
  // tolerant of intervening HTML tags and the "hoy, <weekday>" preamble.
  const sentence = html.match(/A partir de[\s\S]{0,160}?\d{4}/i);
  if (!sentence) return null;
  return parseSpanishLongDate(sentence[0]);
}
