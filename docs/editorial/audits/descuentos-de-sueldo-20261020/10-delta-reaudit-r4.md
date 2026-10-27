# Re-auditoría delta R4 — D10

**Veredicto: CONDITIONAL.** D10 sigue abierto; no se cumplen los 0 defectos de producto requeridos para cerrarlo. La revisión se limita a D10 en `/tmp/opencode/wt-audit-descuentos-4`, HEAD `d3897fad94b8d18f190c9da3db2ab17f4bfe94fa`. D9, D11, D12, D15 y D17 se preservan como resueltos sin reabrirlos. D1–D8, D13, D14, D16 (causa 2) y D18 quedan diferidos.

## 1. Nota metodológica: corregida y coherente

La nota visible en `CalculateNetSalary.methodology.ts:45-68` ahora especifica que su ejemplo de contrato indefinido excluye a trabajadores de casa particular, y su paso del 0,6% también limita el supuesto. `sueldo-liquido.astro:1023-1025` confirma que el ejemplo se presenta al usuario.

El resultado de **$809.600** es correcto para ese supuesto: $1.000.000 − $114.400 de AFP − $70.000 de salud − $6.000 de AFC. La reimplementación independiente y `calculateNetSalary` produjeron el mismo resultado, con impuesto $0. La fuente primaria, la Ley 19.728 art. 5, excluye expresamente casa particular y carga el 3% a su empleador. Extractos y salida reproducible: [evidence/19, S1–S2 y S7](evidence/19-delta-reaudit-r4-evidence-2026-10-27.txt#S1).

## 2. Barrido de superficies: D10 continúa en producto

Las ediciones locales de la pieza principal, otras guías, glosarios, FAQ estructuradas, enlaces de configuración y calculadora de sueldo líquido sí expresan la excepción. El selector de sueldo líquido admite `casa-particular` y el formulario la transmite al motor.

Quedan caminos locales que todavía presentan o calculan el 0,6% sin una opción para casa particular:

- **Calculadora APV:** solo ofrece indefinido o plazo fijo/obra. Al construir la entrada, cualquier selección que no sea plazo fijo se convierte en indefinido. Después llama a `calculateApvComparison`.
- **Operación Renta:** ofrece las mismas dos opciones y también transforma cualquier valor distinto de plazo fijo en indefinido antes de llamar a `calculateNetSalary`.
- **Ficha local de Ley 19.728:** la respuesta rápida describe el aporte de 0,6% para indefinidos sin mencionar ahí la excepción de casa particular. La tabla posterior sí marca casa particular con aporte trabajador 0%. Como esa respuesta puede leerse antes que la tabla, la regla queda incompleta en una superficie de producto.

Una persona de casa particular que use APV u Operación Renta y escoja indefinido termina con un descuento de 0,6% que no corresponde. El barrido y las referencias de línea están en [evidence/19, S3](evidence/19-delta-reaudit-r4-evidence-2026-10-27.txt#S3).

Reabrí directamente el 2026-10-27 las 18 URLs enumeradas en S4. El runtime público aún contiene, entre otras cosas, una fila que asigna 0,6% al trabajador de casa particular y varias páginas que dan el porcentaje indefinido sin la excepción. Esos HTML no se pueden asociar a este SHA; quedan registrados como observación de runtime, no como prueba del checkout. Ver [evidence/19, S4](evidence/19-delta-reaudit-r4-evidence-2026-10-27.txt#S4).

## 3. Motor: correcto con tipo explícito, pero no en todos los flujos

Con `contractType="casa-particular"`, el motor devuelve AFC de trabajador 0% en la base mensual, cálculo de líquido, bruto inverso y comparación APV. Eso coincide con la ley.

No puedo confirmar que casa particular evite el 0,6% en todo camino de producto: la entrada admite contrato opcional y omitirlo aplica el default indefinido; APV y Operación Renta además fuerzan ese tipo porque no ofrecen casa particular. El probe ejecutado imprimió cero en cada ruta explícita, $6.000 cuando falta el tipo y el desglose del ejemplo metodológico. Resultado crudo en [evidence/19, S2](evidence/19-delta-reaudit-r4-evidence-2026-10-27.txt#S2).

## 4. Guarda: persiste un falso negativo demostrado

La ampliación de cobertura ahora incluye `src/application/use-cases/*.ts` y `src/config/*.ts`, pero no es semántica:

- Solo examina líneas que contienen a la vez 0,6% y uno de `cesant|afc|CIC|FCS`. Una tabla con “AFC” en el título y el porcentaje en otra fila/celda puede pasar sin ser evaluada.
- La vecindad de tres líneas y el encabezado de tabla aceptan cualquier mención de casa particular, aunque esté en otra columna o no describa el porcentaje. Tampoco verifican negación o contradicción.
- No detecta variantes como “0,6 por ciento” o `0.006`, ni escanea `src/data/laws/*.md`.

Lo probé con un fixture temporal que afirmaba explícitamente: “Cesantía AFC para trabajador de casa particular: aporte trabajador 0,6%.” La ejecución de la guarda terminó con **3/3 tests pasados**; no rechazó la afirmación. Eliminé el fixture y no cambié el test ni el código. El caso, comando y salida están en [evidence/19, S5](evidence/19-delta-reaudit-r4-evidence-2026-10-27.txt#S5).

## 5. Registro de portadas: juicio explícito

`asset-reviews.json` preservó los hashes previos en `history` y se sincronizó con los nuevos hashes de contenido sin modificar archivos de imagen. `check:image-curation` pasó. Sin embargo, las entradas mantienen fechas y métodos de revisión anteriores al cambio de artículos del 27; el verificador exige estado `accepted` y coincidencia de hashes/bytes, pero no que una inspección visual documentada sea posterior a cada edición.

**Juicio:** es un registro aceptable de huellas e historial, pero no demuestra una revisión visual actual del contenido editado el 27. Mantener el estado `accepted` sin anotar esa revisión equivale operativamente a aprobar la versión actual sin documentar una inspección visual. Esto no prueba que haga falta regenerar imágenes; R4 no las regeneró ni modificó. Detalle en [evidence/19, S6](evidence/19-delta-reaudit-r4-evidence-2026-10-27.txt#S6).

## 6. Protocolo, decisión y verificación

- **R1–R3:** cálculo independiente ejecutado en JavaScript; la salida cruda coincide con el motor para el ejemplo y muestra cero AFC en rutas con tipo casa particular explícito.
- **R4–R5:** cada hallazgo se enlaza a evidencia nueva; la guarda se atacó con una afirmación falsa concreta y pasó.
- **R6:** D10 queda abierto; veredicto CONDITIONAL, sin PASS.
- **R7:** SHA, checkout, URLs, comandos y salidas están en [evidence/19](evidence/19-delta-reaudit-r4-evidence-2026-10-27.txt). Se reabrieron directamente las URLs citadas; no se usaron extractos anteriores como prueba.
- **R8:** no se corrigió código, contenido ni registro visual; no hubo commit ni push. `humanSignoff` permanece `null`.

Verificaciones ejecutadas:

- Preflight del SHA requerido y ausencia de cambios antes de auditar: pasó.
- `pnpm run check:image-curation`: pasó.
- Vitest focal: 4 archivos, 38 tests pasaron.
- Probe temporal del motor: 1 test pasó.
- Probe de falso negativo de la guarda: 3 tests pasaron pese al caso incorrecto.
- `pnpm run check:audit-artifacts`: 3 artefactos válidos.
- JSON parse y `git diff --check`: pasaron.
- Al cierre solo están modificados `02-result.json` y los dos entregables R4 (este informe y evidence/19).

D10 no se cierra: APV y Operación Renta continúan aplicando el 0,6% a personas de casa particular que usen el flujo indefinido, y la respuesta rápida de la ficha legal todavía omite la excepción. No se declara publicable.
