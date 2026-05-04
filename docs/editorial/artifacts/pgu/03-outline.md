# Gate 03 — Outline: pgu-pension-garantizada-universal

Status: DRAFT
Role: OutlineAgent (Claude Code — Sprint 2B)
Slug: pgu-pension-garantizada-universal

---

## Differentiator local

- **localDelta**: Respuestas directas a las 4 preguntas principales del buscador: ¿me corresponde?, ¿cuánto recibiré?, ¿cómo la pido?, ¿se reduce con mi AFP? Sección de casos frecuentes (extranjeros, sin cotizaciones, con APV) que ningún sitio responde claramente.
- **nonCopyBoundaries**: No absorbe reforma previsional como head term (→ `reforma-previsional-2025`). No compara fondos AFP. No recomienda AFP específica.
- **ownerTarget**: `pensiones-afp::pgu-pension-garantizada` (hardened, PRE-02 ✓).

---

## Estructura editorial

### Apertura (sin H2)
- Situación: persona de 65 años que no sabe si le corresponde, cuánto es, o si su pensión AFP la reduce.

### `## ¿Qué es la PGU?`
- Definición: pensión estatal que garantiza un ingreso mínimo a adultos mayores.
- Creada por Ley [TODO:SOURCE S2].
- Monto vigente: $[TODO:SOURCE C1] mensual.

### `## ¿Quiénes pueden recibirla?`
- Tres requisitos: edad (65+), residencia (20 años desde los 20), percentil de ingresos (90% menores ingresos).
- Cada requisito explicado y cómo se acredita.
- Caso extranjeros residentes: [TODO:SOURCE C7].

### `## ¿Cuánto se paga? Monto y calendario de ajuste`
- Monto actual: $[TODO:SOURCE C1].
- Cuándo se reajusta y cómo se informa (IPS).
- Fecha de corte visible y obligatoria.

### `## ¿Cómo tramitarla ante el IPS?`
- Canal: IPS presencial, portal IPS en línea, ChileAtiende.
- Documentos requeridos.
- Plazos de resolución.
- Pago desde cuándo y dónde.

### `## PGU y pensión AFP: ¿se complementan o se restan?`
- La PGU no se suma íntegramente si ya se tiene pensión AFP.
- Fórmula de complemento: [TODO:SOURCE C5 — explicar sin inventar].
- Ejemplo: persona con pensión AFP de $X recibe PGU de $Y (cálculo pendiente MathAuditAgent).
- Sin recomendar AFP ni estrategia de inversión.

### `## Casos frecuentes`
- Sin cotizaciones AFP: acceden a PGU completa si cumplen otros requisitos.
- Extranjeros residentes: mismos requisitos de residencia (verificar C7).
- Con APV: el APV no bloquea la PGU por sí mismo (verificar condición de percentil).

### `## Preguntas frecuentes`
- ¿La PGU se cobra como pensión mensual?
- ¿Puede coexistir con pensión de invalidez?
- ¿Qué pasa si la pensión AFP supera el monto PGU?

---

## Outbound links

| Destino | Texto ancla |
|---|---|
| `/posts/reforma-previsional-2025-que-cambia-y-como-te-afecta/` | "cambios al sistema previsional vigentes" |
| `/calculadoras/simulador-jubilacion/` | "simular tu pensión proyectada" |
