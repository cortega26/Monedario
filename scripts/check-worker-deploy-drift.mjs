#!/usr/bin/env node
// check:worker-deploy-drift
//
// Detecta el modo de fallo del 2026-11-18: un cambio del Worker se mergea a
// `main`, pero el Worker desplegado sigue siendo el anterior. El deploy es
// manual por diseño (el repo no tiene un production environment protegido), así
// que sin este chequeo el código puede quedar meses sin desplegar y los gates
// del repositorio no lo notan: el snapshot sigue fallando con la versión vieja.
//
// Uso:
//   pnpm exec wrangler deployments list --config workers/economic-snapshot-refresh/wrangler.toml --json > deps.json
//   node scripts/check-worker-deploy-drift.mjs --deployments deps.json \
//     --path workers/economic-snapshot-refresh

import { readFileSync } from "node:fs";

// Un deploy puede tardar minutos en hacerse tras el merge; 24 h evita ruido por
// una corrida nocturna y sigue detectando el drift al día siguiente.
export const TOLERANCE_HOURS = 24;

/**
 * @param {{
 *   deployments: Array<{ created_on?: string; annotations?: Record<string, string> }>,
 *   lastCommitAt: string | null,
 *   toleranceHours?: number,
 * }} input
 * @returns {string[]} problemas; vacío si el deploy incluye el último commit.
 */
export function evaluateDeployDrift({
  deployments,
  lastCommitAt,
  toleranceHours = TOLERANCE_HOURS,
}) {
  // Un cambio de secreto crea un deployment nuevo con el código YA desplegado:
  // no debe contar como "el código nuevo está desplegado".
  const codeDeploys = (deployments ?? [])
    .filter(
      deployment =>
        deployment?.annotations?.["workers/triggered_by"] !== "secret"
    )
    .map(deployment => deployment?.created_on)
    .filter(createdOn => typeof createdOn === "string")
    .sort();

  if (codeDeploys.length === 0) {
    return [
      "No hay ningún deploy de código del Worker en el histórico disponible; no se puede verificar el drift.",
    ];
  }

  const deployedAt = codeDeploys.at(-1);
  const commitTs = Date.parse(lastCommitAt ?? "");
  const deployTs = Date.parse(deployedAt ?? "");
  if (Number.isNaN(commitTs)) {
    return [
      "No se pudo leer la fecha del último commit que tocó el Worker; no se puede verificar el drift.",
    ];
  }
  if (Number.isNaN(deployTs)) {
    return [`No se pudo leer la fecha del último deploy (${deployedAt}).`];
  }

  const driftHours = (commitTs - deployTs) / 3_600_000;
  if (driftHours <= toleranceHours) {
    return [];
  }

  return [
    `El código del Worker tiene cambios sin desplegar: último commit ${new Date(commitTs).toISOString()}, último deploy de código ${new Date(deployTs).toISOString()} (${driftHours.toFixed(1)} h de drift, máximo ${toleranceHours} h). Ejecuta \`pnpm run worker:economic-snapshot:deploy\` y verifica con \`wrangler deployments list\`.`,
  ];
}

async function lastCommitForPath({ repo, path: repoPath, token }) {
  const response = await fetch(
    `https://api.github.com/repos/${repo}/commits?path=${encodeURIComponent(repoPath)}&per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "monedario-worker-deploy-drift",
      },
      signal: AbortSignal.timeout(20_000),
    }
  );
  if (!response.ok) {
    throw new Error(`GitHub API respondió HTTP ${response.status}.`);
  }
  const commits = await response.json();
  return commits?.[0]?.commit?.committer?.date ?? null;
}

async function main() {
  const args = process.argv.slice(2);
  const flag = name => {
    const index = args.indexOf(name);
    return index === -1 ? undefined : args[index + 1];
  };

  const deploymentsPath = flag("--deployments");
  const workerPath = flag("--path") ?? "workers/economic-snapshot-refresh";
  const repo = process.env.GITHUB_REPOSITORY ?? "cortega26/Monedario";
  const token = process.env.GITHUB_TOKEN;

  if (!deploymentsPath) {
    console.error("Falta --deployments <json>.");
    process.exit(2);
  }
  if (!token) {
    console.error("Falta GITHUB_TOKEN.");
    process.exit(2);
  }

  const deployments = JSON.parse(readFileSync(deploymentsPath, "utf8"));
  const lastCommitAt = await lastCommitForPath({
    repo,
    path: workerPath,
    token,
  });
  const problems = evaluateDeployDrift({ deployments, lastCommitAt });

  if (problems.length === 0) {
    console.log(
      "[worker-deploy-drift] OK: el Worker desplegado incluye el último commit."
    );
    return;
  }
  for (const problem of problems) console.log(`- ${problem}`);
  process.exit(1);
}

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
  main();
}
