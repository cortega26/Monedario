# Política de Novedades y Registro de Cambios

**Documento:** `docs/editorial/CHANGELOG_POLICY.md`
**Aplica a:** `src/pages/cambios.astro` · trust badge "Actualizado al [fecha]" en homepage
**Referencia:** MON-303

---

## Principio rector

Una entrada en `/cambios/` justifica actualizar la fecha del trust badge en la homepage.
La pregunta de filtro es:

> **"¿Un lector habitual del sitio que vuelve hoy encontraría algo distinto o más útil que la última vez?"**

Si la respuesta es sí → entra. Si es no → no entra.

---

## Criterios de inclusión (SÍ entra)

| Categoría | Ejemplos |
|---|---|
| **Corrección de dato con impacto en decisiones** | Comisión AFP incorrecta corregida; tramo tributario desactualizado; tasa de interés máxima convencional actualizada |
| **Actualización normativa o legal** | Cambio en el Código del Trabajo; nueva circular SII; modificación de ley de pensiones vigente |
| **Nueva calculadora publicada** | Se lanza calculadora de finiquito, conversor UF, simulador AFP |
| **Mejora sustancial en calculadora existente** | Se añade cálculo de gratificación proporcional; se incorpora recargo art. 168; nuevos campos o lógica relevante |
| **Artículo nuevo publicado** | Cualquier artículo que pasa el pipeline YMYL completo y entra en producción |
| **Actualización editorial sustancial de artículo** | Refresh YMYL completo con nuevas fuentes, recálculo de ejemplos o cambio de posición editorial respaldado por normativa |
| **Nueva sección o herramienta visible** | FAQ añadida a calculadora; TOC incorporado; sección "Metodología" nueva |
| **Nuevo hub o página de categoría** | Publicación de un cluster completo; nueva página de glosario con entradas |

---

## Criterios de exclusión (NO entra)

| Categoría | Ejemplos |
|---|---|
| **Correcciones tipográficas u ortográficas** | Tilde faltante, coma mal puesta, error de tipeo sin impacto semántico |
| **Fixes de CSS / diseño / layout** | Margen incorrecto, color ajustado, ícono reposicionado |
| **Cambios de infraestructura o CI** | Actualización de dependencias npm, optimización de build, nuevo script de CI |
| **Datos actualizados automáticamente** | Snapshot diario del valor UF, variación IPC automática — son actualizaciones técnicas sin intervención editorial |
| **Cambios en metadatos sin impacto en contenido** | Ajuste de `description` SEO, cambio de OG image, renombrado de clase CSS |
| **Refactors de código sin efecto visible** | Extracción de componente, reorganización de archivos, migración de tipos TypeScript |
| **Fixes de tests o scripts internos** | Corrección de script de validación, ajuste de vitest config |
| **Cambios experimentales no publicados** | Drafts, páginas aún en `draft: true`, features detrás de feature flag |

---

## Regla del umbral: ¿actualizo la fecha del trust badge?

La fecha "Actualizado al [fecha]" en la homepage se actualiza **solo cuando se añade al menos una entrada** en `/cambios/` ese día.

No se actualiza por:
- Deploys sin cambio editorial
- Fixes técnicos
- Rebuilds automáticos

---

## Formato de entrada en `/cambios/`

```
[FECHA ISO]
[Título descriptivo orientado al usuario — no al desarrollador]
[Una oración que explica qué cambió y por qué importa al usuario]
```

**Correcto:** "Calculadora Finiquito — gratificación proporcional y recargo art. 168 — Corregida la regla del año fraccionado; añadido el recargo por despido injustificado (30%, 50% u 80% según antigüedad)."

**Incorrecto:** "fix: update finiquito calc logic for edge cases in gratification threshold"

---

## Tono

- No técnico. No orientado al desarrollador.
- Primera persona del sitio: "Actualizamos", "Corregimos", "Añadimos".
- Sin jerga de commits ni referencias a nombres de archivos o funciones.
