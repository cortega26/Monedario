export declare const UF_MAX_LAG_DAYS: number;
export declare const DOLAR_MAX_LAG_DAYS: number;
export declare const SNAPSHOT_MAX_AGE_HOURS: number;
export declare const SNAPSHOT_URL: string;
export declare const EXPIRY_WARNING_DAYS: number;

export interface SiteDates {
  uf: string | null;
  dolar: string | null;
}

export interface ExpiringException {
  url: string;
  expiresAt: string;
  daysLeft: number;
}

export interface ExceptionDocument {
  exceptions?: Array<{ url?: string; decision?: string; expiresAt?: string }>;
}

export declare function parseSiteDates(html: string): SiteDates;

export declare function evaluateLiveFreshness(input: {
  html: string;
  now?: Date;
}): string[];

export declare function evaluateSnapshotHeartbeat(input: {
  snapshot: { capturedAt?: string } | null | undefined;
  now?: Date;
}): string[];

export declare function findExpiringExceptions(
  document: ExceptionDocument | null | undefined,
  now?: Date,
  withinDays?: number
): ExpiringException[];

export declare function evaluateExceptionExpiry(input: {
  document: ExceptionDocument | null | undefined;
  now?: Date;
}): string[];
