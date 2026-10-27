# Delta re-audit R2 — descuentos de sueldo

- **Protocolo:** AI_AUDIT_PROTOCOL v1; ComplianceAgent (adversarial).
- **Auditor/modelo:** OpenAI GPT-6 (Codex runtime; el ID expuesto fue GPT-6, sin revisión/build separado).
- **Independencia:** la remediación se atribuye a DeepSeek V4.1 Flash, según el contexto del usuario. No es la familia del auditor.
- **Checkout:** `/tmp/opencode/wt-audit-descuentos-2`, HEAD detached por diseño, `4fd605b8eef33cf08eb34ed3a7499ba98c932f84`, padre `0498e8abd5bb5cd23c9a96ed4f51d587f7dd8976`.
- **Alcance:** D9, D10, D11, D12 y D19. D15/D17 se conservan resolved; D1–D8, D13, D14, D16 (causa 2) y D18 no se reabrieron.
- **Evidencia fresca:** [evidence/17-delta-reaudit-r2-evidence-2026-10-27.txt](evidence/17-delta-reaudit-r2-evidence-2026-10-27.txt). Las URL oficiales de evidence/11–16 se reabrieron el 2026-10-27; esos extractos anteriores no se usaron como prueba.

## Resultado

**CONDITIONAL.** En el checkout quedan tres defectos de producto abiertos: D9, D10 y D11. D12 y D19 se resolvieron en el código revisado. No se identificó un defecto independiente nuevo que amerite D20. La pieza no queda declarada publicable y `humanSignoff` permanece `null`.

| ID | Estado en HEAD | Verificación independiente |
|---|---|---|
| D9 | **Open** | La explicación larga y la FAQ principal cubren aceptación de extensión, cuota total o parcial por acuerdo y obligación del exafiliado solo mientras rige el instrumento. La copia corta de primer empleo todavía dice “cuota sindical (si estás afiliado)”. Además, se omite el criterio objetivo, general y no arbitrario del acuerdo de extensión. |
| D10 | **Open** | El motor aplica 0% si se selecciona `casa-particular`; sin embargo, permanecen superficies editoriales, FAQ/datos estructurados y LLM que presentan el 0,6% como regla general. Primer empleo además conserva un total de ~18,1% que incluye el 0,6% aunque la misma fila dice 0% para casa particular, y afirma cobertura para todo trabajador con contrato vigente pese a exclusiones legales. |
| D11 | **Open** | Se enumeran tres grupos y el supuesto de defraudación/hurto/robo contiene “contra su empleador en el ejercicio de su cargo”. El tercer supuesto omite que la remuneración debe ser adeudada por el trabajador a personas que estuvieron a su servicio **en calidad de trabajador**. Esa condición no queda expresa, así que la lista no pasa el criterio adversarial de completitud. |
| D12 | **Resolved en HEAD** | El cuerpo y la FAQ dicen que no se descuenta de inmediato y que debe verificarse al término de la semana el incumplimiento imputable. El cuerpo distingue las 45 horas históricas del ORD. 1578 de las 42 horas vigentes desde el 26-04-2026. |
| D19 | **Resolved en HEAD** | La cita del art. 58 inc. 5 coincide con BCN en la palabra “entrega de medicinas” (plural), y en el resto del inciso cotejado. |

## D9 — cuota sindical

El artículo principal, en `src/data/blog/descuentos-de-sueldo.md:112`, y su FAQ (`:195–196`) ya corrigen la limitación a afiliados: una persona no afiliada paga solo después de aceptar la extensión, por la cuota que fije el acuerdo; quien cambia de sindicato o se desafilia sigue sujeto al instrumento colectivo vigente y paga la cuota ordinaria completa durante su vigencia. No se afirma que un no afiliado que no acepta la extensión deba pagar.

La FAQ principal empieza con el ejemplo de una persona afiliada, pero de inmediato aclara que la obligación no se limita a afiliados y explica ambos supuestos. Esa superficie no conserva el error. La pieza relacionada `src/data/blog/primer-empleo-chile-guia-completa.md:112` mantiene la frase abreviada “La cuota sindical (si estás afiliado)” sin los arts. 322–323; deja la impresión de que solo los afiliados pueden deberla. Además, la explicación larga no menciona que el acuerdo de extensión debe usar criterios objetivos, generales y no arbitrarios. D9 permanece **open**.

## D10 — 0,6% de AFC y casa particular

La excepción se incorporó correctamente en `descuentos-de-sueldo.md:108,156,169–173`; en el FAQ de primer empleo (`:46`) y en su texto (`:110,191`); en `liquidacion-de-sueldo.md:105`; en la tabla `seguro-de-cesantia.md:73–79`; y en el texto de `/calculadoras/seguro-cesantia/` (`src/pages/calculadoras/seguro-cesantia.astro:357–367`). En `liquidacion-de-sueldo`, la FAQ no da una regla de aporte AFC; no es una omisión adicional.

Persisten afirmaciones incompletas o contradictorias:

- `primer-empleo-chile-guia-completa.md:224–225` pone 0% para casa particular en la fila AFC, pero conserva `~18,1%` como total; ese total suma el 0,6% de trabajador y no se ajusta para casa particular. La FAQ y el cuerpo explican la excepción, pero la tabla no reconcilia el total.
- `primer-empleo-chile-guia-completa.md:189` dice que el seguro es obligatorio para “todo trabajador con contrato de trabajo vigente”. La Ley 19.728 excluye aprendices, menores de 18 y pensionados, salvo excepciones; la misma guía no acota esa afirmación.
- `sueldo-imponible-chile.md:109` menciona la excepción, pero la fórmula de `:96` y el ejemplo de `:151–158` muestran 0,6% sin condicionar el ejemplo a un contrato aplicable.
- El 0,6% aparece sin la excepción doméstica en `como-calcular-sueldo-liquido.md:84–88,139–150,188`, `seguro-cesantia-cuenta-individual-vs-fondo-solidario.md:70`, `src/data/glossary/sueldo-bruto.md:27` y `src/data/glossary/fondo-solidario.md:14`.
- En la calculadora de sueldo líquido, el selector y su ayuda sí ofrecen casa particular (`sueldo-liquido.astro:286–296`), pero la FAQ fuente (`:98–100`), FAQ visual (`:841–844`) y FAQ estructurada que se entrega a `CalculatorJsonLd` (`:164–168`) omiten la excepción. También la omiten la explicación (`:714–716`) y las notas de metodología (`:1025`).
- La FAQ `seguro-de-cesantia.md:217–219` responde si casa particular puede cobrar; su frase “las reglas son las mismas que para contrato indefinido” no limita claramente la comparación a elegibilidad/beneficios, en una página que también explica tasas. La FAQ de `/calculadoras/seguro-cesantia/` habla de cobertura y no distribuye el 0,6%.
- El generador local `src/pages/llms-full.txt.ts` concatena el contenido de artículos publicados; por ello expone las copias residuales anteriores. El endpoint público `/llms-full.txt` se verificó con contenido antiguo que atribuye a casa particular 0,6% al trabajador.

**Motor:** la lógica del checkout está corregida para el tipo seleccionado. `CalculateMonthlyPayrollBase.ts:93–115` retorna 0,6 solo para `indefinido`; `casa-particular` retorna cero. `formController.ts:139–159` mapea el selector a `casa-particular`, lo pasa a bruto→líquido y AFP comparison, y lo pasa a líquido→bruto y su comparación. El test `tests/application/CalculateMonthlyPayrollBase.test.ts:62–76` afirma cero incluso en el caso `casa-particular` indefinido y pasó (12 pruebas). No hallé un camino local que descuente el 0,6% cuando el tipo seleccionado es casa particular. El selector inicia en indefinido: la persona debe elegir su tipo para activar la excepción; el test es del use case y no un E2E del selector.

D10 permanece **open** por las superficies editoriales/estructuradas/LLM señaladas, aunque los principales pasajes de la pieza objetivo y el motor ya incluyan la excepción.

## D11 — embargos del art. 57

`descuentos-de-sueldo.md:136` ya incorpora el umbral sobre 56 UF y los tres grupos de hasta 50%: alimentos debidos por ley y decretados judicialmente; defraudación, hurto o robo del trabajador contra el empleador en ejercicio del cargo; y remuneraciones adeudadas a personas que estuvieron al servicio del deudor. El segundo grupo contiene la condición requerida.

El texto reduce el tercer supuesto y omite sus límites expresos: que la remuneración sea adeudada **por el trabajador** y que esas personas hayan estado a su servicio **en calidad de trabajador**. Aunque el contexto permite inferir parte de ello, la redacción no conserva todo el supuesto legal y puede ampliar la categoría. D11 permanece **open** por el criterio de lista completa.

## D12 — descuento de atrasos

`descuentos-de-sueldo.md:142` y FAQ `:192–193` dicen que el descuento no es inmediato y requiere verificar al término de la semana si el incumplimiento de jornada acordada fue imputable al trabajador; limitan el descuento al tiempo faltante. El cuerpo identifica que ORD. 1578 aplicó el antiguo límite de 45 horas y que la jornada vigente es 42 horas desde el 26 de abril de 2026. D12 queda **resolved en el checkout**.

## D19 — cita literal del art. 58 inc. 5

El cotejo directo entre `descuentos-de-sueldo.md:134` y BCN art. 58 inc. 5 (URL y líneas en la evidencia) confirma el plural “medicinas”, y el resto del inciso cotejado coincide. D19 queda **resolved en el checkout**.

## Runtime y límites

Las URL públicas se consultaron otra vez con cabeceras no-cache el 2026-10-27 y respondieron HTTP 200. Su HTML no se pudo asociar al SHA del worktree: varias superficies siguen sirviendo el contenido anterior, incluida una tabla pública de seguro de cesantía que atribuye 0,6% a casa particular, la FAQ pública de sueldo líquido sin excepción y `/llms-full.txt` con la fila doméstica incorrecta. Por tanto, la resolución de D12/D19 describe el checkout examinado; no demuestra que esos cambios estén desplegados. No se afirma publicación ni estado publicable.

Se ejecutó `pnpm exec vitest run tests/application/CalculateMonthlyPayrollBase.test.ts`: 1 archivo y 12 pruebas aprobadas. No se ejecutaron build, E2E ni Playwright; la revisión de motor fuera de esa prueba fue estática. La evidencia primaria, los extractos y la fecha de cada consulta están en [evidence/17-delta-reaudit-r2-evidence-2026-10-27.txt](evidence/17-delta-reaudit-r2-evidence-2026-10-27.txt).

No se corrigió la pieza ni el motor. Solo se preparan este informe, el archivo de evidencia y la actualización incremental de `02-result.json`; no se hizo commit ni push.
