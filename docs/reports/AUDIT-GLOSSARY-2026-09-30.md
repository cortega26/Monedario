# Auditoría del glosario (N2 del informe SEO/SERP)

- **Fecha:** 2026-09-30
- **Plan:** `plans/archive/135-auditoria-glosario-n2-2026-09-30.md`
- **Alcance:** read-only. Ninguna entrada, enlace, fuente, ruta, índice o
  `noindex` fue modificado por esta auditoría.
- **Ventana:** GSC W32–W39 (2026-08-03 → 2026-09-27), agregado de 14.880 filas
  query×page; URL Inspection W39.
- **Universo:** 54 entradas en `src/data/glossary/` + índice `/glosario/`
  (55 URLs), todas indexadas (W39, PASS).

## Resumen ejecutivo

1. **Indexación resuelta:** 55/55 URLs del glosario indexadas. El problema no
   es cobertura.
2. **Demanda escasa y concentrada:** 17/54 entradas tuvieron ≥1 impresión en 8
   semanas; solo 2 tuvieron clics (CTC y TMC, 1 cada una). 37/54 no registraron
   impresiones.
3. **Demanda sin clic:** `renta-imponible` (1.877i, pos 15,7), `cuenta-rut`
   (485i, pos 11,7), `corredor-bolsa` (199i, pos 29,6) y `rescate` (54i, pos
   20,7) concentran la brecha: hay impresiones, no clics.
4. **Verificabilidad:** solo 5/54 entradas declaran `sources` y 7/54
   `reviewedDate`. Para definiciones financieras, la brecha de fuentes es el
   hallazgo transversal de mayor peso.
5. **Enlazado interno:** 34/54 entradas no reciben ningún enlace desde
   contenido no-glosario; el soporte es casi solo `relatedTerms`. Cuatro
   entradas no tienen soporte alguno (`corredor-bolsa`, `rescate`, `cuenta-2`,
   `lpc`).
6. **Sin canibalización relevante:** 15 grupos del anexo tocan `/glosario/`,
   todos débiles (≤84 impresiones; el mayor es `dicom` vs 2 posts). Confirma
   el veredicto del plan 128.
7. **Clasificación:** 45 `MANTENER`, 8 `ENRIQUECER`, 1 `CONSOLIDAR
   (candidato)` (`sbif`), **0 candidatos a noindex** con la evidencia actual.

## Hallazgos transversales

- **H1 — Fuentes y revisión:** `afc`, `afp`, `dicom`, `seguro-cesantia` y `uf`
  son las únicas con `sources`; `impuesto-unico` y `sueldo-bruto` declaran
  revisión reciente sin fuentes. Ninguna entrada nueva debe nacer sin fuentes
  (ver `NORMA_YMYL`); el backfill de las 49 restantes es un programa aparte, no
  una recomendación por URL.
- **H2 — Grafo casi cerrado:** el índice enlaza todas las entradas y
  `relatedTerms` da soporte cruzado, pero el contenido editorial casi no cita
  el glosario (máximo 3 enlaces entrantes: `afp`). Las entradas visibles sin
  soporte (`corredor-bolsa`, `rescate`) son la señal más clara de que el
  problema es distribución interna, no el contenido.
- **H3 — Índice `/glosario/`:** 436 impresiones / 0 clics, posición media
  36,2. Sus top queries son variantes de «superintendencia financiera glosario
  afp…» (posiciones 4–7): tráfico de marca regulatoria, no intención
  definicional del índice. El índice no compite por «qué es X».
- **H4 — Entradas breves (<700 caracteres):** `ges` (456), `copago` (465),
  `cic` (488), `cuenta-2` (519), `caec` (524), `rescate` (613),
  `corredor-bolsa` (672) y `renta-variable` (699). Cuatro de ellas tienen
  demanda o soporte observable; dos son solo thin.
- **H5 — `reviewedDate` como proxy de frescura:** las 7 entradas con revisión
  declarada usan fechas 2026-05/06/09; ninguna supera 12 meses. No hay
  entradas vencidas, hay entradas sin declaración.

## Metodología

- **Demanda:** agregado GSC W32–W39 (`aggregate-query-page.json`), filtrado a
  `/glosario/`; impresiones y clics sumados; posición media ponderada por
  impresiones; top queries por entrada.
- **Indexación:** `2026-W39-url-inspection.json`.
- **Enlazado:** grep de `/glosario/<slug>/` en `src/` (excluido
  `src/data/glossary/`); `relatedTerms` entrantes por entrada; conteo de
  `relatedCalculators`/`relatedGuides`/`relatedLaws`.
