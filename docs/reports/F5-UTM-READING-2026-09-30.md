# F5 — Lectura primaria UTM/UF (2026-09-30)

**Plan:** `docs/backlog/PLAN-growth-utm-ctr-2026-09-16.md` (fase F5)
**Estado:** BORRADOR con datos W39 (2026-09-29) — decisión y firma pendientes del owner. Llenar el 2026-09-30 (día 14) y
confirmar a 28 días (2026-10-14) con los confounders anotados.
**Baseline firmado:** `docs/reports/CTR-BASELINE-W36-2026-09-16.md`
(W36 = 2026-08-31 → 2026-09-06).
**Día 0 del deploy:** `cfaaf738` (2026-09-16).
**Owner:** Carlos Ortega.

## 0. Precondiciones (STOP si alguna falla)

- [x] Export W39 completado (generado local el 2026-09-29: el workflow del 28-sep no arrancó por billing de Actions):
      `output/operations/data-signals/gsc/2026-W39-*.json`,
      `.../analytics/2026-W39.json`,
      `.../cloudflare/2026-W39-rum.json`.
- [x] Cada semana con 7 fechas verificadas (§2). Semana parcial (<7 días)
      → no decidir (STOP del plan).
- [ ] (no verificado en el borrador) `pnpm run check:routes` sin `added`/`removed` inesperado.
- [ ] Sin ventana OBS/PR nueva sobre UTM/UF no declarada en el plan.
- [ ] Sin afirmación YMYL numérica nueva sin fuente en el snapshot.

## 1. Ventanas, nivel y confounders

| Semana | Ventana | Exposición a F1 | Clics UTM (GSC pages) | Rol |
|---|---|---|---:|---|
| W35 | 08-24 → 08-30 | pre | 571 | contexto de nivel |
| W36 | 08-31 → 09-06 | pre | 1.484 | **baseline firmado** |
| W37 | 09-07 → 09-13 | pre | 766 | contexto (5 días) |
| W38 | 09-14 → 09-20 | 2 pre + 5 post | 423 | contexto (parcial) |
| W39 | 09-21 → 09-27 | 100% post | 114 | **comparación primaria** |
| W40–W41 | 09-28 → 10-11 | post | — | lectura 28 días |

**Advertencia de nivel (anotar, no ignorar):** W36 es un pico de borde
de mes (la UTM cambia el 09-01 dentro de la semana) y no un nivel estable
de mitad de mes: W35 (571), W37 (766) y W38 (423) están en otro orden.
Las señales de intención estables para el día 14 son **CTR y posición**
(`utm`, `utm hoy`); los clics se leen contra W35/W37/W38 como contexto y
el umbral +25% del plan solo se evalúa a 28 días (W40–W41), que vuelve a
incluir el cambio de mes (UTM de octubre).

Confounders registrados:

1. **Refresco UTM de octubre** (dentro de W40): cambia el título
   interpolado `Valor UTM hoy: $X` a mitad de la ventana extendida — solo
   interpolación, no plantilla; la lectura primaria (W39) es pre-refresco.
2. **Panel post-resultado F1+F2** (`PLAN-result-panel-conversion-2026-09-16`)
   desplegado el **mismo** commit `cfaaf738`, piloto UTM: puede mover el
   funnel (`start`/`complete`, `next_step`) sin tocar el snippet; separar
   efectos por instrumento (GSC vs funnel) y no atribuir todo a F1.
3. **Estacionalidad de demanda UTM** (§1): pico en borde de mes ya
   explicado; válido para clics, no para CTR/posición.
4. **Posible zero-click por el propio snippet** (hipótesis, no confounder
   externo): el título F1 (`5d47594d`) muestra el valor (`Valor UTM hoy:
   $71.721 …`) directamente en la SERP; la intención «utm hoy» puede
   resolverse sin clic. Con posición estable e impresiones al alza, esta es
   la explicación más simple del colapso de CTR. No se verificó la SERP
   (no se descartan features de Google tipo respuesta directa).
5. **Fecha visible «1 de septiembre de 2026» a fines de mes**: el título
   puede leerse como desactualizado frente a resultados con fecha de hoy.

## 2. Integridad de datos (pegar y correr)

```bash
python3 - <<'EOF'
import json
for w in ("2026-W36", "2026-W38", "2026-W39"):
    d = json.load(open(f"output/operations/data-signals/analytics/{w}.json"))
    dates = sorted({r["date"] for r in d["data"]})
    print(w, "analytics", len(dates), "días", dates[0], "->", dates[-1])
    g = json.load(open(f"output/operations/data-signals/gsc/{w}-pages.json"))
    rows = g["data"] if isinstance(g, dict) else g
    print(w, "gsc pages", len(rows), "filas")
EOF
```

