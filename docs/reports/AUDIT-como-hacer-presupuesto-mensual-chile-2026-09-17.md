# Auditoría adversarial — como-hacer-presupuesto-mensual-chile (2026-09-17)

**Slug:** `como-hacer-presupuesto-mensual-chile`
**Archivo:** `src/data/blog/como-hacer-presupuesto-mensual-chile.md`
**Tipo:** read-only. No se editó ningún archivo existente. Único output: este reporte.
**Fecha de auditoría:** 2026-09-17.
**Frontmatter:** `pubDate 2026-03-03` / `updatedDate 2026-04-08` (162 días de antigüedad; vence 2026-10-05).
**Veredicto:** **FINDINGS — 0 alta / 1 media / 5 baja (6 hallazgos). 2 NEEDS-HUMAN-VERIFY.**
**Riesgo regulatorio del tópico:** bajo (educación financiera metodológica, sin umbrales legales,
trámites ni procedimientos). Severidades calibradas en consecuencia: ningún hallazgo bloquea
por riesgo YMYL duro, pero F1 es una cifra falsa viva en producción.

## 1. Frontmatter y señales de frescura (inventario)

| Campo | Valor | Observación |
|---|---|---|
| `title / seoTitle` | "Presupuesto mensual en Chile: método práctico sin plantilla mágica" | OK, sin cifras que heredar error |
| `description` | Guía de clasificación de ingresos/gastos, fugas y hábitos | OK (sin warning de longitud en gate) |
| `pubDate / updatedDate` | 2026-03-03 / 2026-04-08 | Ver §4: la revisión del 2026-04-08 es posterior a la re-tarificación del SOAP por Ley Jacinta (feb–mar 2026) y no detectó F1 |
| `category / cluster` | `general / presupuesto-control-financiero` | OK |
| `topicRole / canonicalTopic` | `owner / presupuesto-mensual-control-financiero` | OK. Cluster de 2 artículos, cada uno `owner` de un `canonicalTopic` distinto (el otro: `fondo-emergencia-chile` → `fondo-emergencia-colchon`). Coherente con el patrón del corpus (mayoría de topics con 1–2 artículos; solo 5 topics tienen 2). Sin conflicto de ownership |
| `heroImage` | `/images/hero/como-hacer-presupuesto-mensual-chile.avif` | OK: existen base + `@mobile` + `@tablet` en `public/images/hero/` |
| `articleAdvisory` | "Contenido educativo; las proporciones y ejemplos deben ajustarse…" | OK, veraz y bien calibrado |
| `articleLead / validAsOf` | **ausentes** | Ver F3: corrección a la premisa — 13/53 artículos del corpus carecen de `validAsOf`, no es el único |
| `volatileData` | ausente | Aceptable (sin datasets volátiles; ver F1 para la excepción-precio) |
| `reviewPolicy` | `semiannual / maxDays 180`, `dataTriggers: []`, `computedAt 2026-05-06` | Triggers vacíos razonables para contenido metodológico; `derivationFactors: registry:categoryPolicies.general` |
| Timeliness gate | `reviewDate 2026-04-08, dueDate 2026-10-05, stale false, daysUntilDue 18, sourceMode manual_review, hasOfficialSources false` | El gate **no penaliza** el `validAsOf` ausente: cae a `manual_review` con `reviewDate=updatedDate` y reporta `stale=false`. La ausencia es invisible para el gate (brecha de proceso, F3) |

## 2. Checklist NORMA_YMYL v1.0 (calibrada a tópico de bajo riesgo)

