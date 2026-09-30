// pass5.d21-compare.mjs — auditoría plan 115 pass5 (D21)
// Uso: node pass5.d21-compare.mjs <sources-dir>   (ejecutar desde el root del worktree)
// Compara buildSecondCategoryTaxBrackets (motor) vs tabla SII descargada y vs glosario.
import { readFileSync } from "node:fs";

const WT = process.cwd();
const SRC = process.argv[2] ?? "sources";
const { buildSecondCategoryTaxBrackets } = await import(
  `${WT}/src/domain/taxation/TaxEngine.ts`
);

const expected = [
  [13.5, 0, 0],
  [30, 0.04, 0.54],
  [50, 0.08, 1.74],
  [70, 0.135, 4.49],
  [90, 0.23, 11.14],
  [120, 0.304, 17.8],
  [310, 0.35, 23.32],
  [Infinity, 0.4, 38.82],
];

console.log("=== A. Motor: buildSecondCategoryTaxBrackets(utm) normalizado a UTM ===");
for (const utm of [71721, 72151]) {
  console.log(`-- utm=${utm} --`);
  const brackets = buildSecondCategoryTaxBrackets(utm);
  brackets.forEach((b, i) => {
    const upper = b.upperLimit / utm;
    const ded = b.deduction / utm;
    console.log(
      `  [${i}] upper=${upper === Infinity ? "inf" : upper.toFixed(6)}` +
        ` rate=${b.rate} dedUTM=${ded.toFixed(6)}` +
        ` dedCLP=${b.deduction.toFixed(2)}${i < 7 ? ` upperCLP=${b.upperLimit.toFixed(2)}` : ""}`
    );
  });
  const ok = brackets.every((b, i) => {
    const [u, r, d] = expected[i];
    const du = u === Infinity ? 0 : Math.abs(b.upperLimit / utm - u);
    return du < 1e-9 && Math.abs(b.rate - r) < 1e-12 && Math.abs(b.deduction / utm - d) < 1e-9;
  });
  console.log(`  expectativa (13.5/30/50/70/90/120/310/inf; 0/4/8/13.5/23/30.4/35/40%; ded 0/.54/1.74/4.49/11.14/17.8/23.32/38.82 UTM) => ${ok ? "MATCH" : "MISMATCH"}`);
}

console.log("\n=== B. Tabla SII mensual (HTML descargado) vs motor ===");
const raw = readFileSync(`${SRC}/iusc-2026.html`, "utf8");
const text = raw.replace(/<[^>]+>/g, " ").replace(/&#\d+;/g, " ").replace(/&nbsp;/g, " ").replace(/&Aacute;/g, "Á").replace(/\s+/g, " ");
const parse = s => Number(s.replace(/\./g, "").replace(",", "."));
for (const [label, utm] of [["Octubre 2026", 72151], ["Septiembre 2026", 71721]]) {
  const start = text.indexOf(label);
  const seg = text.slice(start, start + 12000);
  const mensual = /MENSUAL([\s\S]*?)QUINCENAL/.exec(seg)?.[1] ?? "";
  const exempt = parse(/\$ ([\d.]+,\d{2})\s+Exento/.exec(mensual)[1]);
  const rows = [...mensual.matchAll(/\$ ([\d.]+,\d{2})\s+\$ ([\d.]+,\d{2})\s+([\d,]+)\s+\$ ([\d.]+,\d{2})/g)];
  const last = /\$ ([\d.]+,\d{2}) Y MÁS\s+([\d,]+)\s+\$ ([\d.]+,\d{2})/.exec(mensual);
  console.log(`-- ${label} (utm=${utm}); filas=${rows.length} + exento + última=${last ? 1 : 0} --`);
  console.log(`  exento SII=${exempt.toFixed(2)} motor=${(13.5 * utm).toFixed(2)} => ${Math.abs(exempt - 13.5 * utm) < 0.005 ? "MATCH" : "MISMATCH"}`);
  rows.forEach((m, i) => {
    const [, desde, hasta, factor, rebaja] = m;
    const rate = Number(factor.replace(",", "."));
    const upper = parse(hasta);
    const ded = parse(rebaja);
    const exp = expected[i + 1];
    const okU = Math.abs(upper - exp[0] * utm) < 0.005;
    const okR = rate === exp[1];
    const okD = Math.abs(ded - exp[2] * utm) < 0.005;
    console.log(
      `  [${i}] desde=${desde} hasta=${hasta} factor=${factor} rebaja=${rebaja} | motorUpper=${(exp[0] * utm).toFixed(2)} motorRebaja=${(exp[2] * utm).toFixed(2)} => ${okU && okR && okD ? "MATCH" : `MISMATCH(okU=${okU},okR=${okR},okD=${okD})`}`
    );
  });
  if (last) {
    const rate = Number(last[2].replace(",", "."));
    const ded = parse(last[3]);
    console.log(
      `  [last] ${last[1]} Y MÁS factor=${last[2]} rebaja=${last[3]} | motor upper=inf rate=0.4 rebaja=${(38.82 * utm).toFixed(2)} => ${rate === 0.4 && Math.abs(ded - 38.82 * utm) < 0.005 ? "MATCH" : "MISMATCH"}`
    );
  }
}

console.log("\n=== C. Glosario impuesto-unico.md: tabla vs motor ===");
const glossary = readFileSync(`${WT}/src/data/glossary/impuesto-unico.md`, "utf8");
const tableRows = [...glossary.matchAll(/^\| (Hasta|Sobre) ([\d,]+) UTM\s+\| ([^\s|]+)/gm)];
console.log(`filas parseadas=${tableRows.length}`);
tableRows.forEach((m, i) => {
  const [, kind, limit, rateRaw] = m;
  const limitNum = kind === "Sobre" ? Infinity : Number(limit.replace(",", "."));
  const rate = Number(rateRaw.replace("%", "").replace(",", ".")) / 100;
  const exp = expected[i];
  console.log(
    `  [${i}] ${kind} ${limit} UTM => ${rateRaw} | motor upper=${exp[0]} rate=${exp[1]} => ${limitNum === exp[0] && Math.abs(rate - exp[1]) < 1e-12 ? "MATCH" : "MISMATCH"}`
  );
});

console.log("\n=== D. Glosario: hardcodes CLP antiguos / revisado / interpolación ===");
for (const bad of ["943.501", "2.094.000", "3.490.000", "4.886.000", "~$943", "~$2.094", "~$3.490", "~$4.886"]) {
  const hits = [...glossary.matchAll(new RegExp(bad.replace(/[.~$]/g, m => "\\" + m), "g"))].length;
  console.log(`  ${bad}: ${hits} ocurrencia(s)`);
}
console.log(`  reviewedDate presente: ${/^reviewedDate:/m.test(glossary) ? "sí" : "NO"} (${/^reviewedDate:.*$/m.exec(glossary)?.[0] ?? "?"})`);
console.log(`  interpolar [[utm * 13.5 | clp]]: ${/\[\[utm \* 13\.5 \| clp\]\]/.test(glossary)}`);
const utmSnapshot = JSON.parse(readFileSync(`${WT}/src/infrastructure/economic/economic-parameters.snapshot.json`, "utf8")).utm;
console.log(`  snapshot utm=${utmSnapshot}; 13.5*utm=${13.5 * utmSnapshot} => formatClp=${Math.round(13.5 * utmSnapshot).toLocaleString("es-CL")}`);
