# PLAN — Dependencias diferidas y riesgos aceptados (2026-10-19)

**Estado:** Backlog
**Origen:** decisiones del saneamiento CI/billing del 2026-10-19.
**Alcance:** upgrades mayores no urgentes y riesgos dev-only que no bloquean
producción.

## 1. Satori 0.33.4 → 0.51+

- **Motivo:** salto grande en el generador de OG images; afecta 54 artículos y
  las tarjetas sociales.
- **Riesgo:** cambios de layout, fuentes o wrapping; no es security.
- **Trabajo:**
  1. Golden test de OG images (hash/visual diff) para una muestra
     representativa y build completo de las 54.
  2. Actualizar `satori` y revisar `fflate` (satori 0.51 aún pinea 0.7.3;
     mantener el override `fflate@<0.7.5: 0.7.5` hasta que publique).
  3. Comparar `public/images/og/*.jpg` antes/después.
- **Target:** antes de 2026-12-15 o antes de Astro 8, lo que ocurra primero.
- **Rollback:** revert del bump + regeneración de OG images.

## 2. TypeScript 6.0.3 → 7.x

- **Motivo:** compilador mayor (port nativo); no es security.
- **Riesgo:** Astro/Volar/ESLint/tooling aún no declaran soporte completo.
  `check-ts7-readiness.yml.disabled` no se ha ejecutado.
- **Trabajo:**
  1. Habilitar el readiness workflow en una rama y medir errores.
  2. Validar `astro check`, `tsc`, ESLint y Vitest.
  3. Migrar en un PR dedicado, sin mezclar con dependencias runtime.
- **Target:** Q1 2027, después de que Astro/Volar/ESLint lo soporten.
- **Rollback:** revert del bump de `typescript`.

## 3. `extract-zip` high dev-only — riesgo aceptado

- **Cadena:** `@lhci/cli → lighthouse → puppeteer → @puppeteer/browsers →
  extract-zip`.
- **Estado:** no hay versión parcheada publicada (máximo 2.0.1, 2020).
- **Exposición:** solo dev/CI; no llega a `dist/` ni al runtime del sitio. El
  exploit requiere un archivo ZIP malicioso; LHCI descarga navegadores desde
  orígenes confiables.
- **Mitigación:** re-chequear el registro mensualmente por un 2.0.2 real;
  mientras no exista, no forzar un fork ni un override sin parche.
- **Revisión:** 2027-01-31.

## 4. `@kindspells/astro-shield@1.7.1` — peer Astro ^4

- **Estado:** es la última versión publicada; declara peer `astro ^4.0.0` pero
  el repo usa Astro 7.3.8. El build pasa.
- **Riesgo:** integración no declarada para Astro 7; puede romper en un bump
  futuro de Astro.
- **Acción:** monitorear releases; si no hay soporte, evaluar reemplazo o
  retiro de la integración. No bloquear el saneamiento actual.

## 5. `@tailwindcss/typography` peer warning

- **Estado:** pnpm reporta peer no satisfecho por el rango
  `>=3.0.0 || >=4.0.0 || insiders`; `tailwindcss 4.3.3` está instalado y el
  build pasa.
- **Acción:** monitorear; no es un blocker. Revisar en el próximo bump de
  Tailwind.

## 6. `basic-ftp` override 6.2.3

- **Estado:** adoptado en `pnpm-workspace.yaml`; `get-uri 6.0.5` usa
  `Client/access/list/lastMod`, API mantenida en v6.
- **Reversión:** si LHCI falla o `basic-ftp` aparece en el grafo de build,
  retirar el override y registrar la excepción dev-only con fecha.
