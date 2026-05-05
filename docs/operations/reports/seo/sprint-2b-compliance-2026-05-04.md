# Sprint 2B — Gate 06 Compliance Report

Fecha: 2026-05-04
Estado: GATE 06 COMPLETADO — todos los artículos CONDITIONAL; Gate 05 pendiente (human); Gate 07 pendiente (human)
ComplianceAgent session: Claude Code — sesión fresca 2026-05-04 (distinta de DraftAgent Sprint 2B)

---

## Resumen ejecutivo

Gate 06 (ComplianceAgent) ejecutado sobre los 6 artículos P1 de Sprint 2B. Todos los artículos reciben veredicto **CONDITIONAL** — no hay veredictos FAIL ni PASS. Los artículos no tienen claims falsos ni violaciones de SoD, pero presentan TODO:SOURCE no resueltos y valores de referencia sin verificar que bloquean la publicación.

El patrón principal es que el DraftAgent dejó marcadores de pipeline o valores sin confirmar que deben ser completados por el humano y el MathAuditAgent (Gate 05, ChatGPT) antes de publicar.

---

## Estado por artículo

| # | Slug | NORMA_YMYL | Veredicto | Defectos bloqueantes | Prioridad resolución |
|---|---|---|---|---|---|
| 1 | fondo-emergencia-chile | 8.46/10 | CONDITIONAL | D1: fuente CMF "3–6 meses"; D2: mecanismo penalización DAP | Baja-Media |
| 2 | gratificacion-legal-chile | 8.74/10 | CONDITIONAL | D1/D2: IMM vigente sin verificar → ejemplo incompleto | Alta (Gate 05 obligatorio) |
| 3 | sueldo-imponible-chile | 8.47/10 | CONDITIONAL | D1: tope ~87,1 UF sin verificar; D2: tramos ISC sin tabla | Alta (Gate 05 obligatorio) |
| 4 | contribuciones-bienes-raices-chile | 8.14/10 | CONDITIONAL | D1: tasas ~1,2%/~1,0%; D2: calendario TGR 2026; D3: F22 sin cita LIR | Alta (Gate 05 obligatorio) |
| 5 | pgu-pension-garantizada-universal | 7.51/10 | CONDITIONAL | D1: TODO:SOURCE en blog file (Bucket C); D2: monto sin valor; D3: fórmula complemento AFP; D4: texto BCN residencia | **Crítica** (más trabajo humano) |
| 6 | impuesto-global-complementario-chile | 7.56/10 | CONDITIONAL | D1: TODO:SOURCE en blog file (Bucket C); D2: tabla tramos IGC ausente; D3: tasa honorarios; D4: APV 15% sin cita LIR | **Crítica** (más trabajo humano) |

---

## Acciones por tipo de agente

### Bucket A — Human (verificación de fuentes externas)

| Acción | Artículo | Defecto |
|---|---|---|
| Verificar rango "3–6 meses" en CMF educa; agregar link | fondo-emergencia | D1 |
| Verificar mecanismo penalización DAP en circular CMF | fondo-emergencia | D2 |
| Verificar IMM vigente en Mintrab → completar ejemplo (Gate 05 input) | gratificacion-legal | D1/D2 |
| Verificar tope imponible UF en SPensiones | sueldo-imponible | D1 |
| Verificar/incluir tabla tramos ISC en SII, o ajustar covers (Opción B, Bucket C) | sueldo-imponible | D2 |
| Verificar tasas contribuciones (1,2%/1,0%) en SII | contribuciones-bienes-raices | D1 |
| Verificar calendario cuotas TGR 2026 | contribuciones-bienes-raices | D2 |
| Verificar deducibilidad F22 en LIR (Art. 31 N°2) | contribuciones-bienes-raices | D3 |
| Verificar monto PGU vigente en IPS; agregar o ajustar covers | pgu | D2 |
| Verificar fórmula complemento PGU/AFP en SPensiones | pgu | D3 |
| Verificar texto requisito residencia en BCN ley PGU | pgu | D4 |
| Verificar tabla tramos IGC en UTA + valor UTA 2026 en SII | igc | D2 |
| Verificar tasa retención honorarios AT 2026 en SII | igc | D3 |
| Verificar APV Modalidad A 15% en Art. 42 bis LIR (BCN) | igc | D4 |

### Bucket B — MathAuditAgent (ChatGPT — Gate 05, sesión fresca)

