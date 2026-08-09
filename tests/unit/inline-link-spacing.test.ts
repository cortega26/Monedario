import { describe, expect, it } from "vitest";
import { normalizeInlineLinkSpacing } from "../../src/integrations/inline-link-spacing";

describe("normalizeInlineLinkSpacing", () => {
  it("separates prose from adjacent links on both sides", () => {
    expect(
      normalizeInlineLinkSpacing(
        '<p>Consulta<a href="/metodologia/">la metodología</a>para conocer el proceso.</p>'
      )
    ).toBe(
      '<p>Consulta <a href="/metodologia/">la metodología</a> para conocer el proceso.</p>'
    );
  });

  it("keeps punctuation adjacent to the link", () => {
    expect(
      normalizeInlineLinkSpacing(
        '<p>Revisa:<a href="/guia/">la guía</a>, antes de decidir.</p>'
      )
    ).toBe(
      '<p>Revisa: <a href="/guia/">la guía</a>, antes de decidir.</p>'
    );
  });

  it("does not insert a space before punctuation after a link", () => {
    const html =
      '<p>Revisa <a href="/guia/">la guía</a>, <a href="/fuente/">la fuente</a>. ¿Dudas?<a href="/contacto/">Escríbenos</a>.</p>';

    expect(normalizeInlineLinkSpacing(html)).toBe(
      '<p>Revisa <a href="/guia/">la guía</a>, <a href="/fuente/">la fuente</a>. ¿Dudas? <a href="/contacto/">Escríbenos</a>.</p>'
    );
  });

  it("separates a new linked sentence after terminal punctuation", () => {
    expect(
      normalizeInlineLinkSpacing(
        '<p>La información es pública.<a href="/acerca-de/">Conoce la política editorial.</a></p>'
      )
    ).toBe(
      '<p>La información es pública. <a href="/acerca-de/">Conoce la política editorial.</a></p>'
    );
  });

  it("normalizes all supported reading elements", () => {
    const html =
      '<li>Ver<a href="/a/">detalle</a>ahora.</li><figcaption>Fuente:<a href="/f/">oficial</a>.</figcaption>';

    expect(normalizeInlineLinkSpacing(html)).toBe(
      '<li>Ver <a href="/a/">detalle</a> ahora.</li><figcaption>Fuente: <a href="/f/">oficial</a>.</figcaption>'
    );
  });

  it("normalizes boundaries separated by inline formatting and consecutive links", () => {
    const html =
      '<p>Lee <strong>primero</strong><a href="/a/">esta guía</a><em>antes</em> de decidir. <a href="/uno/">Uno</a><a href="/dos/">Dos</a></p>';

    expect(normalizeInlineLinkSpacing(html)).toBe(
      '<p>Lee <strong>primero</strong> <a href="/a/">esta guía</a><em> antes</em> de decidir. <a href="/uno/">Uno</a> <a href="/dos/">Dos</a></p>'
    );
  });

  it("is idempotent and preserves existing whitespace", () => {
    const html =
      '<p>Consulta <a href="/a/">esta guía</a> antes de decidir.</p>';

    expect(normalizeInlineLinkSpacing(html)).toBe(html);
  });

  it("does not alter code, preformatted, script, or non-reading content", () => {
    const html =
      '<p><code>texto<a href="/x/">enlace</a>pegado</code></p><pre>texto<a href="/x/">enlace</a>pegado</pre><script>const x = "texto<a>enlace";</script><nav>Texto<a href="/x/">enlace</a>pegado</nav>';

    expect(normalizeInlineLinkSpacing(html)).toBe(html);
  });
});
