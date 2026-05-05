# Gate 05 — Math Audit: pgu-pension-garantizada-universal

Status: DRAFT — pending ComplianceAgent review
Role: MathAuditAgent (ChatGPT — adversarial)

| Claim | Source in 02-research | Status | Notes |
|---|---|---|---|
| El requisito de edad es tener 65 años cumplidos. | S2 / S3 | VERIFIED | ChileAtiende mantiene el requisito de `65 años` y añade la precisión operativa de que la solicitud puede iniciarse desde los `64 años y 9 meses`. |
| El requisito de residencia puede resumirse como “mínimo 20 años en Chile a partir de los 20 años de edad”. | S2 / S3 | ERROR | La ley correcta recuperada en sesión es la Ley 21.419 en BCN (`idNorma=1171923`) y el requisito oficial no termina ahí: además exige `4 años de residencia en los últimos 5 años` previos a la solicitud. El draft omite una condición material. |
| Debe pertenecer al 90% de menores ingresos. | S3 | VERIFIED | ChileAtiende mantiene la regla de no pertenecer al 10% más rico de la población, operacionalizada con el Puntaje de Focalización Previsional. |
| Los montos y umbrales vigentes pueden cerrarse con fuente oficial al 2026-05-03. | S1 / S3 | VERIFIED | ChileAtiende publica: hasta `$789.139` de pensión base corresponde PGU de `$231.732`; entre `$789.139` y `$1.252.602` corresponde `monto variable`; desde `$1.252.602` no corresponde PGU. La página de reforma añade que, desde febrero de 2026, quienes tienen `82 años o más` acceden a un máximo de `$250.275`. |
| La fórmula exacta de reducción/complemento con pensión AFP puede publicarse con lo verificado en esta sesión. | S4 | TODO:SOURCE | Se verificaron umbrales oficiales y la expresión `monto variable`, pero no se recuperó una fórmula matemática explícita y trazable desde una fuente oficial accesible en esta sesión. |
| La sección sobre extranjeros residentes puede publicarse tal como está, sin matices adicionales. | S2 / S3 | TODO:SOURCE | La elegibilidad general parece compatible con el requisito de residencia, pero no quedó verificada en esta sesión una fuente oficial específica que cierre condiciones migratorias adicionales para extranjeros. |

Summary: total claims audited = 6; VERIFIED = 3; TODO:SOURCE = 2; ERROR = 1.

Verdict: FAIL

Rationale: aunque ya hay respaldo oficial suficiente para monto, umbrales y percentil, el draft omite una condición legal material del requisito de residencia y mantiene sin resolver la fórmula exacta del monto variable/complemento AFP-PGU.