Status: DRAFT — pending ComplianceAgent review
Role: MathAuditAgent (ChatGPT — adversarial)

## Scope

- In scope: claims, figures, dates and legal references in the Ronda 2 text supplied for this audit; verification of the newly cited Rankia source.
- Out of scope: modifying the Ronda 2 draft, the published article, source dossiers, or publication gates.
- Prior Ronda 1 report is preserved at `05-math-audit.md`; this report does not supersede its evidence except where independently rechecked below.

## Audit table

| Claim | Fuente en 02-dossier / Ronda 2 | Status (VERIFIED / TODO:SOURCE / ERROR) | Notas |
| --- | --- | --- | --- |
| Una venta con ganancia en 2025 puede generar obligación de declarar según monto y tipo de activo. | Ninguna fuente para obligaciones F22 específicas en el dossier. | TODO:SOURCE | Es una afirmación tributaria general sobre declaración anual y no se trazó a una instrucción oficial de Operación Renta 2026. No se usó como sustento de los demás hallazgos. |
| Bajo el art. 107 basta con que el **instrumento** cumpla requisitos específicos para que el mayor valor quede afecto al impuesto único de 10%. | Circular SII N° 39/2022, §2.1. Verificación independiente: LIR vigente, art. 107 N° 1 a 3, BCN/LeyChile. | ERROR | La corrección mejoró el texto, pero sigue atribuyendo la calificación al instrumento. El art. 107 exige también condiciones de la operación: por ejemplo, para acciones, modalidades legales de enajenación y de adquisición; para cuotas, requisitos adicionales de rescate/enajenación y distribución. Un instrumento por sí solo no basta. Debe describirse como operación/enajenación o rescate que cumple todos los requisitos aplicables, no como instrumento que los cumple. |
| Desde el 02-09-2022, el mayor valor comprendido en el art. 107 paga impuesto único de 10%. | Circular SII N° 39/2022, §2 y §2.1. Verificación independiente: LIR vigente, art. 107, BCN/LeyChile. | VERIFIED | La tasa de 10% y la fecha se trazaron a la Circular oficial y al texto consolidado de la LIR. Esta verificación presupone los requisitos legales de cada operación; no cura el ERROR de la fila anterior. |
| La Ley N° 21.420 eliminó para esos casos la calidad de ingreso no renta que existía antes. | Circular SII N° 39/2022, encabezado REF. LEGAL y §2. Verificación independiente: Ley N° 21.420, art. 1 N° 4, BCN/LeyChile. | VERIFIED | La atribución normativa es correcta. |
| Los inversionistas institucionales conservan la calidad de ingreso no renta. | Circular SII N° 39/2022, §2. Verificación independiente: LIR vigente, art. 107 N° 9, BCN/LeyChile. | VERIFIED | Correcto para los instrumentos y operaciones que cumplen los requisitos del art. 107. |
| El Congreso aprobó el 04-08-2026 el proyecto del Boletín N° 18.216-05. | KPMG Chile, El América y Emol, según el dossier. Verificación independiente: tabla oficial del Senado, sesión N° 47 de 04-08-2026. | ERROR | La tabla oficial del Senado registra para ese boletín: “Aplazamiento de la votación. Acuerdo de Comités”. Esto contradice la aprobación congresal en esa fecha afirmada por el draft. El material secundario no puede prevalecer sobre el registro parlamentario oficial. |
| El proyecto restituiría la exención desde el 01-01-2027. | KPMG Chile, Tax Alert (agosto 2026); fuente secundaria Rankia no fue usada para esta fecha. | TODO:SOURCE | Sigue faltando el texto oficial del proyecto en su estado relevante y una fuente parlamentaria/Diario Oficial que permita verificar exactamente la disposición transitoria y su vigencia. Como la votación del 04-08 fue aplazada, el draft tampoco debe presentar esta fecha como efecto de un proyecto ya “aprobado”. |
| Al corte 2026-08-09 el proyecto no era ley vigente y estaba sometido a control de constitucionalidad ante el TC. | KPMG Chile y Emol 06-08-2026, según el dossier. Verificación independiente: estado “En tramitación” del Boletín 18.216-05 en Senado. | VERIFIED | El registro parlamentario oficial no muestra una ley publicada y lo mantiene en tramitación. Se intentó verificar una ficha pública del TC por boletín, sin resultado indexado; ello no contradijo la evidencia de los requerimientos que documenta Emol. |
| No todos los fondos mutuos y fondos de inversión quedan fuera ni dentro del art. 107; depende de requisitos legales del tipo de fondo. | Fuente nueva: Rankia (secundaria). Verificación independiente: LIR vigente, art. 107 N° 2 y N° 3, BCN/LeyChile. | VERIFIED | La afirmación binaria se corrigió. El art. 107 contempla tanto supuestos de cuotas con presencia bursátil como supuestos precisos para ciertas cuotas sin presencia bursátil propia. La fuente Rankia no pudo recuperarse mediante fetch y no se utilizó como prueba; no se detectó `PROMPT_INJECTION_CANDIDATE` porque no se obtuvo contenido. |
| Si un fondo no cumple los requisitos del art. 107, su mayor valor se rige por reglas propias y no se debe asumir 10% por defecto. | LIR vigente, art. 108; Ley N° 20.712, art. 81, BCN/LeyChile. | VERIFIED | Para cuotas de fondos mutuos fuera del art. 107, el art. 108 prevé Primera Categoría, Global Complementario o Adicional, según corresponda. La Ley N° 20.712 establece el régimen tributario aplicable a fondos de inversión y fondos mutuos. La advertencia de no presuponer 10% es correcta. |
| Es correcto omitir deliberadamente el 90% porque sólo había una fuente secundaria. | Fuente nueva Rankia; verificación independiente: LIR vigente, art. 107 N° 2 y N° 3, BCN/LeyChile. | TODO:SOURCE | No publicar una cifra basada sólo en Rankia fue prudente, pero no justifica dejar la fuente primaria sin buscar: el art. 107 público establece el mínimo de 90% para los supuestos respectivos, además de condiciones de operación y distribución. La redacción actual no publica una cifra falsa, pero necesita citar/trazar la regla primaria si se mantiene una explicación de composición de cartera. |
| La venta de bienes raíces por personas naturales tiene un límite acumulado de 8.000 UF; el exceso del mayor valor tributa. | LIR vigente, art. 17 N° 8 letra b) ii y iii, BCN/LeyChile. | VERIFIED | La LIR establece un límite total de 8.000 UF, independiente del número de ventas o bienes; sobre el exceso contempla tributación. |
| Además del límite de 8.000 UF existen condiciones de plazo de tenencia. | LIR vigente, art. 17 N° 8 letra b) iv, BCN/LeyChile. | VERIFIED | La corrección elimina el falso “solo”. La fuente primaria exige más de un año entre adquisición y enajenación; exige cuatro años para inmuebles producto de subdivisión o construcción en los supuestos legales. La expresión “según cómo adquiriste” es imprecisa, pero no contradice por sí sola la regla; el detalle exacto debe estar fuente-citado si se incorpora al cuerpo. |
| La Ley N° 21.210 reformó el art. 17 N° 8 LIR. | LIR vigente, anotaciones oficiales del art. 17 N° 8, BCN/LeyChile. | VERIFIED | La atribución legal es correcta. |
| Remitir al reglamento interno o a sii.cl para determinar el régimen exacto de un fondo específico es un deferral completamente cerrado. | Ninguna URL SII específica en el dossier; arts. 107 y 108 LIR y art. 81 de la Ley N° 20.712 son públicos. | TODO:SOURCE | La identificación de un fondo concreto y de su partícipe puede ser individual, por lo que el deferral puede ser legítimo en esa parte. No obstante, las reglas generales y los requisitos públicos que el texto resume deben tener una fuente oficial concreta; “sii.cl” sin URL no basta para cerrar la trazabilidad YMYL. |

## Summary

- Total claims audited: 15
- VERIFIED: 9
- TODO:SOURCE: 4
- ERROR: 2

## Verdict

FAIL

Publication is blocked. Two material errors remain: the art. 107 description still treats qualification as an attribute of the instrument rather than the legally conditioned transaction, and the stated congressional approval on 04-08-2026 is contradicted by the official Senate record of a postponed vote. Four source-traceability items also remain open.
