# Plan 026: Agregar un índice temático del glosario junto al alfabético

> **Instrucciones para el ejecutor**: sigue este plan paso a paso. Ejecuta cada
> comando de verificación y confirma el resultado esperado antes de avanzar. Si
> ocurre algo de "Condiciones de STOP", detente e informa — no improvises. Al
> terminar, actualiza la fila de estado en `plans/README.md`.
>
> **Chequeo de deriva (córrelo primero)**:
> `git diff --stat fd2b5dff..HEAD -- src/pages/glosario/ src/data/glossary/ src/config/`
> Si `src/pages/glosario/index.astro` o los datos del glosario cambiaron desde que
> se escribió este plan, reléelos antes de continuar.

## Estado

- **Ejecución**: DONE en `47ce4221`; gates revisados: test dirigido 3/3, Astro
  0 diagnósticos, suite 776/776. Integración y archivo incluidos en la misma PR.
- **Prioridad**: P3
- **Esfuerzo**: M
- **Riesgo**: LOW
- **Depende de**: ninguno
- **Categoría**: direction (infraestructura de contenido)
- **Planificado en**: commit `fd2b5dff`, 2026-06-17

## Por qué importa

La auditoría precisa (`docs/latest_audits/deep-research-report (8).md`) recomienda
que el glosario exponga **un índice temático además del alfabético**: cada clúster
(impuestos, deuda, previsión, …) gana un pequeño "vocabulario" enlazable que
fortalece el SEO temático y reduce el rebote cuando un usuario no entiende un
término a mitad de un trámite. El glosario ya tiene 53 entradas buenas y
específicas de Chile; este plan agrega una vista por tema **sin reescribir
ninguna definición** y **sin tocar los 53 archivos de contenido** — la asignación
de tema vive en un único config de mapeo, fácil de revisar y ajustar, y el schema
de contenido queda sin cambios.

Esto es *infraestructura* de contenido, no afirmaciones YMYL nuevas: archiva
términos existentes en categorías y renderiza un segundo índice. Las asignaciones
de abajo son un primer pase revisable (archivado de bajo riesgo); un humano puede
reajustarlas en un solo archivo.

## Estado actual

- Entradas del glosario: `src/data/glossary/<slug>.md` (53 archivos). Frontmatter:
  `term`, `shortDefinition`, `relatedTerms` (slugs). Schema:
  `src/content.config.ts:303-308` (colección `glossary`). **No** hay campo de
  categoría, y este plan no lo agrega.
- Índice alfabético: `src/pages/glosario/index.astro`. Ya hace:
  ```astro
  const glossaryEntries = await getCollection("glossary", ({ data }) => !data.draft);
  glossaryEntries.sort((a, b) => a.data.term.localeCompare(b.data.term, "es"));
  // agrupa por primera letra normalizada en `groupedEntries`, renderiza secciones por letra
  ```
- Página por término: `src/pages/glosario/[slug].astro` — lee su `getStaticPaths`
  para ver exactamente cómo una entrada mapea a su slug; **deriva los slugs igual**
  en el código de agrupación de este plan (no adivines `.id` vs `.slug`).
- Los 53 slugs (nombres de archivo sin `.md`):
  `afc afp apv boleta-honorarios caec cae cic clave-unica cmf copago
  corredor-bolsa credito-aval-estado credito-hipotecario ctc cuenta-2 cuenta-rut
  custodia dicom dividendo-hipotecario etf finiquito fonasa fondo-emergencia
  fondo-mutuo fondo-solidario ges global-complementario gratificacion
  impuesto-unico indemnizacion inflacion ipc isapre liquidez lpc multifondo
  operacion-renta renta-imponible renta-variable rescate sbif seguro-cesantia
  sernac sii spread sueldo-bruto tmc tope-imponible tpm uf uta utm volatilidad`

## El mapeo de categorías (completo — los 53 slugs asignados)

Nueve categorías, en este orden de visualización, con la membresía exacta de slugs:

