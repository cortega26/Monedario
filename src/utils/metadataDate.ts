import { SITE } from "@/config";

export type MetadataDateInput = Date | string;

type MetadataDateFormat = "short" | "long";

function toDate(value: MetadataDateInput): Date {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`[metadataDate] Invalid date input: ${String(value)}`);
  }
  return parsed;
}

function resolveDisplayTimeZone(date: Date): string {
  const isUtcMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0;

  return isUtcMidnight ? "UTC" : SITE.timezone;
}

export function formatMetadataDate(
  value: MetadataDateInput,
  format: MetadataDateFormat = "short",
  locale = "es-CL"
): string {
  const date = toDate(value);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: format,
    year: "numeric",
    timeZone: resolveDisplayTimeZone(date),
  }).format(date);
}

export function toMetadataDateTime(value: MetadataDateInput): string {
  return toDate(value).toISOString();
}
