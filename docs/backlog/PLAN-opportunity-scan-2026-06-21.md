# PLAN — Scan estratégico de oportunidades (2026-06-21)

**Tipo:** Plan de implementación accionable + scorecard auto-verificable
**Estado:** ABIERTO
**Autor del scan:** Sesión de agente senior de producto/growth (2026-06-21)
**Naturaleza:** Búsqueda de oportunidades de alto ROI, **no** auditoría técnica (esa la cubre `/improve`).

> Este documento es **autocontenido y autosuficiente**: otra sesión puede ejecutarlo
> sin re-derivar contexto. Trae el análisis, la evidencia verificada en código, los
> ítems de implementación con criterios de aceptación, el protocolo de cierre y un
> scorecard que se recalcula solo contra el código real con
> `pnpm run scorecard:opportunities`.

---

## 0. Cómo usar este documento

1. Lee §1 (contexto), §2 (tesis) y §3 (hallazgos verificados) una sola vez.
2. Para trabajar un ítem, ve a §6 (catálogo OPP-01..OPP-16): trae archivos exactos,
   pasos, criterio de aceptación y el *check automático* que lo cierra.
3. Antes y después de implementar, corre `pnpm run scorecard:opportunities` para ver
   el estado real. Con `--write` reescribe el bloque AUTO del scorecard en este mismo
   archivo (§5).
4. Sigue el **protocolo de cierre** (§7) al terminar cada ítem.
5. Respeta el **gating YMYL**: ningún ítem marcado `Gated` puede publicarse sin
   pipeline editorial completo + sign-off humano de Carlos Ortega (ver
   `CLAUDE.md` hard-stops y `docs/editorial/NORMA_YMYL.md`).

**Restricción de priorización:** el cuello de botella del proyecto es el pipeline
YMYL + sign-off. Por eso los ítems están ordenados por **impacto × shippability**:
lo estructural/tooling (no toca cuerpos de artículo → no requiere sign-off) va
primero; el contenido gated va al final como brief.

**Sin acceso a GSC/keywords en esta sesión:** toda afirmación de volumen/competencia
está marcada como *hipótesis*. La priorización se ancla en **hechos verificables en
código** (alta confianza), no en estimaciones de tráfico.

---

## 1. Contexto del proyecto (lo mínimo para no re-derivar)

**Monedario** (monedario.cl) — sitio chileno de contenido financiero YMYL + calculadoras,
en Astro. Idioma `es-CL` (español neutral, sin voseo).

Inventario confirmado al 2026-06-21:

| Activo | Cantidad | Dónde vive |
|---|---|---|
| Calculadoras | 20 páginas | `src/pages/calculadoras/*.astro` (excl. `index`; + `src/components/calculator/`, `src/config/calculatorPortfolio.ts`) |
| Posts (blog) | 50 | `src/data/blog/*.{md,mdx}` |
| Términos de glosario | 54 | `src/data/glossary/*.md` → render en `src/pages/glosario/[slug].astro` |
| Leyes | 23 | `src/data/laws/*.md` → render en `src/pages/leyes/[slug].astro` |
| Hubs de guías navegables | 9 | `src/pages/guias/<cluster>/index.astro`; orden en `src/config/clusters.ts` (`GUIDE_HUB_ORDER`) |
| Hub dormido | 1 | `bancos-fintech` (scaffolded, `noindex`, fuera de `GUIDE_HUB_ORDER`) |

Datos económicos: snapshot autoactualizado por un **Worker de Cloudflare**
(`src/infrastructure/economic/economic-parameters.snapshot.json`), expuesto en
`src/pages/api/indicadores-hoy.json.ts`, widget `IndicadoresHoy.astro` (home) y página
`src/pages/guias/uf-costo-de-vida/indicadores-economicos.astro`. Indicadores
disponibles: UF, UTM, UTA, IPC, dólar, IMM (constante gestionada), topes AFC/previsionales.

Tooling de scripts: `scripts/*.mjs` (Node ESM), registrados en `package.json`
(`check:*`, `audit:*`). Tests: vitest + (Python) pytest. **Verificar build con
`pnpm run build` (incluye `astro check`) antes de declarar verde** — vitest no
type-checkea.

Gobernanza editorial: pipeline YMYL con separación de funciones; Gate 00 (topic-intake)
ya validó `bancos-fintech` (4.33) y `migrantes` (4.0) como "PROCEDER A BRIEF".

---

## 2. Tesis ejecutiva

La mayor oportunidad **no** es producir más contenido ni más calculadoras — el backlog
ya avanzó mucho (interés compuesto, depósito a plazo, IVA, save&compare, gratificación,
PGU, IGC y contribuciones ya existen). La oportunidad está en **activar valor latente
que ya existe pero está desconectado o dormido**:

