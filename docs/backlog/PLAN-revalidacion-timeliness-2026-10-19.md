# PLAN — Revalidación editorial de timeliness (2026-10-19)

**Estado:** Pendiente de firma humana
**Origen:** `check:editorial-timeliness` en el scheduled CI de `main`.
**Alcance:** tres artículos publicados; no se crean URLs ni se cambian slugs.

## Artículos y hallazgos

### 1. `liquidacion-de-sueldo`

- **SLA:** 180 días desde `validAsOf 2026-04-12` → vencido 2026-10-09.
- **Revisión:** art. 54 y 54 bis del Código del Trabajo contrastados con BCN y
  la Dirección del Trabajo.
- **Hallazgo material:** la fuente etiquetada «Dirección del Trabajo — artículo
  54» apuntaba a una consulta sobre indemnización por años de servicio
  (`w3-article-60593`), no al artículo 54. Se reemplazó por el Código del
  Trabajo en BCN.
- **Registro:** `src/data/correcciones.json` →
  `liquidacion-sueldo-fuente-articulo-54`.
- **Sin otros cambios de contenido:** las referencias a 54 bis, la separación
  imponible/no imponible y el detalle de remuneración variable son correctas.

### 2. `que-es-la-cuenta-2-afp`

- **SLA:** 180 días desde `validAsOf 2026-04-12` → vencido 2026-10-09.
- **Revisión:** Cuenta 2 y giros contrastados con la Superintendencia de
  Pensiones.
- **Confirmado:** 24 giros por año calendario; los traspasos a la cuenta
  obligatoria no cuentan como giro; la cuenta no se cierra con saldo cero; los
  fondos no se consideran para la Pensión Mínima Garantizada; la comisión es un
  porcentaje del saldo fijado por cada AFP.
- **Sin cambios materiales.**

### 3. `sueldo-imponible-chile`

- **Drift:** UTM cambió el 2026-10-01; `expectedValue 71721` no coincidía con
  el snapshot 72151; `validAsOf 2026-09-12` estaba detrás del trigger.
- **Revisión:** UTM octubre 2026 = **72.151** y tabla ISC 2026 (factores
  4%/8%/13,5%/23%/30,4%/35%/40%; exento hasta 13,5 UTM) contrastados con SII.
- **Corrección:** `expectedValue` 71721 → 72151. El texto usa el token dinámico
  `[[utm]]`, por lo que el valor visible ya era el vigente.
- **Sin cambios materiales de prosa.**

## Fechas

Los tres artículos pasan a `validAsOf: 2026-10-19` y `updatedDate:
2026-10-19`. `reviewPolicy.computedAt` también se actualiza a 2026-10-19 porque
esta revisión es el evento de revisión humana que ese campo declara.

## Firma humana

- [ ] Editor humano confirma la corrección del enlace de `liquidacion-de-sueldo`.
- [ ] Editor humano confirma el bump de `validAsOf` de los tres artículos.
- [ ] Editor humano confirma que no hay cambios materiales adicionales.

Sin estas casillas, el PR queda en draft y no se mergea.

## Verificación

- `node scripts/check-editorial-timeliness.mjs` → `stale=0 drift=0`.
- `node scripts/check-correcciones.mjs` → registro válido.
- `node scripts/check-frontmatter.mjs` → sin errores.
- `node scripts/check-editorial.mjs` (o `pnpm run check:editorial`) → sin
  hallazgos bloqueantes.

## Rollback

Revert único del PR. Si se revierte después de publicar, las fechas vuelven a
las anteriores y la entrada de `correcciones.json` se retira solo si la
corrección del enlace también se revierte.
