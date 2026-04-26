# Next Best Step — Copy & Rules Editorial Guide

> Authoridad: `docs/adr/ADR-20260416-next-best-step-framework.md`  
> Implementación: `src/data/nextBestStep/rules.ts`  
> Lectura obligatoria antes de editar: `docs/editorial/NORMA_YMYL.md`

---

## 1. Quién puede editar `rules.ts`

`src/data/nextBestStep/rules.ts` es un archivo de **catálogo editorial**, no de lógica de negocio. Las personas autorizadas para editarlo son:

- **Product / editorial**: puede cambiar `headline`, `ctaLabel`, `ymylTag` y la `href` de destino.
- **Engineering**: puede cambiar predicados `when`, `priority`, `mutexGroup`, y agregar/eliminar reglas.

Toda modificación requiere revisión de al menos una persona de la otra categoría (cross-functional PR).

---

## 2. Cómo validar copy contra NORMA_YMYL.md

Toda regla con `ymylTag` presente obliga cumplir estas condiciones antes de mergear:

1. **Headline no prescriptivo**: debe describir una posibilidad o acción exploratoria, nunca una instrucción directa. ✅ "Podrías reducir tu impuesto con APV" — ❌ "Deberías contratar APV régimen B".
2. **ctaLabel lleva al tool/info, no a una acción externa irreversible**: ✅ "Calcular APV →" — ❌ "Cotizar APV ahora →".
3. **Disclaimer automático**: el hidratador (`next-best-step.ts`) agrega el disclaimer "Sugerencia orientativa — valida con fuente oficial" con link a la fuente oficial correspondiente. No borrar esta lógica.
4. **Fuentes oficiales por `ymylTag`**:
   - `"tax"` → SII (`https://www.sii.cl`)
   - `"labor"` → Suseso (`https://www.suseso.gob.cl`)
   - `"pension"` → Suseso (`https://www.suseso.gob.cl`)
   - `"credit"` → CMF (`https://www.cmfchile.cl/portal/principal/613/w3-channel.html`)

---

## 3. Cuándo bumppear `priority`

`priority` determina cuál regla gana cuando dos del mismo `mutexGroup` son elegibles. Pautas:

| Caso | Acción |
|---|---|
| La regla con mayor priority tiene CTR bajo pero la otra convierte mejor | Bajar la priority del bajo rendidor o subir la del mejor. Medir en scorecard semanal. |
| Se agrega una regla nueva que debería dominar en su grupo | Asignar `priority` mayor a las existentes del mismo grupo. |
| Una regla de tipo `prereq` compite con una de tipo `next-saving` | `prereq` normalmente debe ganar (evitar CTA que requiere datos que el usuario no tiene). |

No escalar prioridades sin límite: el rango recomendado es 10–99. Si necesitas más granularidad, usa decimales o redistribuye el espacio.

---

## 4. Qué pasa al cambiar umbrales tributarios anuales

Los umbrales `1_500_000` y `1_000_000` en `rules.ts` están comentados con `FACTOR_TAX_YEAR: 2026`. Se revisan cada año cuando el SII actualiza los tramos de impuesto de segunda categoría (típicamente enero–febrero).

**Proceso de revisión anual:**

1. Verificar tabla SII vigente en: `https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/`
2. Actualizar los umbrales en `rules.ts` si los tramos cambiaron significativamente.
3. Actualizar el comentario `FACTOR_TAX_YEAR` con el nuevo año.
4. Re-ejecutar `pnpm run test` para verificar que los tests de snapshot siguen pasando, o actualizar los casos sintéticos si los umbrales cambian.
5. Documentar la decisión en el PR con la fuente SII y la fecha de vigencia.

Si los tramos no cambian materialmente, no es necesario actualizar los umbrales (evita cambios cosméticos).

---

## 5. Añadir una nueva regla

1. Agregar la entrada en `RULES` en `src/data/nextBestStep/rules.ts` con todos los campos obligatorios (`id`, `priority`, `when`, `suggest`).
2. Si la regla tiene `ymylTag`, seguir el checklist del §2.
3. Agregar dos tests en `tests/integration/nextBestStep.test.ts`: uno donde `when === true` y otro donde `when === false`.
4. Agregar un snapshot del profile sintético correspondiente en la sección "Snapshot: 6+ synthetic profiles".
5. Actualizar `docs/backlog/PHASE_2_NEXT_BEST_STEP.md` si el catálogo supera las 10 reglas originales.

---

## 6. Eliminar o desactivar una regla

Nunca elimines silenciosamente. Opciones:

- **Desactivar temporalmente**: cambiar `when: () => false` con comentario de por qué y hasta cuándo.
- **Eliminar permanentemente**: borrar la regla y su test correspondiente en el mismo PR.

---

## 7. Notas de performance

El bundle del evaluador + catálogo + hidratador agrega ~3–4 KB minified al bundle del cliente. La hidratación usa `requestIdleCallback` (mismo patrón que `calculator-prefill.ts`), por lo que no bloquea el LCP. Si el catálogo crece a >30 reglas, revisar si el patrón client-side sigue siendo adecuado (ver ADR §Trade-offs).
