# Auditoría adversarial — fonasa-vs-isapre-comparativa (2026-09-18)

**Slug:** `fonasa-vs-isapre-comparativa`
**Archivo:** `src/data/blog/fonasa-vs-isapre-comparativa.md`
**Tipo:** read-only. No se editó ningún archivo existente. Único output: este reporte.
**Fecha de auditoría:** 2026-09-18. **Cutoff del artículo auditado:** `validAsOf 2026-04-08` / `updatedDate 2026-04-08` (163 días).
**Veredicto:** **FINDINGS — 3 alta / 6 media / 5 baja (14 hallazgos). 8 NEEDS-HUMAN-VERIFY.**

## 1. Frontmatter y señales de frescura (inventario)

| Campo | Valor | Observación |
|---|---|---|
| `title` | "Fonasa o Isapre: cuál conviene según tu caso (2026)" | OK |
| `description` | Compara Fonasa e Isapre: tramos, copagos, GES, CAEC… | OK, sin warnings de gate |
| `pubDate / updatedDate` | 2026-04-08T12:00:00Z / idem | Desfasado ~5 meses; ver F1–F6 |
| `category / cluster` | `seguridad-financiera` | OK |
| `topicRole / canonicalTopic` | `owner / fonasa-vs-isapre` | OK, coincide con `editorial-topic-policy.mjs:210-212` |
| `heroImage` | `/images/hero/fonasa-vs-isapre-comparativa.avif` | OK: existen base + `@mobile` + `@tablet` |
| `articleAdvisory` | Educativo; no reemplaza revisión del plan | OK |
| `articleLead.validAsOf` | 2026-04-08 | Expirada en efecto (F1–F6 son falsedades al 2026-09-18, no solo vejez) |
| `articleLead.officialSources` | superdesalud.gob.cl + fonasa.cl (homepages genéricas) | Débil: sin deep links a tramos/TUF/CAEC/APB |
| `reviewPolicy` | `annual / maxDays 365`, `dataTriggers: []` | Ver F9: cadencia per-policy pero insuficiente para el tema |
| `volatileData` | ausente (`[]` según timeliness) | Ver F9: sin dataset salud en el registry |
| Timeliness gate | `reviewDate 2026-04-08, dueDate 2027-04-08, stale false, daysUntilDue 202` | Gate mide edad, no verdad: no detectó F1–F5 |

## 2. Checklist NORMA_YMYL v1.0

| Requisito | Estado |
|---|---|
| MUST 1 Respuesta ancla ≤ 2 pantallas con regla concreta | Parcial: el ancla existe pero sus números son falsos hoy (F1, F2) |
| MUST 2 Regla afirmativa | Cumple en forma |
| MUST 3 Vigencia explícita | Cumple en forma ("vigente al 2026-04-08"), expirada en efecto |
| MUST 4 ≥1 fuente oficial por regla crítica YMYL | Parcial: homepages genéricas; hechos fetcheables diferidos (F1, F4, §2.4) |
| MUST 5 Excepciones relevantes | Parcial: faltan exención <2 años, reclasificación 3 cargas, red CAEC/GES (F7, F10) |
| MUST 6 Separar aprobación / vigencia / implementación | **Falla**: Ley Corta 21.674 + MCC + APB sin bloque (F6, F5) |
| MUST 7 Síntesis jurídica "resumen orientativo" | Cumple (tabla L110 + ejemplo L97 etiquetados) |
| MUST 8 Coherencia interna | Parcial: L121 "verificar exclusiones del plan" tensiona L173 "ninguno puede negarte" (F11) |
| MUST 9 Frontmatter y frescura | Parcial (F9) |
| SHOULD interlinking | Cumple: 5 links internos, todos resuelven (§5) |

## 3. Tabla de hallazgos