1. **prevision-pensiones** — "Previsión y pensiones":
   `afp, apv, cuenta-2, multifondo, tope-imponible, afc, cic, fondo-solidario, seguro-cesantia`
2. **empleo-remuneraciones** — "Empleo y remuneraciones":
   `finiquito, gratificacion, indemnizacion, sueldo-bruto, renta-imponible`
3. **impuestos** — "Impuestos":
   `boleta-honorarios, global-complementario, impuesto-unico, operacion-renta, sii, uta`
4. **deuda-credito** — "Deuda y crédito":
   `cae, caec, credito-aval-estado, ctc, dicom, lpc, spread, tmc`
5. **ahorro-inversion** — "Ahorro e inversión":
   `corredor-bolsa, custodia, etf, fondo-emergencia, fondo-mutuo, liquidez, renta-variable, rescate, volatilidad`
6. **vivienda-hipotecario** — "Vivienda e hipotecario":
   `credito-hipotecario, dividendo-hipotecario`
7. **indicadores** — "Indicadores y costo de vida":
   `inflacion, ipc, tpm, uf, utm`
8. **salud** — "Salud previsional":
   `copago, fonasa, ges, isapre`
9. **banca-seguridad** — "Banca, trámites y seguridad":
   `clave-unica, cmf, cuenta-rut, sbif, sernac`

(9+5+6+8+9+2+5+4+5 = 53.) Cada slug está asignado exactamente una vez. Si un slug
de "Estado actual" falta aquí o aparece dos veces, es condición de STOP.

## Comandos que vas a necesitar

| Propósito | Comando | Esperado al éxito |
|-----------|---------|-------------------|
| Typecheck | `npx astro check` | `0 errors` |
| Test unitario | `npx vitest run <archivo>` | todos pasan |
| Test completo | `npx vitest run tests/` | todos pasan |

## Alcance

**En alcance** (crear / modificar):
- `src/config/glossaryCategories.ts` (crear — el mapeo de arriba)
- `tests/config/glossaryCategories.test.ts` (crear — guardián de completitud)
- `src/pages/glosario/index.astro` (modificar — agregar vista temática;
  mantener intacta la vista alfabética)

**Fuera de alcance** (NO tocar):
- Los 53 `src/data/glossary/*.md` — sin cambios de definición ni frontmatter.
- `src/content.config.ts` — sin cambio de schema; las categorías viven en config,
  no en frontmatter.
- `src/pages/glosario/[slug].astro` — léelo, no lo modifiques.

## Flujo git

- Rama: `advisor/026-glossary-thematic-index`
- Estilo conventional commits; p. ej. `feat(glosario): índice temático además del alfabético`.
- NO hacer push ni abrir PR salvo que el operador lo indique.

## Pasos

### Paso 1: Crear el config de mapeo

Crea `src/config/glossaryCategories.ts` exportando: una unión `GlossaryCategoryId`
con los 9 ids de arriba; `GLOSSARY_CATEGORY_ORDER` (los ids en orden de
visualización); `GLOSSARY_CATEGORY_LABELS: Record<GlossaryCategoryId, string>`
(id → etiqueta en español de arriba); y
`GLOSSARY_CATEGORY_BY_SLUG: Record<string, GlossaryCategoryId>` listando cada uno
de los 53 slugs con su categoría del mapeo.

**Verifica**: `npx astro check` → `0 errors`.

### Paso 2: Test guardián de completitud

Crea `tests/config/glossaryCategories.test.ts` (modela según un test de config
existente, p. ej. `tests/application/CalculatorPortfolio.test.ts`). Debe, usando
`import { readdirSync } from "node:fs"` sobre `src/data/glossary`:
- asegurar que todo slug `.md` del glosario tiene entrada en
  `GLOSSARY_CATEGORY_BY_SLUG`;
- asegurar que toda categoría usada está en `GLOSSARY_CATEGORY_ORDER`;
- asegurar que `GLOSSARY_CATEGORY_BY_SLUG` no tiene ningún slug sin archivo `.md`
  correspondiente.

