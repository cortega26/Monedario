# Auditoría de accesibilidad — WCAG 2.2 AA

**Fecha:** 2026-05-18
**Alcance:** sitio monedario.cl
**Estándar evaluado:** WCAG 2.2 Nivel AA (incluye criterios nuevos 2.4.11, 2.4.12, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8, 3.3.9).
**Resultado:** 0 violaciones detectadas en 39 escaneos (13 plantillas × 3 condiciones).

## 1. Plantillas evaluadas

| # | Plantilla | URL representativa |
|---|---|---|
| 1 | Portada | `/` |
| 2 | Artículo | `/posts/como-calcular-sueldo-liquido/` |
| 3 | Calculadora (compleja) | `/calculadoras/sueldo-liquido/` |
| 4 | Calculadora (conversor simple) | `/calculadoras/conversor-utm/` |
| 5 | Índice de calculadoras | `/calculadoras/` |
| 6 | Buscador (Pagefind) | `/buscar/` |
| 7 | Error 404 | `/nonexistent/` |
| 8 | Glosario (ficha) | `/glosario/cae/` |
| 9 | Ley (ficha) | `/leyes/ley-18010-credito-dinero/` |
| 10 | About | `/about/` |
| 11 | Declaración de accesibilidad | `/accessibilidad/` |
| 12 | Listado de tag | `/tags/afp/` |
| 13 | Hub de guías | `/guias/` |

Cada plantilla se evaluó en tres condiciones: light desktop, dark desktop, mobile (390×844px).

## 2. Metodología