- **Calidad:** `sources` y `reviewedDate` del frontmatter; longitud del cuerpo.
- **Canibalización:** `aggregate-8w-cannibalization.json`, grupos donde
  participa al menos una URL `/glosario/`.
- **Reglas de clasificación:**
  - `MANTENER`: clics > 0, o señal relevante (≥90i), o soporte estructural
    (relIn alto / enlaces / fuentes con revisión).
  - `ENRIQUECER`: demanda visible sin clics y posición baja, entrada breve con
    demanda, o entrada sin soporte interno ni fuentes.
  - `CONSOLIDAR (candidato)`: sin señal, sin soporte y solapamiento claro con
    otra entrada o término legado.
  - `NOINDEX (candidato)`: solo con evidencia sostenida; **ninguna entrada la
    alcanza** (0 impresiones con denominador pequeño no es evidencia, regla del
    registry).
- **Datos crudos:** análisis reproducible desde los exports citados;
  resultados intermedios de la sesión en `/tmp/opencode/glossary-audit.json`.

## Tabla por URL (54 entradas)

Columnas: impresiones (8w), clics (8w), posición media ponderada, enlaces
entrantes desde contenido no-glosario, entradas del glosario que la referencian
(`relatedTerms`), número de fuentes, última revisión, recomendación.

