import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildCatalog } from "../../scripts/export-reddit-catalog.mjs";

const roots: string[] = [];

function write(root: string, rel: string, content: string) {
  const file = path.join(root, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content, "utf8");
}

const REGISTRY = {
  "pensiones-afp": {
    "elegir-afp": {
      ownerSlug: "como-elegir-afp",
      intentLabel: "elegir AFP segun comision y rentabilidad",
    },
  },
};
const GUIDE_HUBS = {
  "pensiones-afp": {
    nombre: "Pensiones y AFP",
    descripcion: "Seccion sobre previsión obligatoria.",
    homepageResumen: "¿Cuánto cotizas?",
  },
};

function fixtureRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), "reddit-catalog-"));
  roots.push(root);
  write(
    root,
    "context/published-articles-index.json",
    JSON.stringify({
      articles: [
        {
          slug: "como-elegir-afp",
          title: "Cómo elegir AFP",
          category: "prevision",
          cluster: "pensiones-afp",
          tags: ["afp", "pension"],
          sourcePath: "src/data/blog/como-elegir-afp.md",
          summary: "resumen del indice.",
        },
        {
          slug: "pagina-oculta",
          title: "Oculta",
          cluster: "pensiones-afp",
          sourcePath: "src/data/blog/pagina-oculta.md",
        },
      ],
    })
  );
  write(
    root,
    "src/data/blog/como-elegir-afp.md",
    "---\ncanonicalTopic: elegir-afp\ntopicRole: owner\ndescription: Compara comisiones. Termina con punto.\n---\ncuerpo"
  );
  write(
    root,
    "src/data/blog/pagina-oculta.md",
    "---\nunlisted: true\ncanonicalTopic: x\n---\ncuerpo"
  );
  write(
    root,
    "src/pages/calculadoras/sueldo-liquido.astro",
    '<Layout title="Calculadora de Sueldo Líquido | Chile" description="Estima tu sueldo líquido.">'
  );
  write(root, "src/pages/calculadoras/index.astro", '<Layout title="Todas">');
  write(
    root,
    "src/data/glossary/afp.md",
    "---\nterm: AFP\nshortDefinition: Administra tus ahorros.\n---\n"
  );
  write(
    root,
    "src/data/laws/dl-3500.md",
    "---\ntitle: DL 3.500 completo\nshortName: DL 3.500\n---\n"
  );
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("buildCatalog", () => {
  it("cubre los 5 tipos con URLs derivadas del slug y cobertura por tipo", () => {
    const catalog = buildCatalog({
      root: fixtureRoot(),
      registry: REGISTRY,
      guideHubs: GUIDE_HUBS,
    });
    const byType = Object.fromEntries(
      catalog.entries.map(e => [e.type, e])
    );
    expect(catalog.counts).toEqual({
      article: 1,
      calculator: 1,
      glossary: 1,
      guide: 1,
      law: 1,
    });
    expect(byType.article.url).toBe("/posts/como-elegir-afp/");
    expect(byType.calculator.url).toBe("/calculadoras/sueldo-liquido/");
    expect(byType.guide.url).toBe("/guias/pensiones-afp/");
    expect(byType.glossary.url).toBe("/glosario/afp/");
    expect(byType.law.url).toBe("/leyes/dl-3500/");
    expect(byType.article.coverage).toBe("full");
    expect(byType.calculator.coverage).toBe("full");
    expect(byType.guide.coverage).toBe("full");
    expect(byType.glossary.coverage).toBe("partial");
    expect(byType.law.coverage).toBe("partial");
  });

  it("une el dueño del tema del registro y excluye páginas unlisted", () => {
    const catalog = buildCatalog({
      root: fixtureRoot(),
      registry: REGISTRY,
      guideHubs: GUIDE_HUBS,
    });
    const articles = catalog.entries.filter(e => e.type === "article");
    expect(articles.map(a => a.id)).toEqual(["como-elegir-afp"]); // 'pagina-oculta' fuera
    expect(articles[0]).toMatchObject({
      cluster: "pensiones-afp",
      canonicalTopic: "elegir-afp",
      topicRole: "owner",
      ownerSlug: "como-elegir-afp",
    });
    expect(articles[0].text).toContain("elegir AFP segun comision");
  });

  it("limpia el título de la calculadora y no deja dobles puntos", () => {
    const catalog = buildCatalog({
      root: fixtureRoot(),
      registry: REGISTRY,
      guideHubs: GUIDE_HUBS,
    });
    const calc = catalog.entries.find(e => e.type === "calculator");
    expect(calc?.title).toBe("Calculadora de Sueldo Líquido"); // sin " | Chile"
    for (const e of catalog.entries) expect(e.text).not.toMatch(/\.\./);
  });

  it("es determinista y ordenado por tipo e id", () => {
    const root = fixtureRoot();
    const a = buildCatalog({ root, registry: REGISTRY, guideHubs: GUIDE_HUBS });
    const b = buildCatalog({ root, registry: REGISTRY, guideHubs: GUIDE_HUBS });
    expect(a).toEqual(b);
    const keys = a.entries.map(e => `${e.type}:${e.id}`);
    expect(keys).toEqual([...keys].sort());
  });

  it("tolera un árbol vacío", () => {
    const root = mkdtempSync(path.join(tmpdir(), "reddit-catalog-empty-"));
    roots.push(root);
    expect(buildCatalog({ root }).entries).toEqual([]);
  });
});
