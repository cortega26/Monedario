# AUDIT — `como-salir-boletin-comercial-chile` — 2026-09-20

- Artículo: `src/data/blog/como-salir-boletin-comercial-chile.md`
- Slug auditado: `como-salir-boletin-comercial-chile`
- Fecha de auditoría: 2026-09-20 (todas las fuentes primarias recuperadas en esta sesión)
- Auditor: sesión adversarial YMYL (solo audita; no remedia — separación de funciones)
- Criterio: `docs/editorial/NORMA_YMYL.md` v1.0 (ACTIVA 2026-03-02)
- Alcance: SOLO este archivo. No se tocó nada más (sin slugs, canónicas, títulos, héroes, rutas, código ni registros).

## Veredicto

**REJECT — el procedimiento central del artículo (plazo, canal de reclamo y vigencia) contradice a las fuentes primarias.**

Conteos de severidad: **bloqueantes: 4 · mayores: 7 · menores: 4.**

## 1. Gates de solo lectura (ámbito: este archivo; salida VERBATIM, nada corregido)

Nota de invocación: `package.json` no tiene scripts `check-frontmatter` (con guion);
los nombres exactos usan dos puntos (`check:frontmatter`, etc.) y el gate de enlaces
internos es `pnpm run check:links` (`node scripts/check-internal-links.mjs`).
Ningún script acepta arg de ruta (ignoran el path y corren repo-wide); el archivo
no aparece nombrado en ninguna salida de error/advertencia, es decir, está limpio
dentro de corridas globalmente PASS (con warnings ajenos al archivo).

### Gate 1 — `pnpm run check:frontmatter` → PASS (exit 0)

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

### Gate 2 — `pnpm run check:editorial-structure` → PASS con warnings ajenos (exit 0)

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

### Gate 3 — `pnpm run check:dialect` → PASS (exit 0)

```text
$ node scripts/check-dialect.mjs
[check-dialect] OK. validated=54 files skipped_by_marker=0
```

### Gate 4 — `pnpm run check:reader-facing-copy` → PASS (exit 0)

```text
$ node scripts/check-reader-facing-copy.mjs
[check-reader-facing-copy] scope=all diff="-" scanned=94 issues=0
[check-reader-facing-copy] OK. No blocking issues found.
```

### Gate 5 — `pnpm run check:links` (== `check-internal-links`) → PASS (exit 0)

```text
$ node scripts/check-internal-links.mjs
[check-internal-links] Scanned 54 published articles, 274 internal links.
[check-internal-links] No broken links found. ✓

[check-internal-links] Orphan articles (no inbound links, 1):
  src/data/blog/cotizacion-voluntaria-afp-independiente.md
  Tip: orphans are warnings, not errors. Add internal links or hub references.
```

### Gate 6 — `pnpm exec prettier --check <archivo>` → PASS (exit 0)

```text
Checking formatting...
All matched files use Prettier code style!
```

Resumen gates: **6/6 PASS** (2 con warnings en archivos ajenos, ninguno en el auditado).
Los gates mecánicos NO detectan falsedad jurídica: todos los bloqueantes de este
informe son invisibles para ellos.

## 2. Tabla de hallazgos

Leyenda: B = bloqueante (regla/cifra/procedimiento falso — NORMA §1.1 MUST),
M = mayor, m = menor. Evidencia primaria con URL + fecha de acceso 2026-09-20.
Citas legales verificadas vía `node scripts/bcn-cite.mjs` (fail-closed) en esta sesión.

