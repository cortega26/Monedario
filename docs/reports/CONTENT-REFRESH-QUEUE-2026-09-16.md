# Cola de refresco de contenido — 2026-09-16 (F0, read-only)

**Plan:** `docs/backlog/PLAN-content-refresh-consolidation-2026-09-16.md` · fase F0
(cola + ownership, read-only).
**Estado F0:** TODO — pendiente de sign-off del owner (Carlos Ortega).
**Alcance de este documento:** SOLO cola. No se tocó contenido, frontmatter,
config, artefactos ni código.

## Fuentes y método (orden GSC × staleness × riesgo YMYL)

- `audit:topic-overlap` ejecutado 2026-09-16 (exit 0): 53 artículos,
  0 `metadata_warnings`, 36 candidatos. Sin double-owners (ver § Ownership).
- `audit:cannibalization` ejecutado 2026-09-16 (exit 0, semana 2026-W37):
  6 queries canibalizadas; señales usadas como desempate, no como orden
  principal.
- `check:editorial-timeliness` ejecutado 2026-09-16 (exit 0):
  `published=53 stale=0 drift=0`. Reporte
  `output/validation/editorial-timeliness/report.json` (generado 2026-09-15,
  `today=2026-09-15`): `staleSlugs=[]`.
- GSC páginas W36 (`output/operations/data-signals/gsc/2026-W36-pages.json`,
  ventana 2026-08-31–2026-09-06) como señal principal de tráfico. W37
  (`2026-W37-pages.json`, ventana 2026-09-07–13) solo como contraste
  direccional: sus exportaciones están truncadas y no se usan valores
  puntuales para ordenar.
- Frontmatter inspeccionado vía grep (read-only): `cluster`, `topicRole`,
  `canonicalTopic` de los 53 posts.
