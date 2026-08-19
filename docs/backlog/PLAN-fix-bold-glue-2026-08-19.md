# PLAN: corregir negritas pegadas al texto adyacente en HTML renderizado (2026-08-19)

## Contexto

- Hallazgo reportado inicialmente en `/cookies/` (dist/cookies/index.html): "normalmente**no se transmite al servidor**" — el texto y la negrita se renderizan pegados.
- Causa raíz confirmada: el compilador de Astro elimina los nodos de texto whitespace-only entre elementos en líneas separadas (comportamiento tipo JSX). En la fuente, el espacio existe como salto de línea entre el texto y `<strong>`; en el HTML buildado se pierde. Los casos en la misma línea con espacio explícito renderizan correctamente.
- Alcance: únicamente la inserción del espacio faltante en el límite texto/negrita. No se reescribió contenido, puntuación, estilo, SEO, fechas editoriales, enlaces ni semántica.

## Cambios

- 9 archivos `.astro` corregidos (unir texto y `<strong>`/`</strong>` en la misma línea con espacio explícito):
  - `src/pages/cookies.astro` (4 casos): Última actualización; "Estos datos no se envían"; "normalmente no se transmite al servidor"; "en esta página, no utiliza".
  - `src/pages/privacidad.astro` (17 casos): Última actualización; responsable; "no se envían"; "monedario.cl"; "utiliza Cloudflare Web Analytics para medir"; "opera un endpoint propio"; "Qué se transmite: únicamente"; "identificadores: esta medición"; "Dónde se procesa: los eventos"; "Bloqueo provisional del tratamiento mientras"; "Alcance práctico de estos derechos: dado"; "ante la Agencia de Protección… una vez"; "dentro de las setenta y dos (72) horas siguientes"; "con un preaviso razonable mediante".
  - `src/pages/terminos.astro` (14 casos): "accesible en monedario.cl"; Última actualización; "editado por Carlos Ortega González"; "sitio de educación financiera"; "tiene carácter exclusivamente informativo…"; "bajo la Ley N° 21.521…"; "entregan estimaciones aproximadas construidas"; "por la Ley N° 17.336… y los tratados"; "el titular del sitio no otorga garantía…"; "reparación del daño directo…"; "dentro del menor plazo entre… y el plazo legal"; "El uso del sitio no crea…"; "se rigen por las leyes de la República de Chile".
  - `src/pages/accessibilidad.astro` (2 casos): "WCAG) 2.2 en su Nivel AA"; "10 días hábiles e implementar".
  - `src/pages/calculadoras/apv.astro` (2 casos): "¿Cuándo conviene el Régimen B? Solo"; "600 UF anuales en Régimen B".
  - `src/pages/como-usamos-los-datos.astro` (1 caso): "Banco Central / INE / SII publican".
  - `src/pages/leyes/index.astro` (1 caso): "Contenido educativo. Las fichas".
  - `src/pages/metodologia.astro` (1 caso): "El sitio mantiene independencia editorial".
  - `src/components/SupportCallout.astro` (1 caso): "Puedes ayudar compartiendo {pageTitle}" — única fuente de los glues "compartiendo<strong" en 6 páginas (calculadoras/deposito-a-plazo, interes-compuesto, sueldo-liquido; guias/impuestos-personas, guias/impuestos-personas/operacion-renta, guias/sueldo-remuneraciones).
- Prevención: nueva regla `bold-glue` (severity error, ASD-004) en `scripts/check-small-details.mjs` que escanea todos los `.astro` de `src/` y detecta texto pegado a `<strong>`/`</strong>` a través de saltos de línea (o pegado directo en la misma línea). Verificada con fixtures de regresión (open/close side) y sin falsos positivos en el repo (casos block-level y MDX `**` no son alcanzados por el regex).
- Casos revisados y NO corregidos: acróstico ARCO en `src/data/laws/ley-19628-proteccion-datos.md` (`**A**cceso`, `**R**ectificación`, `**C**ancelación`, `**O**posición`) — intencional; puntuación pegada tras cierre (`**texto**,`) — correcto por convención.

## Registro (NORMA §5.3)

- Qué: corrección de espacios perdidos entre texto y `<strong>` en 9 archivos `.astro` (42 puntos de edición; ~43 glues visibles en dist, de los cuales 4 son el acróstico ARCO intencional y quedan intactos). Causa raíz: Astro elimina whitespace entre elementos en líneas separadas. Solución: espacio explícito en la misma línea del límite texto/negrita.
- Por qué: el HTML buildado mostraba palabras pegadas ("normalmente**no se transmite al servidor**", "SII**publican**", "2.2**en su**", "horas**siguientes**", "entregan**estimaciones**", etc.), afectando legibilidad y calidad editorial visible.
- Fuentes: render local `pnpm run build` + escaneo de `dist/**/index.html` (ground truth); comportamiento del compilador Astro verificado con fixtures `/tmp/opencode/t1.astro`/`t2.astro`/`t3.astro`; prettier-plugin-astro confirma que no re-envuelve texto inline a través de límites de tag.
- Prevención: regla `bold-glue` en `check-small-details.mjs` (gate ya existente, `check:ci`). Escaneo completo de `src/**/*.astro`.

## Gates

| Gate | Resultado |
| --- | --- |
| `pnpm run build` | exit 0; postbuild 6/6; urlcheck internal_broken=0 |
| `pnpm run check:ci` | exit 0 (check-reader-facing-copy OK, small-details errors=0) |
| `pnpm run lint` | exit 0 |
| `pnpm run format:check` | exit 0 |
| `pnpm run check:docs` | OK. trackedMarkdown=709 |
| `check-editorial-timeliness` | stale=0, drift=0 |
| `check-editorial-artifacts` (EDITORIAL_ENFORCE=1, scope=all) | compliant 47/47 |
| Escaneo glues en dist | 4 coincidencias restantes = acróstico ARCO intencional |