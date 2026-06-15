# ADR-20260615-mdx-activation

Date: 2026-06-15
Status: Proposed

## Context

Astro MDX está completamente configurado en el proyecto desde el inicio (`@astrojs/mdx` integrado en `astro.config.ts`), pero de los 50 artículos del blog, solo 1 es `.mdx` (`que-es-el-apv.mdx`) y no utiliza ningún componente interactivo — solo importa `IndicadorEconomico.astro` para mostrar valores económicos compilados en build time.

La infraestructura para embeber componentes interactivos en artículos está pagada pero sin usar. Esto deja oportunidades sin explotar:

- Artículos que explican cálculos (interés compuesto, prepago de crédito, CAE) linkean a calculadoras externas pero no ofrecen interactividad inline.
- Artículos comparativos (Fonasa vs Isapre, DAP UF vs pesos, CIC vs Fondo Solidario) presentan decisiones binarias que podrían resolverse con un mini-árbol de decisión en el mismo artículo.
- El lector debe ir y venir entre el artículo y la calculadora, aumentando fricción y riesgo de abandono.

## Decision

Adoptar MDX como formato opt-in para artículos donde un componente interactivo mejore significativamente la comprensión del contenido. No se convierte toda la base de artículos; se usa MDX solo cuando hay un beneficio claro.

Para esta primera iteración (design spike) se crearon:

1. **`src/components/mdx/InlineCalculator.astro`** — mini-calculadora de interés compuesto con vanilla JS. Recibe props de configuración (labels, valores por defecto) y renderiza un formulario simple con resultado en vivo. Usa `<script>` vanilla (no React, que solo está disponible en dev pages) para la interactividad cliente.

2. **`src/components/mdx/DecisionTree.astro`** — árbol de decisión guiado. Recibe un array de pasos (pregunta + opciones + resultado) y renderiza una experiencia paso a paso. Útil para artículos comparativos donde el lector debe autoevaluarse.

3. **Artículo piloto convertido:** `el-poder-del-interes-compuesto.mdx` — se agregó `InlineCalculator` al inicio, justo después del párrafo introductorio. El artículo existente ya explicaba un ejercicio de interés compuesto y linkeaba a la calculadora completa; ahora ofrece una mini-calculadora inline para experimentar con valores propios sin salir del artículo.

### Reglas de uso

- Solo se convierte un artículo a `.mdx` si al menos un componente interactivo aporta valor demostrable a la comprensión.
- Los componentes MDX deben ser autónomos (vanilla JS, sin frameworks externos) para mantener la compatibilidad con el build de producción (React solo habilitado en dev pages).
- El formato `.md` original se conserva (no se elimina); la fuente de verdad pasa a `.mdx`.
- Los componentes MDX residen en `src/components/mdx/` con nombre explícito de su propósito.

## Consequences

### Positive
- Los artículos con cálculos o decisiones pueden ofrecer interactividad inline, reduciendo la fricción de ir a una calculadora separada.
- Los componentes son reutilizables: `InlineCalculator` puede usarse en cualquier artículo financiero que explique un cálculo, y `DecisionTree` en cualquier artículo comparativo.
- El vanilla JS mantiene la compatibilidad con el pipeline de build existente (CSP con hashes, service worker, etc.).
- No hay dependencias adicionales ni cambios en la configuración del proyecto.

### Trade-offs
- Los componentes MDX con `<script>` requieren que Astro procese y hashee los scripts inline para CSP, lo que ya está resuelto con `@kindspells/astro-shield`.
- El vanilla JS sin framework limita la complejidad de los componentes interactivos. Para interactividad más sofisticada (gráficos, tablas dinámicas), habría que evaluar Web Components o habilitar React globalmente.
- El authoring en MDX es ligeramente más verboso que Markdown puro: requiere imports y sintaxis JSX.
- Los componentes MDX no pueden usar `client:load` ni directivas Astro de hidratación porque no hay framework cliente; toda la interactividad debe ir en `<script>` tags dentro del componente.