1. **El grafo interno es asimétrico.** Los artículos enlazan al glosario (vía
   `injectGlossaryLinks`), pero las **54 páginas de glosario son terminales**: enlazan
   solo a otros términos, no a calculadoras/owners/leyes. Fuga directa de páginas/sesión
   y de autoridad. Se arregla sin tocar cuerpos YMYL.
2. **Hay un hub completo apagado** (`bancos-fintech`): scaffolded + validado por Gate 00,
   pero `noindex` y fuera de navegación. Terminar lo empezado rinde más que abrir frentes.
3. **Falta la capa de recurrencia:** no hay calendario financiero orientado al usuario
   ni datos históricos de UF/UTM/dólar, pese a que la infraestructura de datos
   autoactualizada ya pagó su costo.
4. **Hay un público de alta intención sin atender:** migrantes/extranjeros (validado por
   Gate 00), acotado a **mecánica financiera** (no a estatus migratorio).

En una frase: **conecta, expón y termina lo que ya tienes antes de crear lo nuevo.**

---

## 3. Hallazgos verificados en código (alta confianza)

Cada hallazgo trae el comando de verificación para reauditar en cualquier sesión.

| # | Hallazgo | Evidencia / comando |
|---|---|---|
| H1 | Glosario detalle = páginas terminales (0 enlaces a calc/posts/leyes) | `grep -cE "/calculadoras/\|/posts/\|/leyes/" src/pages/glosario/\[slug\].astro` → `0` |
| H2 | Enlazado unidireccional: artículo→glosario sí, glosario→contenido no | `injectGlossaryLinks.ts` existe; frontmatter de glossary solo tiene `term/shortDefinition/relatedTerms` |
| H3 | `bancos-fintech` dormido (noindex + fuera de GUIDE_HUB_ORDER) | `grep -n noindex src/pages/guias/bancos-fintech/index.astro` (línea 62); `clusters.ts` excluye `bancos-fintech` de `GUIDE_HUB_ORDER` |
| H4 | Freshness visible en solo 3/20 calculadoras | `grep -lE dateModified src/pages/calculadoras/*.astro` → conversor-uf, conversor-utm, iva |
| H5 | Solo 2/20 calculadoras sin link a contenido | `iva.astro`, `impuesto-segunda-categoria.astro` no contienen `/posts/` ni `/glosario/` |
| H6 | `conversor-uf` sin lookup por fecha pasada; no hay serie histórica | `conversor-uf.astro` solo muestra el valor vigente del snapshot |
| H7 | No existe calendario financiero orientado al usuario | No hay ruta `/calendario`; `seasonal-calendar-2026.md` es **editorial interno**, no página pública |
| H8 | Líquido→Bruto **ya existe** en sueldo-líquido (no proponer) | `sueldo-liquido.astro`: 'Usa el modo "Líquido → Bruto"…' |
| H9 | Cero contenido para migrantes/extranjeros (solo menciones incidentales) | `grep -ril "migrante\|extranjer\|remesa" src/data/blog` → menciones sueltas, sin owner |

Fuentes internas que alimentaron el scan (no re-leer salvo necesidad):
`docs/operations/reports/seo/calculator-opportunities-2026.md`,
`docs/operations/reports/seo/monedario-seo-opportunity-matrix-2026.md`,
`docs/operations/reports/seo/seasonal-calendar-2026.md`,
`docs/research/seo/strategy/topic_ownership_matrix.md`,
`docs/reports/ENGAGEMENT-SEO-IDEAS-2026-05-22.md`,
memorias `project_topic_intake_gate`, `project_cloudflare_worker_snapshot`,
`project_imm_managed_constant`, `project_seo_w24_ctr_freshness`.

---

## 4. Qué NO repetir (tres buckets de honestidad)

**A. Ya construido — no es oportunidad:** interés compuesto, depósito a plazo, IVA
(calculadoras), modo Líquido→Bruto, save&compare (piloto), cross-links "Qué sigue",
`dateModified` en artículos, auto-inyección de glosario, FAQs centralizadas; owners
gratificación / sueldo imponible / PGU / IGC / contribuciones.

**B. Conocido y scopeado pero ABIERTO (no es descubrimiento; el aporte es *cómo*
ejecutar/conectar):** calculadoras gratificación, vacaciones proporcionales, horas
extras, capacidad de endeudamiento, presupuesto mensual; clusters migrantes y
bancos-fintech (ambos ya logueados por Gate 00).

**C. Genuinamente nuevo en este scan (centro del plan):** enlaces salientes de glosario,
landing "UF/dólar hoy" reposicionada, calendario orientado a usuario, conversor UF a
fecha pasada, actualizador por inflación.

