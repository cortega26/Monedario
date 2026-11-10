Status: DRAFT — pending ComplianceAgent review
Role: DraftAgent (Claude Code, sesión nueva, separada del auditor)

# Draft — corrección acotada del reajuste UTM

- Run id: `20261029-1500-utm-audit`
- Slug: `utm-chile-que-es-como-funciona`
- Plan: `docs/backlog/PLAN-utm-reajuste-copy-correction-2026-10-29.md`
- Base: `d7418fc2d6cea9d7d4dfeab99c37e9f947d1f6ae` (sin commit)

## Archivos modificados

1. `src/data/blog/utm-chile-que-es-como-funciona.md`
2. `src/pages/calculadoras/conversor-utm.astro`
3. `src/data/glossary/utm.md`
4. `src/data/correcciones.json` (nueva entrada `utm-reajuste-mensual-copy`, 2026-10-29, primera de la lista; registros previos intactos)

## Formulación única aplicada

"La UTM se reajusta mensualmente de acuerdo con el IPC y el SII publica su valor para cada mes."

Respaldo (dossier, VERIFIED):
- SII, Diccionario básico tributario contable, entrada UTM — https://www.sii.cl/ayudas/ayudas_por_servicios/4669-u.html — respalda la actualización de la UTM según el IPC (parafraseado en las páginas, sin cita literal).
- SII Educa, Tipos de impuestos en Chile — https://www.sii.cl/siieduca/aprende-con-nosotros/tipos-de-impuestos-en-chile.html — respalda el reajuste mensual según el IPC (parafraseado, sin cita literal).
- SII, UTM–UTA–IPC 2026 — https://www.sii.cl/valores_y_fechas/utm/utm2026.htm — tabla de valor por mes.

No se afirma día de vigencia (calendario/hábil) ni regla M−1/M−2. La Circular N.º 39 no se cita en las páginas (evidencia contextual, no regla). No se cita fuente SEO.

## Cambios por superficie

### Guía (`src/data/blog/utm-chile-que-es-como-funciona.md`)
- `updatedDate` 2026-09-18 → 2026-10-29; `articleLead.validAsOf` 2026-09-18 → 2026-10-29.
- `articleLead.answer`: "primer día hábil… IPC del mes anterior" → formulación única.
- `officialSources`: se agregan SII Diccionario y SII Educa.
- FAQ "¿Cuánto vale la UTM hoy?": "cambia el primer día hábil" → "cambia cada mes"; $71.721 rotulado "ejemplo histórico de septiembre 2026".
- FAQ "¿Cómo afecta el IPC…?": se retira "del mes anterior" y las subafirmaciones direccionales (IPC positivo/negativo); la respuesta queda como "La UTM se reajusta mensualmente de acuerdo con el IPC y el SII publica su valor para cada mes en su tabla oficial: sii.cl/valores_y_fechas/utm/utm2026.htm."
- Párrafo inicial, respuesta rápida ("Cómo cambia", "Valor de ejemplo (histórico, septiembre 2026)", "Vigencia: … no es el valor actual").
- Aviso "Información vigente al 2026-04-09" → "Contenido revisado el 2026-10-29. Los montos en pesos… son ejemplos históricos de septiembre 2026 (salvo los que indican otro período) y no se actualizaron en esta revisión."
- "¿Qué es la UTM?": "actualiza su valor el primer día hábil" → publica su valor cada mes + paráfrasis enlazada de SII Diccionario (actualización según IPC) y SII Educa (reajuste mensual); sin citas literales.
- "Cómo se reajusta la UTM": retirado "al comienzo de cada mes / mes anterior / mes pasado / al mes siguiente"; se remite a la tabla mensual SII. Se retiró la lista de subafirmaciones direccionales (IPC positivo/negativo/0%).
- Tabla UTM/UTA: "Primer día hábil de cada mes" → "Mensual, según el IPC".
- Tabla UTM/UF: "IPC del mes anterior" → "reajuste mensual según IPC".
- "Dónde ver el valor" y aviso: retirado "primer día hábil"; $71.721 "correspondiente a septiembre 2026".
- Resumen: retirado "primer día hábil" y "IPC del mes anterior"; la viñeta del IPC queda como "Se reajusta mensualmente de acuerdo con el IPC y el SII publica su valor para cada mes." (sin "sube con inflación, puede bajar con deflación").
- Fuentes: se agregan SII Diccionario y SII Educa.

### Conversor (`src/pages/calculadoras/conversor-utm.astro`)
- FAQ "¿Cuánto vale 1 UTM…?" y "¿Por qué cambia…?": formulación única.
- Explicación visible/sin JS y aviso ⚠️: retirado "primer día hábil" e "IPC del mes anterior".
- `MethodologyBlock.notes`: formulación única con referencia a SII Diccionario y SII Educa; `sources` agrega ambas URL (date "2026-10-29" = fecha de consulta).

### Glosario (`src/data/glossary/utm.md`)
- "¿Cómo se calcula?": formulación única, respaldada con enlaces al Diccionario básico tributario contable del SII y a SII Educa (sin citas literales), y enlace a la tabla SII.

### Registro (`src/data/correcciones.json`)
- `wrong[0]` precisado: el "primer día hábil" se atribuye solo a la guía y al conversor; la referencia al IPC del mes inmediatamente anterior, a las tres superficies.

## Pasada residual — frases direccionales (hallazgo de 05-math-audit)

Nueva sesión DraftAgent, posterior a 05-math-audit. Solo se retiran dos frases direccionales preexistentes que las fuentes del cambio no acreditan como regla general:

- Guía, sección "¿Qué es la UTM?": "un número de referencia que sube o baja con la inflación" → "un número de referencia que se reajusta mensualmente de acuerdo con el IPC y cuyo valor para cada mes publica el SII".
- Conversor, FAQ "¿Por qué cambia…?": "aunque su equivalente en pesos suba mes a mes" → "aunque su equivalente en pesos cambie con cada reajuste mensual".

Búsqueda de equivalentes en las tres superficies (sube/baja/aumenta/crece/disminuye/inflación/deflación/mes a mes): no se encontraron otras afirmaciones direccionales. Las menciones restantes ("reajustable mensualmente por inflación" en el glosario, "siguen la inflación" en la tabla UTM/UF) no indican dirección y se dejan sin cambios; el glosario no se modificó en esta pasada.

Sin cifras, fórmulas, reglas legales, citas literales, mes IPC específico ni día de vigencia añadidos. Esta pasada requiere nueva revisión MathAudit (diff) y ComplianceAgent. No se ejecutaron pruebas ni verificaciones automáticas en esta pasada.

## Sin cambios (para verificación MathAudit)
Fórmulas, cálculos, $71.721, $834.504, $69.542, tramos ISC, $11.265.804, $417.252, slugs, rutas, canonical, título/description SEO, snapshot y worker.

## Limitaciones
- No se ejecutaron tests ni `pnpm run check:correcciones` (fuera de alcance de esta sesión). Solo se validó que `correcciones.json` parsea como JSON.
- El tipo del campo `date` en `sources` de `MethodologyBlock` no se verificó; se usó string literal.
- `docs/backlog/README.md` ya aparecía modificado antes de esta sesión; no lo toqué.
- No se marcaron gates ni se editó 05/06/07. Sin autocertificación de cumplimiento.