Gate 05 es **obligatorio** para los 5 artículos con `requires_calculation: true`:

| Artículo | Inputs Gate 05 | Verificaciones clave |
|---|---|---|
| gratificacion-legal | 04-draft.md + IMM confirmado de Bucket A | Fórmula min(bruta, tope), tope calculado, ejemplo numérico completo |
| sueldo-imponible | 04-draft.md + tope UF y tramos ISC de Bucket A | ~10,5% AFP, 7% salud, ejemplo orientativo |
| contribuciones-bienes-raices | 04-draft.md + tasas SII de Bucket A | $80M × tasa real; cuotas; coherencia interna |
| pgu | 04-draft.md + monto PGU + fórmula complemento de Bucket A | Verificar claim residencia "20 años desde los 20" |
| igc | 04-draft.md + tabla tramos + UTA 2026 + tasa honorarios de Bucket A | Tabla IGC en UTA, UTA 2026, APV 15%, coherencia |

Para ejecutar Gate 05: abrir ChatGPT, pegar el playbook Stage 05 de `context/EDITORIAL_AI_PIPELINE.md §8`, proporcionar `04-draft.md` y `02-research.md` de cada artículo.

### Bucket C — Esta sesión (con autorización humana)

Dos artículos tienen `TODO:SOURCE` literal visible en el blog file que sería público si se despublica el draft. Estas líneas deben eliminarse antes de cualquier posibilidad de publicar:

| Artículo | Ubicación | Acción |
|---|---|---|
| pgu-pension-garantizada-universal | línea 98 | Reemplazar bloque `> TODO:SOURCE...` por texto editorial neutro (ver `docs/editorial/artifacts/pgu/06-compliance.md §Bucket C`) |
| impuesto-global-complementario-chile | línea 86 | Reemplazar bloque `> **TODO:SOURCE**...` por texto editorial neutro (ver `docs/editorial/artifacts/igc/06-compliance.md §Bucket C`) |

Además, los siguientes ajustes de `articleLead.covers` pueden reducir promesas incumplidas sin esperar datos externos:

| Artículo | Ajuste propuesto | Defecto que resuelve |
|---|---|---|
| sueldo-imponible | `covers` ítem 2: cambiar "ISC" por "cómo se estructura el ISC (tasas dependen del tramo)" | D2 Opción B |
| contribuciones-bienes-raices | `covers` ítem 3: cambiar a "Quiénes califican para exenciones" | D4 Opción B |
| pgu | `covers` ítem 2: cambiar a "Cuándo y por qué se reajusta el monto" | D2 Opción B |

---

## Acciones Bucket C ejecutadas (esta sesión)

- Creados 6 archivos `06-compliance.md` (uno por artículo).
- TODO:SOURCE en blog files de PGU e IGC: **pendientes de autorización humana** — no modificados aún.
- Ajustes de `covers`: **pendientes de autorización humana**.

---

## Separation of Duties — declaración de sesión

| Rol | Sesión | Artículos |
|---|---|---|
| DraftAgent (stages 02–04) | Claude Code Sprint 2B (2026-05-03/04, sesión anterior) | todos |
| MathAuditAgent (stage 05) | ChatGPT — pendiente | todos con requires_calculation=true |
| ComplianceAgent (stage 06) | Claude Code sesión fresca 2026-05-04 (esta sesión, sin carga previa del contexto de drafting) | todos |

SoD cumplido para Gate 06. Gate 05 pendiente para los artículos de cálculo.

---

## Archivos creados

```
docs/editorial/artifacts/fondo-emergencia/06-compliance.md
docs/editorial/artifacts/gratificacion-legal/06-compliance.md
docs/editorial/artifacts/sueldo-imponible/06-compliance.md
docs/editorial/artifacts/contribuciones-bienes-raices/06-compliance.md
docs/editorial/artifacts/pgu/06-compliance.md
docs/editorial/artifacts/igc/06-compliance.md
docs/operations/reports/seo/sprint-2b-compliance-2026-05-04.md
```

## Siguiente estado del pipeline

```
Gate 04 (draft)    → ✅ Completo (6/6)
Gate 05 (math)     → ⬜ Pendiente (ChatGPT — human action)
Gate 06 (compliance) → ✅ Completo (6/6 — todos CONDITIONAL)
Gate 07 (publish)  → ⬜ Pendiente (human sign-off, bloqueado por 05 y resolución defectos)
```
