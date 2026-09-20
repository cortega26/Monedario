# AUDIT — `credito-hipotecario-chile-guia-completa` (2026-09-20)

- **Archivo auditado:** `src/data/blog/credito-hipotecario-chile-guia-completa.md`
- **Fecha de auditoría:** 2026-09-20 (UTC). **Acceso a fuentes:** 2026-09-20.
- **Criterio:** `docs/editorial/NORMA_YMYL.md` v1.0.
- **Alcance:** solo lectura del artículo + este reporte. No se tocó nada más
  (separación de funciones: esta sesión NO remedia).
- **Hard stops respetados:** sin cambios de slug/canonical/título/héroe/ruta/
  código/registro; ninguna URL derivada de `post.id`; ningún gate marcado
  `[X]`; sin nuevas superficies indexables; sin auto-posting.

## Veredicto

**REJECT — tres afirmaciones legales/tributarias falsas (prepago, LTV,
DFL2) exigen remediación antes de mantener la publicación.**

## Conteo de severidad

- **Bloqueantes: 3** — **Mayores: 6** — **Menores: 9**

## Gates de lectura (6) — resultado y salida VERBATIM

Los scripts no aceptan arg de ruta (escaneo repo-wide); el archivo objetivo
no aparece en ninguna línea de fallo/advertencia. Invocaciones reales usan
`:` (`check-frontmatter` no existe como script; ver salida 1).

### 1. `pnpm run check:frontmatter` → PASS (exit 0)

```text
$ node scripts/check-frontmatter.mjs
[check-frontmatter] Scanned 54 articles.
[check-frontmatter] Deprecation counters:
- pubDatetime: 0
- modDatetime: 0
- canonicalURL: 0
- ogImage: 0
[check-frontmatter] Transition defaults:
- slug_missing: 0
- category_missing: 0
[check-frontmatter] Quality warnings (Level 2):
- title_range: 0
- description_range: 0
[check-frontmatter] OK (no blocking errors).
```

Nota: `pnpm run check-frontmatter` (con guion, como pedía el encargo)
falla con `[ERR_PNPM_NO_SCRIPT] Missing script: check-frontmatter ...
Did you mean "pnpm run check:frontmatter"?`. Se usó el nombre real.

### 2. `pnpm run check:editorial-structure` → PASS (exit 0; 2 WARN ajenos)

```text
$ node scripts/check-editorial-structure.mjs
[check-editorial-structure] WARN. long_warning=2 (recommended max 155, hard max 200).
- src/data/blog/bancos-y-fintech-chile.md: description length 160 exceeds recommended max 155 (non-blocking).
- src/data/blog/finanzas-para-migrantes-chile.md: description length 175 exceeds recommended max 155 (non-blocking).
[check-editorial-structure] WARN. cluster_missing=0 cluster_invalid=0 cluster_link_warning=2 cluster_coverage_pct=100 cluster_with_value=54 validated=54 min_cluster_internal_links=1 (warning-first rollout).
- src/data/blog/bancos-y-fintech-chile.md: has 0 intra-cluster internal links (min 1).
- src/data/blog/finanzas-para-migrantes-chile.md: has 0 intra-cluster internal links (min 1).
[check-editorial-structure] OK. validated=54 cluster_with_value=54 cluster_coverage_pct=100 cluster_missing=0 cluster_invalid=0 cluster_link_warning=2 title_missing=0 title_meaningless=0 markdown_h1_present=0 title_slug_warning=0 internal_links_warning=0 skipped_internal_links=0 duplicate_titles=0 duplicate_slugs=0 missing=0 short=0 long_fail=0 long_warning=2 duplicates=0 min_h2=2 min_section_words=8 min_internal_links=1 min_cluster_internal_links=1
```

Ninguna advertencia toca el archivo auditado.

### 3. `pnpm run check:dialect` → PASS (exit 0)

```text
$ node scripts/check-dialect.mjs
[check-dialect] OK. validated=54 files skipped_by_marker=0
```

### 4. `pnpm run check:reader-facing-copy` → PASS (exit 0)

```text
$ node scripts/check-reader-facing-copy.mjs
[check-reader-facing-copy] scope=all diff="-" scanned=94 issues=0
[check-reader-facing-copy] OK. No blocking issues found.
```

