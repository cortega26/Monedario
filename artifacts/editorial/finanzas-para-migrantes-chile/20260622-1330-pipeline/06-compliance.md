# Gate 06 — Compliance: finanzas-para-migrantes-chile (reauditoría)

**Status:** BLOCKED — DEFECTS FOUND
**Role:** ComplianceAgent (Codex — sesión independiente de 01–05, adversarial)
**Fecha de auditoría:** 2026-06-22
**Draft evaluado:** `04-draft.md` remediado en commit `d5a37821`
**Veredicto:** FAIL

## Separación de Funciones (SoD)

| Stage | Rol declarado | Instancia/sesión | Evaluación SoD |
|---|---|---|---|
| 01 Brief | DraftAgent | Claude Code, sesión 2026-06-22 | Misma sesión que 02–04; concentración declarada |
| 02 Dossier | ResearchAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01/03/04; concentración declarada |
| 03 Outline | OutlineAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01/02/04; concentración declarada |
| 04 Draft original | DraftAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Misma sesión que 01–03 |
| 04 Remediación | DraftAgent remediador | Claude Sonnet 4.6, “sesión fresca 2026-06-22” | Instancia única no identificada |
| 05 Math Audit | MathAuditAgent | Claude Sonnet 4.6, “sesión fresca 2026-06-22” | No acredita ser una instancia distinta del DraftAgent remediador |
| 06 Compliance | ComplianceAgent | Codex, sesión independiente; no produjo 01–05 | Separación respecto del DraftAgent acreditada |

La concentración de 01–04 está declarada. Esta auditoría conserva la separación estructural
entre `DraftAgent` y `ComplianceAgent`, porque esta sesión no produjo 01–05 ni participó en
la remediación. Sin embargo, Gate 05 y la remediación de Gate 04 declaran la misma familia de
modelo, la misma fecha y solo “sesión fresca”, sin identificadores o evidencia que demuestren
que fueron instancias distintas con exposición cero. La SoD del MathAuditAgent no queda
acreditada.

## Scorecard NORMA_YMYL

| Dimensión | Peso | Nota | Aporte ponderado | Justificación adversarial |
|---|---:|---:|---:|---|
| Respuesta ancla | 35% | 7.0/10 | 2.45 | La ruta de tres pasos es temprana y ahora reconoce variaciones, pero todavía mezcla orientación con conclusiones legales y requisitos concretos sin fuente profunda. |
| Precisión + fuentes | 25% | 5.0/10 | 1.25 | C3 fue restaurado y C2 mejoró, pero persisten expansiones no respaldadas, enlaces a portadas, afirmaciones legales sin artículo y una atribución errónea en Gate 05. |
| Vigencia + calendario | 15% | 8.0/10 | La fecha de corte es visible y consistente; no hay reforma futura. Falta vigencia trazable por regla crítica. |
| Excepciones + cobertura | 15% | 7.5/10 | El draft reconoce dependencia de la situación migratoria y límites temáticos, pero varias condiciones de arriendo y bancarización siguen generalizadas. |
| Claridad + estructura | 10% | 8.5/10 | La guía es legible y accionable, aunque esa claridad aumenta el riesgo de las reglas aún no verificadas. |
| **Total ponderado** | **100%** |  | **6.88/10** | **No alcanza el umbral obligatorio de 9.5/10.** |

## Auditoría de claims C1–C6

| Claim | Estado en dossier | Tratamiento remediado | Resultado |
|---|---|---|---|
| C1 | TODO:SOURCE | Usa “proceso habitual”, reconoce variación y remite al SII antes de actuar. | **ACEPTABLE COMO ORIENTATIVO**, sin convertirlo en VERIFIED. Debe resolverse antes del blog publicado si se mantienen documentos/presencialidad concretos. |
| C1b | TODO:SOURCE | Sustituye la equivalencia universal por “funciona habitualmente” y remite al Registro Civil. | **ACEPTABLE COMO ORIENTATIVO**, sujeto a resolución antes de publicación. |
| C2 | VERIFIED (2026-06-17) | Conserva cédula/app/web/tarjeta, pero añade “cualquier tipo de residencia”, “no exige renta”, “más accesible” y aceptación para sueldo sin soporte trazable en C2. | **DEFECTO:** carryover impreciso y fuente sin URL específica. |
| C3 | VERIFIED (2026-06-17) | Incluye 12 años, representante legal y alternativa por App con padre/madre cliente. | **PRESENTE**, pero la cita sigue sin URL verificable y añade el tramo 12–17 no explicitado en el catálogo. |
| C4 | TODO:SOURCE parcial | Retira rangos, pero afirma contenido de Ley 21.461, discrecionalidad, documentos habituales, no obligación legal, no discriminación y legalidad/habitualidad del arriendo en UF. | **DEFECTO:** varias afirmaciones legales y de mercado siguen categóricas y sin fuente operativa. |
| C5 | TODO:SOURCE | Mantiene una mención cualitativa y remite a cada entidad; no afirma requisitos específicos en el cuerpo. | **ACEPTABLE COMO ORIENTATIVO**. La FAQ aún debe retirar superlativos no respaldados sobre CuentaRUT. |
| C6 | TODO:SOURCE | Usa lenguaje práctico y remite a cada entidad; evita AFP/salud específicos. | **ACEPTABLE COMO ORIENTATIVO**, salvo la afirmación posterior de acceso futuro a cuentas corrientes por historial. |

