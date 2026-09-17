# Auditoría adversarial — el-poder-del-interes-compuesto (2026-09-17)

**Slug:** `el-poder-del-interes-compuesto`
**Archivo:** `src/data/blog/el-poder-del-interes-compuesto.mdx` (+ nota hermana
`src/data/blog/interes-compuesto-nota-metodologica.md`, unlisted, mismo `canonicalTopic`)
**Tipo:** read-only. No se editó ningún archivo existente. Único output: este reporte.
**Fecha de auditoría:** 2026-09-17. **Corte del ejercicio auditado:** 2025-12-31.
**Frontmatter:** `pubDate 2026-03-06` / `updatedDate 2026-03-07` (el más antiguo del corpus).
**Veredicto:** **FINDINGS — 3 alta / 6 media / 6 baja (15 hallazgos). 8 NEEDS-HUMAN-VERIFY.**

## 1. Frontmatter y señales de frescura (inventario)

| Campo | Valor | Observación |
|---|---|---|
| `title` | "El poder del interés compuesto: 10% del sueldo mínimo a $125 millones" | Hereda F1: el titular en CLP está ~6% sobre el valor corregido |
| `description` | "… habría cerrado cerca de $125,6 millones." | Hereda F1 |
| `pubDate / updatedDate` | 2026-03-06 / 2026-03-07 | Ver F6: anterior a `validAsOf` y a "Revisado el 2026-04-22" |
| `category / cluster` | `ahorro-inversion / ahorro-e-inversion` | OK |
| `topicRole / canonicalTopic` | `owner / interes-compuesto-caso` | OK, coherente con nota hermana (`reference`, mismo topic) |
| `heroImage` | `/images/hero/el-poder-del-interes-compuesto.avif` | OK: existen base + `@mobile` + `@tablet` en `public/images/hero/` |
| `articleAdvisory` | Simulación educativa; no garantiza retornos | OK, veraz |
| `articleLead.validAsOf` | 2026-04-22 | Ver F6: revalidación declarada que no detectó F1–F3 |
| `articleLead.officialSources` | Nasdaq histórico NDX + BCentral tipos de cambio | Formalmente OK; los valores tomados de esas fuentes están mal (F1, F12) |
| `reviewPolicy` | `semiannual / maxDays 180`, `dataTriggers: []` | Ver F14: triggers vacíos con TC/UF/IMM volátiles |
| `volatileData` | ausente (`[]` según reporte de timeliness) | Ver F14 |
| Timeliness gate | `reviewDate 2026-04-22, dueDate 2026-10-19, stale false, daysUntilDue 32` | No stale por gate, pero 3 altas ya falsas a su propio corte (ver §4) |
| Imagen del cuerpo | `/images/posts/el-poder-del-interes-compuesto/interes-compuesto-nasdaq.avif` | OK: el asset existe |

## 2. Checklist NORMA_YMYL v1.0

| Requisito | Estado |
|---|---|
| MUST 1 Respuesta ancla ≤ 2 pantallas con regla concreta | Cumple en forma ("Respuesta rápida" con cifras), pero las cifras están mal (F1–F3) |
| MUST 2 Regla afirmativa | Cumple en forma |
| MUST 3 Vigencia explícita | Cumple en forma (corte 2025-12-31 + §"Información de vigencia"), fechas incoherentes (F6) |
| MUST 4 ≥1 fuente oficial por regla crítica | **Falla**: TC/UF/IMM difieren de la fuente oficial citada (F1–F3); retiro e inmobiliario sin fuente trazable (F8–F9) |
| MUST 5 Excepciones relevantes | Cumple (sección "Críticas razonables" es ejemplar en forma) |
| MUST 6 Separar aprobación / vigencia / implementación | N/A (no hay narrativa de reforma; los reajustes del mínimo son datos, no calendario legal) |
| MUST 7 Síntesis etiquetada "resumen orientativo" | Cumple en forma (L131), pero la etiqueta nombra el índice equivocado (F4) |
| MUST 8 Coherencia interna | **Falla**: S&P 500 vs NASDAQ-100 (F4); 13,7x junto a cifras CLP (F5); triple fecha (F6) |
| MUST 9 Frontmatter y frescura | **Falla** parcial (F6, F14) |
| SHOULD ejemplo numérico | Cumple (verificaciones aritméticas en §5) |
| SHOULD interlinking | Cumple: 7 links internos, todos resuelven (gate §8) |

## 3. Tabla de hallazgos