**No tocar como "oportunidad":** arquitectura, lint, refactors, estilos, deuda técnica
(→ `/improve`); "mejorar SEO" genérico; re-construir calculadoras ya hechas.

---

## 5. Scorecard

Estado de avance. El bloque **AUTO** lo recalcula `pnpm run scorecard:opportunities`
contra el código real (no driftea: verifica la realidad, no checkboxes). La tabla
**MANUAL** la actualiza la sesión a mano para los ítems gated por contenido YMYL.

<!-- SCORECARD:AUTO:START -->
<!-- Generado por scripts/scorecard-opportunities.mjs — no editar a mano este bloque.
     Corre: pnpm run scorecard:opportunities -- --write -->

_Última verificación automática: 2026-06-23._

**Avance:** 14/16 (88%) · verificables 14/14 · manuales 0/2

| Estado | ID | Oportunidad | Ventana | Evidencia |
|---|---|---|---|---|
| ✅ | OPP-01 | Enlaces salientes en glosario (término → calc/owner/ley) | 7d | template enlaza fuera: sí; términos con campos: 20/20 |
| ✅ | OPP-02 | Glosario index → "Herramientas relacionadas" | 7d | enlaces a /calculadoras/ en index: 5/3 |
| ✅ | OPP-03 | iva + impuesto-segunda-categoria: enlace a contenido | 7d | iva: ok; isc: ok |
| ✅ | OPP-04 | Freshness visible en calculadoras (dateModified) | 7d | calculadoras con dateModified: 22/22 (meta 18) |
| ✅ | OPP-05 | Calendario financiero /calendario (shell) | 14d | ruta /calendario presente |
| ✅ | OPP-06 | Landing "UF/dólar hoy" reposicionada | 14d | ruta nueva: src/pages/uf-hoy.astro |
| ✅ | OPP-07 | Dataset histórico UF/UTM/IPC versionado | 14d | dataset: src/data/economic-history/ipc-historico.json |
| ✅ | OPP-08 | Conversor UF a una fecha pasada | 30d | lookup por fecha presente |
| ✅ | OPP-09 | Actualizador por inflación (IPC) | 30d | src/pages/calculadoras/actualizador-inflacion.astro |
| ✅ | OPP-10 | Gráfico histórico UF/UTM/dólar | 30d | src/components/GraficoHistorico.astro |
| ✅ | OPP-11 | Calculadora de gratificación legal | 30d | ruta presente |
| ✅ | OPP-12 | bancos-fintech: quitar noindex + GUIDE_HUB_ORDER _(gated por OPP-13)_ | 14d | noindex retirado: sí; en GUIDE_HUB_ORDER: sí |
| ✅ | OPP-15 | Tooltips en links auto-inyectados de glosario | 14d | atributos de tooltip presentes |
| ✅ | OPP-16 | Página "Cómo usamos los datos" (trazabilidad) | 14d | página/sección de trazabilidad presente |

<!-- SCORECARD:AUTO:END -->

### Scorecard MANUAL (gated — actualizar a mano siguiendo §7)

