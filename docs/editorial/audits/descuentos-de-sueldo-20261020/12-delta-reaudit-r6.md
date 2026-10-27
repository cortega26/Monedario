# Reauditoría delta R6 — D10

- **Rol:** ComplianceAgent (adversarial), OpenAI GPT-6.
- **Sesión:** codex-20261027-delta-reaudit-r6 · sesión fresca.
- **Checkout:** /tmp/opencode/wt-audit-descuentos-6 · SHA 332edf28b714f692e550bc2de2dec26fec4827cf.
- **Protocolo:** AI_AUDIT_PROTOCOL v1, reglas R1–R8.
- **Veredicto R6:** **PASS para D10 dentro del alcance delimitado por el owner; cero defectos product abiertos en ese alcance.**
- **Estado global:** 02-result.json permanece **CONDITIONAL** por defectos fuera de esta reauditoría. humanSignoff sigue null. No declaro publicable la pieza.

## Alcance y método

D10 cubre las superficies editoriales, las calculadoras de nómina de sueldo líquido, APV y Operación Renta, y sus ejemplos visibles. La calculadora de cobertura AFC/CIC/FCS queda fuera de D10 y se conserva en causa 2: estima cobertura de beneficios, no descuentos de nómina; la brecha remanente es de representación. El runtime público es una observación y no es criterio de aceptación, porque estas respuestas no se pueden atribuir al SHA auditado.

La remediación declarada fue DeepSeek V4.1 Flash y la auditoría es GPT-6, de familia distinta. Se usaron las evidencias nuevas 28–34; no se reutilizaron extractos de evidence/11–27 como prueba. BCN y AFC y las 17 URLs públicas se reabrieron directamente. El detalle de preflight, entorno e independencia está en [evidence/34](evidence/34-r6-preflight-environment-protocol-2026-10-27.txt).

## Verificación de los cuatro puntos abiertos en R5

| Punto | Resultado en el checkout R6 | Evidencia |
|---|---|---|
| Costo AFC del empleador en casa particular | **Correcto: 3%.** El renderer aplica 2,4% solo al contrato común indefinido y 3% a casa particular. Sobre base de $1.000.000, la recomputación independiente da $30.000 para casa particular y $24.000 para indefinido común. | [evidence/32](evidence/32-r6-rate-recalculation-2026-10-27.txt), [evidence/33](evidence/33-r6-local-surface-inventory-2026-10-27.txt); src/utils/sueldo-liquido/resultRenderer.ts:300-306 |
| Ficha local Ley 19.728 | **Correcta: 2,2% CIC + 0,8% FCS.** El CAI de 1,11% aparece aparte y no integra el 3% del seguro. La ficha local tiene una fila explícita para casa particular. | [evidence/28](evidence/28-r6-primary-source-retrieval-2026-10-27.txt), [evidence/32](evidence/32-r6-rate-recalculation-2026-10-27.txt), [evidence/33](evidence/33-r6-local-surface-inventory-2026-10-27.txt); src/data/laws/ley-19728-seguro-cesantia.md:39-41 |
| Ejemplo SSR de APV | **Sí declara y pasa el tipo.** El cálculo SSR fija contractType: indefinido explícitamente; el selector visible SSR queda preseleccionado como Indefinido y ese tipo modifica la base de cotización que usa APV. El ejemplo metodológico anti-deriva también fija el tipo. | [evidence/33](evidence/33-r6-local-surface-inventory-2026-10-27.txt); src/pages/calculadoras/apv.astro:35-44, 172-186; src/application/use-cases/CalculateApvComparison.methodology.ts:18-30 |
| Regresión de mapeo | **Detectada por prueba unitaria.** parseContractType se usa en sueldo líquido, APV y Operación Renta. En copia temporal se cambió el mapeo casa-particular → indefinido; tests/utils/contractType.test.ts falló en 2 aserciones y pasó 3, con salida total 1. No se modificó el checkout auditado. | [evidence/29](evidence/29-r6-contracttype-mutation-2026-10-27.txt), [evidence/31](evidence/31-r6-targeted-tests-2026-10-27.txt), [evidence/33](evidence/33-r6-local-surface-inventory-2026-10-27.txt) |

