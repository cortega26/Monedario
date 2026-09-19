// Discord webhook formatting + delivery for Reddit mention alerts.
//
// One embed per match: post title (linked), subreddit, score, the suggested
// Monedario calculator to share, and a reminder to follow the seeding kit
// (value-first, not spam). Embeds are batched (Discord allows up to 10 per
// webhook message) to stay within rate limits.

import type { RedditPost } from "./redditClient";

export interface Match {
  post: RedditPost;
  /** Calculator URL to suggest in the reply. */
  calculator: string;
  /** Human label of the calculator. */
  calculatorLabel: string;
}

export interface DiscordEmbed {
  title: string;
  url: string;
  description: string;
  fields: Array<{ name: string; value: string; inline?: boolean }>;
}

/** Builds a single Discord embed from a match. Pure — testable. */
export function buildEmbed(match: Match): DiscordEmbed {
  const { post } = match;
  const title = post.title.length > 240 ? `${post.title.slice(0, 237)}…` : post.title;
  return {
    title,
    url: post.permalink,
    description: `Posible oportunidad de siembra en **r/${post.subreddit}** · score ${post.score}`,
    fields: [
      { name: "Calculadora sugerida", value: `[${match.calculatorLabel}](${match.calculator})` },
      {
        name: "Recordatorio",
        value: "Responde con valor primero; el link va al final. Ver kit de siembra.",
      },
    ],
  };
}

/**
 * Splits items into chunks of `size` (default 10, the Discord per-message
 * embed limit). Generic so callers can chunk matches directly. Pure.
 */
export function chunkEmbeds<T>(items: T[], size = 10): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

export interface PostAlertResult {
  delivered: Match[];
  error: Error | null;
}

/** Discord per-message embed limit (also the delivery batch size). */
export const DISCORD_BATCH_LIMIT = 10;

/**
 * Cap for a single Retry-After wait. Discord usually answers in seconds;
 * capping keeps one slow batch from eating the worker's execution budget.
 */
const MAX_RETRY_AFTER_MS = 30_000;

/**
 * Parses a Retry-After response header (delay-seconds form, which is what
 * Discord sends) into milliseconds. Returns null when absent or unparsable.
 * Pure — testable.
 */
export function parseRetryAfterMs(header: string | null): number | null {
  if (header === null) return null;
  const seconds = Number(header.trim());
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
}

function sendBatch(
  webhookUrl: string,
  batch: Match[],
  timeoutMs: number
): Promise<Response> {
  return fetch(webhookUrl, {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Monedario · escucha Reddit",
      embeds: batch.map(buildEmbed),
    }),
  });
}

// BATCH POLICY (RM-006w / RM-011d): batches go out sequentially and delivery
// STOPS at the first permanently-failed batch — remaining batches are NOT
// attempted in this run. Undelivered matches stay unmarked in KV (see
// index.ts), so the next cron retries them. This preserves the existing
// stop-on-first-failure semantics; switching to attempt-remaining-batches is
// out of scope (it would change delivery semantics without an ADR).
// Within a single batch, a 429 or 5xx carrying Retry-After is honored ONCE
// (one wait + one retry) before giving up the batch to the next cron.
// At-least-once semantics: a crash between a successful POST and its markSeen
// may re-alert an already-delivered match; duplicates are the accepted cost
// of never silently dropping an alert.
export async function postAlert(
  webhookUrl: string,
  matches: Match[],
  timeoutMs = 10_000,
  sleep: (ms: number) => Promise<void> = ms =>
    new Promise(resolve => setTimeout(resolve, ms))
): Promise<PostAlertResult> {
  const delivered: Match[] = [];
  if (matches.length === 0) return { delivered, error: null };

  for (const batch of chunkEmbeds(matches, DISCORD_BATCH_LIMIT)) {
    let res: Response;
    try {
      res = await sendBatch(webhookUrl, batch, timeoutMs);
    } catch (err) {
      return { delivered, error: err instanceof Error ? err : new Error(String(err)) };
    }
    if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
      const waitMs = parseRetryAfterMs(res.headers.get("Retry-After"));
      if (waitMs !== null) {
        await sleep(waitMs);
        try {
          res = await sendBatch(webhookUrl, batch, timeoutMs);
        } catch (err) {
          return { delivered, error: err instanceof Error ? err : new Error(String(err)) };
        }
      }
    }
    if (!res.ok && res.status !== 204) {
      return {
        delivered,
        error: new Error(`Discord webhook failed (${res.status}): ${await res.text()}`),
      };
    }
    delivered.push(...batch);
  }
  return { delivered, error: null };
}
