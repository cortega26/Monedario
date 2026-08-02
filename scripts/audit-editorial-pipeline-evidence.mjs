import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "output/audits/editorial-pipeline-2026-08-02");
const STAGES = [
  "01-brief.yaml",
  "02-dossier.md",
  "03-outline.md",
  "04-draft.md",
  "05-math-audit.md",
  "06-compliance.md",
  "07-publish-packet.md",
];

function filesUnder(root) {
  const files = [];
  if (!statSafe(root)) return files;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(absolute));
    else files.push(absolute);
  }
  return files;
}

function statSafe(file) {
  try {
    return statSync(file);
  } catch {
    return null;
  }
}

const articleFiles = filesUnder(path.join(ROOT, "src/data/blog")).filter(file =>
  /\.(md|mdx)$/i.test(file)
);
const artifactFiles = filesUnder(path.join(ROOT, "artifacts/editorial"));
const runs = new Map();
for (const file of artifactFiles) {
  const name = path.basename(file);
  if (!STAGES.includes(name)) continue;
  const run = path.relative(ROOT, path.dirname(file));
  if (!runs.has(run)) runs.set(run, new Set());
  runs.get(run).add(name);
}

const stageCounts = Object.fromEntries(
  STAGES.map(stage => [stage, artifactFiles.filter(file => path.basename(file) === stage).length])
);
const completeRuns = [...runs.entries()]
  .filter(([, stages]) => STAGES.every(stage => stages.has(stage)))
  .map(([run]) => run)
  .sort();
const priorities = [
  { label: "utm", terms: ["utm"] },
  { label: "afc", terms: ["afc", "seguro-cesantia", "seguro-de-cesantia"] },
  { label: "prepago", terms: ["prepago"] },
  { label: "credito", terms: ["credito"] },
];

function frontmatterValue(source, key) {
  return source.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)`, "m"))?.[1]?.trim() ?? null;
}

const evidenceBySlug = new Map();
for (const [run, stages] of runs) {
  const relative = path.relative("artifacts/editorial", run);
  const slug = relative.split(path.sep)[0];
  if (!evidenceBySlug.has(slug)) evidenceBySlug.set(slug, []);
  evidenceBySlug.get(slug).push({ run, stages: [...stages].sort() });
}

const contentMatrix = articleFiles
  .map(file => {
    const source = readFileSync(file, "utf8");
    const slug = frontmatterValue(source, "slug") ?? path.basename(file).replace(/\.(md|mdx)$/i, "");
    const pubDate = frontmatterValue(source, "pubDate");
    const updatedDate = frontmatterValue(source, "updatedDate");
    const effectiveDate = (updatedDate ?? pubDate ?? "").slice(0, 10);
    const artifactRuns = evidenceBySlug.get(slug) ?? [];
    const stageUnion = [...new Set(artifactRuns.flatMap(run => run.stages))].sort();
    const hasCompleteNamedRun = artifactRuns.some(run =>
      STAGES.every(stage => run.stages.includes(stage))
    );
    const priority = priorities.find(item =>
      item.terms.some(term => slug.includes(term))
    )?.label;
    const historical = !effectiveDate || effectiveDate < "2026-04-25";
    return {
      content: path.relative(ROOT, file),
      slug,
      pubDate,
      updatedDate,
      pipelineApplicable: historical
        ? "historical-controls-plus-risk-retroaudit"
        : "seven-stage-protocol-required",
      artifactRuns: artifactRuns.map(run => run.run),
      stagesPresent: stageUnion,
      evidence: hasCompleteNamedRun
        ? "all stage filenames present; human gates not inferred"
        : stageUnion.length > 0
          ? "partial artifact evidence"
          : "no canonical stage artifacts found",
      risk: priority ? `high-priority:${priority}` : historical ? "historical" : "current-protocol-evidence-gap",
      action: priority
        ? "retro-audit on next substantive refresh"
        : hasCompleteNamedRun
          ? "verify authorized human gates before publication claims"
          : "do not backfill; apply protocol on next substantive refresh",
    };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

const priorityEvidence = Object.fromEntries(
  priorities.map(priority => {
    const articles = articleFiles
      .filter(file =>
        priority.terms.some(term =>
          path.basename(file).toLowerCase().includes(term)
        )
      )
      .map(file => path.relative(ROOT, file));
    const evidence = [...runs.keys()].filter(run =>
      priority.terms.some(term => run.toLowerCase().includes(term))
    );
    return [priority.label, { articles, artifactRuns: evidence }];
  })
);

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  scope: "evidence inventory only; no editorial gate is signed",
  publishedArticleFiles: articleFiles.length,
  artifactRuns: runs.size,
  stageCounts,
  completeRuns,
  completeRunCount: completeRuns.length,
  priorityEvidence,
  contentMatrix,
  conclusion:
    "The formal seven-stage artifact chain cannot be claimed for the historical corpus. Apply it prospectively and on substantive YMYL refreshes; retro-audit by risk without manufacturing evidence.",
};

mkdirSync(OUTPUT, { recursive: true });
writeFileSync(path.join(OUTPUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
const markdown = `# Auditoría de evidencia editorial — 2026-08-02

- Artículos publicados: **${report.publishedArticleFiles}**
- Runs con algún artefacto canónico: **${report.artifactRuns}**
- Runs con las siete etapas completas por nombre: **${report.completeRunCount}**
- \`06-compliance.md\`: **${stageCounts["06-compliance.md"]}**
- \`07-publish-packet.md\`: **${stageCounts["07-publish-packet.md"]}**

## Conclusión

${report.conclusion}

## Prioridades de retroauditoría

| Señal | Artículos coincidentes | Runs de evidencia coincidentes |
|---|---:|---:|
${priorities.map(priority => `| ${priority.label.toUpperCase()} | ${priorityEvidence[priority.label].articles.length} | ${priorityEvidence[priority.label].artifactRuns.length} |`).join("\n")}

## Matriz contenido → evidencia

| Contenido | Fecha publicada | Pipeline aplicable | Etapas presentes | Evidencia | Riesgo | Acción |
|---|---|---|---:|---|---|---|
${contentMatrix.map(row => `| \`${row.slug}\` | ${row.pubDate?.slice(0, 10) ?? "n/d"} | ${row.pipelineApplicable} | ${row.stagesPresent.length}/7 | ${row.evidence} | ${row.risk} | ${row.action} |`).join("\n")}

Este inventario no valida contenido, no sustituye una auditoría independiente y no marca gates humanos.
`;
writeFileSync(path.join(OUTPUT, "report.md"), markdown);
console.log(`[editorial-evidence-audit] articles=${articleFiles.length} runs=${runs.size} complete=${completeRuns.length}`);