### 5. `pnpm run check:links` → PASS (exit 0; 1 huérfano ajeno)

```text
$ node scripts/check-internal-links.mjs
[check-internal-links] Scanned 54 published articles, 274 internal links.
[check-internal-links] No broken links found. ✓

[check-internal-links] Orphan articles (no inbound links, 1):
  src/data/blog/cotizacion-voluntaria-afp-independiente.md
  Tip: orphans are warnings, not errors. Add internal links or hub references.
```

Nota: el encargo pedía `check-internal-links`; el script real es
`check:links` (`node scripts/check-internal-links.mjs`). Cero links rotos.

### 6. `pnpm exec prettier --check <file>` → PASS (exit 0)

```text
Checking formatting...
All matched files use Prettier code style!
```

## Links internos y `trailingSlash`

Verificados a mano los 11 hrefs internos del artículo: todos terminan en
`/` (`/posts/que-es-la-uf/`, `/calculadoras/dividendo-hipotecario/` ×2,
`/glosario/credito-hipotecario/`, `/posts/informe-deudas-cmf-vs-dicom/`,
`/posts/cae-costo-real-credito-chile/` ×2,
`/glosario/dividendo-hipotecario/`,
`/posts/contribuciones-bienes-raices-chile/`,
`/guias/uf-costo-de-vida/`, `/calculadoras/prepago-credito/` ×2 más
`calculatorHref`/`nextStepHref` del frontmatter). **PASS.**

## Frontmatter / frescura

- `pubDate: 2026-04-09`, `updatedDate: 2026-04-12`, `validAsOf: 2026-04-09`,
  cuerpo l.80 "vigente al 2026-04-09" y l.241 "vigente a abril 2026".
  `updatedDate` es 3 días posterior a `validAsOf` sin registro de qué
  cambió (ver m8). No existe sección "Última revisión", por lo que el MUST
  §1.1.9 se cumple formalmente, pero la señal es ruidosa.
- `volatileData.economic.uf.value.expectedValue: 40844.79` (sync reference)
  vs snapshot del repo al 2026-09-19: UF **40967.24**
  (`src/infrastructure/economic/economic-parameters.snapshot.json` l.2,
  `indicatorUpdatedAt.uf: 2026-09-19`). Deriva +0,3%: materialmente
  trivial, pero confirma 5 meses sin re-verificación (ver m8).

## Tabla de hallazgos

Leyenda: **B** = bloqueante (MUST), **M** = mayor, **m** = menor.
Todas las URLs de evidencia fueron recuperadas **en esta sesión
(2026-09-20)**.