| Requisito | Estado |
|---|---|
| MUST 1 Respuesta ancla ≤ 2 pantallas con regla concreta | Cumple en forma (regla 50/30/20 cuantificada al inicio) |
| MUST 2 Regla afirmativa | Cumple ("destinar hasta un 50%… al menos un 20%…", con hedge explícito de que no es obligación) |
| MUST 3 Vigencia explícita | **Falla** (F4): ningún corte/vigencia visible en el cuerpo; el bloque ancla no trae línea de Vigencia |
| MUST 4 ≥1 fuente oficial por regla crítica | Cumple parcial: sección "Fuentes y recursos oficiales" con 3 links (todos HTTP 200, ver §5). Pero son genéricos de portada, no anclan ninguna afirmación; la única cifra-producto del artículo (SOAP, F1) va sin fuente |
| MUST 5 Excepciones relevantes | Cumple bien (tabla "Adapta el método a tu realidad" + casos arriendo alto / deuda cara / ingresos variables) |
| MUST 6 Separar aprobación / vigencia / implementación | N/A (sin narrativa de reforma) |
| MUST 7 Síntesis etiquetada "resumen orientativo" | Cumple en forma pero **duplicada y una instancia desubicada** (F5) |
| MUST 8 Coherencia interna | **Falla leve** (F1–mes, F6): ejemplo SOAP con mes incorrecto; deriva de buckets fijo/variable vs necesidad/deseo |
| MUST 9 Frontmatter y frescura | **Falla parcial** (F3): sin `validAsOf`; `updatedDate` coherente con última revisión real |
| SHOULD ejemplo numérico | Cumple (aritmética verificada: $150.000/12 = $12.500 exacto; $30.000×12 = $360.000 exacto — el método es correcto, el insumo de F1 no) |
| SHOULD interlinking | Cumple: 5 links internos, todos resuelven (gate §8: 0 rotos en 268) |

## 3. Tabla de hallazgos

| # | Afirmación + ubicación | Sev. | Evidencia / URL o NEEDS-HUMAN-VERIFY | Fix sugerido |
|---|---|---|---|---|
| F1 | "si el SOAP te cuesta $150.000 en octubre, reserva $12.500/mes" (L144) | media | **Cifra falsa por ~11–20x.** Primaria SERNAC (recuperada 2026-09-17): "en el caso de los autos, desde $10.000, hasta $13.500" — `https://www.sernac.cl/portal/607/w3-article-1448.html`. Mercado 2026 post-Ley Jacinta (coberturas duplicadas a 600 UF): autos $5.760–$13.990 según ComparaOnline/Chócale (`https://chocale.cl/2026/02/soap-2026-mas-barato-precios-del-seguro-obligatorio-con-ley-jacinta/`, `https://www.latercera.com/mtonline/noticia/soap-2026-diferencias-de-precio-llegan-a-43-en-camionetas-y-furgones/`). $150.000 nunca fue precio SOAP: equivale a ~15–20 pólizas anuales. El lector que sigue el ejemplo sobre-reserva ~$140.000/año. Calibración: media y no alta porque el marco es condicional ("si te cuesta") y el método (prorrateo) es correcto; pero es un producto obligatorio y el ancla deforma el presupuesto que el artículo enseña a construir | Reemplazar por cifra realista fechada ("un SOAP de auto 2026 ronda $8.000–$10.000 según SERNAC/comparadores; reserva ~$700–$850/mes") con URL + fecha de recuperación, o eliminar la cifra y dejar solo la fórmula. NHV-1 antes de fijar el número |
| F2 | "…en octubre" para el SOAP (L144, mismo ejemplo) | baja | **Mes incorrecto.** SERNAC (misma página primaria): "cuando deba renovar su permiso de circulación lo primero que le van a pedir será la Revisión Técnica… y el SOAP". El ciclo SOAP/permiso vence el 31 de marzo (ComparaOnline vía La Tercera 2026-02-04: "El plazo para realizar el pago del SOAP 2026 es el martes 31 de marzo"). Octubre no corresponde a ningún hito del SOAP; la revisión técnica sí varía por dígito de patente, pero el ejemplo nombra el SOAP | Cambiar "en octubre" por "en marzo (junto al permiso de circulación)" |
| F3 | Sin `validAsOf` / sin `articleLead`; `hasOfficialSources: false` pese a sección de fuentes | baja | **Premisa del encargo corregida:** no es "el único sin validAsOf": 13/53 artículos carecen de él (lista en §5) y 13/53 tienen `hasOfficialSources=false`. Brecha de proceso real pero transversal, no singular. El gate de timeliness lo invisibiliza (`sourceMode manual_review`, `stale=false`). Las 3 fuentes del cuerpo son portadas institucionales sin ancla a afirmación, por eso el gate no las cuenta | **Backfill de `validAsOf`: sí, warranted** (barato, alinea con 40/53 del corpus). Fijar `validAsOf = 2026-09-17` solo si el refresh corrige F1–F2; si no, fijarlo a la próxima revisión real. Estructurar las 3 fuentes a `articleLead.officialSources` para que el gate las cuente |
| F4 | Sin línea de vigencia/corte visible en el cuerpo; bloque ancla sin "Vigencia" ni "Fuente(s)" (L33–L35) | baja | NORMA §2.3 exige plantilla "Respuesta rápida + Excepción + Vigencia + Fuente(s)". El artículo trae respuesta + excepción/hedge pero omite vigencia y fuente. Tópico sin calendario legal, por lo que el costo es trazabilidad, no riesgo de vencimiento silencioso | Agregar bajo la respuesta rápida: "**Vigencia:** referencia metodológica sin vencimiento legal; cifras-ejemplo a [validAsOf]. **Fuente(s):** CMF Educa / SERNAC." |
| F5 | Bloque "Resumen orientativo" idéntico duplicado (L41 y L102) | baja | L41 ("patrones de gasto…") precede a la sección de fallas — encaja. L102 repite el texto literal antes del Paso 4 (fugas), donde no hay "patrones de gasto descritos a continuación" sino una lista de fugas: copy-paste desubicado que degrada la señal de etiquetado que NORMA §3 pide | Eliminar L102 (conservar L41) o redactar uno específico para fugas |
| F6 | Deriva de buckets: ancla "hasta 30% a gastos variables (alimentación, ocio)" (L33–L35) vs Paso 5 "30% a deseos" (L117) con alimentación básica en "No negociables" (L83) | baja | Tensión interna leve: el ancla mete la alimentación en el bucket del 30% mientras la tabla de prioridad la declara no negociable (bucket del 50%). No es contradicción dura (la alimentación tiene porción básica y porción variable), pero el lector que suma buckets obtiene dos clasificaciones para el mismo gasto | Alinear redacción: "hasta 30% a variables y deseos (porción ajustable de alimentación, ocio…)" y nota de que la alimentación básica vive en necesidades |

