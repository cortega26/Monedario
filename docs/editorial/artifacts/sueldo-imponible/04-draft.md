# Gate 04 — Draft: sueldo-imponible-chile

Status: DRAFT — pending MathAuditAgent (ChatGPT) and ComplianceAgent (fresh Claude Code session)
Role: DraftAgent (Claude Code — Sprint 2B session)
Fecha de corte: 2026-05-03
requires_calculation: true
regulatory_sensitivity: media

---

> **SEPARATION OF DUTIES NOTICE**: DraftAgent = Claude Code Sprint 2B. Gate 05 → ChatGPT (obligatorio). Gate 06 → nueva sesión Claude Code.

> **TODO:SOURCE activos**: tope UF imponible, tramos ISC, tope APV Modalidad A — reemplazar antes de publicar.

---

## Draft del artículo (body para src/data/blog/sueldo-imponible-chile.md)

> **Información vigente al 2026-05-03.** El tope máximo imponible en UF y los tramos del Impuesto de Segunda Categoría se actualizan periódicamente. Verifica los valores vigentes en la Superintendencia de Pensiones y el SII antes de hacer cualquier cálculo.

Revisas tu liquidación y ves dos cifras distintas: "sueldo bruto" y "remuneración imponible". En algunos casos son iguales. En otros, la imponible es menor. Esa diferencia importa porque los descuentos de AFP, salud e impuesto no se calculan sobre el bruto — se calculan sobre el imponible.

## ¿Qué es el sueldo imponible? Definición legal

El sueldo imponible (o remuneración imponible) es la base de cálculo que la ley define para las cotizaciones previsionales y el Impuesto de Segunda Categoría. Está regulado en el artículo 41 del [Código del Trabajo](https://www.bcn.cl/leychile/navegar?idNorma=207436) como el conjunto de remuneraciones que constituyen la base afecta a descuentos.

No todo lo que recibe un trabajador es remuneración imponible. La ley excluye algunos componentes expresamente.

## Qué incluye la base imponible y qué no

| Componente | ¿Imponible? | Fundamento |
|---|---|---|
| Sueldo base | Sí | Art. 41 CT |
| Horas extraordinarias | Sí | Art. 41 CT |
| Bonos de producción o comisiones | Sí | Art. 41 CT |
| Gratificación legal provisionada | Sí | Art. 41 CT |
| Asignación de colación | No | Excluida expresamente por ley |
| Asignación de movilización | No | Excluida expresamente por ley |
| Asignación familiar | No | Beneficio estatal, no remuneración |
| Viáticos acreditados | No | No son remuneración |
| Bono de asistencia | Depende | Puede ser imponible según diseño del empleador — consultar con el empleador o la [Dirección del Trabajo](https://www.dt.gob.cl/) |

El punto que más confunde: la **asignación familiar** (beneficio pagado por el Estado) no es imponible. Pero el **bono de asistencia** (que muchas empresas pagan mensualmente) sí puede ser imponible, dependiendo de cómo esté estructurado. Si no tienes claro cuál es cuál en tu liquidación, revisa con tu empleador.

## Sueldo bruto, imponible y líquido: las tres cifras que importan

```
Sueldo bruto
  − Componentes no imponibles (colación, movilización, etc.)
  = Remuneración imponible
  − Cotización AFP (~10,5 % + comisión AFP)
  − Cotización salud (7 % isapre/Fonasa)
  − Cotización AFC (0,6 % trabajador)
  − Impuesto de Segunda Categoría (tramo marginal)
  = Sueldo líquido
```

Este artículo se enfoca en la **remuneración imponible** — la base del cálculo. Para el cálculo completo de cuánto queda en tu cuenta, usa la [calculadora de sueldo líquido](/posts/como-calcular-sueldo-liquido/).

## Cómo afecta el imponible a AFP, salud y AFC

Cada descuento previsional se aplica como un porcentaje de la remuneración imponible, con un tope:

- **Cotización AFP**: aproximadamente 10,5% + comisión de tu AFP (varía por AFP).
- **Cotización de salud**: 7% Fonasa o el plan isapre pactado.
- **AFC (Seguro de Cesantía)**: 0,6% el trabajador; 2,4% el empleador.

**Tope máximo imponible**: las cotizaciones previsionales solo se aplican hasta el límite legal de **[TOPE_UF_TODO:SOURCE] UF mensuales** (valor referencial: ~87,1 UF; verificar valor vigente en la [Superintendencia de Pensiones](https://www.spensiones.cl/)). Lo que ganas por sobre ese tope no cotiza — lo que también significa que no genera pensión por esa porción.

## Cómo determina el Impuesto de Segunda Categoría

El ISC es progresivo: se aplica por tramos sobre la remuneración imponible mensual. Solo el tramo que supera cada umbral paga la tasa correspondiente — no todo el ingreso paga la tasa más alta.

Los tramos vigentes para el año tributario [AÑO_TODO:SOURCE] son [TODO:SOURCE C5 — verificar tabla en SII]. La estructura general es 7 tramos, desde 0% para ingresos bajos hasta 40% para el tramo más alto, expresados en UTM.

> La tabla exacta de tramos, tasas y montos en UTM debe obtenerse desde el [SII](https://www.sii.cl/) antes de publicar este artículo.

## APV y reducción de la base imponible

El Ahorro Previsional Voluntario (APV) en Modalidad A reduce directamente la base afecta al ISC, hasta un tope legal de [TOPE_APV_TODO:SOURCE] UTM anuales (verificar con SII). El efecto es que el trabajador puede bajar al tramo marginal inferior, reduciendo la retención mensual de ISC.

Esto no es asesoría tributaria: el resultado exacto depende de tu base imponible, tu tramo y el monto cotizado. Consulta con tu AFP o institución APV los efectos específicos de tu cotización.

## Ejemplo numérico

Para un trabajador con sueldo bruto de $1.200.000 y sin componentes no imponibles relevantes:

1. Remuneración imponible = $1.200.000 (toda imponible en este caso).
2. AFP (~10,5% + comisión): ~$126.000 + comisión de tu AFP.
3. Salud (7%): $84.000.
4. AFC (0,6%): $7.200.
5. ISC: depende del tramo — verificar tabla SII vigente [TODO:SOURCE C5].
6. Sueldo líquido estimado: $1.200.000 menos los descuentos anteriores.

> TODO:SOURCE (MathAuditAgent): completar el cálculo ISC del ejemplo con los tramos verificados.

Para una [liquidación de sueldo completa con todas las líneas](/posts/liquidacion-de-sueldo/), revisa la guía dedicada.

---

> **Fecha de corte: 2026-05-03.** El tope máximo imponible en UF y los tramos del ISC se actualizan periódicamente. Verifica los valores vigentes en la [Superintendencia de Pensiones](https://www.spensiones.cl/) y el [SII](https://www.sii.cl/) antes de hacer cualquier cálculo. El Código del Trabajo está disponible en la [Biblioteca del Congreso Nacional](https://www.bcn.cl/leychile/navegar?idNorma=207436).
