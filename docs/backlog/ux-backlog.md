# Backlog UX/UI — Monedario.cl

> Generado el 2026-04-09. Fuente: `docs/reports/ux-audit-2026-04-09.md`.
> Serie: MON-4xx (complementa el backlog estratégico MON-0xx a MON-3xx).
> Lectura obligatoria: la auditoría UX completa en `docs/reports/ux-audit-2026-04-09.md`.

---

## Resumen

La auditoría UX identificó 12 hallazgos principales y 10 observaciones menores. Este backlog los convierte en tickets ejecutables organizados en 3 fases: quick wins, mejoras de complejidad media, y cambios estructurales.

**Dependencias con backlog existente:**
- MON-204 (PrimaryCTA post-resultado) ya cubre parcialmente el hallazgo 11 — este backlog lo complementa, no lo duplica
- MON-201/202 (homepage hero y problem cards) ya están done — los tickets UX aquí proponen reordenar/simplificar lo existente

---

## Tabla de fases

| # | Fase | Objetivo | Duración estimada | Criterio de salida |
|---|------|---------|-------------------|-------------------|
| QW | Quick wins | Fixes de alto impacto / bajo esfuerzo que mejoran UX sin refactors | 1 semana | Todos los items QW marcados done |
| MM | Mejoras medias | Componentes nuevos o refactors moderados que mejoran flujos clave | 2-3 semanas | Calculator CTA in articles, instant search, hub reorder implementados |
| ES | Estructural | Cambios de diseño o arquitectura que requieren inversión significativa | 4-6 semanas | Identidad visual definida, breadcrumbs contextuales, nav móvil rediseñada |

---

## Tabla maestra de tickets

| ID | Título | Fase | Prioridad | Tipo | Esfuerzo | Hallazgo | Dependencias | Estado |
|----|--------|------|-----------|------|----------|----------|--------------|--------|
| MON-401 | Simplificar homepage — reducir a 3 secciones core | QW | P0 | frontend | M | H1 | MON-201, MON-202 (done) | ✅ done |
| MON-402 | Card CTA de calculadora embebida en artículos | MM | P1 | frontend | M | H2 | — | ✅ done |
| MON-403 | Simplificar nav móvil — reducir dropdown Guías | QW | P1 | frontend | S | H3 | — | ✅ done |
| MON-404 | Búsqueda instantánea con Pagefind UI | MM | P1 | frontend | M | H4 | — | ✅ done |
| MON-405 | Sistema de ilustraciones custom por tema | ES | P2 | design | L | H5 | — | 🔲 pendiente |
| MON-406 | Reordenar hubs — acción primero, educación después | QW | P1 | content | S | H6 | — | ✅ done |
| MON-407 | Breadcrumbs contextuales basados en tag/categoría | MM | P2 | frontend | M | H7 | — | ✅ done |
| MON-408 | Reemplazar trust badge "Open source" | QW | P2 | copy | S | H8 | — | ✅ done |
| MON-409 | Reposicionar resume widget al tope para returning users | MM | P2 | frontend | M | H9 | — | ✅ done |
| MON-410 | Reframear bio de autor — liderar con trabajo chileno | QW | P2 | copy | S | H10 | — | ✅ done |
| MON-411 | Mover Glosario y Leyes fuera de nav principal | QW | P3 | frontend | S | H12 | — | ✅ done |
| MON-412 | Remover italic global en h3 | QW | P3 | frontend | S | S5 | — | ✅ done |
| MON-413 | Liderar WhatsApp en share buttons | QW | P3 | frontend | S | S7 | — | ✅ done |
| MON-414 | Prev/next topical en artículos (en vez de cronológico) | MM | P3 | frontend | M | S4 | MON-407 | ✅ done |
| MON-415 | Ejemplo pre-llenado en calculadoras | MM | P2 | frontend | S | H11 | — | ✅ done |
| MON-416 | Alinear copyright footer con licencia real | QW | P3 | copy | S | S3 | — | ✅ done |

