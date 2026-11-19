# Revisión editorial asistida — `impuesto-global-complementario-chile`

- **Fecha del paquete:** 2026-11-19
- **SLA:** 90 días · venció 2026-11-17 (`articleLead.validAsOf: 2026-08-19`)
- **Estado:** **sin error material**; tabla y UTA confirmadas. Firma humana
  pendiente.
- **Alcance:** investigación y checklist. No se editó el artículo ni se
  movió ninguna fecha.

## Metadatos

| Campo | Valor |
| --- | --- |
| Archivo | `src/data/blog/impuesto-global-complementario-chile.md` |
| Cadencia | `impuestos`: 90 días, `manual_review` |
| `validAsOf` | 2026-08-19 |
| Pin volátil | `economic.uta.value` = 834.504 (`strict`) |
| Fuentes declaradas | SII (AT 2026), BCN (LIR arts. 52–57) |
| Gate | `check:editorial-timeliness` |

## Confirmado contra el SII (2026-11-19)

Fuente: [SII — Datos informativos AT 2026, personas
naturales](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html).

| Dato del artículo | Valor oficial | Estado |
| --- | --- | --- |
| UTA diciembre 2025 | **$834.504** | Coincide |
| 13,5 UTA exentas | **$11.265.804** | Coincide |
| Tramos | 8 (exento + 7 afectos) | Coincide |
| Factores de rebaja | 0,54 / 1,74 / 4,49 / 11,14 / 17,80 / 23,32 / 38,82 × UTA | Coinciden |
| Tasa marginal máxima | 40 % sobre 310 UTA | Coincide |
| 310 UTA | $258.696.240 ≈ $259 millones | Coincide |
| Retención honorarios 2025 | 14,5 % | Coincide |
| Retención honorarios 2026 | 15,25 % | Coincide |

Los cálculos con tokens (`[[uta | clp]]`, `[[uta * 13.5 | clp]]`) ya usan la
UTA del snapshot; no hay montos fijos desactualizados en la prosa.

## Sin corrección material

No encontré tasas, tramos ni umbrales incorrectos. El artículo está bien
acotado al **año tributario 2026** (rentas 2025) y advierte que la UTA cambia
cada año. No propongo entrada en `correcciones.json`.

## Observaciones para la firma

1. **Alcance temporal.** El artículo es AT 2026. La UTA de diciembre 2026
   (AT 2027) se publicará a fines de 2026 o enero de 2027; el `[[uta]]`
   actualizará los montos, pero la tabla de tramos sigue siendo la misma.
   Conviene que la próxima revisión sea **después** de esa publicación, no
   antes. La cadencia de 90 días lleva a febrero de 2027, que calza.
2. **Enlace SII.** La URL de `officialSources` responde 200 y contiene la
   UTA y las exenciones. Mantenerla.
3. **Retención 2026.** El artículo menciona 15,25 % para boletas 2026; está
   confirmado por el SII. No requiere cambios.
4. **Ganancias de capital.** El artículo las excluye explícitamente del
   alcance; si se quiere cubrir la exención del art. 107 restituida por la
   Ley 21.850 desde 2027, corresponde otro artículo, no este.
5. **`updatedDate` vs. `validAsOf`.** `updatedDate` es 2026-10-04 y
   `validAsOf` 2026-08-19. Si la actualización de octubre fue de contenido,
   la fecha de revisión debería reflejarlo; si fue cosmética, se mantiene.

## Cierre

- [ ] Confirmar que no hubo cambios al art. 52 LIR ni a la tabla del IGC
  desde la publicación del AT 2026.
- [ ] Actualizar `articleLead.validAsOf` a la fecha real de la revisión.
- [ ] `pnpm run check:editorial-timeliness` y
  `check:economic-source-consistency`.
- [ ] Programar la próxima revisión para después de la UTA de diciembre 2026.

La próxima revisión natural cae en **febrero de 2027**.
