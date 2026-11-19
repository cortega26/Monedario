# Revisión editorial asistida — `operacion-renta-centro`

- **Fecha del paquete:** 2026-11-18
- **SLA:** 90 días · venció 2026-11-01 (`articleLead.validAsOf: 2026-08-03`)
- **Estado:** **dos hallazgos materiales**; firma humana pendiente
- **Alcance:** investigación y checklist. No se editó el artículo ni se movió ninguna fecha.

## Metadatos

| Campo | Valor |
| --- | --- |
| Archivo | `src/data/blog/operacion-renta-centro.md` |
| Rol | `support` · canónico `/guias/impuestos-personas/operacion-renta/` |
| Cadencia | `impuestos`: 90 días, `manual_review` |
| `validAsOf` | 2026-08-03 |
| `updatedDate` | 2026-09-29 |
| Campos volátiles | ninguno declarado (`dataTriggers: []`) |
| Gate | `check:editorial-timeliness` |

## Hallazgo 1 — la campaña 2026 ya terminó

El artículo se presenta como guía accionable de la **Operación Renta 2026**, con plazos del 1 de abril al 8 de mayo de 2026 y un calendario de devoluciones de abril-mayo. A la fecha de este paquete (18-11-2026) esos plazos son **históricos**: no hay nada que el lector pueda ejecutar.

Opciones para la firma humana:

1. **Banner de campaña cerrada** arriba del plato: «La campaña 2026 terminó el 8 de mayo. La próxima Operación Renta corresponde a las rentas de 2026 y se informará en 2027», y dejar el resto como archivo consultable.
2. **Re-scopear a 2027** cuando el SII publique el calendario (habitualmente marzo). Hasta entonces no inventar fechas.
3. **Retirar de navegación/indexación** si se decide que una guía de campaña vencida no debe competir en búsquedas; requiere evaluar la política de URLs y el canónico.

La opción 1 es la de menor riesgo y no crea URLs nuevas. **No renovar `validAsOf` sin resolver esto**: renovarlo certificaría como vigente una guía de una campaña que ya pasó.

## Hallazgo 2 — la Ley 21.850 ya es ley (el artículo dice que no)

El artículo afirma, en la sección de fondos:

> «…el Congreso aprobó el 4 de agosto de 2026 un proyecto de ley —Boletín 18.216-05— que restituiría esta exención desde el 1 de enero de 2027; a la fecha de esta actualización el proyecto está en control de constitucionalidad ante el Tribunal Constitucional y **no es ley vigente**.»

Eso dejó de ser cierto: la **Ley 21.850** (Ley de Reconstrucción Nacional, Boletín 18.216-05) fue **publicada en el Diario Oficial el 17-10-2026** y restituye la exención del art. 107 LIR para las ventas realizadas **desde el 1 de enero de 2027**.

- Fuente secundaria con el detalle: [Holdo — «107 LIR 2027: del 10% al 0% con la Ley 21.850, ya publicada»](https://www.holdo.cl/blog/beneficios-tributarios/nuevo-107-lir-ley-reconstruccion-2027).
- **Confirmar en el Diario Oficial / BCN** antes de publicar el cambio (el sitio de Ley Chile no entrega el texto a clientes sin JS; el número y la fecha son consistentes en la fuente secundaria y en el tramo de tramitación).
- La conclusión operativa del artículo cambia: las ventas de **2025 y 2026** siguen pagando el 10 %; las de **2027 en adelante** vuelven a ser ingreso no renta. La frase «No apliques la exención a ventas realizadas en 2025» es correcta pero incompleta: falta 2026.

**Esto es una corrección material de contenido publicado**: al aplicarla, debe registrarse en `src/data/correcciones.json` (ver entrada propuesta al final).

## Confirmado (cifras que no cambian)

| Dato | Valor | Fuente | Estado |
| --- | --- | --- | --- |
| Retención honorarios 2025 | 14,5 % | [SII — boletas de honorarios](https://www.sii.cl/destacados/boletas_honorarios/) | Coincide |
| Retención honorarios 2026 | 15,25 % (17 % en 2028) | SII, misma página | Coincide |
| UTA diciembre 2025 | $834.504 | snapshot (`uta`) y SII | Coincide |
| 13,5 UTA | $11.265.804 (834.504 × 13,5) | aritmética | Coincide |
| 310 UTA | $258.696.240 ≈ $259 millones | aritmética | Coincide |
| Tasa marginal máxima | 40 % sobre 310 UTA | SII, tabla IGC | Coincide |
| Impuesto art. 107 | 10 % desde el 02-09-2022 (Ley 21.420) | SII / Ley 21.420 | Coincide |

## Pendiente de verificación humana

1. **Fecha límite 8 de mayo de 2026 y calendario de devoluciones** (29-04, 15-05, 27-05, 29-05): contrastar con la resolución del SII de la campaña 2026. Si se opta por el banner de campaña cerrada, basta con que las fechas queden rotuladas como históricas.
2. **Rentas del exterior «sin importar el monto»**: verificar si la obligación de declarar tiene algún umbral o si la afirmación debe suavizarse.
3. **Convenios de pago**: 1,5 % mensual y hasta 36 cuotas — contrastar con el Código Tributario (art. 53) y la normativa TGR vigente.
4. **Multas**: 10 % base del art. 97 N°2 y «hasta 150 %» — confirmar el máximo y las circunstancias agravantes.
5. **Bienes raíces**: límite acumulado de 8.000 UF (art. 17 N°8 LIR) — confirmar que la redacción no mezcla el límite con las condiciones de habitualidad.
6. **Enlace al Centro Operación Renta**: verificar que el canónico siga publicado y con el mismo alcance.

## Entrada propuesta para `correcciones.json`

```json
{
  "id": "operacion-renta-2026-ley-21850",
  "date": "2026-11-18",
  "title": "Estado de la exención del artículo 107 LIR: la Ley 21.850 ya fue publicada",
  "pages": [
    {
      "href": "/posts/operacion-renta-centro/",
      "label": "Operación Renta 2026"
    }
  ],
  "wrong": [
    "La guía afirmaba que el proyecto del Boletín 18.216-05 seguía en control de constitucionalidad y no era ley vigente."
  ],
  "fixed": [
    "La Ley 21.850 (Diario Oficial 17-10-2026) restituye la exención del artículo 107 LIR para las ventas realizadas desde el 1 de enero de 2027; las ventas de 2025 y 2026 siguen afectas al 10 %."
  ],
  "affected": "Personas naturales que vendieron o venderán acciones o fondos con presencia bursátil y necesitan saber si la ganancia tributa.",
  "sources": "Ley 21.850, Diario Oficial 17-10-2026 (confirmar en BCN/DO); SII, impuesto de segunda categoría y boletas de honorarios (https://www.sii.cl/).",
  "prevention": "Revisar el estado de tramitación de los proyectos citados en cada revisión de campaña; no dejar una afirmación de vigencia sin fecha de corte explícita."
}
```

## Cierre

- [ ] Decidir el tratamiento de la campaña 2026 (banner, re-scope 2027 o retiro).
- [ ] Confirmar la Ley 21.850 en el DO/BCN y corregir la nota del art. 107.
- [ ] Registrar la corrección en `correcciones.json` si se publica el cambio de contenido.
- [ ] Resolver los puntos 1–6.
- [ ] `pnpm run check:editorial-timeliness`, `check:correcciones` y `check:economic-source-consistency`.
- [ ] Actualizar `articleLead.validAsOf` solo con la fecha real de la revisión.

La próxima revisión natural cae en **febrero de 2027**, antes de la campaña 2027.
