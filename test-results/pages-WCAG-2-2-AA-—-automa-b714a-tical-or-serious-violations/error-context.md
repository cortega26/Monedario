# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pages.test.ts >> WCAG 2.2 AA — automated scan >> About should have no critical or serious violations
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
+               "contrastRatio": 1.17,
+               "messageKey": "fgContrast",
+               "nodeColor": "#1a4f8a",
+               "parentColor": "#525964",
+               "requiredContrastRatio": 3,
+             },
+             "id": "link-in-text-block",
+             "impact": "serious",
+             "message": "The link has insufficient color contrast of 1.17:1 with the surrounding text. (Minimum contrast is 3:1, link text: #1a4f8a, surrounding text: #525964)",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<p class=\"mt-8 max-w-2xl text-sm leading-relaxed text-secondary\">",
+                 "target": Array [
+                   ".mt-8.max-w-2xl.leading-relaxed",
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
+                 "html": "<p class=\"mt-8 max-w-2xl text-sm leading-relaxed text-secondary\">",
+                 "target": Array [
+                   ".mt-8.max-w-2xl.leading-relaxed",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   The link has insufficient color contrast of 1.17:1 with the surrounding text. (Minimum contrast is 3:1, link text: #1a4f8a, surrounding text: #525964)
+   The link has no styling (such as underline) to distinguish it from the surrounding text",
+         "html": "<a href=\"/contacto/\" class=\"text-accent underline-offset-4 hover:underline\">escríbenos</a>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".underline-offset-4.text-accent[href$=\"contacto/\"]",
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
      - listitem [ref=e43]: Nosotros
  - main [ref=e44]:
    - generic [ref=e45]:
      - paragraph [ref=e46]: Sobre nosotros
      - heading "Cuando entiendes tu plata, tomas mejores decisiones." [level=1] [ref=e47]:
        - text: Cuando entiendes tu plata,
        - text: tomas mejores decisiones.
      - paragraph [ref=e48]:
        - strong [ref=e49]: Monedario
        - text: es un proyecto de educación financiera dedicado a explicar el sistema financiero chileno de forma clara, rigurosa y basada en fuentes oficiales. Su misión es ayudar a las personas a entender decisiones financieras complejas —ahorro, inversión, impuestos, crédito o pensiones— sin conflictos de interés.
      - paragraph [ref=e50]:
        - text: El nombre no es arbitrario.
        - emphasis [ref=e51]: Monedario
        - text: "es, en su acepción más concreta, el estuche donde se guardan y ordenan las monedas. No una fortuna ni un portafolio de inversión: monedas — los descuentos del sueldo, las retenciones de honorarios, los fondos de la AFP, el costo real de un crédito. Las cosas que ya están en tu bolsillo pero que nadie se tomó el tiempo de organizar para ti. Ese es exactamente el trabajo de este sitio: ordenarlas, nombrarlas, explicarlas."
    - generic [ref=e52]:
      - heading "¿Por qué existe este sitio?" [level=2] [ref=e53]
      - paragraph [ref=e54]: Porque la mayoría de la información financiera disponible en internet está escrita para economistas, no para personas normales. Los trámites de la AFP, el beneficio tributario del APV, los tramos del impuesto de segunda categoría — todo eso afecta directamente tu bolsillo, pero nadie te lo explica en términos simples.
      - paragraph [ref=e55]: Monedario nació para cambiar eso.
    - generic [ref=e56]:
      - heading "¿Qué encontrarás aquí?" [level=2] [ref=e57]
      - generic [ref=e58]:
        - generic [ref=e59]:
          - paragraph [ref=e60]: 📋 Guías claras
          - paragraph [ref=e61]: AFP, APV, impuestos, inversiones y créditos explicados para la realidad chilena.
        - generic [ref=e62]:
          - paragraph [ref=e63]: 🧮 Calculadoras prácticas
          - paragraph [ref=e64]: Herramientas para que puedas hacer tus propios números sin depender de nadie.
        - generic [ref=e65]:
          - paragraph [ref=e66]: 🔄 Contenido actualizado
          - paragraph [ref=e67]: Pensado para la realidad chilena y actualizado cuando cambian las leyes y tasas.
        - generic [ref=e68]:
          - paragraph [ref=e69]: 🔓 Sin letra chica
          - paragraph [ref=e70]: Todo gratis, sin registro, sin spam. Sin conflictos de interés.
    - generic [ref=e71]:
      - heading "Proceso editorial" [level=2] [ref=e72]
      - paragraph [ref=e73]: El contenido de Monedario describe normas tributarias, tasas de cotización, plazos legales e instrumentos financieros — información con consecuencias reales para quien la lee. Por eso cada artículo sobre estas materias sigue siete etapas de elaboración antes de publicarse.
      - list [ref=e74]:
        - listitem [ref=e75]:
          - generic [ref=e76]: "1"
          - generic [ref=e77]:
            - paragraph [ref=e78]: Brief
            - paragraph [ref=e79]: Se define la pregunta concreta que el artículo responde, qué queda fuera del alcance, qué organismos reguladores son relevantes y qué tan sensible es el tema para el lector.
        - listitem [ref=e80]:
          - generic [ref=e81]: "2"
          - generic [ref=e82]:
            - paragraph [ref=e83]: Dossier de fuentes
            - paragraph [ref=e84]: "Se recopilan las fuentes primarias: textos legales, resoluciones y circulares de organismos reguladores, documentos técnicos y estadísticas oficiales. Todos los números citables se rastrean hasta su origen antes de entrar al borrador."
        - listitem [ref=e85]:
          - generic [ref=e86]: "3"
          - generic [ref=e87]:
            - paragraph [ref=e88]: Esquema
            - paragraph [ref=e89]: Se estructura el artículo en torno a la decisión real del lector. La respuesta concreta va primero; el contexto y las excepciones, después.
        - listitem [ref=e90]:
          - generic [ref=e91]: "4"
          - generic [ref=e92]:
            - paragraph [ref=e93]: Borrador
            - paragraph [ref=e94]: Se redacta el artículo siguiendo el esquema aprobado y las fuentes del dossier.
        - listitem [ref=e95]:
          - generic [ref=e96]: "5"
          - generic [ref=e97]:
            - paragraph [ref=e98]: Auditoría de cálculos
            - paragraph [ref=e99]: Todos los números, fórmulas y ejemplos del artículo se verifican de forma independiente antes de publicar. Si hay una discrepancia entre el borrador y la fuente, el borrador se corrige.
        - listitem [ref=e100]:
          - generic [ref=e101]: "6"
          - generic [ref=e102]:
            - paragraph [ref=e103]: Revisión regulatoria
            - paragraph [ref=e104]: Se verifica que las afirmaciones sobre leyes, plazos, tasas y requisitos correspondan a la normativa vigente. Se confirman las citas legales y se añade el aviso de que la información es educativa y no reemplaza asesoría profesional.
        - listitem [ref=e105]:
          - generic [ref=e106]: "7"
          - generic [ref=e107]:
            - paragraph [ref=e108]: Lista de chequeo final
            - paragraph [ref=e109]: Se verifica que todos los enlaces funcionen, que la fecha de vigencia esté declarada, que no haya contradicciones internas y que el artículo esté listo para publicar.
      - generic [ref=e110]:
        - generic [ref=e111]:
          - heading "Verificación independiente" [level=3] [ref=e112]
          - paragraph [ref=e113]: En artículos sobre impuestos, pensiones, inversiones, deuda y cualquier contenido que incluya cálculos, la auditoría de números (etapa 5) y la revisión regulatoria (etapa 6) las realiza un rol diferente al que redactó el borrador. El objetivo es evitar que quien escribe valide su propio trabajo.
        - generic [ref=e114]:
          - heading "Política de vigencia" [level=3] [ref=e115]
          - paragraph [ref=e116]: Cada artículo declara la fecha hasta la cual es válida su información — visible en el encabezado del artículo. El sitio ejecuta comprobaciones automáticas que identifican artículos cuya vigencia puede haberse vencido por cambios regulatorios, nuevas tasas publicadas o fechas límite superadas, y los marca para revisión.
        - generic [ref=e117]:
          - heading "Fuentes que utilizamos" [level=3] [ref=e118]
          - paragraph [ref=e119]: "Las fuentes primarias varían según el tema. Estas son las principales:"
          - generic [ref=e120]:
            - generic [ref=e121]:
              - paragraph [ref=e122]: Impuestos y tributación
              - list [ref=e123]:
                - listitem [ref=e124]:
                  - link "SII — Servicio de Impuestos Internos" [ref=e125] [cursor=pointer]:
                    - /url: https://www.sii.cl
                - listitem [ref=e126]:
                  - link "Ley Chile (Biblioteca del Congreso Nacional)" [ref=e127] [cursor=pointer]:
                    - /url: https://www.bcn.cl/leychile/
            - generic [ref=e128]:
              - paragraph [ref=e129]: Pensiones y AFP
              - list [ref=e130]:
                - listitem [ref=e131]:
                  - link "Superintendencia de Pensiones" [ref=e132] [cursor=pointer]:
                    - /url: https://www.spensiones.cl
            - generic [ref=e133]:
              - paragraph [ref=e134]: Crédito, deuda e inversiones
              - list [ref=e135]:
                - listitem [ref=e136]:
                  - link "CMF — Comisión para el Mercado Financiero" [ref=e137] [cursor=pointer]:
                    - /url: https://www.cmfchile.cl/portal/principal/613/w3-channel.html
                - listitem [ref=e138]:
                  - link "SERNAC" [ref=e139] [cursor=pointer]:
                    - /url: https://www.sernac.cl
            - generic [ref=e140]:
              - paragraph [ref=e141]: Indicadores económicos
              - list [ref=e142]:
                - listitem [ref=e143]:
                  - link "Banco Central de Chile" [ref=e144] [cursor=pointer]:
                    - /url: https://www.bcentral.cl
                - listitem [ref=e145]:
                  - link "INE — Instituto Nacional de Estadísticas" [ref=e146] [cursor=pointer]:
                    - /url: https://www.ine.gob.cl
            - generic [ref=e147]:
              - paragraph [ref=e148]: Empleo y salud laboral
              - list [ref=e149]:
                - listitem [ref=e150]:
                  - link "Dirección del Trabajo" [ref=e151] [cursor=pointer]:
                    - /url: https://www.dt.gob.cl/portal/1626/w3-channel.html
                - listitem [ref=e152]:
                  - link "SUSESO" [ref=e153] [cursor=pointer]:
                    - /url: https://www.suseso.gob.cl/601/w3-channel.html
                - listitem [ref=e154]:
                  - link "AFC Chile" [ref=e155] [cursor=pointer]:
                    - /url: https://www.afc.cl
            - generic [ref=e156]:
              - paragraph [ref=e157]: Trámites del Estado
              - list [ref=e158]:
                - listitem [ref=e159]:
                  - link "ChileAtiende" [ref=e160] [cursor=pointer]:
                    - /url: https://www.chileatiende.gob.cl
      - paragraph [ref=e161]:
        - text: No prometemos infalibilidad. Sí prometemos un proceso diseñado para reducir al mínimo errores evitables. Si encuentras un error factual,
        - link "escríbenos" [ref=e162] [cursor=pointer]:
          - /url: /contacto/
        - text: .
    - generic [ref=e163]:
      - heading "¿Quién lo escribe?" [level=2] [ref=e164]
      - generic [ref=e165]:
        - link "Foto de Carlos Ortega González" [ref=e166] [cursor=pointer]:
          - /url: /autor/
          - img "Foto de Carlos Ortega González" [ref=e167]
        - generic [ref=e168]:
          - paragraph [ref=e169]:
            - link "Carlos Ortega González" [ref=e170] [cursor=pointer]:
              - /url: /autor/
          - paragraph [ref=e171]: Investigador financiero y desarrollador de herramientas de educación financiera para Chile. Abogado de formación y analista de datos.
          - generic [ref=e172]:
            - link "Ver perfil completo →" [ref=e173] [cursor=pointer]:
              - /url: /autor/
            - link "LinkedIn ↗" [ref=e174] [cursor=pointer]:
              - /url: https://www.linkedin.com/in/cortega26/
    - generic [ref=e175]:
      - heading "Un proyecto independiente" [level=2] [ref=e176]
      - paragraph [ref=e177]: "Monedario es un proyecto personal creado para ayudar a personas en Chile a entender mejor su dinero: ahorro, deuda, impuestos, sueldos, pensiones e inversión."
      - paragraph [ref=e178]: Mantenerlo toma muchas horas cada semana — investigar fuentes oficiales, revisar cambios normativos, actualizar guías y afinar calculadoras para que la información sea precisa y responsable.
      - paragraph [ref=e179]: El acceso es completamente gratuito. Sin registro, sin publicidad, sin conflictos de interés.
      - generic [ref=e180]:
        - generic [ref=e181]:
          - paragraph [ref=e182]: Si te sirvió, pásalo
          - paragraph [ref=e183]: La forma más directa de apoyar este proyecto es pasarle el link a alguien que lo necesite — una guía, una calculadora o el sitio completo. Es gratis, tarda segundos y es lo que más ayuda a que llegue a más personas.
        - generic [ref=e184]:
          - paragraph [ref=e185]: ¿Quieres contribuir un poco más?
          - paragraph [ref=e186]:
            - text: Puedes
            - link "apoyar el proyecto" [ref=e187] [cursor=pointer]:
              - /url: /apoyar/?src=about
            - text: — cualquier aporte ayuda a sostener el trabajo.
    - generic [ref=e188]:
      - generic [ref=e189]:
        - heading "⚠️ Aviso importante" [level=2] [ref=e190]
        - paragraph [ref=e191]:
          - text: La información publicada en Monedario tiene
          - strong [ref=e192]: carácter exclusivamente educativo
          - text: y no constituye asesoría financiera, tributaria ni legal. Siempre consulta con un profesional calificado antes de tomar decisiones importantes sobre tu dinero.
        - paragraph [ref=e193]:
          - text: El contenido se elabora a partir de normativa oficial y fuentes públicas, y se actualiza periódicamente. El sitio mantiene
          - strong [ref=e194]: independencia editorial
          - text: ": no está condicionado por comisiones, publicidad financiera ni acuerdos con instituciones."
        - paragraph [ref=e195]:
          - text: Para información oficial consulta la
          - link "Superintendencia de Pensiones" [ref=e196] [cursor=pointer]:
            - /url: https://www.spensiones.cl
          - text: ", la"
          - link "CMF" [ref=e197] [cursor=pointer]:
            - /url: https://www.cmfchile.cl/portal/principal/613/w3-channel.html
          - text: y el
          - link "SII" [ref=e198] [cursor=pointer]:
            - /url: https://www.sii.cl
          - text: .
      - paragraph [ref=e199]:
        - text: ¿Tienes alguna sugerencia o encontraste un error? Escríbenos a
        - 'link "Correo electrónico: contacto arroba monedario punto cl" [ref=e200] [cursor=pointer]':
          - /url: mailto:contacto@monedario.cl
          - text: contacto[at]monedario.cl
        - text: .
    - complementary "Apoya Monedario" [ref=e201]:
      - paragraph [ref=e202]: ¿Te sirvió esta página?
      - heading "Monedario es gratuito e independiente" [level=2] [ref=e203]
      - paragraph [ref=e204]:
        - text: Puedes ayudar compartiendo
        - strong [ref=e205]: Monedario
        - text: con alguien a quien le pueda servir, o apoyando el mantenimiento del proyecto.
      - generic [ref=e206]:
        - button "Compartir esta página" [ref=e207] [cursor=pointer]
        - link "Apoyar Monedario →" [ref=e208] [cursor=pointer]:
          - /url: /apoyar/?src=about
  - contentinfo [ref=e209]:
    - generic [ref=e210]:
      - generic [ref=e211]:
        - navigation "Explora por tema" [ref=e212]:
          - heading "Explora por tema" [level=2] [ref=e213]
          - list [ref=e214]:
            - listitem [ref=e215]:
              - link "Sueldo" [ref=e216] [cursor=pointer]:
                - /url: /guias/sueldo-remuneraciones/
            - listitem [ref=e217]:
              - link "Deuda" [ref=e218] [cursor=pointer]:
                - /url: /guias/deuda-credito/
            - listitem [ref=e219]:
              - link "AFP" [ref=e220] [cursor=pointer]:
                - /url: /guias/pensiones-afp/
            - listitem [ref=e221]:
              - link "Impuestos" [ref=e222] [cursor=pointer]:
                - /url: /guias/impuestos-personas/
            - listitem [ref=e223]:
              - link "UF" [ref=e224] [cursor=pointer]:
                - /url: /guias/uf-costo-de-vida/
        - navigation "Herramientas" [ref=e225]:
          - heading "Herramientas" [level=2] [ref=e226]
          - list [ref=e227]:
            - listitem [ref=e228]:
              - link "Sueldo líquido" [ref=e229] [cursor=pointer]:
                - /url: /calculadoras/sueldo-liquido/
            - listitem [ref=e230]:
              - link "Finiquito" [ref=e231] [cursor=pointer]:
                - /url: /calculadoras/finiquito-indemnizacion/
            - listitem [ref=e232]:
              - link "Crédito" [ref=e233] [cursor=pointer]:
                - /url: /calculadoras/credito-consumo/
            - listitem [ref=e234]:
              - link "APV" [ref=e235] [cursor=pointer]:
                - /url: /calculadoras/apv/
            - listitem [ref=e236]:
              - link "Todas" [ref=e237] [cursor=pointer]:
                - /url: /calculadoras/
        - navigation "Confianza" [ref=e238]:
          - heading "Confianza" [level=2] [ref=e239]
          - list [ref=e240]:
            - listitem [ref=e241]:
              - link "Proceso editorial" [ref=e242] [cursor=pointer]:
                - /url: /about/
            - listitem [ref=e243]:
              - link "Glosario" [ref=e244] [cursor=pointer]:
                - /url: /glosario/
            - listitem [ref=e245]:
              - link "Leyes" [ref=e246] [cursor=pointer]:
                - /url: /leyes/
            - listitem [ref=e247]:
              - link "Novedades" [ref=e248] [cursor=pointer]:
                - /url: /cambios/
            - listitem [ref=e249]:
              - link "Contacto" [ref=e250] [cursor=pointer]:
                - /url: /contacto/
            - listitem [ref=e251]:
              - link "Accesibilidad" [ref=e252] [cursor=pointer]:
                - /url: /accessibilidad/
            - listitem [ref=e253]:
              - link "Apoyar el proyecto" [ref=e254] [cursor=pointer]:
                - /url: /apoyar/?src=footer
      - generic [ref=e255]:
        - generic [ref=e256]:
          - link "Monedario en X" [ref=e257] [cursor=pointer]:
            - /url: https://x.com/monedario_cl
            - img [ref=e258]
            - generic [ref=e262]: Monedario en X
          - link "Monedario en LinkedIn" [ref=e263] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/monedario
            - img [ref=e264]
            - generic [ref=e268]: Monedario en LinkedIn
        - generic [ref=e269]:
          - text: Contenido © 2026 Monedario ·
          - generic [ref=e270]:
            - text: Desarrollado por
            - link "Tooltician" [ref=e271] [cursor=pointer]:
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