| ID  | Líneas | Afirmación del artículo | Evidencia primaria (URL + acceso) | Sev |
| --- | ------ | ----------------------- | --------------------------------- | --- |
| B1  | FAQ l.57-58; l.235 | "La Ley 21.236 (Portabilidad Financiera) elimina las comisiones de prepago para créditos hipotecarios… sin costo adicional" | **FALSO.** La propia Ley 21.236 presupone la comisión: art. 3 N°3 define "Costo total de prepago… incluida la correspondiente comisión de prepago en su caso" (cita literal vía `node scripts/bcn-cite.mjs 1146340 --art 3`, idNorma=1146340). CMF vigente: el prepago de **mutuos** cuesta capital + intereses devengados + **comisión de 1 a 1,5 meses de intereses**; en **letras**, dividendos del trimestre + **comisión de un período de amortización (~3 meses)** — https://www.cmfeduca.cl/educa/600/w3-article-27382.html (2026-09-20). Lo que la ley sí eliminó vía subrogación fue **reconstituir garantías** (historia de la ley; González Ron: "se eliminan todos los costos… asociados a la constitución de nuevas garantías", no la comisión). | **B** |
| B2  | l.112-115; FAQ l.49-50 | "La CMF establece límites: primera vivienda LTV máximo 90%… segunda 80%" / "Para primera vivienda, el mínimo legal es 10%" | **FALSO como límite legal/CMF.** CMF: "las entidades financieras… poseen autonomía para establecer condiciones de otorgamiento" y "cada institución… posee autonomía" — https://www.cmfeduca.cl/educa/600/w3-article-27376.html (2026-09-20). El estándar prudencial de mercado es **80%** (90% solo con garantía estatal FOGAES/programas); a ago-2026 la CMF solo **evalúa** permitir 90% general (Chócale 2026-08-31). No existe "mínimo legal" de pie del 10%. | **B** |
| B3  | FAQ l.61-62; l.220-221 | DFL2 (≤140 m²): "la ganancia de capital al vender queda exenta del IGC si… menos de dos propiedades en los últimos 10 años" | **FALSO.** BCN: "ésta es la única posibilidad… para no tributar por la venta… en cumplimiento de un contrato de arrendamiento con opción de compra (leasing)… cualquier otra hipótesis de ganancia de capital… no accederá al beneficio… régimen general del artículo 17 N° 8, letra b, LIR" — https://obtienearchivo.bcn.cl/obtienearchivo?id=repositorio%2F10221%2F33496%2F2%2FHistoria_de_los_beneficios_tributarios_D.F.L._N__2_Edit..pdf (2026-09-20). La regla "dos en 10 años" no existe en ninguna fuente. Además omite: solo personas naturales, tope 2 viviendas (SII Circular 22/2022 — https://www.sii.cl/normativa_legislacion/circulares/2022/circu22.pdf). La página SII citada por el artículo (…/001_165_2439.htm, actualizada 09/04/2026) solo explica **cómo consultar** si aplica, no respalda el beneficio descrito. | **B** |
| M1  | l.139; FAQ l.54 | Tasa variable "ligada a la TPM del Banco Central (referencia + spread)" | CMF: la variable "cambia de acuerdo a un índice de referencia (**por ejemplo, TAB**)" — https://www.cmfeduca.cl/educa/600/w3-article-27383.html (2026-09-20). TAB ≠ TPM (la TAB sigue a la TPM pero es otro instrumento). Benchmark erróneo. | **M** |
| M2  | Tabla l.193-201; l.205, l.227 | Costos de cierre 1%-1,5% sin impuesto de timbres y estampillas | CMF lista como costo a cargo del cliente el "**Impuesto de timbres y estampillas** (de recaudación fiscal)" — https://www.cmfchile.cl/educa/621/w3-propertyvalue-45015.html (2026-09-20). Omitirlo subestima el total (ver recomputo §). | **M** |
| M3  | l.147, l.231 | "Hoja de Condiciones (CAE)" / "documento —que el banco está obligado a darte antes de que firmes—" | Confunde documento con indicador: la **Carga Anual Equivalente** es un ítem informativo (Ley 21.236 art. 17D letra f), no el documento. La página CMF de comparación no menciona "Hoja de Condiciones" como obligación — https://www.cmfeduca.cl/educa/600/w3-article-27503.html (2026-09-20). Obligación sin fuente → NEEDS-HUMAN-VERIFY. | **M** |
| M4  | l.215 | Desgravamen "cubre el saldo… si el deudor fallece o queda con discapacidad total" como estándar | CMF: cubre "el saldo insoluto… por muerte"; la "**cobertura adicional de invalidez 2/3**" se contrata aparte — https://www.cmfeduca.cl/educa/600/w3-article-27503.html y /w3-article-27376.html (2026-09-20). Presentar invalidez como incluida por defecto es impreciso en cobertura. | **M** |
| M5  | l.44-47 (limits); § tasas | Guía "2026" sin mencionar el **subsidio a la tasa** (Ley 21.748, vivienda nueva ≤ 4.000 UF) | CMF lo destaca como tip vigente en todas sus fichas hipotecarias ("puede postular al subsidio a la tasa… Ley 21.748" — https://www.cmfeduca.cl/educa/600/w3-article-27383.html (2026-09-20)). La exclusión declarada cubre solo MINVU DS49/DS19, no este subsidio a la tasa: brecha de cobertura material para compradores 2026. | **M** |
| M6  | l.112-115, l.220-221, l.235 | Síntesis jurídicas (LTV, DFL2, prepago) sin etiqueta | NORMA_YMYL §3.2 exige etiqueta "**resumen orientativo**" + limitadores en toda síntesis jurídica. Ninguna la lleva. | **M** |
| m1  | l.106-108; lead l.25 | Dividendo ≤ 25%-30% renta; deudas totales ≤ 35%-40% como "regla general" | CMF: "varias instituciones recomiendan… como máximo equivalente al **25%**" — https://www.cmfchile.cl/educa/621/w3-propertyvalue-45015.html (2026-09-20). El techo 30%/40% excede la primaria y va sin atribución. | m |
| m2  | FAQ l.52 | "La CMF publica estadísticas mensuales de tasas promedio" | El publicador de la serie mensual es el **Banco Central** (BDE, serie F022.VIV.TIP.MA03.UF.Z.M) — https://si3.bcentral.cl/siete/ES/Siete/Cuadro/CAP_TASA_INTERES/MN_TASA_INTERES_09/TSF_27 (2026-09-20); https://www.bcentral.cl/areas/estadisticas/tasas-de-interes. El propio frontmatter del artículo atribuye bien (BCCh). Inconsistencia interna. | m |
| m3  | l.142-145; FAQ l.52 | "Tasas en 2026: 4,0%-5,5% anual" / "Fija a 20 años ≈ 4,0%-5,5%" | BCCh: promedio vivienda UF Abr-2026 **3,98%** (Ene-Ago 2026: 3,96%-4,12%) — BDE (2026-09-20); La Tercera 2026-07-07 confirma ~3,97% en junio. El promedio cae en el piso del rango; el techo 5,5% va sin fuente. Etiquetado "orientativo": tolerable pero a re-verificar. | m |
| m4  | l.217 | Incendio/sismo: "Protege la propiedad" | CMF: "normalmente cubre **sólo el saldo de la deuda** si el bien raíz se siniestra" — https://www.cmfchile.cl/educa/621/w3-propertyvalue-45015.html (2026-09-20). | m |
| m5  | l.90-94 | Otorgantes: bancos + **cajas de compensación** + mutuarias (Tanner, Consorcio) | CMF lista "bancos, **cooperativas y compañías de seguros**" (además de mutuarias en otra ficha) — https://www.cmfeduca.cl/educa/600/w3-article-27376.html y https://www.cmfchile.cl/educa/621/w3-propertyvalue-45015.html (2026-09-20). Cajas y marcas-ejemplo sin fuente → NEEDS-HUMAN-VERIFY. | m |
| m6  | l.126 | Honorarios: "2 años de liquidaciones mensuales constantes" | CMF pide a independientes "**declaraciones de renta**"; los honorarios emiten **boletas**, no liquidaciones — https://www.cmfeduca.cl/educa/600/w3-article-27376.html (2026-09-20). Terminología errónea. | m |
| m7  | l.153, l.169-187, tabla costos, l.171, l.199 | Plazos (60-90 días, 5-10/10-15/2-5/5-15 hábiles), montos ($150-250k, $100-200k, $150-400k, 0,2-0,3%, 0-1%), "menor valor entre precio y tasación" | Práctica bancaria presentada como regla sin fuente (banco o SERNAC). CMF confirma que existen esos costos pero sin montos. Todo el § proceso/costos es no-trazable → NEEDS-HUMAN-VERIFY por ítem. | m |
| m8  | Frontmatter + l.80 | `updatedDate` 2026-04-12 vs `validAsOf`/cuerpo 2026-04-09 sin registro; UF 40844.79 vs 40967.24 actual | MUST §1.1.9 formalmente OK (no hay sección "Última revisión"), pero el skew de 3 días sin cambio documentado viola el espíritu de §5.3. Deriva UF +0,3% en 5 meses. Refresco debido. | m |
| m9  | l.234 | "Si la inflación es 4% anual, en 10 años pagas ~50% más en pesos" | Recomputo: 1,04^10 − 1 = **48,02%**. "~50%" es redondeo aceptable. **Verificado.** | m |

Verificados sin objeción (constan para trazabilidad): definición con
garantía e inscripción CBR constitutiva — Código Civil art. 686 cita literal
vía `node scripts/bcn-cite.mjs 172986 --art 686` ("la tradición… por la
inscripción… en el Registro del Conservador", idNorma=172986); dos seguros
obligatorios (desgravamen + incendio) — CMF; aritmética de ejemplos (ver §).

## Recomputo matemático (a mano)

- Renta $2.000.000 → 0,25 × 2.000.000 = **$500.000**; 0,30 × 2.000.000 =
  **$600.000**. ✓ Coincide con l.108.
- Cierre sobre $100.000.000 → 0,01 × 100M = **$1.000.000**; 0,015 × 100M =
  **$1.500.000**. ✓ Aritmética de l.207 correcta, pero **incompleta**:
  suma de la propia tabla (tasación 150-250k + estudio 100-200k + notaría
  150-400k + CBR 0,2-0,3% = 200-300k) = **$600.000-$1.150.000
  (0,6%-1,15%)** antes de operacionales (0-1% → hasta 2,15%), y **sin**
  timbres (M2). El rango 1%-1,5% declarado no se deriva de su tabla.
- UF +4% anual 10 años → 1,04^10 − 1 = **48,02%** ≈ "~50%". ✓ (m9).
- El artículo no trae ningún dividendo/CAE desarrollado (cuota en UF,
  fórmula de amortización); nada más que recomputar.

## NEEDS-HUMAN-VERIFY (7, con URL exacta)

1. Obligación de entregar "Hoja de Condiciones" pre-firma y su nombre
   exacto — https://www.bcn.cl/leychile/navegar?idNorma=230416 (Ley
   19.496; `bcn-cite 230416 --art 17` devolvió NOT_FOUND en esta sesión)
   y https://www.cmfeduca.cl/educa/600/w3-article-27503.html.
2. Tasa exacta del impuesto de timbres y estampillas hipotecario y rebaja
   DFL2 — https://www.bcn.cl/leychile/navegar?idNorma=1146340 (contexto)
   más DL 3.475 en https://www.leychile.cl/ (sin idNorma confirmado).
3. Cajas de compensación como originadoras de hipotecarios y ejemplos
   Tanner/Consorcio — https://www.cmfchile.cl/educa/621/w3-propertyvalue-45015.html
   (no las lista; SUSESO confirma cajas como proveedoras de crédito social,
   no hipotecario: https://www.suseso.gob.cl/612/w3-article-602139.html).
4. Plazos del proceso (60-90 días y sub-plazos en días hábiles) — sin
   fuente oficial; requiere tarifarios/cartas de bancos o SERNAC:
   https://www.sernac.cl/.
5. Techo 5,5% fija 20 años y costos unitarios de la tabla (tasación,
   notaría, estudio, CBR 0,2-0,3%, operacionales 0-1%) — pizarras de
   bancos/mutuarias a sep-2026.
6. Texto vigente exacto del beneficio DFL2 (art. 15 y límites arts. 1/18)
   — https://www.sii.cl/preguntas_frecuentes/aval_contrib_bbrr/001_165_2439.htm
   (solo cubre consulta) y DFL N° 2 de 1959 en https://www.leychile.cl/.
7. Subsidio a la tasa Ley 21.748 (elegibilidad, vigencia, tope 4.000 UF) —
   https://bcn.cl/44Wyks (acortador citado por CMF; resolver a idNorma).

## Requisitos de refresco (para la sesión de remediación — sin fixes aquí)

1. Re-verificar B1-B3 contra las primarias citadas y reescribir: prepago
   **con** comisión según instrumento (CMF); LTV como política por
   institución + 80% estándar / 90% solo con garantía estatal; DFL2 solo
   leasing-enajenación + régimen general art. 17 N° 8 letra b LIR.
2. Corregir M1 (TAB, no TPM), M2 (agregar timbres), M3 (CAE = indicador;
   verificar obligación documental), M4 (invalidez adicional), M5 (sumar
   subsidio tasa o justificar exclusión), M6 (etiqueta resumen
   orientativo §3.2).
3. Re-verificar m2-m3-m7-m8 con datos sep-2026 (BDE, pizarras, snapshot UF)
   y alinear `updatedDate`/`validAsOf`/cuerpo con registro de cambio
   (§5.3); resolver NEEDS-HUMAN-VERIFY 1-7 antes de republicar.
4. Scorecard NORMA_YMYL: respuesta ancla 8/10 (concreta pero con regla
   falsa de pie), precisión+fuentes 4/10 (B1-B3), vigencia 6/10, cobertura
   6/10 (falta subsidio tasa), claridad 8/10 → **~5,9/10 < 9,5**: no
   publicable sin iteración (§7).

## Integridad de la sesión

- Solo se creó este reporte; el artículo y todo lo demás intactos.
- `pnpm exec prettier --check` sobre este reporte: PASS (verificado
  tras escribir).
- `git diff --check`: limpio. `git status --short`: solo este archivo
  como untracked (más la suciedad preexistente que hubiera, reportada
  abajo sin tocarla).