- Lote 0 (`impuestos-personas`, PR #423 MERGED 2026-08-14 + remediación
  #428) verificado por historial git: tocan `boleta-honorarios-2026-…`,
  `devolucion-impuestos-…`, `operacion-renta-f22-checklist`,
  `impuesto-global-complementario-chile` (+ fix art. 107 LIR en
  `operacion-renta-centro`). El cluster `impuestos-personas` (7 artículos)
  queda FUERA de los lotes 1–5. Lotes 1–5 = 46 artículos.

## Top-10 páginas artículo/tráfico GSC W36 (solo `/posts/`, orden clics)

| # | Slug | Clics | Impr. | Pos. |
|---|---|---|---|---|
| 1 | informe-deudas-cmf-vs-dicom | 5 | 282 | 13,72 |
| 2 | reajuste-arriendo-uf-ipc-chile | 3 | 99 | 15,53 |
| 3 | fraude-tarjeta-que-hacer | 2 | 195 | 7,33 |
| 4 | utm-chile-que-es-como-funciona | 1 | 611 | 14,31 |
| 5 | donde-ver-si-estoy-en-dicom-gratis | 1 | 288 | 19,56 |
| 6 | deposito-a-plazo-uf-vs-pesos | 1 | 100 | 10,67 |
| 7 | liquidacion-de-sueldo | 1 | 40 | 36,78 |
| 8 | como-cambiarse-de-afp | 0 | 202 | 22,60 |
| 9 | como-salir-boletin-comercial-chile | 0 | 165 | 8,36 |
| 10 | que-es-la-cuenta-2-afp | 0 | 116 | 42,50 |

Nota: el grueso del tráfico W36 va a calculadoras
(`conversor-utm` 1484 clics) — fuera de alcance de esta cola salvo CTA
calculadora↔artículo en F2. Contraste W37 (no vinculante): mismos
artículos traccionan (`informe-deudas` 4, `dicom-gratis` 2,
`suplantacion-identidad` 2, `cartola-afp` 1, `cuenta-2` 1).

## Distribución de clusters (frontmatter, 53 total)

`deuda-credito: 8`, `ahorro-e-inversion: 8`, `impuestos-personas: 7`
(lote 0, excluido), `sueldo-remuneraciones: 6`, `pensiones-afp: 6`,
`empleo-ingresos: 6`, `uf-costo-de-vida: 4`, `seguridad-financiera: 4`,
`presupuesto-control-financiero: 2`, `bancos-fintech: 1`,
`finanzas-migrantes: 1`. Colas delgadas confirmadas, sin expansión
(BLOCKED hasta 2026-11-02).

## Lotes 1–5 (46 artículos)

Convenciones por fila: `stale` = no (0 stale global al 2026-09-15/16);
W36 = `clics/impr./pos.` (`—` = sin fila en W36, 0 impr.);
`calc` = estimación F0 de `requires_calculation` (a confirmar en 01-brief);
`sens.` = sensibilidad regulatoria estimada (define 06-compliance si alta);
artefactos mínimos = `B`rief→`D`ossier→`O`utline→`d`raft→`P`acket,
`+M` = 05-math-audit, `+C` = 06-compliance.

### Lote 1 — Deuda-crédito (8): top clics + canibalización DICOM

Racional: clics W36 nº 1 y nº 5, query canibalizada `credit score chile`
(`donde-ver-…` vs `informe-deudas-…`), par overlap
`donde-ver ↔ informe-deudas` (0,405) y `cae ↔ tarjeta` (0,412).

| Slug | Rol + canonicalTopic | Stale | W36 | Calc | Sens. | Artefactos |
|---|---|---|---|---|---|---|
| informe-deudas-cmf-vs-dicom | owner · informe-deudas-cmf-vs-dicom | no | 5/282/13,72 | no | alta (CMF/Ley 21.680) | B→D→O→d→P +C |
| donde-ver-si-estoy-en-dicom-gratis | support · informe-deudas-cmf-vs-dicom | no | 1/288/19,56 | no | alta (misma base) | B→D→O→d→P +C |
| como-salir-boletin-comercial-chile | owner · boletin-comercial-eliminacion | no | 0/165/8,36 | no | alta (DICOM/Ley) | B→D→O→d→P +C |
| renegociacion-superir | owner · renegociacion-superir | no | 0/44/11,80 | posible | alta (Superir/Ley) | B→D→O→d→P +C (+M si hay cuotas) |
| prepago-credito-cuando-conviene-chile | owner · prepago-credito-calculo | no | 0/25/8,84 | sí | media | B→D→O→d→P +M |
| tarjeta-credito-costo-real-chile | owner · tarjeta-credito-costo-interes | no | 0/24/8,71 | sí | media | B→D→O→d→P +M |
| cae-costo-real-credito-chile | owner · cae-costo-real | no | — | sí | media | B→D→O→d→P +M |
| credito-hipotecario-chile-guia-completa | owner · credito-hipotecario-proceso | no | — | sí | alta (vivienda/CMF) | B→D→O→d→P +M +C |

### Lote 2 — Sueldo + cesantía/finiquito (10): pares overlap + canibalización

Racional: 5 pares overlap `media/baja` intra-sueldo (0,364–0,408),
query canibalizada `sueldo liquido` (calculadora vs artículo),
`liquidacion-de-sueldo` pos. 36,78, pares `seguro-cesantia` (0,441) y
`finiquito` (support+owner).

| Slug | Rol + canonicalTopic | Stale | W36 | Calc | Sens. | Artefactos |
|---|---|---|---|---|---|---|
| como-calcular-sueldo-liquido | owner · calcular-sueldo-liquido | no | 0/114/30,04 | sí | alta (laboral/previsional) | B→D→O→d→P +M +C |
| liquidacion-de-sueldo | owner · auditar-liquidacion-sueldo | no | 1/40/36,78 | sí | alta (Código del Trabajo) | B→D→O→d→P +M +C |
| sueldo-imponible-chile | owner · sueldo-imponible-base-descuentos | no | 0/41/7,49 | sí | alta (topes/AFC) | B→D→O→d→P +M +C |
| descuentos-de-sueldo | owner · clasificacion-descuentos-sueldo | no | 0/38/8,76 | no | alta (legales/voluntarios) | B→D→O→d→P +C |
| cuanto-descuenta-la-afp-de-tu-sueldo | owner · descuento-afp-trabajador | no | — | sí | alta (DL 3500) | B→D→O→d→P +M +C |
| gratificacion-legal-chile | owner · gratificacion-legal-calculo-tope | no | 0/20/7,95 | sí | alta (Código del Trabajo) | B→D→O→d→P +M +C |
| seguro-de-cesantia | owner · seguro-cesantia-cobertura | no | 0/17/9,82 | sí | alta (Ley 19.728) | B→D→O→d→P +M +C |
| seguro-cesantia-cuenta-individual-vs-fondo-solidario | support · seguro-cesantia-cobertura | no | — | parcial | alta (misma base) | B→D→O→d→P +C (+M si hay montos) |
| finiquito-e-indemnizaciones-en-chile | owner · finiquito-indemnizaciones | no | 0/5/13,80 | sí | alta (Código del Trabajo) | B→D→O→d→P +M +C |
| indemnizacion-anos-de-servicio-chile | support · finiquito-indemnizaciones | no | 0/19/37,89 | sí | alta (misma base) | B→D→O→d→P +M +C |

### Lote 3 — Pensiones-AFP + UF/costo-de-vida (10): vencimientos 10-09/10-13

Racional: 4 artículos con `dueDate` 2026-10-09 (fondos, cuenta-2,
reforma, + cartola no pero afín), cadencia 30 d con due 2026-10-13
(depósito/apv/ipc/uf/reajuste), `utm` 611 impr. + due 2026-10-06,
queries canibalizadas `4 utm` / `un utm`, par overlap
`ipc ↔ reajuste-arriendo` (0,382).

| Slug | Rol + canonicalTopic | Stale | W36 | Calc | Sens. | Artefactos |
|---|---|---|---|---|---|---|
| como-cambiarse-de-afp | owner · cambio-afp | no | 0/202/22,60 | no | alta (Superintendencia/DL 3500) | B→D→O→d→P +C |
| que-es-la-cuenta-2-afp | owner · cuenta2-afp | no | 0/116/42,50 | sí | alta (tributario/retiros) | B→D→O→d→P +M +C |
| fondos-afp-a-b-c-d-e | owner · elegir-fondos-afp | no | 0/112/10,93 | no | alta (rentabilidad/riesgo) | B→D→O→d→P +C |
| como-leer-cartola-afp-chile | owner · cartola-afp | no | 0/29/9,10 | no | media | B→D→O→d→P |
| reforma-previsional-2025-que-cambia-y-como-te-afecta | owner · reforma-previsional-cambios | no | 0/2/6,50 | no | alta (ley) | B→D→O→d→P +C |
| pgu-pension-garantizada-universal | owner · pgu-pension-garantizada | no | 0/2/7,50 | sí | alta (monto/requisitos ley) | B→D→O→d→P +M +C |
| utm-chile-que-es-como-funciona | owner · utm-uta-unidades-tributarias | no | 1/611/14,31 | no | media | B→D→O→d→P |
| que-es-el-ipc-chile-como-se-calcula | owner · ipc-inflacion-costo-de-vida | no | 0/112/8,41 | sí | media | B→D→O→d→P +M |
| que-es-la-uf | owner · uf-reajustes-costo-de-vida | no | 0/73/10,51 | sí | media | B→D→O→d→P +M |
| reajuste-arriendo-uf-ipc-chile | owner · reajuste-arriendo-contrato-uf-ipc | no | 3/99/15,53 | sí | media | B→D→O→d→P +M |

### Lote 4 — Ahorro-e-inversión resto (8): overlap + cadencia 30 d

Racional: par overlap de mayor score del corpus
(`interes-compuesto` 0,462, owner+reference), `deposito`/`apv` due
2026-10-13, `fondos-mutuos` 54 impr.

| Slug | Rol + canonicalTopic | Stale | W36 | Calc | Sens. | Artefactos |
|---|---|---|---|---|---|---|
| deposito-a-plazo-uf-vs-pesos | owner · deposito-plazo-uf-vs-pesos | no | 1/100/10,67 | sí | media | B→D→O→d→P +M |
| que-es-el-apv | owner · apv-beneficio-tributario | no | 0/18/65,28 | sí | alta (tributario) | B→D→O→d→P +M +C |
| fondos-mutuos-comisiones-rescate-impuestos | owner · fondos-mutuos-costos-rescate-impuestos | no | 0/54/6,26 | sí | alta (costos/impuestos) | B→D→O→d→P +M +C |
| ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026 | owner · elegir-instrumento-ahorro-inversion | no | 0/12/8,42 | parcial | media | B→D→O→d→P (+M si hay cifras) |
| como-elegir-inversion-segun-plazo-riesgo-objetivos | support · elegir-instrumento-ahorro-inversion | no | 0/5/15,20 | no | media | B→D→O→d→P |
| como-invertir-en-etfs-desde-chile | owner · invertir-etfs-desde-chile | no | 0/8/14,63 | parcial | media | B→D→O→d→P (+M si hay costos) |
| el-poder-del-interes-compuesto | owner · interes-compuesto-caso | no | 0/4/8,25 | sí | media | B→D→O→d→P +M |
| interes-compuesto-nota-metodologica | reference · interes-compuesto-caso | no | — | sí | media | B→D→O→d→P +M |

### Lote 5 — Seguridad + resto empleo + presupuesto + colas delgadas (10)

Racional: `fraude-tarjeta` clics W36 nº 3, `como-hacer-presupuesto`
due 2026-10-05 (el más próximo del corpus), colas delgadas
(bancos/migrantes/presupuesto) sin expansión, resto empleo-ingresos.

| Slug | Rol + canonicalTopic | Stale | W36 | Calc | Sens. | Artefactos |
|---|---|---|---|---|---|---|
| fraude-tarjeta-que-hacer | owner · fraude-tarjeta-ley-20009 | no | 2/195/7,33 | no | alta (Ley 20.009) | B→D→O→d→P +C |
| como-hacer-presupuesto-mensual-chile | owner · presupuesto-mensual-control-financiero | no | — | no | media | B→D→O→d→P |
| fondo-emergencia-chile | owner · fondo-emergencia-colchon | no | 0/21/23,10 | sí | media | B→D→O→d→P +M |
| licencia-medica-desde-que-dia-pagan | owner · licencia-medica-pago | no | 0/50/8,90 | parcial | alta (subsidio/Fonasa) | B→D→O→d→P +C (+M si hay subsidios) |
| fonasa-vs-isapre-comparativa | owner · fonasa-vs-isapre | no | 0/7/5,29 | parcial | alta (salud/Ley 18.933) | B→D→O→d→P +C (+M si hay 7 %) |
| suplantacion-identidad-creditos-no-reconocidos | owner · suplantacion-identidad-creditos | no | 0/7/3,71 | no | alta (fraude/CMF) | B→D→O→d→P +C |
| primer-empleo-chile-guia-completa | owner · primer-empleo-integral | no | 0/3/6,00 | no | media | B→D→O→d→P |
| bancos-y-fintech-chile | owner · tipos-de-cuenta-banco-vs-fintech-chile | no | 0/8/8,88 | no | media | B→D→O→d→P |
| finanzas-para-migrantes-chile | owner · finanzas-iniciales-migrantes-chile | no | 0/4/10,50 | no | media | B→D→O→d→P |
| estafas-financieras-chile-vishing-smishing-marketplace | owner · estafas-financieras-prevencion | no | 0/1/11,00 | no | alta (fraude) | B→D→O→d→P +C |

## Ownership — conflictos: NINGUNO

Verificado por inspección de frontmatter (`topicRole`/`canonicalTopic`,
53/53 posts con `topicRole`):

- 47 `owner`, 5 `support`, 1 `reference`. Cero `canonicalTopic` con 2+
  owners (doble-owner = 0, meta del plan cumplida en F0).
- Los 6 `canonicalTopic` compartidos son todos owner+support o
  owner+reference, patrón válido:
  - `elegir-instrumento-ahorro-inversion`:
    owner `ahorro-e-inversion-…-2026` + support `como-elegir-…`
  - `interes-compuesto-caso`:
    owner `el-poder-del-interes-compuesto` + reference
    `interes-compuesto-nota-metodologica`
  - `informe-deudas-cmf-vs-dicom`:
    owner `informe-deudas-cmf-vs-dicom` + support
    `donde-ver-si-estoy-en-dicom-gratis`
  - `finiquito-indemnizaciones`:
    owner `finiquito-e-indemnizaciones-en-chile` + support
    `indemnizacion-anos-de-servicio-chile`
  - `f22-revisar-enviar`:
    owner `operacion-renta-f22-checklist` + support `operacion-renta-centro`
    (lote 0, fuera de cola)
  - `seguro-cesantia-cobertura`:
    owner `seguro-de-cesantia` + support
    `seguro-cesantia-cuenta-individual-vs-fondo-solidario`
- Cero `support` huérfanos (todos tienen su owner declarado).
- Re-verificar ownership al abrir cada lote F1 (el frontmatter puede
  derivar entre la cola y la ejecución); conflicto sin resolver = HALT.

## Stale list: NINGUNA (stale = 0)

`staleSlugs: []` al 2026-09-15, confirmado por gate en vivo 2026-09-16.
Vencimientos próximos (orden de vigilancia, no stale):
2026-10-05 `como-hacer-presupuesto-mensual-chile`,
2026-10-06 `utm-chile-que-es-como-funciona`,
2026-10-09 `fondos-afp-a-b-c-d-e` / `que-es-la-cuenta-2-afp` /
`reforma-previsional-2025-…` / `indemnizacion-anos-de-servicio-chile` /
`seguro-cesantia-cuenta-individual-…` / `liquidacion-de-sueldo`,
2026-10-13 cadencia-30 d (`deposito-a-plazo-uf-vs-pesos`, `que-es-el-apv`,
`que-es-el-ipc-…`, `que-es-la-uf`, `reajuste-arriendo-uf-ipc-chile`).

## HALT / STOP explícitos

1. Ningún HALT activo en F0: sin double-owners, sin stale, sin cambios de
   contenido realizados.
2. STOP heredados del plan, vigentes para F1+: ownership sin resolver;
   `TODO:SOURCE > 0`; compliance `alta` sin firma humana; externo
   `blocking=true`; slug/canonical tocado sin ADR + snapshots ruta/RSS;
   mismo agente en draft y auditoría (separación de deberes);
   marcar gates `[X]` en `07-publish-packet.md` (solo humanos).
3. `contribuciones-bienes-raices-chile` y `rentas-mixtas-sueldo-honorarios`
   (impuestos-personas) no aparecen en los stat de lote 0 revisados: antes
   de F1 de cualquier lote vecino, confirmar cobertura de lote 0 con el
   owner; si faltan, van a deuda técnica, NO se reabren aquí.
4. Señales débiles asumidas: tráfico artículo W36 muy bajo (máx. 5 clics);
   el orden entre filas de 0 clics se apoya en impresiones + dueDate +
   overlap, no en clics. `calc`/`sens.` son estimaciones F0.

## Salidas de gates F0 (read-only)

- `pnpm run audit:topic-overlap` → exit 0 (53 artículos, 0 warnings).
  No escribe archivos de salida (solo stdout).
- `pnpm run audit:cannibalization` → exit 0; escribe
  `output/validation/cannibalization/2026-W37-cannibalization.json`
  (derivado informativo, no baseline).
- `pnpm run check:editorial-timeliness` → exit 0
  (`published=53 stale=0 drift=0`).
