# Handoff — Diversificación del portafolio orgánico (post-W30)

> **Para la sesión ejecutora:** lee este documento completo antes de tocar
> archivos. Es un handoff de ejecución, no una autorización para cambios en
> bloque. La disciplina central de este trabajo es: **2–3 cambios bien
> diagnosticados por corte semanal, una variable por página, con before-state
> registrado**. Ocho ediciones especulativas en una semana hacen ilegible el
> siguiente corte GSC y destruyen la capacidad de aprender. Respeta los
> invariantes (§5) y los anti-patrones ya probados por evidencia (§6).

- **Creado:** 2026-07-27
- **Owner de decisión:** Carlos Ortega
- **Baseline de datos:** `output/operations/data-signals/gsc/2026-W30-*.json` (en repo)
- **Plan fuente:** `docs/backlog/PLAN-organic-growth-w28-2026-07-17.md`

---

## 1. Tesis y por qué

El tráfico orgánico de Monedario está **peligrosamente concentrado**: el conversor
UTM es ~82% de las impresiones, y tanto UTM como UF están **capados** (mercados de
dominios-exactos + demanda zero-click). Verificado por SERP:

- `utm a peso chileno` / `600 uf a pesos chilenos` → top-10 dominado por microsites
  EMD (`valor-utm.cl`, `valor-uf.cl`, `utmhoy.cl`, `calculadora-uf.cl`…). Monedario
  ni aparece en el top-10 de la cola de conversión de UF. **No accionable on-page.**

**Diversificar el portafolio** = que las **otras ~20 calculadoras + glosario +
guías** ganen su propio tráfico en queries winnable y menos competidas, en vez de
pelear contra los enjambres EMD. No es crear calculadoras nuevas (lo restringe
`docs/operations/runbooks/calculator-portfolio-policy.md`). Es hacer que el
inventario existente sea descubrible, rankeable y bien enlazado.

---

## 2. Estado actual (hecho y en `main`)

| Entregado | PR | Efecto |
|---|---|---|
| `audit:calculator-interlinks` (herramienta + 5 tests) | #334 | Detecta calculadoras sub-enlazadas de forma repetible |
| Linking a 4 calculadoras huérfanas/sub-enlazadas | #334, #337 | reajuste-arriendo 7→10, deposito-a-plazo 2→3, actualizador-inflacion 0→1, gratificacion-legal 0→1 |
| Cierre de OBS-01 (baseline de funnel validado W29/W30) | #354 | **Freeze del cohorte levantado**; retención desbloqueada |
| Revert de title `seguro-cesantia` (Simulador→Calculadora) | #354 | Recupera el término que convierte; medir a +28 días |
| `seoTitle` opcional en glosario + `renta-imponible` | #355 | Mecanismo reutilizable; title definicional para "qué es la renta imponible" |

**No repetir estos análisis** — están cerrados por evidencia (ver §6).

---

## 3. Herramientas y fuentes de verdad

| Necesitas | Comando / archivo |
|---|---|
| Calculadoras sub-enlazadas | `pnpm run audit:calculator-interlinks` (`--strict --min=<n>` para gate) |
| Striking-distance (pos 4-15) | `pnpm run audit:striking-distance` |
| Canibalización | `pnpm run audit:cannibalization` |
| Regenerar GSC fresco | `pnpm run data-signals:gsc:local -- --week=YYYY-Www` (creds en `.env.local`) |
| Override de title de glosario | campo `seoTitle` en el frontmatter (schema en `src/content.config.ts`, uso en `src/pages/glosario/[slug].astro`) |
| Auto-linker de glosario | `src/utils/injectGlossaryLinks.ts` + `src/components/GlossaryContentWrapper.astro` (hoy solo en posts vía `src/layouts/PostDetails.astro`) |

---

## 4. Workstreams priorizados por readiness

### WS-A — Titles definicionales del glosario · 🟡 LISTO (mecanismo existe)