---

## Detalle por ticket

### MON-401 — Simplificar homepage: reducir a 3 secciones core

**Hallazgo:** H1 (Sobrecarga cognitiva en homepage)
**Prioridad:** P0 | **Esfuerzo:** M | **Tipo:** frontend

**Contexto:**
La homepage actual tiene 6+ secciones con peso visual similar. Un visitante nuevo enfrenta ~20+ paths clickeables antes de medio scroll. Las secciones "Otros temas que también puedes resolver" y el artículo destacado duplican funcionalidad del menú de nav.

**Alcance:**
1. Eliminar o colapsar la sección "Otros temas que también puedes resolver" (5 cards de guías temáticas) — esta información ya está en el dropdown de Guías del menú
2. Mover "Qué necesitas resolver?" (ProblemCards) a posición 2, inmediatamente después del hero
3. Reducir artículos recientes de 3+3 expandibles a 3 máximo
4. Mover el CTA "Calcula tu caso" más arriba (después de ProblemCards)
5. Considerar: el artículo destacado puede moverse a un banner más compacto o eliminarse

**Estructura target de homepage:**
```
1. Hero + 4 CTAs rápidos (mantener como está)
2. "Qué necesitas resolver?" — 6 scenario cards (promover)
3. CTA "Calcula tu caso" (promover)
4. Artículos recientes (3 máximo, sin expandible)
5. Resume widget (para returning users)
6. Footer
```

**Archivos a modificar:** `src/pages/index.astro`
**No modificar:** `HeroHomepage.astro`, `ProblemCards.astro` (componentes están bien, es el layout de la página)

**Criterio de éxito:** Homepage con max 4 secciones antes del footer. Time-to-first-click reducido.

---

### MON-402 — Card CTA de calculadora embebida en artículos

**Hallazgo:** H2 (Integración calculadora-artículo demasiado textual)
**Prioridad:** P1 | **Esfuerzo:** M | **Tipo:** frontend

**Contexto:**
Los artículos mencionan calculadoras via links de texto pero no tienen un componente visual prominente que invite al usuario a usar la calculadora. El `ArticleDecisionIntro` al tope incluye links, pero dentro del body del artículo las referencias son markdown links.

**Alcance:**
1. Crear componente `CalculatorCTA.astro` (o similar) que renderice una card prominente con:
   - Icono de la calculadora
   - Título descriptivo ("Calcula tu sueldo líquido ahora")
   - Descripción de 1 línea ("Ingresa tu sueldo bruto y ve cuánto recibes")
   - Botón "Abrir calculadora →"
2. Usar como shortcode en markdown o como bloque insertable en artículos que tienen `articleLead.calculatorHref`
3. Posicionar después de la sección explicativa y antes del FAQ

**Archivos a modificar:** Nuevo componente + `PostDetails.astro` para inserción automática
**Relación con MON-204:** MON-204 cubre CTAs post-resultado *en calculadoras*. Este ticket cubre CTAs *dentro de artículos* apuntando a calculadoras. Complementarios, no duplicados.

**Criterio de éxito:** Artículos con `articleLead.calculatorHref` muestran card CTA visual prominente. Medible via `article_calculator_cta_click` event.

---

### MON-403 — Simplificar navegación móvil

**Hallazgo:** H3 (Complejidad de navegación móvil)
**Prioridad:** P1 | **Esfuerzo:** S | **Tipo:** frontend

**Contexto:**
El menú hamburger contiene 15+ ítems (8 sub-ítems de Guías + 6 ítems principales + toggle). Mismo array `guiasDropdown` para desktop y móvil.

**Opciones (elegir una):**

**Opción A — Guías como link directo en móvil:**
En breakpoint móvil, reemplazar el dropdown de Guías con un solo link "Guías →" que lleve a `/guias/` (requiere crear página índice de guías si no existe).

