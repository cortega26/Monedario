# Gate 06 — Compliance: finanzas-para-migrantes-chile

**Status:** BLOCKED — DEFECTS FOUND
**Role:** ComplianceAgent (Codex — sesión fresca, adversarial)
**Fecha de auditoría:** 2026-06-22
**Fecha de corte evaluada:** 2026-06-22
**Veredicto:** FAIL

## Separación de Funciones (SoD)

| Stage | Rol declarado | Instancia/sesión | Evaluación SoD |
|---|---|---|---|
| 01 Brief | DraftAgent | Claude Code, sesión 2026-06-22 | Concentración declarada: misma sesión que 02–04 |
| 02 Dossier | ResearchAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Concentración declarada: misma sesión que 01/03/04 |
| 03 Outline | OutlineAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Concentración declarada: misma sesión que 01/02/04 |
| 04 Draft | DraftAgent | Claude Sonnet 4.6, sesión 2026-06-22 | Concentración declarada: misma sesión que 01–03 |
| 05 Math Audit | Sin instancia | Artefacto ausente; el publish packet lo declara eximido | Separación incompleta |
| 06 Compliance | ComplianceAgent | Codex, sesión fresca 2026-06-22, sin participación en 01–04 | Independiente del DraftAgent |

Los stages 01–04 fueron producidos por la misma sesión. Ese defecto de concentración está
declarado. La presente auditoría fresca resuelve estructuralmente la separación exigida entre
`DraftAgent` y `ComplianceAgent`: esta instancia no produjo ni participó en 01–04. No obstante,
la cadena completa sigue incompleta por la ausencia de `05-math-audit.md`.

## Scorecard NORMA_YMYL

| Dimensión | Peso | Nota | Aporte ponderado | Justificación adversarial |
|---|---:|---:|---:|---|
| Respuesta ancla | 35% | 5.5/10 | 1.93 | Responde temprano con tres pasos, pero convierte C1, C1b y C4 —todos `TODO:SOURCE`— en reglas categóricas. |
| Precisión + fuentes | 25% | 3.5/10 | 0.88 | C2 se amplía más allá de lo verificado; C3 se omite; C1/C1b/C4/C5/C6 contienen afirmaciones no respaldadas. Los enlaces apuntan a portadas, no a fichas específicas. |
| Vigencia + calendario | 15% | 7.0/10 | 1.05 | La fecha de corte es visible, pero no compensa la falta de trazabilidad ni delimita la vigencia de requisitos concretos. |
| Excepciones + cobertura | 15% | 5.5/10 | 0.83 | Declara límites temáticos, pero afirma que el camino no depende del permiso y no cubre con precisión las variaciones que él mismo reconoce. |
| Claridad + estructura | 10% | 8.0/10 | 0.80 | La secuencia es legible y ejecutable, aunque la claridad amplifica el riesgo al presentar como seguras reglas no verificadas. |
| **Total ponderado** | **100%** |  | **5.49/10** | **No alcanza el umbral obligatorio de 9.5/10.** |

## Auditoría de claims C1–C6

| Claim | Estado en dossier | Tratamiento en draft | Resultado |
|---|---|---|---|
| C1 | TODO:SOURCE | El frontmatter y el cuerpo afirman trámite ante SII, presencialidad y documentos; además dicen que el RUT es prerrequisito para contrato y cuenta. | **DEFECTO:** no se mantiene orientativo. |
| C1b | TODO:SOURCE | Afirma que con residencia definitiva el RUN equivale al RUT “para todos los efectos”. | **DEFECTO:** afirmación categórica no verificada. |
| C2 | VERIFIED (2026-06-17) | Cita BancoEstado y reproduce app/web/entrega física, pero añade “otros documentos” y que con RUT SII se puede solicitar, pese a que el claim verificado exige cédula vigente. | **DEFECTO:** cita imprecisa y expansión no respaldada. |
| C3 | VERIFIED (2026-06-17) | No aparece la edad mínima de 12 años ni la condición de representante legal/padre o madre cliente. | **DEFECTO:** omisión de claim VERIFIED y de su fuente. |
| C4 | TODO:SOURCE parcial | Afirma ausencia de prohibición legal, aplicación igualitaria de Ley 21.461, legalidad/habitualidad de UF y cifras de garantías de 1–3 o 2–3 meses. | **DEFECTO:** no se mantiene orientativo; introduce hechos y números sin fuente. |
| C5 | TODO:SOURCE | Afirma que bancos/fintech aceptan extranjeros con cédula, que algunos exigen permiso o residencia, y nombra MACH/Tenpo. | **DEFECTO:** el deferral llega después de afirmaciones específicas no verificadas. |
| C6 | TODO:SOURCE | Afirma efectos sobre contrato formal, AFP, salud y acceso bancario como consecuencias generales. | **DEFECTO:** no se mantiene orientativo ni se respalda con fuentes oficiales. |

Un `TODO:SOURCE` tratado realmente como orientación y remitido de forma legítima a una fuente
oficial no fallaría por el mero deferral. El problema aquí es distinto: el draft formula esos
claims como hechos antes de remitir al lector, y varias respuestas son públicas y concretas,
por lo que `NORMA_YMYL.md §2.4` exige resolverlas antes de publicación.

