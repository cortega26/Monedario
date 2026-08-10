// Valida el comportamiento del parser js-yaml (block scalars, arrays, fechas)
// con la config que check-frontmatter.mjs usa. NO prueba las reglas del gate
// editorial — esas viven en tests/scripts/check-frontmatter.test.ts
// (caracterización por clase de regla). El nombre original
// (frontmatter-schema.test.ts) daba una confianza falsa de cubrir el gate.
import { describe, it, expect } from "vitest";
import { JSON_SCHEMA, load } from "js-yaml";

describe("YAML Parser", () => {
  it("parses multiline block scalars exactly as string blocks", () => {
    const yamlString = `
title: "Article Title"
description: >
  This is a multiline
  block scalar description.
`;
    const parsed = load(yamlString, {
      schema: JSON_SCHEMA,
    }) as Record<string, unknown>;
    expect(parsed.description).toBe("This is a multiline block scalar description.\n");
  });

  it("parses arrays seamlessly", () => {
    const yamlString = `
tags:
  - first parameter
  - second parameter
`;
    const parsed = load(yamlString, {
      schema: JSON_SCHEMA,
    }) as Record<string, unknown>;
    expect(parsed.tags).toEqual(["first parameter", "second parameter"]);
  });

  it("retains string dates accurately mapping through JSON schema without forcing Date evaluation", () => {
    const yamlString = `
pubDate: "2026-03-04T12:00:00Z"
`;
    const parsed = load(yamlString, {
      schema: JSON_SCHEMA,
    }) as Record<string, unknown>;
    expect(parsed.pubDate).toBeTypeOf("string");
    expect(parsed.pubDate).toBe("2026-03-04T12:00:00Z");
  });
});
