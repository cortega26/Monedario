# ADR-20260918-bcn-citation-extractor

Date: 2026-09-18
Status: Accepted

## Context

Las auditorias editoriales necesitan verificar citas legales literales
contra la fuente autoritativa (bcn.cl/leychile). El copiado manual no es
reproducible ni verificable por maquina.

El spike en `/tmp/opencode/bcn-spike/` (2026-09-17/18, solo lectura, repo
intacto) probo la tecnica: el SPA de LeyChile obtiene el texto completo via
`GET nuevo.leychile.cl/servicios/Navegar/get_norma_json?idNorma=<id>...`
(con User-Agent de navegador; sin el, HTTP 401), y el normalizador separa
notas marginales a nivel HTML, segmenta incisos por `div.p` y resuelve
fechas relativas contra `fecha_publicacion`. Resultado: **13/13 EXACT**
sobre el golden (Ley 19.628 art. 18 inc. 2 + art. 19; CT 163/172/168;
CC 2515; Ley 21.735 transitorio; Ley 20.720 art. 260/264; DL 3500 art. 19).

Cita constitucional (por que un script con red esta permitido aqui):

- `docs/AI_ENGINEERING_CONSTITUTION.md` §2.2 (Side-Effect Isolation): IO,
  HTTP y red existen solo fuera del dominio. `scripts/` es tooling
  operacional fuera de las capas `src/` (`domain` puro, `application`,
  `infrastructure`); el extractor no es importado por `src/`, build ni
  runtime. Precedentes: `scripts/refresh-economic-snapshot.mjs`
  (mindicador.cl), `scripts/data-signals/*`, `check-urls-external.mjs`.
- §11 (sin errores silenciosos): el contrato es fail-closed — residuo de
  nota o parte ausente = exit != 0 con motivo, nunca una cita sucia.
- §9 / Rule 4.3 (`docs/development/CONSTITUTION_BINDING_RULES.md`): nuevo
  tooling operacional con politica de cache/rate se documenta en ADR.

## Decision

Se adopta `scripts/bcn-cite.mjs` (cero dependencias, Node 22) como unico
verificador de citas literales, con:

1. Contrato estable `cite(idNorma, {art|idParte|transitorio,
   inciso|numeral|final, idVersion?})` ->
   `{literal, locator, version, notes[], resolvedDate?}`, donde:
   - `locator = {idNorma, art?, idParte?, transitorio?, inciso?, numeral?,
     final?, idParteResolved, name}`.
   - `version = {idNorma, idVersion ("latest" si no se pina),
     fechaPublicacion, tituloNorma}`.
   - `notes = [{kind: modificatoria|nota-ref|nota-pie, text}]`.
   - `resolvedDate? = {iso, rule, n, unit, anchor}` (solo con
     `--resolve-dates` y patron anclado a publicacion).
2. Cache local `output/validation/bcn-cache/<idNorma>@<idVersion|latest>.json`
   (artefacto runtime, gitignored), TTL 30 dias, secuencial 1 req/1.5s
   (archivo `.last-fetch` + `--sleep-ms`), 1 request por norma.
3. Golden `tests/bcn-cite.golden.json` (13 literales verificados a mano) y
   suite `tests/scripts/bcn-cite.test.ts` hermetica (fixtures HTML reales,
   sin red); red en vivo solo opt-in (`BCN_LIVE=1`, omitido por defecto).
4. Sin `vocab.json`: el spike midio 1321/1321 JOIN con 0 casos SPACE en 6
   normas, y el golden da 13/13 tambien sin vocabulario; la resolucion de
   pegas queda en join por defecto documentado en codigo.

Lo que NUNCA debe hacer: reescribir articulos, marcar gates de publicacion,
inventar citas (toda fecha no anclada a publicacion retorna `reason`, no
fecha), ni crear URLs indexables. No es gate de CI (sin script en
`package.json`): no toca `POLICY_REGISTRY.json` ni `GATE_MANIFEST.json`.

Limitaciones heredadas del spike: `--transitorio` es substring; un `div.p`
= un inciso es heuristica; el resolutor de fechas cubre ancla de
publicacion (mes/ano/dia).

## Consequences

Positivas: citas literales auditables y reproducibles; fallo ruidoso en vez
de cita contaminada; costo de red despreciable (cache 30d, 1 req/norma).

Trade-offs: dependencia de un endpoint no documentado (si cambia, el modo
`--golden` lo detecta); lexico congelado (neologismos raros podrian pegar
palabras — mitigado por el chequeo fail-closed de residuos).

## Alternatives considered

Copiado manual de citas: descartado (no reproducible, no verificable).

Scraping DOM con Playwright: descartado (el JSON ya trae el texto completo;
el spike demostro que el DOM es obsoleto para extraccion).

Integrarlo como gate bloqueante de CI con red: descartado (CI debe ser
hermetico; la cobertura vive en fixtures y el live es opt-in manual).

## Verification

- `pnpm exec vitest run tests/scripts/bcn-cite.test.ts` (26 pass, 1 live skip)
- `pnpm exec eslint scripts/bcn-cite.mjs tests/scripts/bcn-cite.test.ts`
- `pnpm exec prettier --check scripts/bcn-cite.mjs tests/scripts/bcn-cite.test.ts tests/bcn-cite.golden.json docs/adr/ADR-20260918-bcn-citation-extractor.md`
- `node scripts/check-docs-structure.mjs`
- `node scripts/check-policy-registry.mjs`
- `git diff --check`
- Manual con red: `node scripts/bcn-cite.mjs 141599 --art 18 --inciso 2` y
  `node scripts/bcn-cite.mjs --golden` (13/13 EXACT en validacion del spike)

Rollback: borrar `scripts/bcn-cite.mjs`, `tests/bcn-cite.golden.json`,
`tests/scripts/bcn-cite.test.ts`, este ADR y `output/validation/bcn-cache/`.
Sin acoplamiento con `src/`: blast radius cero.