**Opción B — Top 4 guías en móvil:**
En móvil, mostrar solo las 4 guías más usadas (Sueldo, Deuda, Impuestos, Empleo) + "Ver todas →".

**Opción C — Mover Glosario/Leyes fuera (combinar con MON-411):**
Reducir nav principal a: Guías (dropdown), Calculadoras, Nosotros, Buscar. Mover Glosario y Leyes al footer.

**Archivo a modificar:** `src/components/Header.astro`
**Nota:** Verificar que `/guias/` index page existe (Opción A). Actualmente `src/pages/guias/index.astro` existe.

**Criterio de éxito:** Menú móvil con max 8 ítems visibles sin scroll.

---

### MON-404 — Búsqueda instantánea con Pagefind UI

**Hallazgo:** H4 (Búsqueda sin resultados en tiempo real)
**Prioridad:** P1 | **Esfuerzo:** M | **Tipo:** frontend

**Contexto:**
La búsqueda actual depende de un widget que a veces falla al cargar. La página fallback tiene input estático con sugerencias de keywords.

**Alcance:**
1. Configurar Pagefind UI component con:
   - Input debounced (300ms)
   - Resultados instantáneos mostrando: título + descripción + tipo de contenido (artículo/calculadora/glosario/ley)
   - Máximo 8-10 resultados visibles
   - Navegación por teclado (arrow keys + Enter)
   - Fuzzy matching habilitado
2. Mantener sugerencias de keywords populares como fallback visual cuando no hay query
3. Eliminar dependencia de widget externo

**Archivos a modificar:** `src/pages/buscar.astro` (o `search.astro`), posiblemente `astro.config`
**Referencia:** https://pagefind.app/docs/ui/

**Criterio de éxito:** Búsqueda muestra resultados en <500ms después de typing. Sin blank screen entre query y resultados.

---

### MON-405 — Sistema de ilustraciones custom por tema

**Hallazgo:** H5 (Sin diferenciación visual de marca)
**Prioridad:** P2 | **Esfuerzo:** L | **Tipo:** design

**Contexto:**
El sitio es tipográficamente limpio pero visualmente anónimo. Sin ilustraciones, sin iconos custom, sin lenguaje visual distintivo. Emojis funcionan pero no construyen brand equity.

**Alcance:**
1. Definir estilo visual (flat illustration, line art, isometric — debe ser reproducible)
2. Crear 8 ilustraciones para categorías de guías:
   - Ahorro e Inversión
   - Deuda y Crédito
   - Empleo e Ingresos
   - Sueldo y Remuneraciones
   - UF y Costo de Vida
   - Impuestos
   - Pensiones y AFP
   - Seguridad Financiera
3. Crear set de iconos para 4 familias de calculadoras
4. Integrar en: hubs (header illustration), homepage (scenario cards), calculadoras index

**Dependencia:** Requiere definir direction de diseño visual antes de producir assets.
**Alternativa de bajo costo:** Usar un set de iconos SVG consistente (no emojis) como paso intermedio.

**Criterio de éxito:** Cada hub y familia de calculadoras tiene identidad visual propia. Usuario puede distinguir categorías por color/ilustración sin leer texto.

---

### MON-406 — Reordenar hubs: acción primero, educación después

**Hallazgo:** H6 (Hubs front-loadean educación sobre acción)
**Prioridad:** P1 | **Esfuerzo:** S | **Tipo:** content

**Contexto:**
Los hubs abren con intro → reading order → cards de acción. Usuarios de búsqueda orgánica (la mayoría del tráfico) necesitan el link correcto rápido, no una secuencia de aprendizaje.

**Alcance:**
Reordenar secciones en cada hub:
1. **Quick action cards primero** ("Elige tu ruta" o "Si estás partiendo desde...")
2. **Tabla comparativa / herramienta de decisión** (donde exista, como en deuda-credito)
3. **Errores comunes** (promover — usuarios aprenden de anti-patrones)
4. **Reading order recomendado** (mover abajo como "Quieres aprender el tema completo?")
5. **Intro educativa** (reducir o eliminar — la intro actual explica lo que el hub contiene, pero las cards ya lo muestran)

