# Corrección YMYL: explicación de reajuste UTM

**Estado:** EN REVISIÓN EDITORIAL — corrección local, no publicada  
**Fecha:** 2026-10-29  
**Base verificada:** `d7418fc2d6cea9d7d4dfeab99c37e9f947d1f6ae`  
**Run editorial:** `artifacts/editorial/utm-chile-que-es-como-funciona/20261029-1500-utm-audit/`

## Objetivo y decisión

Corregir las afirmaciones sobre el reajuste de la UTM con el artículo cuarto transitorio del DL 830: el valor se reajusta mensualmente según la variación del IPC del segundo mes que antecede al mes de actualización. Retirar la afirmación de que cambia el primer día hábil, porque la norma no especifica un día concreto del mes. Responder la FAQ de valor actual con el valor SII de octubre de 2026 ($72.151), con fecha y mes explícitos.

La revisión también corrige la discrepancia de fechas de corte visible en la guía. Las cifras de ejemplo permanecen rotuladas con su mes de referencia y no se actualizan en esta corrección.

## Alcance

**En alcance**

- `src/data/blog/utm-chile-que-es-como-funciona.md`: lead, FAQ, explicación, comparativa, avisos y resumen que contienen la regla temporal; actualizar `updatedDate` y su fecha visible de revisión.
- `src/pages/calculadoras/conversor-utm.astro`: FAQs, explicación sin JavaScript, aviso y metodología.
- `src/data/glossary/utm.md`: explicación del reajuste mensual.
- `src/data/correcciones.json`: nueva entrada material enlazada a las tres páginas existentes.
- `scripts/check-correcciones.mjs`: permitir resolver una ficha de glosario dinámica cuando existen tanto la plantilla Astro `[slug].astro` como el archivo de contenido correspondiente.
- `tests/scripts/check-correcciones.test.ts`: regresión positiva y negativas del resolver dinámico.
- `scripts/legal-citations/registry.mjs`: reconocer el DL 830 (BCN `idNorma=6374`) como fuente legal externa verificada, sin crear ficha ni ruta.
- `docs/adr/ADR-20261029-correcciones-dynamic-glossary-routes.md`: registrar el ajuste al contrato del gate.
- Este plan y los artefactos del run YMYL indicado arriba.

**Fuera de alcance**

- Fórmulas, cálculos, snapshot económico, worker de actualización, valores dinámicos del conversor, ejemplos históricos y tablas tributarias.
- Slugs, rutas, canonical, nuevas páginas indexables, metadatos SEO ajenos a la explicación o deploy/publicación.
- Otros claims sobre UF, impuestos, multas o elegibilidad que no formen parte de la regla de reajuste UTM.
- Cambios al formato de rutas públicas, al generador de rutas Astro o a otros resolvers dinámicos.
- Los cuatro archivos de auditoría preexistentes sin seguimiento.

## Evidencia y límites

Fuentes oficiales consultadas el 2026-10-29: BCN/LeyChile, artículo cuarto transitorio del DL 830; tabla SII UTM–UTA–IPC 2026. La norma establece que el reajuste mensual considera la variación del IPC del segundo mes anterior al mes de actualización. Extracto literal: “se reajustará mensualmente […] en el segundo mes que anteceda al correspondiente a la actualización de dicha unidad”. La disposición no señala un día concreto del mes. La tabla SII fija octubre de 2026 en $72.151 y septiembre en $71.721.

La observación web de las páginas Monedario provino de un rastreo marcado “last week”; es evidencia de contenido rastreado, no de estado actual de producción. Esta tarea solo modifica el checkout.

## Invariantes y gates

- Precedencia: Constitución → `AGENTS.md` → contextos → código.
- `INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES`: autoría en una sesión Claude limpia; auditoría en este agente GPT y ComplianceAgent en sesión Claude Code nueva.
- `docs/editorial/NORMA_YMYL.md` §5.4: registrar la corrección material en `src/data/correcciones.json`.
- Foco estratégico 2026Q3: se conserva el inventario de URLs; esta corrección de integridad está dentro del foco.
- No marcar gates humanos `[X]`, no completar sign-off, no commit, push ni deploy.

## Criterios de aceptación

