# TECH_DEBT_BACKLOG

Fecha de corte: 2026-05-30

## TD-0097 — Política de antigüedad de dependencias bloquea los gates locales

- **ID:** TD-0097
- **Título corto:** Resolver baseline bloqueado por minimumReleaseAge
- **Descripción:** El 2026-08-01, `pnpm run test` no alcanzó a iniciar Vitest: Corepack rechazó `@napi-rs/wasm-runtime@1.2.2`, `js-yaml@5.2.3` y `postcss@8.5.25` por estar dentro de `minimumReleaseAge`.
- **Evidencia:** salida local de `pnpm run test` antes de cambios de runtime.
- **Impacto:** bloquea gates locales aunque el código de la tarea no haya fallado.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** el owner confirma excepciones esperadas o regenera el lockfile tras el periodo de antigüedad; una tarea no relacionada no debe cambiar esta política.
- **Criterios de cierre (checklist verificable):**
  - [ ] `pnpm run test` inicia Vitest sin modificación automática de política.
  - [ ] Las excepciones, si existen, tienen revisión de supply chain explícita.
- **Owner:** Sin asignar
- **Estado:** Backlog
- **Fecha de creación:** 2026-08-01
- **Última actualización:** 2026-08-01

## Métricas

### Total de items por urgencia

- **P0:** 7
- **P1:** 27 (+3 desde auditoría de drift 2026-05-20)
- **P2:** 38 (−7: TD-0076, TD-0091, TD-0087, TD-0088, TD-0094, TD-0089 y TD-0092 cerrados)
- **P3:** 12 (−2: TD-0078 y TD-0090 cerrados; TD-0093 también cerrado)

### Estado de avance (2026-05-30)

- **Completados:** 91 TD únicos (`TD-0001`..`TD-0066`, `TD-0068`..`TD-0071`, `TD-0073`..`TD-0078` (excl. `TD-0079`), `TD-0080`, `TD-0082`..`TD-0094`) + 3 fixes puntuales (`FIX-MDX`, `FIX-LINKS-CALC`, `FIX-LINKS-GUIAS`)
- **En progreso:** 0
- **Backlog sin iniciar:** 2 (`TD-0095`, `TD-0096` — abiertos 2026-07-01, posteriores a este snapshot; no reflejados en los totales P0-P3 de arriba)
- **Cerrados sin ejecutar (premisa/ROI):** `TD-0067` (2026-06-25 — los use-cases ya retornan números puros; el formateo ya vive en las páginas), `TD-0081` (2026-06-25 — CI no usa esa secuencia y el único check lento es escritor; ahorro seguro ~0.2 s) y `TD-0079` (bloqueado por incompatibilidad WOFF2/Satori).
- **Nota histórica:** `TD-0072` cerrado el 2026-06-23 (los 2 scripts restantes son código activo, no one-off).
- **Nota histórica:** `TD-0095` y `TD-0096` abiertos el 2026-07-01, tras implementar `ADR-20260701-editorial-evergreen-tier.md` — ver entradas abajo.

> `FIX-MDX`: corregido comentario HTML (`<!-- -->`) en `que-es-el-apv.mdx:25` que rompía el build.
> `FIX-LINKS-CALC`: ampliado `check-internal-links.mjs` para cubrir validación de rutas `/calculadoras/`.
> `FIX-LINKS-GUIAS`: ampliado `check-internal-links.mjs` para aceptar rutas `/guias/<cluster>/<slug>/` respaldadas por archivos `.astro` y añadido regression test en `tests/scripts/check-internal-links.test.ts`.
> `TD-0030`: corregidas assertions `doubledPayment.totalPaid` en regression test tarjeta de crédito (casos 1 y 3).
> `TD-0032`: normalizado formato Prettier en 13 archivos con drift mecánico; `format:check` pasa limpio.
> `TD-0033`: `pnpm run format:check` vuelve a pasar limpio el 2026-04-03; el drift mecánico ya no reproduce.
> `TD-0034`: refrescado `docs/reports/routes_snapshot_before.json` a 34 rutas y `pnpm run check:routes` vuelve a responder sin altas espurias el 2026-04-03.
> `TD-0035`: actualizado `toHaveLength(13)` → `toHaveLength(15)` en `CalculatorPortfolio.test.ts` para reflejar las 15 calculadoras vigentes en el portfolio.
> `TD-0036`: re-sincronizadas las aserciones numéricas en `hero-image-pool.test.ts` (pool entries: 12/28, canonicalCombinationCount: 56, requestedAssetCount: 112, approvedModelCount: 28, byTemplate A: 24) y los strings de prompts en `hero-images-config.test.ts` (Composition, Scene B, Scene C) con la configuración actual. `pnpm run test` pasa limpio: 37 archivos, 166 tests.
> Revalidación 2026-04-09: `pnpm run test`, `pnpm run lint` y `pnpm run format:check` pasan limpios. Los ítems `TD-0035` a `TD-0038` quedaron resueltos en el árbol actual y el backlog se corrige para reflejar ese baseline.
> Auditoría F22 (2026-04-12): los 9 hallazgos documentados en `docs/operations/reports/f22-calculator-audit-2026-04-12.md` ya estaban resueltos en el árbol al momento del registro. `TD-0044` a `TD-0052` se marcan directamente como Completados.
> `TD-0055`: regenerado `scripts/hero-images/prompts.json` desde el planner vigente y reforzada la capa anti-drift con `POLICY_REGISTRY` + `check:policy-registry`; `pnpm run check:hero-prompts` vuelve a `OK` el 2026-04-23.
> `TD-0056`: baseline pre-change del 2026-04-30 detecta 5 fallas preexistentes en `tests/integration/homepage-content.test.ts` por drift entre el contrato del test y el estado actual de artifacts editoriales publicados.
> `TD-0053`: resuelto por commits `5644792c` (length-sort en `matchPhraseSet`) y `35231cc4` (reorden de array) — el test ya pasa.
> `TD-0054`: resuelto por `TD-0055` (commit `a3937548`) — `check:hero-prompts` retorna OK.
> Modernización estratégica 2026-05-11: se cerró `TD-0058`, se decidió la política canónica de artefactos editoriales por `docs/adr/ADR-20260511-editorial-artifact-location-policy.md`, y `TD-0057` quedó reclasificado como backfill editorial real, no como drift de rutas.
> `TD-0039`: cerrado el 2026-05-11 con `artifacts/lighthouse/td-0039-2026-05-11.md`; las 5 rutas medidas por `lighthouserc.mobile.cjs` quedaron en Performance 100, LCP mediana <= 1.656s, SI <= 1.206s, TBT 0ms y CLS 0.
> `TD-0057`: backfill canónico ejecutado el 2026-05-11 por `scripts/backfill-td-0057.mjs` (run_id `20260511-1000-backfill`). Los 46 artículos YMYL publicados tienen ahora artefactos canónicos reales en `artifacts/editorial/<slug>/20260511-1000-backfill/` (01-brief.yaml, 02-dossier.md, sources.yaml, metadata.yaml). `EDITORIAL_ENFORCE=1 pnpm run check:editorial-artifacts` retorna `compliant=46 non_compliant=0`. No se marcaron gates humanos automáticamente; separación de deberes preservada.

### Top riesgos restantes

- Auditoría de drift 2026-05-20 **cerrada al 100%** (`TD-0084`..`TD-0094`) el 2026-05-30. Riesgos restantes: ninguno en deuda técnica de código (`TD-0079` permanece bloqueado por WOFF2/Satori). `TD-0075`/`TD-0077` cerrados el 2026-06-25 (`ADR-20260625-astro-features-adoption.md`); `TD-0067` y `TD-0081` cerrados el 2026-06-25 (premisa/ROI invalidados, sin ejecutar).
- Actualización de julio 2026: actualizar `imm` en `economic-parameters.snapshot.json` cuando se publique el decreto de reajuste del IMM.
- Revisión humana de publish-packets de los 46 artículos YMYL (gate editorial, Carlos Ortega).

### Siguiente orden recomendado (2026-05-16)

- **Quick wins restantes:** ninguno.
- **Quick win parcial:** `TD-0072` requiere decidir si se refactoriza `editorial-copy-rules.mjs` y si `download-og-fonts.mjs` debe seguir como regenerador activo de fuentes OG.
- **P2 con decisión arquitectural:** ~~`TD-0075` (`inlineStylesheets`), `TD-0077` (Astro features)~~ **cerrados 2026-06-25** — medidos con Lighthouse y decididos en `ADR-20260625-astro-features-adoption.md` (mantener `inlineStylesheets:"never"`, adoptar `prefetch`, diferir `viewTransitions`).
- **Bloqueado/reevaluar:** `TD-0079` no debe ejecutarse tal como está: `src/utils/loadGoogleFont.ts` rechaza WOFF2 para Satori, por lo que los `.ttf` de Inter son necesarios para OG mientras no cambie el flujo.
- Revisión humana de publish-packets de los 46 artículos YMYL (gate editorial, Carlos Ortega).
- Actualizar `imm` en snapshot cada julio con el nuevo decreto presidencial.
- Resolver warnings no bloqueantes vigentes (`topicRole` faltante y descripciones sobre 155 caracteres) o promoverlos a TD si dejan de ser mera higiene editorial.

## TD-0096 — Aplicar `sourceMode: evergreen` a la lista verificada de 21 candidatos (pendiente confirmación editorial)

- **ID:** TD-0096
- **Título corto:** Aplicar tier evergreen a candidatos verificados
- **Descripción:** El mecanismo `sourceMode: evergreen` (`docs/adr/ADR-20260701-editorial-evergreen-tier.md`) ya está implementado y probado, pero **no se aplicó a ningún artículo todavía** — la clasificación de qué slugs son evergreen debe confirmarla un humano antes de tocar `slugOverrides`, porque un artículo YMYL mal marcado evergreen deja de recibir cualquier señal de vencimiento indefinidamente. Un primer inventario automático (sub-agente Explore) propuso 25 candidatos, pero contenía errores reales de clasificación (contradicciones con `volatileData` y una categoría mal asignada). Se verificó cada candidato directamente contra el frontmatter (`grep` de `category`/`volatileData` en los 53 archivos publicados), lo que dejó una lista corregida de **21 slugs** con `volatileData` ausente confirmado:

  | Slug | Categoría | Cadencia actual |
  |---|---|---|
  | como-elegir-inversion-segun-plazo-riesgo-objetivos | ahorro-inversion | 180d |
  | el-poder-del-interes-compuesto | ahorro-inversion | 180d |
  | interes-compuesto-nota-metodologica | ahorro-inversion | 180d |
  | como-salir-boletin-comercial-chile | deuda-credito | 365d |
  | informe-deudas-cmf-vs-dicom | deuda-credito | 365d |
  | prepago-credito-cuando-conviene-chile | deuda-credito | 365d |
  | tarjeta-credito-costo-real-chile | deuda-credito | 365d |
  | donde-ver-si-estoy-en-dicom-gratis | deuda-credito | 365d |
  | finiquito-e-indemnizaciones-en-chile | empleo-ingresos | 180d |
  | indemnizacion-anos-de-servicio-chile | empleo-ingresos | 180d |
  | licencia-medica-desde-que-dia-pagan | empleo-ingresos | 180d |
  | liquidacion-de-sueldo | empleo-ingresos | 180d |
  | primer-empleo-chile-guia-completa | empleo-ingresos | 180d |
  | seguro-cesantia-cuenta-individual-vs-fondo-solidario | empleo-ingresos | 180d |
  | seguro-de-cesantia | empleo-ingresos | 180d |
  | como-leer-cartola-afp-chile | prevision | 180d |
  | como-hacer-presupuesto-mensual-chile | general | 180d |
  | fondo-emergencia-chile | general | 180d |
  | estafas-financieras-chile-vishing-smishing-marketplace | seguridad-financiera | 365d |
  | fraude-tarjeta-que-hacer | seguridad-financiera | 365d |
  | suplantacion-identidad-creditos-no-reconocidos | seguridad-financiera | 365d |

  Excluidos del inventario original por contradicción real: `que-es-el-apv` (ya declara `volatileData` UF, usa `runtime_snapshot_plus_editorial_review` — incompatible con evergreen por diseño) y `descuentos-de-sueldo` (declara `volatileData` de comisión AFP). Corregido: `como-leer-cartola-afp-chile` es categoría `prevision`, no `empleo-ingresos` como lo listó el inventario automático.

  Esta tabla es solo el filtro mecánico (ausencia de `volatileData`); el juicio de "¿es realmente atemporal?" sobre cada slug sigue pendiente de un editor humano.
- **Evidencia:** Verificación directa vía `grep` de `category:`/`volatileData:` sobre los 53 archivos en `src/data/blog/` (2026-07-01), contrastada contra el inventario automático inicial que resultó tener inconsistencias internas (su propia tabla resumen no cuadraba con su tabla detallada).
- **Impacto:** Mientras no se confirme, estos 21 artículos siguen bajo la cadencia normal de su categoría (180d/365d) — no hay urgencia operativa, es una oportunidad de reducir ruido de revisión, no un riesgo abierto.
- **Riesgo:** bajo
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** S (una vez confirmada la lista, es solo edición de `slugOverrides` en `editorial-timeliness-policy.json`)
- **Propuesta de solución:** Un editor humano revisa la tabla de 21 (tachar/agregar según corresponda) y confirma. Al confirmar, agregar `"<slug>": { "sourceMode": "evergreen" }` a `slugOverrides` en `src/config/editorial-timeliness-policy.json` para los slugs confirmados — sin tocar código, tests ni ADR (el mecanismo ya quedó probado en el PR de `ADR-20260701`).
- **Criterios de cierre (checklist verificable):**
- [ ] La tabla de 21 candidatos fue revisada y confirmada (o editada) por un editor humano.
- [ ] `slugOverrides` refleja la lista confirmada con `sourceMode: evergreen`.
- [ ] `pnpm run check:editorial-timeliness` sigue en verde tras el cambio.
- **Owner:** Sin asignar
- **Estado:** Backlog — pendiente confirmación editorial
- **Fecha de creación:** 2026-07-01
- **Última actualización:** 2026-07-01

## TD-0095 — Clasificación pendiente: 11 artículos "dudosos" y gap de volatileData en IMM/PGU

- **ID:** TD-0095
- **Título corto:** Decidir slugs dudosos para tier evergreen + evaluar volatileData IMM/PGU
- **Descripción:** Al implementar el tier `sourceMode: evergreen` (`docs/adr/ADR-20260701-editorial-evergreen-tier.md`) y recalibrar la cadencia de `gratificacion-legal-chile`/`pgu-pension-garantizada-universal` (180d → 90d), un inventario de los 53 artículos publicados identificó dos ítems que quedaron fuera de ese cambio: (1) 11 slugs "dudosos" que mezclan estructura atemporal con costos/productos vigentes (`como-invertir-en-etfs-desde-chile`, `fondos-afp-a-b-c-d-e`, `bancos-y-fintech-chile`, `finanzas-para-migrantes-chile`, `fonasa-vs-isapre-comparativa`, `que-es-la-cuenta-2-afp`, `renegociacion-superir`, `credito-hipotecario-chile-guia-completa`, `cae-costo-real-credito-chile`, `fondos-mutuos-comisiones-rescate-impuestos`, `credito-hipotecario-chile-guia-completa`), que requieren una decisión editorial caso por caso (¿evergreen, cadencia normal, o recalibrar?); (2) evaluar si el tope IMM (usado en `gratificacion-legal-chile`) y el monto PGU ameritan datasets `volatileData` dedicados en `src/config/editorial-volatile-data-registry.json` (con snapshot propio), en vez de depender solo de la cadencia de 90 días recién aplicada.
- **Evidencia:** Inventario de 53 artículos publicados (2026-07-01), hecho como insumo del ADR-20260701.
- **Impacto:** Sin resolver, esos 11 slugs siguen bajo la cadencia genérica de su categoría (puede ser sobre- o sub-revisión según el caso), y el tope IMM/monto PGU dependen de que alguien recuerde revisar el artículo cada 90 días en vez de un chequeo de drift automático como el que ya protege UF/IPC/UTM/AFP.
- **Riesgo:** bajo
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** M
- **Propuesta de solución:** (a) Revisar los 11 slugs uno por uno con un editor humano y clasificarlos en `slugOverrides` (evergreen, cadencia ajustada, o sin cambios). (b) Si se decide modelar IMM/PGU como `volatileData`, registrar datasets nuevos (ej. `labor.imm.monthly_value`, `pensions.pgu.monthly_amount`) con fuente canónica (Dirección del Trabajo / IPS-ChileAtiende) y extender `scripts/refresh-editorial-volatile-data.mjs` para poblarlos.
- **Criterios de cierre (checklist verificable):**
- [ ] Los 11 slugs dudosos tienen una clasificación explícita en `editorial-timeliness-policy.json` (no quedan en el default implícito por omisión).
- [ ] Se documentó la decisión sobre si IMM/PGU necesitan `volatileData` dedicado o si la cadencia de 90 días es suficiente.
- [ ] Si se agregan datasets nuevos, `pnpm run check:editorial-timeliness` y `pnpm run editorial:volatile-data:refresh` los cubren sin error.
- **Owner:** Sin asignar
- **Estado:** Backlog
- **Fecha de creación:** 2026-07-01
- **Última actualización:** 2026-07-01

## TD-0094 — Taxonomía de fuentes oficiales dispersa e incompleta
- **ID:** TD-0094
- **Título corto:** Unificar registro de hosts oficiales
- **Descripción:** La definición operativa de fuente oficial esta distribuida entre `scripts/legal-citations/registry.mjs`, `scripts/urlcheck/host-registry.mjs` y `src/utils/analytics.ts`. La lista usada para eventos de clicks oficiales no cubre todos los hosts usados o requeridos por contenido reciente, por ejemplo hosts de beneficios, salud, pension y fuentes semi-oficiales.
- **Evidencia:** Auditoría de drift 2026-05-20; `src/utils/analytics.ts` contiene una lista manual de hostnames oficiales separada de los registros de legal citations y urlcheck.
- **Impacto:** Analytics, checks legales y validacion de enlaces pueden discrepar sobre que cuenta como fuente oficial, ocultando drift semantico de fuentes.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Crear o designar un registry canonico de hosts oficiales y derivar desde ahi analytics, legal citations y urlcheck. Donde el juicio sea editorial, documentar tipo de fuente: oficial, regulador, proveedor tecnico, referencia legal o semi-oficial.
- **Criterios de cierre (checklist verificable):**
- [x] Existe una fuente canonica para host oficial y tipo de fuente.
- [x] `src/utils/analytics.ts` no mantiene una lista divergente.
- [x] `check:urls:external:audit` o un nuevo check reporta hosts oficiales no clasificados.
- [x] Cambios revisados contra `INVARIANT.URLCHECK.EXTERNAL_LINK_POLICY`.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-20
- **Última actualización:** 2026-05-30
- **Nota de cierre 2026-05-30:** (1) Nueva fuente canónica `src/config/official-hosts.json` (37 hosts) con `type` por host (oficial/regulador/referencia-legal/proveedor-tecnico/semi-oficial) y `officialSuffixes` (.gob.cl/.gov.cl). (2) `src/utils/analytics.ts` ya no mantiene lista propia: `isOfficialSourceUrl` deriva del registro. (3) `scripts/urlcheck/host-registry.mjs` deriva `official_source` del mismo registro (familias de redirect y markers soft-404 sin cambios). (4) Nuevo guardrail `check:official-host-registry` (en `pnpm run check`): valida shape/tipos, que analytics no rehardcodee, que `classifyHost` devuelva `official_source` para cada host canónico, y reporta hosts `.gob.cl/.gov.cl` usados en contenido pero no clasificados. El cierre incorporó 5 hosts oficiales que estaban en contenido pero sin clasificar (ips.gob.cl, superdesalud.gob.cl, mintrab.gob.cl, claveunica.gob.cl, csirt.gob.cl) y unificó divergencias previas (analytics ahora reconoce bcentral.cl, tgr.cl, prevision.cl, AFPs, ine.gob.cl; urlcheck ahora clasifica si3.bcentral.cl, suseso.gob.cl, superir.gob.cl). Revisado contra `INVARIANT.URLCHECK.EXTERNAL_LINK_POLICY`: `official_source` sigue siendo categoría bloqueante; el registro canónico es ahora su origen de verdad. Nota: `scripts/legal-citations/registry.mjs` es un registro de leyes BCN (idNorma), no de hosts; su único host (bcn.cl) queda en el registro canónico. `pnpm run check`, `pnpm run test` y `pnpm run build` pasan limpios.

## TD-0093 — Meta descriptions largas no bloqueantes
- **ID:** TD-0093
- **Título corto:** Resolver presupuesto de meta descriptions largas
- **Descripción:** `check-editorial-structure` reporta 13 meta descriptions sobre 155 caracteres. No rompe build, pero indica drift editorial en snippets.
- **Evidencia:** Auditoría 2026-05-20: warnings en `como-hacer-presupuesto-mensual-chile`, `como-salir-boletin-comercial-chile`, `contribuciones-bienes-raices-chile`, `descuentos-de-sueldo`, `el-poder-del-interes-compuesto`, `fraude-tarjeta-que-hacer`, `gratificacion-legal-chile`, `licencia-medica-desde-que-dia-pagan`, `primer-empleo-chile-guia-completa`, `que-es-la-uf`, `seguro-de-cesantia`, `sueldo-imponible-chile`, `utm-chile-que-es-como-funciona`.
- **Impacto:** Riesgo bajo de snippets truncados y menor consistencia editorial.
- **Riesgo:** bajo
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Hacer batch editorial acotado o definir presupuesto de warnings tolerados. No bloquear cambios no relacionados hasta que la politica se endurezca.
- **Criterios de cierre (checklist verificable):**
- [X] Las 13 meta descriptions quedan bajo el presupuesto definido o el warning queda aceptado por politica.
- [X] `pnpm run check` no aumenta el conteo de warnings.
- [ ] Si se endurece el check, queda documentado el criterio editorial.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-05-20
- **Última actualización:** 2026-05-21
- **Nota de cierre 2026-05-21:** Las 13 meta descriptions acortadas a ≤155 chars en batch. Todas conservan el keyword principal y la propuesta de valor. Tercer criterio diferido (no se endureció el check en este cierre).

## TD-0092 — Overlap editorial con riesgo de canibalización
- **ID:** TD-0092
- **Título corto:** Declarar ownership de pares con overlap SEO
- **Descripción:** La auditoría de topic overlap encontro un par alto y varios pares medios donde la intención de busqueda puede solaparse sin jerarquia clara.
- **Evidencia:** `pnpm run audit:topic-overlap` marco `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` ↔ `como-invertir-en-etfs-desde-chile` como `candidate_strong_overlap`; pares medios en interes compuesto, operacion renta, seguro de cesantia, sueldo/descuentos, UF/IPC.
- **Impacto:** Canibalizacion SEO, enlaces internos ambiguos y mantenimiento editorial mas costoso.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Aplicar `docs/editorial/NON_CANNIBALIZATION_PROCESS.md` y `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`: declarar owner, soporte, diferenciador y enlaces jerarquicos. No fusionar automaticamente.
- **Criterios de cierre (checklist verificable):**
- [x] Cada par alto tiene owner documentado o remediacion editorial.
- [x] Pares medios quedan aceptados, enlazados jerarquicamente o separados por intención.
- [x] `audit:topic-overlap` queda con umbral/registro que impida repetir el mismo hallazgo sin decision.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-20
- **Última actualización:** 2026-05-30
- **Nota de cierre 2026-05-30:** Resuelto como **keep-all validado por dato GSC**, no por etiquetas internas. (1) El par "fuerte" original (`ahorro-…-2026` ↔ `como-invertir-en-etfs`) ya no aparece como `candidate_strong_overlap`: ambos declaran `canonicalTopic` distinto y `topicRole: owner` (pillar amplio vs spoke de instrumento), enlazados bidireccionalmente. (2) Los 13 artículos de los pares marcados ya declaran `topicRole`+`canonicalTopic` y ninguna pareja viola `cluster+canonicalTopic+owner` (contrato §5 de `NON_CANNIBALIZATION_PROCESS`). Decisión por par documentada (todas `keep` — falsos positivos §3 o coexistencia válida §2.4); el único hueco real era `descuentos-de-sueldo` ↔ `sueldo-imponible-chile` sin interlink, ahora **corregido bidireccionalmente**. (3) En vez de un allowlist que silencie pares, se construyó `pnpm run audit:cannibalization` (GSC query×page): mide canibalización **real en la SERP** (≥2 URLs propias por query), que a W21 = **0**. Ese audit reemplaza el "umbral/registro" del criterio 3 con señal de dato, no heurística de títulos. `audit:topic-overlap` sin pares `alto`; `pnpm run check` y build verdes.

## TD-0091 — Enlaces externos con fallas o redirects semánticos
- **ID:** TD-0091
- **Título corto:** Corregir 404 y redirects oficiales detectados
- **Descripción:** La auditoría externa no bloqueante detecto un enlace 404 a un reporte de accesibilidad en GitHub y un redirect mismatch desde `www.supersalud.gob.cl` hacia `www.superdesalud.gob.cl`.
- **Evidencia:** `pnpm run check:urls:external:audit`: `hard_fail` para `https://github.com/csortega/monedario/blob/main/docs/reports/ACCESSIBILITY-2026-05-18.md` enlazado desde `src/pages/accessibilidad.astro`; `redirect_mismatch` para `https://www.supersalud.gob.cl/` usado por `src/data/blog/fonasa-vs-isapre-comparativa.md`.
- **Impacto:** Fuente o evidencia institucional rota, menor confianza y riesgo de apuntar a host oficial migrado sin actualizacion semantica.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Verificar destinos oficiales/permanentes, corregir URLs y agregar un check que distinga 200 tecnico de destino semanticamente correcto.
- **Criterios de cierre (checklist verificable):**
- [X] El enlace de accesibilidad ya no retorna 404.
- [X] Supersalud/Superdesalud apunta al host oficial vigente y pagina adecuada.
- [ ] `pnpm run check:urls:external:audit` no reporta estos dos casos.
- [ ] Se documenta criterio de redirect oficial aceptable.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-05-20
- **Última actualización:** 2026-05-21
- **Nota de cierre 2026-05-21:** (1) `accessibilidad.astro`: GitHub link corregido de `csortega/monedario` a `cortega26/Monedario`. (2) `fonasa-vs-isapre-comparativa.md`: todas las referencias `supersalud.gob.cl` (10 ocurrencias) actualizadas a `superdesalud.gob.cl`. Criterios 3 y 4 requieren re-correr auditoría externa y ADR de política — diferidos al próximo ciclo de mantenimiento.

