import type { APIRoute } from "astro";
import { readFileSync } from "node:fs";
import path from "node:path";

interface SnapshotHealth {
  capturedAt?: string;
  lastUpdated?: string;
  indicatorUpdatedAt?: Record<string, string | undefined>;
  uf?: number;
  dolar?: number;
}

/**
 * Public health artifact generated at build time. The repository is private,
 * so the deploy-health Worker cannot read `raw.githubusercontent.com`; this
 * endpoint exposes only the published snapshot metadata (the same values the
 * site already shows). URL-freeze exceptions are private governance data and
 * are checked by the GitHub workflow with its own token.
 */
export const GET: APIRoute = async () => {
  const snapshotPath = path.join(
    process.cwd(),
    "src",
    "infrastructure",
    "economic",
    "economic-parameters.snapshot.json"
  );
  const snapshot = JSON.parse(
    readFileSync(snapshotPath, "utf8")
  ) as SnapshotHealth;

  const payload = {
    capturedAt: snapshot.capturedAt,
    lastUpdated: snapshot.lastUpdated,
    indicatorUpdatedAt: snapshot.indicatorUpdatedAt ?? {},
    uf: snapshot.uf,
    dolar: snapshot.dolar,
  };

  return new Response(`${JSON.stringify(payload, null, 2)}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};
