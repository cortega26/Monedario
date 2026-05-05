# Gate 05 — Math Audit: impuesto-global-complementario-chile

Status: DRAFT — pending ComplianceAgent review
Role: MathAuditAgent (ChatGPT — adversarial)

| Claim | Source in 02-research | Status | Notes |
|---|---|---|---|
| El draft puede referenciar la Ley sobre Impuesto a la Renta con el enlace BCN `idNorma=8657`. | S2 | ERROR | La verificación hecha en sesión confirmó que la URL correcta para el DL 824 (LIR) es `https://www.bcn.cl/leychile/navegar?idNorma=6368`. El enlace `idNorma=8657` no corresponde a la LIR vigente para este artículo. |
| El IGC opera con una tabla anual progresiva que llega hasta 40%. | S1 / S2 | VERIFIED | La tabla anual SII para AT 2026 confirma tramo exento más siete tramos gravados, con tasa marginal máxima de `40%`. |
| La UTA 2026 puede fijarse en `$834.504`. | S3 | VERIFIED | SII publica UTM de diciembre 2025 en `$69.542` y UTA en `$834.504`, consistente con `12 × 69.542`. |
| El primer tramo exento anual equivale a `$11.265.804`. | S1 / S3 | VERIFIED | La tabla anual SII AT 2026 muestra exención hasta `$11.265.804`, equivalente a `13,5 UTA`. |
| La retención de boletas de honorarios vigente para 2026 es `15,25%` y funciona como crédito contra el impuesto anual. | S1 / S4 | VERIFIED | La FAQ oficial SII verificada en sesión confirma tasa `15,25%` para 2026. El mecanismo de imputación como crédito es consistente con la lógica del F22 descrita en el draft. |
| La sección APV puede publicarse tal como está, incluyendo la formulación exacta de Modalidad A/B y el beneficio `15%`. | S4 | TODO:SOURCE | En la sesión quedó verificado que existe un régimen del artículo 42 bis que rebaja base imponible y que los topes se expresan en UF, pero el dossier todavía no ata con suficiente claridad documental la redacción final `Modalidad A = 15% / Modalidad B = rebaja base` usada en el draft. |
| La deducción de contribuciones para arrendadores puede publicarse tal como está. | S4 | TODO:SOURCE | El claim es plausible, pero en este artefacto no quedó aún respaldado con instrucción oficial específica del SII/F22. |

Summary: total claims audited = 7; VERIFIED = 4; TODO:SOURCE = 2; ERROR = 1.

Verdict: FAIL

Rationale: la tabla anual y los valores base del IGC ya pueden cerrarse, pero el draft mantiene un enlace legal incorrecto para la LIR y todavía deja abiertos dos claims tributarios sensibles: APV y deducibilidad de contribuciones.