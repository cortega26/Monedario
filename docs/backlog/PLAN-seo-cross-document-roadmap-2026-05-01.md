# PLAN - SEO cross-document roadmap 2026

Fecha: 2026-05-01
Estado: Parcialmente completado — Sprints 0, 2 y 3 cerrados; Sprint 1 queda parcial

## Alcance

In-scope:
- Cruzar los informes externos `Monedario.cl_ Oportunidades SEO Financieras.md` y `deep-research-report (7).md`.
- Verificar cobertura contra repo, hubs, calculadoras, frontmatter, ownership policy y scripts editoriales.
- Crear artefactos operativos bajo `docs/operations/reports/seo/`.
- Crear mapa editorial bajo `docs/editorial/seo-owner-map-2026.md`.

Out-of-scope:
- Crear articulos nuevos.
- Cambiar rutas publicas, slugs, RSS, snapshots o calculadoras runtime.
- Modificar frontmatter de contenido publicado.
- Validar legalmente montos 2026 contra fuentes externas en esta fase.

## Autoridad y contratos

- Constitucion: `docs/AI_ENGINEERING_CONSTITUTION.md`.
- Protocolo agente: `docs/development/AGENT_EXECUTION_PROTOCOL.md`.
- Invariantes citadas: `URL.PUBLIC.NO_POST_ID`, `INVARIANT.STRATEGY.OWNERSHIP_BEFORE_EXPANSION`, `FRONTMATTER.VALID`, `INVARIANT.EDITORIAL.TOPIC_OWNER_UNIQUENESS`.
- Contratos citados: `CONTRACT.PUBLIC_URLS`, `CONTRACT.FRONTMATTER_POLICY`, `CONTRACT.YMYL_RESPONSE_STRUCTURE`.

## Plan de trabajo

1. Leer gobernanza obligatoria y docs editoriales.
2. Leer ambos informes completos y perfilar confiabilidad por tipo de senal.
3. Extraer inventario real del repo: articulos, hubs, calculadoras, topic roles, canonical topics y scripts.
4. Ejecutar auditoria de overlap para detectar canibalizacion real.
5. Crear matriz maestra, owner map, roadmap, hallazgos cruzados, oportunidades de calculadoras, calendario estacional y registro YMYL.
6. Ejecutar validaciones adecuadas para cambios documentales y registrar resultados.

## Decisiones iniciales

- El primer informe se tratara como radar amplio de demanda, no como fuente confiable de cobertura actual, porque declara crawl fallido y gap absoluto.
- El segundo informe se tratara como fuente mas confiable de cobertura actual, pero se resolvera contra repo porque tambien tiene desfases frente a calculadoras ya existentes.
- Cualquier oportunidad de nueva URL queda como recomendacion futura sujeta a pipeline editorial, owner decision y fuentes oficiales.

## Progress log

- 2026-05-01: Contexto constitucional, editorial, rutas, frontmatter, hubs, calculadoras y auditoria de overlap revisados. Artefactos operativos creados: matriz, owner map, roadmap, hallazgos, calendario estacional, registro YMYL, oportunidades de calculadoras.
- 2026-05-11: Revisión de estado. Sprint 0 completado. Sprint 2 P1 completado (6 artículos publicados en Sprint 2B: PGU, gratificación, sueldo-imponible, IGC, contribuciones, fondo-emergencia). Sprint 1 consolidaciones: parcialmente resuelto por mejoras orgánicas (enlaces cruzados sueldo-remuneraciones, operación-renta, APV). Sprint 3 calculadoras: no iniciado — registrado como MON-306..309 en backlog.
- 2026-05-20: Reconciliación de backlog contra repo. Sprint 3 calculadoras ya está implementado: `MON-306` output de gratificación legal en `/calculadoras/sueldo-liquido/`; `MON-307` modo vacaciones proporcionales en `/calculadoras/finiquito-indemnizacion/`; `MON-308` `/calculadoras/interes-compuesto/`; `MON-309` `/calculadoras/deposito-a-plazo/`. Se actualizó `docs/backlog/README.md` para marcar `MON-306`..`MON-309` como `done`.

## Resumen de cierre por sprint (2026-05-11)

| Sprint | Objetivo | Estado |
|--------|----------|--------|
| Sprint 0 | Verificación y limpieza de owners/overlap | ✅ Completado |
| Sprint 1 | Consolidaciones de alto impacto (enlaces, estructura) | 🔶 Parcial — mejoras orgánicas aplicadas; revisión sistemática pendiente |
| Sprint 2 | Gaps editoriales P1 (6 artículos) | ✅ Completado — Sprint 2B 2026-05-08 |
| Sprint 3 | Calculadoras (2 extensiones + 2 nuevas) | ✅ Completado — MON-306..309 verificados 2026-05-20 |

## Sprint 3 — Detalle de calculadoras (2026-05-11)

Análisis de merge realizado inspeccionando el código de las calculadoras existentes. Resultado: dos tickets son extensiones de calculadoras existentes (preserva URL canónica, evita contenido duplicado); dos son páginas nuevas standalone.