| Entrada | Impr. | Clics | Pos. | Enlaces in | Rel. in | Fuentes | Revisión | Recomendación |
|---|---:|---:|---:|---:|---:|---:|---|---|
| [Renta Imponible](/glosario/renta-imponible/) | 1877 | 0 | 15.73 | 0 | 9 | — | — | ENRIQUECER |
| [Costo Total del Crédito (CTC)](/glosario/ctc/) | 641 | 1 | 8.53 | 0 | 3 | — | — | MANTENER |
| [Cuenta RUT](/glosario/cuenta-rut/) | 485 | 0 | 11.73 | 2 | 1 | — | — | ENRIQUECER |
| [Tasa Máxima Convencional (TMC)](/glosario/tmc/) | 363 | 1 | 6.74 | 0 | 6 | — | — | MANTENER |
| [Corredor de Bolsa](/glosario/corredor-bolsa/) | 199 | 0 | 29.56 | 0 | 0 | — | — | ENRIQUECER |
| [Administradora de Fondos de Cesantía (AFC)](/glosario/afc/) | 191 | 0 | 15.63 | 1 | 3 | 2 | 2026-06 | MANTENER |
| [Directorio de Información Comercial (DICOM)](/glosario/dicom/) | 183 | 0 | 26.72 | 1 | 3 | 2 | 2026-05 | MANTENER |
| [Cuenta Individual de Cesantía (CIC)](/glosario/cic/) | 143 | 0 | 13.02 | 0 | 1 | — | — | ENRIQUECER |
| [Comisión para el Mercado Financiero (CMF)](/glosario/cmf/) | 91 | 0 | 22.13 | 0 | 9 | — | — | MANTENER |
| [Rescate](/glosario/rescate/) | 54 | 0 | 20.69 | 0 | 0 | — | — | ENRIQUECER |
| [Impuesto Único de Segunda Categoría](/glosario/impuesto-unico/) | 43 | 0 | 25 | 1 | 3 | — | 2026-09 | MANTENER |
| [Asociación de Fondos de Pensiones (AFP)](/glosario/afp/) | 8 | 0 | 8.25 | 3 | 12 | 2 | 2026-05 | MANTENER |
| [Crédito con Aval del Estado (CAE)](/glosario/credito-aval-estado/) | 5 | 0 | 33.2 | 0 | 1 | — | — | ENRIQUECER |
| [Ahorro Previsional Voluntario (APV)](/glosario/apv/) | 2 | 0 | 52 | 0 | 7 | — | — | MANTENER |
| [Cuenta 2](/glosario/cuenta-2/) | 2 | 0 | 62 | 0 | 0 | — | — | ENRIQUECER |
| [Impuesto Global Complementario](/glosario/global-complementario/) | 2 | 0 | 6.5 | 2 | 4 | — | — | MANTENER |
| [Superintendencia de Bancos e Instituciones Financieras (SBIF)](/glosario/sbif/) | 1 | 0 | 4 | 0 | 1 | — | — | CONSOLIDAR (candidato) |
| [Boleta de Honorarios](/glosario/boleta-honorarios/) | 0 | 0 | — | 0 | 1 | — | — | MANTENER |
| [Carga Anual Equivalente (CAE)](/glosario/cae/) | 0 | 0 | — | 1 | 7 | — | — | MANTENER |
| [CAEC](/glosario/caec/) | 0 | 0 | — | 0 | 2 | — | — | MANTENER |
| [Clave Única](/glosario/clave-unica/) | 0 | 0 | — | 2 | 0 | — | — | MANTENER |
| [Copago](/glosario/copago/) | 0 | 0 | — | 0 | 2 | — | — | MANTENER |
| [Crédito Hipotecario](/glosario/credito-hipotecario/) | 0 | 0 | — | 1 | 4 | — | — | MANTENER |
| [Custodia](/glosario/custodia/) | 0 | 0 | — | 0 | 4 | — | — | MANTENER |
| [Dividendo Hipotecario](/glosario/dividendo-hipotecario/) | 0 | 0 | — | 1 | 2 | — | — | MANTENER |
| [ETF (Exchange-Traded Fund)](/glosario/etf/) | 0 | 0 | — | 0 | 5 | — | — | MANTENER |
| [Finiquito](/glosario/finiquito/) | 0 | 0 | — | 1 | 2 | — | — | MANTENER |
| [Fondo Nacional de Salud (Fonasa)](/glosario/fonasa/) | 0 | 0 | — | 0 | 8 | — | — | MANTENER |
| [Fondo de Emergencia](/glosario/fondo-emergencia/) | 0 | 0 | — | 0 | 2 | — | — | MANTENER |
| [Fondo Mutuo](/glosario/fondo-mutuo/) | 0 | 0 | — | 0 | 7 | — | — | MANTENER |
| [Fondo Solidario de Cesantía](/glosario/fondo-solidario/) | 0 | 0 | — | 1 | 3 | — | — | MANTENER |
| [GES](/glosario/ges/) | 0 | 0 | — | 0 | 2 | — | — | MANTENER |
| [Gratificación](/glosario/gratificacion/) | 0 | 0 | — | 2 | 0 | — | — | MANTENER |
| [Indemnización por Años de Servicio](/glosario/indemnizacion/) | 0 | 0 | — | 1 | 1 | — | — | MANTENER |
| [Inflación](/glosario/inflacion/) | 0 | 0 | — | 0 | 3 | — | — | MANTENER |
| [Índice de Precios al Consumidor (IPC)](/glosario/ipc/) | 0 | 0 | — | 0 | 6 | — | — | MANTENER |
| [Institución de Salud Previsional (Isapre)](/glosario/isapre/) | 0 | 0 | — | 0 | 4 | — | — | MANTENER |
| [IVA](/glosario/iva/) | 0 | 0 | — | 1 | 0 | — | — | MANTENER |
| [Liquidez](/glosario/liquidez/) | 0 | 0 | — | 0 | 5 | — | — | MANTENER |
| [LPC](/glosario/lpc/) | 0 | 0 | — | 0 | 0 | — | — | ENRIQUECER |
| [Multifondo AFP](/glosario/multifondo/) | 0 | 0 | — | 1 | 1 | — | — | MANTENER |
| [Operación Renta](/glosario/operacion-renta/) | 0 | 0 | — | 1 | 3 | — | — | MANTENER |
| [Renta Variable](/glosario/renta-variable/) | 0 | 0 | — | 0 | 3 | — | — | MANTENER |
| [Seguro de Cesantía](/glosario/seguro-cesantia/) | 0 | 0 | — | 0 | 1 | 2 | 2026-06 | MANTENER |
| [Servicio Nacional del Consumidor (SERNAC)](/glosario/sernac/) | 0 | 0 | — | 0 | 1 | — | — | MANTENER |
| [Servicio de Impuestos Internos (SII)](/glosario/sii/) | 0 | 0 | — | 0 | 9 | — | — | MANTENER |
| [Spread](/glosario/spread/) | 0 | 0 | — | 0 | 1 | — | — | MANTENER |
| [Sueldo Bruto](/glosario/sueldo-bruto/) | 0 | 0 | — | 0 | 7 | — | 2026-09 | MANTENER |
| [Tope Imponible](/glosario/tope-imponible/) | 0 | 0 | — | 1 | 1 | — | — | MANTENER |
| [Tasa de Política Monetaria (TPM)](/glosario/tpm/) | 0 | 0 | — | 0 | 2 | — | — | MANTENER |
| [Unidad de Fomento (UF)](/glosario/uf/) | 0 | 0 | — | 0 | 6 | 2 | 2026-06 | MANTENER |
| [Unidad Tributaria Anual (UTA)](/glosario/uta/) | 0 | 0 | — | 2 | 0 | — | — | MANTENER |
| [Unidad Tributaria Mensual (UTM)](/glosario/utm/) | 0 | 0 | — | 1 | 9 | — | — | MANTENER |
| [Volatilidad](/glosario/volatilidad/) | 0 | 0 | — | 0 | 1 | — | — | MANTENER |

## Recomendaciones — ENRIQUECER (8)

