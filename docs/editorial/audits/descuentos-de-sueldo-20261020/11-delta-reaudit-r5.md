# Reauditoría delta R5 — D10

**Veredicto: CONDITIONAL. D10 sigue abierto.** La remediación corrigió los selectores y el flujo interactivo local de APV y Operación Renta, pero R5 encontró otros defectos de producto dentro del mismo alcance: un ejemplo APV cae al default de indefinido; la salida de costo empleador y la tabla local de la ley asignan mal aportes; y el runtime público todavía presenta una fila que descuenta 0,6% a casa particular. No se cumplen los 0 defectos de producto abiertos.

**Target:** `/tmp/opencode/wt-audit-descuentos-5`, HEAD `da2277aefe05b0ce16197b39369379999f1277ed`. **Alcance exclusivo:** D10. D9, D11, D12, D15 y D17 se preservan como resueltos; D1–D8, D13, D14, D16 (causa 2) y D18 permanecen diferidos, sin reabrirlos. `humanSignoff` queda `null`.

**R1:** no consulté archivos de memoria ni usé extractos de `evidence/11–19` como prueba. Las fuentes primarias y URLs públicas se reabrieron y los probes se ejecutaron desde el checkout R5.

## 1. R2 — fuentes primarias vigentes

Reabrí el 2026-10-27 la [Ley 19.728 en BCN](https://www.bcn.cl/leychile/navegar?idNorma=184979), arts. 5 y 9, y la [tabla de cotizaciones de AFC](https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/). Art. 5 excluye a casa particular del 0,6% a cargo del trabajador y fija el 3% patronal sin importar duración. Art. 9 y AFC distribuyen ese 3% como 2,2% CIC y 0,8% FCS; AFC añade aparte 1,11% CAI. Extractos, URLs y fecha de recuperación: [evidence/20 §S1](evidence/20-delta-reaudit-r5-evidence-2026-10-27.txt#S1).

La regla rápida de la **ficha local** ahora sí expresa la excepción. Su tabla no es coherente: marca 3,0% a CIC y 0,0% a FCS para casa particular. La fuente primaria indica 2,2% a CIC y 0,8% a FCS. La fila conserva el total, pero atribuye los fondos incorrectamente. [evidence/20 §S2](evidence/20-delta-reaudit-r5-evidence-2026-10-27.txt#S2).

## 2. R3 — superficies de cálculo y reclasificación independiente

| Superficie local R5 | Selector y camino al motor | Resultado de auditoría |
|---|---|---|
| **Sueldo líquido** — bruto→líquido y líquido→bruto; comparación por las siete AFP en ambos sentidos | La opción casa existe y `formController` transmite `casa-particular` a los motores. Ambas ramas de comparación AFP reciben el mismo tipo. | **Correcto para tipo casa explícito:** AFC de trabajador $0 en bruto→líquido, líquido→bruto y las 14 comparaciones. El ejemplo estático sí calcula contrato indefinido, pero el copy visible no identifica ese supuesto. Además, el costo AFC patronal trata casa como indefinido: muestra 2,4% en vez de 3% ($24.000 vs. $30.000 sobre $1.000.000). |
| **APV interactivo** | Tiene opción casa; el parser la conserva y pasa al motor. No se convierte a indefinido ni a `undefined`. | **Correcto para tipo casa explícito.** |
| **Ejemplo estático APV** | SSR llama al mismo motor omitiendo `contractType`; el tipo es opcional y el motor aplica `indefinido` por defecto. El ejemplo visible no declara el contrato. | **Defecto D10 abierto:** bajo los datos del ejemplo, omitir el tipo reduce la base $9.000 por el 0,6%. |
| **Estimación de sueldo en Operación Renta** | Selector casa; parser preserva el valor y lo pasa a `calculateNetSalary`, luego anualiza la base ×12. La fase siguiente de impuesto anual no vuelve a calcular AFC. | **Correcto para tipo casa explícito;** sin otro camino oculto que coaccione casa a indefinido. |
| **Cobertura AFC/CIC/FCS** | Es la cuarta superficie AFC hallada. La UI y el tipo del use case solo permiten indefinido/plazo fijo. | **Sin selección casa.** No calcula descuentos AFC de nómina ni 0,6% trabajador. Sus tasas CIC/FCS y mínimo de cotizaciones para indefinido coinciden con los de casa particular, por lo que no hallé una diferencia numérica en su proyección; queda como brecha de representación, no como el descuento de nómina D10. |

El barrido buscó llamadas a `calculateNetSalary`, `estimateGrossFromNet`, `calculateApvComparison`, `estimateUnemploymentCoverage` y salidas `unemploymentInsurance`/AFC en páginas, use cases y comparación AFP. Estas cuatro son todas las superficies interactivas de cálculo que encontré. El default compartido sigue siendo indefinido cuando un consumidor omite el tipo; el ejemplo SSR APV es un caso real de esa ruta. Para el motor, con tipo casa explícito y la entrada probada, los cinco grupos de caminos solicitados devuelven AFC de trabajador cero: bruto→líquido, líquido→bruto, comparación AFP, APV y estimación para Renta. Valores reproducibles: [evidence/24](evidence/24-r5-engine-probe-2026-10-27.txt); fuente y referencias de código: [evidence/20 §§S2–S3](evidence/20-delta-reaudit-r5-evidence-2026-10-27.txt#S2).

El resultado no permite afirmar “cero en cualquier camino”: si el tipo se omite, el motor aplica indefinido. La vista SSR APV ya lo hace. La interfaz interactiva sí transmite casa correctamente.

## 3. R4–R5 — trazabilidad y prueba adversarial de la guarda

La guarda se declara estructural, y esa caracterización es correcta. Protege formas textuales específicas ya observadas, menciones de excepción y presencia de la opción literal en tres páginas. No verifica el enlace selector→parser→use case→motor ni las tasas patronales o la tabla CIC/FCS.

Caso concreto: en una copia temporal eliminé solo el brazo del parser APV que mapea casa a casa. Dejé el radio `value="casa-particular"`; al seleccionarlo, la expresión ahora cae a indefinido y el motor descontaría 0,6%. Ejecuté la guarda intacta contra esa copia: **pasó 5/5**. No modifiqué el test ni el checkout. Por tanto, cubre una forma textual del defecto, no la regresión real de datos. Reproducción y salida: [evidence/26](evidence/26-r5-guard-mutation-probe-2026-10-27.txt); análisis: [evidence/20 §S4](evidence/20-delta-reaudit-r5-evidence-2026-10-27.txt#S4).

## 4. Runtime público reabierto

Volví a abrir las 19 URLs del inventario y ejecuté GETs con encabezados anti-caché y parámetro único R5. Las 19 respondieron HTTP 200 entre 21:04:53 y 21:05:03 GMT del 2026-10-27. El log registra fecha, encabezados e indicadores por URL; los extractos breves reabiertos están en [evidence/20 §S1/S5](evidence/20-delta-reaudit-r5-evidence-2026-10-27.txt#S5) y la lista completa en [§S6](evidence/20-delta-reaudit-r5-evidence-2026-10-27.txt#S6).

En el sitio público, APV, Operación Renta, sueldo líquido y cobertura AFC aún no ofrecen casa particular. La tabla publicada en [Seguro de Cesantía](https://monedario.cl/posts/seguro-de-cesantia/) sigue asignándole 0,6% al trabajador y 2,4% al empleador. La ficha pública de Ley 19.728 omite la excepción en su regla rápida y también distribuye mal la fila. El runtime es evidencia de producto servido al 2026-10-27; no pude asociar ese HTML al SHA R5 ni presentarlo como despliegue de ese SHA.

## 5. R6–R8 — decisión, reproducibilidad y límites

- **R6:** D10 permanece abierto; veredicto CONDITIONAL, nunca PASS. No declaro publicable la pieza.
- **R7:** Preflight requerido pasó: SHA exacto, archivos presentes, worktree limpio y `pnpm run check:image-curation`. La guarda focal pasó 5/5 ([salida](evidence/27-r5-current-guard-2026-10-27.txt)) y el probe del motor pasó 1/1. La mutación temporal demuestra que la guarda pasa una regresión. Los 19 GETs directos respondieron 200. JSON, `check:audit-artifacts` y `git diff --check` pasaron al cierre.
- **R8:** no cambié código, tests del producto, contenido, guarda o human signoff; no hice commit ni push.
- No ejecuté build ni E2E de navegador. El camino de UI se comprobó por lectura del parser/llamadas locales y por pruebas directas de los use cases, no por interacción DOM en navegador. El HTML público se informa por separado y no acredita qué commit lo generó.

D10 solo puede cerrarse cuando el ejemplo APV no aplique el default indefinido inadvertidamente, la tasa patronal de casa particular se calcule al 3%, la tabla local refleje 2,2% CIC + 0,8% FCS, y el runtime de producto deje de publicar la atribución falsa de 0,6% a casa particular. La guarda actual tampoco detectaría una regresión de mapeo como la reproducida.
