/**
 * Interpolación de variables económicas en texto markdown:
 * `[[expr | clp]]` → valor formateado con el snapshot económico.
 *
 * Compartido por el plugin remark (render HTML/MDX) y por superficies que
 * publican markdown crudo (`/llms-full.txt`), para que ninguna superficie
 * quede con sintaxis `[[...]]` sin interpolar (D25, plan 132).
 *
 * Se importa `fs`/`path` (no `node:fs`/`node:path`) para mantener el mock de
 * tests existente del plugin remark.
 */
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const SNAPSHOT_PATH = resolve(
  process.cwd(),
  "src",
  "infrastructure",
  "economic",
  "economic-parameters.snapshot.json"
);

// [[expr | format]] — e.g. [[utm * 13.5 | clp]]
const ECONOMIC_EXPR_RE = /\[\[([^\]|]+?)\|([^\]]+?)\]\]/g;

export type EconomicVars = { utm: number; uf: number; uta: number };

export function loadEconomicVars(): EconomicVars | null {
  if (!existsSync(SNAPSHOT_PATH)) return null;
  try {
    const data = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf-8")) as Record<
      string,
      unknown
    >;
    return {
      utm: Number(data.utm),
      uf: Number(data.uf),
      uta: Number(data.uta ?? 0),
    };
  } catch {
    return null;
  }
}

// Recursive descent arithmetic parser — supports +, -, *, /, parentheses, numeric literals.
// Validation happens before parsing: only digits, dots, operators, parens, and spaces are allowed.

function parseAddSub(expr: string, s: { pos: number }): number {
  let result = parseMulDiv(expr, s);
  while (s.pos < expr.length && (expr[s.pos] === "+" || expr[s.pos] === "-")) {
    const op = expr[s.pos++];
    const right = parseMulDiv(expr, s);
    result = op === "+" ? result + right : result - right;
  }
  return result;
}

function parseMulDiv(expr: string, s: { pos: number }): number {
  let result = parseAtom(expr, s);
  while (s.pos < expr.length && (expr[s.pos] === "*" || expr[s.pos] === "/")) {
    const op = expr[s.pos++];
    const right = parseAtom(expr, s);
    if (op === "/" && right === 0) throw new Error("Division by zero");
    result = op === "*" ? result * right : result / right;
  }
  return result;
}

function parseAtom(expr: string, s: { pos: number }): number {
  if (expr[s.pos] === "(") {
    s.pos++;
    const result = parseAddSub(expr, s);
    if (expr[s.pos] !== ")") throw new Error("Mismatched parentheses");
    s.pos++;
    return result;
  }
  if (expr[s.pos] === "-") {
    s.pos++;
    return -parseAtom(expr, s);
  }
  const match = /^\d+(?:\.\d+)?/.exec(expr.slice(s.pos));
  if (!match) throw new Error(`Expected number at pos ${s.pos}`);
  s.pos += match[0].length;
  return parseFloat(match[0]);
}

function evalExpr(raw: string, vars: EconomicVars): number {
  const expr = raw
    .replace(/\butm\b/g, String(vars.utm))
    .replace(/\buta\b/g, String(vars.uta))
    .replace(/\buf\b/g, String(vars.uf))
    .replace(/\s/g, "");

  if (!/^[\d+\-*/.()]+$/.test(expr)) {
    throw new Error(`Invalid expression after substitution: ${expr}`);
  }

  const state = { pos: 0 };
  const result = parseAddSub(expr, state);
  if (state.pos !== expr.length) {
    throw new Error(`Unexpected trailing characters at pos ${state.pos}`);
  }
  return result;
}

function formatClp(value: number): string {
  const rounded = Math.round(value);
  const abs = String(Math.abs(rounded));
  const parts: string[] = [];
  for (let i = abs.length; i > 0; i -= 3) {
    parts.unshift(abs.slice(Math.max(0, i - 3), i));
  }
  return (rounded < 0 ? "-$" : "$") + parts.join(".");
}

/**
 * Reemplaza `[[expr | fmt]]` en texto plano. `warn` recibe el mensaje sin
 * prefijo (cada superficie decide cómo reportarlo); las expresiones que fallan
 * se dejan intactas para que el check de artefacto las detecte.
 */
export function interpolateEconomicVariables(
  text: string,
  vars: EconomicVars,
  warn: (message: string) => void = () => {}
): string {
  return text.replace(
    ECONOMIC_EXPR_RE,
    (match, exprRaw: string, fmtRaw: string) => {
      try {
        const value = evalExpr(exprRaw.trim(), vars);
        const fmt = fmtRaw.trim().toLowerCase();
        if (fmt === "clp") return formatClp(value);
        if (fmt === "raw") return String(value);
        throw new Error(`Unknown format: ${fmtRaw.trim()}`);
      } catch (err) {
        warn(
          `Could not resolve [[${exprRaw.trim()}|${fmtRaw.trim()}]]: ${(err as Error).message}`
        );
        return match;
      }
    }
  );
}

/** Para superficies sin canal de aviso: no-op si falta el snapshot. */
export function interpolateEconomicText(text: string): string {
  const vars = loadEconomicVars();
  if (!vars) return text;
  return interpolateEconomicVariables(text, vars);
}
