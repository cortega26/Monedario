# PLAN — Deduplicación editorial del cluster Operación Renta (remanente plan 119)

Fecha: 2026-09-29
Estado: **PENDIENTE DE SELECCIÓN Y REVISIÓN EDITORIAL HUMANA** (YMYL).
Origen: plan 119 (SEO-05, opción A) dejó declarada la gobernanza de intención
(guía = hub, owner = checklist F22) y la metadata diferenciada, pero la
deduplicación de **contenido** quedó fuera por el STOP de YMYL.

## Situación actual

| Superficie | Rol declarado | Contenido |
|---|---|---|
| `/guias/impuestos-personas/operacion-renta/` (guía) | `hub` (`GUIDE_INTENT_REGISTRY`) | 13 secciones: respuesta rápida, calculadora, quién no declara, elige tu situación, plazos, devolución, F22, pagar, retención honorarios, FAQ, canales oficiales, qué cambió |
| `/posts/operacion-renta-f22-checklist/` | `owner` de `f22-revisar-enviar` | Checklist F22: aceptar/declarar, devolución/pagar, qué hacer, escenarios, errores |
| `/posts/operacion-renta-centro/` | `support` de `f22-revisar-enviar` | FAQ/orientación: quién debe/no debe, plazos, devolución, F22, pagar |

Solapamiento verificado (secciones equivalentes en las tres superficies):
¿debo declarar? / quién no declara, plazos, cuándo pagan la devolución,
secciones del F22, qué hacer si debes pagar.

## Propuesta (requiere selección del mantenedor/editor)

- **A1 (recomendada)**: la guía conserva su rol de hub (rutas, calculadora,
  canales oficiales, qué cambió 2026, elige tu situación) y reemplaza las
  secciones duplicadas por resúmenes de 2–3 líneas con enlace al owner
  (checklist) y al centro (FAQ). No se pierde información única; se delega.
- **A2**: consolidar el post centro dentro de la guía (redirect 301) y dejar
  dos superficies (hub + owner). Requiere snapshots de rutas/RSS + ADR por
  cambio de URL pública.
- **A3**: no tocar contenido; aceptar el solapamiento como costo del hub.

## Criterios de aceptación (si A1/A2)

- [ ] Ninguna sección duplicada publica el mismo detalle en dos superficies;
      la guía enlaza al owner y al centro para cada intención delegada.
- [ ] Title/H1/description siguen diferenciados (ya verificado en plan 119).
- [ ] `pnpm run check:editorial` + `check:editorial-timeliness` en verde.
- [ ] Monitoreo GSC W+4: el owner no pierde posición; la guía no canibaliza.

## Restricciones

- YMYL: el cambio lo decide y revisa un editor humano; el agente que redacte no
  puede auditar/compliance-revisar la misma pieza en la misma sesión
  (`INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`).
- Si A2: snapshots antes/después de rutas y RSS + ADR obligatorios.
- Sin URLs nuevas (FOCO ESTRICTO hasta 2026-11-02).
