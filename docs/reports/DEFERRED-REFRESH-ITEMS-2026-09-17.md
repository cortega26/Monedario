# Deferred refresh items — hard-fact passes 2026-09-17 (NOT applied)

**Fuente:** 4 remediaciones paralelas (solo hechos duros) + 4 verificaciones
frescas (ACCEPT DIFF, 0 rechazos). Todo lo de abajo quedó fuera por regla:
rewording, estructura, juicio editorial, o verificación humana pendiente.
**Nada de esta lista bloquea el diff aplicado; varios ítems bloquean
publicación/packet.**

## A. Verificación humana pendiente (requiere navegador, formato checklist ya emitido o por emitir)

- A1. Checklists emitidos 2026-09-17 (responder `CONFIRMADO`/`RETIRAR`):
  `HUMAN-VERIFY-el-poder-del-interes-compuesto`, `HUMAN-VERIFY-indemnizacion-anos-de-servicio-chile`,
  `HUMAN-VERIFY-reforma-previsional-2025` (21 NHV: todo lo BCN-dependiente).
- A2. Article 2 (`donde-ver`): R1 (base eliminación Boletín, art. 19.628/19.812 literal),
  R2 (base consulta básica), resto 7+3 art. 19, R4 boundary terceros/empleador-arrendador
  a nivel inciso, L117 folio CMF, L82 cobertura CCS, L92 composición privados, L132–133
  "probablemente", L137–138 reglas por tipo. Reutilizar checklists piloto como base.
- A3. Reforma NHV-1..5 (calendario gradual, vigencia diferida, fondos generacionales,
  independientes, contratos) + monto PGU sep-2026 en IPS/ChileAtiende.
- A4. Indemnización NHV-1..7 (arts. 163/172/159-161/168/510 canónicos, transitorio
  pre-1981, arts. 178/17-N°13, estado iniciativa elimina-tope-330).

## B. Rewording y estructura (diseño editorial, no hechos)

- B1. F5 interés-compuesto: doble numerario 13,7x USD vs ~19,1x CLP (redacción nueva).
- B2. F6: changelog visible + fecha "Revisado el" coherente.
- B3. F10 indemnización: bloque vigencia visible + etiquetas "resumen orientativo" + deep links.
- B4. F9 reforma: etiquetas "resumen orientativo"; orden mención CRP (L70 vs L91).
- B5. Donde-ver: L107 routing arrendador/empleador, L75 "en segundos", scope L92/L127,
  etiqueta orientativa, boundary RDC.
- B6. Frontmatter `limits` indemnización ("No incorpora recargos judiciales" contradice
  la nueva tabla F8 — decidir reword en follow-up).
- B7. Nota metodológica interés-compuesto: glosa castigos/serie (consistencia con B1–B2).

## C. Trazabilidad y gobierno de datos (decisión owner)

- C1. INE esperanza de vida (tabla exacta + base) e inmobiliario (URLs+fechas) — interés-compuesto F8/F9.
- C2. Footnote comisión AFP — interés-compuesto F10.
- C3. Serie mensual + 24 lagunas + script replicación (bloquea re-simulación 2025 con split $510.636/$529.000) — F7/F13.
- C4. `volatileData`/`dataTriggers`: interés-compuesto F14, reforma F7 (dataset calendario previsional vs triggers fechados), indemnización aceptablemente ausente.
- C5. Etiqueta serie TR vs price-return — F12.
- C6. Aclaración edad 54 vs edad legal — F15.

## D. Otros archivos (tareas separadas, NO este refresh)

- D1. `src/data/laws/codigo-del-trabajo.md` L75–L76 (desahucio art. 163→161; recargos "20–80%" → 30/50/80/100) — OBS-1.
- D2. Pilar `finiquito-e-indemnizaciones-en-chile.md` L81 ("proporcional" vs fracción >6 meses) — OBS-2, incoherencia de clúster.
- D3. `/calculadoras/finiquito-indemnizacion/` — ¿replica F1–F3 (90 UF, horas extra, 1 año)? Posible bug de cálculo en producción (NHV-8).
- D4. Ficha `ley-19628` interna: citar arts. 18 inc. 2.° / 19 explícitos (del piloto §5.3).
- D5. Gate `stale=0` con error factual en producción (3 auditorías lo confirman) — limitación de `check:editorial-timeliness` a registrar como deuda técnica.

## E. Packets y firmas (human-only, pendientes)

- E1. Article 2 (`donde-ver`): 06-CONDITIONAL + TODO 12/12 → requiere verificación (A2) + refresh + delta + packet + firma.
- E2–E4. Los 3 artículos auditados requieren packet + firma tras verificación (A1/A3/A4) y refresh residual.