## 4. Freshness assessment al 2026-09-17

**Contenido metodológico estable; un ejemplo numérico falso desde el día uno.**
Lo verificado como correcto y estable: regla 50/30/20 correctamente hedgeada como heurística
(no norma legal, con `articleAdvisory` concordante); fondo de emergencia 3–6 meses consistente
con el artículo hermano `fondo-emergencia-chile` (owner de `fondo-emergencia-colchon`);
aritmética de prorrateo exacta; menciones institucionales existence-level correctas
(TAG/telepeaje, AFP, Fonasa, CAE, revisión técnica, permiso de circulación);
herramientas existen (Fintual verificado HTTP 200); "colegio particular subvencionado" es
categoría vigente; arriendo 40–50% formulado como posibilidad, no como estadística.

Lo roto: **F1 era falso ya a `pubDate` 2026-03-03** (el SOAP jamás costó $150.000) y **la
revisión `updatedDate` 2026-04-08 tampoco lo detectó**, pese a ser posterior a la
re-tarificación del SOAP por Ley Jacinta (feb–mar 2026, alzas +43–58% en autos que la prensa
documentó). El gate (`dueDate 2026-10-05`, 18 días, `stale=false`) mide edad, no verdad —
mismo patrón transversal de los pilotos hermanos. Con F1–F2 corregidos, el artículo queda
apto hasta su vencimiento natural semestral; sin corrección, el vencimiento real es hoy,
no el 2026-10-05.

## 5. Verificaciones de pie (resuelven OK)

- **SOAP falsedad VERIFICADA en primaria:** SERNAC, "Cómo elegir el seguro de accidentes
  personales": autos $10.000–$13.500; cobertura idéntica por ley; SOAP exigido al renovar el
  permiso de circulación — `https://www.sernac.cl/portal/607/w3-article-1448.html`
  (recuperado 2026-09-17). Mercado 2026: autos $5.760–$13.990 (ComparaOnline/Chócale/Autofact).
- **Links oficiales del artículo (curl, 2026-09-17):** `cmfeduca.cl/educa/` 200,
  `sernac.cl/` 200, `bcentral.cl/` 200 (el fetch de contenido de BCentral volvió vacío —
  sitio JS-heavy; el link como portada de referencia es válido). Nota: `cmfeduca.cl/educa/`
  resolvió con branding legacy "SVS Educa" en el título — tema del sitio fuente, no del artículo.
- **Links internos:** 5/5 resuelven (`/posts/como-calcular-sueldo-liquido/`,
  `/posts/primer-empleo-chile-guia-completa/`, `/posts/fondo-emergencia-chile/`,
  `/guias/presupuesto-control-financiero/` — directorio existe en `src/pages/guias/` —,
  `/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/`); todos con
  trailing slash; gate: 0 rotos en 268.
