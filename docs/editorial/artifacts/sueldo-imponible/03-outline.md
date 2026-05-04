# Gate 03 — Outline: sueldo-imponible-chile

Status: DRAFT
Role: OutlineAgent (Claude Code — Sprint 2B session)
Slug: sueldo-imponible-chile
Fecha: 2026-05-03

---

## Differentiator local

- **localDelta**: Definición técnica precisa de la base imponible con distinción explícita bruto/imponible/líquido. Sección APV como reductor de base ISC (infradesarrollada por competidores). Anti-confusión asignación familiar vs bono de asistencia.
- **nonCopyBoundaries**: No calcula sueldo líquido completo (→ `como-calcular-sueldo-liquido`). No lista todos los descuentos uno a uno (→ `descuentos-de-sueldo`). No audita la liquidación (→ `liquidacion-de-sueldo`).
- **ownerTarget**: `sueldo-remuneraciones::sueldo-imponible-base-descuentos` (hardened, PRE-02 ✓).

---

## Anti-canibalización

| Owner protegido | Head term | Cómo diferenciar |
|---|---|---|
| `como-calcular-sueldo-liquido` | calcular sueldo líquido | Redirigir; no replicar la calculadora |
| `descuentos-de-sueldo` | clasificar descuentos del sueldo | Mencionar que los descuentos se aplican sobre la base; enlazar |
| `liquidacion-de-sueldo` | auditar el comprobante | Mencionar la línea imponible en la liquidación; enlazar |

---

## Estructura editorial

### Apertura (sin H2)
- Situación del lector: ve "remuneración imponible" en la liquidación y no sabe qué incluye.

### `## ¿Qué es el sueldo imponible? Definición legal`
- Art. 41 CT: remuneración sobre la que se calculan cotizaciones e ISC.
- Diferencia con sueldo bruto: el bruto puede incluir componentes no imponibles.

### `## Qué incluye la base imponible y qué no`
- Tabla: incluye vs excluye.
- Foco en confusión frecuente: asignación familiar ≠ bono de asistencia.

### `## Sueldo bruto, imponible y líquido: las tres cifras que importan`
- Diagrama textual: bruto → restar no imponibles → imponible → aplicar descuentos → líquido.
- No calcular el líquido; enlazar a la calculadora.

### `## Cómo afecta el imponible a AFP, salud y AFC`
- Fórmula: descuento = % × base imponible (hasta tope UF).
- Tope máximo imponible: [TODO:SOURCE C4 — UF vigente].
- Lo que supera el tope no cotiza (afecta futura pensión).

### `## Cómo determina el Impuesto de Segunda Categoría`
- Tramos ISC: tabla de 7 tramos (valores TODO:SOURCE C5).
- Progresividad: solo el tramo marginal paga la tasa más alta.
- Retención mensual en la liquidación.

### `## APV y reducción de la base imponible`
- Modalidad A: abono directo → reduce base ISC hasta [TODO:SOURCE C6] UTM.
- Efecto práctico: trabajador puede reducir tramo marginal.
- Sin prometer resultado tributario exacto.

### `## Ejemplo numérico completo`
- Sueldo bruto $1.200.000 → identificar imponible → calcular AFP/salud → aplicar ISC.
- Valores dependen de UF y tramos ISC (TODO:SOURCE R1, R2).

---

## Outbound links

| Destino | Texto ancla |
|---|---|
| `/posts/como-calcular-sueldo-liquido/` | "calcular tu sueldo líquido completo" |
| `/posts/liquidacion-de-sueldo/` | "cómo leer la línea imponible en tu comprobante" |
| `/calculadoras/impuesto-segunda-categoria/` | "calculadora del ISC" |
