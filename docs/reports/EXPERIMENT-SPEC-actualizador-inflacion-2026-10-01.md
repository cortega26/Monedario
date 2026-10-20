# Spec de experimento — Captura de intención IPC

Estado: **propuesto** · **v3 (2026-10-20)** — reemplaza v2 (2026-10-01).
Candidato origen: `ctr_gap_page:/calculadoras/actualizador-inflacion/` (W39)
Tier Fase B: A2 (reversible, medible) · WIP: 1 (F5 cerrado; F2 UF no iniciado)
**No ejecutar antes de leer W43 (2026-10-26).**

## 0. Qué cambió respecto de v2

La v2 asumía que `calculadora ipc arriendo` era la intención capturable y que
el cluster rendía ~240 impresiones/semana. Los datos de GSC W42 y la captura
SERP del 2026-10-20 muestran otra cosa:

| Query (W42) | Impresiones | Clics | CTR | Posición | Página |
|---|---:|---:|---:|---:|---|
| `calculadora ipc` | 2.009 | 2 | 0,10% | 5,9 | `/calculadoras/actualizador-inflacion/` |
| `calculadora ipc chile` | 141 | 0 | 0% | 7,7 | actualizador |
| `calculo ipc arriendo` | 56 | 0 | 0% | 9,6 | `/calculadoras/reajuste-arriendo/` |
| `calculadora ipc arriendo` | 37 | 0 | 0% | 9,9 | reajuste-arriendo |
| `reajuste ipc calculadora` | 16 | 0 | 0% | 10,4 | actualizador |
| `ipc arriendo` / `reajuste arriendo ipc` | sin fila GSC | 0 | — | — | Monedario ausente |

Páginas relevantes (W42):

| Página | Impresiones | Clics | CTR | Posición |
|---|---:|---:|---:|---:|
| `/calculadoras/actualizador-inflacion/` | 6.777 | 7 | 0,10% | 6,9 |
| `/calculadoras/reajuste-arriendo/` | 419 | 1 | 0,24% | 7,5 |
| `/posts/reajuste-arriendo-uf-ipc-chile/` | 65 | 1 | 1,54% | 9,0 |

Hallazgos de la captura gratuita (Semrush 5/5, Keywords Everywhere 1/5,
Chile, desktop):

- `calculadora ipc`: **#1 calculadora oficial del INE**, AI Overview presente;
  Monedario no aparece en el top 9.
- `ipc arriendo`: **AI Overview presente**; top 10 dominado por INE,
  learninggroup, ayudaarriendo, bluehome, assetplan, bi-rent, tomcontable,
  finclaro y YouTube. Monedario ausente.
- `reajuste arriendo ipc`: top 10 con INE y portales inmobiliarios/financieros;
  PAA presente; Monedario ausente.
- `calculadora ipc arriendo` y `calculadora reajuste arriendo`: **sin datos**
  en Semrush; el volumen es demasiado bajo para una métrica primaria.

**Conclusión:** la query exacta `calculadora ipc arriendo` queda descartada
como métrica primaria. `calculadora ipc` es la única query con volumen
suficiente, pero Monedario ya está en posición 5,9 y el CTR está deprimido por
la calculadora oficial del INE y el AI Overview. El experimento debe medir un
mejora realista de CTR, no prometer snippet ni captura de AIO.

## 1. Fase A — Diagnóstico SERP (parcial, suficiente para v3)

Estado: **parcial**. No se completó la captura manual incógnito; se usaron
herramientas gratuitas con ubicación Chile y se registró la evidencia en #652.

- Semrush SERP Checker: 5/5 consultas.
- Keywords Everywhere: 1/5; su autocomplete de ubicación dejó de resolver Chile
  y bloqueó el resto.
- SerpDino: Turnstile manual, no se saltó.
- Spyglass: no se usó.

La evidencia alcanza para **rechazar la métrica primaria de v2**, no para
declarar aprobada la Fase B.

## 2. Fase B — Experimento A2 (requiere firma del owner)

**Hipótesis:** el actualizador IPC puede mejorar el CTR de `calculadora ipc`
si el título, el H1 y la primera respuesta declaran exactamente qué resuelve
(“IPC oficial del INE + cálculo/reajuste”) y ofrecen un siguiente paso claro
hacia el conversor de reajuste. El techo está limitado por el AIO y la
calculadora oficial; por eso la métrica es incremental, no de liderazgo.

**Cambios propuestos (sin tocar motor, ruta, JSON-LD ni calculadora):**