Este guardián hace que un término futuro agregado/eliminado falle fuerte hasta
categorizarse — el forzante buscado.

**Verifica**: `npx vitest run tests/config/glossaryCategories.test.ts` → todos pasan.

### Paso 3: Renderizar la vista temática en el índice

En `src/pages/glosario/index.astro`, después del agrupamiento alfabético
existente, agrega un segundo agrupamiento que clasifique `glossaryEntries` por
`GLOSSARY_CATEGORY_BY_SLUG[<slugDeLaEntrada>]`, iterando categorías en
`GLOSSARY_CATEGORY_ORDER` y renderizando la etiqueta de cada categoría + sus
términos (enlazando a `/glosario/<slug>/` exactamente como la sección alfabética).
Deriva `<slugDeLaEntrada>` igual que `src/pages/glosario/[slug].astro`.

Mantén la vista alfabética. Agrega un toggle simple o simplemente renderiza la
sección temática debajo de la alfabética (replica el markup de sección existente
de la página — reutiliza `SectionDivider`, que la página ya importa). No
re-estilices la página.

Si por alguna razón el slug de una entrada falta en el mapeo en runtime, ubícala
en un grupo final "Otros" en lugar de lanzar (el test del Paso 2 debería evitar
esto).

**Verifica**: `npx astro check` → `0 errors`.

## Plan de pruebas

- `tests/config/glossaryCategories.test.ts`: completitud bidireccional (todo
  término categorizado; todo slug mapeado tiene archivo; toda id de categoría
  declarada). Patrón: `tests/application/CalculatorPortfolio.test.ts`.
- La suite completa sigue verde: `npx vitest run tests/`.

## Criterios de hecho

TODOS deben cumplirse:

- [ ] `src/config/glossaryCategories.ts` mapea los 53 slugs en las 9 categorías
      ordenadas.
- [ ] `npx vitest run tests/config/glossaryCategories.test.ts` pasa.
- [ ] `npx astro check` termina en `0 errors`.
- [ ] `npx vitest run tests/` pasa.
- [ ] `/glosario/` aún renderiza la vista alfabética Y ahora una vista temática;
      ningún `src/data/glossary/*.md` fue modificado (`git status`).
- [ ] No se modifican archivos fuera del alcance.
- [ ] Fila de estado en `plans/README.md` actualizada.

## Condiciones de STOP

Detente e informa (no improvises) si:

- El conjunto de slugs `src/data/glossary/*.md` difiere de los 53 listados (se
  agregó/eliminó un término desde que se escribió este plan) — re-deriva
  categorías para el delta e informa, no clasifiques nuevos términos en silencio.
- El mapeo de "El mapeo de categorías" no suma el conteo vivo de archivos o algún
  slug queda sin asignar/duplicado.
- Renderizar la vista temática exigiría cambiar una definición del glosario o el
  schema de contenido.

## Notas de mantenimiento

- Las asignaciones de categoría son un primer pase revisable; un mantenedor puede
  reajustar cualquier slug solo en `glossaryCategories.ts` (un archivo, sin churn
  de contenido). Decisiones de juicio a mirar de nuevo: `uta` (impuestos vs
  indicadores), `renta-imponible` (impuestos vs empleo), `credito-aval-estado`
  (deuda vs vivienda), `dicom` (deuda vs banca-seguridad).
- Agregar un término nuevo fallará `glossaryCategories.test.ts` hasta
  categorizarlo — es intencional (evita que un término sin categoría desaparezca
  en silencio de la vista temática).
- Diferido (trabajo editorial/pipeline aparte, NO este plan): escribir los
  *términos* nuevos que sugiere la auditoría (cuenta remunerada, TIR, money
  market, carga financiera, portabilidad financiera, PGU, etc.). Las definiciones
  nuevas son contenido YMYL y necesitan el pipeline editorial + visto bueno.
