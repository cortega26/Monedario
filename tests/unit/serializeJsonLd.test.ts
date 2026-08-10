import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "@/utils/serializeJsonLd";

describe("serializeJsonLd", () => {
  it("never emits a literal </script> sequence", () => {
    const output = serializeJsonLd({ title: "a</script><b>" });
    expect(output).not.toContain("</script>");
    expect(output).toContain("\\u003c/script>");
  });

  it("escapes every < as \\u003c and nothing else (regression)", () => {
    const value = {
      title: "¿Cuánto < 10?",
      description: "a & b > c",
      accents: "dólar, cotización",
    };
    const output = serializeJsonLd(value);
    expect(output).toBe(
      '{"title":"¿Cuánto \\u003c 10?","description":"a & b > c","accents":"dólar, cotización"}'
    );
  });

  it("round-trips through JSON.parse (deep-equal)", () => {
    const value = {
      headline: "Título <con> tags </script>",
      nested: { list: [1, 2, { x: "<" }] },
    };
    expect(JSON.parse(serializeJsonLd(value))).toEqual(value);
  });
});