1. Las tres superficies no afirman “primer día hábil” ni atribuyen la UTM al IPC del mes inmediatamente anterior; la guía explica M−2 con cita literal del DL 830 y no inventa un día exacto.
2. El texto visible explica el IPC del segundo mes anterior, cita el artículo cuarto transitorio del DL 830 y remite a la tabla oficial del SII para consultar los valores mensuales.
3. La guía distingue que la revisión del 2026-10-29 cubre la regla UTM y su valor de octubre; los ejemplos tributarios de otros períodos quedan identificados y no se presentan como auditados ni actualizados en esta corrección.
4. `correcciones.json` describe la regla previa incorrecta, las frases direccionales retiradas y el valor actualizado de octubre; conserva las tres URL existentes y cita BCN y SII.
5. No se altera ninguna URL, fórmula, valor dinámico ni resultado calculado. La única cifra textual nueva es el valor SII de octubre de 2026 en la respuesta actual de la guía; no se reemplazan otros ejemplos históricos.
6. Una prueba de regresión confirma que el resolver acepta una ruta de glosario solo si existen plantilla y contenido correspondientes, y rechaza ambos casos incompletos.
7. El dossier, math audit y ComplianceAgent registran evidencia y límites; el paquete queda pendiente de decisión humana de publicación.

## Verificación acordada

| Comando | Resultado esperado |
|---|---|
| `pnpm exec vitest run tests/scripts/check-correcciones.test.ts` | Regresión dinámica pasa para ruta válida y falla si falta plantilla o contenido. |
| `pnpm run check:correcciones` | Todas las entradas, incluida `/glosario/utm/`, resuelven; salida OK. |
| `pnpm run check:frontmatter` | Guía y contenido editorial pasan. |
| `pnpm run check:editorial` | Sin errores nuevos en las tres superficies. |
| `pnpm run check:legal-citations` | Citas de páginas pasan. |
| `pnpm run check:docs` y `pnpm run format:check` | ADR, plan y artefactos respetan estructura y formato. |
| `git diff --check` | Sin whitespace errors. |

## Riesgo y reversión

Riesgo residual: bajo de regresión técnica y alto de precisión editorial por tratarse de contenido tributario. Reversión local: revertir solo los cambios de las tres superficies y la nueva entrada de correcciones; conservar el expediente de revisión como historial. No implica reversión del snapshot ni intervención en producción.

## Progreso de ejecución

- El chequeo inicial encontró que `check:correcciones` rechazaba `/glosario/utm/` porque solo resolvía archivos Astro estáticos y posts. La ruta existe mediante `src/pages/glosario/[slug].astro` y `src/data/glossary/utm.md`; conservar el enlace exacto requiere corregir el gate.
- Fuentes primarias consultadas nuevamente el 2026-10-29: DL 830, artículo cuarto transitorio (BCN/LeyChile), establece el IPC del segundo mes anterior al de actualización; la tabla oficial SII fija octubre 2026 en $72.151 y septiembre en $71.721. La norma citada no define un día exacto del mes.
- El FAIL original de `06-compliance.md` queda preservado como historial. La corrección de copy y evidencia oficial corresponde al bucket C; MathAudit independiente, ComplianceAgent en sesión limpia y revisión de montos preexistentes siguen en bucket B. Las puertas humanas de `07-publish-packet.md` permanecen sin marcar.
- DraftAgent Claude Code 2.1.312 (sesión limpia `5b760906-3f45-4c91-a700-5ed70fc3b4c1`) inició la aplicación de la regla M−2 el 2026-10-29. La llamada terminó con `429 usage_limit_reached` tras tres turnos; Claude informó reinicio el 2026-10-31 07:00 America/Santiago. La guía y el glosario contienen parte del nuevo texto; la sesión no alcanzó a actualizar el conversor, `correcciones.json` ni `04-draft.md`. No se reintentó ni se cambió de proveedor.
- Se corrigió el registro técnico de fuentes legales al añadir BCN `idNorma=6374` a `KNOWN_IDS_WITHOUT_LAW_PAGES`, tras validar el artículo cuarto transitorio del DL 830. `check:legal-citations` pasó. Prettier normalizó la guía y `format:check` pasó.
- Chequeos locales posteriores al cambio parcial: regresión focalizada 3/3; `check:frontmatter`, `check:correcciones`, `check:legal-citations`, `check:editorial`, `check:docs`, `format:check` y `git diff --check` pasan. `check:editorial` mantiene solo dos advertencias preexistentes en artículos ajenos al alcance.
- Estado aún incompleto: el contenido de las superficies no es coherente; `correcciones.json` y `04-draft.md` conservan el registro anterior. `05-math-audit.md` mantiene su revisión no independiente y la conclusión desactualizada sobre M−2; `06-compliance.md` conserva el FAIL original. No publicar ni marcar `07-publish-packet.md`.
- Próximo paso cuando Claude Code vuelva a estar disponible: iniciar una sesión DraftAgent nueva, leer primero los insumos requeridos, completar únicamente los cinco paths autorizados y actualizar `04-draft.md`; luego detenerse para MathAudit independiente y ComplianceAgent en sesión limpia. No desplegar ni publicar.