- [x] W39 con 7 fechas (2026-09-21 → 2026-09-27); `fetchedAt` 2026-09-29 (martes: re-export local por el fallo de CI).
- [ ] W38 verificada como parcial de exposición (no como semana limpia).

## 3. GSC pages — URL del owner (llenar W39)

| URL | Métrica | W36 baseline | W38 contexto | W39 lectura | Δ W39 vs W36 |
|---|---|---:|---:|---:|---:|
| `/calculadoras/conversor-utm/` | Clics | 1.484 | 423 | 114 | −92,3% |
| | Impresiones | 170.074 | 105.735 | 133.037 | −21,8% |
| | CTR | 0,87% | 0,40% | 0,09% | −0,78 pp |
| | Posición | 7,25 | 7,31 | 7,48 | +0,23 (peor) |
| `/calculadoras/conversor-uf/` | Clics | 6 | 18 | 12 | +6 |
| | Impresiones | 24.831 | 51.150 | 83.104 | +234,7% |
| | CTR | 0,02% | 0,04% | 0,01% | −0,01 pp |
| | Posición | 9,69 | 9,39 | 9,46 | −0,23 (mejor) |

## 4. GSC queries (llenar W39)

| Query | Métrica | W36 baseline | W38 contexto | W39 lectura | Umbral |
|---|---|---:|---:|---:|---|
| `utm` | Clics | 368 | 104 | 27 | — |
| | Impresiones | 20.658 | 11.075 | 13.121 | — |
| | CTR | 1,78% | 0,94% | 0,21% | ≥4% ❌ |
| | Posición | 6,73 | 6,80 | 6,94 | no peor que base ❌ (+0,21) |
| `utm hoy` | Clics | 253 | 47 | 13 | — |
| | Impresiones | 26.681 | 10.951 | 15.034 | — |
| | CTR | 0,95% | 0,43% | 0,09% | ≥4% ❌ |
| | Posición | 6,66 | 7,34 | 7,32 | ≤4 y no peor que base ❌ |

## 5. Funnel first-party (llenar W39)

| Calculadora | Métrica | W36 baseline | W38 contexto | W39 lectura | Umbral |
|---|---|---:|---:|---:|---|
| `conversor-utm` | `calculator_view` | 1.280 | 565 | 212 | — |
| | `calculator_start` | 856 | 362 | 96 | — |
| | `calculator_complete` | 842 | 360 | 95 | — |
| | `complete/start` | 98,4% | 99,4% | 99,0% | sin regresión ✅ |
| `conversor-uf` | `calculator_view` | 169 | 123 | 260 | — |
| | `calculator_start` | 144 | 86 | 207 | — |
| | `calculator_complete` | 141 | 85 | 201 | ≥163 ✅ |
| | `complete/start` | 97,9% | 98,8% | 97,1% | leve baja (−0,8 pp) |

Recordatorio: GSC-clics ≠ funnel (instrumentos distintos); no mezclar.

## 6. RUM — Cloudflare (llenar W39)

| Path | Métrica | W36 baseline | W38 contexto | W39 lectura | Regla |
|---|---|---:|---:|---:|---|
| `/calculadoras/conversor-utm/` | LCP p75 | 1.224 ms | 1.000 ms | 1.052 ms | >1.700 ms = revert ✅ |
| | INP p75 | 88 ms | 88 ms | 80 ms | sin regresión ✅ |
| | CLS p75 | 0 | 0,003 | 0 | sin regresión ✅ |
| | `count` | 1.800 | 600 | 180 | anotar muestra |
| `/calculadoras/conversor-uf/` | LCP p75 | 1.024 ms | 1.000 ms | 1.100 ms | >1.700 ms = revert ✅ |
| | INP p75 | 48 ms | 56 ms | 48 ms | sin regresión ✅ |
| | CLS p75 | 1 (sic) | 0,013 | 0,002 | verificar export W36 |
| | `count` | 280 | 120 | 280 | anotar muestra |

Nota: la referencia «~900 ms» del plan queda sustituida por los valores
W36 verificados del archivo (1.224 ms UTM / 1.024 ms UF). El CLS W36 de UF
se exportó como `1`; verificar si es ratio o artefacto de muestra antes de
usarlo como ancla.

## 7. Decisión del día 14 (marcar una)

- [ ] **Keep** — CTR `utm` y `utm hoy` ≥4% en W39, posición `utm hoy` ≤4 y
      sin regresión RUM → mantener y confirmar a 28 días.
