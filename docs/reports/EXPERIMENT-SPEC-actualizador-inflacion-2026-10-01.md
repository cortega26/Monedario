# Spec de experimento — Actualizador IPC (CTR)

Estado: **propuesto** (requiere aprobación del owner antes de ejecutar)
Fecha: 2026-10-01 · Candidato origen: `ctr_gap_page:/calculadoras/actualizador-inflacion/` (W39)
Tier: A2 (reversible, medible) · WIP: 1 experimento a la vez (F5 cerrado, F2 UF no iniciado)

## 1. Evidencia (W39, pre-ejecución)

| Fuente | Clics | Impresiones | CTR | Posición |
|---|---:|---:|---:|---:|
| Página `/calculadoras/actualizador-inflacion/` | 12 | 5.197 | **0,23%** | 7,5 |
| Query `calculadora ipc` | 0 | 705 | **0,00%** | 5,7 |
| Query `calculadora inflacion chile` | 1 | 76 | 1,32% | 5,9 |
| Query `calculadora de inflacion chile` | 0 | 62 | 0,00% | 5,6 |

Contexto W38: misma página con 3.204 impresiones y CTR 0,09%; `calculadora ipc`
134 impresiones, CTR 0,75%, posición 6,58. El CTR esperado por la curva usada
por el motor (posición ≤10 → 2,5%) está muy por encima del observado.

## 2. Hipótesis

El snippet actual (`Calculadora IPC Chile — Actualiza pesos por inflación`)
describe la herramienta pero no explicita el resultado útil (actualizar
montos/sueldos/arriendos con el IPC oficial del INE), por lo que en queries de
intención instrumental la página pierde el clic pese a rankear en el top 6.
Un snippet más específico debería subir el CTR **sin ganar posición**.

## 3. Cambio propuesto (A2)

Título (65 caracteres, igual que el actual):

```
Calculadora IPC Chile: actualiza montos por inflación | Monedario
```

Descripción meta (148 caracteres):

```
Calcula cuánto valen hoy tus pesos de antes con el IPC oficial del INE: convierte montos históricos, sueldos y arriendos a pesos actuales.
```

Sin cambios de H1, contenido, ruta, JSON-LD ni calculadora. El H1 actual
("Actualizador por Inflación IPC") se mantiene.

## 4. Medición (pre-registrada)

- **Métrica primaria:** CTR de la página `/calculadoras/actualizador-inflacion/`.
- **Métrica secundaria:** CTR de la query `calculadora ipc`.
- **Umbral de éxito:** CTR de página ≥ 1,5% a 28 días.
- **Guarda de posición:** posición media de la página ≤ 8,5 (no peor que la base 7,5 +1).
- **Guarda RUM:** LCP p75 ≤ 1.700 ms, INP/CLS sin regresión (ya monitoreado por `lighthouse-ci`/RUM).
- **n_min:** 199 impresiones para p=1,5% al 95% (`ceil(ln 0,05 / ln(1−0,015))`);
  la página supera 5.000 impresiones/semana, muestra suficiente a 14 días.
- **Ventana de decisión:** 28 días (lectura intermedia a 14 días solo como
  observación, sin decidir). Una semana aislada no define dirección.

## 5. Confounders (anotar antes de ejecutar)

1. Publicación mensual del IPC del INE (≈ 8 de octubre) puede mover
   impresiones y CTR de todas las queries del cluster.
2. Posible feature de SERP en `calculadora ipc` (widget de Google o AI
   Overview): verificar manualmente la SERP antes de firmar; si la captura
   muestra respuesta directa, la hipótesis de snippet pierde fuerza y se
   documenta antes de medir.
3. Estacionalidad de "actualizar montos" a fin de mes.

## 6. Reglas de decisión (pre-declaradas)

- **Keep:** CTR ≥ 1,5% y guardas de posición/RUM OK a 28 días → mantener y cerrar.
- **Extender:** mejora direccional bajo umbral o señales mixtas → leer 14 días
  más con confounders anotados.
- **Revert:** CTR < 0,5% con posición estable, o posición pierde >2 puestos, o
  se confirma que un feature de SERP absorbe el clic → restaurar título y
  descripción previos (strings originales en §3 del expediente W39) y registrar.

## 7. Rollback

Restaurar exactamente:

```
Calculadora IPC Chile — Actualiza pesos por inflación | Monedario
Calcula cuánto valen hoy tus pesos de antes con el IPC oficial del INE: ingresa cualquier monto histórico y actualízalo por inflación al instante.
```

## 8. Aprobación y registro

- Requiere firma del owner (no ejecutar sin ella).
- Al aprobar: `experiments` en `src/config/growth-opportunity-registry.json`
  pasa a `status: "running"` con fecha de inicio; el candidato queda en
  `promoted` de `src/config/growth-opportunity-feedback.json`.
- Al cerrar: registrar veredicto (keep/extend/revert) y actualizar esta spec
  con los datos W40–W43.
