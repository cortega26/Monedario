# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pages.test.ts >> WCAG 2.2 AA — automated scan >> Law page should have no critical or serious violations
- Location: tests/accessibility/pages.test.ts:22:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 120

- Array []
+ Array [
+   Object {
+     "description": "Ensure links are distinguished from surrounding text in a way that does not rely on color",
+     "help": "Links must be distinguishable without relying on color",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/link-in-text-block?application=playwright",
+     "id": "link-in-text-block",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "contrastRatio": 2.23,
+               "messageKey": "fgContrast",
+               "nodeColor": "#525964",
+               "parentColor": "#1a2332",
+               "requiredContrastRatio": 3,
+             },
+             "id": "link-in-text-block",
+             "impact": "serious",
+             "message": "The link has insufficient color contrast of 2.23:1 with the surrounding text. (Minimum contrast is 3:1, link text: #525964, surrounding text: #1a2332)",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<ul class=\"font-light [&>li]:inline\">",
+                 "target": Array [
+                   ".font-light",
+                 ],
+               },
+             ],
+           },
+           Object {
+             "data": null,
+             "id": "link-in-text-block-style",
+             "impact": "serious",
+             "message": "The link has no styling (such as underline) to distinguish it from the surrounding text",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<ul class=\"font-light [&>li]:inline\">",
+                 "target": Array [
+                   ".font-light",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   The link has insufficient color contrast of 2.23:1 with the surrounding text. (Minimum contrast is 3:1, link text: #525964, surrounding text: #1a2332)
+   The link has no styling (such as underline) to distinguish it from the surrounding text",
+         "html": "<a href=\"/\" class=\"text-secondary transition-colors hover:text-foreground\">
+ Inicio
+ </a>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".hover\\:text-foreground.transition-colors[href=\"/\"]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "contrastRatio": 2.23,
+               "messageKey": "fgContrast",
+               "nodeColor": "#525964",
+               "parentColor": "#1a2332",
+               "requiredContrastRatio": 3,
+             },
+             "id": "link-in-text-block",
+             "impact": "serious",
+             "message": "The link has insufficient color contrast of 2.23:1 with the surrounding text. (Minimum contrast is 3:1, link text: #525964, surrounding text: #1a2332)",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<ul class=\"font-light [&>li]:inline\">",
+                 "target": Array [
+                   ".font-light",
+                 ],
+               },
+             ],
+           },
+           Object {
+             "data": null,
+             "id": "link-in-text-block-style",
+             "impact": "serious",
+             "message": "The link has no styling (such as underline) to distinguish it from the surrounding text",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<ul class=\"font-light [&>li]:inline\">",
+                 "target": Array [
+                   ".font-light",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   The link has insufficient color contrast of 2.23:1 with the surrounding text. (Minimum contrast is 3:1, link text: #525964, surrounding text: #1a2332)
+   The link has no styling (such as underline) to distinguish it from the surrounding text",
+         "html": "<a href=\"/leyes/\" class=\"text-secondary transition-colors hover:text-foreground\"> Leyes </a>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".hover\\:text-foreground.transition-colors[href$=\"leyes/\"]",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2a",
+       "wcag141",
+       "TTv5",
+       "TT13.a",
+       "EN-301-549",
+       "EN-9.1.4.1",
+       "RGAAv4",
+       "RGAA-10.6.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Saltar al contenido" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Monedario" [ref=e5] [cursor=pointer]:
        - /url: /
        - img [ref=e6]
        - text: Monedario
      - navigation [ref=e10]:
        - list [ref=e11]:
          - listitem [ref=e12]:
            - button "Guías" [ref=e14] [cursor=pointer]:
              - text: Guías
              - img [ref=e15]
          - listitem [ref=e17]:
            - link "Calculadoras" [ref=e18] [cursor=pointer]:
              - /url: /calculadoras/
          - listitem [ref=e19]:
            - link "Glosario" [ref=e20] [cursor=pointer]:
              - /url: /glosario/
          - listitem [ref=e21]:
            - link "Nosotros" [ref=e22] [cursor=pointer]:
              - /url: /about/
          - listitem [ref=e23]:
            - link "Buscar" [ref=e24] [cursor=pointer]:
              - /url: /buscar/
              - img [ref=e25]
              - generic [ref=e29]: Buscar
          - listitem [ref=e30]:
            - button "Cambiar a modo oscuro" [ref=e31] [cursor=pointer]:
              - img [ref=e32]
  - navigation "Migas de pan" [ref=e35]:
    - list [ref=e36]:
      - listitem [ref=e37]:
        - link "Inicio" [ref=e38] [cursor=pointer]:
          - /url: /
        - img [ref=e40]
      - listitem [ref=e43]:
        - link "Leyes" [ref=e44] [cursor=pointer]:
          - /url: /leyes/
        - img [ref=e46]
      - listitem [ref=e49]: ley 18010 credito dinero
  - main [ref=e50]:
    - generic [ref=e51]:
      - generic [ref=e52]:
        - generic [ref=e53]: Crédito y Deuda
        - generic [ref=e54]: Ley 18.010
      - 'heading "Ley 18.010: Operaciones de Crédito y TMC" [level=1] [ref=e55]'
      - paragraph [ref=e56]: "Regula las operaciones de crédito en Chile: tasa de interés máxima convencional (TMC), interés corriente, prepago y anatocismo. Es la ley base del crédito de consumo chileno."
      - generic [ref=e57]:
        - generic [ref=e58]:
          - text: "Vigente desde:"
          - strong [ref=e59]: junio de 1981
        - generic [ref=e60]:
          - text: "Última modificación:"
          - strong [ref=e61]: diciembre de 2022
        - link "Texto oficial en BCN ↗" [ref=e62] [cursor=pointer]:
          - /url: https://www.bcn.cl/leychile/navegar?idNorma=29438
    - generic [ref=e63]:
      - text: ⚠️
      - strong [ref=e64]: Contenido educativo.
      - text: Esta ficha resume la normativa en términos accesibles. El texto oficial publicado en la BCN prevalece ante cualquier discrepancia. Para situaciones concretas consulta a un profesional calificado.
    - article [ref=e65]:
      - paragraph [ref=e66]:
        - text: La
        - strong [ref=e67]: Ley 18.010
        - text: "regula los créditos de dinero en Chile y fija el concepto de Tasa Máxima Convencional (TMC): el techo que ningún préstamo puede superar. Si te están cobrando una tasa que parece excesiva, esta ley es la referencia."
      - heading "¿Qué regula?" [level=2] [ref=e68]
      - paragraph [ref=e69]:
        - text: La Ley 18.010 define las reglas del juego para cualquier contrato de crédito de dinero en Chile. Es la norma que establece la
        - strong [ref=e70]: Tasa Máxima Convencional (TMC)
        - text: ": el techo legal que ningún crédito puede superar. También regula el interés corriente, el prepago y prohíbe el anatocismo (cobrar interés sobre intereses)."
      - heading "Puntos clave para personas" [level=2] [ref=e71]
      - heading "Tasa Máxima Convencional (TMC)" [level=3] [ref=e72]
      - paragraph [ref=e73]:
        - text: La TMC es el interés máximo que puede cobrar cualquier institución financiera en Chile. La fija la CMF mensualmente y varía por tipo de crédito y monto. Un crédito cuya tasa supere la TMC vigente al momento de contratar es
        - strong [ref=e74]: nulo en ese exceso
        - text: — el acreedor no puede cobrar más que la TMC.
      - heading "Interés corriente" [level=3] [ref=e75]
      - paragraph [ref=e76]: El “interés corriente” es el promedio del mercado. La CMF lo publica también mensualmente. Si un contrato no especifica tasa, se aplica el interés corriente vigente.
      - heading "Derecho a prepago" [level=3] [ref=e77]
      - paragraph [ref=e78]: Todo deudor tiene derecho a prepagar total o parcialmente su crédito en cualquier momento. El acreedor puede cobrar una comisión por prepago, pero esta está limitada por ley (generalmente 1% del monto prepagado, con tope en el monto de intereses que restarían pagar).
      - heading "Prohibición de anatocismo" [level=3] [ref=e79]
      - paragraph [ref=e80]: La ley prohíbe que el acreedor capitalice intereses impagos para cobrar interés sobre ellos (anatocismo). Cualquier cláusula que lo permita es nula.
      - heading "Artículos de referencia clave" [level=3] [ref=e81]
      - table [ref=e82]:
        - rowgroup [ref=e83]:
          - row "Artículo Contenido" [ref=e84]:
            - columnheader "Artículo" [ref=e85]
            - columnheader "Contenido" [ref=e86]
        - rowgroup [ref=e87]:
          - row "Art. 2° Definición de operaciones de crédito de dinero" [ref=e88]:
            - cell "Art. 2°" [ref=e89]
            - cell "Definición de operaciones de crédito de dinero" [ref=e90]
          - row "Art. 6° Interés corriente y TMC — definición y facultad CMF" [ref=e91]:
            - cell "Art. 6°" [ref=e92]
            - cell "Interés corriente y TMC — definición y facultad CMF" [ref=e93]
          - 'row "Art. 8° Límite máximo: no más de 1,5 veces el interés corriente" [ref=e94]':
            - cell "Art. 8°" [ref=e95]
            - 'cell "Límite máximo: no más de 1,5 veces el interés corriente" [ref=e96]'
          - row "Art. 10° Derecho de prepago y límites a la comisión" [ref=e97]:
            - cell "Art. 10°" [ref=e98]
            - cell "Derecho de prepago y límites a la comisión" [ref=e99]
          - row "Art. 9° Prohibición de anatocismo" [ref=e100]:
            - cell "Art. 9°" [ref=e101]
            - cell "Prohibición de anatocismo" [ref=e102]
      - heading "¿Cómo verificar si tu tasa supera la TMC?" [level=3] [ref=e103]
      - paragraph [ref=e104]:
        - text: La CMF publica mensualmente la TMC vigente en
        - link "cmfchile.cl" [ref=e105] [cursor=pointer]:
          - /url: https://www.cmfchile.cl/portal/principal/613/w3-channel.html
        - text: . Compara la tasa que aparece en tu contrato o en la simulación de crédito con la TMC del mes en que contrataste. Si la supera, tienes derecho a impugnarla.
      - heading "Texto oficial" [level=2] [ref=e106]
      - paragraph [ref=e107]:
        - text: "Texto completo y modificaciones:"
        - link "BCN — Ley 18.010" [ref=e108] [cursor=pointer]:
          - /url: https://www.bcn.cl/leychile/navegar?idNorma=29438
      - paragraph [ref=e109]:
        - text: "Tasas vigentes:"
        - link "CMF — Tasa Máxima Convencional e interés corriente" [ref=e110] [cursor=pointer]:
          - /url: https://www.cmfchile.cl/portal/estadisticas/617/w3-propertyvalue-43345.html?indice=15.1
      - separator [ref=e111]
      - paragraph [ref=e112]:
        - emphasis [ref=e113]: "Última verificación: marzo 2026. Esta ficha es educativa, no asesoría legal."
    - generic [ref=e114]:
      - heading "Artículos del sitio que aplican esta ley" [level=2] [ref=e115]
      - list [ref=e116]:
        - listitem [ref=e117]:
          - link "→ cae costo real credito chile" [ref=e118] [cursor=pointer]:
            - /url: /posts/cae-costo-real-credito-chile/
        - listitem [ref=e119]:
          - link "→ informe deudas cmf vs dicom" [ref=e120] [cursor=pointer]:
            - /url: /posts/informe-deudas-cmf-vs-dicom/
    - generic [ref=e121]:
      - paragraph [ref=e122]:
        - strong [ref=e123]: "Última verificación del contenido:"
        - text: 2 de marzo de 2026
      - paragraph [ref=e124]:
        - strong [ref=e125]: "Puede requerir actualización cuando:"
        - text: Cambio en la fórmula de cálculo de la TMC publicado por la CMF, o modificación de los artículos sobre prepago o anatocismo.
      - paragraph [ref=e126]:
        - link "Verificar texto oficial actualizado en BCN →" [ref=e127] [cursor=pointer]:
          - /url: https://www.bcn.cl/leychile/navegar?idNorma=29438
    - link "← Volver al Marco Legal" [ref=e129] [cursor=pointer]:
      - /url: /leyes/
  - contentinfo [ref=e130]:
    - generic [ref=e131]:
      - generic [ref=e132]:
        - navigation "Explora por tema" [ref=e133]:
          - heading "Explora por tema" [level=2] [ref=e134]
          - list [ref=e135]:
            - listitem [ref=e136]:
              - link "Sueldo" [ref=e137] [cursor=pointer]:
                - /url: /guias/sueldo-remuneraciones/
            - listitem [ref=e138]:
              - link "Deuda" [ref=e139] [cursor=pointer]:
                - /url: /guias/deuda-credito/
            - listitem [ref=e140]:
              - link "AFP" [ref=e141] [cursor=pointer]:
                - /url: /guias/pensiones-afp/
            - listitem [ref=e142]:
              - link "Impuestos" [ref=e143] [cursor=pointer]:
                - /url: /guias/impuestos-personas/
            - listitem [ref=e144]:
              - link "UF" [ref=e145] [cursor=pointer]:
                - /url: /guias/uf-costo-de-vida/
        - navigation "Herramientas" [ref=e146]:
          - heading "Herramientas" [level=2] [ref=e147]
          - list [ref=e148]:
            - listitem [ref=e149]:
              - link "Sueldo líquido" [ref=e150] [cursor=pointer]:
                - /url: /calculadoras/sueldo-liquido/
            - listitem [ref=e151]:
              - link "Finiquito" [ref=e152] [cursor=pointer]:
                - /url: /calculadoras/finiquito-indemnizacion/
            - listitem [ref=e153]:
              - link "Crédito" [ref=e154] [cursor=pointer]:
                - /url: /calculadoras/credito-consumo/
            - listitem [ref=e155]:
              - link "APV" [ref=e156] [cursor=pointer]:
                - /url: /calculadoras/apv/
            - listitem [ref=e157]:
              - link "Todas" [ref=e158] [cursor=pointer]:
                - /url: /calculadoras/
        - navigation "Confianza" [ref=e159]:
          - heading "Confianza" [level=2] [ref=e160]
          - list [ref=e161]:
            - listitem [ref=e162]:
              - link "Proceso editorial" [ref=e163] [cursor=pointer]:
                - /url: /about/
            - listitem [ref=e164]:
              - link "Glosario" [ref=e165] [cursor=pointer]:
                - /url: /glosario/
            - listitem [ref=e166]:
              - link "Leyes" [ref=e167] [cursor=pointer]:
                - /url: /leyes/
            - listitem [ref=e168]:
              - link "Novedades" [ref=e169] [cursor=pointer]:
                - /url: /cambios/
            - listitem [ref=e170]:
              - link "Contacto" [ref=e171] [cursor=pointer]:
                - /url: /contacto/
            - listitem [ref=e172]:
              - link "Accesibilidad" [ref=e173] [cursor=pointer]:
                - /url: /accessibilidad/
            - listitem [ref=e174]:
              - link "Apoyar el proyecto" [ref=e175] [cursor=pointer]:
                - /url: /apoyar/?src=footer
      - generic [ref=e176]:
        - generic [ref=e177]:
          - link "Monedario en X" [ref=e178] [cursor=pointer]:
            - /url: https://x.com/monedario_cl
            - img [ref=e179]
            - generic [ref=e183]: Monedario en X
          - link "Monedario en LinkedIn" [ref=e184] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/monedario
            - img [ref=e185]
            - generic [ref=e189]: Monedario en LinkedIn
        - generic [ref=e190]:
          - text: Contenido © 2026 Monedario ·
          - generic [ref=e191]:
            - text: Desarrollado por
            - link "Tooltician" [ref=e192] [cursor=pointer]:
              - /url: https://tooltician.com/
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { runAxe } from "./axe-helper";
  3   | 
  4   | const TEST_PAGES = [
  5   |   { name: "Homepage", url: "/" },
  6   |   { name: "Article", url: "/posts/como-calcular-sueldo-liquido/" },
  7   |   { name: "Calculator (sueldo)", url: "/calculadoras/sueldo-liquido/" },
  8   |   { name: "Calculator (UTM)", url: "/calculadoras/conversor-utm/" },
  9   |   { name: "Calculator index", url: "/calculadoras/" },
  10  |   { name: "Search", url: "/buscar/" },
  11  |   { name: "404", url: "/nonexistent/" },
  12  |   { name: "Glossary entry", url: "/glosario/cae/" },
  13  |   { name: "Law page", url: "/leyes/ley-18010-credito-dinero/" },
  14  |   { name: "About", url: "/about/" },
  15  |   { name: "Accessibility statement", url: "/accessibilidad/" },
  16  |   { name: "Tag page", url: "/tags/afp/" },
  17  |   { name: "Guides hub", url: "/guias/" },
  18  | ] as const;
  19  | 
  20  | test.describe("WCAG 2.2 AA — automated scan", () => {
  21  |   for (const pageDef of TEST_PAGES) {
  22  |     test(`${pageDef.name} should have no critical or serious violations`, async ({
  23  |       page,
  24  |     }) => {
  25  |       await page.goto(pageDef.url);
  26  |       await page.waitForLoadState("networkidle");
  27  | 
  28  |       const { violations } = await runAxe(page);
  29  | 
  30  |       const criticalAndSerious = violations.filter(
  31  |         v => v.impact === "critical" || v.impact === "serious"
  32  |       );
  33  | 
  34  |       if (criticalAndSerious.length > 0) {
  35  |         // eslint-disable-next-line no-console
  36  |         console.log(
  37  |           `\n=== ${pageDef.name} — ${criticalAndSerious.length} critical/serious violations ===`
  38  |         );
  39  |         for (const v of criticalAndSerious) {
  40  |           // eslint-disable-next-line no-console
  41  |           console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
  42  |           // eslint-disable-next-line no-console
  43  |           console.log(`  Help: ${v.helpUrl}`);
  44  |           // eslint-disable-next-line no-console
  45  |           console.log(
  46  |             `  Elements: ${v.nodes.map(n => n.target.join(", ")).join(" | ")}`
  47  |           );
  48  |         }
  49  |       }
  50  | 
> 51  |       expect(criticalAndSerious).toEqual([]);
      |                                  ^ Error: expect(received).toEqual(expected) // deep equality
  52  |     });
  53  |   }
  54  | });
  55  | 
  56  | test.describe("Accessibility element presence", () => {
  57  |   test("skip link is present on homepage", async ({ page }) => {
  58  |     await page.goto("/");
  59  |     await expect(page.locator("#skip-to-content")).toBeVisible();
  60  |   });
  61  | 
  62  |   test("dropdown menu uses ul (not role=menu) with aria-expanded", async ({
  63  |     page,
  64  |   }) => {
  65  |     await page.goto("/");
  66  |     // The dropdown button should have aria-expanded="false" initially
  67  |     await expect(page.locator("#guias-dropdown-button")).toHaveAttribute(
  68  |       "aria-expanded",
  69  |       "false"
  70  |     );
  71  |     // The menu should be a <ul> (not a <div role="menu">)
  72  |     await expect(page.locator("#guias-dropdown-menu")).not.toHaveAttribute(
  73  |       "role",
  74  |       "menu"
  75  |     );
  76  |   });
  77  | 
  78  |   test("search form has role=search", async ({ page }) => {
  79  |     await page.goto("/buscar/");
  80  |     await page.waitForLoadState("networkidle");
  81  | 
  82  |     // The custom search form has role="search" and id="search-form"
  83  |     const searchForm = page.locator("#search-form");
  84  |     await expect(searchForm).toHaveAttribute("role", "search");
  85  |   });
  86  | 
  87  |   test("back-to-top button has aria-label after scrolling", async ({
  88  |     page,
  89  |   }) => {
  90  |     await page.goto("/posts/como-calcular-sueldo-liquido/");
  91  |     await page.waitForLoadState("networkidle");
  92  | 
  93  |     // Scroll down to make back-to-top visible
  94  |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  95  |     await page.waitForTimeout(500);
  96  | 
  97  |     const backToTop = page.locator('[data-button="back-to-top"]');
  98  |     await expect(backToTop).toHaveAttribute("aria-label", "Volver arriba");
  99  |   });
  100 | });
  101 | 
```