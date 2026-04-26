// Rule engine for contextual "Next Best Step" CTAs.
// Authoritative spec: docs/adr/ADR-20260416-next-best-step-framework.md
// Rule catalog: src/data/nextBestStep/rules.ts

import type { UserProfileV1 } from "./userProfile";

export interface PageContext {
  calculatorSlug: string;
  currentHref: string;
}

export interface Suggestion {
  id: string;
  priority: number;
  href: string;
  headline: string;
  rationale: string;
  ctaLabel: string;
  ymylTag?: "tax" | "labor" | "pension" | "credit";
}

export interface Rule {
  id: string;
  when: (profile: UserProfileV1, ctx: PageContext) => boolean;
  suggest: (profile: UserProfileV1, ctx: PageContext) => Omit<Suggestion, "id" | "priority">;
  priority: number;
  mutexGroup?: string;
}

function normalizeHref(href: string): string {
  const withLeading = href.startsWith("/") ? href : `/${href}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

export function evaluate(
  profile: UserProfileV1,
  ctx: PageContext,
  rules: Rule[],
  maxSuggestions = 2
): Suggestion[] {
  const currentHref = normalizeHref(ctx.currentHref);
  const seenMutexGroups = new Set<string>();
  const suggestions: Suggestion[] = [];

  const sorted = [...rules].sort((a, b) => b.priority - a.priority);

  for (const rule of sorted) {
    if (suggestions.length >= maxSuggestions) break;
    if (!rule.when(profile, ctx)) continue;
    if (rule.mutexGroup && seenMutexGroups.has(rule.mutexGroup)) continue;

    const partial = rule.suggest(profile, ctx);
    if (normalizeHref(partial.href) === currentHref) continue;

    if (rule.mutexGroup) seenMutexGroups.add(rule.mutexGroup);

    suggestions.push({ id: rule.id, priority: rule.priority, ...partial });
  }

  return suggestions;
}