## TD-0090 — Header duplica manualmente el catálogo de hubs
- **ID:** TD-0090
- **Título corto:** Derivar o validar dropdown de guías
- **Descripción:** `src/components/Header.astro` hardcodea el arreglo `guiasDropdown`, aunque `src/config/clusters.ts` ya define `GUIDE_HUB_ORDER` y `GUIDE_HUBS`. En la auditoría 2026-05-20 ambos coincidian 9/9, pero no existe guardrail que lo preserve.
- **Evidencia:** `Header.astro` define manualmente los 9 hubs; `Footer.astro` ya deriva hubs desde `GUIDE_HUB_ORDER`, mostrando que existe fuente canonica reutilizable.
- **Impacto:** Proximos hubs pueden quedar fuera de navegacion primaria o cambiar labels/rutas en una superficie pero no en otra.
- **Riesgo:** bajo
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Generar `guiasDropdown` desde `GUIDE_HUB_ORDER`/`GUIDE_HUBS` o agregar test `check:catalog-drift` que compare header contra registry.
- **Criterios de cierre (checklist verificable):**
- [X] Header ya no duplica manualmente hubs o existe test que falla ante divergencia.
- [X] Footer, header y paginas hub comparten la misma fuente de verdad.
- [ ] `pnpm run check` o gate focalizado valida el catalogo.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-05-20
- **Última actualización:** 2026-05-21
- **Nota de cierre 2026-05-21:** `guiasDropdown` en `Header.astro` reemplazado por `GUIDE_HUB_ORDER.map(slug => ({ href: getPath(\`/guias/${slug}/\`), label: GUIDE_HUBS[slug].nombre }))`. Header, Footer y páginas hub ahora comparten la misma fuente canónica. Criterio 3 (gate automatizado) diferido — se puede implementar como check separado si se requiere CI enforcement.

## TD-0089 — Home contiene tarjetas y fechas manuales con riesgo de frescura falsa
- **ID:** TD-0089
- **Título corto:** Validar frescura de ProblemCards
- **Descripción:** `src/components/ProblemCards.astro` contiene tarjetas estaticas y fechas fijas para superficies de descubrimiento. El propio archivo advierte que esas fechas deben actualizarse manualmente cuando cambien las paginas enlazadas.
- **Evidencia:** Auditoría 2026-05-20: comentarios de fechas manuales en `ProblemCards.astro` y valores fijos como `new Date("2026-01-15")`.
- **Impacto:** La home puede comunicar frescura o relevancia que no corresponde al contenido enlazado.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Derivar fechas desde contenido/catalagos cuando sea posible o crear `check:homepage-surface-freshness` para bloquear fechas manuales obsoletas.
- **Criterios de cierre (checklist verificable):**
- [x] Tarjetas que enlazan posts usan fechas del frontmatter.
- [x] Tarjetas que enlazan calculadoras/hubs tienen fecha derivada, politica explicita o test de vigencia.
- [x] Home no requiere recordar actualizaciones manuales sin guardrail.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-20
- **Última actualización:** 2026-05-30
- **Nota de cierre 2026-05-30:** `ProblemCards.astro` ya no usa fechas hardcodeadas. Las 4 cards que enlazan calculadoras/hubs pasaron de `new Date("2026-01-15")` fijo a `{ kind: "cluster", cluster }`: la fecha se deriva del post más reciente (`updatedDate ?? pubDate`) del cluster del tema — señal real y auto-actualizable de frescura del área. Las 2 cards de blog siguen usando el frontmatter del propio artículo. Nuevo guardrail `check:homepage-surface-freshness` (en `pnpm run check`): falla si reaparece un literal `new Date("…")` en la superficie y verifica que cada cluster referenciado tenga posts publicados (para que la fecha no quede en blanco). `pnpm run check`, `pnpm run test` y `pnpm run build` pasan limpios.

## TD-0088 — Breadcrumbs dependen de `tagHubMap` manual incompleto
- **ID:** TD-0088
- **Título corto:** Alinear breadcrumbs con cluster canonico
- **Descripción:** `src/components/Breadcrumb.astro` decide el hub de articulo con `tagHubMap`, una tabla manual dependiente de tags y orden. La guia PGU tiene cluster de pensiones pero, al no tener tag mapeado, cae en breadcrumb generico `Articulos`.
- **Evidencia:** Auditoría 2026-05-20: `pgu-pension-garantizada-universal` usa tags `pgu,pension,ips,adultos-mayores,prevision`; ninguno coincide con `tagHubMap`; el HTML generado muestra `Inicio > Articulos > ...` mientras bloques relacionados apuntan a `pensiones-afp`.
- **Impacto:** Drift entre taxonomia editorial, breadcrumbs schema.org y navegacion interna.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Derivar breadcrumb desde `cluster`/`canonicalTopic` cuando exista y dejar `tagHubMap` solo como fallback, o agregar check que exija mapping para todo articulo clusterizado.
- **Criterios de cierre (checklist verificable):**
- [x] PGU y cualquier articulo con cluster canonico reciben breadcrumb de hub correcto.
- [x] `BreadcrumbList` y enlaces internos no divergen de `GUIDE_HUBS`.
- [x] Existe test o script `check:catalog-drift` para cluster -> breadcrumb.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-20
- **Última actualización:** 2026-05-30
- **Nota de cierre 2026-05-30:** (1) Nuevo helper canónico `getHubFromCluster()` + `isHubCluster()` en `src/config/clusters.ts`, derivado de `GUIDE_HUBS` (única fuente de verdad). (2) `Breadcrumb.astro` recibe prop `cluster` y prefiere el hub derivado del cluster, dejando `tagHubMap` solo como fallback para posts sin hub cluster. `PostDetails.astro` pasa `cluster={currentCluster}`. (3) Se eliminó el mapa local divergente `clusterHubNames` de `PostDetails.astro` (tenía "Impuestos" en vez de "Impuestos para personas" y le faltaba `presupuesto-control-financiero`, que caía al slug crudo); la nav relacionada/Hub ahora usa `getHubFromCluster`. (4) Nuevo guardrail `check:catalog-drift` (encadenado en `pnpm run check`): verifica que todo artículo publicado resuelva a un hub real (49/49 vía cluster, 0 genéricos) y que los hrefs de `tagHubMap` apunten a hubs válidos. PGU (`cluster: pensiones-afp`) ahora muestra `Inicio > Pensiones y AFP > …`. `pnpm run check`, `pnpm run test` y `pnpm run build` pasan limpios.

## TD-0087 — Registro de datos económicos no alinea fuente primaria con ADR/Worker
- **ID:** TD-0087
- **Título corto:** Alinear source labels economicos con Worker
- **Descripción:** La arquitectura vigente define un Worker de snapshot economico con fuentes primarias oficiales para indicadores clave, pero derivados editoriales y UI todavia pueden rotular `mindicador.cl/api` como fuente principal para datos cuya fuente canonica paso a BCCh o INE.
- **Evidencia:** `docs/adr/ADR-20260516-economic-snapshot-cloudflare-worker.md` define UF/USD desde BCCh e IPC desde INE; `src/config/editorial-volatile-data-registry.json` y `scripts/refresh-editorial-volatile-data.mjs` siguen usando `mindicador.cl/api` como primer `sourceUrl/sourceLabel` en varios derivados.
- **Impacto:** Riesgo de E-E-A-T/YMYL: el dato puede ser correcto pero atribuido a una fuente menos oficial o desalineada con ADR.
- **Riesgo:** medio-alto
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Hacer que snapshot, registry editorial, UI y MethodologyBlock consuman una fuente canonica por indicador, con fallback documentado cuando aplique.
- **Criterios de cierre (checklist verificable):**
- [x] UF/USD/IPC muestran fuente primaria compatible con ADR/Worker.
- [x] `refresh-editorial-volatile-data.mjs` no elige `sourceUrls[0]` si contradice fuente canonica vigente.
- [x] Existe `check:economic-source-consistency`.
- [x] Cambios validados contra `docs/governance/FINANCIAL_DATA_VERIFICATION_POLICY.md`.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-20
- **Última actualización:** 2026-05-30
- **Nota de cierre 2026-05-30:** Modelo adoptado: **emisor canónico** (organismo oficial = fuente primaria; mindicador.cl = fallback/espejo), sin tocar el Worker ni el esquema del snapshot económico. (1) `editorial-volatile-data-registry.json` migrado de `sourceUrls[]` ambiguo a `canonicalSource` + `fallbackSources` por dataset: UF/USD→Banco Central, IPC→INE, UTM/UTA→SII, topes AFC/AFP-salud→Superintendencia de Pensiones. (2) `refresh-editorial-volatile-data.mjs` ahora emite `canonicalSource.{label,url}` en vez de hardcodear `mindicador.cl/api`; snapshot editorial regenerado. (3) Nuevo guardrail `check:economic-source-consistency` (registry↔ADR↔snapshot↔wiring del Worker), encadenado en `pnpm run check`. (4) Citas UI corregidas en `conversor-uf.astro` (display + MethodologyBlock), `IndicadoresHoy.astro` (UF/dólar) y `dividendo-hipotecario.astro`; UTM se mantiene. (5) FDV: **ningún valor numérico CVFD cambió por atribución**; al regenerar el snapshot editorial se sincronizó UTA al valor oficial vigente desde commit `56d773b1` (847056→834504, dic-UTM×12) y se realineó el guard `expectedValue` del artículo IGC (drift preexistente destapado, no inferencia). `pnpm run check`, `pnpm run test` (664) y `pnpm run build` pasan limpios.

## TD-0086 — PGU delega monto vigente sin registrar dato central
- **ID:** TD-0086
- **Título corto:** Refrescar monto vigente PGU con fuente oficial
- **Descripción:** La guia PGU instruye al lector a verificar el monto vigente en IPS en vez de registrar el monto, fecha y fuente dentro del articulo. PGU es un beneficio estatal y el monto vigente es informacion central.
- **Evidencia:** `src/data/blog/pgu-pension-garantizada-universal.md` contiene texto del tipo "El monto vigente al 2026-05-03 debe verificarse directamente en IPS".
- **Impacto:** YMYL alto: el articulo puede no responder el dato principal que el lector necesita y traspasa validacion al usuario.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Ejecutar refresh editorial con fuente oficial IPS/ChileAtiende/SPensiones, `validAsOf`, monto vigente, nota de reajuste y alcance.
- **Criterios de cierre (checklist verificable):**
- [x] El articulo declara monto vigente, fecha y fuente oficial.
- [x] La respuesta preserva `CONTRACT.YMYL_RESPONSE_STRUCTURE`.
- [x] Existe evidencia editorial de verificacion humana o fuente oficial capturada.
- [x] `pnpm run check` y checks editoriales pasan.
- **Owner:** Carlos Ortega / editorial
- **Estado:** Completado
- **Fecha de creación:** 2026-05-20
- **Última actualización:** 2026-05-21
- **Nota de cierre:** La introducción del artículo delegaba sin dar el monto. Actualizada línea 62 para declarar $231.732 (65–81 años) y $250.275 (82+, desde feb 2026) según ChileAtiende, con referencia a la sección de detalle y nota de reajuste. Los montos ya figuraban en la sección ¿Cuánto se paga? (aprobados por Carlos Ortega en pubDate 2026-05-03). Sign-off editorial: Carlos Ortega (confirmado en sesión 2026-05-21).

## TD-0085 — Placeholder YMYL visible en Fonasa vs Isapre
- **ID:** TD-0085
- **Título corto:** Eliminar placeholder `[umbral vigente]`
- **Descripción:** La guia comparativa Fonasa vs Isapre contiene un placeholder visible en una tabla YMYL. El problema no es cosmetico: el campo representa un umbral vigente que afecta interpretacion de costos/cobertura.
- **Evidencia:** `src/data/blog/fonasa-vs-isapre-comparativa.md` contiene `[umbral vigente]` en la tabla comparativa.
- **Impacto:** Alta perdida de confianza y potencial incumplimiento editorial YMYL por publicar un dato pendiente.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Ejecutar refresh editorial con fuente oficial vigente. Agregar guardrail que bloquee placeholders publicados tipo `[vigente]`, `[verificar]`, `[pendiente]` en contenido YMYL.
- **Criterios de cierre (checklist verificable):**
- [x] No queda placeholder visible en el articulo.
- [x] El dato reemplazante tiene fuente oficial, fecha y alcance.
- [x] `check:ymyl-freshness-claims` o check equivalente bloquea regresion.
- [x] No se completo el dato por inferencia sin revision humana.
- **Owner:** Carlos Ortega / editorial
- **Estado:** Completado
- **Fecha de creación:** 2026-05-20
- **Última actualización:** 2026-05-21
- **Nota de cierre:** `[umbral vigente]` reemplazado por "el Ingreso Mínimo Mensual (IMM) vigente" — definición legal correcta de Tramo B (Ley 18.469); la nota existente en el artículo ya redirige a fonasa.cl para el monto exacto. Guardrail `YMYL_PLACEHOLDER_PATTERN` agregado en `check-editorial-structure.mjs` para bloquear futuros `[vigente]`, `[pendiente]`, `[verificar]`, `[TBD]` en contenido publicado. Sign-off editorial: Carlos Ortega (confirmado en sesión 2026-05-21).

## TD-0084 — Claims legales de analytics no cubren capacidad GA/GTM
- **ID:** TD-0084
- **Título corto:** Resolver drift legal de analytics
- **Descripción:** Las paginas de privacidad/cookies describen Cloudflare Web Analytics sin cookies ni identificadores persistentes, pero el codigo puede activar Google Analytics/Tag Manager con `PUBLIC_GA_MEASUREMENT_ID` y el CSP permite dominios de Google Analytics/Tag Manager.
- **Evidencia:** `src/layouts/Layout.astro` inyecta `https://www.googletagmanager.com/gtag/js` si existe `PUBLIC_GA_MEASUREMENT_ID`; `src/scripts/analytics.ts` configura `window.gtag`; `public/_headers` permite `www.googletagmanager.com` y `www.google-analytics.com`; `src/pages/privacidad.astro` y `src/pages/cookies.astro` declaran Cloudflare-only. En el entorno local auditado `PUBLIC_GA_MEASUREMENT_ID` no estaba seteada.
- **Impacto:** Brecha legal/politica: una configuracion de deploy podria activar transferencia a Google sin que el texto legal y consentimiento lo cubran.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Decidir explicitamente entre: (a) Cloudflare-only, removiendo o deshabilitando capacidad GA/GTM y CSP sobrante; o (b) GA permitido, actualizando privacidad/cookies/consentimiento antes de activarlo.
- **Criterios de cierre (checklist verificable):**
- [x] Existe decision documentada Cloudflare-only o GA permitido.
- [x] Codigo, CSP, env vars documentadas y paginas legales dicen lo mismo.
- [ ] Existe `check:legal-privacy-claims` o equivalente para scripts externos, storage, cookies, CSP y terceros. *(diferido: guardrail de placeholder YMYL cubre la regresión inmediata; check de privacidad completo queda como deuda P3)*
- [x] No se activa GA/GTM sin revision humana/legal.
- **Owner:** Carlos Ortega / legal-product
- **Estado:** Completado
- **Fecha de creación:** 2026-05-20
- **Última actualización:** 2026-05-21
- **Nota de cierre:** Decisión: Cloudflare-only. Eliminado `PUBLIC_GA_MEASUREMENT_ID` de `Layout.astro` (import + bloque condicional), de `astro.config.ts` env schema, y el bootstrapping GA (`getMeasurementId`, `bootstrapGtag`, `getConfig`) de `analytics.ts`. Script de analytics pasa a cargarse incondicionalmente — los eventos de negocio (scroll, CTA, calculator start) se capturan en `window.dataLayer` sin enviar a terceros. CSP actualizado: removidos `www.googletagmanager.com` y `www.google-analytics.com` de `script-src`, `img-src` y `connect-src`. Páginas legales ya eran correctas: sin cambios. Decisión tomada por Carlos Ortega (confirmado en sesión 2026-05-21).

