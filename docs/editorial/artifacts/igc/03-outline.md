# Gate 03 — Outline: impuesto-global-complementario-chile

Status: DRAFT
Role: OutlineAgent (Claude Code — Sprint 2B)
Slug: impuesto-global-complementario-chile

---

## Differentiator local

- **localDelta**: Enfoque en el mecanismo de "complementar" (sumar todas las fuentes de renta) como concepto central. Respuesta clara a "¿a mí me afecta el IGC?" con los 4 perfiles típicos del contribuyente chileno con rentas mixtas. La tabla de tramos UTA con el valor en pesos (una vez verificada la UTA vigente) como herramienta directamente accionable.
- **nonCopyBoundaries**: No replica guía paso a paso del F22 (→ `operacion-renta-f22-checklist`). No promete resultado exacto de impuesto. No absorbe rentas mixtas sueldo+honorarios como head term separado. Ganancias de capital: excluidas con nota explícita.
- **ownerTarget**: `impuestos-personas::igc-impuesto-global-complementario`.

---

## Separación clave vs F22 (anti-canibalización)

| Dimensión | F22 checklist (owner existente) | Este artículo |
|---|---|---|
| Query | "F22 operación renta Chile" | "impuesto global complementario Chile" |
| Usuario | Trabajador dependiente revisando su declaración | Persona con rentas mixtas entendiendo el mecanismo |
| Foco | Cómo enviar el F22, plazos, devolución | Qué es el IGC, tramos, qué rentas suma, créditos |

---

## Estructura editorial

### `## ¿Qué es el Impuesto Global Complementario?`
- Definición: impuesto anual que grava la totalidad de rentas de personas naturales.
- Cómo "complementa": suma ISC ya retenido, honorarios, dividendos, arriendos.
- Por qué no todos lo pagan directamente (ISC cubre la mayoría de los asalariados).

### `## ¿Quiénes deben pagarlo?`
- Los 4 perfiles típicos: trabajador + honorarios, socio + sueldo, arrendatario, inversionista.
- Umbral de primera UTA: quienes no superan el primer tramo no tienen obligación adicional.

### `## Qué rentas suma el IGC`
- Sueldos (ya cubiertos por ISC, pero se suman para determinar el tramo).
- Honorarios (retenciones como crédito).
- Dividendos de sociedades.
- Rentas de arrendamiento (después de deducir gastos).
- Ganancias de capital: excluidas del scope de este artículo — demasiada complejidad; se señalará explícitamente.

### `## Tramos y tasas vigentes`
- Tabla de 7 tramos en UTA [TODO:SOURCE C3/C4].
- Convertir a pesos con UTA vigente [TODO:SOURCE C4].
- Explicar progresividad: solo el tramo marginal aplica la tasa más alta.

### `## Créditos y deducciones disponibles`
- ISC retenido mensualmente: crédito directo.
- Retenciones de honorarios (tasa [TODO:SOURCE]).
- APV Modalidad A vs B [TODO:SOURCE C7].
- Contribuciones de bienes raíces para arrendadores [TODO:SOURCE C8].

### `## Cómo se declara: el F22`
- El F22 es el formulario donde se liquida el IGC.
- Para el proceso paso a paso, enlazar a `operacion-renta-f22-checklist`.
- El SII prellenará el F22 con la información disponible; el contribuyente verifica y complementa.

### `## ¿Resultado: pago adicional o devolución?`
- Depende de si los créditos (ISC, retenciones) superan el IGC calculado.
- Sin simular resultado individual — redirigir a calculadora.

---

## Outbound links

| Destino | Texto ancla |
|---|---|
| `/posts/operacion-renta-f22-checklist/` | "guía paso a paso para completar el F22" |
| `/posts/devolucion-impuestos-fechas-compensaciones/` | "qué pasa si el IGC resulta en devolución" |
| `/posts/contribuciones-bienes-raices-chile/` | "contribuciones de bienes raíces como crédito" |
| `/calculadoras/operacion-renta/` | "estimación orientativa del IGC" |