Los claims TODO tratados como orientación y con remisión legítima no fallan por ese estado.
Esta reauditoría reconoce la mejora de C1, C1b, C5 y C6. El FAIL se debe a afirmaciones que
permanecen categóricas, a la trazabilidad insuficiente de los VERIFIED y al defecto SoD de
Gate 05.

## Defectos

### DEFECT #1 — HIGH — C2 conserva expansiones no respaldadas

El dossier verifica cédula vigente, vías app/web y entrega física. El draft añade “con
cualquier tipo de residencia”, “no exige nivel de renta”, “la cuenta más accesible” y uso
ampliamente aceptado para sueldo/pagos. Esas afirmaciones no están trazadas al claim C2.

**Resolución:** limitar el texto al contenido exacto de C2 o incorporar evidencia oficial
específica para cada afirmación adicional.

### DEFECT #2 — HIGH — C4 mantiene conclusiones legales y de mercado sin cita operativa

El borrador afirma qué regula Ley 21.461, que los requisitos son discrecionales, que ciertas
garantías no son obligación legal, que las condiciones no pueden ser discriminatorias y que
el arriendo en UF es legal y habitual. No cita artículo, cláusula literal ni URL oficial
específica, y la síntesis no está etiquetada como “resumen orientativo”.

**Resolución:** retirar esas conclusiones o citar instrumento, artículo y texto operativo;
etiquetar la síntesis conforme a `NORMA_YMYL.md §3.2`.

### DEFECT #3 — HIGH — Separación de Gate 05 no demostrada

El DraftAgent remediador y el MathAuditAgent aparecen como Claude Sonnet 4.6, “sesión fresca
2026-06-22”, sin identificadores diferenciados. No existe evidencia de que el auditor tuviera
cero exposición al draft ni de que fuera una instancia distinta. La etiqueta “sesión fresca”
no basta para probar SoD cuando ambas etapas se entregaron juntas.

**Resolución:** repetir Gate 05 con una instancia independiente y registrar herramienta,
identificador de sesión/ejecución y ausencia de exposición al contexto del DraftAgent.

### DEFECT #4 — HIGH — Gate 05 atribuye BCN al dominio equivocado

N2 afirma “verificable en BCN (bancodechile.cl)”. Banco de Chile no es la Biblioteca del
Congreso Nacional. La atribución invalida la trazabilidad declarada para el año de Ley 21.461.

**Resolución:** corregir la fuente a una URL oficial de BCN/LeyChile y verificar allí el dato;
el nuevo MathAuditAgent debe registrar el resultado.

### DEFECT #5 — MEDIUM — C2 y C3 no ofrecen una cita verificable al lector

“BancoEstado, Centro de Ayuda — FAQ CuentaRUT” y “recuperado vía Scrapling” no incluyen la URL
exacta ni el texto literal aplicable. El dossier también usa una URL abreviada con `...`.

**Resolución:** incorporar URL oficial profunda, fecha de recuperación y evidencia literal o
valor concreto para C2 y C3.

### DEFECT #6 — MEDIUM — Persisten superlativos y efectos bancarios no trazados

La CuentaRUT se describe como “la más accesible”, “la más documentada”, con “menos
restricciones de entrada” y como punto de partida para acceder luego a cuentas corrientes.
Son comparaciones o efectos no acreditados por C2/C3.

**Resolución:** eliminar superlativos y causalidades, o respaldarlos con fuentes oficiales y
criterios comparables explícitos.

### DEFECT #7 — MEDIUM — Deferrals públicos aún no son publicables

C1/C1b se aceptan en este artifact como orientación conforme al encargo, pero el texto aún
indica oficina, pasaporte, permiso y función tributaria. `NORMA_YMYL §2.4` no permite publicar
un deferral si la respuesta oficial es pública y recuperable por otra ruta.

**Resolución:** antes del blog file, resolver las fichas oficiales o retirar todo detalle no
verificado. Los TODO permanecen abiertos en Gate 07.

### DEFECT #8 — INFO — Mejoras verificadas respecto del FAIL anterior

Se eliminó la generalización sobre permisos, se retiraron los rangos 1–3/2/2–3 meses, C3 fue
incorporado y C1/C1b/C5/C6 adoptaron una formulación más prudente.

**Resolución:** ninguna; conservar como evidencia de remediación parcial.

## Veredicto y condiciones para Gate 07

**FAIL.** El score ponderado es **6.88/10**, inferior a **9.5/10**, y permanecen defectos HIGH
de precisión, cita legal y separación de funciones. Gate 07 continúa bloqueado.

Condiciones mínimas para una nueva evaluación:

1. Corregir C2 y C3 con alcance exacto y URL oficial verificable.
2. Resolver o retirar las afirmaciones legales/de mercado de C4 y el bloque UF.
3. Repetir Gate 05 con separación demostrable y corregir la fuente de N2.
4. Eliminar o respaldar los superlativos y efectos bancarios no trazados.
5. Mantener C1, C1b, C5 y C6 como TODO orientativos hasta su resolución humana/oficial.
6. Repetir Gate 06 en una sesión independiente tras la nueva remediación.
7. No marcar ninguna casilla de `07-publish-packet.md`; solo Carlos Ortega puede aprobarlas.

## Escalamiento humano

Carlos Ortega debe resolver o validar las fuentes oficiales pendientes, revisar la evidencia
de SoD de Gate 05 y decidir Gate 07. Esta auditoría no autoriza publicación.
