import { describe, expect, it } from "vitest";

import {
  INDICADORES_PATH,
  bodyToPlainMarkdown,
  buildLlmsHeader,
  buildLlmsInstructions,
  buildLlmsScope,
} from "@/utils/llmsTxt";

const BASE = "https://monedario.cl";

describe("INDICADORES_PATH", () => {
  it("apunta a la página de hub real (no al inexistente /indicadores/)", () => {
    expect(INDICADORES_PATH).toBe(
      "/guias/uf-costo-de-vida/indicadores-economicos/"
    );
  });
});

describe("buildLlmsHeader", () => {
  it("emite un H1 y un resumen en blockquote (formato llms.txt)", () => {
    const header = buildLlmsHeader();
    expect(header.startsWith("# ")).toBe(true);
    expect(header).toContain("\n> ");
  });
});

describe("buildLlmsScope", () => {
  it("incluye la sección de cobertura y los límites de alcance", () => {
    const scope = buildLlmsScope();
    expect(scope).toContain("## Cobertura temática");
    expect(scope).toContain("**Fuera de alcance:**");
  });
});

describe("buildLlmsInstructions", () => {
  it("remite a la ruta canónica de indicadores, no a /indicadores/", () => {
    const instructions = buildLlmsInstructions(BASE);
    expect(instructions).toContain(`${BASE}${INDICADORES_PATH}`);
    expect(instructions).not.toContain(`${BASE}/indicadores/`);
  });

  it("conserva las reglas de atribución y de no-asesoría", () => {
    const instructions = buildLlmsInstructions(BASE);
    expect(instructions).toContain("atribución");
    expect(instructions).toContain("asesoría financiera personalizada");
  });
});

describe("bodyToPlainMarkdown", () => {
  it("deja intacto el markdown puro", () => {
    const md = "## Título\n\nUn párrafo con [enlace](/posts/x/).";
    expect(bodyToPlainMarkdown(md)).toBe(md);
  });

  it("elimina las sentencias import/export de MDX", () => {
    const mdx =
      'import Foo from "@/components/Foo.astro";\n\nTexto del cuerpo.';
    expect(bodyToPlainMarkdown(mdx)).toBe("Texto del cuerpo.");
  });

  it("reemplaza componentes JSX por su descripcion", () => {
    const mdx =
      'El tope es <IndicadorEconomico tipo="utm" multiplicador={6} descripcion="6 UTM" /> al año.';
    expect(bodyToPlainMarkdown(mdx)).toBe("El tope es 6 UTM al año.");
  });

  it("elimina componentes JSX sin descripcion", () => {
    const mdx = "Antes <Widget data={x} /> después.";
    expect(bodyToPlainMarkdown(mdx)).toBe("Antes  después.");
  });

  it("no toca HTML inline en minúscula", () => {
    const md = "Una línea<br/>y otra.";
    expect(bodyToPlainMarkdown(md)).toBe(md);
  });
});