## Defectos

### DEFECT #1 — HIGH — Claims críticos TODO:SOURCE afirmados como hechos

C1, C1b, C4, C5 y C6 no conservan de forma consistente el carácter orientativo exigido por
el dossier. La respuesta ancla y el cuerpo presentan requisitos, equivalencias, efectos
legales y condiciones de mercado como reglas seguras.

**Resolución:** verificar cada proposición en una ficha oficial específica o reformularla sin
afirmar el contenido no verificado. Registrar URL, texto/valor aplicable y fecha de recuperación.

### DEFECT #2 — HIGH — C2 excede el alcance de la evidencia VERIFIED

El dossier respalda CuentaRUT para extranjeros con **cédula de identidad vigente**. El draft
añade que BancoEstado podría aceptar “otros documentos” y que disponer del RUT del SII permite
solicitarla. Esas extensiones no están respaldadas y pueden inducir a actuar con documentación
insuficiente.

**Resolución:** limitar C2 exactamente a la evidencia verificada y citar la URL específica de
BancoEstado; eliminar toda extensión no documentada.

### DEFECT #3 — HIGH — Omisión total del claim VERIFIED C3

El draft no incluye la edad mínima de 12 años ni las condiciones asociadas, y tampoco cita su
fuente. La omisión incumple el carry-forward obligatorio de elementos VERIFIED.

**Resolución:** incorporar C3 con redacción fiel, condiciones completas y fuente oficial
específica, o justificar formalmente su exclusión del alcance antes de una nueva auditoría.

### DEFECT #4 — HIGH — Afirmaciones legales sin estándar de cita

“No existe ninguna ley que prohíba”, la aplicación igualitaria de Ley 21.461, la legalidad del
arriendo en UF y la condición de no discriminación se presentan sin artículo, cláusula
operativa ni URL oficial específica. Una afirmación de inexistencia normativa no queda probada
citando una sola ley.

**Resolución:** retirar las afirmaciones universales o respaldarlas con norma y artículo
aplicables; citar primero el texto operativo y etiquetar toda síntesis como “resumen
orientativo” con limitador de alcance.

### DEFECT #5 — HIGH — Cifras no trazables y Gate 05 ausente

El draft incluye 1–3 meses, 2 meses, 2–3 meses, edad/requisitos implícitos y el año 2022, pero
no existe `05-math-audit.md`. La exención declarada en el publish packet no está sustentada por
un `requires_calculation: false` en el brief y deja sin auditoría independiente números que
afectan decisiones financieras.

**Resolución:** ejecutar Stage 05 en instancia independiente, auditar todos los números y
crear el artefacto canónico antes de repetir Gate 06.

### DEFECT #6 — MEDIUM — Fuentes sin trazabilidad suficiente

El frontmatter enlaza solo las portadas de SII, Registro Civil y BancoEstado. La mención
“recuperado vía Scrapling” describe el método, no identifica la ficha oficial ni permite al
lector comprobar el claim.

**Resolución:** usar URLs oficiales profundas y estables para cada regla crítica, con fecha de
recuperación y el texto o valor exacto que respalda la redacción.

### DEFECT #7 — MEDIUM — Generalización incompatible con el alcance

El lead sostiene que “no importa [...] qué tipo de permiso tengas”, mientras el propio draft
divide rutas según situación migratoria y reconoce requisitos variables. La frase puede llevar
a una persona a asumir elegibilidad no comprobada.

**Resolución:** eliminar la generalización y explicar, de forma orientativa, que la ruta y los
documentos dependen de la situación individual y de los requisitos oficiales vigentes.

### DEFECT #8 — INFO — Independencia de Gate 06 acreditada

Esta sesión es fresca y no produjo 01–04. Se satisface la separación entre DraftAgent y
ComplianceAgent. Esto no corrige por sí solo los defectos de contenido ni sustituye Stage 05.

**Resolución:** ninguna para la independencia de Gate 06; conservar esta evidencia en el
publish packet para revisión humana.

## Veredicto y condiciones para Gate 07

**FAIL.** Existen defectos bloqueantes HIGH y el total NORMA_YMYL es **5.49/10**, inferior al
umbral de **9.5/10**. Gate 07 no puede aprobar publicación.

Condiciones mínimas para una nueva evaluación:

1. Resolver o reformular correctamente C1, C1b, C4, C5 y C6 sin afirmaciones no verificadas.
2. Corregir C2 para que coincida exactamente con su fuente y restaurar C3 con cita oficial.
3. Sustituir enlaces de portada por fuentes oficiales específicas y trazables.
4. Ejecutar Gate 05 de forma independiente y crear `05-math-audit.md`.
5. Remediar el draft y repetir Gate 06 en otra sesión fresca.
6. Mantener todas las casillas de `07-publish-packet.md` sin marcar hasta decisión de Carlos Ortega.

## Escalamiento humano

Carlos Ortega debe revisar la resolución de fuentes, confirmar la necesidad y alcance de Gate
05, y decidir Gate 07. Esta auditoría no autoriza publicación ni modifica ninguna casilla de
sign-off.
