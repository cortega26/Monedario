# Spec de experimento — Captura de intención «IPC + reajuste»

Estado: **propuesto** · v2 (2026-10-01) — reemplaza la hipótesis de snippet de cabeza
Candidato origen: `ctr_gap_page:/calculadoras/actualizador-inflacion/` (W39)
Tier Fase B: A2 (reversible, medible) · WIP: 1 (F5 cerrado; F2 UF no iniciado)

## 0. Pivote y por qué

La v1 proponía un experimento de snippet sobre `calculadora ipc` (705
impresiones, 0 clics, posición 5,7). La evidencia ampliada lo desaconseja:

| Query (W39) | Impresiones | CTR | Posición |
|---|---:|---:|---:|
| `calculadora ipc` | 705 | 0% | 5,7 |
| `calculadora ipc arriendo` | 86 | 0% | 8,3 |
| `calculo ipc arriendo` | 85 | 0% | 7,6 |
| `calcular ipc arriendo` | 39 | 0% | 9,9 |
| `reajuste ipc calculadora` | 21 | 0% | 8,0 |

~940 impresiones con 0% de CTR entre posiciones 5 y 9 es firma de **zero-click**
(widget/AIO) y de una SERP dominada por la calculadora oficial del INE
(`calculadoraipc.ine.cl`), una EMD exacta (`calculadoraipc.cl`) y competidores
aplicados (`calcular.cl`, `tomcontable.cl`). El título no es el cuello de
botella de la cabeza.

La intención **capturable** es «IPC + arriendo/sueldo»: tiene parámetros
(contrato, período) que un widget no resuelve, y ya tenemos el activo que
convierte: `/calculadoras/reajuste-arriendo/` (731 impresiones, 10 clics,
CTR 1,37%, posición 7,35). `calcular.cl` demuestra el patrón: página aplicada
con tablas y FAQ.

## 1. Fase A — Diagnóstico SERP (A0, owner, ~15 min)

Captura manual (incógnito, `hl=es-CL&gl=cl`) de:

- `calculadora ipc`
- `calculadora ipc arriendo`
- `calculo ipc arriendo`

Registrar: AI Overview, widget de calculadora de Google, presencia del
resultado oficial, y forma de Monedario (título/sitelinks). La verificación
automatizada no es posible: Google bloquea con captcha.

**Salida de fase:**
- Con widget/AIO en las queries aplicadas → Fase B se ejecuta como
  «cross-link + GEO» (sin promesa de snippet).
- Sin widget/AIO → Fase B puede incluir además el snippet aplicado.

## 2. Fase B — Experimento A2 (requiere firma del owner)

**Hipótesis:** el actualizador IPC no declara la intención aplicada ni empuja
al conversor de reajuste que ya convierte; alinearlo captura clics del cluster
«IPC + arriendo/sueldo» y refuerza el siguiente paso.

**Cambios propuestos (sin tocar motor, ruta, JSON-LD ni calculadora):**

- Título (63 caracteres):
  `Calculadora IPC Chile: reajusta arriendos y sueldos | Monedario`
- Descripción meta (140 caracteres):
  `Reajusta arriendos, sueldos y cualquier monto por la inflación oficial del INE: ingresa el monto y el período, y obtén el valor actualizado.`
- H1 alineado a la query: `Calculadora IPC` (hoy "Actualizador por Inflación IPC").
- Sección visible «¿Vas a reajustar un arriendo o un sueldo?» con enlace
  interno fuerte a `/calculadoras/reajuste-arriendo/` y la explicación del
  período (mes anterior al inicio → último mes publicado).

**Medición pre-registrada:**

- Primaria: CTR del cluster `ipc+arriendo` / `reajuste+ipc` (lista de §0) ≥ 1,5%.
- Secundaria: posición media de `calculadora ipc arriendo` ≤ 6 (base 8,28);
  clics del cluster (base 0); `next_step_click` de la página si el panel F4 lo instrumenta.
- `n_min`: 199 impresiones para p=1,5% (95%); el cluster visible rinde
  ~240/semana (≈960 en 28 días) → muestra suficiente.
- Guardas: CTR de página no cae; posición de la página no empeora >1;
  RUM sin regresión (LCP p75 ≤ 1.700 ms).
- Ventana: 28 días; lectura intermedia a 14 días solo observación.

**Confounders:** publicación del IPC de octubre (INE), AIO/widget, fin de mes,
y la lectura F5 de UTM en curso (páginas distintas; no interfiere).

**Reglas de decisión:**
- **Keep:** CTR del cluster ≥ 1,5% y guardas OK a 28 días.
- **Extender:** mejora direccional bajo umbral → 14 días más.
- **Revert:** CTR del cluster < 0,5% con posición estable, o posición cae
  >2 puestos → restaurar strings y quitar la sección.

## 3. Rollback

Título: `Calculadora IPC Chile — Actualiza pesos por inflación | Monedario`.
Descripción: `Calcula cuánto valen hoy tus pesos de antes con el IPC oficial
del INE: ingresa cualquier monto histórico y actualízalo por inflación al
instante.` H1: `Actualizador por Inflación IPC`. La sección nueva se elimina
completa.

## 4. Registro

- `experiments` en `src/config/growth-opportunity-registry.json`:
  `exp-ipc-reajuste-cluster-2026-10` (proposed, con `phaseA` y `phaseB`).
- `promoted` en `src/config/growth-opportunity-feedback.json`: candidato
  `ctr_gap_page:/calculadoras/actualizador-inflacion/` ligado al nuevo id.
- Aprobación: firma del owner tras la Fase A. Al ejecutar: `status: "running"`
  con fecha de inicio; al cerrar, veredicto y datos W40–W43.

## 5. No-objetivos

- No perseguir el snippet de la cabeza como apuesta principal.
- No tocar `conversor-uf` (F2 diferido) ni `conversor-utm` (lectura post-revert).
