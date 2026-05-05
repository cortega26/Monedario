# Gate 05 — Math Audit: gratificacion-legal-chile

Status: DRAFT — pending ComplianceAgent review
Role: MathAuditAgent (ChatGPT — adversarial)

| Claim | Source in 02-research | Status | Notes |
|---|---|---|---|
| La modalidad del artículo 47 corresponde al 30% de las utilidades líquidas del ejercicio. | S1 | VERIFIED | La revisión oficial del Código del Trabajo vía BCN mantiene vigente el bloque de artículos 47 a 52 en `idNorma=207436`. |
| La modalidad del artículo 50 corresponde al 25% de las remuneraciones imponibles anuales, con tope de 4,75 IMM. | S1 | VERIFIED | La fórmula base usada por el draft coincide con la estructura legal citada en el dossier. |
| El IMM vigente para los cálculos del artículo al 2026-05-03 es $539.000. | S3 | VERIFIED | La nota oficial del Ministerio del Trabajo sobre la Ley 21.751 indica IMM de $539.000 desde el 1 de enero de 2026 para trabajadores de 18 a 65 años. |
| El tope anual se calcula como `4,75 × IMM` y, con IMM de $539.000, equivale a $2.560.250. | S1 + S3 | VERIFIED | Recalculo independiente: `539.000 × 4,75 = 2.560.250`. Referencia mensual simple: `2.560.250 ÷ 12 = 213.354,17`. |
| En el ejemplo del draft, un sueldo imponible de $800.000 por 12 meses produce remuneraciones imponibles anuales de $9.600.000 y una gratificación bruta de $2.400.000. | S1 + S3 | VERIFIED | Recalculo independiente: `800.000 × 12 = 9.600.000`; `9.600.000 × 0,25 = 2.400.000`; `min(2.400.000, 2.560.250) = 2.400.000`. |
| La elección entre modalidad 30% utilidades y modalidad 25% remuneraciones es del empleador, no del trabajador. | S1 | VERIFIED | Consistente con la forma en que el dossier y el Código del Trabajo estructuran ambas alternativas. |
| La provisión/pago mensual en 1/12 puede publicarse tal como está redactada. | S2 | TODO:SOURCE | El propio `02-research.md` dejó pendiente el ordinario DT sobre periodicidad. No se verificó en esta sesión un dictamen oficial suficiente para publicar esta parte como hecho normativo. |
| El draft afirma que basta haber trabajado al menos 30 días durante el ejercicio. | — | TODO:SOURCE | Ese umbral numérico no está sustentado en `02-research.md` ni fue verificado en esta sesión contra BCN o DT. |
| El draft afirma que, si la empresa nunca comunicó formalmente la modalidad 30%, se presume la modalidad 25%. | S1 / S2 | TODO:SOURCE | Es una afirmación fuerte de doctrina/práctica laboral, pero el dossier no aporta todavía la base oficial suficiente para publicarla con seguridad. |
| El cierre del draft afirma que el IMM “se actualiza por decreto supremo”. | S3 | ERROR | La fuente oficial recuperada para el reajuste vigente es la Ley 21.751 publicada en Diario Oficial, no un decreto supremo. El instrumento jurídico está mal identificado. |

Summary: total claims audited = 10; VERIFIED = 6; TODO:SOURCE = 3; ERROR = 1.

Verdict: FAIL

Rationale: el cálculo central del ejemplo sí cuadra una vez fijado el IMM vigente, pero el draft aún contiene un error normativo visible sobre el instrumento legal del reajuste del IMM y mantiene tres afirmaciones operativas sin respaldo oficial suficiente.