- [ ] **Extender a 28 días** — mejora direccional pero bajo umbral, o
      señales mixtas → no tocar nada y leer W40–W41 con confounder #1.
- [ ] **Extender a segunda query (F2 UF)** — solo si el resultado de UTM
      es limpio; nunca en paralelo con una lectura en curso.
- [ ] **Revert** — posición `utm hoy` cae >2 puestos (peor que 8,66),
      LCP p75 >1.700 ms, o CTR < baseline W36 en ambas queries →
      revertir el snippet (`git revert` del commit de F1) y registrar.
- [ ] **No decidir** — semana incompleta, export truncado o confounder
      nuevo no reconciliado.

Resultado y razonamiento (2–5 líneas):

> **Recomendación del borrador (no es decisión): Revert.** Se cumple la
> regla pre-declarada «CTR < baseline W36 en ambas queries» (`utm` 0,21%
> vs 1,78%; `utm hoy` 0,09% vs 0,95%), con posición estable (≈7) e
> impresiones de la URL en 133.037: la caída es de CTR, no de ranking, y
> rompe el rango pre-deploy (W35–W37: 0,47–0,87%) → W38 parcial 0,40% →
> W39 0,09%. RUM
> sano, así que el snippet es el único candidato. F2 UF **no** debe
> extenderse. Antes de firmar, conviene mirar la SERP de «utm hoy» para
> descartar una feature de Google (respuesta directa) que también
> explicaría el zero-click; si existe, revertir igual no cuesta nada.

## 8. Firma

| Rol | Nombre | Fecha | Firma |
|---|---|---|---|
| Owner | Carlos Ortega | | |
| Verificación adversarial | | | |

## 9. Anexo #401 — SERP check manual (2026-09-25, previo a F5)

Método: Google `hl=es-CL&gl=cl&num=20`, sesión sin cuenta, ubicación
declarada Ñuñoa (Chile), 2026-09-25 10:59 -03. Una sola observación manual
(la posición visual puede variar entre cargas y no equivale a la posición
media de GSC); se registra para interpretar F5.

**`utm hoy` — top visible:**

| # | Resultado | Dominio | Tipo |
|---:|---|---|---|
| 1 | UTM-UTA-IPC 2026 | `sii.cl` | oficial |
| 2 | Valor UTM: $71.721 (Septiembre 2026) | `valor-utm.cl` | EMD |
| 3 | UTM indicadores diarios | `si3.bcentral.cl` | oficial |
| 4 | Valor UTM Hoy: $71.721 | `contable.app` | herramienta |
| 5 | **Valor UTM hoy: $71.721 (1 de septiembre de 2026, SII)** | **`monedario.cl`** | **propio** |
| 6 | Valores y fechas | `sii.cl` | oficial |
| 7 | Calculadora UTM | `utmapp.cl` | EMD |
| 8 | UTM indicadores diarios | `si3.bcentral.cl` | oficial |
| 9 | UTM Hoy | `utmhoy.cl` | EMD |

Lectura: se confirma el techo por EMD + fuentes oficiales de #401. El
título F1 está vivo y renderizado en el SERP (valor y fecha interpolados).
La mejora de CTR depende de diferenciación del snippet, no de ganar
puestos 1–3; la lectura F5 no debe atribuir a F1 una caída/ganancia de
posición por debajo de ~5.

**`valor uf hoy` — top visible:**

| # | Resultado | Dominio | Tipo |
|---:|---|---|---|
| 1 | Valores de la UF 2026 | `sii.cl` | oficial |
| 2 | UF indicadores diarios | `si3.bcentral.cl` | oficial |
| 3 | Valores y fechas | `sii.cl` | oficial |
| 4 | Valor UF Hoy: $41.016,28 | `contable.app` | herramienta |
| 5 | Valor UF Hoy del 25-09-2026 | `uf-hoy.com` | EMD |
| 6 | Calcula el valor de la UF | `gomaxxa.com` | herramienta |
| 7 | Valor UF hoy: $41.008,10 | `patrimore.com` | herramienta |
| 8 | Indicadores | `bancoestado.cl` | oficial |
| 9 | Valores y fechas | `sii.cl` | oficial |
| 10 | Valor UF Hoy | `valor-uf.cl` | EMD |

Lectura: Monedario no aparece en el top 10 de esta captura (consistente
con la posición media 9,7 y CTR ~0 de W36–W38). El head UF está aún más
capado (4 oficiales + EMD/herramientas); la decisión F2 UF del 2026-09-30
debe considerar esto además del resultado de UTM.

Sin AI Overview visible en la carga capturada de `utm hoy` (sí pestaña
«Modo IA» disponible); no se registra AIO para `valor uf hoy`.