| # | Afirmación + ubicación | Sev. | Evidencia / URL o NEEDS-HUMAN-VERIFY | Fix sugerido |
|---|---|---|---|---|
| F1 | TC de cierre "970 CLP/USD en diciembre de 2025" (L62, L100, nota §4/§7); titular y cuerpo "$125,6 millones" | alta | **Falso.** Dólar observado dic-2025 (SII/BCN, serie oficial): promedio mensual $916,16; 29-dic 904,54; 30-dic 911,18 (31-dic sin valor, feriado). Ningún día de diciembre tocó 970 (máximo 928,16 el día 1). Fuente primaria, recuperada 2026-09-17: `https://www.sii.cl/valores_y_fechas/dolar/dolar2025.htm`. Corregido: 129.495 × 911,18 = **$117.993.254 (~$118,0M, −6,1%)**. El 970 se parece a valores de med-2025 (prom. jul 951,55; abr 961,96): dato stale | Recomputar cifra titular, tabla por década (fila 2025), mensualidades y §departamento con dólar observado de cierre dic-2025; citar tabla SII + fecha de recuperación |
| F2 | "Sueldo mínimo de diciembre de 2025 ($500.000)" (L145); fila "2025 \| $500.000" (nota §2) | alta | **Falso.** Dic-2025 = **$529.000** (Ley 21.751, DO 28.06.2025, vigente desde 01-05-2025). Ene–abr 2025 = $510.636 (reajuste automático IPC Ley 21.578). Fuentes: Mintrab `mintrab.gob.cl/reajuste-al-ingreso-minimo-mensual/` (Ley 21.751); mensaje presidencial 30-04-2025 (Boletín 17.508-05: $529.000 desde 01-05-2025, $539.000 desde 01-01-2026); tabla BCN citada en prensa. Impacto en simulación menor: aportes 2025 corregidos $517.022 vs $494.400 modelados (+$22.622, +4,6% del año, ~+0,4% lifetime) | Corregir fila 2025 (escalón 510.636 ene–abr + 529.000 may–dic), comparación L145 y re-simular; la conclusión ("mensualidad > mínimo") se mantiene ($680k–$731k corregidos > $529k) |
| F3 | "UF cercana a $38.500 en diciembre de 2025" → "~3.263 UF" (L178, nota §11) | alta | **Falso.** UF 31-dic-2025 = **$39.727,96** (SII, serie oficial, recuperada 2026-09-17: `https://www.sii.cl/valores_y_fechas/uf/uf2025.htm`). Error doble: CLP mal (F1) × UF mal. Corregido: 117.993.254 / 39.727,96 = **~2.970 UF** (lo declarado está ~10% sobre el valor corregido). $38.500 ≈ UF de ene-2025 (SII: 01-ene 38.419,17): otro dato stale de inicios de año | Recalcular equivalencia UF con SII 31-dic-2025 y CLP corregido (F1); citar tabla SII |
| F4 | L131: "Los rendimientos históricos del índice S&P 500 no son representativos…" | media | **Índice equivocado.** Todo el ejercicio es NASDAQ-100 (título, supuestos L81, serie nota §5). Es un copy-paste dentro de la etiqueta "resumen orientativo" exigida por NORMA §3: la etiqueta existe pero invalida su propio contenido | Cambiar a "…del índice NASDAQ-100…"; agregar chequeo de coherencia de benchmark al gate editorial |
| F5 | "13,7 veces lo aportado" junto a cifras CLP (L60, L66, L123; nota §7) | media | **Mezcla de numerarios.** 13,7x = 129.495 / 9.453 (USD). En CLP: 125.610.531 / 6.183.108 = **20,3x** (19,1x con CLP corregido F1). El lector que divide las cifras del propio artículo obtiene 20,3, no 13,7: contradicción aparente verificada aritméticamente | Declarar ambos múltiplos con su moneda ("13,7x en USD; ~20,3x en CLP por depreciación del peso") o fijar un solo numerario; conecta con la autocrítica de "efecto dólar" (L154) |
| F6 | Triple fecha: `updatedDate 2026-03-07` vs "Revisado el: 2026-04-22" (L200) vs `validAsOf 2026-04-22` vs `computedAt 2026-05-06` | media | NORMA §5/MUST 9: la revisión del 2026-04-22 (que la nota hermana sí registró como `updatedDate 2026-04-22`) no movió el `updatedDate` del artículo principal. Peor: con corte dic-2025, TC/UF/IMM ya eran finales en abril-2026 — la "revalidación" no detectó F1–F3, luego fue inefectiva para cifras | Al refrescar: `updatedDate` ≥ fecha real de revisión + línea de changelog (qué cambió, por qué, fuentes); auditar qué cubrió la revisión 2026-04-22 |
| F7 | Checkpoints IMM saltan reajustes intermedios: 2022 $380k → 2024 $460k → 2025 $500k (nota §2) | media | Ley 21.578 fijó $440k (may-2023), $460k (sep-2023), $500k (jul-2024) + reajuste auto ene-2025 (Mintrab 2024-07-02; BCN idNorma=1192720). La tabla bienal los omite; y **no hay script/CSV en el repo** (búsqueda `129495\|seed(42)\|6183108` solo halla excerpts) para saber si la serie mensual los incluye. Si el escalón retiene $380k hasta 2024, aportes may-2023→jun-2024 subestimados 15–21% en plena racha NDX (+54,9% 2023, +25,6% 2024) | NHV-3: ubicar script original; publicar serie mensual + inputs; re-simular con escalones Ley 21.578/21.751 |
| F8 | Insumos de retiro sin fuente trazable: e0 hombre ~79 / prom. ~82 / mujer ~84, 6% anual, colchón 10% (L135–L143, nota §8) | media | Cita genérica "INE (escenarios de expectativa de vida)". La página INE de proyecciones (recuperada 2026-09-17) hoy sirve base Censo 2024, sin valores 79/82/84 extraíbles; no se cita tabla/anuario/pestaña. La matemática PMT verifica (802/771/746 USD; ver §5), pero los horizontes 301/333/366 meses son axiomas sin trazabilidad | NHV-4: pinchar tabla INE exacta (base 2017 vs base Censo 2024) + URL + fecha; reexpresar mensualidades en CLP corregido F1 |
| F9 | Rangos inmobiliarios sin URL/fecha: BDO/BioBioChile, urbani.cl, TocToc, HDI Seguros (L178–L180, nota §11) | media | Atribuciones nominales a secundarios, sin enlace ni fecha de publicación/recuperación. Patrón "unsourced figures" del piloto hermano. Con UF corregida (F3) el anclaje "Estación Central ~2.600 UF" queda justo (~2.970 UF): la conclusión direccional se mantiene pero sin colchón documentado | NHV-7: URLs + fechas por rango; reevaluar holgura con 2.970 UF |
| F10 | "Total descuentos 17,6%" presentado como completo (nota §3: AFP 10 + Fonasa 7 + cesantía 0,6) | baja | Omite la **comisión de administración de la AFP** (~0,5–1,45% del imponible según AFP), que reduce el líquido real. Sobreestima aportes ~1% sistemático durante 36 años | NHV-8 (SPensiones) + footnote con rango de comisiones del período |
| F11 | "El NASDAQ-100 perdió casi 78% desde su peak" 2000–2002 (L108) | baja | Magnitud direccionalmente correcta pero sin fuente y posiblemente subestimada (el peak-to-trough mar-2000→oct-2002 se cita habitualmente mayor). Nasdaq histórico es app JS, no verificable por fetch | NHV-5: confirmar % exacto price vs total-return + URL |
| F12 | Serie etiquetada "Total Return" (L81, nota §5) con fuentes de precio | baja | Las fuentes citadas (Nasdaq historical, scorecard dic-2025) publican **price return**; el +20,2% 2025 se verificó literalmente como "closed the year with a strong gain of 20.2%" (scorecard 2026-01-08, ver §5). Diferencia inmaterial (~dividendos), pero la etiqueta TR no tiene respaldo | NHV-6: pinchar serie NDXTR o re-etiquetar a price-return con URL |
| F13 | Sin artefacto de replicación en repo | baja | Fórmulas publicadas (nota §6) pero sin script, sin CSV de inputs, sin lista de las 24 lagunas (`seed 42` no reproducible sin código). Los hitos década a década (L92–L100) son inverificables por terceros | Publicar script + serie mensual + set de lagunas (o fijar la lista en la nota) |
| F14 | Sin `volatileData`; `dataTriggers: []` con TC/UF/IMM/NDX volátiles | baja | Timeliness confirma `volatileData: []`. El gate mide edad, no verdad: `stale=0` con 3 altas falsas al propio corte | Declarar datasets del registry (o documentar por qué no) + triggers fechados |
| F15 | "Se jubilaría a los 54 años" sin contraste con edad legal AFP (L135) | baja | El escenario es hipotético y autofinanciado (no reclama pensión estatal), pero ningún lector distingue "jubilarse con ahorros" de la edad legal (60/65). Riesgo de confusión de baja probabilidad | Una línea aclaratoria + link al pilar de pensiones |

