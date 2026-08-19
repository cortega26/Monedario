# PLAN — Fix timeliness issues #405 y #407 (2026-08-19)

## Contexto

Diagnóstico completo: `docs/backlog/DIAGNOSTICO-editorial-timeliness-issues-405-407-2026-08-19.md`
(archivo local, gitignored — este PLAN es el artefacto de registro trackeado).

- `main` @ `352395b5` (2026-08-19).
- Único artículo stale: `impuesto-global-complementario-chile` (SLA 90d vencido 2026-08-12).
- Gate `check-editorial-artifacts` (estricto, CI): 3 posts non-compliant por run dirs
  `20260812-*` sin `sources.yaml`/`metadata.yaml`.
- Gate `check-official-host-registry`: `tgr.gob.cl` no registrado.
- GitHub Actions bloqueado por billing (fuera del repo, no se corrige aquí).

## Cambios

1. `src/data/blog/impuesto-global-complementario-chile.md` — revisión factual real
   (no solo bump de fechas):
   - Tramos IGC, UTA $834.504 y retención boletas 15,25% (AT2026): **verificados
     correctos** contra SII (fetch 2026-08-19).
   - **Corrección 1 (error importante):** la retención de honorarios y las
     cotizaciones previsionales de trabajadores independientes se atribuían a
     "Ley 21.242"; la fuente oficial (SII — aumento gradual de retención) y el
     corpus auditado (`boleta-honorarios-2026-retencion-cobertura`, `2b1f681f`)
     las atribuyen a **Ley 21.133**.
   - **Corrección 2 (error importante):** Modalidades A/B del APV (art. 42 bis LIR)
     descritas invertidas — Modalidad A **no** es crédito tributario en el F22
     sino bonificación estatal del 15% (tope 6 UTM anuales) depositada por la TGR
     en la cuenta previsional; el tope 50 UF mensuales / 600 UF anuales es de la
     Modalidad B (rebaja de base imponible). Mismo error ya corregido en
     `rentas-mixtas-sueldo-honorarios` (2026-08-13, registro §17 de
     `PLAN-auditoria-corpus-publicado-2026-08-12.md`).
   - `articleLead.validAsOf` 2026-05-14 → 2026-08-19; `updatedDate`
     2026-08-09 → 2026-08-19 (cambio sustantivo, NORMA §5.1); aviso de vigencia
     del cuerpo actualizado. `computedAt` intacto.
2. `sources.yaml` + `metadata.yaml` agregados a los 3 run dirs `20260812-*`
   (fuentes reales de cada run, extraídas de dossiers/compliance):
   - `devolucion-impuestos-fechas-compensaciones/20260812-1420-lote0c/`
   - `operacion-renta-f22-checklist/20260812-1312-lote0b/`
   - `rentas-mixtas-sueldo-honorarios/20260812-1345-lote0b/`
3. `src/config/official-hosts.json` — registro de `tgr.gob.cl` (oficial,
   "Tesorería General de la República"). `tgr.cl` se conserva.

## Registro (NORMA §5.3)

- 2026-08-19 — Revisión factual de `impuesto-global-complementario-chile.md`
  (run local sin dir de pipeline; corrección mínima del único stale de main).
  Qué cambió: (a) corrección de error importante — la retención de boletas de
  honorarios y las cotizaciones previsionales obligatorias de trabajadores
  independientes se atribuían a "Ley 21.242"; la fuente oficial y el corpus
  (SII — aumento gradual retención; `boleta-honorarios-2026-retencion-cobertura`,
  auditada en `2b1f681f`) la atribuyen a **Ley 21.133** (entrada en vigor
  progresiva desde 2019); (b) corrección de error importante — el bloque APV
  describía las Modalidades A y B del art. 42 bis LIR invertidas: Modalidad A
  **no** es un crédito tributario en el F22 sino bonificación estatal del 15%
  del ahorro anual con tope de 6 UTM anuales depositada por la TGR en la cuenta
  previsional, y el tope de 50 UF mensuales/600 UF anuales corresponde a la
  Modalidad B (rebaja de base imponible); mismo error ya corregido en
  `rentas-mixtas-sueldo-honorarios` el 2026-08-13 (registro §17 de
  `PLAN-auditoria-corpus-publicado-2026-08-12.md`); (c) `articleLead.validAsOf`
  2026-05-14 → 2026-08-19 y `updatedDate` 2026-08-09 → 2026-08-19 por cambio
  sustantivo (NORMA §5.1, "corrección de error importante"). Por qué: hallazgos
  de la revisión factual de esta sesión (2026-08-19); el artículo era el único
  stale de main (SLA 90 días vencido el 2026-08-12) y bloqueaba el gate editorial
  de CI (#405). Fuentes: SII — Datos informativos AT2026 personas naturales
  (tramos IGC y UTA verificados, fetch 2026-08-19); SII — boletas de honorarios,
  aumento gradual de retención (Ley 21.133, 15,25% en 2026, fetch 2026-08-19);
  SII — FAQ 001_140_5883 (regímenes tributarios APV, art. 42 bis, fetch
  2026-08-19); Superintendencia de Pensiones — Compendio, cap. XI bonificación
  fiscal APV/APVC (fetch 2026-08-19); CMF Educa — beneficios tributarios
  APV/APVC (fetch 2026-08-19). No se tocó: tramos IGC (100% verificados contra
  SII), UTA/volatileData, SEO, TTL/Cloudflare, otros artículos, issues.

## Gates (2026-08-19, local, node v22.20.0)

- `check:editorial-timeliness`: **stale=0 drift=0** (era stale=1).
- `check-editorial-artifacts` `EDITORIAL_ENFORCE=1 EDITORIAL_SCOPE=all`:
  **47/47 compliant** (eran 3 non-compliant).
- `check-official-host-registry`: **OK, 38 hosts** (era 37).
- `check-economic-snapshot-freshness`: OK (capturedAt 0.3d).
- `pnpm run check:ci`: **exit 0** (lint, format, tests, boundaries, context,
  policy-registry, legal-constants, docs, frontmatter, legal-citations,
  hero-images, hero-prompts, editorial, editorial-timeliness, no-postid-urls,
  routes, astro check, economic-source-consistency, catalog-drift,
  article-registration, official-host-registry, homepage-surface-freshness,
  small-details).

## Cierre de issues

- #407 → se auto-cierra al correr `editorial-timeliness-audit.yml` verde
  (requiere billing de Actions restaurado).
- #405 → se auto-cierra al correr `ci.yml` verde (requiere billing restaurado).