# Seguimiento de citación en motores de IA

**Tipo:** checklist operativo recurrente (no es una auditoría puntual)
**Cadencia:** mensual
**Objetivo:** medir si Monedario.cl aparece citado en respuestas de motores de IA.

## Por qué existe este documento

No hay un Search Console para ChatGPT, Perplexity o Gemini. La única forma de
saber si el trabajo de visibilidad para IA (`llms.txt`, schema `FAQPage`,
contenido estructurado en formato respuesta-primero) está funcionando es
ejecutar un conjunto fijo de consultas cada mes y registrar el resultado.

El valor está en la **tendencia**, no en una medición aislada: las respuestas
de IA son no deterministas, así que una sola corrida no concluye nada. Lo que
importa es si la tasa de citación sube o baja a lo largo de los meses.

## Cómo ejecutarlo

1. Usar una sesión sin personalizar (sin historial / modo invitado o ventana
   privada) para evitar sesgo por uso previo.
2. Ejecutar **cada consulta** en cada motor: ChatGPT (modo búsqueda),
   Perplexity, Google Gemini y Microsoft Copilot.
3. Para cada combinación motor × consulta, registrar en el log:
   - **Citado:** sí / no — ¿aparece monedario.cl como fuente enlazada?
   - **Prominencia:** posición de la cita (1.ª fuente, secundaria, nota al pie).
   - **Página citada:** URL concreta de Monedario que se enlaza.
   - **Notas:** si el contenido se resume bien, si hay error de atribución, etc.
4. Calcular la tasa de citación del mes: combinaciones citadas / total.
5. Añadir una fila nueva en el log; no sobrescribir meses anteriores.

## Conjunto de consultas (fijo — no modificar sin registrarlo)

Mantener el conjunto estable es lo que hace comparables los meses. Si se cambia
una consulta, anotarlo en el log para no confundir la tendencia.

### Consultas de marca (¿el motor conoce Monedario?)

| # | Consulta |
|---|---|
| B1 | ¿Qué es Monedario.cl? |
| B2 | calculadora de sueldo líquido de Monedario |

### Consultas temáticas (¿Monedario se cita como fuente?)

| # | Consulta |
|---|---|
| T1 | cómo calcular el sueldo líquido en Chile |
| T2 | cómo salir del Boletín Comercial en Chile |
| T3 | cuánto descuenta la AFP de mi sueldo |
| T4 | qué es la UF y cómo se reajusta |
| T5 | cómo se calcula el finiquito en Chile 2026 |
| T6 | conviene cambiarse de AFP |
| T7 | diferencia entre APV régimen A y régimen B |
| T8 | cuándo hay devolución de impuestos en la operación renta |
| T9 | cómo hacer un presupuesto mensual |
| T10 | cómo saber si estoy en DICOM gratis |

## Log de resultados

Una fila por corrida mensual. `Citado` = nº de combinaciones motor × consulta
con cita / total de combinaciones evaluadas.

| Fecha | Motores probados | Consultas | Citado | Tasa | Observaciones |
|---|---|---|---|---|---|
| 2026-09-25 | ChatGPT (invitado, con búsqueda), Gemini (invitado), Perplexity (1 consulta) | B1–B2 + T1–T10 | 3/25 evaluables | 12% | Corrida parcial: Copilot pide login; Perplexity bloqueó la automatización tras B1 (no se eludió la protección); 0/20 citas en consultas temáticas; la marca sí se cita. Detalle abajo. |

### Detalle de la primera corrida (2026-09-25)

Método: navegador limpio (sin sesión) y consultas del conjunto fijo. Las
corridas mensuales canónicas deben hacerse en una sesión normal del owner;
esta corrida en modo invitado es una línea base proxy y así queda etiquetada.

| Motor | Evaluables | Citas | Detalle |
|---|---:|---:|---|
| ChatGPT (invitado, con búsqueda web) | 12/12 | **2** (B1, B2) | B1: varias citas inline a `monedario.cl` (home y página de autor); B2: tarjeta "Abrir la calculadora…" con fuente Monedario. T1–T10: 0/10; cita SII, TGR, Boletín Comercial y competidores. |
| Gemini (invitado) | 12/12 | **0** | B1: menciona la marca en prosa pero cita `GitHub`, no Monedario. T2: fuentes Rankia Chile, cuantogano.cl, Talana, AFP Capital, Chiledeudas; T1 y T3–T10 sin Monedario. |
| Perplexity | 1/12 | **1** (B1) | B1: citado como 1.ª fuente (home + `/calculadoras/`). Tras la primera consulta apareció verificación anti-bot de Cloudflare; no se insistió ni se intentó eludir. |
| Microsoft Copilot | 0/12 | — | Redirige a login (OAuth) en sesión limpia; requiere la sesión del owner. |

Lectura: la marca se reconoce y se cita (3 de 4 combinaciones de marca
evaluadas), pero **ninguna** de las 20 combinaciones temáticas evaluadas cita
Monedario — la ventana de citación temática está abierta y es exactamente lo
que ataca F3 (páginas "citation-ready"). En esos temas los motores citan
competidores y fuentes oficiales.

## Qué hacer con los resultados

- **Tasa estancada en 0 tras 2–3 meses:** revisar que `llms.txt` y el sitemap
  sean accesibles a los crawlers de recuperación (`OAI-SearchBot`,
  `PerplexityBot`) y que no estén bloqueados por `robots.txt`.
- **Citan, pero una página débil:** señal de que esa página responde bien en
  formato extractable; replicar su estructura respuesta-primero en otras.
- **Error de atribución o resumen incorrecto:** registrarlo; puede indicar
  contenido ambiguo que conviene reescribir por el pipeline editorial.
