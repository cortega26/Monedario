# Radar diario de datos públicos

**Objetivo:** usar todos los días los cupos gratuitos de SERP, Search Console y
herramientas públicas para responder **una pregunta de negocio concreta** y
convertirla en **una acción** (o en un “no action” explícito).

**Regla de oro:** una pregunta, una acción, evidencia fechada. Si no cambia una
decisión, no se registra.

## Cupos gratuitos

Verificar los límites cada mes: cambian con frecuencia.

| Fuente | Cupo gratuito | Uso principal | AI Overview |
|---|---|---|---|
| **Keywords Everywhere SERP Checker** | 5 consultas/día sin login; 10 con API key gratis; caché 7 días | Top 10, AIO, PAA, features, país/ciudad | Sí |
| **Semrush SERP Checker** | Sin registro; límite diario | Top 10 + features | Sí |
| **SerpDino** | 450 consultas/mes con cuenta gratis (~15/día); sin cuenta, limitado | SERP live, AIO | Sí |
| **Spyglass (Keyword.com)** | 2 búsquedas/día | google.cl + español Chile; orgánico/local | No en la vista gratis |
| **Google Search Console** | Datos diarios; URL Inspection API 2.000/día | Consultas, páginas, indexación | No |
| **PageSpeed Insights / CrUX** | 25.000/día (PSI) | LCP, INP, CLS | No |
| **Google Trends** | Sin cupo diario relevante | Demanda y estacionalidad | No |
| **Bing Webmaster Tools** | Manual | Sitemap e indexación Bing | No |

**Presupuesto diario sugerido:** 3 consultas planificadas de Keywords Everywhere
+ 2 de seguimiento; 1–2 de Semrush/SerpDino/Spyglass como contraste. No repetir
la misma combinación query + ubicación + dispositivo dentro de 7 días: el
resultado puede venir de caché.

## Rutina diaria (15–20 min)

1. **GSC (5 min).** Revisar ayer: consultas 4–15, páginas con CTR < 1 %,
   páginas que caen y consultas nuevas. Anotar una sola pregunta.
2. **Elegir el tema del día** de la rotación o del backlog (#644, #652, #536).
3. **SERP (7 min).** 3 consultas en Keywords Everywhere; 1 contraste en
   Semrush/SerpDino/Spyglass. Registrar ubicación, dispositivo y fecha.
4. **Registrar (3 min).** Top 3, AIO (sí/no y citas), resultado oficial,
   posición de Monedario (o ausencia), insight.
5. **Decidir (2 min).** Una acción: contenido, enlace interno, snippet,
   experimento o “no action”. Si no hay acción, cerrar el día.
6. **Cortar.** No gastar la última consulta “por gastarla”. Guardar 1–2 para
   follow-ups.

## Rotación semanal

| Día | Tema | Herramientas | Salida |
|---|---|---|---|
| Lunes | AI Overview y citas en 3–5 queries de dinero | Keywords Everywhere + GSC | Lista de citas y huecos |
| Martes | Oficial/EMD vs Monedario en un cluster de calculadoras | Keywords Everywhere + Semrush | Competidor dominante y ángulo |
| Miércoles | Indexación y cobertura | GSC URL Inspection API | URLs no indexadas / errores |
| Jueves | Core Web Vitals de las 10 páginas top | PSI/CrUX | Regresiones LCP/INP/CLS |
| Viernes | Decay de queries/páginas y enlaces internos | GSC + navegación | 1 enlace o refresh |
| Sábado | Features del SERP: PAA, local pack, video, AIO | Keywords Everywhere/SerpDino | Formato que Google premia |
| Domingo | Síntesis semanal; no gastar cupos | Log + GSC | Próxima semana y 1 experimento |

## Registro

Guardar cada día en:

```text
output/operations/free-data-research/YYYY-MM-DD/README.md
```

Formato mínimo:

| Campo | Ejemplo |
|---|---|
| Fecha | 2026-10-20 |
| Pregunta | ¿Quién gana `calculadora ipc` y aparece Monedario? |
| Fuente | Keywords Everywhere, Aysen, Chile, desktop |
| Query | `calculadora ipc` |
| Top 3 | INE oficial, INE España, INDEC |
| AIO | Sí; cita INE y calculadoras privadas; no cita Monedario |
| Monedario | Ausente del top 10 |
| Insight | La query está dominada por oficial/EMD/AIO |
| Acción | Reorientar #652 a `IPC + arriendo` y cross-link |
| Evidencia | captura/CSV en la misma carpeta |

La síntesis semanal va en `docs/operations/FREE_DATA_RESEARCH_LOG.md` y se
enlaza desde #536. Los hallazgos que afecten una decisión se comentan en #644 o
#652.

## Guardrails

- **No scraping ni bypass de captchas.** Los Turnstile/Cloudflare se resuelven
  manualmente; si no se puede, se cambia de herramienta.
- **No compartir logins.** Cada herramienta se usa desde su interfaz gratuita.
- **No confundir señal con verdad.** El SERP sirve para descubrir; toda cifra
  YMYL se valida contra la fuente oficial.
- **No inventar datos.** Si una serie mensual no es reconstruible, se declara y
  se usan solo los hitos publicados.
- **No publicar PII** ni datos confidenciales de competidores.
- **Revisar límites mensualmente.** Los cupos gratuitos y la presencia de AIO
  cambian sin aviso.
