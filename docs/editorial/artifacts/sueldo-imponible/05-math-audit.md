# Gate 05 — Math Audit: sueldo-imponible-chile

Status: DRAFT — pending ComplianceAgent review
Role: MathAuditAgent (ChatGPT — adversarial)

| Claim | Source in 02-research | Status | Notes |
|---|---|---|---|
| El tope máximo imponible previsional puede presentarse como “~87,1 UF”. | S3 | ERROR | La verificación oficial en Superintendencia de Pensiones para el período vigente recuperado en sesión muestra `90,0 UF` para cotizaciones de trabajadores dependientes e independientes y `135,2 UF` para AFC. La referencia `~87,1 UF` quedó desactualizada. |
| El ejemplo central del draft con remuneración imponible de $1.200.000 puede completarse con la tabla ISC vigente. | S2 | VERIFIED | Con la tabla mensual SII 2026 verificada en sesión: `1.200.000 × 0,04 - 38.117,52 = 9.882,48`. El ejemplo cae en el segundo tramo gravado y no puede publicarse sin ese número resuelto. |
| El descuento AFP del ejemplo puede describirse como “~10,5% + comisión AFP”, dando `~$126.000 + comisión`. | S3 | ERROR | `126.000` ya equivale a 10,5% de `1.200.000`. Como la comisión AFP se cobra además como porcentaje de la remuneración imponible, la redacción del draft dobla el componente comisión y sobrestima el descuento. |
| El descuento de salud de 7% para el ejemplo equivale a $84.000. | — | TODO:SOURCE | La aritmética es correcta (`1.200.000 × 0,07 = 84.000`), pero `02-research.md` no aporta aún una fuente oficial específica para esa tasa en este artefacto. |
| El Seguro de Cesantía puede publicarse como `0,6% trabajador / 2,4% empleador` en este draft. | — | TODO:SOURCE | El dossier no consolidó todavía una fuente oficial verificable para estos porcentajes dentro de este artefacto. |
| La sección APV puede hablar de un tope anual en `UTM`. | S5 | ERROR | La verificación oficial sobre artículo 42 bis utilizada en sesión confirma topes en `UF`: hasta `50 UF` mensuales y hasta `600 UF` anuales, no UTM. La unidad del draft es incorrecta. |
| La explicación “Modalidad A/B” del APV puede publicarse tal como está, incluyendo el beneficio exacto del `15%`. | S5 | TODO:SOURCE | En esta sesión sí quedó verificado que existe un régimen que rebaja base imponible y que el artículo 42 bis usa topes en UF, pero el dossier aún no deja amarrada con fuente oficial suficiente la formulación exacta del beneficio del 15% que usa el draft. |

Summary: total claims audited = 7; VERIFIED = 1; TODO:SOURCE = 3; ERROR = 3.

Verdict: FAIL

Rationale: el draft mezcla un tope imponible desactualizado, un ejemplo AFP internamente inconsistente y una unidad errónea para el APV. Aunque la tabla ISC ya permite cerrar el ejemplo tributario, la publicación sigue bloqueada por errores materiales.