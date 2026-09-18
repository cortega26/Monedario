# Publish packet — `cotizacion-voluntaria-afp-independiente` (run `20260917-1925-brief01`)

Status: SIGNED
Decision: [x] publish / [ ] hold

> Prepared by agent as unsigned scaffold. No gate is marked. Only the
> HumanEditor may check a box or record the decision. An agent checking
> any gate box violates `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES` and
> `AGENTS.md` hard stops.

## 1. Artifact map

| # | Artifact | Path | State |
|---|---|---|---|
| 00 | Topic intake (Gate 00) | `../../_intake/cotizacion-voluntaria-independiente/00-topic-intake.md` | PROCEDER A BRIEF, 4.33/5 (demanda puntuada de forma conservadora — Ahrefs sin acceso en esa sesión) |
| 01 | Brief | `01-brief.yaml` | Complete (`ymyl=true`, `requires_calculation=true`, `regulatory_sensitivity=alta`, cut-off `2026-09-17`, `canonical_topic=afiliacion-cotizacion-voluntaria` owner, competitive-adaptation fields N/A — sin benchmark) |
| 02 | Dossier | `02-dossier.md` | Complete (13 fuentes fetcheadas; benchmark N/A separado; Source Trust / Prompt Injection Notes limpio, 0 candidatos) |
| 03 | Outline | `03-outline.md` | Complete (respuesta ancla, vigencia, diferenciación local, casos borde) |
| 04 | Draft | `04-draft.md` + `src/data/blog/cotizacion-voluntaria-afp-independiente.md` | Complete. `TODO:SOURCE = 0` en el blog file (verificado por grep en 06-compliance.md). Incluye 3 rondas de corrección documentadas (post-math-audit ronda 1, post-math-audit ronda 2, post-compliance) |
| 05a | Math audit ronda 1 | `05-math-audit.md` | CONDITIONAL → resuelto (3 TODO:SOURCE: 1 con fuente, 2 re-encuadrados como límite honesto) |
| 05b | Math audit ronda 2 | `05-math-audit-round2.md` | CONDITIONAL → resuelto (1 TODO:SOURCE persistente + 1 hallazgo de redacción, ambos corregidos Bucket C) |
| 06 | Compliance | `06-compliance.md` | CONDITIONAL, NORMA_YMYL 8.725/10, 4 DEFECT — DEFECT #1 y #2 resueltos (Bucket C); DEFECT #3 reencuadrado a pedido del usuario (ver ítem 5.1 abajo, requiere decisión humana); DEFECT #4 diferido (no bloqueante) |
| — | Hero image | `public/images/hero/cotizacion-voluntaria-afp-independiente{,@tablet,@mobile}.avif` | Generada manualmente (prompt oficial del proyecto + creación humana externa), convertida y verificada: 1200×630/800×420/600×315, todas < 80 KB |

## 2. Role separation map (`DraftAgent ≠ MathAuditAgent ≠ ComplianceAgent`)

| Stage | Agent / session |
|---|---|
| Gate 00 + 01-brief | Claude Code, sesión de chat con el usuario |
| 02-dossier | Claude Code subagent, sesión fresca — sustituye a ChatGPT (indisponibilidad de tokens) |
| 03-outline, 04-draft (inicial + correcciones Bucket C de las 3 rondas) | Claude Code, misma sesión de chat con el usuario — permitido, comparte instancia con Outline pero no con Math-audit ni Compliance |
| 05-math-audit ronda 1 | Claude Code subagent, sesión fresca, sin exposición al draft — sustituye a ChatGPT |
| 05-math-audit ronda 2 | Claude Code subagent, sesión fresca, sin exposición al draft ni a la ronda 1 — sustituye a ChatGPT |
| 06-compliance | Claude Code subagent, sesión fresca, sin exposición a ninguna sesión anterior |
| 07-publish-packet + firma de gates | HumanEditor — PENDIENTE |

Todas las sustituciones de ChatGPT por subagentes Claude quedaron declaradas
explícitamente en `01-brief.yaml` → `separacion_de_roles`, a pedido expreso
del usuario por indisponibilidad continuada de tokens. Ninguna ronda de
auditoría comparte instancia con la sesión de Draft.

## 3. Gate checklist (HUMAN-ONLY — do not mark unless you are the HumanEditor)

