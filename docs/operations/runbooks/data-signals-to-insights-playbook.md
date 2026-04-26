# Data Signals → Actionable Insights Playbook

> Autoridad: `docs/adr/ADR-20260416-external-data-signals.md`  
> Fuentes de datos: `output/operations/data-signals/` (GSC + Cloudflare RUM)  
> Baseline: `docs/backlog/artifacts/gsc-baseline-2026-04-26.md`  
> Última revisión: 2026-04-26

---

## Propósito

Este playbook define **cuándo, cómo y con qué criterio** convertir los datos acumulados de GSC, Cloudflare RUM y GA4 en decisiones concretas: un ticket de backlog, un prompt editorial, o una decisión explícita de no actuar.

No reemplaza el ritual semanal (`weekly-search-performance-ritual.md`). Lo complementa con dos capas de análisis de mayor período y mayor palanca.

---

## Umbrales de madurez de datos

Antes de correr cualquier capa de análisis, verificar que el volumen mínimo está disponible. Actuar sobre datos insuficientes produce decisiones que parecen basadas en evidencia pero son ruido.

| Capa | Periodo mínimo | Impresiones mínimas por página | Cuándo correr por primera vez |
|---|---|---|---|
| Semanal — anomaly watch | 1 semana | — | Ya activa (`weekly-search-ops.yml`) |
| Mensual — cluster audit | 4 semanas de JSON GSC acumuladas | ≥ 50 imp/página en la ventana | ~2026-05-25 (4 semanas post-baseline) |
| Trimestral — intent review | 12 semanas acumuladas | ≥ 200 imp/página en la ventana | ~2026-07-13 |
| NBS CTR review | 28 días post-MON-505 | ≥ 200 `next_best_step_shown` por regla | ~2026-05-24 |

Si el umbral no se alcanza: registrar la fecha de próxima verificación en `output/operations/data-signals/README.md` y no actuar.

---

## Capa 1 — Weekly Anomaly Watch (15 min, cada lunes)

**Ya implementada.** Ver `docs/operations/runbooks/weekly-search-performance-ritual.md`.

La única adición con el pipeline de data signals automático: el scorecard ahora lee directamente de `output/operations/data-signals/gsc/` sin necesidad de exportar CSV manualmente. Ejecutar:

```bash
GOOGLE_APPLICATION_CREDENTIALS_JSON="$(cat .env.local | grep GOOGLE | cut -d= -f2-)" \
  node scripts/data-signals/gsc-fetch.mjs --week=<YYYY-Www>
node scripts/build-weekly-search-report.mjs --input output/operations/weekly-search-performance/<YYYY-Www>
```

**Output:** `weekly-search-scorecard.md` con winner / loser / watch / action_needed. Máx. 3 decisiones semanales.

---

## Capa 2 — Monthly Cluster Audit (1–2 h, último lunes de cada mes)

### Input

- JSON GSC de las últimas 4 semanas: `output/operations/data-signals/gsc/<week>-pages.json` y `-queries.json`
- JSON Cloudflare RUM de las últimas 4 semanas: `output/operations/data-signals/cloudflare/<week>-rum.json`

### Procedimiento

**Paso 1 — Agregar ventana de 4 semanas**

```bash
python3 - << 'EOF'
import json, glob, collections

pages = collections.defaultdict(lambda: {'clicks':0,'impressions':0,'weeks':0})
for f in sorted(glob.glob('output/operations/data-signals/gsc/*-pages.json'))[-4:]:
    for row in json.load(open(f))['data']:
        p = row['page'].replace('https://monedario.cl','')
        pages[p]['clicks'] += row['clicks']
        pages[p]['impressions'] += row['impressions']
        pages[p]['weeks'] += 1

for path, d in sorted(pages.items(), key=lambda x: -x[1]['impressions'])[:20]:
    ctr = d['clicks']/d['impressions']*100 if d['impressions'] else 0
    print(f"{d['impressions']:4} imp  {d['clicks']:3} clicks  CTR {ctr:.1f}%  {path}")
EOF
```

**Paso 2 — Aplicar reglas de decisión**

| Condición | Acción | Output |
|---|---|---|
| CTR < 2% + posición ≤ 10 + imp ≥ 50 | Reescribir `<title>` y `<meta description>` | Ticket `MON-6xx` tipo `seo-packaging` |
| CTR 2–5% + posición ≤ 10 + imp ≥ 50 | Evaluar rich snippet (FAQPage schema) | Nota en backlog; implementar si existe FAQ natural |
| CTR ≥ 5% + posición ≤ 10 | Proteger; reforzar enlaces internos desde hub | Ningún cambio editorial; revisar watchlist |
| Posición 11–20 + imp ≥ 30 | Profundidad de contenido + internal linking | Ticket `refresh` o prompt editorial |
| Posición 21–50 + imp ≥ 20 | Señal temprana; evaluar gap de contenido | Nota en `topic_ownership_matrix.md` |
| Posición > 50 | Demasiado ruidoso para actuar | Registro de observación, no acción |
| Cluster de queries sin página propietaria en pos ≤ 20 + imp totales ≥ 50 | Evaluar nuevo contenido | Prompt editorial o ticket `content` |
| Página con LCP p75 > 2.500 ms en ventana 4 semanas | Ticket de performance | Ticket `frontend` tipo `perf` |

