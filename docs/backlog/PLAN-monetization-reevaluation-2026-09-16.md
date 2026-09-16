# PLAN — Reevaluación de monetización (evidencia + discovery, sin
cambiar la promesa aún)

**Estado:** FIRMADO 2026-09-16 — F0/F1 (medición) autorizados;
F2 discovery B2B autorizado en paralelo; F3/F4 bloqueados hasta
revisión 2026-11-02
**Fecha:** 2026-09-16
**Owner de decisión:** Carlos Ortega
**Prioridad:** P1 (negocio) · **Esfuerzo:** S (evidencia) + S (discovery)
· **Riesgo:** ALTA (confianza) si se ejecuta mal; BAJA mientras sea
docs + funnel visible
**Fuente:** $0 donaciones a la fecha (input owner), W37
`s support_shown` 9/sem, `next_step_click` 1/157, `FOCO ESTRICTO`
(ingreso futuro, no exigencia cortoplacista), promesa `sin publicidad`
en hero/`llmsTxt`/`acerca-de`/`autor`/`metodologia`/calculadoras

## Objetivo y límites

Responder con evidencia si la promesa `sin publicidad, sin conflicto`
puede sostenerse como negocio, y dejar lista una decisión reversible
para la revisión 2026-11-02. **Este plan no autoriza cambiar la promesa
ni implementar afiliación/publicidad.**

En alcance (permitido en FOCO):

- Instrumentación agregada: hacer visible el apoyo post-resultado
  (depende del plan hermano de panel) y medir `support_shown/click`,
  `donate_outbound/complete`, `share_success/complete` con umbrales
  pre-declarados e intervalos (no puntos sobre n chico).
- Transparencia: coste/horas operativos semanales + Gate D
  (`utility-led-ops.json`: `weeklyHours`, `weeklyCostClp`,
  `burnoutLevel1To5` hoy en `null`) como base de sostenibilidad.
- Discovery B2B estrictamente documental (permitido explícito):
  10 conversaciones → 2 demos → 1 piloto pagado; memo de API/embed,
  mantenimiento y precio; sin código de API/widget/auth/billing.
- ADR borrador de cambio de promesa (opciones A–E con copy-migration
  `grep` de cada `sin publicidad`) listo para decidir el 2026-11-02,
  no para mergear.

Fuera de alcance (BLOCKED hasta 2026-11-02 + excepción aprobada +
decisión explícita; ver `UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`):

- Afiliación, publicidad, comparadores, AdSense, sponsored ranking.
- API pública, widget embed, white-label, auth, billing, multi-tenant.
- Alertas con correo, newsletter con identificadores, cuentas.
- Ko-fi global (prohibido; solo post-resultado o `/apoyar/`).
- Cualquier link con incentivo económico sin `rel=sponsored/nofollow`
  + disclosure + exclusión de veredictos YMYL.

## Autoridad, invariantes y supuestos

- Precedencia: `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` →
  `context/*.md` → implementación.
- `docs/governance/STRATEGIC_FOCUS_2026Q3.md` §§11/36-38: ingresos
  futuros y opcionales; cero ingresos no cierra; expansión exige
  evidencia reproducible + umbral pre-declarado + capacidad de
  mantenimiento; sin datos comparables → `HALT`, no inferencia
  optimista; nunca fabricar monetización.
- Invariantes: `OWNERSHIP_BEFORE_EXPANSION`,
  `EXTERNAL_PATTERNS_NON_AUTHORITATIVE`,
  `DIFFERENTIATED_ADOPTION_REQUIRED`, editoriales YMYL, `NO_POST_ID`,
  `NO_SILENT_CHANGES`, `NO_REMOVALS`.
- Supuestos: A1 n actual insuficiente para decidir apoyo
  (`support 0/62` P(0)=0,733 al 0,5%); A2 soporte invisible ≠ rechazo;
  A3 B2B no contamina lectura si es embed privado sin tracking
  lector.

## Change Control Record

1. Scope declaration: ver arriba (evidencia + discovery + ADR
   borrador; cero implementación comercial).
2. Impacted modules (solo vía planes hermanos, este plan no toca
   código): panel post-resultado, `/apoyar/` (`?src=` whitelist),
   `docs/operations/UTILITY_LED_EXPERIMENT_REGISTRY.md`,
   `docs/governance/*` (borrador), `docs/adr/*` (borrador).