| # | Afirmación + ubicación | Sev. | Evidencia / URL o NEEDS-HUMAN-VERIFY | Fix sugerido |
|---|---|---|---|---|
| F1 | L82–L89: tabla tramos implica copago MAI para B/C/D ("Verificar en fonasa.cl"); L89 "copagos menores o cero"; L177 "pagando el copago según tu tramo" | alta | **Falso desde sep-2022.** Primaria directa (fetch 2026-09-18): "Desde septiembre de 2022, existe el Copago Cero en la MAI" para TODOS los tramos; tramos actualizados al 01-05-2026 por Ley 21.830 (B ≤$553.553; C $553.554–$808.187; D >$808.188). `https://www.fonasa.gob.cl/` (Tramos). Deferral injustificado (NORMA §2.4) | Reescribir tabla: MAI = Copago Cero todos los tramos desde 2022; citar página Tramos + fecha recuperación; registrar umbrales como `volatileData` o link vivo |
| F2 | L76 + L104: "el precio varía por edad, el sexo (tabla de factores regulada)" | alta | **Falso.** TUF eliminó discriminación por sexo y restringió edad: Circular IF/N°343 (2019-12-11, vigente 01-04-2020) — `https://www.superdesalud.gob.cl/normativa/circular-if-n-343/`; Corte Suprema nov-2022 ordenó TUF a todos los contratos; Ley 21.674 art 2° (extractor idNorma 1203779, idParte 10501377) impuso adecuación sin alzas + restitución desde 01-04-2020 | Reescribir: sexo no diferencia precio; factor edad solo a suscripción/incorporación (verificar detalle IF/468 en NHV-2); citar TUF + Ley 21.674 |
| F3 | L154: Isapre→Fonasa "en cualquier momento, aviso 30 días" | alta | **Contradice norma.** DFL-1 art 197 (extractor idNorma 249177, idParte 8654056, heading verificado): desahucio exige "transcurrido un año de vigencia" + "comunicación escrita… antelación de, a lo menos, un mes". Ventanas sin año (Ley Corta art 9°) fueron excepcionales y expiraron | Reescribir con regla 1 año + 1 mes + copia empleador; excepciones (cesantía) según art 197; NHV-1 |
| F4 | L192 + FAQ: "los copagos máximos [GES] son los mismos" | media | **Falso.** Primaria: protección financiera 0% Fonasa A/B, 10% C, 20% D e Isapres (`superdesalud.gob.cl/orientacion-en-salud/garantias-explicitas-en-salud-ges/`); con Copago Cero Fonasa GES ≈ $0 y el afiliado Isapre paga además **prima GES mensual por beneficiario** (ficha ChileAtiende 2464) — prima que el artículo omite por completo | Tabla GES con copagos por tramo + prima GES Isapre; citar Supersalud + ChileAtiende |
| F5 | L204: "ajustar el precio… tabla de factores… y el ajuste por IPC anual" | media | **Modelo obsoleto.** Primaria (Supersalud 2026-03-30, APB 2026): adecuación = techo ICSA 3,5% + verificación individual de costos, aplicación uniforme en junio (Leyes 21.350/21.647/21.700), planes <1 año exentos; más prima extraordinaria ≤10% vs jul-2023 y verificación precio GES art 206 bis (Ley 21.674). No existe "ajuste por IPC anual" discrecional | Bloque "cómo sube tu plan hoy": ICSA + verificación + junio + derechos (cambio/desafiliación hasta 31-may); citar APB 2026 |
| F6 | Ausencia total de MCC y Ley Corta en guía "vigente al 2026-04-08" | media | Ley 21.674 (pub. 2024-05-24, extractor idNorma 1203779 verificado arts 1°–4°, 9°) creó MCC (DFL-1 arts 144 bis–octies: voluntaria, B/C/D, prima UF + seguro catastrófico). Estado operativo: **2 licitaciones desiertas** (jun-2025; 11-05-2026, solo Zurich 1/7 fracciones) y Minsal ordenó nuevo modelo (`fonasa.gob.cl/noticias/desierta-licitacion-mcc/`) | Bloque aprobado/vigencia/implementación (NORMA §4): MCC aprobada, NO operativa, en rediseño; más PPA/devolución TUF ($1.198 MM, 21,2% pagado al 30-06-2026, Supersalud 20-08-2026) y veto a dividendos |
| F7 | L116/L131/L196: "cada carga aumenta el precio" sin excepciones | media | Excepción legal verificada (Ley 21.674 art 2° numeral 4, idParte 10501377): **prohibido cobrar cargas no natas y <2 años desde 01-12-2022** (con alza extraordinaria compensatoria Ley 21.647 art 95). Además Fonasa: 3+ cargas reclasifican C→B y D→C (página Tramos) — refuerza el argumento Fonasa y el artículo lo omite | Agregar ambas excepciones con citas |
| F8 | L84: Tramo A incluye "personas con Ficha de Protección Social" | media | **Término extinto 2016** (hoy Registro Social de Hogares). Primaria: Tramo A = "carentes de recursos + causantes subsidio familiar (Ley 18.020)", sin MLE (página Tramos Fonasa) | Reemplazar por definición vigente + nota "Tramo A sin MLE" |
| F9 | Sin `volatileData`; `dataTriggers: []`; cadencia anual en tema de alta rotación regulatoria | media | Registry confirma: 8 datasets, **ninguno de salud** (tramos, copagos, ICSA, prima GES, TUF, deuda PPA). Gate `stale=false` con 3 altas factuales en producción | Opción A: datasets `health.fonasa.tramos_copago` + `health.isapre.apb_icsa` + hito MCC/GES-90. Opción B (mínimo): `dataTriggers` fechados (junio APB, enero excedentes, DS GES). Decisión humana |
| F10 | L118/L178/L200: CAEC "100% sobre deducible" sin red, activación ni banda | baja | Primaria (Supersalud orientación CAEC): deducible = **30x cotización pactada, mín 60 UF / máx 126 UF** por diagnóstico (43x/máx 181 UF multi); anual; **solo Red CAEC con activación previa** (formulario); "algunas isapres" | Completar con banda UF + red + activación; `https://www.superdesalud.gob.cl/tax-materias-isapres/cobertura-adicional-para-enfermedades-catastroficas-caec-4011/` |
| F11 | L121/L134: embarazo "GES sin condición" vs "verificar exclusiones del plan" | baja | Impreciso por ambos lados: GES tiene condiciones de acceso por patología; fuera de GES rigen carencias del plan. Tensión interna con L173 | Reformular: GES sin exclusión **en red y cumpliendo acceso**; fuera de GES valen carencias; NHV-4 |
| F12 | L146: "verifica que la Isapre no está en proceso de liquidación" | baja | Alarmista e inespecífico: 9 isapres operando, **ninguna en liquidación**; sistema 2025: resultado +$15.361 M con operación −$24.593 M (Supersalud 22-04-2026); restricción real = PPA + veto dividendos | Sustituir por estado verificable: PPA vigente, supervigilancia, link resultados Supersalud; NHV-5 |
| F13 | L97–L102: ejemplo $900.000 → +$22.000 "orientativo" | baja | Aritmética OK, contexto incompleto: desde Ley Corta los planes nuevos no pueden pactarse bajo la cotización legal (art 9°/art 188, idParte 10501376) y existen prima extraordinaria (≤10%) + abonos mensuales de devolución TUF que el lector recibe | Nota al ejemplo: piso 7%, prima extraordinaria y devolución mensual; "cada vez menos comunes" → "prohibidos bajo el 7% desde Ley Corta" |
| F14 | L71: "Si no eliges Isapre, quedas automáticamente en Fonasa" + L166 Tramo A "período limitado" | baja | Default Fonasa: esencialmente correcto (páginas `/leyes/` lo corroboran, `relatedArticles` cruzado). L166 "período limitado" vago: Fonasa reclasifica de oficio a A tras 12 meses sin cotizar (Ley 21.674 art 1° num. 6, idParte 10501376) | Precisar mecanismo 12 meses + reincorporación retroactiva si hubo descuento |

