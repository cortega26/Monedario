# Delta re-audit R3 — descuentos de sueldo

## Identidad y alcance

- **Protocolo:** AI_AUDIT_PROTOCOL v1; ComplianceAgent (adversarial).
- **Auditor:** OpenAI GPT-6 (Codex runtime; no se expone un identificador separado de build/revisión).
- **Separación:** el usuario identifica a DeepSeek V4.1 Flash como responsable de la tercera remediación; el auditor pertenece a otra familia.
- **Checkout auditado:** /tmp/opencode/wt-audit-descuentos-3.
- **HEAD:** 53c7aa5d650eac411357f1a5be802e023c5e486f, detached; preflight pasó y el worktree estaba limpio.
- **En alcance:** D9, D10 y D11. D12, D15 y D17 se mantienen resolved. No se reabren D1–D8, D13, D14, D16 (causa 2) ni D18 (se cierra en la firma).
- **Evidencia nueva:** [evidence/18-delta-reaudit-r3-evidence-2026-10-27.txt](evidence/18-delta-reaudit-r3-evidence-2026-10-27.txt). Las fuentes normativas y cada URL de producto citada aquí se abrieron de nuevo el 2026-10-27; no se reutilizaron extractos de evidence/11–17.

## Veredicto

**CONDITIONAL.** D9 y D11 quedan resueltos en el checkout auditado. D10 sigue abierto por un ejemplo visible de metodología que calcula el descuento de 0,6% para un trabajador indefinido sin excluir explícitamente a casa particular. La guarda R3 pasa, pero no inspecciona el archivo que contiene ese ejemplo y tiene otros mecanismos de falso negativo. Queda un defecto de producto abierto; el protocolo bloquea la publicación.

Las URLs públicas siguen mostrando contenido anterior en varias páginas, incluida una tabla que asigna 0,6% al trabajador de casa particular. Los estados resolved de D9 y D11 en este artefacto se refieren al contenido del SHA objetivo; no significan desplegado o corregido en producción. No se declara la pieza publicable, no se completa humanSignoff y no se afirma despliegue.

| ID | Estado en HEAD | Resultado adversarial |
|---|---|---|
| D9 | **Resolved** | primer-empleo:112 limita la obligación de la persona no afiliada a quien aceptó la extensión; también menciona la continuidad del instrumento vigente tras desafiliarse. El cuerpo principal agrega pago total/parcial según acuerdo y criterios objetivos, generales y no arbitrarios. |
| D10 | **Open** | El contenido local del cluster, FAQ/JSON-LD, metadatos de tasa, ficha legal y nota metodológica de interés compuesto incluyen la excepción. El ejemplo importado de CalculateNetSalary.methodology.ts descuenta 0,6% en un caso genérico indefinido sin mencionar casa particular. La guarda no cubre ese archivo. |
| D11 | **Resolved** | descuentos-de-sueldo:136 conserva que la remuneración es adeudada por el trabajador y que las personas estuvieron a su servicio en calidad de trabajador, además del límite del 50% y los otros dos supuestos. |

## D9 — extensión aceptada y desafiliación (arts. 322–323)

La frase breve de src/data/blog/primer-empleo-chile-guia-completa.md:112 ya no restringe la cuota a afiliados: menciona a quien no está afiliado **pero aceptó** la extensión y a quien se desafilió mientras sigue vigente el instrumento colectivo. No afirma que el no afiliado que no acepta la extensión deba pagar.

El cuerpo de src/data/blog/descuentos-de-sueldo.md:112 completa el resumen: el no afiliado que acepta paga todo o parte de la cuota según el acuerdo, y ese acuerdo debe usar criterios objetivos, generales y no arbitrarios; quien cambia o deja el sindicato sigue sujeto al instrumento vigente y paga la cuota ordinaria completa mientras dure. La redacción coincide con los arts. 322–323 de BCN y la guía DT consultadas de nuevo. D9 queda **resolved en HEAD**.

La URL pública de primer empleo no muestra la remediación local: un GET sin caché devuelve la frase antigua que clasifica “sindicato” entre descuentos voluntarios o autorizados que requieren una autorización firmada; la búsqueda de “cuota sindical” no encontró texto. Esto impide llamar resuelta la superficie pública; la diferencia está identificada como runtime anterior, no como defecto del SHA revisado.

## D10 — excepción de casa particular al 0,6%

### Checkout y superficies recorridas

La Ley 19.728, art. 5, pone el 0,6% a cargo de la persona trabajadora indefinida “con excepción de los trabajadores de casa particular”; para casa particular, el 3% es íntegramente de cargo patronal cualquiera sea la duración del contrato. La Ley, art. 2, además enumera exclusiones de cobertura y sus excepciones. BCN y AFC se consultaron de nuevo el 2026-10-27; los extractos están en evidence/18.

El barrido nuevo de src no encontró otra mención local descalificada del 0,6% en las superficies editoriales y calculadoras revisadas:

- Artículos relacionados y el artículo principal separan indefinido, plazo fijo y casa particular; donde aparece 0,6%, se declara la excepción o se identifica el caso al que se aplica.
- sueldoLiquidoFaqs provee la respuesta corregida a CalculatorJsonLd; la respuesta FAQ visible repite el mismo texto. También lo hacen la ayuda del selector y la descripción visible de la tasa.
- La ficha local de Ley 19.728 llama “Regla general” al resumen de indefinido/plazo y tiene una fila independiente que atribuye 0% de trabajador y 3% de empleador a casa particular.
- La nota metodológica de interés compuesto incluye el 0,6% estándar y luego dice expresamente que no se descuenta a casa particular y que su total se reduce.
- src/pages/llms-full.txt.ts concatena los cuerpos locales de artículos; el barrido de esos cuerpos encuentra la excepción. No se pudo generar la salida local porque el build se detuvo antes del build de Astro.