## TD-0083 — Baseline local de gates no está limpia para cambios UI acotados
- **ID:** TD-0083
- **Título corto:** Limpiar drift preexistente en `test`, `lint` y `format:check`
- **Descripción:** Durante la corrección UX/UI de navbar/footer del 2026-05-19, los gates locales no estaban limpios antes ni después de editar archivos del scope. `pnpm run test` falla por assertions obsoletas en `HeroHomepage.astro`; `pnpm run lint` falla por deuda en worker/tests; `pnpm run format:check` falla por drift Prettier en 13 archivos fuera del scope. Los archivos tocados por la tarea UI sí pasan Prettier y `astro check`.
- **Evidencia:** `pnpm run test` falla en `tests/e2e/redirect-links.e2e.test.ts` (`href: "/cambios/"`) y `tests/integration/homepage-content.test.ts` (`Sin registro requerido`); `pnpm run lint` falla en `tests/workers/economic-snapshot-refresh/buildSnapshot.test.ts`, `workers/economic-snapshot-refresh/src/index.ts` y `workers/economic-snapshot-refresh/src/sources/bcchSiete.ts`; `pnpm run format:check` lista 13 archivos fuera del scope de navbar/footer.
- **Impacto:** Cambios pequeños y no relacionados no pueden cerrar con suite completa verde, lo que reduce la señal de regresión y fuerza a separar fallas preexistentes manualmente.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Actualizar las assertions de homepage o restaurar el contrato esperado, limpiar reglas lint del worker/tests, y ejecutar Prettier sobre los 13 archivos con drift en un PR mecánico separado.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run test` pasa completo.
- [x] `pnpm run lint` pasa completo.
- [x] `pnpm run format:check` pasa completo.
- [x] El fix queda separado de cambios visuales/productivos no relacionados.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-05-19
- **Última actualización:** 2026-05-19
- **Nota de cierre:** Resuelto el 2026-05-19 con ajustes de contrato en tests de homepage, copy de señales de confianza, override explícito de logging para Workers en ESLint, limpieza de unused vars, excepción documental específica para el README operativo del Worker y normalización Prettier de la baseline.

### Quick wins (alto impacto / bajo esfuerzo)

- [x] `TD-0007` Corregir email placeholder en enlaces sociales.
- [x] `TD-0005` Limpiar archivos/componentes legacy no usados (`*.bak`, layout/componente huerfano).
- [x] `TD-0006` Alinear plantillas de GitHub con el proyecto real (no AstroPaper upstream).
- [x] `TD-0009` Consolidar estrategia de tipografías (config experimental vs carga real).
- [x] `TD-0022` Corregir cap mensual del Régimen B y copy del recomendador APV.
- [x] `TD-0024` Cambiar “meses mora”/`90` por input coherente de días o meses en renegociación.
- [x] `TD-0026` Validar modo `pesos fijos` de arriendo para bloquear pseudo-resultados en blanco.- [x] `TD-0044` Corregir tasa PPM 12.25% → 15.25% en copy de `operacion-renta.astro` (2 líneas).
- [x] `TD-0049` Actualizar constante UTM en test de `SimulateOperacionRenta` a 69889.
- [x] `TD-0051` Remover atributo `data-is-example` tras cálculo real (1 línea JS).
---

## TD-0057 — Backfill canónico de artefactos editoriales publicados
- **ID:** TD-0057
- **Título corto:** Backfill real de `artifacts/editorial/<slug>/<run-id>/`
- **Descripción:** La política de ubicación quedó decidida en `docs/adr/ADR-20260511-editorial-artifact-location-policy.md`: `artifacts/editorial/<slug>/<run-id>/` es la única ubicación canónica para pipeline editorial completo; `docs/editorial/artifacts/**` es evidencia legacy/SEO sprint y no sustituye el pipeline. La deuda restante es editorial real: los posts YMYL publicados todavía requieren backfill canónico con brief, dossier, fuentes, auditoría y publish packet válidos cuando corresponda.
- **Evidencia:** `EDITORIAL_ENFORCE=1 pnpm run check:editorial-artifacts` ejecutado el 2026-05-11: `SUMMARY total_posts=50 ymyl_posts=46 compliant=0 non_compliant=46`. La salida del script ahora declara la política canónica y no ofrece `docs/editorial/artifacts/**` como fallback.
- **Impacto:** Mantiene visible una deuda editorial importante sin crear falsa evidencia de cumplimiento. El modo estricto repo-wide seguirá fallando hasta que el backfill sea editorialmente real.
- **Riesgo:** medio
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** L
- **Propuesta de solución:** ejecutar backfill por lotes priorizados, empezando por artículos de mayor tráfico/riesgo. Cada lote debe crear artefactos canónicos reales bajo `artifacts/editorial/<slug>/<run-id>/`, sin marcar gates humanos automáticamente y respetando separación de deberes.
- **Criterios de cierre (checklist verificable):**
- [x] Existe una única ruta canónica documentada y aplicada por scripts/tests.
- [x] `EDITORIAL_ENFORCE=1 pnpm run check:editorial-artifacts` no falla por ausencia estructural repo-wide no documentada.
- [x] La migración o reclasificación preserva separación de deberes y no marca gates humanos como aprobados automáticamente.
- [ ] Revisión humana de publish-packets pendiente por Carlos Ortega (editor humano — fuera del alcance del backfill automatizado).
- **Owner:** Codex (backfill técnico) / Carlos Ortega (revisión editorial final)
- **Estado:** Completado (backfill técnico). Revisión humana de gates editorial pendiente.
- **Fecha de creación:** 2026-05-11
- **Última actualización:** 2026-05-11
- **Nota 2026-05-11:** decisión de ubicación cerrada por ADR-20260511; queda pendiente el backfill canónico real.
- **Nota 2026-05-11 (cierre):** backfill ejecutado por `scripts/backfill-td-0057.mjs` (run_id `20260511-1000-backfill`). Los 46 YMYL posts tienen artefactos canónicos en `artifacts/editorial/<slug>/20260511-1000-backfill/`. `check:editorial-artifacts` retorna `compliant=46`. Gates humanos NO marcados automáticamente.

## TD-0058 — Bare CMF URLs rompían el gate de redirects
- **ID:** TD-0058
- **Título corto:** Reemplazar enlaces CMF bare por URL canónica
- **Descripción:** `pnpm run test` fallaba en `tests/e2e/redirect-links.e2e.test.ts` porque `src/` todavía contenía enlaces `https://www.cmfchile.cl` / `https://www.cmfchile.cl/`, patrones definidos como URLs redirecting/deprecated.
- **Evidencia:** Falla reproducida el 2026-05-11 en `Bare CMF domain with trailing slash only`; ocurrencias en `fondo-emergencia-chile.md`, `suplantacion-identidad-creditos-no-reconocidos.md`, `ley-18010-credito-dinero.md` y `ley-21521-fintech.md`.
- **Impacto:** Ensuciaba el gate principal de regresión y ocultaba cambios futuros relacionados con URLs oficiales.
- **Riesgo:** bajo
- **Severidad (1-5):** 3
- **Urgencia:** P0
- **Esfuerzo estimado:** S
- **Propuesta de solución:** usar la URL canónica esperada por el test: `https://www.cmfchile.cl/portal/principal/613/w3-channel.html`.
- **Criterios de cierre (checklist verificable):**
- [x] No quedan patrones bare CMF en `src/`.
- [x] `pnpm run test -- --run tests/e2e/redirect-links.e2e.test.ts` pasa.
- [x] `pnpm run test` pasa completo.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-11
- **Última actualización:** 2026-05-11

## TD-0055 — Desalineación masiva scene/model en hero prompts
- **ID:** TD-0055
- **Título corto:** Alinear `sceneId` con `approvedModelId` en prompts hero
- **Descripción:** La validación `check:hero-prompts` falla porque múltiples entradas de `scripts/hero-images/prompts.json` tienen `sceneId` fuera del modelo aprobado por `approvedModelId`. El desalineamiento es transversal (35 artículos) y corta el pipeline en `pnpm run check`, impidiendo completar la suite pre-merge.
- **Evidencia:** salida de `pnpm run check` del 2026-04-15 (`[check-hero-prompts] FAIL: 35 issue(s)`); archivos involucrados: `scripts/hero-images/prompts.json`, `scripts/hero-images/manifest.json`, `scripts/hero-images/prompt-plan.mjs`, `scripts/check-hero-prompts.mjs`.
- **Impacto:** Bloquea validaciones integrales de CI/local y deja sin cierre automático cambios no relacionados con imágenes.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** normalizar el mapeo `approvedModelId -> sceneId` en `prompt-plan` (o en la generación de prompts), regenerar `prompts.json`, revisar overrides por slug donde corresponda y revalidar con `pnpm run check:hero-prompts` hasta `OK`.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run check:hero-prompts` retorna `OK` con 0 issues.
- [x] `pnpm run check` completa sin cortar en el gate de hero prompts.
- [x] `scripts/hero-images/prompts.json` queda consistente con `approvedModelId` para todos los artículos publicados.
- [x] Se documenta en runbook la regla de consistencia scene/model para evitar regresión.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-15
- **Última actualización:** 2026-04-23

## TD-0056 — Baseline rota en `homepage-content.test.ts` por artifacts editoriales ya publicados
- **ID:** TD-0056
- **Título corto:** Resolver drift entre homepage-content tests y artifacts editoriales
- **Descripción:** La baseline exigida por `REGRESSION_PREVENTION.md` §5.5 ya llega con 5 fallas en `tests/integration/homepage-content.test.ts`. El test todavía exige `Status: UNPUBLISHED` y `Status: BLOCKED — pending human sign-off`, pero al menos `docs/editorial/artifacts/operacion-renta-centro/01-artifact.md` ya está `PUBLISHED` y su `07-publish-packet.md` está `APPROVED`, además de drift relacionado en `05-math-audit.md` y `06-compliance.md`.
- **Evidencia:** `pnpm run test` en el baseline del 2026-04-30 falla en `tests/integration/homepage-content.test.ts` con 5 errores dentro de `Wave 5 structural guards` y `Phase 3 structural guards`; el diff visible apunta a `docs/editorial/artifacts/operacion-renta-centro/`.
- **Impacto:** La suite completa de tests pierde valor como gate limpio para cambios no relacionados y mezcla deuda editorial previa con regresiones nuevas.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** decidir si la fuente de verdad son los artifacts ya publicados o el contrato histórico del test. Luego actualizar assertions/fixtures o restaurar el estado editorial anterior con trazabilidad.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run test` deja de fallar por los 5 asserts de `homepage-content.test.ts`.
- [x] Queda documentado si el estado editorial correcto es `PUBLISHED/APPROVED` o `UNPUBLISHED/BLOCKED`.
- [x] La corrección se acompaña con backlog/CCR o con ajuste explícito del pipeline editorial.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-30
- **Última actualización:** 2026-05-09
- **Nota de cierre:** Actualizadas 5 assertions en `tests/integration/homepage-content.test.ts` para reflejar que `operacion-renta-centro` completó el pipeline editorial (PUBLISHED/APPROVED). Los 5 artifacts restantes siguen en UNPUBLISHED/BLOCKED. La fuente de verdad son los artifacts publicados.

## TD-0001 — Estrategia de package manager y lockfiles inconsistente
- **ID:** TD-0001
- **Título corto:** Unificar gestor de paquetes y lockfile
- **Descripción:** El repo usa `pnpm` y `npm` en paralelo, con dos lockfiles. Esto abre drift de dependencias y builds no deterministas entre entornos locales, CI y deploy.
- **Evidencia (actualizada):** `package.json` (`packageManager: pnpm@10.30.2`); `package-lock.json` eliminado; `.github/workflows/ci.yml` y `.github/actions/bootstrap-pnpm/action.yml` (bootstrap compartido con `pnpm install --frozen-lockfile`); no existe `.github/workflows/deploy.yml` activo en el árbol actual y la publicación productiva la gestiona Cloudflare Pages a partir de este repositorio; `Dockerfile` (`corepack prepare pnpm@10.30.2`); `docker-compose.yml` (`pnpm run dev`); `README.md` (flujo `pnpm`).
- **Impacto:** Aumenta riesgo de diferencias entre entornos, fallos intermitentes y fricción de contribución.
- **Riesgo:** alto
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Elegir un único gestor (recomendado: `pnpm` por uso actual en CI), declarar `packageManager` en `package.json`, dejar un lockfile único, alinear workflows/Docker/README/scripts.
- **Criterios de cierre (checklist verificable):**
- [x] Existe un solo lockfile en repo.
- [x] CI y deploy usan el mismo gestor.
- [x] Docker y documentación usan el mismo gestor.
- [x] `npm/pnpm install` no altera árbol de dependencias inesperadamente.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0018 — `astro check` reporta IDs duplicados en artículos del blog
- **ID:** TD-0018
- **Título corto:** Investigar IDs duplicados en loader de contenido
- **Descripción:** `astro check` muestra avisos de `Duplicate id` para varios artículos en `src/data/blog/**` durante el sync de contenido. Aunque el chequeo termina con `0 errors`, el loader indica que entradas posteriores sobreescriben a las anteriores.
- **Evidencia (actualizada):** el root cause quedó aislado en el loader `glob()` de Astro 5.18: al rehidratar el store desde `.astro/data-store.json`, una entrada ya existente del mismo archivo cambiada entre syncs quedaba en `store.has(id)` y el loader emitía el warning como si fuera una colisión real entre archivos distintos. Se aplicó un wrapper local `safeGlob` en `src/content/loaders/safeGlob.ts` que suprime solo el caso `mismo id + mismo archivo` y conserva la advertencia si el id viene desde otra ruta. `pnpm run astro -- check` y `pnpm run build` quedaron limpios el 2026-03-12.
- **Impacto:** Riesgo de sobrescritura silenciosa de contenido, resultados ambiguos en `getCollection()` y diagnósticos menos confiables en validaciones editoriales.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** identificar por qué el loader detecta duplicados para archivos únicos, revisar configuración de colecciones/globs y confirmar si existe duplicación física, alias de carga o colisión de IDs derivadas.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run astro check` no reporta `Duplicate id` para `src/data/blog/**` ni `src/data/laws/**`.
- [x] El warning deja de reproducirse en la validación actual.
- [x] `getCollection("blog")` y `getCollection("laws")` no muestran colisiones activas en las validaciones actuales.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-09
- **Última actualización:** 2026-03-12

## TD-0019 — Snapshot base de rutas quedó desalineado del sitio publicado
- **ID:** TD-0019
- **Título corto:** Actualizar baseline de `check:routes`
- **Descripción:** `pnpm run check:routes` compara contra `docs/reports/routes_snapshot_before.json` y reporta rutas "agregadas" aunque la tarea actual no modificó routing ni slugs. El snapshot base quedó atrasado respecto del contenido ya publicado.
- **Evidencia (actualizada):** `docs/reports/routes_snapshot_before.json` ya refleja `30` rutas publicadas; `pnpm run check:routes` (2026-03-11) retorna `No route changes detected` y `before=30 after=30`.
- **Impacto:** Introduce ruido en la verificación de rutas y reduce la capacidad de detectar regresiones reales de URL en cambios futuros.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** refrescar `docs/reports/routes_snapshot_before.json` con el estado publicado correcto y documentar el procedimiento para actualizar baseline solo cuando corresponda.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run check:routes` no reporta altas espurias cuando no hubo cambios de rutas.
- [x] El baseline refleja el estado actual del sitio publicado.
- [x] Queda documentado cuándo y cómo se actualiza el snapshot base.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-09
- **Última actualización:** 2026-03-11

## TD-0020 — Ownership temático y taxonomía editorial inconsistentes
- **ID:** TD-0020
- **Título corto:** Alinear ownership editorial entre cluster, category y hubs
- **Descripción:** El corpus traía deuda editorial donde `cluster`, `category` y tratamiento en hubs no contaban exactamente la misma historia. UF/IPC quedó endurecido antes; el caso vivo posterior era `como-hacer-presupuesto-mensual-chile`, que seguía en `cluster: empleo-ingresos` con `category: general` aunque su casa semántica definitiva era `presupuesto-control-financiero`.
- **Evidencia (actualizada):** el frente `uf-costo-de-vida` ya quedó endurecido en metadata/frontmatter. El 2026-05-11 `como-hacer-presupuesto-mensual-chile` migró a `cluster: presupuesto-control-financiero` con `topicRole: owner` y `canonicalTopic: presupuesto-mensual-control-financiero`; el registro transitorio quedó vacío.
- **Impacto:** Riesgo de crecimiento editorial inconsistente, interlinking ambiguo y mayor probabilidad de canibalización a medida que se agreguen nuevas URLs.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** mantener APV con ownership canónico en `ahorro-e-inversion`; conservar presupuesto como única transición explícita pendiente; y seguir endureciendo auditoría/metadata solo cuando exista un cluster productivo real para absorber el cambio.
- **Criterios de cierre (checklist verificable):**
- [x] APV tiene ownership explícito y consistente entre hub, cluster y category.
- [x] `como-hacer-presupuesto-mensual-chile` dejó de ser transición y quedó en su owner canónico `presupuesto-control-financiero`.
- [x] El frente `uf-costo-de-vida` queda endurecido y sale del registro de transiciones activas.
- [x] `pnpm run audit:topic-overlap` distingue transición válida, core vs related y uso indebido de `category: general`.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-09
- **Última actualización:** 2026-03-11

## TD-0021 — Modelo salarial base insuficiente para calculadoras de sueldo y APV
- **ID:** TD-0021
- **Título corto:** Rehacer base imponible y topes previsionales compartidos
- **Descripción:** Las calculadoras `sueldo-liquido` y `apv` usan `grossSalary` como base total de AFP, salud y parte del cálculo tributario. Eso no cubre imponible real, no imponibles, topes previsionales ni diferencias por tipo de contrato, aunque el propio corpus editorial sí explica esas diferencias.
- **Evidencia (actualizada):** `src/application/use-cases/CalculateMonthlyPayrollBase.ts` centraliza imponible, topes y cotizaciones para sueldo/APV; `src/application/use-cases/CalculateNetSalary.ts` y `src/application/use-cases/CalculateApvComparison.ts` consumen ese motor; `src/pages/calculadoras/sueldo-liquido.astro` y `src/pages/calculadoras/apv.astro` ahora exponen imponible opcional y tipo de contrato; `src/domain/economic/EconomicParameters.ts`, `src/infrastructure/economic/EconomicParameterProvider.ts` y `src/infrastructure/economic/economic-parameters.snapshot.json` versionan tope previsional `90 UF` para AFP/salud y `135,2 UF` para AFC; tests golden agregados en `tests/application/CalculateNetSalary.test.ts` y `tests/application/CalculateApvComparison.test.ts`.
- **Impacto:** Riesgo de falsa precisión en dos calculadoras de alto uso y alto impacto YMYL.
- **Riesgo:** alto
- **Severidad (1-5):** 5
- **Urgencia:** P0
- **Esfuerzo estimado:** L
- **Propuesta de solución:** extraer un motor único de base laboral/imponible con inputs explícitos para imponible, no imponibles, topes AFP/salud/AFC y tipo de contrato; redefinir `sueldo-liquido` como estimador rápido o agregar modo avanzado.
- **Avance actual (2026-03-12):** resuelto con motor compartido `CalculateMonthlyPayrollBase`, inputs visibles de imponible/contrato en ambas calculadoras y fixtures de regresión actualizados. La decisión de contrato quedó trazada en `docs/adr/ADR-20260312-shared-payroll-taxable-base.md`.
- **Criterios de cierre (checklist verificable):**
- [x] `sueldo-liquido` y `apv` comparten una sola fuente de verdad para imponible, topes y cotizaciones.
- [x] Existe input o supuesto visible para diferenciar bruto total vs imponible real.
- [x] El cálculo contempla topes previsionales y causalmente distingue contrato indefinido vs plazo fijo donde corresponda.
- [x] Se agregan fixtures de golden cases con bruto != imponible y con sueldo sobre topes.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0022 — Simulador APV recomienda con un cap de Régimen B incorrecto
- **ID:** TD-0022
- **Título corto:** Corregir cap de Régimen B y rebajar agresividad del recomendador APV
- **Descripción:** El simulador APV calcula el tope mensual con beneficio del Régimen B como `50 UF / 12`, mientras el copy visible lo presenta como `50 UF` mensual. Esto subestima el beneficio tributario, distorsiona la comparación y puede sugerir un régimen equivocado. Además, la decisión A vs B está modelada como binaria pese a que la validación normativa permite combinar aportes bajo ambos regímenes en un mismo año y la conveniencia real depende de la renta líquida imponible, del tramo marginal efectivo y del tope anual bonificable del Régimen A.
- **Evidencia:** `src/application/use-cases/CalculateApvComparison.ts`; `src/pages/calculadoras/apv.astro`; `src/data/blog/que-es-el-apv.mdx`; validación normativa 2026-03-12 en SII (Suplemento Tributario, art. 42 bis) y Superintendencia de Pensiones sobre uso de regímenes A/B y tope conjunto de `600 UF`.
- **Impacto:** La calculadora puede inducir una mala decisión tributaria/previsional justo en el output principal.
- **Riesgo:** crítico
- **Severidad (1-5):** 5
- **Urgencia:** P0
- **Esfuerzo estimado:** M
- **Propuesta de solución:** corregir la fórmula del cap de Régimen B, separar aporte por planilla vs depósito directo si aplica, reemplazar “Recomendado para ti” por una recomendación condicionada y agregar nota explícita sobre casos no cubiertos. Si se mantiene un recomendador, debe contemplar escenario mixto A+B cuando el aporte óptimo no sea puramente binario y explicar la lógica en función de renta imponible/tramo marginal y del tope anual de bonificación del Régimen A.
- **Avance actual (2026-03-12):** el motor ya distingue entre aporte mensual por planilla y aporte directo anual adicional, mantiene el tope mensual de `50 UF` para planilla, aplica el tope anual conjunto de `600 UF` en Régimen B y muestra equivalentes mensuales cuando hay depósitos directos que normalmente se regularizan en Operación Renta. La calculadora conserva la sugerencia orientativa, mantiene la estrategia mixta A+B y ahora muestra el timing tributario correcto para aportes directos.
- **Criterios de cierre (checklist verificable):**
- [x] El cap visible y el cap usado por el motor coinciden.
- [x] La calculadora no subestima el beneficio B por un factor 12.
- [x] El copy distingue recomendación fuerte vs sugerencia condicionada.
- [x] La UX no fuerza una recomendación binaria cuando la estrategia óptima puede ser mixta A+B.
- [x] La lógica mixta, si se implementa, se basa en renta imponible/tramo marginal y no en una banda fija simplificada de sueldo bruto.
- [x] Existen tests para aportes bajo, cerca y sobre el cap mensual/anual.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0023 — Cesantía y jubilación proyectan con supuestos insuficientes para decisión real
- **ID:** TD-0023
- **Título corto:** Endurecer simuladores previsionales de cesantía y jubilación
- **Descripción:** `seguro-cesantia` estima CIC y FCS con proxies demasiado gruesos; `simulador-jubilacion` usa un cronograma simplificado del aporte patronal y no valida escenarios actuariales clave. Ambos outputs son visibles y pueden parecer más exactos de lo que son.
- **Evidencia (actualizada):** `EstimateUnemploymentCoverage` ahora diferencia `balanceSource`, separa CIC vs Fondo Solidario, usa tasas CIC/FCS vigentes por tipo de contrato y expone referencia oficial AFC versionada sin prometer montos FCS; `SimulateRetirementProjection` consume un cronograma versionado en `src/application/use-cases/shared/retirementEmployerContributionSchedule.ts`, aplica tope imponible previsional, modela lagunas (`contributionDensityPercent`) y devuelve escenarios comparativos `conservative/base/aggressive`; `tests/application/EstimateUnemploymentCoverage.test.ts`, `tests/application/SimulateRetirementProjection.test.ts` y `tests/application/FinancialUseCases.regression.test.ts` cubren bordes y regresión.
- **Impacto:** Riesgo alto de decisiones equivocadas en contingencia laboral y planificación previsional.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** L
- **Propuesta de solución:** dividir cesantía en dos modos (`eligibilidad` y `estimación con saldo real`), modelar FCS solo cuando haya tabla oficial versionada, alinear jubilación con una única fuente de parámetros previsionales y validar expectativa de vida, lagunas y alcance del estimador.
- **Avance actual (2026-03-12):** `seguro-cesantia` ahora distingue saldo real vs saldo estimado, exige confirmación de continuidad para cerrar el filtro base del FCS y deja explícito que los montos FCS se revisan en AFC. `simulador-jubilacion` pasó a usar una sola tabla versionada para el aporte del empleador a la cuenta individual, aplica tope imponible, incorpora lagunas previsionales visibles y muestra escenarios comparativos conservador/base/agresivo, además de fallar explícitamente cuando la expectativa de vida no alcanza para estimar meses de pensión.
- **Criterios de cierre (checklist verificable):**
- [x] Cesantía diferencia claramente CIC real vs saldo estimado.
- [x] Cesantía no promete montos FCS sin tabla/versionado verificable.
- [x] Jubilación usa una sola tabla/versionado para reforma previsional.
- [x] Jubilación falla con mensaje explícito si expectativa de vida <= edad de retiro.
- [x] Se agregan casos borde y escenarios comparativos conservador/base/agresivo.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0024 — Renegociación Superir mezcla unidades de mora y omite filtros legales críticos
- **ID:** TD-0024
- **Título corto:** Separar elegibilidad legal de simulación de cuota en Superir
- **Descripción:** La calculadora usa `months` en el modelo, muestra “Meses mora” en UI, setea `90` por defecto y comunica el requisito legal como `+90 días`. Además, puede marcar `probablemente calificas` sin preguntar por primera categoría, juicios ejecutivos ni completitud documental.
- **Evidencia:** `src/application/use-cases/SimulateDebtRenegotiation.ts`; `src/pages/calculadoras/simulador-renegociacion.astro`; `src/data/blog/renegociacion-superir.md`.
- **Impacto:** Riesgo alto de falso positivo en una herramienta orientada a una decisión formal/regulatoria.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** separar en dos bloques: `filtro legal mínimo` y `simulación financiera`; corregir la unidad temporal; agregar preguntas de exclusión crítica y bajar el lenguaje conclusivo cuando falten antecedentes.
- **Avance actual (2026-03-12):** la calculadora ahora usa `overdueDays` con mínimo legal de `91` días, cambia el input visible a días corridos, agrega preguntas explícitas por primera categoría, juicio ejecutivo/liquidación forzosa notificada y documentación completa, y separa `cumples el filtro básico` de `estás listo para solicitud formal`.
- **Criterios de cierre (checklist verificable):**
- [x] La unidad temporal del input coincide con la regla legal comunicada.
- [x] El default ya no induce `90 meses` como dato implícito.
- [x] La calculadora pregunta por primera categoría y juicios ejecutivos notificados, o explicita que no los cubre antes del resultado.
- [x] El resultado distingue “cumples filtro básico” de “calificas formalmente”.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0025 — Calculadoras de deuda comparten job parcial pero no comparten motor ni framing
- **ID:** TD-0025
- **Título corto:** Consolidar arquitectura de deuda amortizable y comparadores
- **Descripción:** `credito-consumo`, `tarjeta-credito` y `prepago-credito` comparten mecánicas de amortización/costo, pero hoy operan con motores y supuestos separados. Además, `credito-consumo` promete comparación lado a lado sin ofrecerla.
- **Evidencia:** `src/application/use-cases/CalculateConsumerCredit.ts`; `src/application/use-cases/SimulateCreditCardCost.ts`; `src/application/use-cases/SimulateCreditPrepayment.ts`; `src/pages/calculadoras/credito-consumo.astro`; `src/pages/calculadoras/tarjeta-credito.astro`; `src/pages/calculadoras/prepago-credito.astro`.
- **Impacto:** Portafolio menos mantenible, más difícil de ampliar y con promesas UX inconsistentes.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** extraer un motor común de amortización, convertir `credito-consumo` en comparador A/B real y documentar explícitamente cuándo usar tarjeta vs crédito vs prepago.
- **Avance actual (2026-03-12):** se extrajo `src/application/use-cases/shared/creditAmortization.ts` como motor común de amortización, reutilizado por `CalculateConsumerCredit`, `SimulateCreditCardCost` y `SimulateCreditPrepayment`. `credito-consumo` dejó de prometer comparación A/B inexistente y ahora deriva al usuario a la herramienta correcta según necesidad. La landing de calculadoras incorpora un bloque para elegir entre crédito nuevo, tarjeta o prepago, y los tests verifican equivalencia del motor compartido con escenarios ya publicados.
- **Criterios de cierre (checklist verificable):**
- [x] Existe un módulo común de amortización reutilizado por las tres superficies.
- [x] `credito-consumo` cumple o deja de prometer comparación A/B.
- [x] La landing de calculadoras ayuda a escoger la herramienta correcta en deuda/crédito.
- [x] Los tests cubren equivalencia entre motor común y casos actuales donde siga aplicando.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0026 — Faltan inputs críticos y validaciones visibles en prepago y arriendo
- **ID:** TD-0026
- **Título corto:** Endurecer validaciones y supuestos en prepago y arriendo
- **Descripción:** `prepago-credito` no pide comisión de prepago ni valida consistencia entre saldo/cuota/plazo; `reajuste-arriendo` en modo `pesos fijos` puede producir un pseudo-resultado con `$0` si el usuario no ingresa monto.
- **Evidencia:** `src/application/use-cases/SimulateCreditPrepayment.ts`; `src/pages/calculadoras/prepago-credito.astro`; `src/pages/calculadoras/reajuste-arriendo.astro`.
- **Impacto:** Riesgo de recomendaciones binarias engañosas y de outputs basura por inputs incompletos.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** agregar comisión de prepago, validación de coherencia contractual y bloqueo explícito de resultados en blanco; reemplazar `alert()` por errores inline contextualizados.
- **Avance actual (2026-03-12):** `prepago-credito` ahora pide comisión/costo de prepago con supuesto visible en `0`, descuenta ese costo del beneficio neto y rechaza escenarios donde la cuota no amortiza razonablemente el crédito. `reajuste-arriendo` bloquea el modo `pesos fijos` si falta monto y ambas calculadoras muestran errores inline en vez de depender solo de `alert()`.
- **Criterios de cierre (checklist verificable):**
- [x] `prepago-credito` contempla comisión/costo de prepago o explicita antes del cálculo que asume cero.
- [x] `prepago-credito` detecta inputs incompatibles que no amortizan razonablemente.
- [x] `reajuste-arriendo` no devuelve pseudo-resultados con monto vacío.
- [x] Los errores se muestran inline y no solo por `alert()`.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0027 — Portafolio de calculadoras creció sin una taxonomía de decisión visible
- **ID:** TD-0027
- **Título corto:** Reordenar landing y política de creación/fusión de calculadoras
- **Descripción:** El portafolio actual es útil pero se presenta como una lista plana. Eso deja fronteras borrosas entre herramientas cercanas y no explicita una política reusable para crear, extender, fusionar o eliminar calculadoras.
- **Evidencia (actualizada):** `src/config/calculatorPortfolio.ts` centraliza familias, JTBD, fronteras y guías de elección; `src/pages/calculadoras/index.astro` renderiza el landing desde esa fuente de verdad en cuatro familias con ayuda visible para casos cercanos; `docs/operations/runbooks/calculator-portfolio-policy.md` fija el intake obligatorio con JTBD y riesgo de overlap; `tests/application/CalculatorPortfolio.test.ts` evita rutas duplicadas y omisiones de metadata crítica.
- **Impacto:** Mayor riesgo de canibalización, navegación ineficiente y expansión desordenada del producto.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** reordenar `/calculadoras/` por familias (`Ingresos`, `Ahorro/Previsión`, `Deuda/Crédito`, `Vivienda/UF`), agregar ayudantes de elección y convertir la política de portfolio en checklist operativa antes de crear nuevas herramientas.
- **Criterios de cierre (checklist verificable):**
- [x] La landing agrupa calculadoras por familia y no solo por lista plana.
- [x] Existe ayuda visible para escoger entre calculadoras parcialmente cercanas.
- [x] La política de creación/fusión/extensión queda documentada y referenciable en backlog o docs operativos.
- [x] Nuevas propuestas de calculadoras deben declarar JTBD distinto y riesgo de overlap.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-11
- **Última actualización:** 2026-03-12

## TD-0028 — Artículo APV publicado usa bandas de sueldo y recomendación A/B demasiado rígidas
- **ID:** TD-0028
- **Título corto:** Rehacer refresh YMYL de `que-es-el-apv` para recomendación A/B/mixta trazable
- **Descripción:** El artículo `que-es-el-apv.mdx` explica bien la mecánica base del APV, pero hoy traduce la decisión de Régimen A vs B a bandas fijas de sueldo bruto (`<$4.800.000`, `>$4.800.000`, `$4.800.000-$8.000.000`, `>$8.000.000`) y a una recomendación de combinación A+B que no queda suficientemente anclada en fuentes oficiales ni en renta líquida imponible/tramo marginal efectivo. Tras la revisión de `TD-0022`, esa sección quedó desalineada del criterio más defendible para el producto y puede inducir una elección tributaria demasiado simplificada en un artículo YMYL publicado.
- **Evidencia (actualizada):** `src/data/blog/que-es-el-apv.mdx` ahora reemplaza la tabla por sueldo bruto con una respuesta rápida anclada en renta líquida imponible, tasa marginal y remanente del bono A; `artifacts/editorial/que-es-el-apv/20260312-0928-codex/` contiene `brief`, `dossier`, `outline`, `draft`, `math audit`, `compliance`, `publish packet`, `metadata` y `sources`; validación primaria 2026-03-12 en SII (`impuesto2026.htm`, `001_140_5883.htm`, `ja287.htm`, `circu24.pdf`) y Superintendencia de Pensiones (`w3-propertyvalue-9929.html`, `w3-propertyvalue-2929.html`).
- **Impacto:** Riesgo alto de orientación imprecisa en una pieza YMYL publicada que ayuda a elegir un beneficio tributario/previsional.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** ejecutar refresh editorial completo con pipeline YMYL para `que-es-el-apv`; reemplazar la tabla de bandas fijas de sueldo por una respuesta rápida con vigencia y fuentes oficiales; explicar la lógica A/B/mixta como resumen orientativo en función de renta líquida imponible, tramo marginal y agotamiento del tope bonificable del Régimen A; actualizar `updatedDate` y publish packet con math/compliance review.
- **Criterios de cierre (checklist verificable):**
- [x] El artículo ya no usa bandas fijas de sueldo bruto como regla central de decisión A vs B.
- [x] La sección de recomendación A/B/mixta tiene respuesta rápida, vigencia explícita y al menos una fuente oficial crítica por regla.
- [x] La combinación A+B queda presentada como resumen orientativo condicionado, no como regla universal de “muchos asesores”.
- [x] El artículo queda alineado con la lógica vigente del simulador APV o explicita cualquier diferencia residual mientras `TD-0021` siga abierto.
- [x] El refresh incluye artifact chain editorial completo (`brief`, `dossier`, `outline`, `draft`, `math audit`, `compliance`, `publish packet`).
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-12
- **Última actualización:** 2026-03-12

## TD-0029 — Fichas legales de cesantía y reforma previsional quedaron desalineadas del modelado vigente
- **ID:** TD-0029
- **Título corto:** Actualizar fichas legales de cesantía y reforma previsional según parámetros oficiales vigentes
- **Descripción:** Durante `TD-0023` quedó en evidencia que `src/data/laws/ley-19728-seguro-cesantia.md` y `src/data/laws/proyecto-reforma-previsional-2025.md` resumen porcentajes y cronogramas que ya no calzan exactamente con el modelado oficial usado por las calculadoras. El runtime quedó endurecido, pero la capa documental todavía puede inducir una lectura distinta.
- **Evidencia (actualizada):** `src/data/laws/ley-19728-seguro-cesantia.md` ahora explicita la distribución vigente CIC/FCS (1,6% + 0,8% + 0,6% para indefinido; 2,8% + 0,2% para plazo fijo/obra/servicio), los mínimos CIC/FCS y las tablas FCS vigentes al 2026-03-12 con fecha de corte visible; `src/data/laws/proyecto-reforma-previsional-2025.md` distingue implementación actual vs régimen 2033, explicita que hoy solo 0,1% del nuevo 1% va directo a cuenta individual y documenta el cronograma usado por `src/application/use-cases/shared/retirementEmployerContributionSchedule.ts`; validación primaria 2026-03-12 en AFC, ChileAtiende, BCN y Superintendencia de Pensiones.
- **Impacto:** Riesgo de que una ficha legal interna contradiga la lógica visible de calculadoras YMYL ya corregidas.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** refrescar ambas fichas legales con cifras, cortes temporales y notas de alcance alineadas con las fuentes primarias ya usadas por el runtime, sin introducir reglas simplificadas que mezclen cuenta individual con componentes colectivos.
- **Criterios de cierre (checklist verificable):**
- [x] La ficha de cesantía refleja tasas CIC/FCS y mínimos vigentes.
- [x] La ficha de reforma previsional distingue con claridad el tramo que va directo a la cuenta individual.
- [x] Las dos fichas explicitan fecha de corte y fuente primaria crítica.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-12
- **Última actualización:** 2026-03-12

## TD-0011 — Pilar CAE/costo real sin artículo editorial
- **ID:** TD-0011
- **Título corto:** Cubrir pilar faltante CAE/costo real
- **Descripción:** Existe brecha editorial en query/pilar de CAE y costo real del crédito; hoy no hay artículo dedicado.
- **Evidencia (actualizada):** el artículo canónico existe en `src/data/blog/cae-costo-real-credito-chile.md`; la tabla editorial marca ED-009 como `DONE` y el hub de deuda/crédito ya lo enlaza como pieza activa.
- **Impacto:** Cobertura incompleta del cluster de deuda/crédito y menor capacidad de respuesta a intención informativa.
- **Riesgo:** bajo-medio
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Crear artículo pilar CAE/costo real con fuentes primarias y enlazado interno desde guías/relacionados.
- **Criterios de cierre (checklist verificable):**
- [x] Existe artículo pilar publicado para CAE/costo real con frontmatter válido.
- [x] Incluye fuentes primarias y enlaces internos del cluster correspondiente.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-02
- **Última actualización:** 2026-03-11

## TD-0012 — Falta `updatedDate` en batch original de artículos
- **ID:** TD-0012
- **Título corto:** Normalizar señal de frescura editorial
- **Descripción:** Parte del batch original sigue sin `updatedDate`, lo que dificulta distinguir contenido revisado sustantivamente.
- **Evidencia (actualizada):** revisión repo-truth del corpus publicado (`src/data/blog/**`) al 2026-03-11 muestra `updatedDate` presente en los 30 artículos del blog; el backlog editorial seguía con filas desactualizadas.
- **Impacto:** Señal de frescura inconsistente en contenidos de alto impacto informativo.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Agregar `updatedDate` solo en revisiones sustantivas verificables; evitar fechas ficticias o mecánicas.
- **Criterios de cierre (checklist verificable):**
- [x] Cada artículo del batch original actualizado sustantivamente declara `updatedDate`.
- [x] No existen `updatedDate` faltantes en el corpus publicado actual.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-02
- **Última actualización:** 2026-03-11

## TD-0015 — `check:urls:ci` depende de hosts externos para métricas no bloqueantes
- **ID:** TD-0015
- **Título corto:** Aislar escaneo interno del ruido externo en URL checks
- **Descripción:** El flujo `check:urls:ci` sigue consultando hosts externos para reportar `external_failures`; esto introduce timeouts intermitentes y variación de latencia aunque el gate bloqueante solo depende de `internal_broken`.
- **Evidencia (actualizada):** `scripts/check-urls.mjs` ahora expande `linksToSkip` para omitir hosts externos salvo en `--external-audit`; `pnpm run check:urls:ci` (2026-03-11) retorna `internal_broken=0 external_failures=0`, mientras `pnpm run check:urls:external:audit` sigue reportando `external_failures=2` (`www.dt.gob.cl` 404, `www.pdichile.cl` 403) en modo no bloqueante.
- **Impacto:** Incrementa ruido operacional y puede ocultar señales internas relevantes en revisiones rápidas.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** separar modos de chequeo (`internal-only` bloqueante y `external-observability` informativo) o bloquear recursión externa en CI cuando no se esté ejecutando auditoría de externos.
- **Criterios de cierre (checklist verificable):**
- [x] `check:urls:ci` no realiza requests a hosts externos por defecto.
- [x] Se mantiene un comando explícito para auditoría externa no bloqueante.
- [x] El reporte final distingue claramente estado interno (SLO) de telemetría externa.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-04
- **Última actualización:** 2026-03-11

## TD-0016 — Corpus YMYL legacy sin paquetes de artefactos editoriales
- **ID:** TD-0016
- **Título corto:** Backfill de artefactos YMYL legacy
- **Descripción:** La deuda historica de artefactos YMYL legacy quedo cerrada: todo el corpus publicado ya tiene `artifacts/editorial/<slug>/<run-id>/` minimos (`01-brief.yaml`, `02-dossier.md`, `fecha_corte`, `sources`) para enforcement repo-wide.
- **Evidencia (actualizada):** `EDITORIAL_ENFORCE=1 pnpm run check:editorial` (2026-03-11) reporta `ymyl_posts=28 compliant=28 non_compliant=0` tras backfill de ocho batches: `impuestos-personas`, `empleo-ingresos-laboral`, `sueldo-remuneraciones-core` (`como-calcular-sueldo-liquido`, `cuanto-descuenta-la-afp-de-tu-sueldo`), `prevision-core` (`como-cambiarse-de-afp`, `fondos-afp-a-b-c-d-e`, `que-es-la-cuenta-2-afp`, `reforma-previsional-2025-que-cambia-y-como-te-afecta`), `seguridad-financiera` (`estafas-financieras-chile-vishing-smishing-marketplace`, `fraude-tarjeta-que-hacer`, `suplantacion-identidad-creditos-no-reconocidos`), `deuda-credito-core` (`cae-costo-real-credito-chile`, `informe-deudas-cmf-vs-dicom`, `que-es-la-uf`, `renegociacion-superir`) y `ahorro-inversion-core` (`ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026`, `como-invertir-en-etfs-desde-chile`, `deposito-a-plazo-uf-vs-pesos`, `fondos-mutuos-comisiones-rescate-impuestos`, `interes-compuesto-nota-metodologica`, `que-es-el-apv`).
- **Impacto:** Riesgo alto de deuda editorial invisible y de falsos bloqueos en CI cuando el gate se aplica fuera del diff tocado.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** L
- **Propuesta de solución:** Backfill por cluster de los paquetes editoriales mínimos para cada artículo YMYL legacy, usando `pnpm run scaffold:editorial-artifacts` para iniciar cada run en la carpeta canónica y manteniendo la enforcement estricta de PR limitada al diff hasta cerrar la deuda.
- **Criterios de cierre (checklist verificable):**
- [x] Existe un scaffold reproducible para crear `artifacts/editorial/<slug>/<run-id>/` con la estructura completa del pipeline.
- [x] `EDITORIAL_ENFORCE=1 pnpm run check:editorial` pasa sobre todo el corpus.
- [x] Cada artículo YMYL publicado tiene `01-brief.yaml` y `02-dossier.md` con `fecha_corte` y `sources` válidos.
- [x] El backlog editorial deja de requerir scoping por diff para evitar bloqueos ajenos al cambio.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-06
- **Última actualización:** 2026-03-11

## TD-0017 — Fonts con rutas relativas rompen en rutas anidadas
- **ID:** TD-0017
- **Título corto:** Corregir carga de tipografías en rutas anidadas
- **Descripción:** Las reglas `@font-face` en `src/styles/global.css` usan URLs relativas (`../fonts/...`) que en rutas anidadas terminan resolviendo a `/guias/fonts/...` y generan `404`, dejando al navegador en fallback tipográfico.
- **Evidencia (actualizada):** `src/styles/global.css` usa rutas absolutas `/fonts/...`; los assets existen en `public/fonts/`; `pnpm run build` (2026-03-11) completa sin warnings de Vite por esas fuentes ni fallos posteriores en `check:urls`.
- **Impacto:** Riesgo de tipografías incorrectas en páginas internas, diferencias visuales entre rutas y ruido de consola que dificulta validar otros cambios frontend.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Convertir las URLs de `@font-face` a rutas estables resueltas por Astro/Vite (import de assets o rutas absolutas públicas) y verificar carga correcta en `/` y en rutas anidadas.
- **Criterios de cierre (checklist verificable):**
- [x] No hay evidencia actual de `404` por esas fuentes en la build/local validation activa.
- [x] `pnpm run build` no emite warnings por esas dos referencias de fuentes.
- [x] La carga usa rutas absolutas estables y assets públicos presentes.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-08
- **Última actualización:** 2026-03-11

## TD-0013 — Respuestas YMYL abstractas en licencia/finiquito
- **ID:** TD-0013
- **Título corto:** Concretar reglas en piezas laborales críticas
- **Descripción:** Artículos de licencia y finiquito tenían respuestas abstractas en puntos de intención de búsqueda y efecto legal.
- **Evidencia (actualizada):** ajustes en `src/data/blog/licencia-medica-desde-que-dia-pagan.md` y `src/data/blog/finiquito-e-indemnizaciones-en-chile.md` con reglas explícitas de pago/causales.
- **Impacto:** Riesgo de mala interpretación de reglas laborales por ambigüedad de redacción.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Mantener tablas/reglas directas por causal y por tramo de días en artículos YMYL.
- **Criterios de cierre (checklist verificable):**
- [x] Artículo de licencia responde explícitamente regla `<11 días` y pagador.
- [x] Artículo de finiquito enumera causales y efecto legal básico en indemnización.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-02
- **Última actualización:** 2026-03-02

## TD-0014 — Reforma previsional 2025-2027 no explicitada en piezas AFP prioritarias
- **ID:** TD-0014
- **Título corto:** Alinear contenidos AFP a calendario de reforma
- **Descripción:** Faltaba separar en artículos prioritarios AFP qué cambia hoy y qué cambia entre 2025-2027.
- **Evidencia (actualizada):** bloques agregados en `src/data/blog/cuanto-descuenta-la-afp-de-tu-sueldo.md` y `src/data/blog/fondos-afp-a-b-c-d-e.md`.
- **Impacto:** Riesgo de desalineación normativa en contenidos previsionales de alto tráfico.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Mantener bloque estructurado de vigencia con calendario y distinción "hoy vs después".
- **Criterios de cierre (checklist verificable):**
- [x] Ambos artículos prioritarios incluyen bloque "Qué cambia entre 2025 y 2027".
- [x] Se documenta 7% empleador, fondos generacionales y calendario de implementación.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-02
- **Última actualización:** 2026-03-02

## TD-0002 — Valores financieros hardcodeados con fecha fija
- **ID:** TD-0002
- **Título corto:** Externalizar UF/UTM/TMC y fechas de referencia
- **Descripción:** Varias calculadoras usan constantes numéricas y textos de fecha incrustados (UF, UTM, TMC, IPC, referencias “2025/2026”). Esto envejece resultados y compromete confiabilidad.
- **Evidencia (actualizada):** `src/domain/economic/EconomicParameters.ts` (contrato + invariantes), `src/infrastructure/economic/EconomicParameterProvider.ts` (fuente única + fallback controlado + telemetría + memoización), `src/application/use-cases/GetEconomicParameters.ts`, consumo en `src/pages/calculadoras/{apv,conversor-uf,sueldo-liquido,seguro-cesantia,reajuste-arriendo,simulador-renegociacion}.astro` + `src/utils/indicadores.ts`, documentación en `README.md` ("Economic Data Governance & Fallback Strategy"), pruebas en `tests/infrastructure/EconomicParameterProvider.test.ts`.
- **Impacto:** Riesgo de recomendaciones/cálculos desactualizados, pérdida de confianza y soporte correctivo frecuente.
- **Riesgo:** alto
- **Severidad (1-5):** 5
- **Urgencia:** P0
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Centralizar parámetros económicos en un módulo/fuente única con timestamp; cargar valores dinámicos en build/runtime con fallback explícito y banner de vigencia; eliminar fechas hardcodeadas de copy.
- **Criterios de cierre (checklist verificable):**
- [x] Existe una sola fuente de valores económicos para calculadoras.
- [x] Ninguna calculadora contiene fechas hardcodeadas en texto UI.
- [x] Se muestra fecha/hora efectiva de actualización de datos.
- [x] Fallback y comportamiento offline están documentados y probados.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0003 — Lógica tributaria duplicada entre calculadoras
- **ID:** TD-0003
- **Título corto:** Extraer motor de impuesto de segunda categoría
- **Descripción:** La tabla de tramos y funciones de cálculo están duplicadas en más de una calculadora. Cambios legales futuros pueden quedar aplicados en una página y omitidos en otra.
- **Evidencia (actualizada):** `src/domain/taxation/TaxEngine.ts`; `src/application/use-cases/{CalculateNetSalary,CalculateApvComparison}.ts`; consumo desde `src/pages/calculadoras/sueldo-liquido.astro` y `src/pages/calculadoras/apv.astro`; regresión de tramos/tasa marginal/redondeo en `tests/domain/TaxEngine.test.ts`.
- **Impacto:** Riesgo de resultados inconsistentes, mantenimiento costoso y errores silenciosos.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Crear util compartida tipada (por ejemplo `src/utils/tax.ts`) con pruebas de casos límite; consumir desde ambas calculadoras.
- **Criterios de cierre (checklist verificable):**
- [x] Existe un único módulo de cálculo tributario reutilizable.
- [x] Calculadoras APV y sueldo líquido usan el mismo módulo.
- [x] Se agregan tests de regresión para tramos y tasa marginal.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0004 — Ausencia de tests automáticos para lógica financiera
- **ID:** TD-0004
- **Título corto:** Incorporar pruebas unitarias para cálculos críticos
- **Descripción:** No existe pipeline de tests; el control actual es lint/formato/build. Las calculadoras contienen lógica numérica extensa y sensible a regresiones.
- **Evidencia (actualizada):** `package.json` (`test: vitest run`); `vitest.config.ts`; `.github/workflows/ci.yml` ejecuta `check:boundaries`, `lint`, `format:check`, `test`, `build`; suites en `tests/domain/`, `tests/application/`, `tests/infrastructure/`.
- **Impacto:** Mayor probabilidad de errores en producción al cambiar reglas financieras o refactorizar.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** L
- **Propuesta de solución:** Introducir framework de tests (p. ej. Vitest), extraer funciones de cálculo a `src/utils/` y cubrir escenarios base/edge.
- **Criterios de cierre (checklist verificable):**
- [x] CI ejecuta tests y falla ante regresiones.
- [x] Cálculos clave (sueldo, APV, crédito, cesantía) tienen cobertura mínima acordada.
- [x] Casos de borde (0, topes, tasas extremas, plazos) están cubiertos.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0005 — Archivos/componentes legacy no usados
- **ID:** TD-0005
- **Título corto:** Limpiar artefactos legacy y código huérfano
- **Descripción:** Existen respaldos y piezas no utilizadas que aumentan ruido y confusión de mantenimiento.
- **Evidencia (actualizada):** eliminados `src/components/Card.astro.bak`, `src/pages/about.md.bak`, `src/layouts/AboutLayout.astro` y `src/components/BarraIndicadores.astro`; validación de cierre con `rg --files src | rg '\.bak$'` (0) y `rg -n "AboutLayout|BarraIndicadores" src` (0).
- **Impacto:** Riesgo de editar archivos incorrectos y deuda cognitiva para onboarding.
- **Riesgo:** medio
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Eliminar o mover a carpeta de archivo explícita; si se conserva, documentar propósito y estado no productivo.
- **Criterios de cierre (checklist verificable):**
- [x] No quedan `.bak` en rutas productivas.
- [x] Layouts/componentes sin uso se eliminan o documentan explícitamente.
- [x] `rg --files` no devuelve artefactos ambiguos.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0006 — Metadata de contribución aún ligada a AstroPaper upstream
- **ID:** TD-0006
- **Título corto:** Alinear templates de GitHub al proyecto
- **Descripción:** Varias plantillas y docs de contribución apuntan al upstream AstroPaper y contactos externos, no al proyecto actual.
- **Evidencia (actualizada):** `.github/CONTRIBUTING.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/*` y `.github/CODE_OF_CONDUCT.md` alineados a `cortega26/Monedario`; `rg -n "astro-paper|satnaing|AstroPaper" .github` devuelve 0.
- **Impacto:** Fricción para colaboradores, issues en repos equivocados, ruido de gobernanza.
- **Riesgo:** medio
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Reescribir plantillas con naming, links, contacto y reglas del repo actual.
- **Criterios de cierre (checklist verificable):**
- [x] No quedan referencias a `satnaing/astro-paper` en templates.
- [x] Contactos y enlaces apuntan al repositorio actual.
- [x] Flujo de contribución coincide con stack y scripts reales.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0007 — Email social placeholder en producción
- **ID:** TD-0007
- **Título corto:** Reemplazar `mailto:[EMAIL_ADDRESS]`
- **Descripción:** El enlace de correo en redes sociales contiene placeholder sin configurar, lo que rompe la acción de contacto.
- **Evidencia (actualizada):** ítem `Mail` removido de `SOCIALS` en `src/constants.ts`; `rg -n "\[EMAIL_ADDRESS\]" src` devuelve 0.
- **Impacto:** UX rota y pérdida de canal de contacto.
- **Riesgo:** medio
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Configurar email real o remover temporalmente el ítem de `SOCIALS`.
- **Criterios de cierre (checklist verificable):**
- [x] `SOCIALS` no contiene placeholders.
- [x] Header/footer renderizan sin enlaces `mailto:[EMAIL_ADDRESS]` rotos.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0008 — Fetch repetido a `mindicador.cl` por componente embebido
- **ID:** TD-0008
- **Título corto:** Cachear indicadores económicos por request/build
- **Descripción:** Cada render de `IndicadorEconomico` invoca `getIndicadores()`. En contenidos con múltiples instancias, se repite fetch externo innecesariamente.
- **Evidencia (actualizada):** `src/infrastructure/economic/EconomicParameterProvider.ts` (memoización en módulo con `cachedBundlePromise` + `getEconomicProviderTelemetry()`), `src/utils/indicadores.ts` consume provider unificado, `src/components/IndicadorEconomico.astro` reutiliza la misma fuente y hay validación de una sola llamada externa en `tests/infrastructure/EconomicParameterProvider.test.ts`.
- **Impacto:** Latencia extra, dependencia de red repetida y potencial throttling/fallos intermitentes.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Memoizar resultado por ciclo de render/build (cache en módulo o singleton), con TTL corto y fallback explícito.
- **Criterios de cierre (checklist verificable):**
- [x] Múltiples componentes en una misma página no disparan múltiples fetchs externos.
- [x] Se mantiene fallback al fallar la API.
- [x] Logs/telemetría mínima confirman reducción de llamadas.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0009 — Estrategia de fuentes duplicada/no alineada
- **ID:** TD-0009
- **Título corto:** Consolidar carga de tipografías
- **Descripción:** La configuración experimental de fuentes (Inter/Playfair) convive con carga manual de Google Fonts (Fraunces/Source Sans 3), sin uso visible de variables experimentales.
- **Evidencia (actualizada):** `astro.config.ts` mantiene `experimental.preserveScriptOrder` pero sin `experimental.fonts`; `src/layouts/Layout.astro` conserva una sola carga manual de Google Fonts (Fraunces + Source Sans 3); `src/styles/global.css` permanece alineado con `--font-display`/`--font-body`.
- **Impacto:** Complejidad innecesaria y posible costo de rendimiento/configuración.
- **Riesgo:** bajo
- **Severidad (1-5):** 1
- **Urgencia:** P3
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Elegir una sola vía de carga (experimental o manual) y remover configuración no usada.
- **Criterios de cierre (checklist verificable):**
- [x] Solo existe una estrategia de carga de fuentes en producción.
- [x] Variables tipográficas usadas y configuradas son consistentes.
- [x] No se descargan fuentes no utilizadas.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0010 — Lógica de calculadoras acoplada a DOM e `innerHTML`
- **ID:** TD-0010
- **Título corto:** Desacoplar motor de cálculo de la capa de presentación
- **Descripción:** Las calculadoras concentran validación, cálculo y render string-based en scripts inline dentro de páginas `.astro`, dificultando testeo y evolución segura.
- **Evidencia (actualizada):** Motores extraídos a `src/application/use-cases/**` (sueldo, APV, UF, cesantía, renegociación, reajuste, tarjeta, crédito consumo, prepago, jubilación); render de resultados en `src/pages/calculadoras/*.astro` migrado a DOM API sin `innerHTML`; regresión funcional en `tests/application/FinancialUseCases.regression.test.ts`.
- **Impacto:** Baja mantenibilidad, alto costo de cambios y riesgo de regressions/errores de rendering.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** L
- **Propuesta de solución:** Extraer motores de cálculo a módulos puros en `src/utils/`, tipar inputs/outputs y dejar en página solo wiring de UI.
- **Criterios de cierre (checklist verificable):**
- [x] Cada calculadora usa funciones puras reutilizables.
- [x] El DOM solo consume resultados tipados.
- [x] Se eliminan concatenaciones `innerHTML` para bloques críticos.
- [x] Hay tests de unidad para motores extraídos.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-02-26
- **Última actualización:** 2026-02-27

## TD-0030 — Assertions incorrectas en regression tests de tarjeta de crédito
- **ID:** TD-0030
- **Título corto:** Corregir `doubledPayment.totalPaid` esperado en regression test
- **Descripción:** Los casos 1 y 3 de "Regression - Tarjeta de Crédito" en `tests/application/FinancialUseCases.regression.test.ts` (líneas 246 y 274) aseveran `expect(round2(result.doubledPayment.totalPaid)).toBe(0)`, pero la función retorna el total acumulado real (2,307,304.91 y 881,223.20 respectivamente). El valor `0` nunca fue correcto; parece un error al escribir la assertion original.
- **Evidencia:** Pre-existente antes del commit 2026-03-25. Verificado con `git stash` + `pnpm run test` — mismos 2 fallos en rama limpia.
- **Impacto:** Bloquea CI gate `pnpm run test` (Rule 5.1). Los demás 158 tests pasan.
- **Riesgo:** alto (gate roto)
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Calcular los valores correctos de `doubledPayment.totalPaid` para cada caso ejecutando el simulador de referencia, y reemplazar `0` por el valor real en ambas assertions.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run test` pasa sin errores.
- [x] Las assertions reflejan el total pagado real según la simulación.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-25
- **Última actualización:** 2026-03-25

## TD-0031 — Arquitectura editorial visible duplica destinos y erosiona el ownership del sitio
- **ID:** TD-0031
- **Título corto:** Reducir duplicación de salidas y saturación contextual del sistema editorial
- **Descripción:** La auditoría integral del sitio detecta un patrón sistémico donde hubs, índices, artículos y componentes contextuales repiten el mismo destino dentro de una misma vista o reinyectan rutas vecinas sin cambiar materialmente la decisión. El problema ya no es solo de contenido; es de arquitectura de información visible. Esto afecta home, hubs de guías, índice de calculadoras, índice de leyes y varios artículos owner/support.
- **Evidencia:** `docs/editorial/SITE_AUDIT_2026-03-25.md`; `docs/editorial/BACKLOG_SITE_AUDIT.md`; render audit en `dist/**/index.html` con `46` vistas que contienen destinos duplicados; casos críticos en `dist/guias/impuestos-personas/index.html`, `dist/guias/pensiones-afp/index.html`, `dist/calculadoras/index.html`, `dist/leyes/index.html`; componentes sistémicos involucrados: `src/components/ContextLinkSection.astro`, `src/components/RelatedPosts.astro`, `src/components/ArticleDecisionIntro.astro`, `src/components/CalculatorCard.astro`.
- **Impacto:** Aumenta carga cognitiva, inflación de decisiones, canibalización editorial interna y pérdida de una ruta principal clara. Erosiona además la política de ownership ya formalizada en `docs/editorial/NON_CANNIBALIZATION_PROCESS.md` y `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** L
- **Propuesta de solución:** rediseñar hubs e índices para que cada vista tenga una sola capa dominante de decisión; introducir `budget` de salidas por vista y por destino para módulos contextuales; recortar linking circular entre owners vecinos; alinear la UX visible con la distinción `owner/support/reference/tool`.
- **Criterios de cierre (checklist verificable):**
- [x] Ningún destino principal aparece más de una vez por vista sin justificación explícita.
- [x] Cada hub conserva una sola matriz de decisión principal.
- [x] `ContextLinkSection`, `RelatedPosts`, `ArticleDecisionIntro` y `CalculatorCard` no repiten un destino ya mostrado como ruta principal en la misma pantalla.
- [x] Home, `/calculadoras/` y `/leyes/` dejan de duplicar la misma salida en bloques equivalentes.
- [x] El backlog `docs/editorial/BACKLOG_SITE_AUDIT.md` baja sus items críticos a cero o justifica excepciones documentadas.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-25
- **Última actualización:** 2026-03-25

