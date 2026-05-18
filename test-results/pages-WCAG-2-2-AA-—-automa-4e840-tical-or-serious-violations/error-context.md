# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pages.test.ts >> WCAG 2.2 AA — automated scan >> Accessibility statement should have no critical or serious violations
- Location: tests/accessibility/pages.test.ts:22:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 72

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
      - listitem [ref=e43]: accessibilidad
  - main [ref=e44]:
    - generic [ref=e45]:
      - paragraph [ref=e46]: Accesibilidad
      - heading "Declaración de accesibilidad" [level=1] [ref=e47]
      - paragraph [ref=e48]: Monedario busca que su contenido sea utilizable por la mayor cantidad de personas posible, independientemente de sus capacidades o del dispositivo que utilicen.
    - generic [ref=e49]:
      - heading "Estado de conformidad" [level=2] [ref=e50]
      - paragraph [ref=e51]:
        - text: Este sitio se encuentra
        - strong [ref=e52]: parcialmente conforme
        - text: con las
        - strong [ref=e53]: Pautas de Accesibilidad para el Contenido Web (WCAG) 2.2
        - text: en su
        - strong [ref=e54]: Nivel AA
        - text: .
      - paragraph [ref=e55]: Esto significa que la mayor parte del contenido cumple con los criterios de accesibilidad, pero existen secciones que aún no alcanzan la conformidad completa y están siendo revisadas activamente.
    - generic [ref=e56]:
      - heading "Método de evaluación" [level=2] [ref=e57]
      - paragraph [ref=e58]: "La accesibilidad se evalúa mediante:"
      - list [ref=e59]:
        - listitem [ref=e60]:
          - text: Pruebas automatizadas con
          - strong [ref=e61]: axe-core
          - text: "(motor de análisis de accesibilidad) sobre las plantillas principales del sitio: portada, artículo, calculadora, buscador y página de error."
        - listitem [ref=e62]: Auditoría manual de navegación por teclado y lectores de pantalla (VoiceOver, NVDA).
        - listitem [ref=e63]: Verificación de contraste de color con herramientas de medición cromática.
      - paragraph [ref=e64]:
        - text: "Fecha de la última evaluación:"
        - strong [ref=e65]: mayo de 2026
        - text: .
    - generic [ref=e66]:
      - heading "Características accesibles" [level=2] [ref=e67]
      - generic [ref=e68]:
        - generic [ref=e69]:
          - paragraph [ref=e70]: Navegación por teclado
          - paragraph [ref=e71]: Enlace de salto al contenido al inicio de cada página. Todos los menús, formularios y componentes interactivos son accesibles mediante la tecla Tab. Los menús desplegables y la navegación móvil atrapan el foco para evitar que desaparezca de la interfaz.
        - generic [ref=e72]:
          - paragraph [ref=e73]: Lectores de pantalla
          - paragraph [ref=e74]:
            - text: Los componentes interactivos tienen etiquetas descriptivas (
            - code [ref=e75]: aria-label
            - text: ). Los íconos decorativos están ocultos para lectores de pantalla (
            - code [ref=e76]: aria-hidden="true"
            - text: ). Las secciones de la página están identificadas como puntos de referencia (landmarks) ARIA.
        - generic [ref=e77]:
          - paragraph [ref=e78]: Contraste y color
          - paragraph [ref=e79]: El texto principal supera el umbral de contraste WCAG AA (4.5:1). El sitio usa colores semánticos en lugar de opacidades para el texto secundario. El tema oscuro mantiene relaciones de contraste equivalentes.
        - generic [ref=e80]:
          - paragraph [ref=e81]: Movimiento reducido
          - paragraph [ref=e82]:
            - text: El sitio respeta la preferencia del sistema operativo (
            - code [ref=e83]: "prefers-reduced-motion: reduce"
            - text: ) desactivando animaciones, transiciones y desplazamiento suave.
        - generic [ref=e84]:
          - paragraph [ref=e85]: Impresión
          - paragraph [ref=e86]: El sitio incluye una hoja de estilos para impresión que elimina elementos no esenciales (navegación, botones) y optimiza la legibilidad en papel.
    - generic [ref=e87]:
      - heading "Limitaciones conocidas" [level=2] [ref=e88]
      - paragraph [ref=e89]: "Estamos trabajando para resolver las siguientes limitaciones:"
      - generic [ref=e90]:
        - generic [ref=e91]:
          - paragraph [ref=e92]: Resultados de calculadoras
          - paragraph [ref=e93]:
            - text: Aunque los resultados se anuncian mediante regiones en vivo (
            - code [ref=e94]: aria-live
            - text: ), algunos calculadores pueden no anunciar correctamente los cambios en todos los lectores de pantalla. Estamos revisando la cobertura de las 18 calculadoras del sitio.
        - generic [ref=e95]:
          - paragraph [ref=e96]: Indicadores de progreso
          - paragraph [ref=e97]: La barra de progreso de lectura y el indicador circular del botón "Volver arriba" tienen soporte ARIA limitado. La actualización del valor porcentual puede no anunciarse correctamente en todos los lectores de pantalla.
        - generic [ref=e98]:
          - paragraph [ref=e99]: Contenido incrustado de terceros
          - paragraph [ref=e100]: Algunos componentes cargados dinámicamente (Pagefind, ciertos gráficos) pueden tener limitaciones de accesibilidad que están fuera de nuestro control directo.
    - generic [ref=e102]:
      - heading "Reportar un problema de accesibilidad" [level=2] [ref=e103]
      - paragraph [ref=e104]:
        - text: Si encuentras alguna barrera que te impida usar el sitio — un botón sin etiqueta, un contraste insuficiente, un formulario que no funciona con tu lector de pantalla o cualquier otra dificultad — escríbenos a
        - link "contacto@monedario.cl" [ref=e105] [cursor=pointer]:
          - /url: mailto:contacto@monedario.cl
        - text: .
      - paragraph [ref=e106]:
        - text: Nos comprometemos a responder dentro de los
        - strong [ref=e107]: 10 días hábiles
        - text: e implementar la corrección correspondiente en el plazo más breve posible.
  - contentinfo [ref=e108]:
    - generic [ref=e109]:
      - generic [ref=e110]:
        - navigation "Explora por tema" [ref=e111]:
          - heading "Explora por tema" [level=2] [ref=e112]
          - list [ref=e113]:
            - listitem [ref=e114]:
              - link "Sueldo" [ref=e115] [cursor=pointer]:
                - /url: /guias/sueldo-remuneraciones/
            - listitem [ref=e116]:
              - link "Deuda" [ref=e117] [cursor=pointer]:
                - /url: /guias/deuda-credito/
            - listitem [ref=e118]:
              - link "AFP" [ref=e119] [cursor=pointer]:
                - /url: /guias/pensiones-afp/
            - listitem [ref=e120]:
              - link "Impuestos" [ref=e121] [cursor=pointer]:
                - /url: /guias/impuestos-personas/
            - listitem [ref=e122]:
              - link "UF" [ref=e123] [cursor=pointer]:
                - /url: /guias/uf-costo-de-vida/
        - navigation "Herramientas" [ref=e124]:
          - heading "Herramientas" [level=2] [ref=e125]
          - list [ref=e126]:
            - listitem [ref=e127]:
              - link "Sueldo líquido" [ref=e128] [cursor=pointer]:
                - /url: /calculadoras/sueldo-liquido/
            - listitem [ref=e129]:
              - link "Finiquito" [ref=e130] [cursor=pointer]:
                - /url: /calculadoras/finiquito-indemnizacion/
            - listitem [ref=e131]:
              - link "Crédito" [ref=e132] [cursor=pointer]:
                - /url: /calculadoras/credito-consumo/
            - listitem [ref=e133]:
              - link "APV" [ref=e134] [cursor=pointer]:
                - /url: /calculadoras/apv/
            - listitem [ref=e135]:
              - link "Todas" [ref=e136] [cursor=pointer]:
                - /url: /calculadoras/
        - navigation "Confianza" [ref=e137]:
          - heading "Confianza" [level=2] [ref=e138]
          - list [ref=e139]:
            - listitem [ref=e140]:
              - link "Proceso editorial" [ref=e141] [cursor=pointer]:
                - /url: /about/
            - listitem [ref=e142]:
              - link "Glosario" [ref=e143] [cursor=pointer]:
                - /url: /glosario/
            - listitem [ref=e144]:
              - link "Leyes" [ref=e145] [cursor=pointer]:
                - /url: /leyes/
            - listitem [ref=e146]:
              - link "Novedades" [ref=e147] [cursor=pointer]:
                - /url: /cambios/
            - listitem [ref=e148]:
              - link "Contacto" [ref=e149] [cursor=pointer]:
                - /url: /contacto/
            - listitem [ref=e150]:
              - link "Accesibilidad" [ref=e151] [cursor=pointer]:
                - /url: /accessibilidad/
            - listitem [ref=e152]:
              - link "Apoyar el proyecto" [ref=e153] [cursor=pointer]:
                - /url: /apoyar/?src=footer
      - generic [ref=e154]:
        - generic [ref=e155]:
          - link "Monedario en X" [ref=e156] [cursor=pointer]:
            - /url: https://x.com/monedario_cl
            - img [ref=e157]
            - generic [ref=e161]: Monedario en X
          - link "Monedario en LinkedIn" [ref=e162] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/monedario
            - img [ref=e163]
            - generic [ref=e167]: Monedario en LinkedIn
        - generic [ref=e168]:
          - text: Contenido © 2026 Monedario ·
          - generic [ref=e169]:
            - text: Desarrollado por
            - link "Tooltician" [ref=e170] [cursor=pointer]:
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