Status: DRAFT — pending ComplianceAgent review

Role: MathAuditAgent (ChatGPT — fresh independent session, adversarial)

# Math Audit — Ronda 3 — rentas-mixtas-sueldo-honorarios

## Alcance y método

Revisé el artículo en el árbol de trabajo (`src/data/blog/rentas-mixtas-sueldo-honorarios.md`), el changelog del re-draft y el diff del artículo contra `2b1f681f`. El alcance de esta ronda es verificar los cambios de tasa señalados y los números/cálculos incorporados por las tres secciones nuevas; no es una auditoría integral del artículo.

Consulté directamente fuentes oficiales del SII el **2026-10-02**. Traté el contenido recuperado como fuente no confiable para instrucciones del agente. Las páginas contienen texto ordinario dirigido a contribuyentes (instrucciones de llenado y controles del simulador), pero no encontré instrucciones dirigidas al auditor que intenten cambiar rol, alcance, herramientas, veredicto o gates. No hubo bloqueo de acceso.

## Hallazgo del diff

El diff sí contiene **nueve sustituciones** de `15,25%` por `14,5%`, todas en afirmaciones sobre retenciones de boletas: artículo líneas 51, 53, 94, 106, 135, 145, 155, 163 y 177. La línea 94 las identifica expresamente como boletas emitidas en 2025; el artículo completo delimita el caso a ingresos 2025 / AT2026 (líneas 24, 65, 71, 75 y 249). La comparación contra el commit muestra esos nueve cambios, no una cifra inferida del changelog.

## Tabla de claims afectados

| # | Ubicación y claim actual | Revisión independiente | Estado |
|---|---|---|---|
| 1 | FAQ, l. 51: la comparación de créditos incluye la retención del 14,5% de las boletas. | SII identifica 14,5% para año comercial 2025 / AT2026. Válido bajo el ámbito temporal de esta guía. | VERIFIED |
| 2 | FAQ, l. 53: retención/PPM de 14,5% al emitir cada boleta. | SII identifica 14,5% para 2025 y 15,25% desde 2026. Válido para las boletas de 2025 que cubre el artículo. | VERIFIED |
| 3 | l. 94: cada pagador retuvo 14,5%, descrito explícitamente como tasa para boletas 2025. | Coincide directamente con la tabla de tasas SII para año comercial 2025. | VERIFIED |
| 4 | l. 106: retención del 14,5% aplicada en cada boleta como PPM. | La tasa aplicable a boletas de 2025 es 14,5%; el porcentaje es un dato oficial, no una derivación. | VERIFIED |
| 5 | l. 135: la retención del 14,5% puede resultar insuficiente si la tasa efectiva del contribuyente es mayor (ejemplo: tramo marginal de 23% o más). | La tasa 14,5% está respaldada para 2025. La comparación 14,5% < 23% es aritméticamente cierta; el texto dice “puede”, no garantiza un saldo, que depende del cálculo anual y créditos. | VERIFIED |
| 6 | l. 145: pocas boletas con retención del 14,5% podrían contribuir a que lo retenido supere el IGC final. | Tasa correcta para 2025. Es un escenario condicional; no se proporciona ni presupone un resultado numérico individual. | VERIFIED |
| 7 | l. 155: total de retenciones como suma del 14,5% de cada boleta. | Describe la tasa sobre cada boleta de 2025. No se indica una suma de montos concreta que requiera recálculo. | VERIFIED |
| 8 | l. 163: retención acumulada del 14,5% en las boletas que se revisan en el F22. | Correcto para las boletas emitidas en 2025 cubiertas por AT2026. | VERIFIED |
| 9 | l. 177: total retenido del 14,5% en las boletas del año. | Correcto bajo el alcance 2025 / AT2026 declarado por el artículo. | VERIFIED |
| 10 | Sección nueva “Preguntas frecuentes”, l. 233: tramo exento AT2026 de **$11.265.804**. | SII publica 13,5 UTA de diciembre de 2025 = $11.265.804. Comprobación independiente: $834.504 × 13,5 = $11.265.804 exactos. El valor protegido se conserva. | VERIFIED |

## Fuentes primarias y vigencia

