# Gate 03 — Outline: fondo-emergencia-chile

Status: DRAFT — pending DraftAgent execution
Role: OutlineAgent (Claude Code — Sprint 2B session)
Slug: fondo-emergencia-chile
Fecha: 2026-05-03

---

## Differentiator local (INVARIANT.STRATEGY.DIFFERENTIATED_ADOPTION_REQUIRED)

- **localDelta**: Énfasis en instrumentos chilenos con liquidez real y bajo costo de mantención (cuenta RUT, cuenta vista, DAP corto plazo), con advertencia explícita sobre el DAP (penalización anticipada). Sin naming comercial.
- **nonCopyBoundaries**: No se copia calculadora de competidores (diferida a Sprint 3). No se hacen comparaciones de tasas de interés (eso es `/posts/deposito-a-plazo-uf-vs-pesos/`). No se recomienda banco o producto específico.
- **ownerTarget**: `presupuesto-control-financiero::fondo-emergencia-colchon` — activa cluster dormido.

---

## Estructura editorial (H2 canónicas)

### Apertura (sin H2 — párrafo introductorio)
- Situación del lector: no sabe cuánto necesita ni dónde guardarlo.
- Ancla a presupuesto ordenado como prerrequisito.

### `## ¿Qué es un fondo de emergencia y para qué sirve?`
- Definición: dinero accesible para gastos inesperados urgentes.
- Distinción clave: no es ahorro de largo plazo, no es inversión.
- Por qué importa en Chile: volatilidad laboral, gastos de salud no cubiertos por Fonasa/isapre, reparaciones del hogar.

### `## ¿Cuánto debe tener? La regla de los 3 a 6 meses`
- Referencia al rango estándar (TODO:SOURCE C1 — verificar CMF).
- Cómo calcular los "gastos esenciales": arriendo/dividendo, alimentación, salud, transporte, servicios básicos.
- Variable: 3 meses para ingresos estables; hasta 6 para ingresos variables o trabajo independiente.
- Sin calculadora inline (diferida a Sprint 3); el lector puede usar la calculadora de presupuesto mensual como referencia de base.

### `## ¿Dónde guardarlo en Chile? Instrumentos con liquidez real`
- Cuenta vista / Cuenta RUT: liquidez inmediata, sin tasa de interés relevante. Ideal para el "cupo de acceso rápido".
- Cuenta de ahorro bancaria: misma liquidez, puede tener límite de retiros gratuitos mensuales.
- DAP a corto plazo (30–90 días): mayor interés, pero **penalización por retiro anticipado** (TODO:SOURCE C4). Solo para el "colchón" que no necesitas de inmediato.
- Lo que NO usar: fondos mutuos de renta variable, APV. Demasiada volatilidad o plazo de retiro no garantizado.

### `## Errores comunes al armar el fondo`
- Invertirlo en activos de riesgo buscando rentabilidad.
- Mezclarlo con el ahorro de largo plazo (APV, fondos mutuos).
- Usarlo para gastos previsibles (navidad, vacaciones) — esos van en otro bolsillo.
- No reponerlo tras usarlo.

### `## Cómo construirlo desde cero: pasos concretos`
1. Calculá cuánto son tus gastos esenciales mensuales (usa el presupuesto).
2. Define tu meta: 3 meses si tienes trabajo estable; 6 si tienes ingresos variables.
3. Elige el instrumento: cuenta vista para el tramo accesible; DAP corto plazo para el resto.
4. Automatiza un aporte mensual pequeño — consistencia > monto.
5. Repón el fondo cada vez que lo uses.

> NOTA DIALECTAL: "Calculá" en la sección anterior debe reescribirse como "Calcula" — es voseo rioplatense y violará `check:dialect`.

### `## Preguntas frecuentes`
- FAQ 1: ¿Puedo usar la cuenta RUT de BancoEstado como fondo de emergencia?
- FAQ 2: ¿El fondo de emergencia paga impuestos?
- FAQ 3: ¿Cuánto tiempo tarda en formarse?

---

## Inbound links que recibirá este artículo (según brief)

| Fuente | Texto ancla propuesto | Sección de inserción |
|---|---|---|
| `como-hacer-presupuesto-mensual-chile` | "construir tu colchón de emergencia" | Final del artículo (sección de próximos pasos) |
| `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` | "fondo de emergencia como paso previo a invertir" | Sección introductoria |

## Outbound links del nuevo artículo

| Destino | Texto ancla propuesto | Sección |
|---|---|---|
| `/posts/como-hacer-presupuesto-mensual-chile/` | "presupuesto mensual ordenado" | Párrafo introductorio |
| `/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/` | "opciones de ahorro e inversión más avanzadas" | Cierre / sección de próximos pasos |
| `/posts/deposito-a-plazo-uf-vs-pesos/` | "comparar opciones de depósito a plazo" | Sección de instrumentos (DAP) |

---

## Frontmatter previsto

```yaml
title: "Fondo de emergencia en Chile: cuánto necesitas y dónde guardarlo"
description: "Guía práctica para construir tu colchón de emergencia en Chile: cuánto ahorrar, en qué instrumentos con liquidez real y cómo hacerlo paso a paso."
slug: fondo-emergencia-chile
category: general
cluster: presupuesto-control-financiero
topicRole: owner
canonicalTopic: fondo-emergencia-colchon
draft: true
```
