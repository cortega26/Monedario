# PLAN — Distribución por calculadoras embebibles (flywheel post-2026-11-02)

**Estado:** PROPUESTO — **diseño ahora, código después del 2026-11-02**
**Fecha:** 2026-09-25 · **Owner de decisión:** Carlos Ortega
**Prioridad:** P1 (distribución estructural) · **Esfuerzo:** M ·
**Riesgo:** MED (superficie nueva, dependencia de terceros)
**Fuente:** `PLAN-zero-cost-distribution-2026-09-25.md` (canal 3),
`docs/backlog/DECISION-monetization-2026-11-02.md`,
`docs/reports/B2B-DISCOVERY-MEMO-2026-09-16.md`,
`docs/adr/ADR-20260615-calculator-shell-design.md`.

## Objetivo

Que las calculadoras viajen a las audiencias de terceros (foros, docentes,
blogs, medios, fintechs) con atribución obligatoria a Monedario. Cada embed es
un punto de contacto de marca y un enlace persistente; es el único canal de
los cuatro que escala sin la marca y sin tiempo semanal del owner.

## Por qué este canal

- W38: las calculadoras concentran el uso (`conversor-utm` ~69% de clics;
  `impuesto-segunda-categoria` 44 clics; `conversor-uf` 51k impresiones con
  0,04% CTR): son el activo, no el sitio.
- El stack ya está componentizado (`PLAN-calculator-componentization-*`):
  reutilizar `CalculatorShell` y componentes facilita una variante embebible.
- La vía B2B (opción D) ya está autorizada como discovery; el embed público
  gratuito es su hermana de distribución y valida demanda antes de vender.

## Restricciones que definen el diseño

1. **Gate 2026-11-02**: hoy no se permite widget/embed/API
   (`UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`). Este plan no escribe código
   de embed antes de la decisión.
2. **Sin tracking del lector** en el embed (A3 del plan de monetización y
   regla de no-contaminación): nada de cookies, fingerprint ni eventos
   individuales; solo agregados existentes si el host es Monedario.
3. **Atribución obligatoria**: el embed incluye un enlace visible
   "Calculado con Monedario.cl" a la página canónica; sin atribución no hay
   embed.
4. **Sin URLs nuevas** hasta la decisión; después, cualquiera de las
   variantes necesita entrada completa en `url-freeze-exceptions.json` +
   ADR (superficie/contrato nuevo).
5. **CSP/no-transform/`no-console`/a11y** se mantienen; el embed no relaja la
   seguridad ni introduce logs.

## Fases

### F0 — Diseño y validación en discovery (ahora → 2026-11-02)

Entregables docs-only (sin código):

1. **Brief técnico de opciones** (una página, dentro de este plan):
   - A) iframe a ruta dedicada (requiere URL nueva y CSP `frame-ancestors`
     configurable por host),
   - B) Web Component/script con Shadow DOM (sin iframe; más trabajo de
     aislamiento),
   - C) generación estática de un snippet por calculadora (copiar/pegar HTML,
     sin JS propio del host).
   Para cada opción: requisitos, costo de mantención, seguridad, accesibilidad,
   atribución, actualización del dato (el embed debe reflejar la vigencia).
2. **Política de embeds** (borrador): quién puede embeber, atribución mínima,
   prohibiciones (reventa, quitar marca, contextos engañosos), kill-switch
   por host.
3. **Validación con F2**: incluir en las conversaciones B2B la pregunta
   "¿insertarían una calculadora en su producto/comunidad? ¿qué exigirían?" y
   registrar en el memo. Un "sí" recurrente refuerza D; el embed público
   gratuito no necesita esperar precio.

Gate F0: brief + política + evidencia de al menos 3 conversaciones; sin
código.

### F1 — MVP embebible público (post-2026-11-02, si la decisión lo habilita)

1. Excepción completa en `url-freeze-exceptions.json` + ADR de la variante
   elegida (problema, evidencia, hipótesis, costo, mantenimiento, métrica,
   umbral, `APPROVED`, aprobador, fechas).
2. Implementar 1 calculadora piloto (`conversor-utm` o `sueldo-liquido`):
   - atribución visible con enlace `?utm_source=embed&utm_medium=referral&utm_campaign=<slug>`;
   - sin tracking del lector; sin almacenamiento;
   - a11y AA, sin `console`, CSP intacta; tests de render y de atribución.
3. Página/instrucciones de inserción: si requiere URL nueva, entra en la
   excepción; si no, se documenta en una página existente (`/calculadoras/`).
4. Evidencia: embed de prueba en un sitio propio/aliado, medición de
   referidos y de frescura del dato.

Gate F1: LHCI/axe sin regresión; referidos >0 en 4 semanas; cero incidencias
de actualización del dato.

### F2 — Difusión y alianzas (post-MVP)

- Docentes y comunidades: ofrecer el embed gratuito con atribución.
- Medios: snippet citable para notas de UF/UTM (enlaza al plan de citaciones).
- B2B: convertir el embed público en la demo natural del piloto privado
  (contrato de calidad, SLA, sin tracking del lector).

Gate F2: ≥3 embeds vivos en dominios externos; si no, diagnosticar antes de
ampliar.

### F3 — Puente pre-gate: loop de compartir (post-W40, ~2026-10-12)

Mientras el embed espera, mejorar el texto de compartir del resultado
(`ShareCalculatorResult` ya existe): añadir una línea de cita con URL corta
visible y sin PII. Sujeto al cierre de la ventana del panel F4 para no
contaminar la medición.

## Métricas

| Métrica | Línea base | Objetivo |
|---|---|---|
| Embeds vivos | 0 | ≥3 a 90 días del MVP |
| Sesiones referidas del embed | sin datos | tendencia mensual |
| Backlinks de embeds | sin datos | ≥3 |
| Errores de dato en embeds | 0 | 0 (frescura por snapshot) |
| Shares completados (puente F3) | `share_attempt` 1 en W38; `share_success` 0 | baseline y +50% tras instrumentar |

## STOP / kill criteria

- Host que quite la atribución o revenda → kill-switch de ese host.
- Embed que requiera tracking del lector → no se implementa.
- Regresión CWV/CSP/a11y → revert.
- Si la decisión del 2026-11-02 rechaza la vía, F1+ no se ejecuta; quedan F0
  y F3 como activos de distribución.

## Change Control Record

1. Scope: F0/F3 docs (y F3 código pequeño post-W40 si se aprueba); F1+
   gated por decisión + excepción + ADR.
2. Impacted modules: este plan, `docs/backlog/README.md`; futuro:
   `src/components/calculator/*`, `src/pages/calculadoras/*`,
   `url-freeze-exceptions.json`, `docs/adr/*`.
3. Invariantes: `URL.PUBLIC.NO_POST_ID`, `NO_SILENT_CHANGES`,
   `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`; embed sin datos personales.
4. Contract preservation: eventos v2; `affiliate_click`/`lead_submit` siguen
   sin emisores salvo decisión de monetización.
5. Boundary integrity: `check:boundaries`, `check:workers` donde aplique.
6. Test impact: tests de embed (render, atribución, sin storage), a11y móvil,
   clipboard en F3.
7. Rollback: kill-switch por host + revert del PR de embed; la página de
   instrucciones se retira si la excepción vence.
8. Regression risk: MED (superficie nueva). Mitigación: piloto 1 calculadora,
   umbrales por gate, rollback por host.

## Progress log

- 2026-09-25 — Plan creado (docs-only). Pendiente brief técnico F0 y
  preguntas de embed en las conversaciones F2 B2B.