## 4. Freshness assessment al 2026-09-18: ¿sigue exacta la comparación?

**No.** El esqueleto (7%, Fonasa acepta preexistencias, cargas sin costo, GES en ambos, MLE con bono) sigue válido, pero tres reglas operativas centrales son falsas (F1 Copago Cero, F2 sexo/TUF, F3 desahucio) y el marco 2024–2026 está ausente (Ley Corta, PPA/devoluciones mensuales en curso, APB-ICSA, MCC fallida, prima GES, DS GES 90 en vuelo). Un lector que elija sistema solo con esta guía pagaría de más en su modelo mental (copagos Fonasa que no existen; precio Isapre por sexo que no existe) y desconocería dinero a su favor (devolución TUF mensual, excedentes de enero). El gate `stale=false / dueDate 2027-04-08` subestima la urgencia: hay 3 altas en producción hoy.

## 5. Verificaciones de pie (resuelven OK)

- **Links internos:** `check-internal-links` OK (54 artículos, 274 links, 0 rotos). Los 5 del artículo resuelven: `/leyes/ley-18469-fonasa/`, `/leyes/ley-18933-isapres/` (colección `laws`, `relatedArticles` cruzado), `/guias/seguridad-financiera/`, `/posts/fraude-tarjeta-que-hacer/`, `/posts/suplantacion-identidad-creditos-no-reconocidos/`. Nota: la página `/leyes/ley-18933-isapres/` apunta su `bcnUrl` al texto congelado pre-refundido (idNorma 30304) — riesgo de staleness heredado, fuera de alcance.
- **Hero image:** `check-hero-images` OK; existen las 3 variantes.
- **Evitó bien:** no da conteo de patologías GES (las fuentes primarias discrepan: 80/87/90; DS GES 90 en trámite — NHV-3) ni umbrales de tramos en el cuerpo.
- **Gates:** los 6 exigidos en verde, ninguno flaggea este slug (verbatim en §8).