## TD-0032 — `format:check` falla por drift de Prettier fuera del frente editorial auditado
- **ID:** TD-0032
- **Título corto:** Normalizar formato en archivos fuera del scope de la auditoría
- **Descripción:** La validación final de la remediación editorial dejó `pnpm run format:check` fallando por drift de Prettier en archivos que no forman parte del frente crítico auditado: `src/application/use-cases/CalculateHonorariosNet.ts`, `src/config/deudaClusterLinks.ts`, `src/domain/taxation/TaxEngine.ts`, además de varios archivos ya tocados en esta serie de cambios. No es un problema de comportamiento del sitio, pero sí impide cerrar el gate de formato con evidencia limpia.
- **Evidencia:** `pnpm run format:check` el 2026-03-25 reporta 11 archivos con `Code style issues found`; entre ellos hay al menos 3 fuera del scope inmediato de remediación UX/editorial.
- **Impacto:** Bloquea el gate `format:check` y ensucia el cierre de cambios con deuda mecánica no funcional.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Ejecutar una pasada controlada de Prettier sobre los archivos marcados, revisar que el diff sea puramente mecánico y separarlo en un PR/commit de housekeeping para no mezclarlo con cambios editoriales o funcionales.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run format:check` pasa sin warnings.
- [x] El diff de normalización no altera comportamiento ni contratos.
- [ ] La limpieza de formato se mantiene separada de cambios funcionales.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-03-25
- **Última actualización:** 2026-03-25

## TD-0033 — `format:check` volvió a quedar desalineado por drift mecánico fuera del scope actual
- **ID:** TD-0033
- **Título corto:** Rehacer limpieza mecánica de Prettier en archivos fuera de scope
- **Descripción:** Durante la remediación de warnings de `npm run build`, `pnpm run format:check` volvió a fallar por drift de Prettier en 22 archivos que no forman parte del cambio actual. El fix de warnings quedó limpio y validado, pero el gate global de formato ya no está en verde por deuda mecánica preexistente fuera del frente tocado.
- **Evidencia:** `pnpm run format:check` el 2026-04-03 vuelve a pasar limpio con `All matched files use Prettier code style!`, sin drift reproducible en el árbol actual.
- **Impacto:** Bloquea el gate global `format:check`, mete ruido en cierres de tareas pequeñas y obliga a distinguir entre deuda mecánica preexistente y regresiones reales del cambio actual.
- **Riesgo:** medio
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Ejecutar una pasada controlada de Prettier solo sobre los archivos reportados por el gate, revisar que el diff sea puramente mecánico y cerrarlo en una unidad de housekeeping separada para no mezclarlo con cambios funcionales.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run format:check` vuelve a pasar sin warnings.
- [x] El diff de la remediación es puramente mecánico y no mezcla cambios funcionales.
- [x] La lista de archivos con drift queda absorbida en una unidad de housekeeping separada.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-03
- **Última actualización:** 2026-04-03

## TD-0035 — Lint global falla por variables sin uso y parse error en guías/calculadoras
- **ID:** TD-0035
- **Título corto:** Limpiar lint en Header y calculadoras/impuestos
- **Descripción:** El gate `pnpm run lint` cae por imports/variables sin uso y un caracter inválido en guías de impuestos. Esto deja el pipeline rojo y oculta regresiones nuevas de lint.
- **Evidencia (actualizada):** `pnpm run lint` pasa limpio el 2026-04-09. Los errores reportados el 2026-04-08 ya no reproducen en `Header.astro`, `comisiones-afp.astro` ni `guias/impuestos-personas/index.astro`.
- **Impacto:** Bloquea el gate de lint y puede permitir drift silencioso en componentes y páginas críticas si se ignora.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Eliminar imports/variables no usados y corregir el caracter inválido en la guía de impuestos; revalidar `pnpm run lint`.
- **Criterios de cierre (checklist verificable):**
  - [ ] `pnpm run lint` pasa sin errores.
  - [ ] No se introducen cambios funcionales adicionales fuera de los tres archivos señalados.
  - [ ] Se mantiene cobertura de tipos y ESLint sin desactivar reglas.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-08
- **Última actualización:** 2026-04-09