## 4. Freshness assessment al 2026-09-17

**El ejercicio está congelado por diseño (corte 2025-12-31) pero sus cifras de anclaje ya eran falsas a su
propio corte.** Lo verificado como correcto y estable: NDX 2025 +20,2% (scorecard Nasdaq 2026-01-08);
aritmética interna completa (432 meses, 408 aportes, múltiplo USD 13,7x, PMT 802/771/746, coherencia
década-vs-TC en §5); "2022 peor año desde 2008" (consistente con la propia tabla); estructura
answer-first, vigencia visible y sección de críticas (cumplen NORMA en forma).

Lo que un refresh debe asumir como roto hasta re-simular: **titular $125,6M → ~$118,0M** (F1);
**3.263 UF → ~2.970 UF** (F3); **IMM dic-2025 $500k → $529.000** (F2); mensualidades CLP −6%
(pero siguen sobre el mínimo: ~$731k/$703k/$680k > $529k, conclusión direccional intacta).
El gate (`dueDate 2026-10-19`, 32 días) subestima la urgencia: 3 altas no son "próximo vencimiento",
son error factual en producción hoy. La revisión 2026-04-22 no las capturó (F6).

## 5. Verificaciones de pie (resuelven OK)

- **NDX 2025 +20,2% VERIFICADO** en fuente primaria: "ended December 2025 slightly lower, down 0.7%
  but closed the year with a strong gain of 20.2%" —
  `https://www.nasdaq.com/articles/index-monthly-scorecard-december-2025` (publicado 2026-01-08,
  recuperado 2026-09-17). Dic −0,7% también consistente con el texto.
