# Revisión editorial asistida — `sueldo-imponible-chile` (drift UTM)

- **Fecha del paquete:** 2026-11-18
- **Motivo:** drift de `economic.utm.value` (no es uno de los 7 vencidos por SLA; vence 2027-04-26)
- **Estado:** regla y factores confirmados contra el SII; **firma humana pendiente**
- **Alcance:** verificación y diff propuesto. No se editó el artículo ni se movió la fecha.

## Metadatos

| Campo | Valor |
| --- | --- |
| Archivo | `src/data/blog/sueldo-imponible-chile.md` |
| `articleLead.validAsOf` | 2026-10-28 |
| `volatileData` | `economic.utm.value`, `sync: strict`, `expectedValue: 72151` |
| Snapshot | UTM = **72.440** (noviembre 2026) |
| Política de categoría | `empleo-ingresos`: 180 días, `manual_review` |
| Nota | El frontmatter declara `reviewPolicy.maxDays: 30` (mensual), pero el gate usa la política de categoría (180 días). Decidir cuál gobierna; no se tocó. |

## Confirmado contra el SII (2026-11-18)

Fuente: [SII — Impuesto Único de Segunda Categoría 2026](https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm), tabla mensual de **noviembre 2026**.

| Tramo (UTM) | Factor | Rebaja SII (nov-2026) | Rebaja del artículo (factor × 72.440) | Estado |
| --- | --- | --- | --- | --- |
| 0–13,5 | Exento | hasta $977.940 | 13,5 × 72.440 = $977.940 | Coincide |
| 13,5–30 | 0,04 | $39.117,60 | 0,54 × 72.440 = $39.117,60 | Coincide |
| 30–50 | 0,08 | $126.045,60 | 1,74 × 72.440 = $126.045,60 | Coincide |
| 50–70 | 0,135 | $325.255,60 | 4,49 × 72.440 = $325.255,60 | Coincide |
| 70–90 | 0,23 | $806.981,60 | 11,14 × 72.440 = $806.981,60 | Coincide |
| 90–120 | 0,304 | $1.289.432,00 | 17,80 × 72.440 = $1.289.432,00 | Coincide |
| 120–310 | 0,35 | $1.689.300,80 | 23,32 × 72.440 = $1.689.300,80 | Coincide |
| Sobre 310 | 0,4 | $2.812.120,80 | 38,82 × 72.440 = $2.812.120,80 | Coincide |

Los tramos en UTM son fijos por ley; el artículo los expresa con tokens (`[[utm | clp]]`, `[[utm * 13.5 | clp]]`), así que el texto renderizado ya usa la UTM de noviembre. **No hay prosa desactualizada.**

## Diff propuesto (no aplicado)

```yaml
volatileData:
  - id: economic.utm.value
    sync: strict
-   expectedValue: 72151
+   expectedValue: 72440
```

Y, tras la revisión humana, mover `articleLead.validAsOf` a la fecha real de la revisión (≥ 2026-11-01, que es cuando cambió la UTM). **No** mover `pubDate`.

## Verificación del ejemplo

- RLI con AFP Capital (1,44 %): $971.520 < 13,5 UTM ($977.940) → exento. Correcto.
- RLI con comisión mínima (0,46 %): $983.280 > $977.940 → tramo 4 %; ISC = 983.280 × 0,04 − 39.117,6 = **$213,6**. El artículo usa la fórmula con tokens; correcto.
- El texto no fija montos en CLP del ISC, solo los tokens; no requiere cambios por el paso de octubre a noviembre.

## Cierre

- [ ] Confirmar la tabla de noviembre en el SII (hecho arriba) y que no haya una UTM distinta publicada para diciembre.
- [ ] Aplicar el `expectedValue` y actualizar `articleLead.validAsOf` con la fecha real.
- [ ] `pnpm run check:editorial-timeliness` (drift debe pasar a 0) y `pnpm run check:economic-source-consistency`.
- [ ] Decidir la inconsistencia `reviewPolicy.maxDays: 30` vs. 180 días de la categoría (posible deuda técnica aparte).