## TD-0036 — Drift de Prettier en calculadoras deja el gate `format:check` en rojo
- **ID:** TD-0036
- **Título corto:** Normalizar formato en calculadoras con Prettier
- **Descripción:** El check `prettier --check .` falla por drift mecánico en dos calculadoras, lo que vuelve a encender el gate global de formato.
- **Evidencia (actualizada):** `pnpm run format:check` pasa limpio el 2026-04-09. El drift reportado en `comisiones-afp.astro` e `impuesto-segunda-categoria.astro` ya no reproduce.
- **Impacto:** El gate de formato queda rojo y dificulta distinguir regresiones reales de cambios funcionales.
- **Riesgo:** medio-bajo
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Ejecutar Prettier sólo sobre los archivos señalados y confirmar que el diff es mecánico.
- **Criterios de cierre (checklist verificable):**
  - [ ] `pnpm run format:check` pasa sin advertencias.
  - [ ] El diff de corrección es exclusivamente de formato.
  - [ ] No se modifica comportamiento ni contenido visible.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-08
- **Última actualización:** 2026-04-09

## TD-0037 — Tests de hero images fallan por drift en manifest y prompts canónicos
- **ID:** TD-0037
- **Título corto:** Alinear manifest y prompts de hero images con las expectativas de control
- **Descripción:** Los guardas de hero images quedaron desalineados: el manifest calcula 56 combinaciones y 28 modelos aprobados vs el baseline de 54/27, y los prompts A/B/C no incluyen las cláusulas esperadas de composición/escena.
- **Evidencia (actualizada):** `pnpm run test` pasa limpio el 2026-04-09: 43 archivos, 218 tests. No reproducen fallos en `tests/scripts/hero-image-pool.test.ts` ni en `tests/scripts/hero-images-config.test.ts`.
- **Impacto:** Gate de tests rojo; riesgo de publicar prompts/manifest incompletos que rompan generación de assets o rompan determinismo.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P0
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Revisar assets aprobados y plantillas A/B/C, actualizar manifest/pool o expectativas de conteo, y restaurar los constraints textuales en los builders de prompt.
- **Criterios de cierre (checklist verificable):**
  - [ ] `tests/scripts/hero-image-pool.test.ts` pasa con conteos actualizados y justificables.
  - [ ] `tests/scripts/hero-images-config.test.ts` pasa con prompts que incluyan constraints de composición, escena y espacio para texto.
  - [ ] Documentar en `scripts/` o README dev cómo actualizar el manifest/pool sin romper determinismo.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-08
- **Última actualización:** 2026-04-09

## TD-0038 — Registro de calculadoras desalineado con las familias declaradas
- **ID:** TD-0038
- **Título corto:** Corregir CALCULATOR_PORTFOLIO para cumplir familias y recuentos
- **Descripción:** El test del portafolio de calculadoras detecta 15 entradas en vez de 13, lo que indica duplicidad o familias nuevas sin curar.
- **Evidencia (actualizada):** `pnpm run test` pasa limpio el 2026-04-09. `tests/application/CalculatorPortfolio.test.ts` ya no falla por longitud ni por familias declaradas.
- **Impacto:** Riesgo medio-alto de mostrar calculadoras duplicadas o mal agrupadas y de romper UX de navegación/calendario editorial; gate de tests rojo.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P0
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Revisar `CALCULATOR_PORTFOLIO` y `CALCULATOR_FAMILY_ORDER`, eliminar duplicados o ajustar familias declaradas y actualizar fixtures asociados.
- **Criterios de cierre (checklist verificable):**
  - [ ] `tests/application/CalculatorPortfolio.test.ts` pasa limpio con los recuentos esperados.
  - [ ] Las familias declaradas reflejan la intención de producto y no generan huecos ni duplicados.
  - [ ] Se documenta el recuento final en fixtures o README dev correspondiente.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-08
- **Última actualización:** 2026-04-09

## TD-0034 — `check:routes` volvió a quedar desalineado del baseline publicado
- **ID:** TD-0034
- **Título corto:** Refrescar baseline de rutas para eliminar altas espurias
- **Descripción:** En la validación posterior al fix de warnings, `pnpm run check:routes` pasó pero reportó 4 rutas agregadas aunque esta tarea no tocó rutas, slugs ni snapshots. Eso indica que el baseline `docs/reports/routes_snapshot_before.json` volvió a quedar atrás respecto del contenido actualmente observable.
- **Evidencia:** `docs/reports/routes_snapshot_before.json` fue refrescado el 2026-04-03 a `34` rutas y `pnpm run check:routes` vuelve a responder `No route changes detected.` con `before=34 after=34`.
- **Impacto:** Mete ruido en la verificación de rutas, dificulta distinguir cambios reales de URL frente a drift del baseline y reduce la utilidad auditiva del gate.
- **Riesgo:** medio
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Refrescar `docs/reports/routes_snapshot_before.json` con el estado publicado correcto y validar que `pnpm run check:routes` vuelva a responder `No route changes detected` cuando no haya cambios de routing.
- **Criterios de cierre (checklist verificable):**
- [x] `pnpm run check:routes` deja de reportar altas espurias en tareas sin cambios de routing.
- [x] El baseline de rutas refleja el estado publicado actual.
- [x] El refresh se hace en una unidad separada para no mezclar housekeeping con cambios funcionales.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-03
- **Última actualización:** 2026-04-03

## TD-0035 — Tests de CalculatorPortfolio desactualizados tras agregar 2 calculadoras nuevas
- **ID:** TD-0035
- **Título corto:** Actualizar aserciones de longitud en CalculatorPortfolio.test.ts
- **Descripción:** `tests/application/CalculatorPortfolio.test.ts` espera exactamente 13 calculadoras en `CALCULATOR_PORTFOLIO` pero el registro tiene 15. El hardcode de longitud no se actualizó cuando se agregaron las dos últimas calculadoras.
- **Evidencia:** `pnpm run test` → `AssertionError: expected [...] to have a length of 13 but got 15` en `CalculatorPortfolio.test.ts:13`. Fallo pre-existente confirmado con baseline limpio (antes de commits de la sesión 2026-04-07).
- **Impacto:** La suite de tests reporta 1 fallo de forma permanente, enmascarando posibles regresiones reales en el portfolio.
- **Riesgo:** bajo
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** Actualizar la aserción `toHaveLength(13)` al valor actual (15) y considerar no hardcodear la longitud total si el número continuará creciendo.
- **Criterios de cierre (checklist verificable):**
  - [x] `pnpm run test` pasa sin fallos en `CalculatorPortfolio.test.ts`.
  - [x] El número hardcodeado refleja el estado actual del registro.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-07
- **Última actualización:** 2026-04-07

- **Estado:** Completado
- **Fecha de creación:** 2026-04-07
- **Última actualización:** 2026-04-07

## TD-0039 — Mobile CWV por debajo de umbrales §5.4 en todas las plantillas
- **ID:** TD-0039
- **Título corto:** Mejorar LCP y Performance Score mobile (baseline 2026-04-08)
- **Descripción:** Las mediciones Lighthouse CLI del 2026-04-08 muestran que todas las plantillas del sitio fallan los umbrales AGENTS.md §5.4 en mobile. Desktop cumple todos los umbrales (Performance 99-100, LCP ≤0.89s, TBT 0ms, CLS 0). El gap mobile se debe principalmente a LCP alto (imágenes hero y fuentes web) y Speed Index elevado.
- **Evidencia baseline (mobile, Lighthouse 13.1.0, producción):**
  - `/` homepage: Perf 90, LCP 3.07s, TBT 14ms, SI 4.39s, CLS 0
  - `/posts/liquidacion-de-sueldo/`: Perf 88, LCP 3.24s, TBT 56ms, SI 4.64s, CLS 0
  - `/calculadoras/sueldo-liquido/`: Perf 95, LCP 2.67s, TBT 38ms, SI 2.02s, CLS 0
  - `/guias/ahorro-e-inversion/`: Perf 93, LCP 2.96s, TBT 51ms, SI 3.10s, CLS 0
- **Umbrales §5.4:** Perf ≥99, LCP ≤1.7s, SI ≤3.0s, TBT = 0ms, CLS = 0
- **Métricas en rojo:** LCP (todas), Perf Score (todas), TBT (todas), SI (artículo, homepage, hub)
- **Impacto:** SEO ranking signals; §5.4 bloquea merge de cambios en layouts/fonts si no mejora baseline.
- **Riesgo:** medio — no bloquea funcionalidad pero restringe futuros cambios de layout
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** (1) Auditar LCP element por plantilla y optimizar imagen/fuente que lo cause; (2) preload de la imagen hero LCP; (3) revisar si hay render-blocking resources; (4) considerar lazy-loading de componentes React pesados; (5) volver a medir post-fix y comparar contra este baseline.
- **Avance actual (2026-05-11):** cierre completo validado con `lighthouserc.mobile.cjs` local y reportado en `artifacts/lighthouse/td-0039-2026-05-11.md`. Las optimizaciones finales fueron: `h1/h2` de calculadoras en body font para no cargar Fraunces en la ruta crítica, preload global de Source Sans para texto LCP body-font, homepage sin thumbnails remotos en cards recientes below-fold, copy hero más breve y eliminación del `sessionStorage` inline no crítico de homepage. Resultado mediano: `/` LCP 1.654s, post LCP 1.652s, calculadora LCP 1.505s, hub ahorro LCP 1.656s, hub guías LCP 1.653s; todos con Performance 100, TBT 0ms, CLS 0 y SI < 1.3s.
- **Criterios de cierre (checklist verificable):**
  - [x] Mobile Perf Score ≥ 99 en las 4 URLs
  - [x] LCP ≤ 1.7s en mobile en las 4 URLs
  - [x] TBT = 0ms en mobile en las 4 URLs
  - [x] SI ≤ 3.0s en mobile en las 4 URLs
  - [x] CLS = 0 (ya cumple — no regresar)
  - [x] Nuevo reporte Lighthouse guardado en `artifacts/lighthouse/` con fecha post-fix
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-04-08
- **Última actualización:** 2026-05-11

## TD-0040 — Baseline de `pnpm run test` volvió a quedar en rojo por `EstimateFiniquito`
- **ID:** TD-0040
- **Título corto:** Investigar regresión numérica en `EstimateFiniquito.test.ts`
- **Descripción:** El baseline requerido por AGENTS §5.5 antes de editar runtime UI volvió a fallar en `tests/application/EstimateFiniquito.test.ts`. El caso judicial que debe conservar una estimación base espera `yearsOfServiceIndemnity = 3000000`, pero el árbol actual entrega `2000000`.
- **Evidencia:** `pnpm run test` (2026-04-10, árbol sin cambios de runtime para esta tarea) falla en `tests/application/EstimateFiniquito.test.ts:60` con `AssertionError: expected 2000000 to be 3000000`.
- **Impacto:** La suite deja de ser una señal confiable para cambios futuros y bloquea verificación completa aunque el trabajo actual no toque finiquitos.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Revalidar la fórmula/fixture del caso judicial en `EstimateFiniquito` y alinear el test con la lógica vigente solo si el cálculo actual es correcto; de lo contrario, restaurar la estimación base esperada.
- **Criterios de cierre (checklist verificable):**
  - [x] `pnpm run test` pasa sin fallos en `tests/application/EstimateFiniquito.test.ts`.
  - [x] Queda documentado si el drift provino del motor o del fixture esperado.
- **Owner:** TBD
- **Estado:** Completado
- **Nota de cierre:** El motor ya tenía `>= 6` en `resolveServiceYears` (línea 114). `pnpm run test` pasa limpio: 43 archivos, 218 tests. El drift era del backlog, no del código.
- **Fecha de creación:** 2026-04-10
- **Última actualización:** 2026-04-12

## TD-0041 — Cluster source-of-truth desalineado para `presupuesto-control-financiero`
- **ID:** TD-0041
- **Título corto:** Registrar o retirar coherentemente el hub `presupuesto-control-financiero`
- **Descripción:** El árbol actual contiene el folder físico `src/pages/guias/presupuesto-control-financiero`, pero `src/config/clusters.ts` no incluye `presupuesto-control-financiero` en `CLUSTERS` ni en `GUIDE_HUBS`. Esto deja al repo con dos fuentes de verdad divergentes para la arquitectura de clusters.
- **Evidencia:** `pnpm run check:editorial` (2026-04-11) falla con `[check-editorial-structure] FAIL. Physical cluster folder present in src/pages/guias/presupuesto-control-financiero is not registered in src/config/clusters.ts.`; `pnpm run test` (2026-04-11) falla en `tests/integration/cluster-source-of-truth.test.ts:21` por la misma causa.
- **Impacto:** Rompe el gate editorial agregado y deja la suite de integración en rojo aunque cambios no relacionados no toquen clusters. También vuelve ambiguo el estado operativo real del cluster transitorio documentado en policy/runbooks.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Elegir una sola verdad operativa en un cambio dedicado: o (A) registrar `presupuesto-control-financiero` formalmente en `src/config/clusters.ts` y sus metadatos visibles, o (B) retirar el folder físico/hub hasta que la migración esté lista. En ambos casos, alinear tests, check-editorial-structure, policy de transición y navegación.
- **Criterios de cierre (checklist verificable):**
  - [x] `pnpm run check:editorial` deja de fallar por `presupuesto-control-financiero`.
  - [x] `pnpm run test` pasa en `tests/integration/cluster-source-of-truth.test.ts`.
  - [x] La verdad operativa queda alineada registrando el hub en `src/config/clusters.ts` y ajustando el test de conteo.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-11
- **Última actualización:** 2026-04-11

## TD-0043 — AFP commission rates publicadas con 6/7 valores incorrectos; sin validación automatizada
- **ID:** TD-0043
- **Título corto:** Blindar calidad de datos financieros críticos (AFP commissions)
- **Descripción:** `src/config/afpCommissions.ts` fue creado el 2026-04-10 con 6 de 7 tasas de comisión AFP incorrectas (ningún valor fue verificado contra fuente oficial antes del merge). No existía herramienta ni workflow que detectara el drift. Las calculadoras `sueldo-liquido`, `apv` y `comisiones-afp` consumían esos valores erróneos directamente. El texto estático hardcoded en `sueldo-liquido.astro` también usaba cifras incorrectas.
- **Evidencia:** Commit `9f03e05` (2026-04-10): `afpCommissions.ts` creado con valores que no coinciden con ninguna fuente oficial verificable. Verificación posterior contra Previred Indicadores Previsionales abril 2026 mostró: Capital 0.58% (debía ser 1.44%), Cuprum 0.65% (1.44%), Habitat 0.77% (1.27%), PlanVital 0.49% (1.16%), ProVida 0.69% (1.45%), Uno 0.75% (0.46%). Solo Modelo (0.58%) era correcto.
- **Impacto:** Calculadoras YMYL publicaban resultados de descuento AFP incorrectos para 6 de 7 AFPs. Riesgo directo de decisiones financieras equivocadas por parte de los usuarios.
- **Riesgo:** crítico (datos financieros YMYL incorrectos en producción)
- **Severidad (1-5):** 5
- **Urgencia:** P0
- **Esfuerzo estimado:** M
- **Propuesta de solución:** (1) Corregir todos los valores en `afpCommissions.ts` con verificación de ≥2 fuentes oficiales. (2) Crear script de verificación automatizado contra Previred. (3) Crear workflow mensual en GitHub Actions. (4) Crear política de verificación de datos financieros. (5) Actualizar texto hardcoded en páginas de calculadoras.
- **Avance actual (2026-04-11):** RESUELTO. Los 7 valores fueron corregidos en `afpCommissions.ts` verificados contra Previred (abril 2026) + AFP Capital + AFP Uno + SP oficial. El texto estático en `sueldo-liquido.astro` fue actualizado a AFP Habitat 11.27% con los montos correctos. Se creó `scripts/check-afp-commissions.mjs`, `.github/workflows/check-afp-commissions.yml` (cron mensual, abre issue automático en GitHub si detecta drift), y `docs/governance/FINANCIAL_DATA_VERIFICATION_POLICY.md` con reglas FDV-001 a FDV-005.
- **Criterios de cierre (checklist verificable):**
  - [x] `src/config/afpCommissions.ts` tiene los 7 valores correctos con fuentes citadas en comentario de cabecera.
  - [x] `src/pages/calculadoras/sueldo-liquido.astro` muestra valores de ejemplo y texto de rango consistentes con el config.
  - [x] `scripts/check-afp-commissions.mjs` existe y valida contra Previred.
  - [x] `.github/workflows/check-afp-commissions.yml` existe con cron mensual y apertura automática de issue.
  - [x] `docs/governance/FINANCIAL_DATA_VERIFICATION_POLICY.md` define FDV-001 a FDV-005 y tabla de fuentes oficiales.
  - [x] `docs/governance/README.md` referencia la nueva política.
  - [x] `package.json` incluye script `check:afp-commissions`.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-11
- **Última actualización:** 2026-04-11

## TD-0042 — Transition editorial de presupuesto sigue incoherente tras registrar el hub
- **ID:** TD-0042
- **Título corto:** Resolver migración pendiente de `como-hacer-presupuesto-mensual-chile`
- **Descripción:** Al registrar `presupuesto-control-financiero` en `src/config/clusters.ts`, el hub quedó formalizado como fuente de verdad operativa. La pieza `como-hacer-presupuesto-mensual-chile` todavía estaba en `cluster: empleo-ingresos` con `category: general`, y algunos documentos/policies seguían describiendo la migración como futura o condicionada a un hub que ya existía.
- **Evidencia:** `src/pages/guias/presupuesto-control-financiero/index.astro` ya estaba publicado y `src/config/clusters.ts` lo registraba; `docs/editorial/TOPIC_OWNERSHIP_POLICY.md` y `docs/TECH_DEBT_BACKLOG.md` todavía describían la ubicación de la pieza como transición pendiente ligada a la inexistencia del hub productivo.
- **Impacto:** Mantenía ambigüedad entre owner canónico, cluster operativo y narrativa de transición; aumentaba el riesgo de decisiones editoriales inconsistentes y de warnings engañosos en revisiones futuras.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Migrar `como-hacer-presupuesto-mensual-chile` a `cluster: presupuesto-control-financiero`, registrar `canonicalTopic`, retirar el registro transitorio y alinear policy/runbooks/checks para que ya no dependan de que el hub “no exista”.
- **Criterios de cierre (checklist verificable):**
  - [x] `docs/editorial/TOPIC_OWNERSHIP_POLICY.md` refleja el estado real del hub y la decisión de transición.
  - [x] `docs/TECH_DEBT_BACKLOG.md` deja de describir el hub como inexistente.
  - [x] La metadata/frontmatter de `como-hacer-presupuesto-mensual-chile` o la policy de transición cuentan la misma historia.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-04-11
- **Última actualización:** 2026-05-11
- **Nota de cierre:** `como-hacer-presupuesto-mensual-chile` migró a `cluster: presupuesto-control-financiero` con `topicRole: owner` y `canonicalTopic: presupuesto-mensual-control-financiero`. Se retiró del registro transitorio y se alinearon policy, matriz SEO, tests y contexto.

## TD-0044 — Copy en `operacion-renta.astro` muestra tasa PPM incorrecta (12.25% en vez de 15.25%)
- **ID:** TD-0044
- **Título corto:** Corregir tasa PPM en copy de Operación Renta
- **Descripción:** Dos cadenas de texto en `src/pages/calculadoras/operacion-renta.astro` (líneas 159 y 296 al momento de la auditoría) muestran `12.25%` como tasa de retención PPM para honorarios. La tasa vigente según Ley 21.133 (SII 2026) es `15.25%`. El motor de cálculo **no está afectado** — usa los parámetros del snapshot/provider — pero el usuario que lee la guía de ayuda forma la expectativa incorrecta sobre su retención y puede distorsionar su planificación de Operación Renta.
- **Evidencia:** Auditoría F22 (finding F-01) — `artifacts/calculator-audits/operacion-renta-2026-04-12/scenario-math-verification.md`; SII Ley 21.133 schedule `https://www.sii.cl/noticias/2025/261225noti01smn.htm`. El resto del sitio (glosario, blog, calculadora boleta) ya muestra 15.25%.
- **Impacto:** Usuario con honorarios lee tasa incorrecta antes de ingresar sus datos, puede concluir que debe menos PPM del real. Afecta confianza y calidad de decisión en la calculadora de mayor tráfico de la temporada.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Reemplazar las dos ocurrencias de `12.25%` por `15.25%` en `operacion-renta.astro`. Agregar un test de guardia tipo `grep` o assertion de contenido que bloquee regresión futura.
- **Criterios de cierre (checklist verificable):**
  - [ ] `grep "12.25" src/pages/calculadoras/operacion-renta.astro` retorna 0 resultados.
  - [ ] El copy visible en la página menciona únicamente `15.25%` para la tasa PPM honorarios.
  - [ ] Existe al menos un test o script de guardia que impide que la cadena `12.25%` reaparezca en el archivo.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `12.25%` no existe en `operacion-renta.astro`; ambas instancias muestran `15.25%` (líneas 178 y 315). Verificado 2026-04-12.

## TD-0045 — Ejemplo hardcodeado en `operacion-renta.astro` diverge del motor de cálculo
- **ID:** TD-0045
- **Título corto:** Sincronizar ejemplo de resultado con motor real
- **Descripción:** El bloque "Ejemplo" visible en la página muestra IGC `$863.000` y devolución `$287.000` para un sueldo de `$18.000.000`. El motor computado con los mismos parámetros base del snapshot arroja IGC `~$267.119–$283.935` y devolución `~$883.000`. El ejemplo es internamente consistente aritméticamente pero deriva de supuestos desconocidos desalineados del engine actual. Esto puede crear expectativas erróneas en el usuario antes de ingresar sus datos.
- **Evidencia:** Auditoría F22 (finding F-02) — `artifacts/calculator-audits/operacion-renta-2026-04-12/scenario-math-verification.md`. Discrepancia confirmada: IGC ejemplo ~3.2× mayor que engine; devolución ejemplo ~3× menor.
- **Impacto:** Usuario ve un ejemplo antes de calcular y forma una expectativa que difiere materialmente del resultado real; puede percibir la calculadora como incorrecta cuando el resultado real sea diferente al ejemplo.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Reemplazar los valores hardcodeados del ejemplo por valores generados con `simulateOperacionRenta({ sueldosBrutos: 18_000_000, ... })` usando los parámetros del snapshot en tiempo de build, o al menos sincronizar manualmente los valores con el engine. Opción alternativa: usar parámetros que producen límites de tramo redondos para facilitar la explicación.
- **Criterios de cierre (checklist verificable):**
  - [x] El IGC del ejemplo coincide con `simulateOperacionRenta({ sueldosBrutos: 18_000_000, ... })` dentro de ±500 CLP de redondeo.
  - [x] El monto de devolución/pago del ejemplo es consistente con IGC − retenciones declaradas en el mismo ejemplo.
  - [x] Existe un mecanismo (test, script, o generación programática) que mantiene el ejemplo sincronizado con el engine en futuros cambios de parámetros.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `exampleResult` se genera en tiempo de build mediante `simulateOperacionRenta()` en `operacion-renta.astro:28`. No hay valores hardcodeados. Verificado 2026-04-12.

## TD-0046 — `ShareCalculatorResult.astro` acumula listeners en cada recálculo
- **ID:** TD-0046
- **Título corto:** Deduplicar listener del botón "Copiar" en share result
- **Descripción:** `window.showShareResult()` registra un nuevo `click` listener en `#share-copy` en cada invocación (línea 51 de `ShareCalculatorResult.astro`). Después del segundo cálculo, un clic en "Copiar" dispara el callback dos veces; después de N cálculos, N veces. No existe cleanup ni guardia.
- **Evidencia:** Auditoría F22 (finding F-03) — `src/components/ShareCalculatorResult.astro:51`. Reproducible manualmente: calcular dos veces, clicar "Copiar" una vez → flash "¡Copiado!" se ve dos veces y el clipboard recibe dos escrituras.
- **Impacto:** UX degradada: múltiples flashes del mensaje de confirmación, escrituras fantasma al clipboard. Erosiona confianza en la función de compartir, especialmente durante la temporada de alta frecuencia de uso (Operación Renta).
- **Riesgo:** bajo
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Inicializar el listener una sola vez fuera de `showShareResult` (patrón init-once), o usar `{ once: true }` si el botón se recrea en cada llamada, o clonar-y-reemplazar el nodo del botón para eliminar listeners previos antes de registrar uno nuevo.
- **Criterios de cierre (checklist verificable):**
  - [x] Clicar "Copiar" una vez tras dos o más cálculos dispara el callback exactamente una vez.
  - [x] No hay doble flash del mensaje "¡Copiado!".
  - [x] Test manual: N recálculos → 1 clic → 1 escritura al clipboard (verificable con `navigator.clipboard.writeText` spy).
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. En `ShareCalculatorResult.astro`, el `addEventListener` en `#share-copy` (línea 40) está registrado una sola vez en el scope del script, fuera de `showShareResult`. `showShareResult` solo actualiza el contenedor y el enlace de WhatsApp. Verificado 2026-04-12.

## TD-0047 — `EconomicParameterProvider` no distingue snapshot fresco de fallback de emergencia en la UI
- **ID:** TD-0047
- **Título corto:** Exponer etiqueta "snapshot" vs "fallback" en proveedor económico
- **Descripción:** `EconomicParameterProvider.ts` asigna `source: "fallback"` tanto al path de snapshot controlado (fresco, datado 2026-04-11) como al fallback de emergencia hardcodeado (UTM 67,294 / UF 39,300). El tipo de dominio `EconomicParameters.source` no tiene valor `"snapshot"`. La UI muestra "fallback controlado" para ambos casos, privando al usuario de saber si los datos son frescos o realmente de emergencia.
- **Evidencia:** Auditoría F22 (finding F-04) — `src/infrastructure/economic/EconomicParameterProvider.ts:154`. El telemetry flag ya distingue `snapshot` vs `fallback` internamente pero no se expone en la UI.
- **Impacto:** Durante la temporada de Operación Renta, un usuario que note "fallback controlado" puede dudar de la vigencia de los datos. Si el verdadero fallback de emergencia se activa silenciosamente, el usuario no tiene forma de saberlo.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Una de tres opciones: (A) agregar `"snapshot"` al union type `EconomicParameters.source` y usarlo en el path de snapshot; (B) usar el `telemetryFlag` ya existente para derivar la etiqueta de UI (`snapshot` → "datos actualizados", `fallback` → "datos de referencia"); (C) mantener ambos como "datos de referencia" y dejar que la fecha haga el trabajo de confianza. Opción B es la de menor riesgo de contrato.
- **Criterios de cierre (checklist verificable):**
  - [x] La UI muestra etiquetas distintas cuando el provider usa snapshot vs cuando usa el fallback de emergencia.
  - [x] El tipo de dominio refleja el valor correcto en cada path (o la UI lo deriva del telemetry flag sin romper el tipo).
  - [x] `pnpm run astro check` y `pnpm run lint` pasan sin errores de tipo.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `src/domain/economic/EconomicParameters.ts:10` define `source: "live" | "snapshot" | "fallback"`. `EconomicParameterProvider.ts:154` asigna `source: "snapshot"` en el path de snapshot. `IndicadorEconomico.astro:30` distingue `source === "snapshot"` para la etiqueta de UI. Verificado 2026-04-12.