**Qué:** las queries de glosario son mayormente definicionales ("qué es <term>")
y el title default (`<term> | Glosario Financiero`) no las targetea. El campo
`seoTitle` (#355) ya permite el override per-term.

**Pasos:**
1. Identificar términos calificados en el corte GSC más reciente: query
   definicional ("que es X", "cómo se calcula X", "diferencia…"), en pos 4-15,
   impresiones ≥ ~15, sobre una página `/glosario/`. Al 2026-W30 el único
   calificado era `renta-imponible` (ya hecho); revalidar cada corte.
2. Para cada calificado, redactar un `seoTitle` **gramaticalmente correcto con
   artículo** ("¿Qué es la Renta Imponible?…"), ≤ 70 chars, sin claim YMYL nuevo.
3. Una entrada por vez; registrar el before-state (pos/impr/clics de la query).

**Guardrail:** solo donde la data muestre demanda real; no aplicar "por si acaso"
a todo el glosario (sería el cambio-en-bloque prohibido).

**Éxito:** a +28 días, la query definicional sube de posición y gana clics.

### WS-B — Extender el auto-linker del glosario · 🔴 REQUIERE DISEÑO

**Qué (mayor apalancamiento de diversificación):** `injectGlossaryLinks` da
enlaces internos entrantes a los términos del glosario, pero **solo corre en posts**
(vía `PostDetails.astro`). La mayoría de términos están huérfanos (UF, IPC con 0
inbound editoriales). Correrlo en más superficies (guías, y con cuidado
calculadoras) daría equity a **todos** los términos de una vez.

**Diseño previo obligatorio (no implementar a ciegas):**
- ¿Dónde inyectar sin romper? Las calculadoras tienen labels de UI, resultados y
  claims YMYL. El auto-linker **no debe** inyectar dentro de inputs, resultados,
  ni afirmaciones financieras. Acotar a bloques de prosa explicativa
  (`MethodologyBlock`, secciones de contenido), no al widget.
- ¿Guías (`/guias/`) primero? Menor riesgo que calculadoras (son contenido).
- Límite de densidad (el auto-linker ya evita doble-inyección por término).
- Gates: `check:editorial`, `check:reader-facing-copy`, `test:a11y`, `build`
  (link-check), y verificación visual de que no se inyecta en UI.

**Éxito:** términos de glosario pasan de 0-2 a ≥3 inbound; suben en queries
definicionales.

### WS-C — Baseline de retención · 🔴 REQUIERE DISEÑO (recién desbloqueado)

**Qué:** OBS-01 cerró (#354) → el funnel first-party es válido desde W29
(`views > starts ≥ completes`). Se puede por fin medir retención/engagement, no
solo adquisición.

**Diseño previo:** definir 2-3 métricas honestas a partir de eventos agregados
existentes (no PII, ver `PLAN-calculator-led-growth-2026-06-28.md` §7): p. ej.
next-step CTR, completion rate por tool con muestra suficiente, share rate. Ojo:
son ratios de eventos, **no** cohortes de usuarios (no inventar "retención de
usuarios" sobre datos agregados).

### WS-D — Programa recurrente (el ritual) · ONGOING

Cada corte quincenal (ver `docs/operations/runbooks/weekly-search-performance-ritual.md`):
1. Regenerar GSC de la última semana completa.
2. Correr `audit:calculator-interlinks` + `audit:striking-distance` + `audit:cannibalization`.
3. Elegir **1–3** páginas calificadas por evidencia y aplicar el fix apropiado
   (linking, seoTitle, o refresh), una variable por página.
4. Registrar before-state; leer resultado a +28 días.

---

## 5. Invariantes a preservar

- `URL.PUBLIC.NO_POST_ID`, `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`,
  `FRONTMATTER.VALID`.
- `CONTRACT.YMYL_RESPONSE_STRUCTURE` + `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`:
  todo cambio de copy YMYL pasa por el pipeline editorial.
- `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`: no crear superficie nueva.
- OBS-01 está **cerrado** (freeze levantado), pero cambios de journey a las tools
  del cohorte deben medirse con cuidado; no encadenar varios en la misma ventana.

---

## 6. Anti-patrones (cerrado por evidencia — NO reabrir sin dato nuevo)

- **No optimizar los conversores UTM/UF on-page.** SERP-verificados como mercados
  EMD/zero-click; ya rankeamos ~6 (UTM) / fuera de top-10 (UF conversión). El techo
  es autoridad, no on-page.
- **No tocar `impuesto-segunda-categoria` por "2026".** Ya tiene 2026 en title +
  tabla vigente; el gap a pos 8.8 es autoridad/SERP-features.
- **No añadir el enlace interno #10** a una página que ya tiene 9 (p. ej.
  `prepago-credito`); el linking mueve la aguja en páginas **huérfanas** (0-2), no
  en las bien enlazadas.
- **No shippear cambios-token** para "hacer algo". Net-positive exige evidencia de
  que es positivo. Esta sesión sostuvo esa línea en P3, CWV, UTM y UF, y fue lo
  correcto cada vez.

---

## 7. Criterios de listo y de medición

- Cada cambio: una variable, before-state registrado (pos/impr/clics/CTR de la
  query o página objetivo desde el GSC del corte), y readout a **28 días**.
- Guardrails de build/gates verdes (`build`, `check`, `test`, y los específicos
  del área tocada).
- Si la muestra no alcanza para concluir, marcar `INCONCLUSIVE`, no `SUCCESS`.

---

## 8. Próximos pasos sugeridos (en orden)

1. **WS-B (auto-linker del glosario)** — mayor apalancamiento; empezar por el
   documento de diseño (dónde inyectar + guardrails) antes de código.
2. **WS-A** — aplicar `seoTitle` a los términos que califiquen en el próximo corte.
3. **WS-C** — diseñar el baseline de retención ahora que el funnel es válido.
4. Registrar este handoff en `docs/backlog/README.md` (tabla de planes vigentes).