3. Invariant preservation: sin URLs nuevas; sin tracking individual;
   sin claims YMYL tocados por interés comercial.
4. Contract preservation: eventos agregados v2; `support_confirmed`
   solo con confirmación fiable; privacy copy preciso.
5. Boundary integrity: docs-only en este plan; `check:docs` verde.
6. Test coverage impact: n/a en este plan (los tests viven en el plan
   hermano de panel).
7. Rollback strategy: revert del commit docs; ningún estado productivo
   cambia.
8. Regression risk: BAJA (docs) / ALTA si se salta a implementar sin
   gate — mitigación: excepción `url-freeze-exceptions.json` completa
   (problema, evidencia, hipótesis, costo, mantenimiento, métrica,
   umbral, decisión `APPROVED`, aprobador, fechas) + ADR + ownership.

## Competitive Adaptation Appendix

- benchmarkSet: patrones de monetización ética observados (disclosure
  box, `sponsored/nofollow`, exclusión de veredicto) como insumo;
  ninguna implementación copiada.
- patternHypothesis: comparador/afiliado solo es compatible si no
  ordena por pago y no toca veredictos YMYL.
- localDelta (borrador): solo productos ya explicados (APV, DAP,
  tarjetas), caja de disclosure `es-CL`, ranking por costo transparente,
  sin tracking más allá de agregado.
- nonCopyBoundaries: sin copy/claims/URL/tracking de terceros; sin
  ranking-for-pay; sin ads en calculadoras YMYL críticas como primera
  oleada.
- ownerTarget: a definir en ADR (por cluster, nunca global de una vez).
- successSignal: `support_click/shown` con IC + revenue/sem + proxy
  confianza (`source_click`, share, directo/retorno) durante 4 semanas
  visibles; umbral pre-declarado antes de medir.
- ownership conflict check: pendiente hasta ADR; sin resolver = `HALT`.

## Fases y gates

1. **F0 — Hacer medible (vía plan panel).** Apoyo visible
   post-`complete` + umbrales firmados. Gate: 2 semanas comparables de
   7 días, n reportado.
2. **F1 — Evidencia voluntaria (4 semanas).** `support_click/shown`,
   `donate_outbound`, `share_success`, Gate D (horas/costo/carga).
   Lectura con poder (084); cero con n chico = indecidible, no veredicto.
3. **F2 — Discovery B2B documental.** 10 conversaciones objetivo
   (payroll/HR/fintech/RRHH): memo problema→demo→piloto, costo de
   mantener, precio, contrato de calidad de datos. Sin código.
4. **F3 — ADR borrador (no merge).** Opciones: A puro Ko-fi+share /
   B afiliado ético piloto 1–2 clusters / C display (no recomendado
   como primera oleada: LCP/CLS/CSP + erosión diferencial) / D B2B
   embed privado / E freemium (defer). Cada una con copy-migration,
   `rel`/disclosure, exclusión YMYL, costo mantenimiento, umbral y
   criterio de reversión.
5. **F4 — Decisión 2026-11-02.** Con evidencia F1+F2, el owner aprueba
   perseverar / pilotar B o D (una sola, reversible) / pausar. Sin
   evidencia comparable → `HALT`.

STOP/HALT: intento de link incentivado sin disclosure/`sponsored`;
intento de Ko-fi global; tracking individual; datos insuficientes
presentados como veredicto; presión por "fabricar monetización".

## Métricas

| Métrica | Uso |
|---|---|
| `support_click/shown` + IC | evidencia voluntaria |
| `donate_outbound/complete`, revenue/sem | yield real |
| `share_success/complete` | distribución como apoyo |
| Gate D (horas, costo, burnout 1–5) | sostenibilidad |
| `source_click`, directo/retorno | proxy confianza |
| Discovery B2B 10→2→1 | puerta API/embed |

## Rollback

Docs: revert commit. Piloto futuro (fuera de este plan): kill-switch
por cluster, remover links/disclosure, re-correr `check:routes`,
`check:urls:external`, LHCI y axe; ventana de medición declarada.

## Progress log

- 2026-09-16 — Plan creado (TODO). Decisión owner incorporada:
  analizar cambio de promesa ante $0; vía evidencia + ADR, no cambio
  directo.