**Hubs a modificar (8 total):**
- `src/pages/guias/sueldo-remuneraciones/index.astro`
- `src/pages/guias/deuda-credito/index.astro`
- `src/pages/guias/empleo-ingresos/index.astro`
- `src/pages/guias/impuestos-personas/index.astro`
- `src/pages/guias/pensiones-afp/index.astro`
- `src/pages/guias/ahorro-e-inversion/index.astro`
- `src/pages/guias/uf-costo-de-vida/index.astro`
- `src/pages/guias/seguridad-financiera/index.astro`

**Criterio de éxito:** En cada hub, el primer bloque de contenido visible (después del título) son links/cards accionables, no texto educativo.

---

### MON-407 — Breadcrumbs contextuales basados en tag/categoría

**Hallazgo:** H7 (Inconsistencia de breadcrumbs)
**Prioridad:** P2 | **Esfuerzo:** M | **Tipo:** frontend

**Contexto:**
Breadcrumbs en artículos muestran "Inicio > Artículos > [slug]". El segmento "Artículos" apunta a `/posts/` (feed cronológico) en vez del hub temático donde el artículo pertenece.

**Alcance:**
1. Modificar `Breadcrumb.astro` para aceptar override contextual de breadcrumb segments
2. En `PostDetails.astro`, derivar breadcrumb context del primer tag del artículo mapeado a su hub correspondiente:
   - tag "sueldo" → "Sueldo y Remuneraciones" (`/guias/sueldo-remuneraciones/`)
   - tag "deudas" / "dicom" → "Deuda y Crédito" (`/guias/deuda-credito/`)
   - tag "impuestos" → "Impuestos" (`/guias/impuestos-personas/`)
   - tag "afp" / "pensiones" → "Pensiones y AFP" (`/guias/pensiones-afp/`)
   - etc.
3. Crear mapping tag→hub como config (similar a `sueldoClusterLinks.ts`)
4. Fallback a "Artículos" si no hay tag mapping

**Archivos a modificar:** `src/components/Breadcrumb.astro`, `src/layouts/PostDetails.astro`, nuevo config file para tag→hub mapping

**Criterio de éxito:** Artículo sobre liquidación de sueldo muestra "Inicio > Sueldo y Remuneraciones > Liquidación de sueldo" en breadcrumb.

---

### MON-408 — Reemplazar trust badge "Open source"

**Hallazgo:** H8
**Prioridad:** P2 | **Esfuerzo:** S | **Tipo:** copy

**Alcance:**
En `src/components/HeroHomepage.astro`, cambiar el array `trustSignals`:
- Reemplazar `"Open source"` con `"Sin registro requerido"` o `"Actualizado mensualmente"` o `"Código verificable"`
- Evaluar cuál resuena más con la audiencia target (trabajadores chilenos, no developers)

**Criterio de éxito:** Todos los trust badges son comprensibles para un usuario no técnico.

---

### MON-409 — Reposicionar resume widget para returning users

**Hallazgo:** H9
**Prioridad:** P2 | **Esfuerzo:** M | **Tipo:** frontend

**Alcance:**
1. En homepage: detectar via localStorage si el usuario tiene datos de resume
2. Si tiene datos: renderizar ResumeWidget inmediatamente después del hero (posición 2)
3. Si no tiene datos: mantener hidden (no mostrar caja vacía)
4. Alternativa: mostrar toast/banner sticky al tope "Volver a: [última calculadora]" que se descarta con un clic

**Archivos a modificar:** `src/pages/index.astro`, posiblemente `src/components/ResumeWidget.astro`

**Criterio de éxito:** Usuarios recurrentes ven su último contexto sin scrollear. CTR de `resume_click` incrementa.

---

### MON-410 — Reframear bio de autor