- **Aritmética interna verificada por cómputo propio:** 129.495/9.453 = 13,697 → 13,7x;
  PMT con i = 1,06^(1/12)−1: n=301 → $801,5; n=333 → $770,9; n=366 → $745,6 (redondean a
  802/771/746); CLP a 970 exactos (777.940/747.870/723.620 → $778k/$748k/$723k);
  "más del 60% en últimos 10 años" = 84,4%; TC implícitos de la tabla por década
  (415/638/551/480/652/800) calzan con los checkpoints de la nota §4.
- **Sueldo mínimo dic-2025 = $529.000 VERIFICADO** (Ley 21.751, DO 28.06.2025): Mintrab +
  mensaje presidencial Boletín 17.508-05 + Senado (ver F2). Ley 21.830 (DO 22.06.2026,
  $553.553 desde 01-05-2026) vía DT `w3-article-60141.html` confirma la serie hacia adelante.
- **Links internos:** `check-internal-links` OK (53 artículos, 267 links, 0 rotos). Los 7 del
  artículo resuelven (`/calculadoras/interes-compuesto/`, `/posts/como-invertir-en-etfs-desde-chile/`,
  `/posts/interes-compuesto-nota-metodologica/`, `/posts/que-es-el-apv/`,
  `/calculadoras/simulador-jubilacion/`, `/guias/uf-costo-de-vida/`, `/guias/ahorro-e-inversion/`).
- **Hero + chart:** existen `el-poder-del-interes-compuesto.avif` (+ `@mobile`, `@tablet`),
  `interes-compuesto-nota-metodologica.avif` (+ variantes) y
  `images/posts/el-poder-del-interes-compuesto/interes-compuesto-nasdaq.avif`.
- **LeyChile bloquea bots** (asumido del piloto; no se intentó re-verificar): todo lo
  BCN-dependiente va a NHV, nada se completó de memoria.

## 6. NEEDS-HUMAN-VERIFY (8)

- **NHV-1.** Serie IMM 1990–2024 fila por fila, con foco en anomalía "2006: $155.510"
  (único valor no redondo junto a 2020/2016). Confirmar en DT histórico / SUSESO /
  `https://www.bcn.cl/leychile/` (leyes de reajuste por año).
- **NHV-2.** IMM ene–abr 2025 = $510.636 (reajuste automático IPC, Ley 21.578 art. 1 inc. 4):
  tomado de excerpt de PDF BCN ("Evolución del salario mínimo en Chile y en países de la OCDE",
  `obtienearchivo.bcn.cl …/Evolucion_del_salario_minimo_en_Chile_y_en_paises_de_la_OCDE.pdf`);
  confirmar texto/refundido antes de citarlo como primario.