## 6. NEEDS-HUMAN-VERIFY (8)

- **NHV-1.** Desahucio vigente: confirmar en DFL-1 art 197 (BCN `idNorma=249177`) que la Ley Corta no tocó el año mínimo, y el procedimiento Compendio actual (¿30 días vs 1 mes? ¿desafiliación Isapre→Isapre sin año?).
- **NHV-2.** TUF vigente post Circular IF/N°468 (13-05-2024): bandas de edad, factores cotizante/carga, y si existe algún movimiento por cambio de tramo etario hoy.
- **NHV-3.** DS GES 90: confirmar publicación y conteo vigente (87 vs 90) + primas GES verificadas (Circular IF/N°516, nov-2025). `superdesalud.gob.cl` / Minsal.
- **NHV-4.** Embarazo: condiciones GES de acceso por patología y carencias no-GES en planes (DFL-1 / Compendio Beneficios).
- **NHV-5.** Estado Isapres sep-2026: ¿algún régimen especial de supervigilancia (art 221) activo? ¿intervenciones? (Supersalud estados financieros).
- **NHV-6.** "Segunda Modalidad": el término no se pudo mapear a fuente oficial (búsqueda solo devolvió contexto tributario SII). Confirmar si alude a cambios 2025–2026 del arancel MLE/bonificaciones y la página canónica de valores (`fonasa.cl/.../valor-bono`, link del artículo, no verificado en vivo).
- **NHV-7.** CAEC 2026: isapres que la ofrecen hoy (ChileAtiende lista 8; falta Fundación/Cruz del Norte) y vigencia de la banda 60–126 UF.
- **NHV-8.** Base legal del 7% para cita canónica (el extractor no halló "siete/7 por ciento" en DFL-1; candidato DL 3500 art 84 u otro) — confirmar artículo antes de citar.