**Hallazgo:** H10
**Prioridad:** P2 | **Esfuerzo:** S | **Tipo:** copy

**Alcance:**
Cambiar el bio en:
1. `src/layouts/PostDetails.astro` (author card inline, línea ~253)
2. `src/pages/about.astro` (sección de autor)
3. `src/pages/autor.astro` (página de autor)

**Bio actual:**
> "Abogado (Venezuela), analista de datos y desarrollador especializado en educación financiera práctica."

**Bio propuesta:**
> "Investigador financiero y desarrollador de herramientas de educación financiera para Chile. Abogado de formación y analista de datos."

**Principio:** Liderar con el trabajo relevante (finanzas Chile), no con la credencial jurisdiccional.

**Criterio de éxito:** Bio comunica expertise en dominio chileno como primera impresión.

---

### MON-411 — Mover Glosario y Leyes fuera de nav principal

**Hallazgo:** H12
**Prioridad:** P3 | **Esfuerzo:** S | **Tipo:** frontend

**Alcance:**
1. En `Header.astro`, eliminar `<li>` de Glosario y Leyes del `#menu-items`
2. Opción A: Agrupar bajo dropdown "Recursos" (Glosario + Leyes)
3. Opción B: Dejar solo en footer (ya están ahí)
4. Nav resultante: Guías | Calculadoras | Nosotros | Buscar | Tema

**Consideración:** Si se implementa MON-403 (simplificar nav móvil) al mismo tiempo, el impacto combinado es mayor.

**Criterio de éxito:** Nav principal tiene max 5 ítems top-level.

---

### MON-412 — Remover italic global en h3

**Hallazgo:** S5
**Prioridad:** P3 | **Esfuerzo:** S | **Tipo:** frontend

**Alcance:**
En `src/styles/typography.css`, eliminar `@apply italic;` de `h3` dentro de `.app-prose`.

**Archivo:** `src/styles/typography.css` línea 19

**Criterio de éxito:** `h3` se renderiza en peso normal, mejorando escaneabilidad en artículos largos.

---

### MON-413 — Liderar WhatsApp en share buttons

**Hallazgo:** S7
**Prioridad:** P3 | **Esfuerzo:** S | **Tipo:** frontend

**Alcance:**
En `src/components/ShareLinks.astro`:
1. Mover WhatsApp a primera posición (es el canal dominante en Chile)
2. Hacerlo visualmente más prominente (botón más grande o con color de marca)
3. Colapsar Facebook, X, Telegram, LinkedIn bajo "Más" o mostrar como iconos secundarios más pequeños

**Criterio de éxito:** WhatsApp es el share button más prominente y tiene mayor CTR que los demás.

---

### MON-414 — Prev/next topical en artículos

**Hallazgo:** S4
**Prioridad:** P3 | **Esfuerzo:** M | **Tipo:** frontend

**Alcance:**
En `PostDetails.astro`, reemplazar el sistema cronológico de prev/next con navegación basada en el cluster temático del artículo.

**Dependencia:** MON-407 (mapping tag→hub) — necesita el mismo mapping de tags a clusters.

**Criterio de éxito:** Artículo sobre finiquito muestra prev/next a otros artículos del cluster empleo/sueldo, no a artículo cronológicamente adyacente.

---

### MON-415 — Ejemplo pre-llenado en calculadoras

**Hallazgo:** Parte de H11 (calculadoras no promueven exploración post-resultado)
**Prioridad:** P2 | **Esfuerzo:** S | **Tipo:** frontend

**Alcance:**
En las calculadoras principales (sueldo-liquido, finiquito, operacion-renta):
1. Mostrar un resultado de ejemplo por defecto al cargar la página ("Ejemplo: sueldo bruto $1.200.000")
2. El ejemplo se reemplaza cuando el usuario ingresa sus propios datos
3. Objetivo: el usuario ve inmediatamente qué tipo de output esperar

