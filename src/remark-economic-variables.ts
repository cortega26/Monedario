import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const SNAPSHOT_PATH = resolve(
  process.cwd(),
  "src",
  "infrastructure",
  "economic",
  "economic-parameters.snapshot.json"
);

const SKIP_TYPES = new Set(["code", "inlineCode", "html"]);

// [[expr | format]] — e.g. [[utm * 13.5 | clp]]
const EXPR_RE = /\[\[([^\]|]+?)\|([^\]]+?)\]\]/g;

type Vars = { utm: number; uf: number; uta: number };
type Node = { type: string; value?: string; children?: Node[] };
type RemarkFile = { message: (reason: string) => void };

function loadVars(): Vars | null {
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

function evalExpr(raw: string, vars: Vars): number {
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

function substituteText(
  text: string,
  vars: Vars,
  warn: (message: string) => void
): string {
  return text.replace(EXPR_RE, (_match, exprRaw: string, fmtRaw: string) => {
    try {
      const value = evalExpr(exprRaw.trim(), vars);
      const fmt = fmtRaw.trim().toLowerCase();
      if (fmt === "clp") return formatClp(value);
      if (fmt === "raw") return String(value);
      throw new Error(`Unknown format: ${fmtRaw.trim()}`);
    } catch (err) {
      warn(
        `[remarkEconomicVariables] Could not resolve [[${exprRaw.trim()}|${fmtRaw.trim()}]]: ${(err as Error).message}`
      );
      return _match;
    }
  });
}

function walk(node: Node, vars: Vars, warn: (message: string) => void): void {
  if (SKIP_TYPES.has(node.type)) return;
  if (node.type === "text" && typeof node.value === "string") {
    node.value = substituteText(node.value, vars, warn);
    return;
  }
  if (node.children) {
    for (const child of node.children) {
      walk(child, vars, warn);
    }
  }
}

export function remarkEconomicVariables() {
  const vars = loadVars();
  let didWarnMissingSnapshot = false;

  return function transformer(tree: unknown, file?: RemarkFile): void {
    const warn = (message: string) => file?.message(message);

    if (!vars) {
      if (!didWarnMissingSnapshot) {
        warn(
          "[remarkEconomicVariables] Economic snapshot not found; template variables will not be resolved."
        );
        didWarnMissingSnapshot = true;
      }
      return;
    }

    walk(tree as Node, vars, warn);
  };
}
