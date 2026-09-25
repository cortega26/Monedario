# PLAN — Distribución sin presupuesto (programa, 4 canales)

**Estado:** PROPUESTO (docs-only; los canales se activan según sus gates)
**Fecha:** 2026-09-25 · **Owner de decisión:** Carlos Ortega
**Prioridad:** P1 (crecimiento) · **Esfuerzo:** S–M por canal · **Riesgo:** BAJO
mientras sea manual y sin promesas nuevas; MED si se automatiza (prohibido)
**Fuente:** diagnóstico de tráfico W38 (`output/operations/data-signals/` W38),
`docs/reports/AI-CITATION-TRACKING.md`, `docs/operations/COMMUNITY_SEEDING_KIT.md`,
`docs/backlog/DECISION-monetization-2026-11-02.md`.

## Objetivo

Aumentar usuarios y retorno sin gastar dinero y sin romper la promesa ni la
ventana `FOCO ESTRICTO / VALIDACIÓN UTILITY-LED` (hasta 2026-11-02). El
cuello de botella no es el producto: es la distribución. W38: 617 clics GSC,
16,4k pageviews/semana y `conversor-utm` concentra ~69% de los clics.

## Diagnóstico que justifica el programa

| Hecho | Implicación |
|---|---|
| Head de UTM/UF capado por EMDs (#401) | Google no es la única palanca; hay que ir donde la confianza gana |
| AI-CITATION-TRACKING.md con log vacío | Canal de IA ya construido (`llms.txt`, bots de cita permitidos) pero jamás medido |
| COMMUNITY_SEEDING_KIT.md activo y sin cadencia | Playbook listo; falta ejecución humana sistemática |
| Calculadoras buenas, sin forma de insertarse | El embed es distribución estructural (gated hasta 2026-11-02) |
| Sin email/cuentas/social (blocked) | La distribución debe usar superficies de terceros y comunidades |

## Principios

1. **Cero gasto.** Tiempo del owner y activos existentes, nada más.
2. **Confianza como diferencial, no como freno.** "Gratis, sin registro, sin
   publicidad, no guarda datos" es el gancho (kit de siembra, regla 5).
3. **Manual y con autoría declarada.** Automatizar participación = spam
   (hard stop del ADR del monitor; `docs/adr/ADR-20260919-reddit-single-monitor.md`).
4. **Una intervención por superficie medida.** No tocar `conversor-utm`/`conversor-uf`
   ni títulos del sitio durante ventanas activas (F5 hasta 2026-09-30; panel
   F4 W39–W40; títulos congelados 14–28 días desde el deploy del 2026-09-16).
5. **Sin URLs nuevas** hasta 2026-11-02 (`UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`).
6. **Cada canal con métrica, kill criteria y rollback** antes de empezar.

## Portafolio de canales

| # | Canal | Plan | Gate para activar | Esfuerzo | Métrica primaria |
|---|---|---|---|---|---|
| 1 | Citación en IA + prensa/datos | `PLAN-distribution-citations-2026-09-25.md` | Inmediato (medición); cambios on-site tras W40 | S–M | tasa de citación mensual; backlinks |
| 2 | Siembra en comunidades | `PLAN-distribution-community-seeding-2026-09-25.md` | Inmediato (manual) | S semanal | sesiones referidas + branded queries |
| 3 | Calculadoras embebibles | `PLAN-distribution-embeddable-calculators-2026-09-25.md` | 2026-11-02 (código); diseño ahora | M | embeds vivos + referidos |
| 4 | Notas del ciclo de noticias (prensa/datos) | sección 5 del plan de citaciones | Inmediato (email manual) | S | citas/backlinks de medios |

Canales descartados por ahora: cuentas sociales nuevas (baja afinidad,
MON-304 diferido), newsletter/cuentas (blocked), publicidad pagada (fuera de
principios), marketplaces de links (viola la promesa y el ADR).

## Medición compartida (resolver la brecha una vez)

Hoy el colector first-party **no captura UTM del landing** (los `utm_*` del
contrato se emiten con valores internos fijos, p. ej. `UtmPostResultActions`).
Consecuencias:

- La atribución por canal se hace con proxies: GSC (queries de marca y
  páginas), Cloudflare (pageviews y referrers del panel), evidencia manual de
  cada publicación.
- Mejora propuesta (instrumentación agregada, permitida): leer `utm_source/
  medium/campaign` de `location.search` y adjuntarlos a eventos existentes,
  sin cookies ni identificadores. **Programar después de W40 (~2026-10-12)**
  para no alterar agregados en ventana activa.
- Convención de links salientes (aunque la captura llegue después):
  `?utm_source=<canal>&utm_medium=<community|referral|embed|press>&utm_campaign=<slug>`.

Métricas del programa (semanal/mensual): sesiones referidas y branded queries
(GSC), citaciones IA (log mensual), backlinks (GSC > Vínculos), embeds vivos.
Línea base 2026-09-25: sin datos en los tres primeros; se registra la primera
corrida en cada plan.

## Secuencia

| Fecha | Hito | Plan |
|---|---|---|
| 2026-09-26 → 09-30 | Primera corrida del log de citación IA | 1 |
| 2026-09-26 → 10-31 | Siembra 2–3 respuestas/semana | 2 |
| 2026-09-30 | Lectura F5 (no tocar UTM/UF después sin decidir) | — |
| 2026-10-12 | Cierre ventana panel F4 → habilitar instrumentación UTM landing | master |
| 2026-10-13 → 10-31 | Hooks de prensa (UF, UTM de octubre, IPC) | 4 |
| 2026-11-02 | Decisión monetización → habilita embed | 3 |
| 2026-11 → 2027-01 | Piloto embed + iteración de canales según métricas | 3 |

## Autoridad, invariantes y supuestos

- Precedencia: `docs/AI_ENGINEERING_CONSTITUTION.md` → `AGENTS.md` →
  `context/*.md` → este plan.
- Invariantes: `URL.PUBLIC.NO_POST_ID`, `NO_SILENT_CHANGES`,
  `EXTERNAL_PATTERNS_NON_AUTHORITATIVE`, `DIFFERENTIATED_ADOPTION_REQUIRED`;
  editorial YMYL sin cambios por interés de distribución.
- Supuestos: A1 el diferencial "sin publicidad/sin registro" es gancho en
  comunidades (a validar con la primera campaña); A2 las respuestas de IA
  crecen y citan fuentes confiables; A3 el embed es aceptable para terceros
  sin pago (a validar en F2 B2B).

## Change Control Record (programa)

1. Scope: planes docs-only. La ejecución por canal es manual o código
   explícitamente permitido por su gate.
2. Impacted modules: `docs/backlog/*` (estos planes), `docs/reports/AI-CITATION-TRACKING.md`
   (log), `docs/operations/COMMUNITY_SEEDING_KIT.md` (templates nuevos);
   futuros: `src/**` solo cuando el canal lo autorice.
3. Invariant preservation: sin URLs nuevas ni cambios de slugs/canonical;
   sin tracking individual; sin copy YMYL tocado por interés comercial.
4. Contract preservation: eventos v2; la instrumentación UTM landing se
   agrega solo con props ya permitidas (`utm_source/medium/campaign`).
5. Boundary/checks: `check:docs`, `format:check`; por canal, el gate de su plan.
6. Test impact: n/a en la fase docs; la instrumentación futura mantiene la
   suite (`analytics-sanitizer`, `data-signals-allowed-events-sync`).
7. Rollback: revert del commit docs; cada canal tiene su propio rollback.
8. Regression risk: BAJO (docs/manual); el riesgo real es de confianza si se
   automatiza o se sobrepromociona → kill criteria por canal.

## STOP / HALT

- Automatizar participación en comunidades → STOP inmediato.
- Publicar datos volátiles como fijos → STOP.
- Prometer resultados comerciales en prensa/comunidades → STOP.
- Tocar superficies en ventana de medición → HALT y esperar cierre.
- Sin métrica o sin kill criteria definidos → no iniciar el canal.

## Cierre del programa

El programa se revisa el 2026-11-02 junto a la decisión de monetización:
qué canal trajo usuarios medibles, cuál no, y si alguno merece presupuesto de
tiempo permanente (`docs/backlog/DECISION-monetization-2026-11-02.md`).

## Progress log

- 2026-09-25 — Programa creado (docs-only) con cuatro canales y métricas;
  pendiente primera corrida de cada uno.
