# Plan 121: Remediación de la auditoría de privacidad y seguridad pasiva (2026-09-29)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Update the status row for this plan in
> `plans/README.md` as work advances.

## Status

- **Priority**: P3 (findings) + hardening (invariante)
- **Effort**: M
- **Risk**: LOW-MED (toca instrumentación de analytics y añade E2E; sin
  cambios de datos/URLs)
- **Depends on**: decisión del mantenedor para F1 (¿instrumentación
  intencionalmente apagada?)
- **Category**: privacidad / observabilidad / CI
- **Planned at**: commit `96ac86af`, 2026-09-29
- **Status**: TODO — requiere selección del mantenedor
- **Evidence**: `docs/reports/AUDIT-PRIVACY-2026-09-29.md`

## Contexto verificado (2026-09-29)

- **PRIV-03 resuelto con evidencia live**: producción sirve HSTS, CSP con
  hashes + `frame-ancestors 'none'`/`base-uri 'self'`/`form-action 'self'`,
  `Referrer-Policy`, `Permissions-Policy`, `nosniff`, `X-Frame-Options: DENY`.
- **PRIV-02**: `src/utils/calculatorScenarios.ts` usa `localStorage`
  (`monedario_scenarios`, máx. 6 por calculadora, sin TTL). Falta E2E.
- **PRIV-01**: wiring cliente correcto (`SITE.analyticsTransport = true`,
  atributo en dist, host de producción, ruta worker
  `monedario.cl/api/analytics/*`, `calculator_complete` en allowlist con
  `calculator_slug`→`calculator_id`). Queda diagnosticar por qué el auditor no
  observó eventos: instrumentación/deploy vs límite del inspector.

## Scope

**In scope**

- `tests/privacy/` + config Playwright propia — canarios, metamórfico,
  escenarios, contrato de analytics.
- `scripts/check-headers-prod.mjs` — smoke de headers de producción.
- `src/utils/calculatorScenarios.ts` (solo si el E2E revela defecto).
- `workers/analytics-collector` / `src/scripts/analytics.ts` (solo si el
  diagnóstico F1 revela un fallo real).
- `context/INVARIANTS.md` — invariante de privacidad.
- `plans/README.md`.

**Out of scope**

- Cambios de copy en páginas de privacidad (YMYL editorial).
- Google Analytics/terceros (no existen y no se agregan).
- Cambios de arquitectura de transporte (ADR propio si hiciera falta).

## Steps

1. **F3 — headers (cerrar con evidencia)**: crear
   `scripts/check-headers-prod.mjs` que haga `HEAD /` y
   `HEAD /calculadoras/sueldo-liquido/` y valide el contrato de headers
   (HSTS con `max-age>=31536000`, CSP con `frame-ancestors 'none'` +
   `base-uri 'self'` + hashes, `Referrer-Policy`, `Permissions-Policy`,
   `nosniff`, `X-Frame-Options`). Script npm `check:headers:prod`
   (manual/scheduled, no PR gate). Registrar la corrida live 2026-09-29.
2. **F1 — diagnóstico analytics**: E2E Playwright que habilita el transporte
   (`window.__monedarioAnalyticsTransport = true`), completa un cálculo y
   asserta **exactamente 1** POST a `/api/analytics/event` con payload
   allowlisted. Si el E2E pasa en local y producción sigue sin eventos:
   revisar deploy del worker (ruta/ratelimit) y dashboard; documentar decisión.
   Si el E2E falla: corregir el wiring (mínimo diff) y re-verificar.
3. **F2 — escenarios**: E2E `guardar → reload → escenario reaparece` con
   **0 requests** de red y sin canario financiero en red; documentar key,
   capacidad (6) y ausencia de TTL.
4. **F4 — suite de canarios + metamórfico** (`tests/privacy/`):
   - canarios (sueldo/deuda/saldo/impuesto) ∉ URL, ∉ payloads de red, ∉
     cookies, ∉ storage observable durante el cálculo;
   - metamórfico: misma calculadora con 20 montos aleatorios → el tráfico
     externo es idéntico salvo categorías permitidas;
   - contrato: analytics rechaza claves desconocidas y números financieros
     arbitrarios (extender `tests/integration/analytics-sanitizer.test.ts` si
     falta cobertura).
   Añadir script `test:privacy` + config `playwright.privacy.config.ts`.
5. **Invariante**: documentar en `context/INVARIANTS.md`
   (`INVARIANT.PRIVACY.NO_FINANCIAL_EGRESS`): input/resultado financiero ∩
   payload saliente = ∅, con enforcement `test:privacy` + guardas del worker.
6. Actualizar `plans/README.md` y el reporte si el diagnóstico F1 cambia la
   conclusión.

## Verification table

| Purpose | Command | Expected |
|---|---|---|
| Headers prod | `pnpm run check:headers:prod` | contrato OK (2 URLs) |
| E2E privacidad | `pnpm run test:privacy` | canarios + metamórfico + escenarios + analytics |
| Unit/integración | `pnpm run test` | verde |
| Build | `pnpm run build` | 20 checks |
| CI mirror | `pnpm run check:ci` | exit 0 |

## Done criteria

- [ ] `check:headers:prod` verde y corrida 2026-09-29 registrada (PRIV-03).
- [ ] PRIV-01 cerrado con causa raíz documentada (instrumentación/deploy o fix
      aplicado) y E2E de contrato en verde.
- [ ] PRIV-02 cerrado con E2E save→reload (0 red) y key/TTL documentados.
- [ ] Suite de canarios + metamórfico en verde y script `test:privacy`.
- [ ] `INVARIANT.PRIVACY.NO_FINANCIAL_EGRESS` registrado con enforcement.
- [ ] Gates en verde.

## STOP conditions

- El E2E de canarios detecta un egreso financiero real → **HALT**: escalar como
  P0, no continuar con el resto del plan.
- La telemetría de producción está apagada por decisión de dashboard → no
  forzar; documentar la divergencia y ajustar la política pública (decisión
  del mantenedor).
- Cualquier fix en analytics que cambie el contrato de eventos requiere
  actualizar `src/contracts/analytics-events.ts` y su sync
  (`tests/static-analysis/data-signals-allowed-events-sync.test.ts`).

## Rollback

Por paso: scripts y tests son aditivos; el fix de analytics (si aplica) se
revierte con el commit correspondiente. Sin migración de datos ni URLs.