### Defecto local que permanece

src/application/use-cases/CalculateNetSalary.methodology.ts:46–63 define un ejemplo visible en la calculadora. El escenario es “Un trabajador con contrato indefinido”; el paso siguiente resta 0,6% y calcula $6.000. El texto no dice que el ejemplo excluya a casa particular. Una persona trabajadora de casa particular puede tener contrato indefinido, y el art. 5 mantiene su excepción sin importar esa duración. El ejemplo aún puede comunicarle a esa persona que corresponde descontarle 0,6%.

MethodologyBlock inserta ese objeto en src/pages/calculadoras/sueldo-liquido.astro:1023–1025. Es contenido visible distinto de la FAQ estructurada, que sí está corregida. D10 queda **open** aunque el resto del barrido local no presente otra omisión equivalente.

### Evaluación de la guarda R3

El comando de Vitest pasa con 3 archivos y 29 pruebas. Ese resultado no descarta el defecto:

1. SURFACES solo reúne artículos Markdown, glosarios y archivos Astro de calculadoras. No incluye src/application/use-cases/CalculateNetSalary.methodology.ts, donde vive la frase residual. La prueba pasa mientras la calculadora visible presenta el ejemplo.
2. El detector exige que el 0,6% y el contexto AFC aparezcan en la misma línea; una tasa en otra línea que dependa de un encabezado contextual queda sin revisar.
3. La ventana de ±3 líneas acepta una coincidencia “casa particular” de cualquier línea próxima, incluso si pertenece a otro párrafo y no califica la afirmación de 0,6%.
4. tableHeaderFor agrega el encabezado entero de la tabla sin comprobar fila, columna ni celda. La palabra “Casa particular” en cualquier parte del encabezado puede calificar una tasa en otra columna aunque esa celda no indique 0%.

El defecto real de metodología demuestra una brecha material de cobertura. La aprobación de la guarda no es evidencia fiable de que se hayan barrido todas las superficies; el defecto sigue clasificado como D10 y no se crea D20 por la misma causa.

### Motor: rutas y pruebas

La función de tasa en CalculateMonthlyPayrollBase.ts retorna 0,6 solo cuando contractType === "indefinido"; para casa-particular retorna 0. formController.ts mapea la opción del selector a casa-particular y la propaga tanto a bruto→líquido como a líquido→bruto. Las comparaciones AFP hacia delante y hacia atrás reenvían el mismo contractType; la inversión mantiene el tipo en sus iteraciones y en el cálculo final.

Comando ejecutado:

    pnpm exec vitest run tests/static-analysis/afc-casa-particular-guard.test.ts tests/application/CalculateMonthlyPayrollBase.test.ts tests/application/CalculateNetSalary.test.ts

Resultado: **3 archivos, 29 tests aprobados**. El test de nómina cubre casa particular incluso con contrato indefinido; los tests del use case cubren ambos sentidos. No hay test localizado que conduzca el DOM real de casa particular a ambas comparaciones AFP; esa parte se verificó siguiendo estáticamente el flujo completo. No encontré ruta del motor que reste 0,6% cuando recibe casa-particular.

### Runtime público

Las URL públicas se abrieron de nuevo el 2026-10-27; las páginas HTML se confirmaron con GET sin caché y HTTP 200. Hay diferencias materiales respecto del HEAD: la guía de seguro muestra 0,6% trabajador y 2,4% empleador en la fila de casa particular; el glosario AFC y otras guías no exponen la excepción; la calculadora pública de sueldo líquido no menciona casa particular y su ejemplo resta $6.000; la calculadora de seguro también sirve texto anterior. El endpoint llms-full devolvió HTTP 200 y 604.489 bytes; su fila de casa particular asigna 0,6% trabajador y 2,4% empleador. La guía pública de descuentos mantiene además la generalización que manda impugnar cualquier descuento fuera de sus categorías, sin el supuesto de embargo del art. 57.

Estas respuestas no se pudieron asociar a 53c7aa5d650eac411357f1a5be802e023c5e486f. Se registran como runtime público no actualizado y no como prueba del contenido local.

## D11 — tercer supuesto del art. 57

El art. 57 del Código del Trabajo permite el embargo de hasta 50% en tres supuestos específicos. El tercero se limita a remuneraciones adeudadas **por el trabajador** a personas que hayan estado a su servicio **en calidad de trabajador**.

src/data/blog/descuentos-de-sueldo.md:136 conserva literalmente esas dos condiciones. El mismo párrafo mantiene el exceso de 56 UF, el 50%, alimentos debidos por ley y decretados judicialmente, y defraudación/hurto/robo contra el empleador en ejercicio del cargo. La comparación nueva con el extracto BCN confirma que el tercer supuesto ya no se amplía. D11 queda **resolved en HEAD**.

La URL pública de descuentos todavía sirve texto anterior y no refleja esta redacción. Al igual que D9, la resolución en este resultado se limita al checkout.

## Diferidos, evidencia y límites

D12, D15 y D17 permanecen resolved según el alcance del usuario. D1–D8, D13, D14 y D16 (causa 2) no se reabren; D18 sigue reservado para la firma. No se identificó un defecto independiente D20.

El build ya intentado terminó en check:image-curation después de test:edge-guard y check:hero-prompts; ocho artículos editados requieren revisión de imagen. El proceso no llegó al build de Astro ni generó dist/llms-full.txt. No se repitió ni se omitió ese gate.

El alcance de escritura se limita a este informe, a la actualización aditiva de 02-result.json y a evidence/18-delta-reaudit-r3-evidence-2026-10-27.txt. No se corrigió la pieza, motor ni tests; no se modificó humanSignoff; no hubo commit ni push.