- Título: `Calculadora IPC Chile: valor oficial y reajuste | Monedario`.
- Descripción meta: `Calcula la variación del IPC oficial del INE y reajusta
  arriendos, sueldos o cualquier monto. Ingresa el monto y el período y obtén
  el valor actualizado.`
- H1: `Calculadora IPC`.
- Bloque answer-first: “¿Cuánto ha subido el IPC?” con la última cifra oficial,
  fecha de publicación y enlace a la fuente INE.
- Sección “¿Vas a reajustar un arriendo o un sueldo?” con enlace interno fuerte
  a `/calculadoras/reajuste-arriendo/` y al artículo de reajuste.

**Medición pre-registrada:**

- **Primaria:** CTR de la query exacta `calculadora ipc` (GSC) desde **0,10%**
  a **≥0,40%** a 28 días.
- **n_min:** **8.000 impresiones por periodo** (28 días pre vs 28 días post).
  La query rinde ~2.009/semana; 28 días ≈ 8.036. Si el volumen cae, extender a
  14 días adicionales; no reducir el umbral.
- **Secundarias:** posición media de `calculadora ipc` ≤ 6,5 (base 5,9);
  clics semanales de la página no inferiores a 7; clics de salida hacia
  `/calculadoras/reajuste-arriendo/`; CTR de página del actualizador.
- **Cualitativa:** presencia de AIO y citas a Monedario en `calculadora ipc`,
  `ipc arriendo` y `reajuste arriendo ipc`, registrada semanalmente con las
  herramientas gratuitas. No es KPI de CTR.
- **Guardas:** sin regresión RUM (LCP p75 ≤ 1.700 ms); sin cambios en
  `conversor-utm` ni `conversor-uf`; sin tocar rutas ni slugs.
- **Ventana:** 28 días; lectura intermedia a 14 días solo observación.

**Confounders:** AIO, widget/calculadora oficial del INE, publicación del IPC
de octubre, estacionalidad de fin de mes y la lectura de #709 en UTM/UF
(páginas distintas). Se documentan, no se controlan.

**Reglas de decisión:**

- **Keep:** CTR `calculadora ipc` ≥ 0,40% y guardas OK a 28 días.
- **Extender:** 0,20–0,40% con posición estable → 14 días más.
- **Revert:** CTR < 0,20%, posición > 7,5 o caída de clics de página → restaurar
  strings y quitar el bloque nuevo.

## 3. Track GEO paralelo (sin cambio de código)

- Queries: `ipc arriendo` y `reajuste arriendo ipc`.
- Frecuencia: semanal, con Keywords Everywhere/Spyglass/Semrush.
- Registrar: AIO sí/no, citas, presencia de Monedario, top 3.
- Si el AIO sigue presente, priorizar answer-first, citas al INE y datos
  estructurados en `/calculadoras/reajuste-arriendo/` y en el artículo; no
  prometer snippet.

## 4. Experimento separado (no mezclar)

`/calculadoras/reajuste-arriendo/` tiene 419 impresiones, 0,24% CTR y posición
7,5. Un refresh de title/meta para el cluster `reajuste arriendo` es un
experimento distinto; requiere su propia spec y su propio baseline. No se
ejecuta dentro de este.

## 5. Rollback

Título actual: `Calculadora IPC Chile — Actualiza pesos por inflación | Monedario`.
Descripción actual: `Calcula cuánto valen hoy tus pesos de antes con el IPC
oficial del INE: ingresa cualquier monto histórico y actualízalo por inflación
al instante.`
H1 actual: `Actualizador por Inflación IPC`.
El bloque answer-first y la sección de reajuste se eliminan completos.

## 6. Registro y aprobación

- `src/config/growth-opportunity-registry.json`:
  `exp-ipc-reajuste-cluster-2026-10`, `status: proposed`,
  `phaseA.status: partial`, `phaseB` v3, `requiresOwnerApproval: true`.
- `src/config/growth-opportunity-feedback.json`: se mantiene el candidato
  promovido, con nota de la revisión v3.
- **Aprobación:** firma del owner después de W43. Antes de eso no se modifica
  contenido, título, meta, H1 ni calculadora.

## 7. No-objetivos

- No perseguir el snippet de `calculadora ipc` como apuesta principal.
- No usar `calculadora ipc arriendo` como métrica primaria ni prometer
  `n_min=199` con ese volumen.
- No tocar `conversor-uf` (F2 diferido) ni `conversor-utm` (#709 en lectura).
- No convertir el track GEO en una promesa de CTR.