| Entrada | Motivo | Acción propuesta (no ejecutada) |
|---|---|---|
| `renta-imponible` | 1.877i / 0 clics, pos 15,7; 0 enlaces entrantes; sin fuentes | Revisar snippet/definición de apertura; añadir fuentes (SII/SP); enlazar desde `como-calcular-sueldo-liquido` y `sueldo-bruto`; evaluar solape con el post de sueldo líquido (grupos §Canibalización) |
| `cuenta-rut` | 485i / 0 clics, pos 11,7 | Snippet/definición y fuentes (BancoEstado/CMF); enlaces desde posts de bancos/fintech |
| `corredor-bolsa` | 199i / 0 clics, pos 29,6; breve, sin soporte ni fuentes | Ampliar definición, fuentes (CMF), `relatedCalculators` y enlaces desde contenido de inversión |
| `rescate` | 54i / 0 clics, pos 20,7; breve, sin soporte ni fuentes | Ampliar con reglas por producto (fondo mutuo, APV), fuentes CMF, enlaces desde `fondo-mutuo`/`apv` |
| `cic` | 143i / 0 clics, pos 13,0; 488 caracteres; sin fuentes | Ampliar (CIC vs FCS), fuentes (SP/AFC), enlaces desde `seguro-cesantia` |
| `credito-aval-estado` | 5i, pos 33,2; sin fuentes | Fuentes (INGRESA/Comisión Ingresa), enlaces desde contenido CAE |
| `cuenta-2` | 2i, pos 62; 519 caracteres; sin soporte ni fuentes | Fuentes (SP), enlaces desde `apv`/`multifondo`, evaluar `relatedTerms` |
| `lpc` | 0i; sin soporte; enlaza a `/leyes/` pero nadie la enlaza | Fuentes (BCN), enlaces desde contenido de consumo/SERNAC |

## Recomendaciones — CONSOLIDAR (candidato, 1)

| Entrada | Motivo | Acción propuesta (no ejecutada) |
|---|---|---|
| `sbif` | 1i, pos 4; institución disuelta en 2019 y absorbida por la CMF; única candidata con solapamiento legado claro | Evaluar fusión con `cmf` (nota histórica) o mantener como término histórico; cualquiera de las dos exige plan propio + contrato de indexabilidad (plan 120) + ADR + firma. No urgente |

## Canibalización (15 grupos, todos débiles)

Grupos donde participa `/glosario/` (impresiones 8w):

- `dicom` (84i) vs `/posts/informe-deudas-cmf-vs-dicom/` (38i) y
  `/posts/donde-ver-si-estoy-en-dicom-gratis/` (33i).
- `renta-imponible` vs `/posts/como-calcular-sueldo-liquido/` en 8 queries
  («sueldo imponible», «que es sueldo imponible», «calculo renta imponible»…),
  todas ≤33i y sin clics.
- `impuesto-unico` vs `/calculadoras/impuesto-segunda-categoria/` en 3 queries
  («máxima por cada tramo de renta», «tabla impuesto único 2022»…), ≤26i.
- `site:monedario.cl` (5i por URL, ruido de muestra) y `que es imponible`
  (glosario vs índice).

Ningún grupo alcanza el umbral de los 3 grupos fuertes del plan 128: no
procede consolidación por esta causa.

## Limitaciones

- **Backlinks:** no hay crawl de GSC Links/Ahrefs en el repo; la dimensión de
  autoridad externa queda fuera. No se estimó.
- **Posición media:** promedia impresiones, no equivale a SERP puntual.
- **Denominador:** 37 entradas con 0 impresiones tienen ventana corta y
  demanda long-tail; la ausencia de señal no es evidencia de ausencia de
  demanda (regla `n_min` del registry).
- **Exports:** dimensiones query/page/país/dispositivo; sin AIO.
- **Enlazado:** el conteo es sobre el árbol `src/`; no incluye enlaces
  externos ni generados dinámicamente (el índice enlaza todas las entradas).

## Próximos pasos (sujetos a decisión del owner)

1. Aprobar o descartar las 8 recomendaciones `ENRIQUECER` y la evaluación de
   `sbif`; la ejecución va en plan nuevo, post-W40 y con contrato 120 si toca
   indexabilidad.
2. Backfill de `sources`/`reviewedDate` como programa editorial aparte (49
   entradas), priorizando las visibles.
3. Enlazado interno: las 4 entradas sin soporte y las visibles sin enlaces son
   el caso más claro; coordinar con `check:calculator-interlinks` y la política
   de enlaces internos vigente.
4. Export de GSC Links por el owner si se quiere cerrar la dimensión de
   backlinks.

> Esta auditoría no autoriza cambios. No se tocó ningún archivo de `src/` ni de
> contenido.