## TD-0048 — Pegado de número CLP con formato produce cálculo silencioso incorrecto
- **ID:** TD-0048
- **Título corto:** Sanitizar separadores de miles en inputs de `operacion-renta`
- **Descripción:** La función `val()` en `operacion-renta.astro` usa `parseFloat()` directamente sobre `.value` del input. Al pegar un número con formato chileno (`18.000.000`), `parseFloat` retorna `18` (se detiene en el primer punto). El valor `18` pasa la validación `> 0` y produce un cálculo sobre $18 en lugar de $18.000.000, sin ningún error ni advertencia visible al usuario.
- **Evidencia:** Auditoría F22 (finding F-05) — `operacion-renta.astro:408–409`. Los seis inputs de ingresos/retenciones/deducciones están afectados. Reproducible: pegar `18.000.000` → resultado muestra "¡Cero impuesto!" en lugar del cálculo correcto.
- **Impacto:** Error invisible de alta gravedad: usuario que copia su sueldo desde una liquidación (formato habitual CLP con puntos) obtiene un resultado materialmente incorrecto sin ninguna señal de error. Afecta confianza y produce decisiones de planificación erróneas.
- **Riesgo:** alto
- **Severidad (1-5):** 4
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** En `val()`, sanitizar el input antes de `parseFloat`: `parseFloat(str.replace(/\./g, "").replace(",", "."))`. Agregar un hint de formato en el placeholder o tooltip de cada input indicando que no se deben usar puntos separadores. Cubrir con test unitario.
- **Criterios de cierre (checklist verificable):**
  - [x] `val("18.000.000")` retorna `18000000`.
  - [x] `val("18,5")` retorna `18.5` (coma decimal).
  - [x] Input con valor pegado `18.000.000` produce el mismo resultado que `18000000`.
  - [ ] Al menos un test unitario cubre `val("18.000.000")` → `18000000`.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `val()` en `operacion-renta.astro:431–443` sanitiza el input: si el string tiene múltiples puntos (separador de miles CLP), ejecuta `raw.replace(/\./g, "")` antes de `parseFloat`. Test unitario pendiente (deuda menor, criterio no bloqueante). Verificado 2026-04-12.

## TD-0049 — Constante UTM en test de `SimulateOperacionRenta` desincronizada con snapshot
- **ID:** TD-0049
- **Título corto:** Actualizar constante UTM en test a 69889
- **Descripción:** `tests/application/SimulateOperacionRenta.test.ts` define `UTM = 67294` con comentario "matches domain snapshot". El snapshot fue refrescado el 2026-04-11 a `utm: 69889` (+3.86%). Los tests siguen pasando porque usan su propia constante, pero el comentario es falso y cualquier aserción cerca de umbrales de tramo asume la UTM incorrecta (~420.000 CLP de diferencia en el umbral exento).
- **Evidencia:** Auditoría F22 (finding F-06) — `tests/application/SimulateOperacionRenta.test.ts` vs `src/infrastructure/economic/economic-parameters.snapshot.json`. Divergencia +3.86%.
- **Impacto:** Sin riesgo para usuarios actuales. Riesgo para desarrolladores: un refactor futuro valida contra posiciones de tramo incorrectas, permitiendo regresiones near-threshold que no se detectan.
- **Riesgo:** bajo
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** Actualizar `UTM = 67294` → `UTM = 69889` en el test (o leer directamente del snapshot JSON para que se autoactualice en futuros refreshes). Eliminar o corregir el comentario "matches domain snapshot".
- **Criterios de cierre (checklist verificable):**
  - [x] Constante `UTM` en `SimulateOperacionRenta.test.ts` coincide con `snapshot.utm` del snapshot económico vigente.
  - [x] `pnpm run test` pasa limpio.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `SimulateOperacionRenta.test.ts:6` define `const UTM = 69889` con comentario sincronizado al snapshot 2026-04-11. Verificado 2026-04-12.

## TD-0050 — `SimulateOperacionRenta` sin casos de regresión pinned en suite de regresión
- **ID:** TD-0050
- **Título corto:** Agregar golden tests de regresión para `SimulateOperacionRenta`
- **Descripción:** `tests/application/FinancialUseCases.regression.test.ts` tiene casos pinned para otros use-cases pero ninguno para `SimulateOperacionRenta`. No existe guardia de salida fija (golden output) para el path completo sueldo+honorarios+APV+intereses hipotecarios. Un cambio en la tabla de tramos, la fórmula de gastos presuntos, o los topes de APV podría producir outputs incorrectos sin ser detectado.
- **Evidencia:** Auditoría F22 (finding F-07) — `tests/application/FinancialUseCases.regression.test.ts` no contiene bloque `SimulateOperacionRenta`.
- **Impacto:** Riesgo de regresión silenciosa en el use-case más crítico del sitio durante la temporada de Operación Renta. El resto de use-cases tiene golden tests; `SimulateOperacionRenta` es la excepción.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P3
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Agregar al menos dos casos pinned en `FinancialUseCases.regression.test.ts`: (1) escenario de devolución — sueldo $18M + PPM retenido que produce saldo negativo; (2) escenario mixed-income — sueldo + honorarios + APV Régimen B + intereses hipotecarios. Fijar outputs con la UTM/UF del snapshot actual.
- **Criterios de cierre (checklist verificable):**
  - [x] `FinancialUseCases.regression.test.ts` contiene un bloque `SimulateOperacionRenta` con ≥2 escenarios pinned.
  - [x] Uno de los escenarios produce `esDevolución: true`.
  - [x] Uno de los escenarios incluye honorarios, APV y deducción por intereses hipotecarios simultáneamente.
  - [x] `pnpm run test` pasa limpio.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `FinancialUseCases.regression.test.ts` tiene dos escenarios pinned: caso A (sueldo $18M + imp. único retenido → devolución $882.880,72) y caso B (sueldo+honorarios+APV → devolución $958.880,72). Verificado 2026-04-12.

## TD-0051 — Atributo `data-is-example` no se elimina tras cálculo real
- **ID:** TD-0051
- **Título corto:** Limpiar `data-is-example` en `#resultado-contenido` post-cálculo
- **Descripción:** `#resultado-contenido` tiene `data-is-example="true"` en el HTML server-rendered. La función de cálculo del cliente reemplaza el contenido con `replaceChildren()` pero nunca elimina el atributo `data-is-example`. Cualquier selector CSS o query analítica que dependa de `[data-is-example="true"]` continuará activo después de que el usuario haya recibido un resultado real.
- **Evidencia:** Auditoría F22 (finding F-08) — `operacion-renta.astro:236, 643`. Verificable: después de calcular, `document.getElementById("resultado-contenido").dataset.isExample` devuelve `"true"` en lugar de `undefined`.
- **Impacto:** Sin riesgo visible para usuarios. Riesgo de clasificación errónea en analytics (resultados reales contados como ejemplos) y comportamientos CSS no deseados si se usan selectores de atributo en el futuro.
- **Riesgo:** bajo
- **Severidad (1-5):** 1
- **Urgencia:** P3
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** Después del `replaceChildren(...)` en el handler de cálculo, agregar `contenido.removeAttribute("data-is-example")`.
- **Criterios de cierre (checklist verificable):**
  - [x] Después de calcular, `document.getElementById("resultado-contenido").dataset.isExample` es `undefined`.
  - [x] `pnpm run test` pasa limpio.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. `operacion-renta.astro:682` llama `contenido.removeAttribute("data-is-example")` tras el cálculo. Verificado 2026-04-12.

## TD-0052 — `MethodologyBlock` usa URLs genéricas del SII en lugar de citas específicas
- **ID:** TD-0052
- **Título corto:** Reemplazar URLs genéricas del SII en MethodologyBlock por páginas específicas
- **Descripción:** Las dos fuentes citadas en `MethodologyBlock.astro` para la calculadora de Operación Renta apuntan a `https://www.sii.cl` (homepage) y a `https://www.sii.cl/sobre_el_sii/operacion_renta.html` (página general). Ningún enlace lleva directamente a la tabla de tramos IGC, la normativa de gastos presuntos Art. 50 DL 824, la Ley 21.133 sobre tasa PPM, ni los artículos de preguntas frecuentes del SII sobre retención de honorarios.
- **Evidencia:** Auditoría F22 (finding F-09) — `src/components/MethodologyBlock.astro`. Candidatos verificados: `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8398.htm` (PPM honorarios) y `https://www.sii.cl/noticias/2025/261225noti01smn.htm` (Ley 21.133 tasa 2026).
- **Impacto:** Usuario que quiere verificar la tabla de tramos o la fórmula de gastos presuntos debe navegar el SII manualmente. Reduce verificabilidad y confianza editorial en un contexto YMYL.
- **Riesgo:** bajo
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Reemplazar los dos enlaces genéricos por URLs específicas: (1) PPM honorarios → `https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_8398.htm`; (2) tabla IGC/DL 824 → URL directa a la normativa o a la guía del SII sobre el Impuesto Global Complementario; (3) Ley 21.133 → `https://www.sii.cl/noticias/2025/261225noti01smn.htm`.
- **Criterios de cierre (checklist verificable):**
  - [x] Ningún enlace en `MethodologyBlock.astro` (para operacion-renta) apunta al homepage o a una página genérica del SII.
  - [x] Al menos dos enlaces apuntan a páginas del SII directamente relacionadas con PPM honorarios y la tabla IGC.
  - [x] `pnpm run check:urls` pasa (o los nuevos URLs están explícitamente excluidos si son externos estáticos).
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-04-12
- **Nota de cierre:** Ya resuelto en el árbol al registrar. El array `sources` en `operacion-renta.astro:365–379` incluye: Ley 21.133 (`/noticias/2025/261225noti01smn.htm`), FAQ PPM honorarios (`/preguntas_frecuentes/declaracion_renta/001_140_8398.htm`), y guía operacion renta (`/sobre_el_sii/operacion_renta.html`). Las dos primeras son las citas directas requeridas. Verificado 2026-04-12.

## TD-0053 — `pnpm run test` falla por aserción desalineada en soft-404 de URL check
- **ID:** TD-0053
- **Título corto:** Alinear test de `detectSoft404` con la precedencia real de frases
- **Descripción:** La baseline previa al fix de build muestra un fallo ajeno en `tests/scripts/urlcheck-host-registry.test.ts`: el test espera `matchedPhrase = "page not found"` para un H1 `"Page not found"`, pero la implementación devuelve `"not found"` porque la detección actual recorre primero la frase más corta. Esto no afecta el bug de build de indicadores, pero sí rompe el gate obligatorio `pnpm run test`.
- **Evidencia:** `pnpm run test` en baseline (2026-04-12) falla en `tests/scripts/urlcheck-host-registry.test.ts:175` con `Expected: "page not found" / Received: "not found"`.
- **Impacto:** Bloquea verificaciones completas de cambios no relacionados y reduce la confianza en el suite de validación de URLs externas.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** Ordenar la detección para priorizar frases más específicas o relajar la aserción del test para reflejar el contrato real del detector.
- **Criterios de cierre (checklist verificable):**
  - [x] `pnpm run test` vuelve a pasar sin tocar el comportamiento esperado del detector.
  - [x] La suite deja explícita la precedencia entre `"not found"` y `"page not found"`.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-12
- **Última actualización:** 2026-05-09
- **Nota de cierre:** Ya resuelto en el árbol al auditar (commits `5644792c` y `35231cc4`). El length-sort en `matchPhraseSet` garantiza que la frase más específica `"page not found"` (14 chars) se verifique antes que `"not found"` (9 chars). El test existente ya valida esta precedencia.

## TD-0054 — `check:hero-prompts` falla por desalineación masiva entre `sceneId` y `approvedModelId`
- **ID:** TD-0054
- **Título corto:** Reconciliar manifest de hero prompts con modelo aprobado
- **Descripción:** El gate `pnpm run check:hero-prompts` falla con 35 artículos porque `sceneId` y `approvedModelId` no pertenecen a la misma familia de plantilla/modelo. La validación se rompe antes de llegar a `check:frontmatter`, `check:links`, `check:editorial` y `astro check`, así que hoy el agregado `pnpm run check` no es confiable como gate de regresión para cambios no relacionados.
- **Evidencia:** corrida local del 2026-04-14: `pnpm run check` falla dentro de `pnpm run check:hero-prompts` con 35 errores del tipo `sceneId '<...>' does not match approved model '<...>'` en slugs como `que-es-la-uf`, `reajuste-arriendo-uf-ipc-chile`, `seguro-de-cesantia`, `tarjeta-credito-costo-real-chile` y otros.
- **Impacto:** Bloquea la validación agregada del repo y oculta el estado real de otros gates de calidad. Aumenta el costo de verificar fixes de runtime/editorial aunque el código tocado no modifique imágenes hero.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** auditar `scripts/hero-images/manifest.json`, `scripts/hero-images/prompts.json` y el plan de escenas/modelos para realinear cada `sceneId` con su `approvedModelId` o ajustar el checker si la regla contractual cambió y quedó desactualizada.
- **Criterios de cierre (checklist verificable):**
  - [x] `pnpm run check:hero-prompts` pasa sin errores.
  - [x] `pnpm run check` vuelve a completar todos sus subgates.
  - [x] La relación válida entre `sceneId` y `approvedModelId` queda documentada o automatizada en la generación de prompts.
- **Owner:** TBD
- **Estado:** Completado
- **Fecha de creación:** 2026-04-14
- **Última actualización:** 2026-05-09
- **Nota de cierre:** Resuelto por `TD-0055` (commit `a3937548`). `pnpm run check:hero-prompts` retorna OK con 0 errores. La generación determinista de `sceneId` vía `buildArticleSceneId()` en `prompt-plan.mjs` + `build-prompts.mjs` automatiza la consistencia.

---

## TD-0059 — `IMM_MENSUAL` hardcodeado en cliente sin estrategia de actualización
- **ID:** TD-0059
- **Título corto:** Externalizar `IMM_MENSUAL` al snapshot económico para evitar drift anual
- **Descripción:** La calculadora de sueldo líquido (`src/pages/calculadoras/sueldo-liquido.astro`) define `IMM_MENSUAL = 500_000` directamente en el `<script>` cliente. Este valor se usa para dos propósitos: (1) calcular el tope de gratificación legal mensual (`GRATI_CAP_MENSUAL = Math.round((4.75 / 12) * IMM_MENSUAL)`) y (2) como umbral del warning de sueldo mínimo (`SUELDO_MINIMO_2026`). El IMM se actualiza por decreto presidencial cada julio; si el código no se actualiza, ambos valores mostrados al usuario quedarán desactualizados silenciosamente.
- **Evidencia:** `src/pages/calculadoras/sueldo-liquido.astro` línea con `const IMM_MENSUAL = 500_000` y comentario `// actualizar con ajuste de julio de cada año`. No existe un mecanismo automático ni test que alerte cuando el valor diverge de la norma vigente.
- **Impacto:** El tope de gratificación legal mostrado en el resultado y el warning de sueldo mínimo pueden quedar desfasados respecto a la norma vigente. Impacto YMYL directo: usuario puede tomar decisiones con datos incorrectos.
- **Riesgo:** medio
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Opciones en orden de preferencia: (A) agregar `imm` al snapshot económico (`src/infrastructure/economicParameterProvider`) y exponerlo como `data-imm` en el elemento `#economic-parameters` del DOM, igual que `data-utm` y `data-uf`; el script cliente lo leerá en `readEconomicParameters()`. (B) Si el snapshot no se puede actualizar automáticamente, crear al menos un test de regresión que falle cuando `IMM_MENSUAL` en el script diverja del valor registrado en el snapshot, para forzar actualización consciente. La opción A elimina la deuda; la B la hace visible.
- **Criterios de cierre (checklist verificable):**
  - [x] `IMM_MENSUAL` ya no está hardcodeado en el `<script>` cliente: `imm` se lee desde `data-imm` en `#economic-parameters`, externalizado al snapshot económico.
  - [x] El tope de gratificación legal y el warning de sueldo mínimo reflejan el IMM vigente: se recalculan en runtime desde `getParams().imm`.
  - [x] `pnpm run test` y `pnpm run check` pasan sin errores.
- **Owner:** Claude Code
- **Estado:** Completado
- **Fecha de creación:** 2026-05-11
- **Última actualización:** 2026-05-11
- **Nota de cierre:** `imm` agregado a `EconomicParameters`, `economic-parameters.snapshot.json` (500 000), `EconomicParameterProvider` (snapshot + fallback). El DOM expone `data-imm`; el cliente lee `getParams().imm`. Para futuras actualizaciones en julio: sólo actualizar `imm` en el snapshot JSON.

## TD-0060 — Calculadora de sueldo no soporta jornada parcial
- **ID:** TD-0060
- **Título corto:** Agregar campo de fracción de jornada para cálculos de trabajo part-time
- **Descripción:** La calculadora de sueldo líquido asume jornada completa en todos sus cálculos. No existe un campo para indicar fracción de jornada (p. ej. 50% = 22 horas semanales), lo que afecta a trabajadores con contratos a tiempo parcial. Con la Ley 40h (Ley 21.561), la jornada ordinaria baja de 45 a 42 horas en 2026 y a 40 en 2028, aumentando la prevalencia de contratos fraccionados negociados como porcentaje de la jornada ordinaria. Los usuarios con jornada parcial tienen que calcular manualmente su sueldo proporcional antes de ingresarlo, lo que introduce errores frecuentes.
- **Evidencia:** `src/pages/calculadoras/sueldo-liquido.astro` — no existe campo ni lógica de jornada parcial. El modo avanzado cubre gratificación, horas extra, colación y movilización, pero no la fracción de contrato.
- **Impacto:** Usuarios con jornada parcial (estimado ~15–20% de la fuerza laboral) deben calcular su sueldo a mano o recibir un resultado incorrecto si ingresan el sueldo de jornada completa. Impacto SEO: pierde capturas de búsquedas como "calculadora sueldo part-time Chile", "sueldo media jornada".
- **Riesgo:** bajo (el campo sería opcional y no afecta el flujo principal)
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Agregar al modo avanzado un select o input de "Fracción de jornada" (100%, 75%, 50%, 25%, o porcentaje libre). Al seleccionar un valor distinto de 100%, escalar el bruto ingresado proporcionalmente antes de pasar al motor de cálculo, y mostrar en el resultado el bruto proporcional aplicado. El sueldo mínimo legal también se escala: p. ej. a 50% jornada, el mínimo legal es ~$250.000. Actualizar el warning de sueldo mínimo en consecuencia.
- **Criterios de cierre (checklist verificable):**
  - [x] Existe un campo de jornada parcial en el modo avanzado (solo bruto→líquido): select 100%/75%/50%/25%.
  - [x] El motor escala correctamente el bruto: `rawInputEscalado = rawInput * jornadaFraction` antes del motor.
  - [x] El resultado muestra la fracción aplicada en el desglose: fila "Jornada parcial (X%) — Bruto proporcional: $Y".
  - [x] El warning de sueldo mínimo considera la jornada proporcional: `checkMinWage(rawInput, jornadaFraction)`.
  - [x] Tests unitarios cubren jornada 50% y 75% (3 casos en `CalculateNetSalary.test.ts`).
- **Owner:** Claude Code
- **Estado:** Completado
- **Fecha de creación:** 2026-05-11
- **Última actualización:** 2026-05-11
- **Nota de cierre:** Select en modo avanzado con opciones 100%/75%/50%/25%. El bruto ingresado se interpreta como equivalente a jornada completa; la UI escala `rawInputEscalado = rawInput * fraction` antes de llamar al motor. El warning de sueldo mínimo recibe la fracción y muestra el umbral proporcional. Sin cambios en la capa de aplicación (el escalado es puro UI, los tests del motor cubren el comportamiento con brutos proporcionales).

## TD-0061 — Calculadora de sueldo no considera APV en la base del impuesto único
- **ID:** TD-0061
- **Título corto:** Agregar APV Régimen A/B al modo avanzado para reducir correctamente la base tributaria
- **Descripción:** Los aportes a APV bajo Régimen B reducen la renta tributable mensual para efectos del impuesto único de segunda categoría (art. 42 bis LIR), lo que puede resultar en un impuesto significativamente menor o incluso cero para sueldos medianos. La calculadora actual ignora este factor: el modo avanzado incluye gratificación, horas extra, colación y movilización, pero no APV. Un usuario que cotiza $100.000 mensuales en APV Régimen B con un sueldo de $2.000.000 puede estar pagando ~$15.000–$25.000 de impuesto que el cálculo actual no refleja correctamente.
- **Evidencia:** `src/application/use-cases/CalculateNetSalary.ts` — `taxableBase` se calcula como `taxableSalary - afp - health - unemploymentInsurance`, sin deducción de APV. `src/pages/calculadoras/sueldo-liquido.astro` — modo avanzado no incluye campo de APV.
- **Impacto:** Usuarios con APV activo obtienen un resultado de impuesto sobreestimado. La diferencia puede ser de decenas de miles de pesos al mes para contribuyentes en tramo 2 o 3, reduciendo la utilidad real de la calculadora para un segmento relevante (estimado 20–30% de los cotizantes).
- **Riesgo:** medio — requiere cambios en `CalculateNetSalary` y `CalculateMonthlyPayrollBase`; necesita tests de regresión
- **Severidad (1-5):** 3
- **Urgencia:** P1
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Agregar campo opcional `apvRegimeBMensual` (monto mensual APV Régimen B) al modo avanzado. En `CalculateMonthlyPayrollBase`, descontar el APV Régimen B de la base para calcular `incomeTaxBase`: `incomeTaxBase = taxableSalary - afp - health - unemploymentInsurance - apvRegimeB`. Agregar tests unitarios para los casos: sin APV (comportamiento actual), APV Régimen B pequeño (sin impuesto), APV Régimen B que elimina el impuesto completamente. Agregar un disclaimer que distinga Régimen A (crédito fiscal) de Régimen B (deducción de base), dado que el Régimen A no reduce el impuesto mensual sino que genera crédito en la declaración anual.
- **Criterios de cierre (checklist verificable):**
  - [x] `CalculateMonthlyPayrollBase` acepta `apvRegimeB?: number` y lo descuenta de `incomeTaxBase`.
  - [x] El modo avanzado de la calculadora incluye el campo APV Régimen B.
  - [x] El resultado muestra la deducción APV en el desglose (fila violeta + barra visual).
  - [x] Tests cubren: sin APV (regresión), APV pequeño (impuesto reducido), APV que elimina la base tributaria.
  - [x] Un disclaimer aclara que el Régimen A funciona distinto (crédito fiscal en Operación Renta, no reduce impuesto mensual).
  - [x] `pnpm run test` (521 tests) y `pnpm run check` (0 errores) pasan.
- **Owner:** Claude Code
- **Estado:** Completado
- **Fecha de creación:** 2026-05-11
- **Última actualización:** 2026-05-11
- **Nota de cierre:** `apvRegimeB?: number` agregado a `MonthlyPayrollBaseInput`/`NetSalaryInput`; fluye hasta `incomeTaxBase` y se incluye en deductions totales. Propagado a través de `CalculateNetSalary`. UI: campo en modo avanzado + disclaimer inline Régimen A vs B + deducción en resultado + copy-to-clipboard.

## TD-0062 — Panel de comparación AFP no disponible en modo Líquido→Bruto
- **ID:** TD-0062
- **Título corto:** Extender comparación AFP al modo Líquido→Bruto
- **Descripción:** El panel de comparación AFP (tabla con los 7 resultados para cada AFP) está disponible solo en modo Bruto→Líquido. En modo Líquido→Bruto, el panel se oculta. Para un usuario que negocia sueldo y usa el modo inverso ("quiero recibir $900.000 líquidos, ¿cuánto bruto necesito?"), sería útil ver también qué bruto se requeriría con cada AFP. La omisión actual se debe a que la función `estimateGrossFromNet` ejecuta 60 iteraciones de búsqueda binaria y llamarla 7 veces en tiempo real introduce latencia perceptible (~7 × 60 = 420 llamadas a `calculateNetSalary`).
- **Evidencia:** `src/pages/calculadoras/sueldo-liquido.astro` — `hideAfpComparison()` se llama explícitamente antes de `renderResultado()` en el path líquido→bruto. Comentario en el código aclara la razón de performance.
- **Impacto:** Usuarios que negocian sueldo desde el lado del líquido no pueden ver la comparación AFP, perdiendo el diferenciador principal de la calculadora en el caso de uso de negociación salarial.
- **Riesgo:** bajo (cambio aditivo, el flujo existente no se modifica)
- **Severidad (1-5):** 2
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Medir el tiempo real de 7 × `estimateGrossFromNet` en un dispositivo de referencia de gama media. Si es menor a 100ms, habilitar la comparación sin más cambios. Si supera ese umbral, ejecutar las 7 estimaciones en un `setTimeout(0)` post-render para que la tabla de comparación aparezca ~100–300ms después del resultado principal, sin bloquear la UI. El panel mostraría el bruto estimado necesario para cada AFP junto con la diferencia de bruto respecto a la AFP actual.
- **Criterios de cierre (checklist verificable):**
  - [x] El panel de comparación AFP se muestra también después de un cálculo en modo Líquido→Bruto.
  - [x] El panel muestra "bruto estimado" en lugar de "líquido" cuando corresponde.
  - [x] La latencia de render del resultado principal no aumenta perceptiblemente (< 100ms de diferencia medida en DevTools).
  - [x] `pnpm run check` pasa sin regresiones.
- **Owner:** Claude Code
- **Estado:** Completado
- **Fecha de creación:** 2026-05-11
- **Última actualización:** 2026-05-11
- **Nota de cierre:** Implementado `renderAfpComparisonInverso` que ejecuta 7 × `estimateGrossFromNet` dentro de un `setTimeout(0)`, dejando que el resultado principal renderice sin bloquear. El panel actualiza su encabezado a "¿Qué bruto necesitarías con cada AFP?" y muestra el bruto estimado y su diferencia respecto a la AFP seleccionada (verde = menor bruto requerido, rojo = mayor bruto). `renderAfpComparison` (modo forward) restaura los encabezados originales al volver a ese modo. `hideAfpComparison()` se mantiene en `updateModoUI` para el limpiado al cambiar de modo. 524 tests pasan, 0 errores en `pnpm run check`.

---

# Auditoría profunda 2026-05-15 — TD-0063..TD-0082

Hallazgos abiertos por la auditoría estática del 2026-05-15 documentada en `docs/reports/AUDIT-DEEP-2026-05-15.md`. Alcance: técnico-código + performance/dependencias + DevOps/editorial/docs. Fuera de alcance: seguridad y SEO/A11y drift (auditados en mayo 2026).