## 7. Qué exigiría un refresh (lista explícita, sin ejecutar)

1. Reescribir tabla tramos/MAI (F1), precio Isapre sin sexo (F2), desahucio 1 año + 1 mes (F3); `validAsOf` → fecha real; `updatedDate` ≥ esa fecha.
2. Nuevos bloques: Ley Corta/MCC/PPA/devoluciones (F6, NORMA §4), APB-ICSA + prima extraordinaria + prima GES (F4, F5), excepciones de cargas (F7).
3. Micro-correcciones: Tramo A sin FPS + sin MLE (F8), CAEC con banda/red/activación (F10), embarazo (F11), liquidación→PPA (F12), ejemplo con piso 7% (F13), reclasificación 12 meses (F14).
4. Gobierno de datos: datasets o `dataTriggers` (F9); alinear con `PLAN-content-refresh-consolidation` (este slug figura en cola con sensibilidad alta, artefactos B→D→O→d→P +C).
5. Separación de deberes (INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES): quien redacte no firma compliance; gates de publicación los firma humano.
6. Re-ejecutar `check:ci` + verificación rutas/RSS si cambia el cuerpo (no se toca slug).

## 8. Salidas de gates (verbatim, read-only)

- `node scripts/check-frontmatter.mjs` → `[check-frontmatter] Scanned 54 articles.` … `[check-frontmatter] OK (no blocking errors).` EXIT 0.
- `node scripts/check-editorial-structure.mjs` → WARN solo en 2 slugs ajenos (`bancos-y-fintech-chile`, `finanzas-para-migrantes-chile`); este artículo sin warnings. EXIT 0.
- `node scripts/check-dialect.mjs` → `[check-dialect] OK. validated=54 files skipped_by_marker=0` EXIT 0.
- `node scripts/check-editorial-timeliness.mjs` → `[check-editorial-timeliness] published=54 stale=0 drift=0 report=output/validation/editorial-timeliness/report.json` EXIT 0. Registro del slug: `reviewDate 2026-04-08, dueDate 2027-04-08, stale false, volatileData []`.
- `node scripts/check-internal-links.mjs` → `Scanned 54 published articles, 274 internal links. No broken links found.` EXIT 0 (1 huérfano ajeno: `cotizacion-voluntaria-afp-independiente.md`, warning).
- `node scripts/check-hero-images.mjs` → `Checked published articles: 54 … OK` EXIT 0.

## 9. Técnica extractor vs pendiente humano

**Extractor BCN (`/tmp/opencode/bcn-spike/extract.mjs`, API `get_norma_json`, UA navegador; solo se da por verificado donde número/título del artículo coinciden con la norma esperada):** Ley 18.933 idNorma 30304 (arts 32 bis, 33, 38, 38 bis, 38 ter — con la salvedad de que 30304 no trae notas de Ley 21.674: snapshot pre-refundido); DFL-1 idNorma 249177 Última Versión (art 197 desahucio; art 199 tabla factores; art 189 catastróficas); Ley 21.674 idNorma 1203779 Única pub. 2024-05-24 (arts 1° idParte 10501376, 2° 10501377, 3° 10501378, 4° 10501379, 9° 10501384). **Fetch directo primario:** página Tramos Fonasa, Supersalud (APB 2026, restitución TUF ago-2026, excedentes ene-2026, resultados 2025, Circular 343, CAEC, GES), ChileAtiende ficha 2464, Fonasa MCC desierta. **Prensa solo como lead contextual** (La Tercera MCC). **Pendiente humano:** los 8 NHV del §6 (detalle TUF/IF-468, DS GES 90, carencias embarazo, supervigilancia, "Segunda Modalidad"/MLE, CAEC 2026, base legal 7%).