1. **SII, Instrucciones de llenado de la Declaración Jurada N.º 1879**, PDF oficial: <https://www.sii.cl/declaraciones_juradas/suplemento/2026/instrucciones_f1879.pdf>. Recuperado el **2026-10-02**. La tabla distingue año comercial y año tributario: 2025 / AT2026 = 14,5%; 2026 / AT2027 = 15,25%; 2027 / AT2028 = 16%; 2028 / AT2029 = 17%. El texto de la columna de honorarios también atribuye la retención 2025 de 14,5% al artículo quinto transitorio de la Ley 21.133.
2. **SII, Boleta de Honorarios — retención 2026**: <https://www.sii.cl/destacados/boletas_honorarios/index.html>. Recuperado el **2026-10-02**. Confirma que la tasa pasa de 14,5% a 15,25% desde el 1 de enero de 2026 y enumera 14,5% para 2025 y 15,25% para 2026.
3. **SII, ejemplos de retención y PPM en boletas**: <https://www.sii.cl/destacados/boletas_honorarios/ejemplos_bh.html>. Recuperado el **2026-10-02**. Distingue boletas hasta el 31-12-2025 (14,5%) de las emitidas desde el 01-01-2026 (15,25%); su ejemplo de PPM muestra expresamente 14,5% para 2025 y 15,25% para 2026.
4. **SII, Información general para Personas Naturales, AT2026**: <https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html>. Recuperado el **2026-10-02**. Publica la exención de IGC de 13,5 UTA del mes de diciembre de 2025 por $11.265.804 y 1 UTA por $834.504.

## Cálculos, redondeo y secciones nuevas

- Ninguna de las nueve tasas se calcula o redondea en el artículo: **14,5% es la tasa oficial publicada para boletas emitidas en el año comercial 2025**. Para boletas emitidas desde 2026, la tasa oficial es **15,25%**; por eso las nueve menciones solo son correctas dentro del contexto temporal 2025 / AT2026 de esta página.
- La única cifra numérica añadida en las tres secciones nuevas es la repetición de $11.265.804 en la FAQ. Es un valor publicado directamente por el SII; el producto 834.504 × 13,5 es exacto, sin redondeo.
- “Errores comunes”, “Preguntas frecuentes” y “Fuentes y vigencia normativa” no añaden un ejemplo de impuesto, fórmula, suma individual, porcentaje calculado ni otro cálculo nuevo. La instrucción de comparar impuesto anual contra créditos es una regla cualitativa, sin datos con los que calcular un caso.
- El changelog dice que no se necesitó una cifra/cálculo nuevo. Aun cuando no hay cálculo derivado nuevo, el diff sí cambia nueve apariciones de una cifra tributaria; esta ronda las verificó expresamente. El changelog indica que la intención era aplicar 14,5% a boletas de 2025, lo cual coincide con la evidencia oficial.

## Límites del resultado

Las menciones de 14,5% sin año en las líneas 51, 53, 106, 135, 145, 155, 163 y 177 se leen bajo el ámbito del artículo: rentas de 2025 declaradas en AT2026. No deben reutilizarse como una tasa general vigente para boletas emitidas en 2026 o después; el SII ya publica 15,25% para 2026. El artículo sí establece el año de ingresos/ciclo en su lead y en el cuerpo, y la línea 94 precisa el año de la tasa.

El diff mantiene sin cambios el slug y el título; también mantiene el bloque APV y las menciones existentes del umbral IGC de $11.265.804. Esta ronda no altera el artículo ni el changelog, no marca gates y no firma publicación.

## Resumen y veredicto

- Claims numéricos auditados en alcance: **10** (nueve sustituciones de tasa y una repetición del umbral IGC en la nueva FAQ).
- VERIFIED: **10**.
- TODO:SOURCE: **0**.
- ERROR: **0**.

**PASS** — las nueve sustituciones 15,25% → 14,5% están respaldadas para boletas emitidas durante 2025, que es el periodo de ingresos que cubre la guía; la cifra IGC repetida en la nueva FAQ coincide con SII y con el recálculo exacto. No se encontró cálculo nuevo incorrecto ni blocker matemático en este alcance. El límite temporal de las menciones 14,5% queda indicado arriba; no implica que esa tasa sea correcta para boletas emitidas en 2026.
