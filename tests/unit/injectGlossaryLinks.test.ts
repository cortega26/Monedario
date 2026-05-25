import { describe, expect, it } from "vitest";
import { injectGlossaryLinks } from "../../src/utils/injectGlossaryLinks";

describe("injectGlossaryLinks", () => {
  it("injects a glossary link for a known term", () => {
    const result = injectGlossaryLinks("<p>La AFP gestiona los fondos.</p>");
    expect(result).toContain('href="/glosario/afp/"');
    expect(result).toContain('data-glossary-term="afp"');
    expect(result).toContain('class="glossary-inline-link"');
  });

  it("does not inject inside headings", () => {
    const result = injectGlossaryLinks("<h2>Qué es la AFP</h2>");
    expect(result).not.toContain('href="/glosario/afp/"');
  });

  it("does not inject inside code blocks", () => {
    const result = injectGlossaryLinks("<p>Mira el ejemplo: <code>AFP</code>.</p>");
    expect(result).not.toContain('data-glossary-term="afp"');
  });

  it("does not inject inside pre blocks", () => {
    const result = injectGlossaryLinks("<pre>AFP</pre>");
    expect(result).not.toContain('href="/glosario/afp/"');
  });

  it("does not inject inside existing links", () => {
    const result = injectGlossaryLinks('<a href="/example">AFP</a>');
    expect(result).not.toContain('data-glossary-term="afp"');
  });

  it("does not inject inside table cells", () => {
    const result = injectGlossaryLinks(
      "<table><tr><td>AFP</td></tr></table>"
    );
    expect(result).not.toContain('href="/glosario/afp/"');
  });

  it("only injects the first occurrence of each term", () => {
    const result = injectGlossaryLinks(
      "<p>AFP y luego AFP de nuevo.</p>"
    );
    const matches = result.match(/data-glossary-term="afp"/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it("caps at 5 total links across all terms", () => {
    const text =
      "<p>AFP AFC UF UTM CAE DICOM APV IPC SII CMF.</p>";
    const result = injectGlossaryLinks(text);
    const matches = result.match(/class="glossary-inline-link"/g) ?? [];
    expect(matches.length).toBeLessThanOrEqual(5);
  });

  it("does not re-inject a term that already has a data-glossary-term link", () => {
    const html =
      '<p><a href="/glosario/afp/" data-glossary-term="afp">AFP</a> es importante. Luego AFP otra vez.</p>';
    const result = injectGlossaryLinks(html);
    const matches = result.match(/data-glossary-term="afp"/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it("matches terms case-insensitively", () => {
    const result = injectGlossaryLinks("<p>La afp gestiona los fondos.</p>");
    expect(result).toContain('data-glossary-term="afp"');
  });

  it("returns the input unchanged when no terms are found", () => {
    const html = "<p>No hay términos conocidos aquí.</p>";
    expect(injectGlossaryLinks(html)).toBe(html);
  });

  it("injects links for multiple different terms in document order", () => {
    const result = injectGlossaryLinks(
      "<p>La UF y el IPC son indicadores distintos en Chile.</p>"
    );
    expect(result).toContain('data-glossary-term="uf"');
    expect(result).toContain('data-glossary-term="ipc"');
  });

  it("does not inject into text after excluded block closes for later paragraphs", () => {
    const html =
      "<h2>Qué es la AFP</h2><p>La AFP gestiona pensiones.</p>";
    const result = injectGlossaryLinks(html);
    // heading: no link; paragraph after heading: link injected
    const matches = result.match(/data-glossary-term="afp"/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it("injects the analytics attributes on injected links", () => {
    const result = injectGlossaryLinks("<p>El SII administra impuestos.</p>");
    expect(result).toContain('data-analytics-cta="glossary-inline-link"');
    expect(result).toContain('data-analytics-location="article_body"');
    expect(result).toContain('data-analytics-label="sii"');
  });

  it("injects a glossary link for a multi-word term", () => {
    const result = injectGlossaryLinks(
      "<p>Primero arma tu fondo de emergencia antes de invertir.</p>"
    );
    expect(result).toContain('href="/glosario/fondo-emergencia/"');
  });

  it("injects a glossary link for ETF in plural form", () => {
    const result = injectGlossaryLinks(
      "<p>Los ETFs pueden servir para diversificar a largo plazo.</p>"
    );
    expect(result).toContain('href="/glosario/etf/"');
  });
});
