# Calendario de operación — pendientes con fecha

**Fuente única:** `docs/operations/ops-schedule.json`
**Actualizado:** 2026-09-25 · **Horizonte:** 2026-11-02
**Qué entra aquí:** el programa activo (distribución, F5/Gate D, B2B,
decisión de monetización). El backlog completo sigue en
`docs/backlog/README.md`.

Dos recordatorios leen este archivo:

| Runner | Cuándo | Cómo avisa |
|---|---|---|
| Local (`scripts/ops_reminders.py`) | diario 09:00 (systemd user timer, `Persistent=true`) | notificación de escritorio + push ntfy |
| GitHub (`.github/workflows/ops-reminders.yml`) | lunes 08:00 Chile | issue `🗓️ Operación — pendientes y fechas` + comentario semanal |

El de GitHub vuelve a correr cuando se reinicie la cuota de Actions
(2026-10-01); hasta entonces manda el local.

## Uso manual

```bash
python3 scripts/ops_reminders.py            # próximos 7 días
python3 scripts/ops_reminders.py --all      # todo el calendario
python3 scripts/ops_reminders.py --notify   # además notifica
```

Config del push al teléfono (opcional): `MONEDARIO_OPS_NTFY_TOPIC` o
`~/.config/monedario-ops.env` con `NTFY_TOPIC=<topic>` (modo 600).
Es el mismo topic del monitor de Reddit: un solo destino.

## Fechas

| Fecha | Pendiente | Detalle | Owner |
|---|---|---|---|
| 2026-09-28 | Export W39 + ritual semanal | bundle W39 + issue semanal | carlos |
| 2026-09-28 | Gate D W39 (inputs owner) | horas/costo/burnout en `utility-led-ops.json` | carlos |
| 2026-09-28 → 10-02 | Publicar lote 1 de siembra | r/chile finiquito (sin link) + r/FinanzasChile tarjeta (con link) | carlos |
| 2026-09-28 | Enviar modmail r/FinanzasChile | 1 clic en `/modmail` | carlos |
| 2026-09-30 | Lectura primaria F5 (UTM/UF) | W39 vs W36; decidir keep/revert/extender y F2 UF | carlos |
| 2026-10-01 | Reinicio cuota GitHub Actions | se desbloquea CI | carlos |
| 2026-10-01 | Refresco UTM de octubre | confounder F5; anotar, no decidir solo con 28 d | sistema |
| 2026-10-05 | Export W40 + ritual + Gate D W40 | bundle + inputs | carlos |
| 2026-10-05 → 10-09 | Publicar lote 2 de siembra | 3 borradores en `/siembra` | carlos |
| 2026-10-05 | Lectura panel F4 (2 semanas) | `next_step_click/shown` ≥3% n≥99 | carlos |
| 2026-10-05 → 10-09 | B2B: enviar batch 1 (3-4) | validar contacto antes | carlos |
| 2026-10-05 → 10-16 | Post-W40: instrumentación UTM landing + F3 | recién aquí se tocan superficies | carlos |
| 2026-10-12 | Export W41 + ritual + Gate D W41 | bundle + inputs | carlos |
| 2026-10-12 → 10-16 | B2B: enviar batch 2 (3-4) | + follow-up único a 7 días | carlos |
| 2026-10-13 → 10-30 | B2B: conversaciones (2/semana) | meta 10 al 30-oct | carlos |
| 2026-10-14 | Lectura extendida F5 (28 días) | con confounder anotado | carlos |
| 2026-10-19 | Export W42 + ritual + Gate D W42 | bundle + inputs | carlos |
| 2026-10-26 | Export W43 + ritual + Gate D W43 | bundle + inputs | carlos |
| 2026-10-26 | Corrida mensual de citación IA | `AI-CITATION-TRACKING.md`; requiere login | carlos |
| 2026-10-30 | B2B: memo completo + ADR final | sin memo, opción D no elegible | carlos |
| 2026-11-02 | Decisión de monetización (A-E) | fin del FOCO ESTRICTO | carlos |

## Recurrentes (sin fila propia)

- **Siembra:** ensayo de 1 respuesta/día (28-sep → 12-oct), máximo 2-3 con
  link por semana y r/chile/AskChile/RepublicadeChile sin link; revisión del
  ensayo el 12-oct (si no hay señal o hay remociones, vuelve a 2-3/semana).
- **Gate D:** cada lunes con el ritual semanal (W39-W43).
- **Citación IA:** mensual (primera corrida parcial ya registrada).
- **Wikis:** revisar el estado mensual en `/wikis`.

## Sin fecha (cuando puedas)

- Firmar lote 0 de `impuestos-personas` en `07-publish-packet.md` y decidir
  el merge del PR #423 (firma humana).
- Revisar en el navegador las wikis cerradas al bot: `ChileInversiones`,
  `AskChile`, `ChileStartup`, `chile_autos`.
- Completar la corrida de citación (Perplexity/Copilot) con login.
