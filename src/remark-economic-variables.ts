import {
  interpolateEconomicVariables,
  loadEconomicVars,
  type EconomicVars,
} from "./utils/economicInterpolation";

const SKIP_TYPES = new Set(["code", "inlineCode", "html"]);

type Node = { type: string; value?: string; children?: Node[] };
type RemarkFile = { message: (reason: string) => void };

function walk(
  node: Node,
  vars: EconomicVars,
  warn: (message: string) => void
): void {
  if (SKIP_TYPES.has(node.type)) return;
  if (node.type === "text" && typeof node.value === "string") {
    node.value = interpolateEconomicVariables(node.value, vars, warn);
    return;
  }
  if (node.children) {
    for (const child of node.children) {
      walk(child, vars, warn);
    }
  }
}

export function remarkEconomicVariables() {
  const vars = loadEconomicVars();
  let didWarnMissingSnapshot = false;

  return function transformer(tree: unknown, file?: RemarkFile): void {
    const warn = (message: string) =>
      file?.message(`[remarkEconomicVariables] ${message}`);

    if (!vars) {
      if (!didWarnMissingSnapshot) {
        warn(
          "Economic snapshot not found; template variables will not be resolved."
        );
        didWarnMissingSnapshot = true;
      }
      return;
    }

    walk(tree as Node, vars, warn);
  };
}