**Criterio de éxito:** Calculadora muestra resultado de ejemplo al cargar. Tasa de completación de cálculos aumenta.

---

### MON-416 — Alinear copyright footer con licencia real

**Hallazgo:** S3
**Prioridad:** P3 | **Esfuerzo:** S | **Tipo:** copy

**Alcance:**
En `src/components/Footer.astro`, cambiar el texto de copyright para ser preciso:
- Actual: "© 2026 | Todos los derechos reservados."
- Propuesta: "Contenido © 2026 Monedario · Código bajo licencia MIT" (o la licencia que corresponda)

**Criterio de éxito:** Footer no contradice el claim de open source.

---

## Orden de ejecución recomendado

### Sprint 1 — Quick wins (semana 1)

```
MON-408  Reemplazar trust badge "Open source"        [copy, 10 min]
MON-410  Reframear bio de autor                      [copy, 15 min]
MON-412  Remover italic global en h3                 [frontend, 5 min]
MON-416  Alinear copyright footer                    [copy, 5 min]
MON-406  Reordenar hubs — acción primero             [content, 2-4 hrs/hub]
MON-401  Simplificar homepage                        [frontend, 3-4 hrs]
MON-403  Simplificar nav móvil                       [frontend, 2-3 hrs]
MON-413  Liderar WhatsApp en share buttons           [frontend, 30 min]
```

### Sprint 2 — Mejoras medias (semanas 2-3)

```
MON-404  Búsqueda instantánea Pagefind               [frontend, 2-3 días] ✅
MON-402  Card CTA calculadora en artículos            [frontend, 1-2 días] ✅
MON-415  Ejemplo pre-llenado en calculadoras          [frontend, 1 día]    ✅
MON-409  Reposicionar resume widget                   [frontend, 1 día]    ✅
MON-407  Breadcrumbs contextuales                     [frontend, 1-2 días] ✅
```

### Sprint 3 — Estructural (semanas 4+)

```
MON-411  Mover Glosario/Leyes fuera de nav           [frontend, 1 hr] ✅
MON-414  Prev/next topical en artículos               [frontend, 2-3 días] ✅
MON-405  Sistema de ilustraciones custom              [design, 4-6 semanas]
```

---

## Métricas de validación post-implementación

| Métrica | Baseline (medir antes) | Target | Cómo medir |
|---|---|---|---|
| Homepage bounce rate | Medir actual | -15% | GA4 |
| Time-to-first-click homepage | Medir actual | <5 segundos | Custom event `homepage_section_visible` + click |
| Artículo → calculadora CTR | Medir actual | +30% | `article_calculator_cta_click` event |
| Búsqueda → contenido CTR | Medir actual | +50% | `search_query_submitted` → next pageview |
| Resume widget CTR | Medir actual (ya instrumentado) | +25% | `resume_click` event |
| Hub bounce rate (search traffic) | Medir actual | -20% | GA4 segment: organic + hub pages |
| Calculator completion rate | Medir actual | +10% | `calculator_result_shown` / page load |

---

## Decisiones pendientes

1. **MON-403 — Qué opción de nav móvil?** Opción A (link a /guias/), B (top 4), o C (eliminar Glosario/Leyes)? Decidir antes de implementar.

2. **MON-405 — Estilo de ilustraciones?** Flat, line art, isometric? Colores del brand existente? Requiere dirección de diseño antes de producir assets.

3. **MON-408 — Qué trust badge reemplaza "Open source"?** "Sin registro requerido," "Actualizado mensualmente," o "Código verificable"? Decidir cuál resuena más.

4. **MON-401 — Eliminar artículo destacado de homepage o reducirlo?** El artículo destacado ocupa espacio significativo. Opciones: eliminar, reducir a banner compacto, o mover debajo de scenario cards.

5. **MON-411 — Dropdown "Recursos" o solo footer?** Si se crea dropdown, agrupa Glosario + Leyes. Si se mueve a footer, se eliminan del nav completamente.
