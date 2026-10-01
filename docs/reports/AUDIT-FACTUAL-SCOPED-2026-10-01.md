# Auditoría factual acotada — snapshot 2026-10-01

Issue: #629 (NEXT 7–12 de #614) · Método acordado con el owner: auditoría
interna completa + muestra externa pre-declarada de alto riesgo.
Snapshot: `de81504c` (`main`, 2026-10-01). Ejecutor: agente (rol de
verificación); no redactó el contenido auditado
(`INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`).

## 1. Alcance y método

Perspectivas complementarias sobre el mismo snapshot:

1. **Interna (white-box)**: gates completos, provenance, frescura, sources of
   truth y revalidación de cálculos con la suite existente.
2. **Externa (black-box)**: muestra pre-declarada de afirmaciones R4/R3
   verificadas contra fuente primaria competente (SII, DT, SuperIR, SP).
   Regla de muestreo: una afirmación por familia de riesgo —parámetros
   tributarios, previsionales, laborales, previsión/deuda— priorizando lo
   que cambia una decisión (R4).

No cubre: auditoría frase por frase de los 54 artículos, revisión experta
humana ni re-verificación de toda la evidencia del plan 115.

## 2. Auditoría interna (resultados)

| Control | Resultado |
|---|---|
| `pnpm run check:ci` | ✅ exit 0 (lint, format, tests+coverage, boundaries, frontmatter, legal-constants, legal-citations, editorial, timeliness, no-postid, routes, astro check, workers, economic-source-consistency, catalog-drift, homepage-freshness, risk-tiers, etc.) |
| `pnpm run build` | ✅ exit 0 — `check-postbuild` 24/24 sobre 334 páginas; `check:indexable-url-freeze`, `check:toc-i18n`, `check:editorial-guard`, `check:urls` en verde |
| Cobertura de riesgo (#630) | ✅ 54 artículos + 22 calculadoras clasificadas (R4=50, R3=19, R2=7); 1 waiver vigente (licencia médica, TD-0108) |
| Provenance R4 artículos | ✅ 32/32 con `articleLead.officialSources` y `validAsOf` (1 vía waiver) |
| Provenance R4 calculadoras | ✅ 18/18 usan `MethodologyBlock` |
| `reviewPolicy` | ✅ 54/54 artículos |
| Frescura económica | ✅ UTM dentro de la ventana mensual; UF/dólar diarios; IPC alineado |
| Consistencia de fuentes | ✅ 6 indicadores alineados con el ADR de fuentes (emisor primario + fallback) |
| Citas legales | ✅ 23 leyes, 54 artículos, 65 páginas, 21 registros |
| Timeliness | ✅ stale=0, drift=0; 3 avisos TD-0108 por `validAsOf` ausente (no R4) |

Sin P0/P1 detectados en la perspectiva interna.

## 3. Auditoría externa (muestra)

| # | Afirmación del sitio | Fuente primaria | Observado | Veredicto |
|---|---|---|---|---|
| 1 | UTM octubre 2026 = $72.151 | SII — UTM/UTA/IPC 2026 | Octubre 2026: 72.151 | ✅ |
| 2 | UF 01-10-2026 = $41.065,38 | SII — UF 2026 | 1 de octubre: 41.065,38 | ✅ |
| 3 | Exento hasta 13,5 UTM; 35% hasta 310 UTM; 40% sobre ese tope | SII — Impuesto 2ª categoría, octubre 2026 | Exento hasta $974.038,50 (= 13,5 × 72.151); 35% hasta $22.366.810 (= 310 × 72.151); 40% sobre | ✅ |
| 4 | AT2026 usa UTA de diciembre 2025 = $834.504 | SII — UTM/UTA/IPC 2025 | Diciembre 2025: UTA 834.504 | ✅ |
| 5 | Retención de boletas 2026 = 15,25% (14,5% en 2025) | SII — Boleta de Honorarios 2026 (Ley 21.133) | 2025: 14,5% → 2026: 15,25% → 2027: 16% → 2028: 17% | ✅ |
| 6 | Renegociación: 2+ deudas vencidas >90 días por más de 80 UF | SuperIR — requisitos de renegociación | "dos o más deudas vencidas por más de 90 días corridos y que, en total sumen más de 80 UF" | ✅ |
| 7 | Indemnización: base tope 90 UF (art. 172) | DT — consultas y dictámenes | "no se considerará una remuneración mensual superior a 90 UF del último día del mes anterior al pago" | ✅ |
| 8 | Seguro cesantía: 0,6% trabajador; 2,4% empleador (indefinido); 3% (plazo fijo) | DT / Superintendencia de Pensiones (Ley 19.728, art. 5) | 0,6% + 2,4% indefinido; 3% plazo fijo/obra | ✅ |
| 9 | Reajuste de arriendo: pactado por escrito, anual, IPC/UF (Ley 18.101) | BCN — Ley 18.101, art. 21 y marco de la ley | Coherente con el marco legal; sin reajuste unilateral | ✅ |
| 10 | DICOM: no informable pasados 5 años desde exigible ni después de pagada (Ley 19.628, art. 18) | BCN — Ley 19.628 | No verificable por fetch: `bcn.cl`/`leychile.cl` no responden al cliente (JS) | ⚠️ Limitación |

Resultado: 9/10 verificadas contra fuente primaria; 1 con limitación de
método (no de contenido). La afirmación #10 ya está cubierta por
`check:legal-citations` y por la evidencia del plan 115; no se halló
contradicción.

## 4. Consolidación por causa raíz

- **Sin P0/P1.** No hay hallazgos que cambien una decisión económica.
- **OBS-1 (R3, TD-0108)**: 3 artículos sin `validAsOf`
  (`ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026`,
  `fondos-mutuos-comisiones-rescate-impuestos`, `fraude-tarjeta-que-hacer`).
  Ya visible como warning de `check:editorial-timeliness`; no son R4 y no
  bloquean.
- **OBS-2 (método)**: las páginas dinámicas de BCN no son consumibles por
  fetch; para próximas auditorías usar exportaciones de BCN o páginas de
  DT/SuperIR como equivalente operativo.
- **OBS-3 (control)**: no existe detección automática de contradicciones
  entre páginas; es el ítem LATER de #614 y se mantiene como mejora, no como
  brecha de este ciclo.

## 5. Controles de regresión

- `check:risk-tiers` (#630): cobertura y provenance R4, con waivers fechados.
- Gates existentes revalidados en el snapshot: economic-source-consistency,
  legal-constants, legal-citations, timeliness, postbuild (24 checks).
- No se requieren controles nuevos para P0/P1 porque no hubo P0/P1 nuevos;
  OBS-1 ya está cubierto por la cadencia editorial y OBS-3 es LATER.

## 6. Límites y declaración

- Muestra externa intencionalmente acotada (10 afirmaciones R4/R3); no
  sustituye una auditoría externa exhaustiva.
- La verificación de #10 no pudo ejecutarse de forma independiente por
  limitación de acceso a la fuente dinámica; se declara en lugar de
  asumirla.
- El agente actuó en rol de verificación sobre contenido preexistente; no
  redactó ni modificó las piezas auditadas.
- Uso de IA: ejecución y comparación asistidas por herramienta; la evidencia
  primaria enlazada es la que sostiene cada veredicto.

## 7. Conclusión

El snapshot pasa la auditoría acotada sin P0/P1. Los pendientes son de
método (OBS-2), de control futuro (OBS-3) y un warning ya trazado (OBS-1).
Con la cobertura y el gate de #630, el ciclo NEXT 7–12 de #614 queda
ejecutado para este snapshot.
