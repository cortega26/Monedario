# PLAN — Distribución por citación (IA + prensa/datos)

**Estado:** PROPUESTO (docs-only; la ejecución de medición y outreach es inmediata)
**Fecha:** 2026-09-25 · **Owner de decisión:** Carlos Ortega
**Prioridad:** P1 (distribución) · **Esfuerzo:** S–M · **Riesgo:** BAJO
**Fuente:** `docs/reports/AI-CITATION-TRACKING.md` (log vacío),
`src/utils/llmsTxt.ts`, `src/pages/robots.txt.ts`,
`PLAN-zero-cost-distribution-2026-09-25.md` (canal 1).

## Objetivo

Que Monedario sea la fuente citada cuando alguien pregunta por finanzas
chilenas en asistentes de IA y cuando un medio publica sobre UF/UTM/impuestos,
sin gastar dinero y sin nuevas URLs. La palanca es la misma que en Google no
se puede ganar por EMD (#401): **confianza y extractabilidad**.

## Activos existentes (no construir de cero)

| Activo | Estado | Uso |
|---|---|---|
| `/llms.txt` + `/llms-full.txt` | Vivos, con instrucciones de cita y límites | Ingestión por modelos |
| `robots.txt` | Bots de recuperación/cita permitidos; de entrenamiento bloqueados | Define qué IA puede citar |
| `FAQPage`/schema estructurado | Presente en artículos; auditar calculadoras | Respuestas extraíbles |
| `AI-CITATION-TRACKING.md` | Checklist mensual, **log vacío** | Medición de tendencia |
| Workflow `geo-files-review.yml` | Mensual | Mantener GEO al día |
| Hub `/guias/uf-costo-de-vida/indicadores-economicos/` | Vigente | Cifra del día para prensa/IA |
| Índice y datos W38 | `output/operations/data-signals/` | Argumentos de hook de prensa |

## Fases y gates

### F1 — Primera corrida del log de citación (1 sesión, inmediato)

Ejecutar exactamente el procedimiento de `AI-CITATION-TRACKING.md`: 12
consultas fijas (B1–B2 + T1–T10) × 4 motores (ChatGPT búsqueda, Perplexity,
Gemini, Copilot),
sesión sin personalizar, registrar `Citado`, `Prominencia`, `Página citada`,
`Notas` y tasa. Escribir la primera fila del log (no borrar el placeholder,
reemplazar por la fila real).

Gate F1: log con la primera corrida y observaciones; sin conclusiones de una
sola corrida (es tendencia).

Lección operativa (2026-09-25): la corrida no es automatizable de punta a
punta. Copilot (OAuth) y la sesión canónica de ChatGPT/Gemini requieren login;
Perplexity bloquea la automatización con verificación anti-bot (no se elude).
La corrida mensual es una tarea humana de ~20 minutos; el modo invitado sirve
como proxy etiquetado, no como sustituto.

### F2 — Diagnóstico y arreglos de citabilidad (inmediato, sin tocar ventanas)

Con la corrida en mano:

- **robots/llms**: verificar que los bots de cita listados acceden (fetch con
  user-agent de cada bot a `/llms.txt` y a una página de dinero). Si un bot de
  recuperación no puede acceder, corregir.
- **Bing/Copilot**: confirmar IndexNow (`indexnow.yml`) y sitemap en Bing
  Webmaster; Copilot cita desde el índice de Bing.
- **Errores de atribución**: si el asistente resume mal, anotarlo y encolar la
  corrección editorial (pipeline, no parche suelto).

Gate F2: cero bots de cita bloqueados; errores de atribución registrados.

### F3 — Páginas "citation-ready" (on-site; después de ventanas de medición)

Ventanas a respetar: F5 UTM/UF hasta 2026-09-30; panel F4 W39–W40; títulos
congelados 14–28 días desde el deploy del 2026-09-16 (~2026-10-14). Trabajar
**solo después de ~2026-10-14** y fuera de UTM/UF si su lectura sigue activa.

Convenciones (corrección sobre inventario existente, sin URLs nuevas):

1. **Bloque respuesta-primero**: primera frase responde la pregunta con cifra
   vigente + fecha + fuente ("La UF del 25-sep-2026 es $41.016,28, Banco
   Central"). Ya existe en UTM/UF/IVA; replicar en 3–5 páginas con más
   impresiones y CTR débil del scorecard W38.
2. **Vigencia explícita** en párrafos con cifras (fecha de corte visible).
3. **"Citar esta página"** (feature pequeña, sin URL nueva): botón/afordancia
   que copia al portapapeles una cita formateada, p. ej.
   `Monedario.cl — "<título>" (actualizado <fecha>). <URL>`.
   Requiere tests de clipboard y respetar `no-console`/CSP; no envía PII.
4. **Schema**: auditar que las calculadoras top tengan `WebApplication`/
   `FAQPage` correctos y sin campos inventados.

Gate F3: cambio por PR con `check:reader-facing-copy`, `check:dialect`,
`astro check`, tests de clipboard; sin cambios en títulos de páginas en
medición.

### F4 — Decisión de política de crawlers (ADR)

`robots.txt` bloquea `Google-Extended`, que controla entrenamiento **y
grounding** de Gemini. Si el log muestra citaciones de Gemini marginales,
existe un trade-off explícito: permitir grounding vs. bloquear entrenamiento.
No se cambia por impulso: **ADR requerido** (`docs/adr/`) con evidencia F1
(citaciones por motor) y decisión del owner. Opciones a documentar: mantener,
permitir solo Gemini, o mantener y compensar con los otros motores.

Gate F4: ADR aceptado o rechazado con evidencia; sin cambio de robots sin ADR.

### F5 — Prensa y datos (outreach manual, inmediato, cero costo)

Hooks del calendario (usar solo datos ya publicados en el sitio):

| Hook | Cuándo | Ángulo |
|---|---|---|
| UF cruza umbrales (p. ej. $41.000) | continuo | "qué significa en dividendos/arriendos" + tabla verificable |
| UTM del mes / IPC | día 1 y día 10 | "cuánto sube la UTM y a quién afecta" |
| Operación Renta (F22) | marzo–abril | checklist y fechas |
| Reajuste de arriendo por IPC | mensual | calculadora + regla legal |

Plantilla de correo a redacción (breve, sin adjuntos pesados):

> Asunto: Dato verificable — [tema] de [fecha]
> Hola [redacción]: por si les sirve, dejé el dato de [indicador] de hoy con
> fuente [SII/BCCh/INE] y la explicación de a quién afecta aquí: [URL a página
> existente]. No es contenido pagado ni pido cobertura; pueden citar la fuente
> o el enlace. Gracias, Carlos Ortega (Monedario.cl).

Reglas: sin pago, sin contenido patrocinado, sin pedir "mención" a cambio de
nada; la atribución es la fuente. Un correo por redacción, máximo un
seguimiento.

Metricas F5: backlinks nuevos (GSC > Vínculos), menciones observadas,
citaciones IA que apunten a la página usada.

## Métricas del canal

| Métrica | Línea base | Objetivo inicial |
|---|---|---|
| Tasa de citación IA (12×4 = 48) | 3/25 evaluables (12%); 0/20 temáticas (2026-09-25) | tener baseline; +1 cita temática al mes |
| % consultas temáticas con cita | sin datos | >0 en 2–3 meses |
| Backlinks nuevos (GSC) | sin datos | ≥1 por trimestre |
| Errores de atribución | sin datos | 0 acumulados sin encolar |

## STOP / HALT

- Cifra volátil afirmada como fija → STOP y corrección.
- Outreach con tono comercial o promesa de cobertura → STOP.
- Cambio de robots sin ADR → STOP.
- Editar páginas en ventana de medición → HALT hasta el cierre.

## Rollback

- Outreach: no requiere rollback (no cambia el sitio).
- F3: revert del PR de copy/afordancia; re-correr `check:routes` si tocara
  metadata (no previsto).
- F4: revert del ADR/robots si se aprobó y empeora otro motor.

## Progress log

- 2026-09-25 — Plan creado.
- 2026-09-25 — F1 ejecutada (parcial etiquetada): 25/48 combinaciones
  evaluables; 3 citas (ChatGPT B1/B2, Perplexity B1) y 0/20 temáticas.
  Hallazgo: la marca se cita, el tema no; la ventana temática queda para F3.
  Detalle y método en `docs/reports/AI-CITATION-TRACKING.md`. Corrida
  canónica mensual pendiente en la sesión normal del owner (incluye Copilot).
