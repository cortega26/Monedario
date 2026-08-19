# PLAN: corrección factual APV en sueldo-imponible-chile.md (2026-08-19)

## Contexto

- Hallazgo reportado en PR #428 (merge 2026-08-19): `src/data/blog/sueldo-imponible-chile.md` contenía el mismo error de inversión de los regímenes tributarios del APV que tenía `impuesto-global-complementario-chile.md` (corregido en #428) y `rentas-mixtas-sueldo-honorarios` (corregido 2026-08-13).
- Alcance: únicamente las afirmaciones factuales APV dependientes de la distinción Modalidad A/B. No se tocó SEO, título, descripción, estructura, estilo ni contenido no relacionado.

## Cambios

- `covers` (articleLead): "generar un crédito tributario directo (Modalidad A)" → "recibir una bonificación estatal del 15% (Modalidad A)".
- Sección "APV y reducción de la base imponible":
  - **Modalidad A** (antes: "genera un crédito tributario directo sobre el monto cotizado, hasta 50 UF mensuales o 600 UF anuales") → NO rebaja la base imponible; los aportes no pagan impuesto al retiro; el beneficio es la **bonificación estatal del 15%** del ahorro anual con **tope 6 UTM anuales**, depositada por la TGR en la cuenta previsional.
  - **Modalidad B** (antes: "reduce la base imponible del ISC, con el mismo tope de 600 UF anuales") → reduce la base imponible del ISC/IGC, con tope de **50 UF mensuales o 600 UF anuales**.
  - Topes: la Modalidad B se expresa en UF; la bonificación de la Modalidad A, en UTM.
- Precisión normativa posterior (misma corrección, sin cambio de sustancia): las Modalidades A/B ya no se referencian genéricamente al art. 42 bis LIR — el fundamento de la elección tributaria de ambos regímenes es el art. 20, letra L, del D.L. 3.500; la bonificación fiscal del Régimen A (15%, tope 6 UTM) es el art. 20, letra O, del D.L. 3.500; el Régimen B mantiene referencia complementaria al art. 42 bis LIR por la rebaja de base imponible. Enlaces BCN consistentes con el corpus (`idNorma=7147` para el D.L. 3.500, igual que `src/data/laws/dl-3500-sistema-afp.md`; `idNorma=6368` para la LIR). No se modificaron fechas ni redacción sustantiva.
- Fechas (NORMA §5.1, "corrección de error importante"): `validAsOf` 2026-07-01 → 2026-08-19; `updatedDate` 2026-08-09 → 2026-08-19; aviso de vigencia del cuerpo actualizado. `computedAt` intacto.

## Registro (NORMA §5.3)

- Qué: corrección de la inversión Modalidad A/B del APV (art. 42 bis LIR) en sueldo-imponible-chile.md — Modalidad A = bonificación estatal 15% (tope 6 UTM anuales, depositada por TGR), NO es crédito tributario; Modalidad B = rebaja de base imponible ISC/IGC (tope 50 UF mensuales / 600 UF anuales).
- Por qué: el artículo describía los dos regímenes invertidos; mismo error ya corregido en impuesto-global-complementario-chile.md (#428) y rentas-mixtas-sueldo-honorarios (2026-08-13). Precisión normativa posterior: fundamento legal de la elección = art. 20 letra L D.L. 3.500 (no genérico al art. 42 bis LIR); bonificación Régimen A = art. 20 letra O D.L. 3.500; Régimen B mantiene art. 42 bis LIR como referencia complementaria por la rebaja de base imponible.
- Fuentes: SII FAQ 001.140.5883.011 (regímenes tributarios APV, art. 20 letra L DL 3.500 en concordancia con art. 42 bis LIR; actualizada 23/07/2025); SII FAQ 001_140_5887 (tope anual 600 UF); Superintendencia de Pensiones — Compendio Normas del Sistema de Pensiones (bonificación fiscal 15%, tope 6 UTM; art. 20 letra O DL 3.500); CMF Educa (bono fiscal 15% del ahorro, cap 6 UTM; Régimen B = rebaja de base imponible; art. 20 L DL 3.500 como fundamento de la elección de regímenes); SII Resolución Exenta N°116/2008 (bonificación del art. 20 O DL 3.500); canon `src/data/blog/que-es-el-apv.mdx` (Régimen A = bono 15% tope 6 UTM; Régimen B = 50 UF mensuales / 600 UF anuales); `src/data/laws/dl-3500-sistema-afp.md` (enlace BCN `idNorma=7147`).

## Gates

| Gate | Resultado |
| --- | --- |
| `pnpm run check:ci` | exit 0 |
| `check:editorial-timeliness` | stale=0 |
| `check-editorial-artifacts` (EDITORIAL_ENFORCE=1, scope=all) | compliant 47/47 |
| `pnpm run lint` / `format:check` / `check:docs` | exit 0 |