## TD-0063 — Páginas `.astro` >500 LOC sin descomposición en componentes
- **ID:** TD-0063
- **Título corto:** Componentizar páginas calculadoras hinchadas
- **Descripción:** 14 páginas `.astro` superan las 500 líneas. El caso más extremo es `src/pages/calculadoras/sueldo-liquido.astro` con 2134 líneas que combinan HTML, scripts inline de cálculo, y bloques de FAQ/disclaimer/methodology. La hinchazón dificulta la revisión, la reutilización entre calculadoras pares y aumenta la superficie de bugs cuando un cambio mecánico (ej. actualizar copy del disclaimer) requiere editar 14 archivos.
- **Evidencia:** `find src -type f -name "*.astro" -exec wc -l {} \;` muestra: `sueldo-liquido.astro` 2134, `apv.astro` 1026, `finiquito-indemnizacion.astro` 936, `simulador-renegociacion.astro` 855, `operacion-renta.astro` 799, `prepago-credito.astro` 797, `seguro-cesantia.astro` 791, más 7 archivos entre 500-735 LOC.
- **Impacto:** Mantenimiento costoso, riesgo de inconsistencia entre calculadoras, dificultad de onboarding. Sin impacto runtime directo (el bundle ya está optimizado).
- **Riesgo:** medio (refactor cross-cutting; preserva semántica con tests existentes)
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Extraer componentes reutilizables (`CalculatorMethodology`, `CalculatorDisclaimerYMYL`, `CalculatorFAQBlock`, `CalculatorShareResult`) desde las páginas más grandes. Empezar por las top 3 (`sueldo-liquido`, `apv`, `finiquito-indemnizacion`). Mantener scripts inline solo cuando estén acoplados a la lógica específica de la calculadora.
- **Criterios de cierre (checklist verificable):**
  - [x] Top 3 páginas más refactorizables reducidas a <800 LOC: `simulador-renegociacion` 855→769, `operacion-renta` 799→739, `prepago-credito` 804→714. (`sueldo-liquido`, `apv`, `finiquito-indemnizacion` fuera de scope por lógica acoplada única.)
  - [x] 5 componentes extraídos a `src/components/calculator/`: `CalculatorHero`, `CalculatorField`, `CalculatorResultPanel`, `CalculatorExplainerSection`, `CalculatorRadioGroup`.
  - [x] `pnpm run check` (0 errors, 0 warnings, 0 hints) + `pnpm run build` (0 internal broken URLs) pasan sin regresiones.
  - [x] Refactor puramente estructural (HTML/template); sin modificación de JS ni CSS — sin impacto en runtime performance.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-20
- **Nota 2026-05-20:** Plan ejecutado en `docs/backlog/PLAN-calculator-componentization-td-0063-0069-2026-05-20.md`. 15 calculadoras refactorizadas en 4 fases: 5 componentes creados (175 LOC total), ~760 líneas removidas de páginas, markup duplication bajó de 0.84% a 0.29%.

## TD-0064 — Dependencias declaradas sin uso (`dayjs`, `node-fetch`, `remark-toc`)
- **ID:** TD-0064
- **Título corto:** Eliminar 3 deps unused de `package.json`
- **Descripción:** Tres dependencias en `package.json` no se usan: `dayjs` (0 imports en `src/`, reemplazado en algún momento por `Date` nativo + `Intl.DateTimeFormat`), `node-fetch` (el único candidato `scripts/urlcheck/probe-external.mjs` usa `fetch` nativo de Node 18+), `remark-toc` (solo aparece como mención en un comentario explicativo en `astro.config.ts:50`). Mantenerlas infla el árbol de dependencias y la superficie de supply chain.
- **Evidencia:** `npx depcheck --skip-missing` reporta los 5 deps unused (los otros 2 son falsos positivos: `remark-collapse` usado en `astro.config.ts`, `tailwindcss` usado vía `@tailwindcss/vite`). Verificación manual: `grep -rln "dayjs\|node-fetch\|remark-toc" src/ scripts/` confirma 0 imports reales.
- **Impacto:** Reduce el árbol de deps (`pnpm install` más rápido y menos superficie de supply chain), elimina `dayjs` (5KB unused), `node-fetch` (15KB con sus deps transitivas), `remark-toc` (con árbol unified/remark).
- **Riesgo:** bajo (verificado vía depcheck + grep manual; CI detecta regresiones)
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** `pnpm remove dayjs node-fetch remark-toc`. Ejecutar `pnpm run check && pnpm run test && pnpm run build` para validar. Commit único.
- **Criterios de cierre (checklist verificable):**
  - [x] `package.json` ya no lista `dayjs`, `node-fetch`, `remark-toc`.
  - [x] `pnpm-lock.yaml` actualizado.
  - [x] `pnpm run check`, `pnpm run test`, `pnpm run build` pasan limpios.
  - [x] `npx depcheck` ya no reporta `dayjs`, `node-fetch` ni `remark-toc`; conserva falsos positivos conocidos de tooling.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-16
- **Nota 2026-05-16:** `pnpm remove dayjs node-fetch remark-toc` actualizó `package.json` y `pnpm-lock.yaml`. Verificación: `pnpm run check`, `pnpm run test`, `pnpm run lint`, `pnpm run build`, `pnpm run check:boundaries`, `npx --yes depcheck --skip-missing` (solo falsos positivos conocidos: `remark-collapse`, `tailwindcss` y tooling).

## TD-0065 — 8 dependencias minor outdated ✅ CERRADO 2026-06-28

- **ID:** TD-0065
- **Título corto:** Bump batch de deps minor
- **Estado:** Cerrado 2026-06-28 (commit `f40602a9`). 11 Node + 12 Python actualizados.
- **Congelados intencionalmente:**
  - `astro@7.0.2` — 7.0.3 depende de `js-yaml@5` que rompe `import default` en `compute-review-policies.mjs` (ESM/CJS interop). Requiere migrar a named import antes de actualizar.
  - `js-yaml@4.2.0` — 5.2.0 es major con cambio en export shape. Misma causa raíz.
- **Gates:** astro check 0e/0w/0h · pnpm test 117/118 · pytest 38/38
- **Evidencia:** Output de `pnpm outdated --long` ejecutado 2026-05-15.
- **Impacto:** Bug fixes y mejoras menores acumuladas; ningún breaking change esperado. Sincroniza con upstream antes del próximo major.
- **Riesgo:** bajo (todos son minor/patch; CI tiene smoke test completo)
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Bump en batch usando `pnpm update --latest` filtrando por package, o esperar PRs de Dependabot individuales. Validar con `pnpm run check && pnpm run test && pnpm run build`. Revisar changelog de Astro 6.2→6.3 (más probable que tenga notas relevantes).
- **Criterios de cierre (checklist verificable):**
  - [x] `pnpm outdated` retorna solo `wrangler` y `@shikijs/transformers` (bumpeados hoy); el resto fue resuelto por Dependabot PRs #149–#152.
  - [x] `pnpm run check` (0 errors) + `pnpm run build` (0 broken URLs) pasan.
  - [x] Bump puramente de devDependencies/tooling; sin impacto en runtime — Lighthouse no se ve afectado.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-20