- **NHV-3.** Serie mensual real + lista de las 24 lagunas usadas en la simulación (el repo no
  contiene el script): ubicar el artefacto original, confirmar si incluye escalones
  may/sep-2023, jul-2024, ene/may-2025 (F7), y re-simular.
- **NHV-4.** Esperanza de vida por sexo y horizontes 301/333/366 meses: pinchar tabla INE
  exacta (`https://www.ine.gob.cl/estadisticas/sociales/demografia-y-vitales/proyecciones-de-poblacion`,
  base 2017 vs base Censo 2024) con valores literales + fecha de recuperación.
- **NHV-5.** Drawdown NDX mar-2000→oct-2002 peak-to-trough exacto (price vs TR):
  `https://www.nasdaq.com/market-activity/index/ndx/historical` o `indexes.nasdaqomx.com`.
- **NHV-6.** Etiqueta Total Return: confirmar serie NDXTR 2025 y spot-checks
  (1991 +70,0%; 1998 +85,5%; 1999 +102,5%) o re-etiquetar a price-return.
- **NHV-7.** Rangos UF por comuna + arriendos $350k–$500k: URL + fecha por cada atribución
  (BDO Chile, BioBioChile, urbani.cl, TocToc, HDI Seguros 2025).
- **NHV-8.** Comisión AFP del período (rango por AFP, SPensiones) para el footnote de F10.

## 7. Qué exigiría un refresh (lista explícita, sin ejecutar)

1. Re-simular con serie IMM corregida (F2, F7, NHV-1–NHV-3) y reconvertir todo a CLP con dólar
   observado de cierre dic-2025 SII (F1); recalcular UF con SII 31-dic-2025 (F3); reexpresar
   titular, descripción, respuesta rápida, tabla por década, mensualidades y §departamento.
2. Micro-correcciones: S&P 500 → NASDAQ-100 (F4); doble múltiplo USD/CLP (F5); footnote
   comisión AFP (F10, NHV-8); aclaración edad 54 vs edad legal (F15); etiqueta de serie TR (F12).
3. Trazabilidad: pinchar tabla INE (F8, NHV-4) y URLs inmobiliarias fechadas (F9, NHV-7);
   publicar script + inputs + set de lagunas (F13).
4. Gobierno de datos: declarar `volatileData` / `dataTriggers` (F14); `updatedDate` ≥ revisión
   real + changelog de 1 línea por cambio (F6, NORMA §5).
5. Separación de deberes (INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES): quien redacte el refresh no
   lo audita en compliance; gates de publicación los firma humano. No tocar slug
   (URL.PUBLIC.NO_POST_ID) y re-ejecutar `check:ci` + snapshot de rutas/RSS si cambia el cuerpo.

## 8. Salidas de gates (verbatim, read-only)

- `node scripts/check-frontmatter.mjs` → `[check-frontmatter] Scanned 53 articles.` …
  `[check-frontmatter] OK (no blocking errors).` EXIT 0.
- `node scripts/check-editorial-structure.mjs` → WARN solo en 2 slugs ajenos
  (`bancos-y-fintech-chile`, `finanzas-para-migrantes-chile`, description larga + 0
  intra-cluster links); este artículo sin warnings. EXIT 0.
- `node scripts/check-dialect.mjs` → `[check-dialect] OK. validated=53 files
  skipped_by_marker=0` EXIT 0.
- `node scripts/check-editorial-timeliness.mjs` → `[check-editorial-timeliness] published=53
  stale=0 drift=0 report=output/validation/editorial-timeliness/report.json` EXIT 0.
- `node scripts/check-internal-links.mjs` → `Scanned 53 published articles, 267 internal
  links. No broken links found.` EXIT 0.
- `node scripts/check-hero-images.mjs` → `Checked published articles: 53 … OK` EXIT 0.

## 9. Nota sobre auditoría piloto hermana

`docs/reports/AUDIT-reforma-previsional-2025-2026-09-17.md` existe y es el piloto referido:
mismo veredicto FINDINGS, mismo patrón de defectos vivos (cifra oficial errada, triggers vacíos,
gate `stale=0` con error factual en producción). Patrón transversal a incorporar al refresh
consolidado: **los gates miden edad/formato, no verdad numérica** — toda cifra ancla YMYL
requiere verificación primaria fechada en cada revisión semestral.