- [x] `TODO:SOURCE = 0` confirmado en el blog file (ya verificado por grep en `06-compliance.md §4`; re-confirmar de todas formas al firmar)
- [x] DEFECT #1 y #2 de `06-compliance.md` verificados como resueltos contra el texto actual (URLs agregadas a "Fuentes oficiales"; nota de `articleLead.limits` sobre art. 92 J reformulada)
- [x] **Decisión sobre DEFECT #3 (ítem que requiere tu juicio, no solo verificación):** el ejemplo numérico de cotización ahora se presenta como desglose de 3 líneas (pensión/comisión/SIS) en vez de un total único confirmado por consulta institucional — ver `04-draft.md §"Reencuadre del DEFECT #3"`. Decide si este reencuadre satisface el requisito de `01-brief.yaml` (`requires_calculation=true`) o si prefieres pausar hasta obtener confirmación directa de la Superintendencia de Pensiones o AFP Planvital.
- [x] `check:frontmatter`, `check:editorial` (estructura/dialecto/reader-facing-copy), `astro check` verdes al momento de firmar (última corrida limpia: 2026-09-17, ver §4)
- [x] `check:article-registration` — 2 WARN no bloqueantes esperados (`dangling_owner`/`orphan_topic` para `afiliacion-cotizacion-voluntaria`) que se resuelven solos al pasar `draft` a `false`; no bloquean sign-off
- [x] `audit:topic-overlap` sin conflicto para este slug/canonicalTopic (confirmado — no aparece en la salida del audit)
- [x] Revisión de imagen hero: contenido visual revisado por un humano (el agente solo verificó dimensiones/peso, no adecuación editorial de la escena)
- [x] Sin cambio de slug/canonical/título fuera de lo declarado en este run (artículo nuevo, sin precedente que romper)
- [x] Registro de `canonicalTopic` en `src/config/editorial-topic-policy.mjs` revisado y aceptado como definitivo (ya aplicado por el agente como paso mecánico del build, no como decisión editorial)
- [x] Prompt-injection review completado (dossier + compliance: 0 candidatos en todas las fuentes fetcheadas)
- [x] Sin conflicto de ownership/cannibalización pendiente (Gate 00 + audit:topic-overlap limpios)
- [x] `draft: false` — cambio de este campo en el frontmatter (acción del HumanEditor o de quien este autorice explícitamente después de firmar, no de este agente)
- [x] Decisión publish/hold registrada arriba en este archivo
- [x] (No bloqueante, sugerido) Registrar DEFECT #4 — ids de datos volátiles (IMFNR, tasa SIS) en `editorial-volatile-data-registry.json` — puede hacerse antes o después de publicar

## 4. Command evidence (re-run at sign time)

- `pnpm run check:frontmatter` — OK, 54 artículos escaneados, 0 errores bloqueantes (2026-09-17, última corrida de esta sesión)
- `pnpm astro check` — 0 errores, 0 warnings, 0 hints (575 archivos)
- `pnpm run check:editorial` (estructura + dialecto + reader-facing-copy + artifacts) — OK; único warning es de longitud de descripción en otros 2 artículos preexistentes, no en este
- `pnpm run check:article-registration` — `blocking=0`; 2 WARN esperados y explicados arriba (§3)
- `pnpm run audit:topic-overlap` — sin entrada para este slug en la salida (sin conflicto detectado)
- `pnpm run check:hero-images` — no evalúa artículos `draft: true` (excluidos del gate de "publicados"); dimensiones/peso verificados manualmente por el agente (§1)
- `check:routes` / `check:rss`: NO EJECUTADOS — son gates de build/release; no aplican mientras `draft: true`. Re-ejecutar al momento de pasar a `draft: false`.

## 5. Known residual risks accepted or deferred (human judgment)

1. **DEFECT #3 (ver §3):** el desglose de 3 líneas del ejemplo numérico es una composición propia a partir de reglas verificadas por separado, no una cifra oficial ya combinada — decisión de producto explícita del usuario, no una verificación técnica adicional.
2. El texto operativo completo del art. 92 J del DL 3.500 no se reproduce (BCN LeyChile bloqueado por render JS, 3 intentos documentados); el contenido operativo sí está cubierto por fuentes alternativas oficiales (Compendio de Normas, spensiones.cl). Declarado como límite explícito en `articleLead.limits`.
3. Número exacto de oficio/circular que fija la tasa SIS en 1,62% no se cita (solo corroborado por fuente secundaria no oficial); la tasa y fecha de vigencia sí están verificadas en fuente oficial. No afecta ninguna cifra del artículo.
4. DEFECT #4 (datos volátiles sin registrar) — no bloqueante, infraestructura pendiente.

## 6. Human sign-off (HUMAN-ONLY)

- HumanEditor: Carlos Ortega
- Date: 17/09/2026
- Decision (publish / hold + conditions): publish
- Signature (gate boxes above checked by hand): Carlos Ortega
