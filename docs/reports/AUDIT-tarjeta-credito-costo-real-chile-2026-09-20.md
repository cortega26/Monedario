# AUDIT — tarjeta-credito-costo-real-chile (2026-09-20)

Auditoría adversarial YMYL, sesión SOLO-AUDITORÍA (separation of duties:
esta sesión no remedia, no edita el artículo, no cambia slugs/canonical/
rutas/RSS, no marca gates, no crea superficies indexables).

- Artículo: `src/data/blog/tarjeta-credito-costo-real-chile.md` (106 líneas).
- Criterio: `docs/editorial/NORMA_YMYL.md` v1.0 (leída completa en sesión).
- Fecha auditoría: 2026-09-20. Frontmatter artículo: `pubDate`
  2026-04-10, `updatedDate` 2026-04-12, `validAsOf` 2026-04-10.
- Regla URL pública: el informe NUNCA deriva URL desde `post.id`; solo
  cita rutas internas verificadas en repo y URLs oficiales externas.

## (a) Veredicto

**REJECT — cifra de pago mínimo falsa (5%–10% del saldo) y omite la
reforma NCG 537 / Ley 21.673 vigente desde 2026-06-04.**

## (b) Conteo de severidad

- Bloqueantes: 2 (B1, B2)
- Mayores: 3 (M1, M2, M3)
- Menores: 5 (m1, m2, m3, m4, m5)

## (c) Tabla de hallazgos