## Alternatives considered

1. **Web Components nativos:** más alineados con la arquitectura del sitio (sin framework), pero requieren más código boilerplate y definición de custom elements. Se prefirió vanilla JS en `<script>` por simplicidad y porque el alcance de interactividad necesario es acotado (formularios, árboles de decisión).

2. **Habilitar React globalmente para MDX:** React ya está en el proyecto pero solo habilitado para dev pages. Habilitarlo globalmente permitiría usar componentes React con `client:load` en artículos, pero añadiría payload JS (~40 KB gzipped) a todas las páginas que usen componentes interactivos, impactando LCP y FCP. Se descartó para mantener el perfil de rendimiento actual.

3. **iframe de calculadoras existentes:** embeber las calculadoras vía `<iframe>`. Descartado por problemas de UX (doble scroll, falta de contexto visual, ruptura del diseño responsivo, y dificultad para pasar props desde el artículo).

4. **MDX para todos los artículos:** convertir toda la base. Descartado en esta fase porque el beneficio es marginal para artículos puramente informativos sin cálculos ni decisiones.

## Open questions

1. **Impacto SEO:** ¿Google interpreta correctamente el contenido renderizado por componentes MDX con vanilla JS? La hipótesis es que sí, porque el contenido se renderiza en server (SSR en Astro) y el JS client-side solo añade interactividad. Sin embargo, si el componente depende completamente de JS cliente para mostrar información clave, el contenido no sería visible para crawlers. Los componentes creados muestran valores por defecto estáticos que el JS luego actualiza, mitigando este riesgo.

2. **Métricas de engagement:** ¿La presencia de un componente interactivo inline aumenta el tiempo en página, la tasa de clics a calculadoras completas o el scroll depth? No hay datos previos. Se propone medir con analytics después del deploy del artículo piloto.

3. **Accesibilidad:** Los componentes con vanilla JS requieren manejo explícito de ARIA, focus trapping (en el DecisionTree) y anuncios para screen readers. La implementación actual es básica; una adopción más amplia requeriría una auditoría WCAG de los componentes MDX.

4. **Mantenibilidad:** Los componentes MDX agregan una capa de lógica cliente que debe recibir el mismo tratamiento que el resto del frontend (tests, code review). Para un uso extensivo, habría que considerar migrar a Web Components o Lit para mejor testabilidad.

## Verification

- `pnpm run build` exit 0 (el build procesa artículos `.mdx` con componentes importados).
- `pnpm run test` all pass.
- El artículo piloto `el-poder-del-interes-compuesto.mdx` se renderiza correctamente con el componente `InlineCalculator` funcional en el navegador.
- La calculadora inline muestra valores por defecto y responde a cambios del usuario sin errores en consola.
- CSP no bloquea los scripts: `@kindspells/astro-shield` genera los hashes correctos.

## Candidates identified

Los siguientes 5 artículos se identificaron como candidatos principales para conversión MDX (ordenados por beneficio estimado):

| Artículo | Componente propuesto | Razón |
|---|---|---|
| `el-poder-del-interes-compuesto` (piloto) | `InlineCalculator` | Explica un cálculo de interés compuesto; la mini-calculadora permite al lector experimentar con sus propios valores. |
| `prepago-credito-cuando-conviene-chile` | `InlineCalculator` + `DecisionTree` | El artículo evalúa si conviene prepagar; un árbol de decisión guía al lector según su situación, y una mini-calculadora muestra el ahorro. |
| `fonasa-vs-isapre-comparativa` | `DecisionTree` | Decisión binaria (Fonasa vs Isapre) basada en ingresos, salud y carga familiar. |
| `seguro-cesantia-cuenta-individual-vs-fondo-solidario` | `DecisionTree` | Compara dos capas del seguro de cesantía; el lector necesita saber cuál le aplica. |
| `deposito-a-plazo-uf-vs-pesos` | `InlineCalculator` | Comparación basada en inflación esperada; una mini-calculadora mostraría el resultado neto según los supuestos del lector. |