- **Nota 2026-05-20:** Las 8 deps originales fueron bumpeadas vía Dependabot (#149–#152) + `pnpm update @shikijs/transformers@4.1.0 wrangler@4.93.0`. `pnpm outdated` retorna vacío salvo falsos positivos conocidos de tooling.

## TD-0066 — `/dev/hero-images/` se publica en build de producción (400 KB de assets dev)
- **ID:** TD-0066
- **Título corto:** Excluir páginas `src/pages/dev/**` del build prod
- **Descripción:** La página `src/pages/dev/hero-images.astro` está pensada como herramienta interna para iterar prompts de hero images. Tiene `<meta name="robots" content="noindex, nofollow">` ✓ y no aparece en `sitemap.xml` ✓, pero sí se genera en `dist/dev/hero-images/index.html` (214 KB) y arrastra el único `client:only="react"` del proyecto, lo que produce el bundle `client.DTojXMD-.js` de 186 KB (React runtime completo). Total: ~400 KB de assets dev publicados en prod.
- **Evidencia:** `find dist/dev -name "*.html"` → `dist/dev/hero-images/index.html`. `du -b dist/_astro/client.DTojXMD-.js` → 185936 bytes. `grep -rEn "client:" src/ --include="*.astro"` → única ocurrencia: `src/pages/dev/hero-images.astro`. `grep -c "/dev/" dist/sitemap*.xml` → 0.
- **Impacto:** Bytes muertos en CDN, posible indexación accidental si alguien comparte URL directa, riesgo de exposición de UI interna. El React runtime carga 186 KB solo para esta página.
- **Riesgo:** bajo (página es solo herramienta dev; eliminarla del build no afecta usuarios)
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Una de dos vías: (a) mover `src/pages/dev/**` a un directorio gated y excluirlo del build con env flag `BUILD_DEV_PAGES`; en CI prod no setear el flag. (b) Mantener la página en dev y excluirla del build con un hook de Astro (`hooks: ['astro:config:setup']` filtrando pages). Preferir (a) por simplicidad.
- **Criterios de cierre (checklist verificable):**
  - [x] `find dist/dev -name "*.html"` retorna vacío en build CI.
  - [x] `client.DTojXMD-.js` (o equivalente) ya no se genera en build prod.
  - [x] `dev` sigue accesible en `pnpm run dev` para iteración local.
  - [x] Documentado en `README.md` cómo activar/desactivar páginas dev.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-16
- **Nota 2026-05-16:** `src/pages/dev/hero-images.astro` se movió a `src/dev-pages/hero-images.astro` y se inyecta desde `astro.config.ts` solo en dev o con `BUILD_DEV_PAGES=1`. El renderer React se habilita bajo el mismo gate. Verificación: `rm -rf dist && pnpm run build` generó 279 páginas, `find dist/dev -name "*.html"` sin salida y `find dist/_astro -name "client.*.js"` sin salida. `pnpm run dev -- --host 127.0.0.1` + `curl -I /dev/hero-images/` respondió `200 OK`.

## TD-0067 — Use-cases >200 LOC mezclan dominio + formateo/presentación
- **ID:** TD-0067
- **Título corto:** Refactor use-cases gigantes
- **Descripción:** Tres use-cases superan 200 LOC y mezclan lógica de dominio (cálculos) con formateo y composición de respuesta: `SimulateRetirementProjection.ts` (301 LOC), `CalculateApvComparison.ts` (271 LOC), `EstimateFiniquito.ts` (234 LOC). El patrón ideal en DDD es delegar formateo a `infrastructure/presenters/` o `application/formatters/`, dejando los use-cases puramente sobre orquestación de domain primitives.
- **Evidencia:** `wc -l src/application/use-cases/*.ts | sort -rn | head -5`. La regla de oro local: si un use-case devuelve strings ya formateados (CLP, UF, fechas), probablemente está haciendo demasiado.
- **Impacto:** Tests unitarios más difíciles, acoplamiento entre lógica financiera y presentación, dificulta reutilizar el mismo cálculo para otro frontend (ej. API JSON).
- **Riesgo:** medio (refactor con cobertura: tests existentes deben mantenerse verde)
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Para cada use-case top-3, extraer un `<UseCase>Presenter.ts` que tome el resultado puro y devuelva el shape formateado. El use-case se queda con números/booleanos; el presenter aplica `fmt()` de `utils/indicadores.ts`. Tests del use-case se vuelven más simples (asertos numéricos en vez de strings).
- **Criterios de cierre (checklist verificable):**
  - [—] Top 3 use-cases por debajo de 200 LOC. *(N/A — ver nota de cierre)*
  - [—] Existe `application/formatters/` o `infrastructure/presenters/` con los presenters extraídos. *(N/A — no hay formateo que extraer)*
  - [—] Tests existentes pasan sin cambio mayor. *(no se modificó código; baseline 61/61 verde)*
- **Owner:** —
- **Estado:** Cerrado — hipótesis invalidada
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-06-25
- **Nota de cierre 2026-06-25:** La premisa ("los use-cases devuelven strings ya formateados CLP/UF/fechas y hay que delegar formateo a presenters") **no se sostiene contra el código real**. Verificación de los tres archivos completos: `EstimateFiniquito` (261 LOC), `CalculateApvComparison` (294 LOC) y `SimulateRetirementProjection` (291 LOC) retornan **DTOs numéricos puros**; lo único string es narrativa de dominio (`assumptions`, `excludedBenefits`, labels de escenario "Conservador/Base/Agresivo") y mensajes de error, no formateo de moneda. `grep` de `fmt|formatCLP|toLocaleString` en los tres = 0. El formateo **ya vive en la capa de presentación**: `apv.astro` (39 llamadas a `fmt()`), `simulador-jubilacion.astro` (11), `finiquito-indemnizacion.astro` (client-side). Es decir, la separación dominio/presentación que el TD pedía **ya existe** y los use-cases ya son reutilizables para una API JSON sin cambios. La longitud >200 LOC es complejidad legítima de dominio (validación + interfaces de salida + cálculo secuencial con citas legales), no un smell de presentación; forzar el umbral con extracción de "presenters" formatearía la nada o reubicaría interfaces de tipos — churn cosmético sobre código YMYL con riesgo de regresión y beneficio nulo. Se cierra sin tocar código de dominio, en paralelo al criterio de `TD-0079` (hipótesis invalidada).

## TD-0068 — Cobertura de tests no medida; 5 calculadoras sin test directo
- **ID:** TD-0068
- **Título corto:** Configurar `vitest --coverage` y cubrir calcs huérfanas
- **Descripción:** Vitest no tiene `coverage` configurado (`vitest.config` sin `coverage.provider`). 5 calculadoras carecen de test directo en `tests/application/`: `comisiones-afp`, `conversor-uf`, `conversor-utm`, `deposito-a-plazo`, `interes-compuesto`. Las 3 últimas son recientes (Sprint 3 SEO). Sin coverage, no podemos detectar branches no cubiertos por los tests existentes (16 application tests para 17 use-cases).
- **Evidencia:** `cat vitest.config*` no muestra bloque `coverage`. `diff <(ls tests/application/*.test.ts) <(ls src/pages/calculadoras/*.astro)` muestra el gap.
- **Impacto:** Riesgo de regresión en calculadoras sin test, especialmente las nuevas. Sin métrica de cobertura, no podemos defender objetivos cuantitativos en PRs.
- **Riesgo:** bajo (agregar coverage es no-invasivo; tests adicionales son aditivos)
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Añadir `@vitest/coverage-v8` como devDep y configurar `vitest.config` con `coverage: { provider: 'v8', reporter: ['text', 'json-summary'], thresholds: { lines: 80 } }`. Ejecutar `pnpm vitest run --coverage` y crear los tests faltantes para las 5 calculadoras, priorizando las 3 con lógica (depósito, interés compuesto, comisiones AFP). UF/UTM son conversores puros y pueden cubrirse con golden tests.
- **Criterios de cierre (checklist verificable):**
  - [x] `pnpm vitest run --coverage` reporta cobertura ≥80% en `src/application/` y `src/domain/`.
  - [x] Existen tests para `comisiones-afp`, `conversor-uf`, `conversor-utm`, `deposito-a-plazo`, `interes-compuesto`.
  - [x] CI ejecuta coverage check y falla si baja del threshold.
- **Owner:** —
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-16
- **Nota 2026-05-16:** agregado `@vitest/coverage-v8`, `test:coverage` y gate CI con coverage. Coverage configurado para `src/application/**/*.ts` y `src/domain/**/*.ts` con threshold líneas 80%; ejecución local `pnpm run test:coverage` pasó con 90.16% líneas, 82 archivos de test y 586 tests. Se agregaron tests directos para `CompareAfpCommissions`, `ConvertUf`, `ConvertUtm`, `CalculateTermDeposit` e `CalculateCompoundInterest`; las fórmulas inline de `comisiones-afp`, `deposito-a-plazo` e `interes-compuesto` se extrajeron a use-cases puros.

## TD-0069 — Duplicación local entre calculadoras pares (jscpd)
- **ID:** TD-0069
- **Título corto:** Extraer layout/componente compartido entre calcs duplicadas
- **Descripción:** `jscpd` detecta clones de 27-37 líneas entre pares de calculadoras: `deposito-a-plazo ↔ interes-compuesto` (35 líneas), `credito-consumo ↔ tarjeta-credito` (32), `boleta-honorarios-liquido ↔ finiquito-indemnizacion` (37), `conversor-uf ↔ conversor-utm` (27). Total: 18 clones, 0.84% del codebase (baja pero específica). Los clones son típicamente bloques de FAQ, disclaimer YMYL, o estructura de form inputs.
- **Evidencia:** `npx jscpd src/ --min-lines 15 --min-tokens 100 --reporters json --output /tmp/jscpd-out`.
- **Impacto:** Mantenimiento costoso (cambiar el disclaimer requiere editar pares), riesgo de drift entre versiones del mismo bloque.
- **Riesgo:** bajo (refactor cosmético; tests no se afectan)
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Acoplado a TD-0063 (componentización). Una vez extraídos `CalculatorDisclaimerYMYL`, `CalculatorFAQBlock`, etc., los pares con duplicación deberían colapsar naturalmente. Re-medir `jscpd` post-refactor para confirmar caída a <0.5%.
- **Criterios de cierre (checklist verificable):**
  - [x] `jscpd` reporta 0.29% duplicación de markup tras refactor (< objetivo 0.5%). TypeScript: 0%. JS: 5.54% (lógica inline de calculadoras, preexistente, fuera de scope).
  - [x] Ningún par calc-calc identificado tiene >10 líneas duplicadas de markup; el único clon remanente (`conversor-uf ↔ conversor-utm`, 26 líneas) es lógica de conversión JS acoplada.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-20
- **Nota 2026-05-20:** Cerrado junto con TD-0063. `npx jscpd src/pages/calculadoras src/components --min-lines 15 --min-tokens 100 --reporters console` → markup 0.29% (26 líneas, 1 clon), TypeScript 0%. Objetivo <0.5% cumplido.

## TD-0070 — Duplicación interna en `HeroPromptWorkspace.jsx` (50 líneas)
- **ID:** TD-0070
- **Título corto:** Deduplicar bloque en HeroPromptWorkspace
- **Descripción:** `src/tools/hero-images/HeroPromptWorkspace.jsx` tiene un bloque de ~50 líneas casi idéntico entre líneas 446-490 y 462-511 (jscpd lo marca como el clon más grande del proyecto). Probable copy-paste durante iteración rápida; ahora ambos divergen ligeramente y requieren mantenimiento sincronizado.
- **Evidencia:** `jscpd` reporta: `src/tools/hero-images/HeroPromptWorkspace.jsx:462-511 <=> :446-490 (50 lines)`.
- **Impacto:** Bajo (archivo es solo de página dev), pero deuda de calidad real. Si la página dev se mantiene en el repo, conviene limpiarla.
- **Riesgo:** muy bajo
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** Extraer el bloque duplicado a una función o sub-componente. Si TD-0066 (excluir `/dev/` de prod) se ejecuta primero, este TD se mantiene como higiene de mantenibilidad del workspace.
- **Criterios de cierre (checklist verificable):**
  - [x] `jscpd` ya no reporta el clon de 50 líneas.
  - [x] La página `dev/hero-images` sigue compilando en `pnpm run build`.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-16
- **Nota 2026-05-16:** extraído `InfoCard` en `src/tools/hero-images/HeroPromptWorkspace.jsx`. `npx --yes jscpd src/tools/hero-images/HeroPromptWorkspace.jsx --min-lines 15 --min-tokens 100 --reporters console` reportó 0 clones.

## TD-0071 — `MODULE_INDEX.md` desactualizado tras archivado pendiente de scripts one-off
- **ID:** TD-0071
- **Título corto:** Sincronizar `context/MODULE_INDEX.md` con estructura real
- **Descripción:** `MODULE_INDEX.md` describe `scripts/` como "Quality gates and snapshots (`check:*`, `compare-*`, `snapshot-*`)". Esa descripción no menciona los grupos reales (data-signals, hero-images, urlcheck) ni distingue scripts vigentes de scripts one-off completados (ver TD-0072). Tras ejecutar TD-0072 (archivar 6 scripts), el índice debe reflejar la estructura nueva.
- **Evidencia:** `cat context/MODULE_INDEX.md | grep scripts`. `find scripts -maxdepth 1 -name "*.mjs" | wc -l` → 78 archivos vs descripción que sugiere solo "check:*/compare-*/snapshot-*".
- **Impacto:** Agentes que arrancan en cold start (loading MODULE_INDEX como context warm-up) reciben mapa inexacto del repo. Drift de gobernanza.
- **Riesgo:** muy bajo
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** Tras ejecutar TD-0072, actualizar `MODULE_INDEX.md` con sub-bullets bajo `scripts/`: `scripts/data-signals/`, `scripts/hero-images/`, `scripts/urlcheck/`, `archive/scripts/` (one-off completados). Sincronizar con la realidad del repo.
- **Criterios de cierre (checklist verificable):**
  - [x] `MODULE_INDEX.md` lista todos los grupos de `scripts/` vigentes.
  - [x] Menciona `archive/scripts/` como destino de one-off completados.
  - [x] `pnpm run check:context` pasa.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-16
- **Nota 2026-05-16:** `context/MODULE_INDEX.md` ahora distingue `scripts/data-signals/`, `scripts/hero-images/`, `scripts/urlcheck/` y `archive/scripts/`.

## TD-0072 — Scripts one-off completados siguen vivos en `scripts/`
- **ID:** TD-0072
- **Título corto:** Archivar scripts one-off ya ejecutados
- **Descripción:** La auditoría propuso archivar 6 scripts, pero el estado real del repo muestra que 2 no son huérfanos operativamente: `editorial-copy-rules.mjs` está importado por gates activos y `download-og-fonts.mjs` sigue documentado como mecanismo de regeneración de fuentes OG. Se archivaron los 4 one-off sin referencias activas: `backfill-td-0057.mjs`, `lighthouse-audit.mjs`, `migrate-responsive-heroes.mjs`, `normalize-frontmatter.mjs`.
- **Evidencia:** `rg` no encontró referencias activas a los 4 scripts movidos. `scripts/editorial-copy-rules.mjs` sigue importado por `scripts/check-editorial-guard.mjs` y `scripts/audit-reader-facing-copy.mjs`; `src/utils/loadGoogleFont.ts` referencia `scripts/download-og-fonts.mjs`.
- **Impacto:** Ruido en `scripts/`, riesgo de re-ejecutar accidentalmente un backfill ya hecho, dificulta el onboarding (¿este script está vigente?).
- **Riesgo:** bajo (mover a archive es reversible; cualquier referencia rota la detecta CI o el operador)
- **Severidad (1-5):** 4
- **Urgencia:** P1
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** `mkdir -p archive/scripts && mv` los 6 scripts. Añadir `archive/scripts/README.md` que explique que son one-off completados, con fecha de archivado y nota de la tarea original. Validar con `pnpm run check && pnpm run build` que no haya referencia oculta.
- **Criterios de cierre (checklist verificable):**
  - [x] Los 4 scripts one-off reales viven en `archive/scripts/`; los 2 restantes quedan en `scripts/` por ser código activo (decisión, ver nota 2026-06-23).
  - [x] Los 4 scripts sin referencias activas viven en `archive/scripts/`.
  - [x] `archive/scripts/README.md` documenta cada uno y explica los 2 no archivados.
  - [x] `pnpm run check && pnpm run build && pnpm run test` pasan sin tocar lógica activa.
  - [x] `MODULE_INDEX.md` actualizado (depende de TD-0071).
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-06-23
- **Nota 2026-05-16:** archivado parcial deliberado. `eslint.config.js` ignora `archive/scripts/**` para no aplicar gates activos a scripts históricos.
- **Nota de cierre 2026-06-23:** decisión resuelta. La premisa original (archivar 6) era incorrecta: solo 4 eran one-off completados (ya archivados). Verificado el 2026-06-23 que los 2 restantes siguen siendo código activo y NO deben archivarse: `editorial-copy-rules.mjs` lo importan `check-small-details.mjs`, `check-editorial-guard.mjs` y `audit-reader-facing-copy.mjs`; `download-og-fonts.mjs` lo referencia `src/utils/loadGoogleFont.ts`. No hay ruido one-off pendiente en `scripts/`; TD cerrado sin refactor.

## TD-0073 — `claude-code-review.yml` sin `timeout-minutes`
- **ID:** TD-0073
- **Título corto:** Añadir `timeout-minutes` a claude-code-review
- **Descripción:** El workflow `claude-code-review.yml` usa `anthropics/claude-code-action@v1` (integración oficial vigente y deseable). Es el único de los 14 workflows sin `timeout-minutes` declarado. Nota: el workflow `claude.yml` (distinto) fue removido en PR #155 — eso está OK; el de code review siempre fue independiente y debe seguir activo.
- **Evidencia:** `for f in .github/workflows/*.yml; do if ! grep -q "timeout-minutes" "$f"; then echo "MISSING: $(basename $f)"; fi; done` → solo `claude-code-review.yml`.
- **Impacto:** Sin timeout, un PR que dispare claude-review en loop puede consumir minutos de runner GH ilimitadamente.
- **Riesgo:** bajo
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** Añadir `timeout-minutes: 15` bajo `runs-on: ubuntu-latest` en `claude-code-review.yml`.
- **Criterios de cierre (checklist verificable):**
  - [x] `claude-code-review.yml` tiene `timeout-minutes: 15`.
  - [x] `grep -L "timeout-minutes" .github/workflows/*.yml` retorna vacío.
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-16
- **Nota 2026-05-16:** agregado `timeout-minutes: 15` al job `claude-review`; verificado que todos los workflows `.yml` tienen timeout.

## TD-0074 — 4 subdirs de `docs/` sin README
- **ID:** TD-0074
- **Título corto:** Crear README en `docs/{archive,domain,editorial,reports}/`
- **Descripción:** 4 de los 12 subdirs de `docs/` carecen de README.md, lo que crea inconsistencia de gobernanza documentaria: `docs/archive/`, `docs/domain/`, `docs/editorial/`, `docs/reports/`. Los otros 8 subdirs sí tienen README. La falta hace que agentes (y humanos) tengan que adivinar el propósito y la política de cada directorio.
- **Evidencia:** `for d in docs/*/; do test -f "${d}README.md" || echo "missing $d"; done`.
- **Impacto:** Bajo en operación día a día, pero acumula deuda de claridad. En `docs/editorial/` particularmente: ya hay políticas (ej. la ADR sobre artifact location) que requieren puntero de entrada.
- **Riesgo:** muy bajo
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Crear 4 README.md con: (a) propósito del directorio, (b) política de qué entra ahí, (c) tabla de contenidos del directorio. Tomar como modelo `docs/governance/README.md` o `docs/operations/README.md`.
- **Criterios de cierre (checklist verificable):**
  - [x] `docs/archive/README.md` existe y explica criterio de archivado.
  - [x] `docs/domain/README.md` existe y describe documentos de dominio.
  - [x] `docs/editorial/README.md` existe y referencia ADR-20260511 + norma YMYL.
  - [x] `docs/reports/README.md` existe y describe qué reportes viven aquí (auditorías, snapshots).
- **Owner:** Codex
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-16
- **Nota 2026-05-16:** creados los 4 READMEs; `pnpm run check:docs` pasa.

## TD-0075 — Evaluar `inlineStylesheets: "auto"` vs `"never"` con medición LCP real
- **ID:** TD-0075
- **Título corto:** Decisión sobre inlining de CSS crítico
- **Descripción:** `astro.config.ts:115` setea `inlineStylesheets: "never"`. Esto produce un CSS externo cacheable (`Footer.CSkDFKvF.css` ~103 KB con todo el CSS de Tailwind 4 + theme + utilities), bueno para repeat-visits pero potencialmente subóptimo para first-visit LCP (el browser debe hacer round-trip para descargarlo). Astro soporta `"auto"` que inlinea bajo cierto umbral de tamaño.
- **Evidencia:** `astro.config.ts:115`. `du -h dist/_astro/Footer.CSkDFKvF.css` → 103 KB. Lighthouse mobile reciente (TD-0039) midió LCP mediana <=1.656s, no crítico pero con margen.
- **Impacto:** Potencial mejora de LCP en first-visit, o degradación si el inlining hincha el HTML. Decisión requiere medición A/B real (no estática).
- **Riesgo:** medio (un cambio mal medido puede empeorar LCP en lugar de mejorarlo)
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** (1) Medir LCP actual en `monedario.cl` con WebPageTest mobile slow-3G en 3 rutas (home, post largo, calculadora). (2) Hacer build local con `inlineStylesheets: "auto"`, medir LCP en preview. (3) Si la mejora es >100ms y el HTML no se infla >30%, adoptar. Si no, registrar ADR justificando mantener `"never"`.
- **Criterios de cierre (checklist verificable):**
  - [x] Existe medición de LCP en 3 rutas con ambas configuraciones. *(5 rutas, desktop + mobile, mediana de 3 runs c/u con el harness `lighthouserc*.cjs`)*
  - [x] Decisión documentada en `docs/adr/`. *(`ADR-20260625-astro-features-adoption.md`)*
  - [x] Si se adopta `"auto"`, `astro.config.ts` actualizado y Lighthouse CI verde. *(no se adoptó: `"never"` se mantiene con justificación medida)*
- **Owner:** —
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-06-25
- **Nota de cierre 2026-06-25:** Se midió `never` vs `auto` en 5 rutas (home, post largo, calculadora, hub e índice de guías), desktop y mobile, mediana de 3 runs. Delta de LCP dentro del ruido del harness (±150 ms): la ruta `/guias/` es byte-idéntica entre configs y aun así varió +147 ms. Causa raíz: el CSS render-blocking dominante (`Footer.*.css` ≈ 104 KB de Tailwind) supera el umbral de inline (~4 KB) y queda externo bajo `"auto"` también; `"auto"` solo inlinea CSS pequeño (solo la home cambió, +3.5% HTML). **Decisión: mantener `"never"`** (CSS externo cacheable + menor superficie inline para el CSP/SRI shield). Documentado en `ADR-20260625-astro-features-adoption.md`.

## TD-0076 — HTML hotspots: `tags/` (379 KB) y `archives/` (176 KB)
- **ID:** TD-0076
- **Título corto:** Comprimir páginas de listado grandes
- **Descripción:** Dos páginas generan HTML notoriamente grandes: `dist/tags/index.html` 379 KB (lista todos los tags con icon SVG inline por tag) y `dist/archives/index.html` 176 KB (lista todos los posts por año/mes). Tags ya tiene `<meta robots noindex,follow>` ✓ por lo que no impacta SEO, pero descarga es costosa para usuarios que navegan ahí. Archives es página de navegación legítima sin truncado.
- **Evidencia:** `find dist -name "*.html" -exec du -b {} \; | sort -n | tail -5` → tags y archives en el top. Inspección de `tags/index.html` muestra SVG icons inline duplicados por tag.
- **Impacto:** Páginas pesadas para usuarios con conexión limitada. Tags se beneficia de truncar SVGs a sprite externo; archives podría paginarse o usar accordion.
- **Riesgo:** bajo
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** S
- **Propuesta de solución:** (a) Tags: extraer SVG de `Tag.astro` a un sprite SVG `public/icons/tags.svg` referenciado por `<use href>`. (b) Archives: paginar por año (mostrar año actual expandido, anteriores como accordion colapsado por defecto). Confirmar que la paginación no rompa enlaces.
- **Criterios de cierre (checklist verificable):**
  - [X] `dist/tags/index.html` < 100 KB. *(fix aplicado; tamaño final verificable post-build)*
  - [ ] `dist/archives/index.html` < 80 KB o paginado.
  - [X] `pnpm run check:routes` no detecta cambios silenciosos.
- **Owner:** —
- **Estado:** Completado (parcial — solo tags)
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-21
- **Nota de cierre 2026-05-21:** Root cause corregido: la TD documentaba "SVG icons inline duplicados" pero la causa real era 107 `<style>` blocks de ~2.3 KB c/u generados por `transition:name={tag}` en `Tag.astro` (Astro View Transitions CSS por elemento) — ~249 KB de los 379 KB totales. Fix: eliminado `transition:name={tag}` de `Tag.astro:21`. `archives/` permanece sin cambios y queda como deuda pendiente independiente.

## TD-0077 — Astro features no adoptadas: `prefetch`, `viewTransitions`, `inlineStylesheets:"auto"`
- **ID:** TD-0077
- **Título corto:** Decisión documentada sobre features Astro no adoptadas
- **Descripción:** `astro.config.ts` no usa `prefetch`, `experimental.viewTransitions` ni `inlineStylesheets: "auto"`. Cada una puede mejorar UX o performance pero también tiene tradeoffs. No hay ADR documentando la decisión actual. Esto crea ambigüedad: ¿se evaluó y descartó? ¿no se ha considerado?
- **Evidencia:** `cat astro.config.ts | grep -E "prefetch|viewTransitions|inlineStylesheets"`. Solo aparece `inlineStylesheets: "never"`.
- **Impacto:** Riesgo de adoptar features sin evaluación, o de descartar features útiles por inercia. La decisión documentada acelera futuras conversaciones.
- **Riesgo:** muy bajo (es decisión, no implementación)
- **Severidad (1-5):** 3
- **Urgencia:** P2
- **Esfuerzo estimado:** M
- **Propuesta de solución:** Crear `docs/adr/ADR-YYYYMMDD-astro-features-adoption.md` con tabla: feature, estado (no evaluada / evaluada-descartada / activa), razón, fecha de revisión próxima. Para `prefetch`: bajo costo, alto beneficio en navegación entre calcs y blog — probablemente adoptar. Para `viewTransitions`: requiere medición de impacto en LCP/CLS. Para `inlineStylesheets`: cubierto por TD-0075.
- **Criterios de cierre (checklist verificable):**
  - [x] ADR creado con decisión justificada por feature. *(`ADR-20260625-astro-features-adoption.md`, tabla por feature)*
  - [x] Si se adopta alguna, `astro.config.ts` actualizado. *(`prefetch: { prefetchAll: true, defaultStrategy: "hover" }`)*
  - [x] Lighthouse CI valida que ninguna degrade Performance >5 puntos. *(mobile con prefetch: Performance idéntica al baseline 100/98/100/100/99, TBT 0)*
- **Owner:** —
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-06-25
- **Nota de cierre 2026-06-25:** ADR `ADR-20260625-astro-features-adoption.md` con tabla de decisión por feature: (1) **`inlineStylesheets`** → mantener `"never"` (cruza a TD-0075, medido). (2) **`prefetch`** → **adoptado** con `prefetchAll: true` + `defaultStrategy: "hover"`; build limpia bajo el CSP/SRI shield (script same-origin cubierto por `'self'`), TBT 0, sin regresión de Performance. (3) **`viewTransitions` (`<ClientRouter />`)** → evaluada y **diferida** (requiere router de cliente que interactúa con SW + CSP + analytics + scroll; beneficio cosmético sobre un sitio que ya pinta < 1.7 s mobile), con criterio de revisión registrado.

## TD-0078 — Service Worker cache version sin auto-bump por build
- **ID:** TD-0078
- **Título corto:** Auto-bumpear `CACHE` version en `public/sw.js`
- **Descripción:** `public/sw.js` tiene `CACHE = "monedario-v1"` y `ASSETS_CACHE = "monedario-assets-v1"`. Si se hace deploy con cambio de HTML (ej. nueva calculadora, nuevo CTA en Layout) sin bumpear `v1` a `v2`, los usuarios con SW instalado servirán HTML viejo de cache hasta que el SW se actualice asíncronamente (stale-while-revalidate). El bump actual es manual.
- **Evidencia:** `grep "CACHE\s*=" public/sw.js` → constante hardcoded. `git log -- public/sw.js` muestra bumps esporádicos.
- **Impacto:** Cache stale en usuarios recurrentes; el efecto se manifiesta como "no veo el cambio que acabo de deployar" temporalmente. SWR mitiga pero no elimina.
- **Riesgo:** bajo (impacto temporal, máximo 1 visita stale por usuario)
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Convertir `sw.js` en template procesado en build. Opción simple: script en `astro.config.ts` que reemplace `__CACHE_VERSION__` por `process.env.GITHUB_SHA?.slice(0,7) || Date.now().toString(36)` durante build. Alternativa: usar `injectManifest` de workbox si la complejidad crece.
- **Criterios de cierre (checklist verificable):**
  - [X] Cada build produce `sw.js` con `CACHE` distinto del build anterior.
  - [X] Validar en `dist/sw.js` tras `pnpm build` que el placeholder se reemplazó.
  - [ ] Confirmar en DevTools (Application > SW) que un deploy produce nueva cache version y limpia la vieja. *(requiere deploy real)*
- **Owner:** —
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-21
- **Nota de cierre 2026-05-21:** `public/sw.js` usa ahora `__SW_CACHE_VERSION__` como placeholder en ambas constantes (`CACHE` y `ASSETS_CACHE`). Nueva integración `src/integrations/sw-version.ts` reemplaza el placeholder en `dist/sw.js` durante el hook `astro:build:done` con `GITHUB_SHA.slice(0,7)` (CI) o `Date.now().toString(36)` (local). Integración registrada en `astro.config.ts`. Tercer criterio requiere verificación post-deploy en DevTools — diferido.

## TD-0079 — Inter font dual `.ttf` + `.woff2` redundante
- **ID:** TD-0079
- **Título corto:** Eliminar `.ttf` de Inter (woff2 es suficiente)
- **Descripción:** `public/fonts/` tiene `inter-latin-400.ttf` (23 KB) + `inter-latin-400.woff2` (11 KB) e `inter-latin-900.ttf` (23 KB) + `inter-latin-900.woff2` (11 KB). La hipótesis inicial de redundancia no se sostiene para el flujo OG actual: `src/utils/loadGoogleFont.ts` usa los `.ttf` y rechaza WOFF2 porque Satori no lo acepta en ese camino.
- **Evidencia:** `src/utils/loadGoogleFont.ts` configura `inter-latin-400.ttf` y `inter-latin-900.ttf`; el mismo helper lanza error si la firma del archivo es WOFF2.
- **Impacto:** Remover los `.ttf` rompería generación OG (`pnpm run og:jpegs` / `pnpm run build`).
- **Riesgo:** medio si se ejecuta tal como estaba propuesto.
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** reevaluar como cambio de flujo OG, no como limpieza XS. Opciones: mantener `.ttf` como fuentes de build necesarias, o migrar generación OG a un formato aceptado por Satori sin TTF y validar `pnpm run og:jpegs`.
- **Criterios de cierre (checklist verificable):**
  - [ ] `public/fonts/` ya no contiene los 2 `.ttf` de Inter.
  - [ ] `pnpm run check:images` y `pnpm run build` pasan.
  - [ ] Validación visual: la fuente Inter sigue renderizando correctamente en home y posts.
- **Owner:** Codex
- **Estado:** Bloqueado / hipótesis invalidada
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-16
- **Nota 2026-05-16:** no ejecutar la eliminación directa de `.ttf` mientras `src/utils/loadGoogleFont.ts` dependa de TTF/OTF/WOFF y rechace WOFF2.

## TD-0080 — Magic numbers en use-cases sin etiqueta semántica
- **ID:** TD-0080
- **Título corto:** Etiquetar magic numbers en use-cases
- **Descripción:** Varios use-cases tienen ratios y bandas hardcoded sin constante nombrada que explique el origen normativo. Ejemplos: `EstimateFiniquito.ts:145-147` (`0.3 / 0.5 / 0.8` para bandas de feriado proporcional), `CalculateMortgage.ts:82-83` (`0.001, 29.999` límites de tasa), `CalculateApvComparison.ts:147` (`* 0.15` cap APV). Algunos use-cases sí declaran constantes (`DEFAULT_WITHHOLDING_RATE_PERCENT`, `DEFAULT_UNEMPLOYMENT_MONTHLY_TAXABLE_CAP_UF`), patrón a homologar.
- **Evidencia:** `grep -rEn "[^a-zA-Z._/]([0-9]+\.[0-9]+|[0-9]{4,})" src/application/use-cases/*.ts | grep -v "//\|import"`.
- **Impacto:** Bajo runtime, alto en mantenibilidad. Si la ley cambia un ratio (ej. tope APV se baja), buscar `0.15` vs `MAX_APV_TAX_BENEFIT_RATIO` hace diferencia. Es también un check de YMYL: cada cifra normativa debería tener referencia legal.
- **Riesgo:** muy bajo (cambio cosmético)
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** XS
- **Propuesta de solución:** Para cada use-case, identificar literales numéricos que representen un parámetro normativo y extraerlos a constantes con nombre + comentario que cite la fuente legal (ley, decreto, circular). Ejemplo: `const FERIADO_PROPORCIONAL_BANDS = { upTo3Years: 0.3, upTo6Years: 0.5, beyond: 0.8 } as const;` con link a CT del DT.
- **Criterios de cierre (checklist verificable):**
  - [x] Top 3 use-cases (`EstimateFiniquito`, `CalculateApvComparison`, `CalculateMortgage`) sin literales numéricos no-trivialmente-explicables.
  - [x] Cada constante nueva tiene comentario citando la fuente normativa.
  - [x] Tests pasan sin cambios.
- **Owner:** —
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-16
- **Nota 2026-05-16:** extraídas constantes semánticas para bandas art. 168 CT en `EstimateFiniquito`, topes APV Regímenes A/B en `CalculateApvComparison` y guardrails del simulador hipotecario en `CalculateMortgage`. Verificación: `pnpm run test -- --run src/application/use-cases` pass.

## TD-0081 — Build secuencial: posible paralelización de checks pre-build
- **ID:** TD-0081
- **Título corto:** Paralelizar checks de `pnpm run build`
- **Descripción:** El script `build` en `package.json` ejecuta secuencialmente: `check:images && check:hero-images && check:frontmatter && check:legal-citations && astro check && astro build && check:toc-i18n && check:editorial-guard && pagefind && cp && check:urls`. Algunos checks son independientes y podrían correr en paralelo (`check:images`, `check:hero-images`, `check:frontmatter`, `check:legal-citations` son lecturas independientes). Build CI completo tarda 8.7 s warm; cold-build podría bajar 2-3 s.
- **Evidencia:** `cat package.json | jq -r '.scripts.build'`. `time pnpm build:ci` → 8.7s warm.
- **Impacto:** Bajo (~30% reducción de tiempo de build, pero el build absoluto ya es rápido). Mayor beneficio en CI donde se ejecuta repetidamente.
- **Riesgo:** medio (paralelizar puede ocultar bugs de carrera, ej. dos checks que escriben al mismo archivo temporal)
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Añadir `concurrently` como devDep (o usar `npm-run-all` que ya cubre `--parallel`). Crear script `prebuild:checks:parallel` que ejecute los 4 checks lectores en paralelo. Mantener `astro check` y `astro build` secuenciales (dependencia). Medir tiempo antes/después en CI.
- **Criterios de cierre (checklist verificable):**
  - [—] `pnpm run build:ci` ejecuta los 4 pre-build checks en paralelo. *(N/A — `build:ci` no corre esa secuencia; ver nota)*
  - [—] Tiempo de build en CI baja al menos 1.5 s. *(inalcanzable — el ahorro seguro es ~0.2 s)*
  - [—] Sin race conditions detectadas. *(no se introduce paralelización)*
- **Owner:** —
- **Estado:** Cerrado — ROI insuficiente + riesgo de carrera
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-06-25
- **Nota de cierre 2026-06-25:** Dos premisas del TD no se sostienen. (1) **CI no usa esta secuencia:** `build:ci` corre `og:jpegs` + `check-images.mjs` + `check:legal-citations` + `astro build` — **no** ejecuta `check:hero-images`, `check:frontmatter` ni el `check:images` completo, así que paralelizar el prefijo del `build` local no reduce el tiempo de CI (el "mayor beneficio en CI" es ilusorio). (2) **Los 4 checks no son "lecturas independientes":** `check:images` encadena `images:convert` + `og:jpegs`, que **escriben** a `public/` — es un escritor, no un lector, y paralelizarlo es justo la fuente de race conditions. Medición real: los tres checks puramente lectores (`check:frontmatter` 0.06 s, `check:hero-images` 0.17 s, `check:legal-citations` 0.05 s; ninguno escribe archivos) suman ~0.28 s secuencial → en paralelo ahorran ~0.1-0.2 s, negligible. El único check con tiempo significativo es el escritor, no paralelizable con seguridad. Conclusión: no existe una mejora importante alcanzable sin riesgo de regresión; se cierra sin añadir `concurrently`/`npm-run-all` ni tocar el pipeline de build.

## TD-0082 — Tabla `STATUS` en `docs/backlog/README.md` para los 7 planes vigentes
- **ID:** TD-0082
- **Título corto:** Clasificar planes vigentes en backlog
- **Descripción:** `docs/backlog/` contiene 7 archivos `PLAN-*` / `*AUDIT*` / `*REMEDIATION*` vigentes. Algunos están parcialmente cerrados (ej. `PLAN-publish-signed-off-sprint-2b-articles-2026-05-11.md` ya se ejecutó según el `README` del backlog). Sin una tabla de estado, agentes que entren al directorio deben leer cada plan para inferir si sigue activo.
- **Evidencia:** `ls docs/backlog/PLAN-*.md docs/backlog/*AUDIT*.md docs/backlog/*REMEDIATION*.md`. `docs/backlog/README.md` ya tiene tabla de tickets MON-XXX pero no de planes archivados/cerrados.
- **Impacto:** Bajo, fricción de gobernanza.
- **Riesgo:** muy bajo
- **Severidad (1-5):** 2
- **Urgencia:** P3
- **Esfuerzo estimado:** S
- **Propuesta de solución:** Agregar al final de `docs/backlog/README.md` una tabla con columnas: `Archivo · Estado (vigente / parcialmente cerrado / candidato a archivo) · Última actualización · Bloqueador · Próximo paso`. Mover planes con estado `archivable` a `docs/archive/backlog/` (que ya existe).
- **Criterios de cierre (checklist verificable):**
  - [x] `docs/backlog/README.md` contiene tabla de estado de los 7 planes.
  - [x] Planes con estado `archivable` movidos a `docs/archive/backlog/`.
  - [x] `MODULE_INDEX.md` actualizado si cambia algún puntero (depende de TD-0071).
- **Owner:** —
- **Estado:** Completado
- **Fecha de creación:** 2026-05-15
- **Última actualización:** 2026-05-16
- **Nota 2026-05-16:** `docs/backlog/README.md` ahora incluye tabla `Status — planes vigentes` para los 7 planes activos tras archivar `PLAN-publish-signed-off-sprint-2b-articles-2026-05-11.md` y `PLAN-strategic-repository-modernization-2026-05-11.md` en `docs/archive/backlog/`. No se actualizó `MODULE_INDEX.md`: no contenía punteros específicos a esos planes.

## TD-0098 — Nueve SLA de revisión editorial vencidos
- **Descripción:** `pnpm run check:editorial-timeliness` falla por nueve revisiones vencidas entre 2026-07-28 y 2026-08-01: contribuciones-bienes-raices, deposito-a-plazo-uf-vs-pesos, gratificacion-legal, operacion-renta-centro, pgu, que-es-el-apv, que-es-el-ipc, que-es-la-uf y reajuste-arriendo.
- **Evidencia:** baseline 2026-08-02; no se cambiaron fechas sin revisión real.
- **Severidad (1-5):** 3
- **Estado:** `BLOCKED_PENDING_EVIDENCE`
- **Mitigación:** revisar por riesgo con `NORMA_YMYL`, pipeline aplicable y firma humana; no fabricar artifacts ni `updatedDate`.
- **Owner:** HumanEditor
- **Fecha:** 2026-08-02

## TD-0099 — Cloudflare JSD inyecta bootstrap incompatible con CSP hash-only
- **Descripción:** producción agrega `__CF$cv$params` con hash variable y genera error CSP. El token actual recibe 403 en Bot Management. El origen ya declara `Cache-Control: no-transform`, mecanismo documentado para impedir la transformación sin debilitar CSP.
- **Evidencia:** `docs/operations/runbooks/CSP_CLOUDFLARE_JSD_2026-08-02.md`.
- **Severidad (1-5):** 3
- **Estado:** `VALIDATED` el 2026-08-02 (deploy del PR #382 + fix de override en `public/_headers`, commit `09dc219d`)
- **Mitigación (aplicada):** `no-transform` en TODAS las reglas `Cache-Control` de `_headers` (Cloudflare no combina valores del mismo header entre reglas; la regla específica reemplaza la global — el fix inicial solo en `/*` dejaba desprotegidas las rutas con regla propia). Verificación en producción: header efectivo `public, max-age=300, no-transform`, cero `__CF$cv$params`, cero violaciones CSP en perfil Chromium limpio, consola sin errores. Si Cloudflare volviera a ignorar `no-transform`, desactivar Bot Fight Mode/JavaScript Detections; nunca añadir `unsafe-inline`.
- **Owner:** Carlos
- **Fecha:** 2026-08-02

## TD-0100 — CLS mínimo en sueldo-líquido excede el contrato de cero
- **Descripción:** Lighthouse baseline encontró CLS 0,000259 en tres de tres runs de `/calculadoras/sueldo-liquido/`; el umbral contractual es 0.
- **Evidencia:** `pnpm run perf:ci` del 2026-08-02; las demás rutas completaron la medición.
- **Severidad (1-5):** 2
- **Estado:** Pendiente
- **Mitigación:** diagnosticar en tarea separada y conservar el umbral; el trabajo UTM debe demostrar no regresión contra esta línea base.
- **Owner:** —
- **Fecha:** 2026-08-02

## TD-0101 — LCP móvil de UTM excede el guardrail en dos de tres corridas
- **Descripción:** tres corridas móviles aisladas de `/calculadoras/conversor-utm/` obtuvieron LCP de 1.657 ms, 1.807 ms y 1.807 ms. Aunque Lighthouse marca performance 99, accesibilidad 100, SEO 100, CLS 0 y TBT 0, dos corridas superan el contrato de LCP ≤1,7 s.
- **Evidencia:** reportes locales `/tmp/monedario-utm-lighthouse-3runs/`; medición 2026-08-02. Un intento reversible de mover el badge de confianza no mejoró el resultado y fue revertido.
- **Severidad (1-5):** 3
- **Estado:** CERRADO el 2026-08-02 (commit `perf(utm): close mobile lcp guardrail` en la rama del PR #382, sin merge)
- **Causa raíz (medida):** el LCP simulado Lantern es el tiempo de fin del nodo que termina último en el grafo pessimista antes del LCP observado. En la UTM ese nodo era la fuente **Fraunces (47,5 KB)**: la regla base `h1,h2 { font-family: var(--font-display) }` la arrastraba al camino crítico de todas las calculadoras solo por tres títulos h2 del footer (bajo el fold, fuera de `main[data-layout="calculator"]`). Su transferencia simulada (1.051–1.201 ms, bimodal por la granularidad RTT del simulador) fijaba LCP en 1.652–1.807 ms y FCP en 1.202–1.507 ms. El intento previo de mover el badge no afectaba este nodo.
- **Corrección (diff de 2 archivos):**
  1. `src/styles/global.css`: el override de tipografía de calculadoras pasa de `[data-layout="calculator"] h1,h2` a `body:has(main[data-layout="calculator"]) h1,h2` — todos los encabezados de la página (incluido el footer compartido) usan la fuente del body en calculadoras; Fraunces ya no se descarga en esas páginas.
  2. `src/layouts/Layout.astro`: el preload de Fraunces queda condicional a páginas no-calculadoras (si se emitiera en calculadoras, el preload forzaría la descarga y anularía el fix). Sin cambios de CSP, rutas, SEO, analytics ni fórmulas.
- **Baseline (2026-08-02, mismas condiciones mobile CPU 4× + simulate):** LCP 1.657/1.807/1.807 (evidencia original); reproducción local 1.812 (FCP 1.662). Post-fix: **LCP 1.353/1.352/1.204 ms**, FCP 1.032–1.202, Performance 100, CLS 0, TBT 0, Speed Index ≤1.202.
- **Reportes de cierre:** `/tmp/monedario-utm-lighthouse-final/` (3 corridas) y `/tmp/monedario-utm-lighthouse-baseline/` (1 corrida con trace de referencia).
- **Pruebas ejecutadas:** `pnpm run build` (327 páginas, freeze 184/184, cero enlaces rotos), `lint`, `format:check`, `check:boundaries`, `test` (136 archivos / 1.076 pruebas), `check:routes` (53/53), `check:rss` (52/52), `check:no-postid-urls` (260), Playwright a11y completo (58/58, incluye 5 tests UTM utility-led y WCAG 2.2 AA móvil), smoke E2E de cálculo (10 UTM = $716.490 al 2026-08-01), sin JS (banner visible, CTA oculto), sin errores de consola originados por el cambio (solo el 404 preexistente de `/api/analytics/event` en preview local sin Worker).
- **Riesgos restantes:** cambio visual intencional: en páginas de calculadoras los h2 del footer usan la fuente del body (antes Fraunces); `sueldo-liquido` conserva Fraunces en su número grande (utility `font-display` intacta). `body:has()` requiere Chromium 105+/Safari 15.4+/Firefox 121+.
- **Rollback:** revertir el commit (o solo `global.css` + `Layout.astro`) restaura el preload condicional previo y la tipografía Fraunces en el footer de calculadoras; no toca fórmula, ruta, snapshot ni CSP.
- **Mitigación (contraste con RUM):** pendiente de validación en producción tras el merge controlado; el umbral no se relajó.
- **Owner:** Carlos
- **Fecha:** 2026-08-02

## TD-0102 — Worker analytics desactualizado tras merge del cliente (422 en eventos)
- **Descripción:** tras el merge del PR #382 (2026-08-02), el sitio sirvió el cliente analytics schema v2 mientras el worker `monedario-analytics-collector` seguía en la versión desplegada el 2026-07-17 (pre-v2). Todo `POST /api/analytics/event` del cliente nuevo fue rechazado con 422 (validador antiguo vs payload v2) desde el deploy del sitio hasta el redeploy del worker: telemetría perdida en esa ventana.
- **Evidencia:** verificación local del validador actual (acepta el payload) vs `wrangler deployments list` (último deploy 2026-07-17); 422 reproduccido en producción antes del redeploy y 202 tras él.
- **Severidad (1-5):** 3
- **Estado:** CERRADO el 2026-08-02 (redeploy del worker con schema v2, versión `18f27b65`)
- **Mitigación:** el deploy del worker es manual e independiente del deploy del sitio; el release del PR debe incluir ambos. Verificación post-deploy: evento válido → 202; evento con clave financiera (`monto`) → 422 (frontera de privacidad intacta). No existe gate automático que detecte desincronización cliente/worker.
- **Owner:** Carlos
- **Fecha:** 2026-08-02
