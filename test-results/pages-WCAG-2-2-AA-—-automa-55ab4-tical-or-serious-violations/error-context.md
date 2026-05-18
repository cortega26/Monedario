# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pages.test.ts >> WCAG 2.2 AA — automated scan >> Calculator index should have no critical or serious violations
- Location: tests/accessibility/pages.test.ts:22:5

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 421

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e1efef",
+               "contrastRatio": 3.17,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#0d9488",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.17 (foreground color: #0d9488, background color: #e1efef, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-accent-2)]/30 bg-[color:var(--color-accent-2)]/10 text-[color:var(--color-accent-2)]\"> Contingencia </span>",
+                 "target": Array [
+                   "li:nth-child(3) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-accent-2\\)\\]\\/30.bg-\\[color\\:var\\(--color-accent-2\\)\\]\\/10.text-\\[color\\:var\\(--color-accent-2\\)\\]",
+                 ],
+               },
+               Object {
+                 "html": "<article class=\"rounded-xl border border-border bg-background p-5 transition-colors duration-150 hover:border-accent hover:bg-accent/5\">",
+                 "target": Array [
+                   "#familia-ingresos > .gap-5.lg\\:grid-cols-\\[minmax\\(0\\,280px\\)_minmax\\(0\\,1fr\\)\\].grid > .sm\\:grid-cols-2.gap-4.grid > li:nth-child(3) > article",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.17 (foreground color: #0d9488, background color: #e1efef, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-accent-2)]/30 bg-[color:var(--color-accent-2)]/10 text-[color:var(--color-accent-2)]\"> Contingencia </span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "li:nth-child(3) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-accent-2\\)\\]\\/30.bg-\\[color\\:var\\(--color-accent-2\\)\\]\\/10.text-\\[color\\:var\\(--color-accent-2\\)\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e1efef",
+               "contrastRatio": 3.17,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#0d9488",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.17 (foreground color: #0d9488, background color: #e1efef, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-accent-2)]/30 bg-[color:var(--color-accent-2)]/10 text-[color:var(--color-accent-2)]\"> Contingencia </span>",
+                 "target": Array [
+                   "li:nth-child(4) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-accent-2\\)\\]\\/30.bg-\\[color\\:var\\(--color-accent-2\\)\\]\\/10.text-\\[color\\:var\\(--color-accent-2\\)\\]",
+                 ],
+               },
+               Object {
+                 "html": "<article class=\"rounded-xl border border-border bg-background p-5 transition-colors duration-150 hover:border-accent hover:bg-accent/5\">",
+                 "target": Array [
+                   "#familia-ingresos > .gap-5.lg\\:grid-cols-\\[minmax\\(0\\,280px\\)_minmax\\(0\\,1fr\\)\\].grid > .sm\\:grid-cols-2.gap-4.grid > li:nth-child(4) > article",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.17 (foreground color: #0d9488, background color: #e1efef, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-accent-2)]/30 bg-[color:var(--color-accent-2)]/10 text-[color:var(--color-accent-2)]\"> Contingencia </span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "li:nth-child(4) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-accent-2\\)\\]\\/30.bg-\\[color\\:var\\(--color-accent-2\\)\\]\\/10.text-\\[color\\:var\\(--color-accent-2\\)\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e1efef",
+               "contrastRatio": 3.17,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#0d9488",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.17 (foreground color: #0d9488, background color: #e1efef, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-accent-2)]/30 bg-[color:var(--color-accent-2)]/10 text-[color:var(--color-accent-2)]\"> Contingencia </span>",
+                 "target": Array [
+                   "li:nth-child(6) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-accent-2\\)\\]\\/30.bg-\\[color\\:var\\(--color-accent-2\\)\\]\\/10.text-\\[color\\:var\\(--color-accent-2\\)\\]",
+                 ],
+               },
+               Object {
+                 "html": "<article class=\"rounded-xl border border-border bg-background p-5 transition-colors duration-150 hover:border-accent hover:bg-accent/5\">",
+                 "target": Array [
+                   "li:nth-child(6) > article",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.17 (foreground color: #0d9488, background color: #e1efef, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-accent-2)]/30 bg-[color:var(--color-accent-2)]/10 text-[color:var(--color-accent-2)]\"> Contingencia </span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "li:nth-child(6) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-accent-2\\)\\]\\/30.bg-\\[color\\:var\\(--color-accent-2\\)\\]\\/10.text-\\[color\\:var\\(--color-accent-2\\)\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#e1efef",
+               "contrastRatio": 3.17,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#0d9488",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.17 (foreground color: #0d9488, background color: #e1efef, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-accent-2)]/30 bg-[color:var(--color-accent-2)]/10 text-[color:var(--color-accent-2)]\"> Decisión APV </span>",
+                 "target": Array [
+                   "li:nth-child(1) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-accent-2\\)\\]\\/30.bg-\\[color\\:var\\(--color-accent-2\\)\\]\\/10.text-\\[color\\:var\\(--color-accent-2\\)\\]",
+                 ],
+               },
+               Object {
+                 "html": "<article class=\"rounded-xl border border-border bg-background p-5 transition-colors duration-150 hover:border-accent hover:bg-accent/5\">",
+                 "target": Array [
+                   "#familia-ahorro-prevision > .gap-5.lg\\:grid-cols-\\[minmax\\(0\\,280px\\)_minmax\\(0\\,1fr\\)\\].grid > .sm\\:grid-cols-2.gap-4.grid > li:nth-child(1) > article",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.17 (foreground color: #0d9488, background color: #e1efef, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-accent-2)]/30 bg-[color:var(--color-accent-2)]/10 text-[color:var(--color-accent-2)]\"> Decisión APV </span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "li:nth-child(1) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-accent-2\\)\\]\\/30.bg-\\[color\\:var\\(--color-accent-2\\)\\]\\/10.text-\\[color\\:var\\(--color-accent-2\\)\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f5ece2",
+               "contrastRatio": 2.72,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#d97706",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.72 (foreground color: #d97706, background color: #f5ece2, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-highlight)]/30 bg-[color:var(--color-highlight)]/10 text-[color:var(--color-highlight)]\"> Oferta nueva </span>",
+                 "target": Array [
+                   "li:nth-child(1) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-highlight\\)\\]\\/30.bg-\\[color\\:var\\(--color-highlight\\)\\]\\/10.text-\\[color\\:var\\(--color-highlight\\)\\]",
+                 ],
+               },
+               Object {
+                 "html": "<article class=\"rounded-xl border border-border bg-background p-5 transition-colors duration-150 hover:border-accent hover:bg-accent/5\">",
+                 "target": Array [
+                   "#familia-deuda-credito > .gap-5.lg\\:grid-cols-\\[minmax\\(0\\,280px\\)_minmax\\(0\\,1fr\\)\\].grid > .sm\\:grid-cols-2.gap-4.grid > li:nth-child(1) > article",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.72 (foreground color: #d97706, background color: #f5ece2, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-highlight)]/30 bg-[color:var(--color-highlight)]/10 text-[color:var(--color-highlight)]\"> Oferta nueva </span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "li:nth-child(1) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-highlight\\)\\]\\/30.bg-\\[color\\:var\\(--color-highlight\\)\\]\\/10.text-\\[color\\:var\\(--color-highlight\\)\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f5ece2",
+               "contrastRatio": 2.72,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#d97706",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.72 (foreground color: #d97706, background color: #f5ece2, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-highlight)]/30 bg-[color:var(--color-highlight)]/10 text-[color:var(--color-highlight)]\"> Deuda usada </span>",
+                 "target": Array [
+                   "li:nth-child(2) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-highlight\\)\\]\\/30.bg-\\[color\\:var\\(--color-highlight\\)\\]\\/10.text-\\[color\\:var\\(--color-highlight\\)\\]",
+                 ],
+               },
+               Object {
+                 "html": "<article class=\"rounded-xl border border-border bg-background p-5 transition-colors duration-150 hover:border-accent hover:bg-accent/5\">",
+                 "target": Array [
+                   "#familia-deuda-credito > .gap-5.lg\\:grid-cols-\\[minmax\\(0\\,280px\\)_minmax\\(0\\,1fr\\)\\].grid > .sm\\:grid-cols-2.gap-4.grid > li:nth-child(2) > article",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.72 (foreground color: #d97706, background color: #f5ece2, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-highlight)]/30 bg-[color:var(--color-highlight)]/10 text-[color:var(--color-highlight)]\"> Deuda usada </span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "li:nth-child(2) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-highlight\\)\\]\\/30.bg-\\[color\\:var\\(--color-highlight\\)\\]\\/10.text-\\[color\\:var\\(--color-highlight\\)\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f5ece2",
+               "contrastRatio": 2.72,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#d97706",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.72 (foreground color: #d97706, background color: #f5ece2, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-highlight)]/30 bg-[color:var(--color-highlight)]/10 text-[color:var(--color-highlight)]\"> Abono extra </span>",
+                 "target": Array [
+                   "li:nth-child(3) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-highlight\\)\\]\\/30.bg-\\[color\\:var\\(--color-highlight\\)\\]\\/10.text-\\[color\\:var\\(--color-highlight\\)\\]",
+                 ],
+               },
+               Object {
+                 "html": "<article class=\"rounded-xl border border-border bg-background p-5 transition-colors duration-150 hover:border-accent hover:bg-accent/5\">",
+                 "target": Array [
+                   "#familia-deuda-credito > .gap-5.lg\\:grid-cols-\\[minmax\\(0\\,280px\\)_minmax\\(0\\,1fr\\)\\].grid > .sm\\:grid-cols-2.gap-4.grid > li:nth-child(3) > article",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.72 (foreground color: #d97706, background color: #f5ece2, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-highlight)]/30 bg-[color:var(--color-highlight)]/10 text-[color:var(--color-highlight)]\"> Abono extra </span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "li:nth-child(3) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-highlight\\)\\]\\/30.bg-\\[color\\:var\\(--color-highlight\\)\\]\\/10.text-\\[color\\:var\\(--color-highlight\\)\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#f5ece2",
+               "contrastRatio": 2.72,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#d97706",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.72 (foreground color: #d97706, background color: #f5ece2, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-highlight)]/30 bg-[color:var(--color-highlight)]/10 text-[color:var(--color-highlight)]\"> Salida formal </span>",
+                 "target": Array [
+                   "li:nth-child(4) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-highlight\\)\\]\\/30.bg-\\[color\\:var\\(--color-highlight\\)\\]\\/10.text-\\[color\\:var\\(--color-highlight\\)\\]",
+                 ],
+               },
+               Object {
+                 "html": "<article class=\"rounded-xl border border-border bg-background p-5 transition-colors duration-150 hover:border-accent hover:bg-accent/5\">",
+                 "target": Array [
+                   "#familia-deuda-credito > .gap-5.lg\\:grid-cols-\\[minmax\\(0\\,280px\\)_minmax\\(0\\,1fr\\)\\].grid > .sm\\:grid-cols-2.gap-4.grid > li:nth-child(4) > article",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.72 (foreground color: #d97706, background color: #f5ece2, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"rounded-md border px-2 py-0.5 text-xs font-semibold border-[color:var(--color-highlight)]/30 bg-[color:var(--color-highlight)]/10 text-[color:var(--color-highlight)]\"> Salida formal </span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "li:nth-child(4) > article > .items-start.gap-3.justify-between > .border-\\[color\\:var\\(--color-highlight\\)\\]\\/30.bg-\\[color\\:var\\(--color-highlight\\)\\]\\/10.text-\\[color\\:var\\(--color-highlight\\)\\]",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
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
      - listitem [ref=e43]: Calculadoras
  - main [ref=e44]:
    - generic [ref=e45]:
      - heading "Calculadoras financieras para decisiones concretas" [level=1] [ref=e46]
      - paragraph [ref=e47]: "19 calculadoras organizadas en 4 grupos: ingresos, previsión, deuda y UF. Sin registro, sin datos personales."
    - generic [ref=e49]:
      - generic [ref=e50]:
        - heading "Ir directo a una familia" [level=2] [ref=e51]
        - paragraph [ref=e52]: Este hub ya es un índice de calculadoras. Elige la familia y entra directo al bloque que corresponde.
      - list [ref=e53]:
        - listitem [ref=e54]:
          - link "Ingresos y protección laboral Ver familia" [ref=e55] [cursor=pointer]:
            - /url: "#familia-ingresos"
            - generic [ref=e56]: Ingresos y protección laboral
            - generic [ref=e57]: Ver familia
        - listitem [ref=e58]:
          - link "Ahorro y previsión Ver familia" [ref=e59] [cursor=pointer]:
            - /url: "#familia-ahorro-prevision"
            - generic [ref=e60]: Ahorro y previsión
            - generic [ref=e61]: Ver familia
        - listitem [ref=e62]:
          - link "Deuda y crédito Ver familia" [ref=e63] [cursor=pointer]:
            - /url: "#familia-deuda-credito"
            - generic [ref=e64]: Deuda y crédito
            - generic [ref=e65]: Ver familia
        - listitem [ref=e66]:
          - link "Vivienda, UF y reajustes Ver familia" [ref=e67] [cursor=pointer]:
            - /url: "#familia-vivienda-uf"
            - generic [ref=e68]: Vivienda, UF y reajustes
            - generic [ref=e69]: Ver familia
    - generic [ref=e70]:
      - generic [ref=e72]:
        - generic [ref=e73]:
          - heading "Ingresos y protección laboral" [level=2] [ref=e74]
          - paragraph [ref=e75]: "Para decisiones del mes: cuánto entra a tu cuenta, cuánto cubre el seguro de cesantía y qué pasa si se corta el ingreso laboral."
          - paragraph [ref=e76]: Úsala cuando tu pregunta nace en la liquidación de sueldo o en una contingencia laboral concreta.
        - list [ref=e77]:
          - listitem [ref=e78]:
            - article [ref=e79]:
              - generic [ref=e80]:
                - img [ref=e81]
                - generic [ref=e85]: Más usada
              - heading "Calculadora de Sueldo Líquido" [level=3] [ref=e86]
              - paragraph [ref=e87]: Calcula tu líquido mensual con AFP, salud e impuesto único, y revisa el desglose de descuentos.
              - generic [ref=e88]:
                - paragraph [ref=e89]: "Sirve para: Saber cuánto llega a tu cuenta este mes."
                - paragraph [ref=e90]: "Úsala si: Cuando estás comparando bruto vs líquido, revisando una oferta o chequeando tu liquidación."
                - paragraph [ref=e91]: "No es para: No sirve para proyectar cesantía ni para decidir un APV de largo plazo."
              - link "Abrir calculadora" [ref=e93] [cursor=pointer]:
                - /url: /calculadoras/sueldo-liquido/
          - listitem [ref=e94]:
            - article [ref=e95]:
              - generic [ref=e96]:
                - img [ref=e97]
                - generic [ref=e101]: Más usada
              - heading "Boleta de Honorarios 2026" [level=3] [ref=e102]
              - paragraph [ref=e103]: Calcula líquido por boleta, retención vigente y base anual de cobertura orientativa sin mezclarlo con la declaración completa.
              - generic [ref=e104]:
                - paragraph [ref=e105]: "Sirve para: Saber cuánto recibes hoy por una boleta y cómo se proyecta esa retención en el año."
                - paragraph [ref=e106]: "Úsala si: Cuando emites honorarios y tu duda es líquido vs retención, no sueldo dependiente."
                - paragraph [ref=e107]: "No es para: No reemplaza la revisión de Operación Renta ni resuelve por sí sola exenciones legales."
              - link "Abrir calculadora" [ref=e109] [cursor=pointer]:
                - /url: /calculadoras/boleta-honorarios-liquido/
          - listitem [ref=e110]:
            - article [ref=e111]:
              - generic [ref=e112]:
                - img [ref=e113]
                - generic [ref=e117]: Contingencia
              - heading "Simulador Operación Renta 2026" [level=3] [ref=e118]
              - paragraph [ref=e119]: "Estima si el SII te devuelve o debes pagar más: consolida sueldos, honorarios y arriendos, descuenta retenciones y APV, y ve el resultado antes de enviar el F22."
              - generic [ref=e120]:
                - paragraph [ref=e121]: "Sirve para: Saber si habrá devolución o pago adicional antes de enviar el F22."
                - paragraph [ref=e122]: "Úsala si: Cuando tienes más de una fuente de ingreso o retenciones del año y quieres estimar el resultado antes de abrir la propuesta del SII."
                - paragraph [ref=e123]: "No es para: No reemplaza la propuesta oficial del SII ni cubre dividendos, crédito de primera categoría ni dos empleadores simultáneos con situación compleja."
              - link "Abrir calculadora" [ref=e125] [cursor=pointer]:
                - /url: /calculadoras/operacion-renta/
          - listitem [ref=e126]:
            - article [ref=e127]:
              - generic [ref=e128]:
                - img [ref=e129]
                - generic [ref=e133]: Contingencia
              - heading "Finiquito e Indemnización" [level=3] [ref=e134]
              - paragraph [ref=e135]: Estima años de servicio, aviso previo y feriado proporcional para revisar una salida laboral antes de firmar.
              - generic [ref=e136]:
                - paragraph [ref=e137]: "Sirve para: Revisar si un finiquito parece razonable antes de aceptar el monto sin revisar."
                - paragraph [ref=e138]: "Úsala si: Cuando el problema ya es el término del contrato y necesitas separar cada ítem del pago final."
                - paragraph [ref=e139]: "No es para: No reemplaza asesoría laboral ni casos con discusión judicial, recargos o variables complejas."
              - link "Abrir calculadora" [ref=e141] [cursor=pointer]:
                - /url: /calculadoras/finiquito-indemnizacion/
          - listitem [ref=e142]:
            - article [ref=e143]:
              - generic [ref=e144]:
                - img [ref=e145]
                - generic [ref=e150]: Más usada
              - heading "Calculadora Impuesto Segunda Categoría" [level=3] [ref=e151]
              - paragraph [ref=e152]: Calcula cuánto pagas de impuesto único al trabajo según tu sueldo imponible mensual y en qué tramo de la tabla SII quedas.
              - generic [ref=e153]:
                - paragraph [ref=e154]: "Sirve para: Saber si pagas impuesto de segunda categoría y cuánto."
                - paragraph [ref=e155]: "Úsala si: Cuando quieres revisar el impuesto de forma aislada, entender en qué tramo tributas o verificar la retención mensual."
                - paragraph [ref=e156]: "No es para: No reemplaza el cálculo completo de sueldo líquido con AFP, salud y cesantía."
              - link "Abrir calculadora" [ref=e158] [cursor=pointer]:
                - /url: /calculadoras/impuesto-segunda-categoria/
          - listitem [ref=e159]:
            - article [ref=e160]:
              - generic [ref=e161]:
                - img [ref=e162]
                - generic [ref=e166]: Contingencia
              - heading "Seguro de Cesantía" [level=3] [ref=e167]
              - paragraph [ref=e168]: Estima saldo CIC, acceso al fondo solidario y cobertura mensual según contrato, causal y cotizaciones.
              - generic [ref=e169]:
                - paragraph [ref=e170]: "Sirve para: Estimar cuánto colchón laboral tienes si se corta el ingreso."
                - paragraph [ref=e171]: "Úsala si: Cuando perdiste la pega, estás evaluando tu riesgo o quieres revisar si cumples mínimos AFC."
                - paragraph [ref=e172]: "No es para: No reemplaza el cálculo de sueldo líquido ni una simulación de pensión."
              - link "Abrir calculadora" [ref=e174] [cursor=pointer]:
                - /url: /calculadoras/seguro-cesantia/
          - listitem [ref=e175]:
            - article [ref=e176]:
              - generic [ref=e177]:
                - img [ref=e178]
                - generic [ref=e182]: Referencia
              - heading "Conversor UTM ↔ Pesos" [level=3] [ref=e183]
              - paragraph [ref=e184]: Convierte entre UTM y pesos al valor vigente del mes con una referencia rápida de multas, impuestos y trámites.
              - generic [ref=e185]:
                - paragraph [ref=e186]: "Sirve para: Traducir un monto expresado en UTM a pesos o viceversa sin añadir reglas tributarias."
                - paragraph [ref=e187]: "Úsala si: Cuando solo necesitas equivalencia actual entre UTM y CLP para revisar una multa, impuesto o trámite."
                - paragraph [ref=e188]: "No es para: No calcula impuestos por tramos progresivos ni modela la tabla del SII."
              - link "Abrir calculadora" [ref=e190] [cursor=pointer]:
                - /url: /calculadoras/conversor-utm/
      - generic [ref=e192]:
        - generic [ref=e193]:
          - heading "Ahorro y previsión" [level=2] [ref=e194]
          - paragraph [ref=e195]: Para decidir entre beneficio tributario hoy y saldo previsional de largo plazo, sin mezclar ambas preguntas en una sola herramienta.
          - paragraph [ref=e196]: Parte aquí si la decisión es APV o pensión futura, no si buscas cuánto ganas este mes.
        - list [ref=e197]:
          - listitem [ref=e198]:
            - article [ref=e199]:
              - generic [ref=e200]:
                - img [ref=e201]
                - generic [ref=e205]: Decisión APV
              - heading "Simulador APV" [level=3] [ref=e206]
              - paragraph [ref=e207]: Compara Régimen A y B con foco en ahorro tributario, renta imponible y beneficio mensual estimado.
              - generic [ref=e208]:
                - paragraph [ref=e209]: "Sirve para: Elegir cómo aportar al APV según el beneficio tributario que realmente puedes capturar hoy."
                - paragraph [ref=e210]: "Úsala si: Cuando ya decidiste evaluar APV y necesitas comparar régimen A, B o una mezcla."
                - paragraph [ref=e211]: "No es para: No sirve para proyectar pensión total ni reemplaza un plan previsional completo."
              - link "Abrir calculadora" [ref=e213] [cursor=pointer]:
                - /url: /calculadoras/apv/
          - listitem [ref=e214]:
            - article [ref=e215]:
              - generic [ref=e216]:
                - img [ref=e217]
                - generic [ref=e220]: Referencia
              - heading "Comparador de Comisiones AFP" [level=3] [ref=e221]
              - paragraph [ref=e222]: Compara la comisión de cada AFP con tu sueldo imponible y ve cuánto ahorrarías al año eligiendo la más barata.
              - generic [ref=e223]:
                - paragraph [ref=e224]: "Sirve para: Elegir AFP comparando el costo real de comisión mensual sobre tu sueldo."
                - paragraph [ref=e225]: "Úsala si: Cuando evalúas cambiarte de AFP y quieres ver el impacto en pesos sobre tu liquidación."
                - paragraph [ref=e226]: "No es para: No modela rentabilidad de fondos ni proyecta pensión futura — solo compara el costo de comisión."
              - link "Abrir calculadora" [ref=e228] [cursor=pointer]:
                - /url: /calculadoras/comisiones-afp/
          - listitem [ref=e229]:
            - article [ref=e230]:
              - generic [ref=e231]:
                - img [ref=e232]
                - generic [ref=e236]: Largo plazo
              - heading "Simulador de Jubilación" [level=3] [ref=e237]
              - paragraph [ref=e238]: Proyecta saldo AFP y pensión estimada considerando edad, ahorro actual, rentabilidad y cronograma previsional.
              - generic [ref=e239]:
                - paragraph [ref=e240]: "Sirve para: Traducir tu ahorro previsional a un escenario de pensión futura."
                - paragraph [ref=e241]: "Úsala si: Cuando quieres mirar saldo final, edad de retiro o sensibilidad a tus aportes."
                - paragraph [ref=e242]: "No es para: No es la herramienta correcta para comparar el beneficio tributario inmediato del APV."
              - link "Abrir calculadora" [ref=e244] [cursor=pointer]:
                - /url: /calculadoras/simulador-jubilacion/
          - listitem [ref=e245]:
            - article [ref=e246]:
              - generic [ref=e247]:
                - img [ref=e248]
                - generic [ref=e252]: Simulador
              - heading "Calculadora de Interés Compuesto" [level=3] [ref=e253]
              - paragraph [ref=e254]: "Simula cuánto crece tu capital con interés compuesto: monto final, interés generado y evolución año a año según tasa y frecuencia de capitalización."
              - generic [ref=e255]:
                - paragraph [ref=e256]: "Sirve para: Ver cuánto crece un capital en el tiempo con una tasa y frecuencia de capitalización dadas."
                - paragraph [ref=e257]: "Úsala si: Cuando quieres proyectar un ahorro o inversión genérica y entender el efecto del tiempo y la capitalización."
                - paragraph [ref=e258]: "No es para: No modela AFP ni APV específico — usa el simulador de jubilación para proyección previsional."
              - link "Abrir calculadora" [ref=e260] [cursor=pointer]:
                - /url: /calculadoras/interes-compuesto/
          - listitem [ref=e261]:
            - article [ref=e262]:
              - generic [ref=e263]:
                - img [ref=e264]
                - generic [ref=e267]: Ahorro
              - heading "Calculadora Depósito a Plazo" [level=3] [ref=e268]
              - paragraph [ref=e269]: Calcula interés bruto, retención de impuesto (4%) e interés neto de tu DAP. Ingresa monto, plazo en días y tasa TIR.
              - generic [ref=e270]:
                - paragraph [ref=e271]: "Sirve para: Saber cuánto ganas neto en un DAP, después de impuesto, con tu monto y plazo."
                - paragraph [ref=e272]: "Úsala si: Cuando tienes o evalúas un depósito a plazo y quieres el rendimiento real después de retención."
                - paragraph [ref=e273]: "No es para: No compara DAPs entre bancos ni cubre instrumentos en UF o dólares — solo pesos y tasa TIR."
              - link "Abrir calculadora" [ref=e275] [cursor=pointer]:
                - /url: /calculadoras/deposito-a-plazo/
      - generic [ref=e277]:
        - generic [ref=e278]:
          - heading "Deuda y crédito" [level=2] [ref=e279]
          - paragraph [ref=e280]: "Separa cuatro momentos distintos: cotizar un crédito nuevo, medir una deuda ya usada, evaluar un prepago o revisar una salida formal."
          - paragraph [ref=e281]: La frontera clave es si la deuda todavía no existe, ya existe pero puedes seguir pagándola, o ya no puedes sostenerla.
        - list [ref=e282]:
          - listitem [ref=e283]:
            - article [ref=e284]:
              - generic [ref=e285]:
                - img [ref=e286]
                - generic [ref=e289]: Oferta nueva
              - heading "Calculadora de Crédito de Consumo" [level=3] [ref=e290]
              - paragraph [ref=e291]: Evalúa una oferta nueva con cuota, interés total, CAE y costos adicionales antes de firmar.
              - generic [ref=e292]:
                - paragraph [ref=e293]: "Sirve para: Comparar ofertas antes de tomar una deuda nueva."
                - paragraph [ref=e294]: "Úsala si: Cuando el crédito todavía no existe y necesitas decidir si firmar o no."
                - paragraph [ref=e295]: "No es para: No modela deudas ya cursadas, pagos mínimos de tarjeta ni escenarios de prepago."
              - link "Abrir calculadora" [ref=e297] [cursor=pointer]:
                - /url: /calculadoras/credito-consumo/
          - listitem [ref=e298]:
            - article [ref=e299]:
              - generic [ref=e300]:
                - img [ref=e301]
                - generic [ref=e304]: Deuda usada
              - heading "Costo Real Tarjeta de Crédito" [level=3] [ref=e305]
              - paragraph [ref=e306]: Mide cuánto cuesta pagar el mínimo o una cuota fija sobre una deuda ya usada en tu tarjeta.
              - generic [ref=e307]:
                - paragraph [ref=e308]: "Sirve para: Entender cuánto te cuesta sostener una deuda rotativa que ya existe."
                - paragraph [ref=e309]: "Úsala si: Cuando el consumo ya ocurrió y necesitas ver meses, intereses y costo total del pago mínimo."
                - paragraph [ref=e310]: "No es para: No compara créditos nuevos ni reemplaza una renegociación formal."
              - link "Abrir calculadora" [ref=e312] [cursor=pointer]:
                - /url: /calculadoras/tarjeta-credito/
          - listitem [ref=e313]:
            - article [ref=e314]:
              - generic [ref=e315]:
                - img [ref=e316]
                - generic [ref=e320]: Abono extra
              - heading "¿Conviene prepagar el crédito?" [level=3] [ref=e321]
              - paragraph [ref=e322]: Calcula cuánto ahorras en intereses al hacer un abono extraordinario a tu crédito hipotecario o de consumo.
              - generic [ref=e323]:
                - paragraph [ref=e324]: "Sirve para: Decidir si un monto extraordinario conviene más como prepago o como otra reserva."
                - paragraph [ref=e325]: "Úsala si: Cuando el crédito ya existe y tienes caja disponible para hacer un abono."
                - paragraph [ref=e326]: "No es para: No sirve para cotizar un préstamo desde cero ni para estimar una salida por insolvencia."
              - link "Abrir calculadora" [ref=e328] [cursor=pointer]:
                - /url: /calculadoras/prepago-credito/
          - listitem [ref=e329]:
            - article [ref=e330]:
              - generic [ref=e331]:
                - img [ref=e332]
                - generic [ref=e337]: Salida formal
              - heading "Simulador Renegociación Superir" [level=3] [ref=e338]
              - paragraph [ref=e339]: Revisa si calificas para la renegociación gratuita y estima una cuota bajo ese camino formal.
              - generic [ref=e340]:
                - paragraph [ref=e341]: "Sirve para: Saber si todavía estás en modo optimización o ya necesitas una salida formal de deudas."
                - paragraph [ref=e342]: "Úsala si: Cuando tus deudas te superan y necesitas revisar elegibilidad para renegociar."
                - paragraph [ref=e343]: "No es para: No reemplaza una comparación de crédito nuevo ni un cálculo de pago mínimo."
              - link "Abrir calculadora" [ref=e345] [cursor=pointer]:
                - /url: /calculadoras/simulador-renegociacion/
      - generic [ref=e347]:
        - generic [ref=e348]:
          - heading "Vivienda, UF y reajustes" [level=2] [ref=e349]
          - paragraph [ref=e350]: Para convertir montos, revisar cláusulas en UF o IPC y calcular cuánto cambia un arriendo sin mezclarlo con decisiones de deuda.
          - paragraph [ref=e351]: Úsala si tu duda viene de una cláusula de contrato o de un monto indexado, no de una cuota crediticia.
        - list [ref=e352]:
          - listitem [ref=e353]:
            - article [ref=e354]:
              - generic [ref=e355]:
                - img [ref=e356]
                - generic [ref=e360]: Referencia
              - heading "Conversor UF ↔ Pesos" [level=3] [ref=e361]
              - paragraph [ref=e362]: Convierte entre UF y pesos al valor oficial del día con una referencia simple para cotizaciones y contratos.
              - generic [ref=e363]:
                - paragraph [ref=e364]: "Sirve para: Traducir un monto indexado a UF o pesos sin agregar reglas contractuales extra."
                - paragraph [ref=e365]: "Úsala si: Cuando solo necesitas equivalencia actual entre UF y CLP."
                - paragraph [ref=e366]: "No es para: No calcula reajustes ni interpreta cláusulas de arriendo."
              - link "Abrir calculadora" [ref=e368] [cursor=pointer]:
                - /url: /calculadoras/conversor-uf/
          - listitem [ref=e369]:
            - article [ref=e370]:
              - generic [ref=e371]:
                - img [ref=e372]
                - generic [ref=e377]: Contrato
              - heading "Reajuste de Arriendo" [level=3] [ref=e378]
              - paragraph [ref=e379]: Calcula cuánto sube un arriendo según UF, IPC o pesos fijos y revisa la lógica de la cláusula.
              - generic [ref=e380]:
                - paragraph [ref=e381]: "Sirve para: Recalcular un arriendo con la regla exacta que aparece en el contrato."
                - paragraph [ref=e382]: "Úsala si: Cuando tienes una cláusula de reajuste y quieres aterrizarla a un nuevo monto."
                - paragraph [ref=e383]: "No es para: No reemplaza un conversor simple si solo buscas equivalencia UF a pesos."
              - link "Abrir calculadora" [ref=e385] [cursor=pointer]:
                - /url: /calculadoras/reajuste-arriendo/
          - listitem [ref=e386]:
            - article [ref=e387]:
              - generic [ref=e388]:
                - img [ref=e389]
                - generic [ref=e394]: Crédito hipotecario
              - heading "Calculadora de Dividendo Hipotecario" [level=3] [ref=e395]
              - paragraph [ref=e396]: Estima tu dividendo mensual en UF y pesos según el valor de la propiedad, el pie, la tasa y el plazo. Incluye seguros opcionales y tabla de amortización.
              - generic [ref=e397]:
                - paragraph [ref=e398]: "Sirve para: Saber cuánto pagarás de dividendo mensual antes de tomar un crédito hipotecario."
                - paragraph [ref=e399]: "Úsala si: Cuando estás evaluando la compra de una vivienda y necesitas estimar la cuota mensual en UF y pesos."
                - paragraph [ref=e400]: "No es para: No reemplaza la oferta formal del banco ni cubre seguros obligatorios con detalle legal."
              - link "Abrir calculadora" [ref=e402] [cursor=pointer]:
                - /url: /calculadoras/dividendo-hipotecario/
  - contentinfo [ref=e403]:
    - generic [ref=e404]:
      - generic [ref=e405]:
        - navigation "Explora por tema" [ref=e406]:
          - heading "Explora por tema" [level=2] [ref=e407]
          - list [ref=e408]:
            - listitem [ref=e409]:
              - link "Sueldo" [ref=e410] [cursor=pointer]:
                - /url: /guias/sueldo-remuneraciones/
            - listitem [ref=e411]:
              - link "Deuda" [ref=e412] [cursor=pointer]:
                - /url: /guias/deuda-credito/
            - listitem [ref=e413]:
              - link "AFP" [ref=e414] [cursor=pointer]:
                - /url: /guias/pensiones-afp/
            - listitem [ref=e415]:
              - link "Impuestos" [ref=e416] [cursor=pointer]:
                - /url: /guias/impuestos-personas/
            - listitem [ref=e417]:
              - link "UF" [ref=e418] [cursor=pointer]:
                - /url: /guias/uf-costo-de-vida/
        - navigation "Herramientas" [ref=e419]:
          - heading "Herramientas" [level=2] [ref=e420]
          - list [ref=e421]:
            - listitem [ref=e422]:
              - link "Sueldo líquido" [ref=e423] [cursor=pointer]:
                - /url: /calculadoras/sueldo-liquido/
            - listitem [ref=e424]:
              - link "Finiquito" [ref=e425] [cursor=pointer]:
                - /url: /calculadoras/finiquito-indemnizacion/
            - listitem [ref=e426]:
              - link "Crédito" [ref=e427] [cursor=pointer]:
                - /url: /calculadoras/credito-consumo/
            - listitem [ref=e428]:
              - link "APV" [ref=e429] [cursor=pointer]:
                - /url: /calculadoras/apv/
            - listitem [ref=e430]:
              - link "Todas" [ref=e431] [cursor=pointer]:
                - /url: /calculadoras/
        - navigation "Confianza" [ref=e432]:
          - heading "Confianza" [level=2] [ref=e433]
          - list [ref=e434]:
            - listitem [ref=e435]:
              - link "Proceso editorial" [ref=e436] [cursor=pointer]:
                - /url: /about/
            - listitem [ref=e437]:
              - link "Glosario" [ref=e438] [cursor=pointer]:
                - /url: /glosario/
            - listitem [ref=e439]:
              - link "Leyes" [ref=e440] [cursor=pointer]:
                - /url: /leyes/
            - listitem [ref=e441]:
              - link "Novedades" [ref=e442] [cursor=pointer]:
                - /url: /cambios/
            - listitem [ref=e443]:
              - link "Contacto" [ref=e444] [cursor=pointer]:
                - /url: /contacto/
            - listitem [ref=e445]:
              - link "Accesibilidad" [ref=e446] [cursor=pointer]:
                - /url: /accessibilidad/
            - listitem [ref=e447]:
              - link "Apoyar el proyecto" [ref=e448] [cursor=pointer]:
                - /url: /apoyar/?src=footer
      - generic [ref=e449]:
        - generic [ref=e450]:
          - link "Monedario en X" [ref=e451] [cursor=pointer]:
            - /url: https://x.com/monedario_cl
            - img [ref=e452]
            - generic [ref=e456]: Monedario en X
          - link "Monedario en LinkedIn" [ref=e457] [cursor=pointer]:
            - /url: https://www.linkedin.com/company/monedario
            - img [ref=e458]
            - generic [ref=e462]: Monedario en LinkedIn
        - generic [ref=e463]:
          - text: Contenido © 2026 Monedario ·
          - generic [ref=e464]:
            - text: Desarrollado por
            - link "Tooltician" [ref=e465] [cursor=pointer]:
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