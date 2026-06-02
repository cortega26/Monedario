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

/** Splits embeds into chunks of 10 (Discord per-message limit). Pure. */
export function chunkEmbeds(embeds: DiscordEmbed[], size = 10): DiscordEmbed[][] {
  const out: DiscordEmbed[][] = [];
  for (let i = 0; i < embeds.length; i += size) {
    out.push(embeds.slice(i, i + size));
  }
  return out;
}

export async function postAlert(
  webhookUrl: string,
  matches: Match[],
  timeoutMs = 10_000
): Promise<void> {
  if (matches.length === 0) return;
  const embeds = matches.map(buildEmbed);
  for (const batch of chunkEmbeds(embeds)) {
    const res = await fetch(webhookUrl, {
      method: "POST",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Monedario · escucha Reddit",
        embeds: batch,
      }),
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`Discord webhook failed (${res.status}): ${await res.text()}`);
    }
  }
}
