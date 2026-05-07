import { afterEach, describe, expect, it, vi } from "vitest";

type MessageFile = { message: (message: string) => void };
type TextNode = { type: "text"; value: string };

async function loadPlugin({
  snapshotExists,
  snapshotJson,
}: {
  snapshotExists: boolean;
  snapshotJson?: Record<string, unknown>;
}) {
  vi.resetModules();
  vi.doMock("fs", () => ({
    existsSync: () => snapshotExists,
    readFileSync: () => JSON.stringify(snapshotJson ?? {}),
  }));

  return import("../../src/remark-economic-variables");
}

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("fs");
});

describe("remarkEconomicVariables", () => {
  it("emits the missing snapshot warning only once across files", async () => {
    const { remarkEconomicVariables } = await loadPlugin({ snapshotExists: false });
    const transformer = remarkEconomicVariables();
    const messages: string[] = [];
    const file: MessageFile = { message: msg => void messages.push(msg) };

    transformer({ type: "root", children: [{ type: "text", value: "[[utm|clp]]" }] }, file);
    transformer({ type: "root", children: [{ type: "text", value: "[[uf|clp]]" }] }, file);

    expect(messages).toEqual([
      "[remarkEconomicVariables] Economic snapshot not found; template variables will not be resolved.",
    ]);
  });

  it("reports substitution errors through the remark file message channel", async () => {
    const { remarkEconomicVariables } = await loadPlugin({
      snapshotExists: true,
      snapshotJson: { utm: 68000, uf: 39000, uta: 816000 },
    });
    const transformer = remarkEconomicVariables();
    const messages: string[] = [];
    const tree: { type: "root"; children: TextNode[] } = {
      type: "root",
      children: [{ type: "text", value: "Monto [[utm|bogus]]" }],
    };

    transformer(tree, { message: msg => void messages.push(msg) });

    expect(tree.children[0]?.value).toBe("Monto [[utm|bogus]]");
    expect(messages).toEqual([
      "[remarkEconomicVariables] Could not resolve [[utm|bogus]]: Unknown format: bogus",
    ]);
  });
});