| ID | Ubicación | Afirmación del artículo | Evidencia de fuente primaria (URL + acceso) | Severidad |
|----|-----------|-------------------------|----------------------------------------------|-----------|
| B1 | L66 | "Suele ser un porcentaje del saldo (en general entre un 5% y un 10%, según el emisor)". | FALSO en ambos regímenes. (i) Régimen previo (vigente a `validAsOf` 2026-04-10): el mínimo "no podía ser inferior a los intereses del mes" (regla SERNAC citada en informe normativo CMF; promedio ~4% del facturado, amortización ~1%) — ver NCG 537, `https://www.cmfchile.cl/normativa/ncg_537_2025.pdf` (acceso 2026-09-20). (ii) Régimen actual: `PM ≥ 100%·MNF + 5%·MF` (100% de cuotas sin interés + intereses + comisiones + otros cargos, más 5% del capital financiable), NO "5%–10% del saldo" — NCG N°537 del 04-06-2025 y comunicado CMF `https://www.cmfchile.cl/portal/prensa/625/w4-article-110824.html` (29-05-2026, acceso 2026-09-20). Base legal: art. 37 Ley 18.010 (idNorma=29438, cita literal vía `bcn-cite` en sesión; modificado por Ley 21.673 art. 3°, D.O. 30.05.2024). | Bloqueante |
| B2 | Artículo completo (L64–L74, L76–L82) | Describe el pago mínimo como un porcentaje a discreción del emisor, sin mencionar reforma alguna. | Omisión de reforma material EN VIGOR a fecha de auditoría: NCG 537 publicada 04-06-2025, primera etapa en vigor 04-06-2026, gradualidad 25%/6 meses hasta 04-06-2028 (fuentes B1). El artículo (actualizado 2026-04-12, posterior a la publicación de la NCG) presenta el régimen antiguo como actual. Viola NORMA §4 y MUST #3/#6 (aprobado/vigencia/implementación, "hoy vs después"). | Bloqueante |
| M1 | L52–L54, L56–L62 | Sin bloque "Respuesta rápida / Excepciones / Vigencia / Fuentes" (§2.3). | La `articleLead.answer` (L24) es conceptual ("no es dinero extra… calcula cuánto pagarías") sin número/regla concreta en ≤2 pantallas. El artículo delega la respuesta a la calculadora. MUST #1/#2 parcial. | Mayor |
| M2 | Cuerpo L52–L106 | Ninguna línea "vigente a …" / marco temporal en el cuerpo. | `validAsOf: 2026-04-10` existe solo en frontmatter; el cuerpo no indica vigencia (MUST #3). A 2026-09-20 el contenido describe un régimen derogado sin advertirlo. | Mayor |
| M3 | L58 (TMC), L66 (mínimo) | Cuerpo sin ningún enlace externo oficial. | Las 2 fuentes oficiales viven solo en frontmatter (`officialSources`): CMF Educa `https://www.cmfchile.cl/educa/621/w3-propertyvalue-1188.html` (fetcheada en sesión: confirma art. 6 Ley 18.010 y TMC como techo; acceso 2026-09-20) y BCN `https://www.bcn.cl/leychile/navegar?idNorma=29438` (verificada vía `bcn-cite` art. 1 y 6 en sesión). El lector no puede verificar inline (MUST #4 trazabilidad). | Mayor |
| m1 | L68 | "con una mayoría de los pagos cubriendo intereses". | Recálculo en sesión (B=500.000, i=2,5%/mes, P=25.000): primera cuota 12.500 interés / 25.000 = 50% exacto, no mayoría; solo a tasas mayores (≥3%/mes) el interés supera el 50% inicial. Sobrestimación leve. | Menor |
| m2 | L79 | "puedes usar la TMC vigente de la CMF como referencia de techo" para la tasa mensual. | La TMC se publica ANUALIZADA por tramo (p. ej. Certificado N°08/2026: 41,50% ≤50 UF; fuente: CMF `https://www.cmfchile.cl/portal/estadisticas/617/w3-propertyvalue-30141.html`, acceso 2026-09-20). Sin guía de conversión a mensual (÷12 nominal), el usuario puede ingresarla directo como mensual. Trampa de unidades. | Menor |
| m3 | L8, L29 | `updatedDate` 2026-04-12 vs `validAsOf` 2026-04-10 (brecha 2 días). | NORMA §5.3 exige registro de 1 línea en backlog por cambio sustantivo; no se cita registro en el artículo. Remediación debe confirmar si hubo cambio sustantivo. | Menor |
| m4 | L97 | "El pago mínimo representa más del 10% de tu ingreso mensual neto" como señal de problema. | Heurístico sin etiqueta "orientativo" ni fuente (NORMA §3.2). No es falso, pero es inferencia sin etiqueta. | Menor |
| m5 | N/A (omisión) | No menciona DS N°75 (nuevo Reglamento Tarjetas de Crédito). | SERNAC `https://www.sernac.cl/604/w3-article-89070.html` (acceso 2026-09-20): DS 75 publicado 06-08-2026 en Diario Oficial, reemplaza regulación 2012, vigencia a los 18 meses (~06-02-2028). Aprobado pero no vigente: corresponde bloque "hoy vs después" (§4), no corrección. | Menor |

### Afirmaciones VERIFICADAS (sin hallazgo)

- L58 TMC como techo legal publicado por CMF: CONFIRMADO — art. 6 Ley
  18.010 cita literal (`bcn-cite` 29438 --art 6): TMC = mayor entre
  1,5×TIC y TIC+2pp; CMF publica TIC/TMC mensualmente (certificados
  01–08/2026 verificados en CMF, acceso 2026-09-20). El artículo NO cita
  la fórmula "50%", por lo que no hereda el texto desactualizado del
  glosario CMF Educa. L34 (BCN Ley 18.010) correcto.
- L60 mecánica de intereses (saldo impago genera interés; avances desde
  el día de la transacción): CONFIRMADO — CMF
  `https://www.cmfchile.cl/portal/principal/613/w3-article-27793.html`
  (acceso 2026-09-20). Regulación citada (BC Cap III.J.1.1 + CMF Cap
  8-41) existe.
- L70–L72 ejemplo $500.000 / 24–48 meses / 40%–80% / +20–30% pago:
  RECALCULADO EN SESIÓN (amortización estándar
  `B←B·(1+i)−min(P,B)`): i=2,5% P=25.000 → 29 meses, $701.796 total,
  interés 40,4%; i=3,0% → 31 meses, 55,0%; i=3,45% → 35 meses, 72,7%
  (banda 24–48 / 40–80% CUMPLE); P=30.000 (+20%) a 2,5% → 22 meses,
  interés 31,0%; P=32.500 (+30%) → 20 meses, 27,8% ("reduce de forma
  significativa" CUMPLE). Etiqueta "ilustrativo" presente (L70).
- L92 "usa la CAE de cada emisor" para comparar tarjetas nuevas:
  consistente con SERNAC DS 75 (CAE como comparador estandarizado).
- Enlaces internos (todos con `/` final, todos resuelven en repo):
  `/posts/cae-costo-real-credito-chile/` → `cae-costo-real-credito-chile.md`
  ✓; `/posts/renegociacion-superir/` → `renegociacion-superir.md` ✓;
  `/calculadoras/simulador-renegociacion/` → `simulador-renegociacion.astro`
  ✓; `/posts/prepago-credito-cuando-conviene-chile/` →
  `prepago-credito-cuando-conviene-chile.md` ✓;
  `/calculadoras/tarjeta-credito/` → `tarjeta-credito.astro` ✓.

## Gates de solo lectura (salida VERBATIM, nada corregido)

1. `pnpm run check:frontmatter` → PASS:
   `[check-frontmatter] Scanned 54 articles.` / deprecation 0/0/0/0 /
   transition 0/0 / quality warnings 0/0 /
   `[check-frontmatter] OK (no blocking errors).`
2. `pnpm run check:editorial-structure` → PASS (warnings ajenos al archivo):
   `[check-editorial-structure] WARN. long_warning=2 (recommended max 155, hard max 200).` /
   `- src/data/blog/bancos-y-fintech-chile.md: description length 160 exceeds recommended max 155 (non-blocking).` /
   `- src/data/blog/finanzas-para-migrantes-chile.md: description length 175 exceeds recommended max 155 (non-blocking).` /
   `[check-editorial-structure] WARN. cluster_missing=0 cluster_invalid=0 cluster_link_warning=2 cluster_coverage_pct=100 cluster_with_value=54 validated=54 min_cluster_internal_links=1 (warning-first rollout).` /
   `- src/data/blog/bancos-y-fintech-chile.md: has 0 intra-cluster internal links (min 1).` /
   `- src/data/blog/finanzas-para-migrantes-chile.md: has 0 intra-cluster internal links (min 1).` /
   `[check-editorial-structure] OK. validated=54 ...` (cero flags sobre el
   archivo auditado).
3. `pnpm run check:dialect` → PASS:
   `[check-dialect] OK. validated=54 files skipped_by_marker=0`
4. `pnpm run check:reader-facing-copy` → PASS:
   `[check-reader-facing-copy] scope=all diff="-" scanned=94 issues=0` /
   `[check-reader-facing-copy] OK. No blocking issues found.`
5. `pnpm run check:links` (= `node scripts/check-internal-links.mjs`,
   repo-wide, sin arg por archivo) → PASS:
   `[check-internal-links] Scanned 54 published articles, 274 internal links.` /
   `[check-internal-links] No broken links found. ✓` /
   `Orphan articles (1): src/data/blog/cotizacion-voluntaria-afp-independiente.md`
   (ajeno; warning, no error).
6. `pnpm exec prettier --check src/data/blog/tarjeta-credito-costo-real-chile.md`
   → PASS: `All matched files use Prettier code style!`

## (d) NEEDS-HUMAN-VERIFY (no verificable en sesión, JAMÁS rellenar de memoria)

1. Texto completo Ley 21.673 art. 3° (modifica art. 37 Ley 18.010) —
   `https://www.bcn.cl/leychile/navegar?idLey=21673` (LeyChile bloquea
   bots; solo se confirmó la nota marginal vía `bcn-cite` 29438 --art 37).
2. Texto literal NCG 537 (fórmula `PM ≥ 100%·MNF + 5%·MF`, transitorios) —
   `https://www.cmfchile.cl/normativa/ncg_537_2025.pdf` (verificado vía
   extracción de buscador + comunicado CMF; sin fetch directo del PDF en
   sesión).
3. Niveles industria pre-reforma (~1% amortización, ~4% del facturado) —
   informe normativo CMF citado en NCG 537 (URL de sesión no canónica;
   confirmar vía expediente NCG 537 en CMF).
4. Definición CAE en DS 44/2012 —
   `https://www.bcn.cl/leychile/navegar?idNorma=1041745` (citado por
   página SERNAC; sin cita `bcn-cite` en sesión).

## (e) Requisitos de remediación (para OTRA sesión; yo no corrijo)

1. Reemplazar L66 por fórmula NCG 537 (`PM ≥ 100%·MNF + 5%·MF`,
   definiendo MNF/MF) + bloque §4 (aprobado 04-06-2025 / vigencia
   04-06-2026 / gradualidad hasta 04-06-2028) con fuentes CMF inline.
2. Agregar Respuesta Ancla §2.3 (regla + excepciones + vigencia + fuentes)
   al inicio de la sección clave.
3. Estampar "vigente a …" en cuerpo y alinear `updatedDate`/`validAsOf`;
   registrar cambio en backlog (§5.3).
4. Enlazar inline CMF (TMC, NCG 537, "¿Cuánto se cobra…") y SERNAC DS 75
   (bloque hoy-vs-después: entra ~06-02-2028).
5. Guiar conversión TMC anual→mensual en L79; etiquetar heurísticos
   (L97, L68) como orientativos.
6. Re-verificar contra certificado TMC del mes de remediación y
   re-ejecutar los 6 gates + `check:legal-citations`.

## Integridad de sesión

- `git status --short` previo a mi escritura: `M docs/TECH_DEBT_BACKLOG.md`,
  `M docs/backlog/README.md` (suciedad preexistente, NO mía; no tocada).
- Mi única escritura: este informe.
