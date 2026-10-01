# Evidencia de preparación — no es auditoría independiente

Fecha de consulta: 2026-09-29. Autor: DraftAgent/implementación, familia GPT.

## SII: tipo de cambio de cierre

Fuente primaria recuperada con `web.run` / `open`:
<https://www.sii.cl/valores_y_fechas/dolar/dolar2025.htm>.
Tabla Dólar Observado, diciembre 2025, pesos por dólar estadounidense.

Extracto de las celdas relevantes:

| Día | Diciembre |
| --- | --- |
| 29 | 904,54 |
| 30 | 911,18 |
| 31 | celda vacía |

El último dato mostrado en diciembre es el del 30. Se usa 911,18 para convertir
únicamente el checkpoint final documentado. No es el promedio de diciembre.

## Checkpoints: transcripción editorial

Fuente: `src/data/blog/el-poder-del-interes-compuesto.mdx`, sección «Lo que
habría pasado, década a década»; lectura local 2026-09-29.

| Cierre | USD declarados |
| --- | ---: |
| Dic 1995 | 770 |
| Dic 2000 | 4.702 |
| Dic 2005 | 4.537 |
| Dic 2010 | 8.124 |
| Dic 2015 | 20.258 |
| Dic 2020 | 62.846 |
| Dic 2025 | 129.495 |

Las fechas `YYYY-12-31` del dataset codifican el cierre mensual que expresa la
tabla. No afirman que ese día haya sido hábil o haya existido una cotización.

## Límite de la evidencia preexistente

`docs/reports/VERIFY-el-poder-del-interes-compuesto-2026-09-17.md`, §2, respalda
la aritmética de convertir el resultado declarado; §8 deja residuales sobre
series, checkpoints IMM, interpolación FX y lagunas. La nota metodológica
presenta tablas de supuestos y semilla 42, pero no los índices exactos de los
meses sin aporte ni el programa/serie mensual original. Se buscó por nombres
y referencias a interés compuesto/NASDAQ en scripts, tests, datos y artefactos.

Por eso este paquete no contiene curva, valores mensuales sintetizados ni una
calibración que fuerce el resultado publicado. El alcance excluye reauditar las
premisas históricas completas y mantiene ese requerimiento abierto.