| ID | Líneas | Afirmación del artículo | Evidencia primaria (URL + acceso 2026-09-20) | Sev |
|----|--------|-------------------------|----------------------------------------------|-----|
| B1 | L24, L43, L63, L92, L107, L111–113, L153 | "El acreedor tiene la obligación legal de comunicar el pago a la CCS dentro de **5 días hábiles**… establecido en la **Ley 20.575**" | `bcn-cite 141599 --art 19` (Ley 19.628, https://www.bcn.cl/leychile/navegar?idNorma=141599): "éste avisará tal hecho, a más tardar dentro de los siguientes **siete días hábiles**, al responsable del registro…". `bcn-cite 1037366 --art 1..8` (Ley 20.575, https://www.bcn.cl/leychile/navegar?idNorma=1037366): sus 8 artículos (finalidad, distribuidores, principios, encargado, certificación, infracciones, modificación art. 17 Ley 19.628, salud) **no contienen ningún plazo de 5 días ni procedimiento de eliminación**. Cifra falsa + atribución falsa, repetida ~7 veces incluyendo answer/FAQ/tabla/pasos. | B |
| B2 | L24, L63, L94, L161 | "Las deudas pagadas se eliminan por ley; **las impagas persisten indefinidamente — no hay un plazo automático de borrado** mientras no haya pago" | `bcn-cite 141599 --art 18` (https://www.bcn.cl/leychile/navegar?idNorma=141599): "En ningún caso pueden comunicarse los datos… **luego de transcurridos cinco años desde que la respectiva obligación se hizo exigible**". `bcn-cite 16346 --art 10` (D.S. 950, https://www.bcn.cl/leychile/navegar?idNorma=16346): "Las publicaciones… **dejarán de tener vigencia**… b) Si han transcurrido **más de 5 años** de la respectiva publicación". Existe tope automático aunque la deuda siga impaga; "indefinidamente" es falso. (Matiz honesto: el conteo corre desde exigibilidad —art. 18— o publicación —D.S. 950—, no desde que "dejaste de pagar"; y "pérdida de vigencia" ≠ extinción de la obligación.) | B |
| B3 | L43, L49, L93, L97, L111–117, L119, L135–139, L153, L161, L165, L169, L69 | "El Boletín está **bajo supervisión de la CMF**", "**La CMF tiene jurisdicción**", "reclama ante la CMF", "**La CMF puede intimar/exigir al acreedor**" | (a) Página CMF citada por el propio frontmatter, https://www.cmfchile.cl/educa/621/w3-article-27663.html (fetch 2026-09-20): el Boletín de Informaciones Comerciales y DICOM-Equifax "son **empresas privadas, no sujetas a fiscalización de este Organismo**… debe dirigirse directamente a esas entidades". La fuente oficial del artículo **contradice** al artículo. (b) `bcn-cite 141599 --art 16` (https://www.bcn.cl/leychile/navegar?idNorma=141599): el remedio es recurrir al **juez de letras en lo civil**; `bcn-cite 141599 --art 19` in fine y `bcn-cite 1037366 --art 6` remiten las infracciones al art. 16 (vía judicial), no a la CMF. (c) Portal verificado https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-43332.html: "Reclamos contra **entidades supervisadas**" — la CCS/Equifax no lo son. La columna vertebral procedimental del artículo es una vía inexistente. | B |
| B4 | L137 | "La **Ley 21.719** (…2024, **vigente a 2026-04-09**) otorga derechos de rectificación y supresión" | `bcn-cite 1209272 --transitorio primero` (https://www.bcn.cl/leychile/navegar?idNorma=1209272): las modificaciones "entrarán en vigencia el día **primero del mes vigésimo cuarto posterior a la publicación**" (publicada 2024-12-13 → **2026-12-01**). Corroborado por guía oficial https://wikiguias.digital.gob.cl/datos-personales/guia-practica-implementacion-nueva-ley-datos-personales ("entrará en vigencia el 1 de diciembre de 2026"). Al 2026-04-09 la ley estaba aprobada pero NO vigente: violación NORMA §4 (aprobado≠vigencia≠implementación). Además el futuro ente fiscalizador es la Agencia de Protección de Datos, no la CMF. | B |
| M1 | L29–32 (frontmatter `officialSources`) | Fuente rotulada "**CMF Chile — Boletín Comercial**" → `https://www.cmfchile.cl/educa/621/w3-article-27663.html` | Fetch 2026-09-20: esa URL es "**¿Qué es el Informe de Deudas de CMF?**" (informe de deudores bancarios), no una ficha del Boletín Comercial; y su texto declara que Boletín/DICOM **no** son fiscalizados por la CMF. Atribución oficial engañosa que invierte el sentido de la fuente (NORMA MUST 4). El link BCN Ley 20.575 (`idNorma=1037366`) sí resuelve, pero esa ley no respalda ninguna regla del artículo (ver B1). | M |
| M2 | L77–80 | "Qué **no** registra directamente: deudas de tarjetas/créditos bancarios que aún no llegaron a protesto…" | `bcn-cite 16346 --art 1` N°4 (https://www.bcn.cl/leychile/navegar?idNorma=16346): "los bancos… **podrán remitir la nómina de los deudores morosos** en el servicio de sus préstamos o créditos" (mensual, con RUT y monto). Morosidades bancarias SÍ pueden publicarse sin protesto previo. Exclusión falsa (el hedge "directamente" no la salva). | M |
| M3 | L51, L169 | "La **Ley 20.575 obliga** al servicio a ofrecer una **consulta básica gratuita**" (en boletincomercial.cl) | `bcn-cite 1037366 --art 3` (https://www.bcn.cl/leychile/navegar?idNorma=1037366): la gratuidad cuatrimestral es sobre "**la información consignada en dicho sistema [de registro de accesos y entregas]** durante los últimos doce meses", no sobre una consulta básica del Boletín. Ningún artículo 1–8 de la Ley 20.575 crea esa obligación para el Boletín. `https://www.boletincomercial.cl/` no fue verificable por fetch (sitio JS, solo devuelve "Sitio Público") → ver NEEDS-HUMAN-VERIFY N1. Cita legal sin respaldo. | M |
| M4 | (omisión, todo el cuerpo) | Faltan excepciones relevantes exigidas por NORMA MUST 5 | `bcn-cite 141599 --art 17` (https://www.bcn.cl/leychile/navegar?idNorma=141599) verifica: **bloqueo por cesantía** (incs. 3–6: AFC comunica beneficiarios, bloqueo sin costo, 3 meses renovables), y exclusiones de comunicación: créditos INDAP, obligaciones **repactadas/renegociadas/novadas o con modalidad pendiente**, servicios **electricidad/agua/teléfono/gas**, deudas **educación superior**, deudas de **salud**, deudas con **concesionarios de autopistas (tag)**. Ironía: lo único que la Ley 20.575 sí modificó (art. 7 → repactadas + tag) no se menciona. El artículo solo contempla tag/servicios parciales en L79–80 sin base citada. | M |
| M5 | L88–95 (tabla) | Tabla "resumen orientativo" con columna "Base legal" falsa/incompleta + disclaimer no canónico | Filas "5 días… Ley 20.575" (falso, ver B1) y "Deuda impagada… —" (oculta art. 18 Ley 19.628 y D.S. 950 art. 10, ver B2). La bajada L88 dice "resumen orientativo" pero **no reproduce la Nota obligatoria verbatim** de NORMA §3.2 (limitadores + "revisa la fuente oficial o asesórate"). MUST 7 cumplido a medias con contenido falso. | M |
| M6 | (omisión estructural) | El artículo **nunca cita** las normas que realmente regulan lo que afirma: D.S. 950 (reglamento del Boletín) ni Ley 19.628 arts. 12/16/18/19 | Verificados por `bcn-cite` esta sesión: D.S. 950 https://www.bcn.cl/leychile/navegar?idNorma=16346 (operador CCS, aclaraciones gratuitas desde 2010 —art. 4—, pérdida de vigencia —art. 10—); Ley 19.628 https://www.bcn.cl/leychile/navegar?idNorma=141599 (gratuidad info/modificación/eliminación —art. 12—, vía judicial —art. 16—, tope 5 años y cese post-pago —art. 18—, aviso 7 días —art. 19—). El artículo hermano `informe-deudas-cmf-vs-dicom.md` L138 sí cita correctamente el art. 18 → incoherencia intra-sitio. Falla NORMA MUST 4 (cada regla crítica con su fuente oficial real). | M |
| M7 | L47, L97, L161 | "Para eliminar un registro prescrito… **reclamar ante la CMF acreditando la prescripción**" | CC art. 2515 verificado (`bcn-cite 172986 --art 2515`, https://www.bcn.cl/leychile/navegar?idNorma=172986: "tres años para las acciones ejecutivas y **cinco para las ordinarias**") — la cifra 5 años es correcta, pero el procedimiento es inventado: la prescripción se alega ante **tribunal** (no ante la CMF, que no fiscaliza el Boletín — ver B3) y el cese del dato lo rige el art. 18 (5 años desde exigibilidad), independiente de la prescripción civil. Confunde prescripción de la acción con caducidad del dato. | M |
| m1 | L123 | "Si **el CMF tendrá** información relevante…" | Redacción defectuosa (tiempo verbal + artículo: "la CMF tiene"). Los gates mecánicos la pasan; es copia visible al lector. | m |
| m2 | L8, L27 | `updatedDate: 2026-04-12` vs `validAsOf: 2026-04-09` (3 días de desfase, sin sección "Última revisión" que los concilie) | NORMA §5/MUST 9: desfase leve sin registro visible de qué cambió. Solo higiene de frescura. | m |
| m3 | L31–32 | Etiqueta "**Ley 20.575 — Derecho al olvido**" | Título BCN real: "ESTABLECE EL PRINCIPIO DE FINALIDAD EN EL TRATAMIENTO DE DATOS PERSONALES" (`bcn-cite 1037366`). "Derecho al olvido" es apodo de prensa; imprecisión menor de rotulado. | m |
| m4 | L61, L84 | Ecuación coloquial Boletín↔DICOM ("estar en el Boletín es la causa concreta de estar en DICOM") | Simplificación: DICOM/Equifax agrega múltiples fuentes privadas además del Boletín (la propia página CMF citada lo describe). No es un hard claim cuantificable; roce de precisión. | m |

Verificación positiva (para que la remediación conserve lo correcto):

- CC art. 2515 = 5 años acciones ordinarias (3 ejecutivas): **VERIFICADO** literal vía `bcn-cite`.
- Operador = Cámara de Comercio de Santiago: consistente con D.S. 950 art. 1 ("enviarán… a la Cámara de Comercio de Chile de Santiago") y art. 4.
- Aclaraciones por pago/extinción existen (D.S. 950 art. 4, gratuitas desde 2010 cualquiera sea el monto) y el acreedor debe avisar (Ley 19.628 art. 19) — el **mecanismo** pago→aclaración es real; lo falso es el plazo (5 vs 7), la ley citada (20.575 vs 19.628/D.S. 950) y el canal (CMF vs operador/tribunal).
- Enlaces internos con trailing slash `/`: todos los del cuerpo y `nextStepHref` lo cumplen (`/posts/informe-deudas-cmf-vs-dicom/`, `/posts/tarjeta-credito-costo-real-chile/`, `/glosario/dicom/`, `/posts/donde-ver-si-estoy-en-dicom-gratis/`, `/posts/renegociacion-superir/`); externas verificadas vivas (CMF Educa, CMF reclamos, `https://www.boletincomercial.cl/` — esta última sin contenido extraíble por ser JS).
- **Matemática**: el artículo no contiene ningún ejemplo numérico trabajado (sin montos, tarifas, fórmulas ni cómputos) → **nada que recomputar**; las únicas cifras son plazos legales, fact-chequeados arriba (5 días: FALSO→7; 5 años prescripción: OK; 5 años comunicación/vigencia: OK pero omitido en artículo).

## 3. NEEDS-HUMAN-VERIFY (no verificable en esta sesión; URL exacta cada uno)

- N1 — ¿Ofrece hoy `boletincomercial.cl` una consulta básica gratuita y bajo qué norma/tarifa? (fetch bloqueado por JS; la atribución a Ley 20.575 no tiene respaldo). URL: https://www.boletincomercial.cl/
- N2 — Canal correcto de reclamo de consumidor para datos comerciales erróneos (mediación SERNAC vs Juzgado de Policía Local vs Juez de Letras art. 16 según contraparte sea acreedor-proveedor, banco fiscalizado u operador del registro). URLs: https://www.sernac.cl/ y https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-43332.html (verificado: solo fiscalizadas).
- N3 — Procedimiento y efectos de alegar prescripción (CC art. 2515) sobre el dato comercial, y estado del proyecto de "olvido financiero" 2026 (terceros reportan Boletín 18.216-05 aprobado-no-promulgado con veto anunciado al 2026-08-04; NO verificado en primario). URL base: https://www.bcn.cl/leychile/navegar?idNorma=172986

## 4. Refresh-requirements (para la sesión de remediación; sin fixes en esta sesión)

1. Re-verificar `src/data/blog/como-salir-boletin-comercial-chile.md` completo contra Ley 19.628 (arts. 12, 16, 17, 18, 19) y D.S. 950 (arts. 1, 4, 10) vía `node scripts/bcn-cite.mjs`; corregir B1–B4/M2/M5/M7 con esas citas (7 días, tope 5 años, vía judicial/operador, Ley 21.719 no vigente al 2026-04-09).
2. Reescribir frontmatter `officialSources` del mismo archivo: rotular correctamente la página CMF (Informe de Deudas, no Boletín) o sustituirla por D.S. 950 / Ley 19.628 en BCN; alinear `validAsOf`/`updatedDate` con la fecha real de la remediación y documentar el cambio (NORMA §5.3).
3. Incorporar excepciones faltantes (M4: cesantía, exclusiones art. 17, repactadas) y la Nota verbatim NORMA §3.2 en la tabla; añadir plantilla "Respuesta rápida / Excepciones / Vigencia / Fuentes" (§2.3) al cuerpo.
4. Resolver N1–N3 y verificar el estado de la Ley 21.719 (vigencia plena 2026-12-01) y del proyecto de olvido financiero antes de republicar; si la remediación ocurre post-2026-12-01, reescribir L137 con la ley ya vigente y la Agencia como ente competente.
5. Chequeo cruzado con `src/data/blog/informe-deudas-cmf-vs-dicom.md` (L138 cita bien el art. 18) y `src/data/blog/donde-ver-si-estoy-en-dicom-gratis.md` (L86 fórmula cuidadosa de gratuidad) para coherencia intra-sitio; correr los 6 gates + `check:legal-citations` sobre el archivo remediado.
6. Archivos fuera de alcance que la remediación NO debe tocar en esta pasada (se listan para acotar): slugs, canónicas, rutas, RSS, héroes (`public/images/hero/como-salir-boletin-comercial-chile.avif` existe, 6289 bytes — solo constatado), otros artículos.

## 5. Integridad de la sesión (read-only confirmada)

- `pnpm exec prettier --check` sobre este reporte: PASS (ver comando en historial).
- `git diff --check`: limpio.
- `git status --short`: este reporte es el único archivo nuevo; suciedad preexistente NO creada por esta sesión y NO tocada:
  - `M docs/TECH_DEBT_BACKLOG.md`
  - `M docs/backlog/README.md`
- No se marcó ningún gate `[X]`; no se cambió slug/canónica/ruta/RSS; no se editó el artículo (separación de funciones); no se posteó nada fuera del repo.