**Paso 3 — Documentar decisiones**

Crear o actualizar `output/operations/data-signals/monthly-audit-<YYYY-MM>.md` con:

```markdown
## Decisiones <YYYY-MM>

### Acción
- URL: /calculadoras/comisiones-afp/
- Señal: CTR 0,2%, posición 12,5, 1976 imp / 4 semanas
- Decisión: reescribir title + meta (ticket MON-601)
- Métrica de éxito: CTR > 2% en revisión mensual siguiente

### No-acción
- URL: /posts/credito-hipotecario-chile-guia-completa/
- Señal: posición 8,6, 332 imp / 4 semanas, 0 clicks
- Decisión: esperar 4 semanas más; datos insuficientes para descartar variabilidad estacional
- Próxima revisión: 2026-06-30
```

La sección "No-acción" es obligatoria: una decisión de no actuar también debe quedar documentada.

---

## Capa 3 — Quarterly Intent Review (2–4 h, primer lunes de cada trimestre)

Analiza patrones que solo se ven con 12+ semanas de datos: queries emergentes, caída sostenida de clusters, desalineación entre intención de búsqueda y contenido ofrecido.

### Preguntas guía

1. **¿Hay clusters con > 500 impresiones acumuladas sin un owner page en posición ≤ 15?**  
   → Candidato a nuevo artículo o calculadora. Validar contra `topic_ownership_matrix.md` antes de crear.

2. **¿Hay páginas con posición que empeoró > 5 puestos en las últimas 8 semanas?**  
   → Investigar si hay cambio de intent (nuevas SERPs con features), competidor nuevo, o contenido desactualizado.

3. **¿Hay queries donde el sitio aparece pero el contenido no responde la pregunta directa?**  
   → Revisar manualmente las primeras 5 páginas de resultados y comparar estructura y profundidad.

4. **¿El LCP p75 de las rutas owner se mantuvo dentro del umbral (< 2.500 ms) durante el trimestre?**  
   → Si no, abrir un ticket de performance antes de continuar con trabajo editorial.

5. **¿El CTR de `next_best_step_click/shown` superó el 5% de umbral definido en Phase 2?**  
   → Si no después de 56 días, revisar copy de las reglas (`rules.ts`) antes de avanzar a Phase 3.

### Output

Un documento `output/operations/data-signals/quarterly-review-<YYYY-Q#>.md` con:
- Top 3 oportunidades (clusters emergentes o gaps confirmados)
- Top 3 problemas (páginas en caída sostenida)
- Decisión sobre Phase siguiente (go / wait / pivot), con evidencia

Este documento es el input principal para el próximo ciclo de planificación de backlog.

---

## Tipos de output y cómo crearlos

| Tipo | Cuándo | Formato |
|---|---|---|
| **Ticket de backlog** | Señal clara + acción concreta + esfuerzo < 1 semana | Archivo en `docs/backlog/tickets/MON-xxx-*.md` siguiendo el template existente |
| **Prompt editorial** | Contenido nuevo o refresh que requiere investigación o redacción | Archivo en `docs/backlog/prompt-*.md` con sección de contexto GSC |
| **Nota de no-acción** | Señal presente pero datos insuficientes o acción no justificada | Entrada en el `monthly-audit-*.md` o `quarterly-review-*.md` correspondiente |
| **Actualización de watchlist** | URL cambia de owner a support, o se agrega nueva URL estratégica | Editar `docs/operations/runbooks/weekly-search-performance-watchlist.json` |

---

## Cuándo cambiar las reglas de decisión

Las reglas de la Capa 2 (umbrales de CTR, posición, impresiones) deben revisarse cuando:

- El tráfico semanal supere **500 clicks** sostenidos por 4 semanas (los umbrales actuales son conservadores para volúmenes bajos).
- El sitio tenga páginas en posición ≤ 3 con frecuencia (el comportamiento de CTR cambia radicalmente antes y después de la posición 4).
- Se active Ahrefs (DATA3a): añadir análisis de brecha de keywords y backlinks como cuarta dimensión.

Documentar el cambio con fecha y razón en este mismo archivo (sección `## Historial de cambios` al final).

---

## Calendario de primera ejecución

| Capa | Fecha mínima | Prerrequisito |
|---|---|---|
| Mensual | 2026-05-25 | 4 JSON GSC semanales en `output/operations/data-signals/gsc/` |
| NBS CTR review | 2026-05-24 | 28 días post-deploy MON-505 con GA4 activo |
| Trimestral | 2026-07-13 | 12 JSON GSC semanales |

Hasta esas fechas: solo correr la Capa 1 semanal y dejar que los datos acumulen.

---

## Historial de cambios

| Fecha | Cambio | Razón |
|---|---|---|
| 2026-04-26 | Versión inicial | Baseline GSC disponible; tráfico insuficiente para análisis mensual inmediato |