- **Motor automatizado:** [axe-core](https://github.com/dequelabs/axe-core) 4.11 vía `@axe-core/playwright`.
- **Tags WCAG evaluadas:** `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`.
- **Severidad:** se contaron violaciones de cualquier nivel de impacto (critical, serious, moderate, minor).
- **Ejecución:** `pnpm exec playwright test` sobre el sitio servido por `astro preview` (build de producción).
- **Reproducibilidad:** los archivos `tests/accessibility/pages.test.ts` y `tests/accessibility/full-report.test.ts` mantienen el set de plantillas para regresiones.

## 3. Cambios aplicados durante esta auditoría

| Hallazgo | Regla axe | Plantillas afectadas | Solución |
|---|---|---|---|
| Links de Breadcrumb sin distintivo de no-color | `link-in-text-block` | 4 (Calc index, Ley, About, Accesibilidad) | Subrayado permanente con `decoration-border` |
| Links inline `text-accent` que sólo se subrayaban en hover | `link-in-text-block` | 7 archivos (about, autor, apoyar, leyes/index, leyes/[slug]) | Conversión a subrayado permanente (`underline underline-offset-4`) — 71 ocurrencias |
| Chips de calculadora teal/amber con contraste 3.13:1 | `color-contrast` | Índice de calculadoras (8 chips) | Tokens nuevos `--color-accent-2-text` (#055f57) y `--color-highlight-text` (#92400e) |
| Botón "Apoyar" del SupportCallout con `text-white` sobre `bg-accent` en dark mode | `color-contrast` | Article, Calc (sueldo), About, Accesibilidad — modo oscuro | Cambio a `text-background` (texto oscuro sobre acento claro en dark) |
| Eyebrows `text-accent` (3.99:1) en bloques `bg-surface-muted` en dark mode | `color-contrast` | Artículo, calculadoras, ley, accesibilidad — modo oscuro | Bump del token `--accent` en dark mode (#4a9edd → #6cb1f5, lum 0.422, contraste 5.19:1) |
| `text-red-600` (3.78:1) en ejemplos de cálculo en dark mode | `color-contrast` | Calc (sueldo) — modo oscuro | Adición de `dark:text-red-400` |
| Botón Ko-fi con `bg-[#0d9488] text-white` (3.75:1) | `color-contrast` | `/apoyar/` | Cambio a `bg-[#0f766e]` (teal-700, contraste 5.47:1) |
| Links de NextSteps con altura <24px CSS | `target-size` (WCAG 2.2 SC 2.5.8) | Mobile en todas las plantillas que rendericen NextSteps | `min-h-[24px] items-center py-1` |
| Links de ContextLinkSection con altura <24px CSS | `target-size` | Mobile en artículos con ContextLinkSection | `min-h-[24px] items-center py-1` |
| Links del Footer con altura <24px CSS | `target-size` | Mobile en todas las páginas | `inline-flex min-h-[24px] items-center py-0.5` |

## 4. Verificaciones previas confirmadas (sin cambios necesarios)

- **`aria-live` en calculadoras:** las 19 calculadoras tienen regiones live para sus resultados (`aria-live="polite"` o `"assertive"`).
- **Barra de progreso de lectura** (`PostDetails.astro:551-565`): tiene `role="progressbar"`, `aria-valuenow/min/max` actualizados al scroll, y `aria-label="Progreso de lectura del artículo"`.
- **Botón "Volver arriba"** (`BackToTopButton.astro:24-32`): tiene `role="progressbar"` con valores ARIA actualizados al scroll y `aria-label`.
- **Pagefind:** integrado en `<div role="region" aria-label="Resultados de búsqueda">` con un formulario propio `role="search"` y `<label for="site-search">`.
- **Navegación dropdown:** usa `<ul>` con `aria-expanded` (no `role="menu"`).
- **Skip link** presente en cada página vía `Layout.astro`.

## 5. Limitaciones conocidas de esta auditoría

Estas son limitaciones del **método** de evaluación, no violaciones detectadas:

1. **No incluye testing manual con lectores de pantalla.** No se ejecutaron pasadas con VoiceOver, NVDA o TalkBack en esta auditoría. Algunos criterios WCAG (1.3.1, 2.4.6, 3.3.2) requieren evaluación humana para asegurar que el orden de lectura y la semántica anunciada coincidan con la intención editorial.
2. **No incluye contenido user-generated.** Pagefind genera resultados dinámicamente; los IDs y la semántica del resultado dependen del bundle de Pagefind (terceros), no controlado por nosotros.
3. **Cobertura por muestreo.** Se evaluó 1 plantilla representativa por tipo (1 calculadora compleja + 1 simple, 1 ley, 1 glosario, 1 tag, etc.). El resto del contenido del mismo tipo hereda el mismo template.
4. **`prefers-reduced-motion`** se respeta vía CSS pero no fue probado interactivamente.
5. **Ratios de contraste calculados sobre tokens semánticos**, no sobre cada combinación posible.

## 6. Comando para reproducir

```bash
pnpm build:ci
cp -r dist/pagefind public/
pnpm exec playwright test
pnpm exec playwright test full-report --reporter=line
```

## 7. Reglas axe verificadas (extracto)

axe-core con los tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa` cubre, entre otras:

- `color-contrast` (1.4.3)
- `link-in-text-block` (1.4.1)
- `target-size` (2.5.8 — nuevo en WCAG 2.2)
- `landmark-one-main` (1.3.1)
- `landmark-unique` (1.3.1)
- `region` (1.3.1)
- `heading-order` (1.3.1)
- `aria-allowed-attr` (4.1.2)
- `aria-required-attr` (4.1.2)
- `aria-valid-attr-value` (4.1.2)
- `button-name` / `link-name` (4.1.2)
- `form-field-multiple-labels` (3.3.2)
- `label` (3.3.2)
- `image-alt` (1.1.1)
- `html-has-lang`, `html-lang-valid` (3.1.1)
- `page-has-heading-one` (1.3.1)
- `bypass` (2.4.1 — skip link)

## 8. Próximos pasos sugeridos

- Programar pasada manual con NVDA y VoiceOver una vez al trimestre.
- Integrar el test `pages.test.ts` en el pipeline CI principal (hoy se ejecuta manualmente).
- Re-auditar cuando se introduzcan calculadoras nuevas o se modifique el sistema de colores.