- **Hero:** base + `@mobile` + `@tablet` existen en `public/images/hero/`.
- **Sin propagación:** `rg 'SOAP'` solo halla este artículo; los demás `$150.000` del corpus
  (tasación/notaría/colación) son de otros artículos y plausibles.
- **Sin `validAsOf` (13 slugs):** `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026`,
  `como-cambiarse-de-afp`, `como-hacer-presupuesto-mensual-chile`, `como-invertir-en-etfs-desde-chile`,
  `estafas-financieras-chile-vishing-smishing-marketplace`, `fondos-mutuos-comisiones-rescate-impuestos`,
  `fraude-tarjeta-que-hacer`, `interes-compuesto-nota-metodologica`,
  `licencia-medica-desde-que-dia-pagan`, `que-es-el-ipc-chile-como-se-calcula`, `que-es-la-uf`,
  `reajuste-arriendo-uf-ipc-chile`, `suplantacion-identidad-creditos-no-reconocidos`.

## 6. NEEDS-HUMAN-VERIFY (2)

- **NHV-1.** Cifra de reemplazo para F1: pinchar el estudio anual de precios SOAP de SERNAC
  (o estadística CMF) vigente a la fecha del refresh para autos/station wagon, con URL + fecha
  de recuperación, antes de fijar el nuevo ejemplo. Base actual: banda de mercado 2026
  $5.760–$13.990 (secundarios convergentes); falta el primario fechado 2026.
- **NHV-2 (informativo, no bloqueante).** Mención "créditos estudiantiles CAE" (L123):
  existencia institucional confirmada (CAE administrado por Comisión Ingresa), pero el fetch
  directo fue bloqueado por bot-protection (`ingresa.cl` → `portal.ingresa.cl`, HTTP 403).
  Sin cifra ni procedimiento afirmados — no requiere cambio; registrar como verificado a nivel
  existencia con confirmación primaria pendiente si el refresh tocara esa línea.

## 7. Qué exigiría un refresh (lista explícita, sin ejecutar)

1. Corregir el ejemplo de prorrateo (F1–F2): cifra SOAP realista con fuente fechada (NHV-1)
   + mes marzo/permiso de circulación; recalcular la reserva mensual (~$700–$850/mes).
2. Micro-correcciones: eliminar duplicado L102 (F5); alinear buckets alimentación (F6);
   agregar línea de Vigencia + Fuentes al bloque ancla (F4).
3. Gobierno de datos: backfillea `validAsOf` (F3 — **sí warranted**) + estructurar
   `articleLead.officialSources` con las 3 fuentes existentes; `updatedDate` = fecha real del
   refresh + 1 línea de changelog (qué cambió, por qué, fuentes — NORMA §5).
4. Separación de deberes (INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES): quien redacte el refresh
   no lo audita en compliance; gates los firma humano. No tocar slug
   (URL.PUBLIC.NO_POST_ID). Gap transversal a escalar: 13/53 sin `validAsOf` + gate que no
   flaggea la ausencia — considerar check dedicado o extender `check-editorial-timeliness`.

## 8. Salidas de gates (verbatim, read-only)

- `node scripts/check-frontmatter.mjs` → `[check-frontmatter] Scanned 53 articles.` …
  `[check-frontmatter] OK (no blocking errors).` EXIT 0. (Nada flaggea este slug.)
- `node scripts/check-editorial-structure.mjs` → WARN solo en 2 slugs ajenos
  (`bancos-y-fintech-chile`, `finanzas-para-migrantes-chile`, description larga + 0
  intra-cluster links); este artículo sin warnings. EXIT 0.
- `node scripts/check-dialect.mjs` → `[check-dialect] OK. validated=53 files
  skipped_by_marker=0` EXIT 0.
- `node scripts/check-editorial-timeliness.mjs` → `[check-editorial-timeliness] published=53
  stale=0 drift=0 report=output/validation/editorial-timeliness/report.json` EXIT 0.
  Manejo del `validAsOf` ausente: `sourceMode manual_review`, `reviewDate=updatedDate
  2026-04-08`, `dueDate 2026-10-05`, `daysUntilDue 18`, `hasOfficialSources false`,
  `volatileData []` — **no lo flaggea como error ni warning**.
- `node scripts/check-internal-links.mjs` → `Scanned 53 published articles, 268 internal
  links. No broken links found.` EXIT 0.
- `node scripts/check-hero-images.mjs` → `Checked published articles: 53 …
  Path mode: legacy-compatible … OK` EXIT 0.