| ID | Oportunidad | Gate | Estado |
|---|---|---|---|
| OPP-13 | bancos-fintech: auditoría del pilar + sign-off humano | Pipeline + sign-off | [x] Cerrado 2026-06-23 — pilar `bancos-y-fintech-chile` publicado con sign-off de Carlos Ortega (Gate 06 CONDITIONAL resuelto vía Opción A; G1–G17 firmados) |
| OPP-14 | Migrantes: brief pilar "abrir cuenta siendo extranjero" | Pipeline + sign-off | [x] Cerrado 2026-06-22 — pilar `finanzas-para-migrantes-chile` publicado con sign-off (commit 637260ca, PR #274) |

---

## 6. Catálogo de ítems de implementación

Leyenda: **Ventana** 7/14/30 días · **Gated** = requiere sign-off humano antes de
publicar · **Check automático** = lo que verifica el script para marcar el ítem cerrado.

### OPP-01 — Enlaces salientes en glosario (término → calculadora / owner / ley) ⭐
- **Tipo:** Interlinking · **Ventana:** 7d · **Gated:** No · **Confianza:** Alta (H1/H2)
- **Por qué:** 54 páginas terminales no empujan a calculadoras ni owners; es el ítem de
  mayor ROI/esfuerzo y no toca cuerpos YMYL.
- **Implementación:**
  1. Añadir al schema de glossary en `src/content.config.ts` campos opcionales:
     `relatedGuides`, `relatedCalculators`, `relatedLaws` (arrays de rutas internas).
  2. Poblar el frontmatter de los términos de mayor valor (empezar por: `afp`, `apv`,
     `uf`, `utm`, `iva`, `cae`, `dicom`, `tmc`, `finiquito`, `seguro-cesantia`,
     `global-complementario`, `gratificacion`, `indemnizacion`, `cuenta-rut`, `ipc`,
     `boleta-honorarios`, `fonasa`, `isapre`, `operacion-renta`, `renta-imponible`).
  3. Renderizar en `src/pages/glosario/[slug].astro` un bloque "Dónde se usa esto" con
     esos enlaces (calculadora + owner + ley relacionada).
- **Enlaces concretos sugeridos:** `afp`→`/calculadoras/comisiones-afp` + `/leyes/dl-3500-sistema-afp`;
  `apv`→`/calculadoras/apv` + `/posts/que-es-el-apv`; `uf`→`/calculadoras/conversor-uf`;
  `cae`→`/posts/cae-costo-real-credito-chile`; `dicom`→`/posts/donde-ver-si-estoy-en-dicom-gratis`;
  `iva`→`/leyes/dl-824-impuesto-renta` (o glosario/IVA cruzado).
- **Criterio de aceptación:** ≥20 términos con ≥1 enlace saliente curado; el template
  renderiza el bloque; `pnpm run build` exit 0; `pnpm run check:links` verde.
- **Check automático:** el template `[slug].astro` referencia `/calculadoras/`, `/posts/`
  o `/leyes/`, **y** ≥20 archivos en `src/data/glossary/` declaran algún campo
  `relatedGuides|relatedCalculators|relatedLaws`.

### OPP-02 — Glosario index → "Herramientas relacionadas"
- **Tipo:** Interlinking · **Ventana:** 7d · **Gated:** No · **Confianza:** Alta
- **Por qué:** `glosario/index.astro` hoy tiene 1 enlace `/guias/` y ninguno a calculadoras.
- **Implementación:** sección con 3–5 calculadoras top (sueldo-liquido, conversor-uf,
  comisiones-afp, credito-consumo, operacion-renta).
- **Criterio de aceptación:** index con sección de herramientas; build verde.
- **Check automático:** `src/pages/glosario/index.astro` contiene ≥3 enlaces `/calculadoras/`.

### OPP-03 — iva + impuesto-segunda-categoria: enlace a contenido
- **Tipo:** Interlinking · **Ventana:** 7d · **Gated:** No · **Confianza:** Alta (H5)
- **Por qué:** únicas 2 de 20 calculadoras sin link a contenido explicativo.
- **Implementación:** `iva.astro`→`/glosario/iva` + (ley `dl-824` si aplica);
  `impuesto-segunda-categoria.astro`→`/posts/como-calcular-sueldo-liquido` + `/glosario/impuesto-unico`.
- **Criterio de aceptación:** ambas páginas con ≥1 link a `/posts/` o `/glosario/`.
- **Check automático:** `iva.astro` **e** `impuesto-segunda-categoria.astro` contienen
  `/posts/` o `/glosario/`.

### OPP-04 — Freshness visible en calculadoras (`dateModified` + "actualizado el…")
- **Tipo:** Confianza · **Ventana:** 7d · **Gated:** No · **Confianza:** Alta (H4)
- **Por qué:** señal YMYL/confianza barata; infra ya existe (conversor-uf la tiene).
  Baseline 3/20. Alineado con memoria `project_seo_w24_ctr_freshness` (rollout pendiente).
- **Implementación:** propagar `dateModified` (fecha del snapshot o de revisión editorial)
  al JSON-LD de cada calculadora + texto visible "actualizado el…".
- **Criterio de aceptación:** ≥18/20 calculadoras con `dateModified` (baseline 3/20).
- **Check automático:** ≥18 archivos en `src/pages/calculadoras/*.astro` (excl. `index`)
  contienen `dateModified`.

### OPP-05 — Calendario financiero chileno `/calendario` (shell de recurrencia)
- **Tipo:** Hub/recurrencia · **Ventana:** 14d · **Gated:** No · **Confianza:** Media (H7)
- **Por qué:** recurrencia + "siguiente paso"; agrega owners existentes; mantención baja
  (fechas anuales). Datos de `seasonal-calendar-2026.md`.
- **Implementación:** página `/calendario` que liste hitos (Operación Renta, devolución,
  contribuciones Abr/Jun/Sep/Nov, reajuste sueldo mínimo Ene/Jul, pago PGU, aguinaldos)
  enlazando a su owner + calculadora. **Solo agrega; no duplica owners ni da guía nueva.**
- **Criterio de aceptación:** ruta `/calendario` indexable; cada hito enlaza a su owner;
  link en footer; build verde.
- **Check automático:** existe `src/pages/calendario.astro` o `src/pages/calendario/index.astro`.

### OPP-06 — Landing "UF/dólar hoy" reposicionada
- **Tipo:** Contenido/SEO · **Ventana:** 14d · **Gated:** No · **Confianza:** Media (hipótesis de volumen)
- **Por qué:** el snapshot existe pero vive enterrado en `/guias/uf-costo-de-vida/indicadores-economicos`.
  La caución previa "evitar 'hoy' sin auto-update" (seasonal doc) **se levanta** porque el
  Worker de Cloudflare ya autoactualiza. Diferenciación: capa "qué significa para tu bolsillo" + links a calculadoras.
- **Implementación:** ruta limpia (p. ej. `/uf-hoy` o `/indicadores/`) reusando el snapshot,
  con narrativa de impacto + cross-links. Reconciliar con la página existente (canonical/redirect, no duplicar).
- **Criterio de aceptación:** ruta nueva con valor vivo + fecha + fuente + ≥2 links a calculadoras;
  sin duplicar contenido (canonical correcto); build verde.
- **Check automático:** existe una ruta nueva cuyo nombre matchea `/uf-hoy|indicadores/i`
  bajo `src/pages/` distinta de la guía existente.

### OPP-07 — Dataset histórico UF/UTM/IPC versionado
- **Tipo:** Infra de datos · **Ventana:** 14d · **Gated:** No · **Confianza:** Media
- **Por qué:** habilita OPP-08, OPP-09 y OPP-10. Fuente: mindicador.cl / Banco Central / INE.
- **Implementación:** ingerir serie histórica a un dataset versionado (p. ej.
  `src/data/economic-history/`), con nota de fuente y fecha. Es **anexar**, no recalcular
  (mantención baja).
- **Criterio de aceptación:** dataset histórico presente y consumible; test de integridad mínima.
- **Check automático:** existe `src/data/economic-history/` (o archivo cuyo nombre matchee
  `histor` bajo `src/data/`) con contenido.

### OPP-08 — Conversor "UF/UTM a una fecha pasada"
- **Tipo:** Herramienta · **Ventana:** 30d · **Gated:** No · **Confianza:** Alta (gap H6)
- **Por qué:** "¿cuánto valía la UF el [fecha]?" para contratos, finiquitos, reliquidaciones,
  demandas. Long-tail "valor uf [fecha/año]".
- **Implementación:** extender `conversor-uf` (o nueva tool) con input de fecha contra el
  dataset de OPP-07.
- **Criterio de aceptación:** input de fecha funcional; devuelve valor a esa fecha + equivalencia;
  tests de borde (fecha sin dato, fuera de rango).
- **Check automático:** `conversor-uf.astro` o su componente contiene un input de fecha
  (`type="date"`) o referencia a lookup histórico (`fecha`/`valorAFecha`/`historic`).

### OPP-09 — Actualizador por inflación / poder adquisitivo
- **Tipo:** Herramienta · **Ventana:** 30d · **Gated:** No · **Confianza:** Media (novel)
- **Por qué:** "¿cuánto serían $X de [año] hoy?" — evergreen, especificidad chilena (IPC INE),
  sin owner. Reusa la ingesta de OPP-07.
- **Implementación:** calculadora monto + año origen → equivalente hoy por IPC acumulado +
  nota metodológica de empalme de bases (patrón `interes-compuesto-nota-metodologica`).
- **Criterio de aceptación:** tool publicada con nota metodológica; tests de empalme; enlaza a
  `/posts/que-es-el-ipc-chile-como-se-calcula`.
- **Check automático:** existe en `src/pages/calculadoras/` un archivo cuyo nombre matchea
  `inflacion|actualizador|poder-adquisitivo`.

### OPP-10 — Gráfico histórico UF/UTM/dólar en la landing
- **Tipo:** Recurrencia/engagement · **Ventana:** 30d · **Gated:** No · **Confianza:** Media
- **Por qué:** long-dwell + backlinks de devs (data feed). Sobre el dataset de OPP-07.
- **Implementación:** componente de gráfico en la landing de OPP-06.
- **Criterio de aceptación:** gráfico renderiza la serie; accesible (texto alternativo/tabla); build verde.
- **Check automático:** existe un componente cuyo nombre matchea `chart|grafico` que
  consume la serie histórica.

### OPP-11 — Calculadora de gratificación legal
- **Tipo:** Herramienta · **Ventana:** 30d · **Gated:** No · **Confianza:** Alta (datos listos)
- **Por qué:** alta intención; owner ya existe (`gratificacion-legal-chile`); IMM ya es
  constante gestionada (memoria `project_imm_managed_constant`) → cero dependencia externa nueva.
- **Implementación:** sueldo + modalidad (25% topado a 4,75 IMM vs % utilidades) → estimación + tope.
  Reusar `GRATI_CAP`/`IMM_MENSUAL` ya presentes en `sueldo-liquido`.
- **Criterio de aceptación:** ruta `/calculadoras/gratificacion-legal`; tests de tope/borde;
  enlaza a owner; disclaimer estándar.
- **Check automático:** existe `src/pages/calculadoras/gratificacion-legal.astro`.

### OPP-12 — bancos-fintech: quitar noindex + sumar a GUIDE_HUB_ORDER
- **Tipo:** Hub · **Ventana:** 14d · **Gated:** Sí (depende de OPP-13) · **Confianza:** Alta (H3)
- **Por qué:** hub completo dormido con tema validado. **No ejecutar hasta cerrar OPP-13.**
- **Implementación:** quitar `<meta name="robots" content="noindex,follow">` del hub; mover
  `bancos-fintech` de `Exclude` a `GUIDE_HUBS` + `GUIDE_HUB_ORDER` en `clusters.ts` (ver
  `docs/adr/ADR-20260617-bancos-fintech-hub.md`).
- **Criterio de aceptación:** hub indexable + en navegación; `audit:topic-overlap` sin
  canibalización nueva; build verde; ADR actualizado.
- **Check automático:** `bancos-fintech/index.astro` **no** contiene `noindex` **y**
  `clusters.ts` incluye `bancos-fintech` en `GUIDE_HUB_ORDER`.

### OPP-13 — bancos-fintech: auditoría del pilar + sign-off (MANUAL/GATED)
- **Tipo:** Proceso editorial · **Gated:** Sí · **Confianza:** Alta
- **Por qué:** prerrequisito de OPP-12; el hub está `noindex` hasta pasar auditoría + sign-off.
- **Implementación:** abrir el packet de auditoría del pilar; recorrer pipeline; obtener
  sign-off humano de Carlos Ortega.
- **Criterio de aceptación:** gates de `07-publish-packet` firmados por el editor humano.
- **Cierre:** manual en el scorecard MANUAL (§5) — el script no lo verifica.

### OPP-14 — Cluster migrantes: brief pilar (MANUAL/GATED)
- **Tipo:** Contenido · **Gated:** Sí · **Confianza:** Media (validado Gate 00, H9)
- **Por qué:** audiencia validada, dolor real, cero competidor claro. **Acotar a mecánica
  financiera** (abrir cuenta siendo extranjero, RUT/CuentaRUT, cotizar sin residencia
  definitiva, costo de remesas, acceso a crédito sin historial). **NO** asesoría de estatus migratorio.
- **Implementación:** brief de 1 pilar ("abrir cuenta bancaria siendo extranjero en Chile")
  por el pipeline editorial; entra a redacción solo tras Gate 02.
- **Criterio de aceptación:** brief aprobado; pieza publicada con sign-off.
- **Cierre:** manual en el scorecard MANUAL (§5).

### OPP-15 — Tooltips en links de glosario auto-inyectados
- **Tipo:** Interlinking/UX · **Ventana:** 14d · **Gated:** No · **Confianza:** Media
- **Por qué:** el auto-inject no lleva la definición hover; solo los manuales
  (`GlossaryInlineLink`). Cerrar la asimetría (notado en `ENGAGEMENT-SEO-IDEAS`).
- **Criterio de aceptación:** links auto-inyectados muestran definición en hover/focus accesible.
- **Check automático:** `src/utils/injectGlossaryLinks.ts` o el wrapper emite atributos de
  tooltip (`title`, `data-tooltip`, `aria-describedby`) en los links auto-inyectados.

### OPP-16 — Página "Cómo usamos los datos" (trazabilidad)
- **Tipo:** Confianza · **Ventana:** 14d · **Gated:** No · **Confianza:** Media
- **Por qué:** refuerza E-E-A-T sin burocracia; explica origen de UF/UTM/dólar
  (mindicador/BCN/Worker), fecha y fallback.
- **Implementación:** página enlazada desde indicadores y calculadoras con valores vivos.
- **Criterio de aceptación:** ruta nueva publicada y enlazada desde ≥2 superficies con dato vivo.
- **Check automático:** existe una ruta cuyo nombre matchea `datos|fuentes|trazabilidad`
  bajo `src/pages/` (o sección dedicada en `metodologia.astro`).

---

## 7. Protocolo de cierre (cómo se mantiene el scorecard)

Al implementar un ítem:

1. **Antes:** corre `pnpm run scorecard:opportunities` para ver el estado base.
2. Implementa el ítem cumpliendo su **Criterio de aceptación**.
3. **Verifica build:** `pnpm run build` (exit 0) — vitest no type-checkea.
4. **Recalcula y escribe:** `pnpm run scorecard:opportunities -- --write`. El script
   reescribe el bloque AUTO de §5 con el estado real. Si tu ítem es code-verificable y
   quedó verde, se cierra solo aquí.
5. **Ítems gated (OPP-13, OPP-14):** el script no los verifica. Marca `[x]` a mano en la
   tabla MANUAL de §5 **solo** cuando exista sign-off humano.
6. **Cierre definitivo del plan:** cuando AUTO marque 100% de los verificables **y** ambos
   manuales estén `[x]`, cambia el `Estado` del encabezado a `CERRADO` y archiva el doc
   según `docs/backlog/README.md`.

> Regla anti-drift: nunca marques verde un ítem code-verificable a mano. El script es la
> fuente de verdad; si el check no pasa, el ítem no está hecho.

---

## 8. Anti-prioridades (no hacer todavía)

- Remesas con **tasas en vivo** (mantención + riesgo reputacional) → usar comparación/checklist estática.
- Páginas **programáticas de comparación** (thin content) → requieren primero el dataset de OPP-07.
- **Email capture / push** (consentimiento + infra delicada).
- Cluster **vivienda** (arriendo vs comprar) → solapa clusters, sin owner decidido.
- Re-construir calculadoras ya hechas (interés compuesto, depósito a plazo, IVA, Líquido→Bruto).
- "UF hoy" como **widget desnudo** sin capa editorial "qué significa".
- Tocar cuerpos de artículos YMYL en sprints "rápidos" (gated por pipeline + sign-off).

---

## 9. Plan 7 / 14 / 30 días (por shippability)

- **Días 1–7 (ship sin sign-off):** OPP-01, OPP-02, OPP-03, OPP-04. Verificar build antes de mergear.
- **Días 8–14 (tooling + desbloqueo):** OPP-07 (dataset), OPP-06 (landing), OPP-05 (calendario),
  OPP-15, OPP-16; **abrir** OPP-13 (auditoría bancos-fintech). OPP-12 solo tras OPP-13.
- **Días 15–30 (herramientas nuevas + contenido gated):** OPP-08, OPP-09, OPP-10, OPP-11;
  **brief** OPP-14 (migrantes) por el pipeline.

---

## 10. Referencias

- Scan original + decisiones: memoria `project_opportunity_scan_2026-06-21`.
- Convención de scripts: `scripts/*.mjs` registrados en `package.json`.
- Gating YMYL: `CLAUDE.md` (hard-stops), `docs/editorial/NORMA_YMYL.md`,
  `context/EDITORIAL_AI_PIPELINE.md`.

---

## Apéndice A — Experimentos de crecimiento (diseño de medición)

> **Fuera del scorecard puntuado** a propósito: el scorecard mide *envío* (¿se
> implementó?), no *resultado* (¿funcionó?). Estos experimentos son la capa de
> medición que se activa **después** de enviar el OPP correspondiente. Sin acceso a
> GSC en esta sesión, las métricas de tráfico son hipótesis a validar con datos reales.

| ID | Mapea a | Hipótesis | Implementación mínima | Métrica | Duración | Criterio de éxito | Criterio de descarte |
|---|---|---|---|---|---|---|---|
| E1 | OPP-01 | Añadir 1–3 enlaces salientes por término sube páginas/sesión desde glosario y CTR glosario→calculadora | Bloque "Dónde se usa" en el template | Páginas/sesión en rutas `/glosario/*`; clics a calculadoras | 4 semanas | +15% páginas/sesión desde glosario | Sin movimiento a 4 semanas |
| E2 | OPP-06 | Una landing limpia de intención "hoy" (no enterrada en `/guias/uf-costo-de-vida/…`) capta recurrencia | Nueva URL reusando el snapshot + capa "qué significa" | Impresiones/clics a la nueva URL; usuarios recurrentes (hipótesis GSC) | 6–8 semanas (indexación) | Tendencia de impresiones al alza | Sin indexación útil a 8 semanas |
| E3 | OPP-05 | `/calendario` enlazado en footer sube returning users y distribuye a owners estacionales | Shell `/calendario` + link en footer | Returning users a la URL; CTR a owners | Un ciclo estacional (OR mar–may) | La URL aparece como entry recurrente | Tráfico plano fuera de temporada y sin clics a owners |
| E4 | OPP-12 / OPP-13 | El hub bancos-fintech validado indexa y capta demanda no atendida | Lanzar hub (post sign-off) | Páginas indexadas; impresiones del cluster | 8–12 semanas | Indexación + impresiones crecientes | Canibalización con deuda-credito (vigilar con `audit:topic-overlap`) |

---

## Apéndice B — Interlinking completo (origen → destino → anchor → motivo)

Tabla completa de enlaces internos nuevos/mejores. OPP-01/OPP-02/OPP-03 cubren el
grueso; esta tabla es la lista accionable fila por fila.

| Origen | Destino | Anchor sugerido | Motivo |
|---|---|---|---|
| glosario/afp | /calculadoras/comisiones-afp | "Compara comisiones de AFP" | Término terminal → herramienta de alta intención |
| glosario/afp | /leyes/dl-3500-sistema-afp | "DL 3.500 (sistema de AFP)" | Glosario no enlaza a leyes existentes |
| glosario/apv | /calculadoras/apv + /posts/que-es-el-apv | "Calcula tu beneficio APV" | Empujar a tool + owner |
| glosario/uf | /calculadoras/conversor-uf | "Convierte UF a pesos" | Recurrencia + utilidad |
| glosario/cae | /posts/cae-costo-real-credito-chile | "Costo real del crédito (CAE)" | Concepto → owner |
| glosario/dicom | /posts/donde-ver-si-estoy-en-dicom-gratis | "Consulta tu DICOM gratis" | Concepto → trámite |
| glosario/cuenta-rut | (futuro) hub bancos-fintech | "Cuentas y bancos en Chile" | Activa el hub al lanzarlo (OPP-12) |
| glosario/index | /calculadoras/ (top 5) | "Herramientas relacionadas" | Index casi sin salida a tools (OPP-02) |
| /calculadoras/iva | /glosario/iva + /leyes/dl-824 | "Qué es el IVA" | 1 de 2 calc sin link a contenido (OPP-03) |
| /calculadoras/impuesto-segunda-categoria | /posts/como-calcular-sueldo-liquido, /glosario/impuesto-unico | "Cómo se calcula el impuesto" | 1 de 2 calc sin link a contenido (OPP-03) |
| owners estacionales (OR, contribuciones, PGU) | /calendario | "Ver calendario financiero" | Alimenta el hub de recurrencia (OPP-05) |

> Patrón general: el enlazado hoy es **unidireccional** (artículo→glosario vía
> `injectGlossaryLinks`). Hacerlo bidireccional (glosario→artículo/calculadora/ley) es la
> acción de mayor ROI/esfuerzo del plan y no requiere sign-off YMYL.

---

## Apéndice C — Specs de herramientas nuevas

Detalle de inputs/outputs/fuente/métrica para las herramientas de §6 (complementa los
criterios de aceptación; **no** repite calculadoras ya construidas).

### C.1 — Conversor UF/UTM a una fecha pasada (OPP-08)
- **Problema:** "¿cuánto valía la UF el [fecha]?" para contratos, finiquitos,
  reliquidaciones, demandas.
- **Inputs:** fecha, monto (UF↔CLP). **Outputs:** valor del indicador a esa fecha +
  equivalencia.
- **Fuente/fórmula:** serie histórica UF/UTM (mindicador.cl / Banco Central). Requiere
  ingerir y versionar la serie (OPP-07).
- **Páginas relacionadas:** que-es-la-uf, reajuste-arriendo, dividendo-hipotecario.
- **Riesgo:** dependencia de dato histórico (mantenible: se anexa, no se recalcula). Bajo YMYL.
- **Métrica de éxito:** entradas orgánicas a long-tail "valor uf [fecha/año]"; uso del input fecha.

### C.2 — Actualizador por inflación / poder adquisitivo (OPP-09)
- **Problema:** "¿cuánto serían $X de [año] en pesos de hoy?" — evergreen, sin owner.
- **Inputs:** monto, año/mes origen, (opcional) año destino. **Outputs:** monto
  actualizado + % acumulado.
- **Fuente/fórmula:** serie IPC empalmada (INE). Reusa la ingesta de OPP-07; nota
  metodológica de empalme de bases (patrón `interes-compuesto-nota-metodologica`).
- **Páginas relacionadas:** que-es-el-ipc, que-es-la-uf, reajuste-arriendo.
- **Riesgo:** bajo. **Métrica de éxito:** sesiones a la herramienta; long-tail "cuánto es X pesos de [año] hoy".

### C.3 — Calculadora de gratificación legal (OPP-11)
- **Problema:** "¿cuánto me corresponde de gratificación?" — alta intención; owner ya existe.
- **Inputs:** sueldo, modalidad (25% topado vs % utilidades). **Outputs:** estimación + tope (4,75 IMM).
- **Fuente/fórmula:** Código del Trabajo art. 50; **IMM ya es constante gestionada** en el
  repo (cero dependencia externa nueva). Reusar `GRATI_CAP`/`IMM_MENSUAL` de `sueldo-liquido`.
- **Páginas relacionadas:** gratificacion-legal-chile (owner), sueldo-liquido.
- **Riesgo:** medio (laboral); disclaimer estándar. **Métrica de éxito:** uso de la
  calculadora; clics desde el owner.

> **Anti-recomendación de tool:** calculadora de **remesas con tasas en vivo** — descartar
> (rates volátiles = mantenimiento + riesgo). Para migrantes (OPP-14), usar
> comparación/checklist estática, no cálculo live. Ver §8.