La AFC confirma en su tabla vigente el 2,2% a CIC y el 0,8% a FCS para casa particular, con la fila CAI de 1,11% separada. El texto legal establece la cotización patronal de 3% y la excepción del trabajador. Fuentes reabiertas el 27-10-2026: [BCN, Ley 19.728](https://www.bcn.cl/leychile/navegar?idNorma=184979) y [AFC, cotizaciones](https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/). Extractos y recuperación cruda: [evidence/28](evidence/28-r6-primary-source-retrieval-2026-10-27.txt).

## Barrido de superficies dentro de D10

No encontré otra afirmación local de nómina que aplique el 0,6% al trabajador de casa particular ni otro selector en sueldo líquido, APV u Operación Renta que lo convierta a indefinido. Los tres caminos usan parseContractType. El motor de nómina devuelve 0% de AFC trabajador para casa particular y el renderer calcula el costo patronal al 3%.

El barrido incluyó la pieza principal, guías de primer empleo, sueldo líquido y liquidación, seguro de cesantía, sueldo imponible, nota metodológica, glosarios AFC/sueldo bruto/fondo solidario, ficha Ley 19.728 y las tres calculadoras delimitadas. Los ejemplos visibles de sueldo líquido declaran contrato indefinido y excluyen explícitamente casa particular cuando muestran el 0,6%. El glosario del Fondo Solidario excluye casa particular de la celda de 0,6%; no afirma que el 1,6% patronal de indefinido aplique a casa, y el reparto propio de casa está en la ficha legal. Inventario y límites del barrido: [evidence/33](evidence/33-r6-local-surface-inventory-2026-10-27.txt).

La calculadora separada de cobertura AFC/CIC/FCS todavía no ofrece casa particular en su selector, pero permanece explícitamente excluida de D10 por la delimitación del owner y asignada a causa 2. No cuenta como defecto abierto en este pase.

## Runtime público — observación

Reabrí directamente 17 URLs públicas con cabeceras anti-caché; las 17 respondieron HTTP 200. Algunas respuestas todavía muestran contenido anterior, incluida una tabla pública con 0,6% trabajador y 2,4% empleador para casa particular. Ese HTML no se pudo asociar al SHA R6 y queda registrado solo como observación; no cambia el veredicto de checkout solicitado. Inventario, fechas, respuestas y extractos: [evidence/30](evidence/30-r6-public-runtime-observation-2026-10-27.txt).

## R1–R8

- **R1:** tasas y costos monetarios recalculados por separado con Python Decimal; comando y salida en [evidence/32](evidence/32-r6-rate-recalculation-2026-10-27.txt).
- **R2:** anclaje en Ley 19.728 y tabla AFC reabiertas; URLs, extractos y fecha en [evidence/28](evidence/28-r6-primary-source-retrieval-2026-10-27.txt).
- **R3:** reconstruí la distribución legal 0,6/1,6/0,8 para indefinido común y 0/2,2/0,8 para casa particular, contrastándola con ficha, motor y ejemplos locales; ver evidence/28, 32 y 33.
- **R4:** cada hallazgo se vincula con líneas locales o salida cruda nueva de R6; ver evidencia citada en este informe.
- **R5:** contraste de tasas, separación de CAI, revisión de superficies y mutación adversarial del mapeo; ver evidence/29, 32 y 33.
- **R6:** PASS solo para D10 en el límite de alcance acordado, con openDefects vacío. El veredicto global del paquete queda CONDITIONAL.
- **R7:** SHA, entorno, preflight, fuentes, comandos y salidas constan en evidence/28–34.
- **R8:** no cambié src, tests ni producto; no hice commit ni push. humanSignoff permanece null.

## Cierre

D10 queda **resolved en el checkout R6**. No se reabren D9, D11, D12, D15 ni D17; tampoco se reauditan D1–D8, D13, D14 o D16. El estado global permanece **CONDITIONAL** por findings fuera del alcance de R6. No hay firma humana ni declaración de publicabilidad. Al cierre, los cambios se limitan a este informe, 02-result.json y las evidencias R6; rollback de la auditoría consiste en retirar esos artefactos, sin revertir producto.