| Ticket | Estrategia | Calculadora objetivo | Razón |
|--------|-----------|---------------------|-------|
| MON-306 — Gratificación legal | **Extensión** de `sueldo-liquido` | `/calculadoras/sueldo-liquido/` | La calc ya referencia gratificación en su FAQ de modo avanzado. Surfacear el cálculo como output visible evita crear una URL duplicada y aprovecha el tráfico existente. |
| MON-307 — Vacaciones proporcionales | **Extensión** de `finiquito-indemnizacion` | `/calculadoras/finiquito-indemnizacion/` | La calc ya computa feriado proporcional internamente para el finiquito. Exponer un modo pre-finiquito (o sección standalone) reutiliza la lógica sin fragmentar el flujo. |
| MON-308 — Interés compuesto | **Standalone** nueva | `/calculadoras/interes-compuesto/` | `simulador-jubilacion` usa interés compuesto pero está enmarcado en AFP/fondos. Una herramienta genérica de ahorro/inversión requiere su propia URL para capturar la intención de búsqueda distinta. |
| MON-309 — Depósito a plazo | **Standalone** nueva | `/calculadoras/deposito-a-plazo/` | Ninguna calc existente tiene lógica de tasas de interés bancarias. Requiere integración de tasas externas (BCCh / CMF) y URL propia. |

**Notas de implementación:**
- MON-306/307 como extensiones: NO cambiar la URL pública existente; agregar tab o sección dentro de la calc actual.
- MON-308/309 como standalone: seguir pipeline de nueva calculadora (ADR de ruta, snapshot, schema FAQ, artículo owner vinculado).

## Sprint 3 — Evidencia de cierre (2026-05-20)

Estado: completado.

| Ticket | Evidencia repo | Verificación |
|--------|----------------|--------------|
| `MON-306` | `src/pages/calculadoras/sueldo-liquido.astro` tiene input opcional `gratificacion` y output `Gratificación legal máx. (art. 50 CT)` en el resultado de modo Bruto → Líquido. | `pnpm exec vitest run tests/application/CalculateNetSalary.test.ts --reporter=dot` pasó: 13 tests. |
| `MON-307` | `src/pages/calculadoras/finiquito-indemnizacion.astro` tiene selector `Finiquito completo` / `Vacaciones proporcionales` y render específico para feriado proporcional. | `pnpm exec vitest run tests/application/EstimateFiniquito.test.ts --reporter=dot` pasó dentro del set de cierre: 11 tests del use-case. |
| `MON-308` | Existe `src/pages/calculadoras/interes-compuesto.astro`, entrada `interes-compuesto` en `CALCULATOR_PORTFOLIO` y use-case `src/application/use-cases/CalculateCompoundInterest.ts`. | `tests/application/CalculateCompoundInterest.test.ts` existe y cubre capitalización mensual, comparación mensual/anual e inputs inválidos. |
| `MON-309` | Existe `src/pages/calculadoras/deposito-a-plazo.astro`, entrada `deposito-a-plazo` en `CALCULATOR_PORTFOLIO` y use-case `src/application/use-cases/CalculateTermDeposit.ts`. | `tests/application/CalculateTermDeposit.test.ts` existe y cubre interés bruto, retención 4%, neto e inputs inválidos. |

Evidencia adicional:

- `tests/application/CalculatorPortfolio.test.ts` confirma 19 calculadoras registradas, familias declaradas, rutas únicas y `related` válidos.
- `dist/calculadoras/` contiene `sueldo-liquido`, `finiquito-indemnizacion`, `interes-compuesto` y `deposito-a-plazo` en el build local disponible al momento de la reconciliación.
- No se modificaron rutas públicas, slugs, RSS, canonical ni frontmatter en esta reconciliación documental.

Validación ejecutada durante la reconciliación documental:

| Gate | Resultado | Nota |
|------|-----------|------|
| `pnpm run check` | PASS | 0 errores; mantiene 13 warnings no bloqueantes de meta descriptions largas ya registrados como `TD-0093`. |
| `pnpm run test` | FAIL | Falla preexistente/no relacionada en `tests/e2e/redirect-links.e2e.test.ts`: el test espera `"/cambios/"` en `src/components/HeroHomepage.astro`, pero el componente enlaza `"/metodologia/"` y no existe `src/pages/cambios.astro` en el árbol actual. |
| `pnpm run build` | PASS | Build genera 280 páginas; incluye `/calculadoras/sueldo-liquido/`, `/calculadoras/finiquito-indemnizacion/`, `/calculadoras/interes-compuesto/` y `/calculadoras/deposito-a-plazo/`; `check:urls` OK con 1335 enlaces. |
| `pnpm run check:routes` | PASS | 0 removals; mantiene 11 altas ya conocidas frente al baseline. |
| `pnpm run check:rss` | PASS | 0 removals; 35 altas permitidas frente al baseline. |

Próximo bloque recomendado tras Sprint 3:

- `TD-0063` + `TD-0069`: componentizar calculadoras grandes y reducir duplicación detectada entre pares de calculadoras.
