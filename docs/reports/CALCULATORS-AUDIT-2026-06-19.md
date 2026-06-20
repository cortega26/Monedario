# Auditoría de calculadoras — 2026-06-19

Auditoría completa de las 21 calculadoras del sitio, enfocada en tres ejes
pedidos: (1) estandarización de layout/tipografía/componentes, (2) transparencia
del cálculo (ejemplo paso a paso + enlace a metodología) y (3) mejoras de
calidad/EEAT (fecha de verificación visible, paridad de compartir, validación de
borde).

Este documento es la **auditoría documentada del resto** (frente B del plan): el
trabajo sobre 5 calculadoras piloto ya se ejecutó; aquí se registra el estado de
las 15 restantes y un backlog priorizado para decidir caso a caso.

---

## 1. Resumen ejecutivo

- **El problema de layout "apilado y angosto" estaba aislado a 3 calculadoras**:
  `iva`, `conversor-utm` y `conversor-uf`. Las tres usaban una columna
  `max-w-xl` que apilaba la tarjeta de datos debajo del input dejando la mitad
  derecha vacía. **Ya están migradas** al grid estándar de 2 columnas.
- `comisiones-afp` (tabla comparativa full-width) y `boleta-honorarios-liquido`
  (ya en grid 2-col) **no tenían problema de layout**; aparecían como falsos
  positivos en el rastreo inicial. Recibieron las mejoras de transparencia/EEAT
  igualmente.
- **Las 15 calculadoras restantes ya usan el grid estándar** `grid items-start
  gap-6 py-8 sm:grid-cols-2` (o variante `lg:grid-cols-[...]`). No hay deuda de
  layout pendiente.
- La brecha real transversal es de **contenido, no de layout**: las 15 restantes
  todavía no tienen el bloque "Cómo se calcula, paso a paso" ni el test
  anti-drift asociado.

## 2. Qué se entregó en las 5 piloto

| Calculadora | Layout | Ejemplo paso a paso | Fecha verificación | Validación borde |
|---|---|---|---|---|
| iva | Migrada a grid 2-col | ✅ | ✅ "junio 2026" | ✅ monto inválido |
| conversor-utm | Migrada a grid 2-col | ✅ | ✅ (DataFreshness) | (ya existía) |
| conversor-uf | Migrada a grid 2-col | ✅ | ✅ (DataFreshness) | (ya existía) |
| comisiones-afp | OK (tabla) | ✅ | ✅ "abril 2026" | ✅ guard imponible < 0 |
| boleta-honorarios | OK (ya 2-col) | ✅ | ✅ "marzo 2026" | (ya existía) |

Infraestructura nueva reutilizable:

- `src/domain/methodology/workedExample.ts` — tipos `WorkedExample` /
  `WorkedExampleFixture<TInput,TOutput>`.
- `src/components/MethodologyBlock.astro` — ahora acepta `example` (render
  visible del paso a paso) y enlaza siempre a `/metodologia` (cross-link que
  **ya beneficia a las 20 calculadoras**, no solo a las 5).
- Patrón "fixture atado a la función real" + test anti-drift: el ejemplo
  publicado se verifica contra el cálculo real, de modo que un cambio de fórmula
  que deje el ejemplo desactualizado **rompe el test**.

## 3. Estado de las 15 restantes

Todas con grid estándar, `ShareCalculatorResult`, `MethodologyBlock` y manejo de
error presentes. Deltas detectados:

| Calculadora | ResultPanel estándar | DataFreshness | Ejemplo paso a paso | Notas |
|---|---|---|---|---|
| apv | ✅ | ✅ | ❌ pendiente | Lista para P1 |
| credito-consumo | ✅ | — (input-only) | ❌ | Freshness N/A (datos del usuario) |
| deposito-a-plazo | ✅ | — | ❌ | Revisar si la tasa/UF amerita freshness |
| dividendo-hipotecario | ✅ | ✅ | ❌ | Lista para P1 |
| finiquito-indemnizacion | ✅ (grid custom) | — | ❌ | Revisar freshness (tope IMM/UF) |
| impuesto-segunda-categoria | ❌ inline | ✅ | ❌ | **Estandarizar a Field/Panel** |
| interes-compuesto | ✅ | — (input-only) | ❌ | Freshness N/A |
| operacion-renta | ✅ | ✅ | ❌ | Lista para P1 |
| prepago-credito | ❌ sin Panel | ✅ | ❌ | Resultado con maquetación propia |
| reajuste-arriendo | ❌ sin Panel | ✅ | ❌ | Resultado con maquetación propia |
| seguro-cesantia | ✅ | ✅ | ❌ | Lista para P1 |
| simulador-jubilacion | ✅ | ✅ | ❌ | Lista para P1 |
| simulador-renegociacion | ❌ sin Panel | ✅ | ❌ | Resultado con maquetación propia |
| sueldo-liquido | ✅ | ✅ | ❌ | Alta prioridad por tráfico |
| tarjeta-credito | ✅ | — (input-only) | ❌ | Freshness N/A |

## 4. Backlog priorizado

### P1 — Ejemplo paso a paso + test anti-drift en las 15 restantes
Replica el patrón de los pilotos: crear `*.methodology.ts` junto al use-case,
añadir el bloque de test anti-drift y pasar `example` al `MethodologyBlock`.
Orden sugerido por tráfico/valor: `sueldo-liquido`, `impuesto-segunda-categoria`,
`dividendo-hipotecario`, `credito-consumo`, `operacion-renta`, resto.

> Nota YMYL: el ejemplo es aritmética derivada de fórmulas existentes ya
> cubiertas por tests. No introduce afirmaciones nuevas, pero el texto del
> `scenario`/`conclusion` debe respetar el tono del estándar editorial.

### P2 — Fecha de verificación visible donde el dato es "vivo"
Añadir `CalculatorDataFreshness` (o línea estática) en las que dependen de un
dato datado y aún no la muestran: revisar `deposito-a-plazo` y
`finiquito-indemnizacion`. Las de solo input del usuario (`interes-compuesto`,
`credito-consumo`, `tarjeta-credito`) **no** la necesitan.

### P3 — Estandarización de componentes
- `impuesto-segunda-categoria`: migrar inputs/resultado a
  `CalculatorField` / `CalculatorResultPanel`.
- `prepago-credito`, `reajuste-arriendo`, `simulador-renegociacion`: evaluar
  adoptar `CalculatorResultPanel` (hoy tienen maquetación de resultado propia,
  funcional pero divergente). Cambio cosmético; bajo riesgo, baja urgencia.

### P4 — Mejora opcional de SEO
Evaluar emitir structured data `HowTo` a partir del `WorkedExample` (una sola vez
en `MethodologyBlock`). Pendiente de validar contra las guías de schema para no
arriesgar penalizaciones; no se implementó en esta tanda.

## 5. Decisión explícita registrada

- **No se crea una página `/transparencia`.** Ya existe `/metodologia` (proceso
  editorial + verificación) y ahora cada calculadora lleva su ejemplo inline con
  cross-link a esa página. Una página separada duplicaría `/metodologia` y
  añadiría costo de mantención por drift sin ganancia clara.
