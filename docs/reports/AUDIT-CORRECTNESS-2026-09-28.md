# Auditoría adversarial de correctitud, consistencia y freshness — monedario.cl

**Fecha de auditoría:** 28 de septiembre de 2026
**Origen:** resultado externo del brief
[`01-correctitud-consistencia-freshness.md`](../backlog/auditorias-pendientes-2026-09-28/01-correctitud-consistencia-freshness.md),
ejecutado contra el sitio LIVE por operadores sin acceso al repo.
**Enfoque:** caja negra + reconstrucción independiente contra SII, INE,
Superintendencia de Pensiones, AFC, SuperIR, BCN y normativa vigente.
**Remediación:** [plan 115](../../plans/115-correctness-remediation-2026-09-28.md).

## Executive summary

Un usuario puede obtener hoy una respuesta **materialmente incorrecta,
desactualizada o contradictoria** sin una señal suficientemente fuerte que le
advierta. No hay fórmulas rotas: la calculadora de Impuesto de Segunda
Categoría pasó pruebas exactas en fronteras de tramos, el sueldo líquido
dinámico produjo el impuesto correcto en el escenario probado y la
amortización hipotecaria es coherente. El problema es la **gestión temporal de
parámetros + reglas legales/tributarias + sincronización entre contenido y
calculadora**: 10 findings (1 P0, 6 P1, 3 P2).

El P0 está en **Operación Renta 2026**: el ejemplo publicado usa parámetros
tributarios de septiembre de 2026 para el AT2026, que debe usar valores del
período 2025. Con los supuestos del propio sitio, para $18.000.000 la tabla
oficial AT2026 arroja $269.368 de IGC, mientras el sitio muestra $255.248
(−5,24%); los $255.248 se reproducen exactamente usando la UTA de septiembre de
2026. Además pide "sueldos brutos" aunque el F1887 informa Renta Total Neta
Pagada.

## Findings

| ID | Sev | Estado | URL/componente | Problema | Evidencia | Fuente | Fix |
|---|---|---|---|---|---|---|---|
| F01 | P0 | CONFIRMED | `/calculadoras/operacion-renta/` | Mezcla período tributario 2025 con parámetros 2026 y pide base salarial insuficiente | $18M → IGC $255.248; tabla AT2026 correcta $269.368; $255.248 = 18M×4% − 0,54×UTA sep-2026 ($860.652) | SII AT2026: rebaja $450.632,16 (valores dic-2025); F1887 usa Renta Total Neta Pagada | Congelar bundle AT2026; pedir renta neta F1887 o reconstruirla; vectores dorados SII |
| F02 | P1 | CONFIRMED | Operación Renta | Confusión año comercial/año tributario y tasa honorarios | Página: "Operación Renta 2026 (año tributario 2025)" vs FAQ "año tributario 2026"; PPM 15,25% vs ejemplo propio 14,5% | SII: año comercial 2025 = 14,5%; 2026 = 15,25% | Modelar `commercial_year`/`tax_year`/`filing_year` |
| F03 | P1 | CONFIRMED | `/calculadoras/deposito-a-plazo/` | Retención general del 4% inexistente para la persona natural residente descrita | UI "Sí (persona natural)" resta 4% citando art. 59 N°4 | SII: intereses DAP no sujetos a esa retención; eventual IGC con exención de 20 UTM en ciertos casos | Eliminar descuento automático; separar monto al vencimiento de tributación anual |
| F04 | P1 | CONFIRMED | `/calculadoras/actualizador-inflacion/` | Dataset 8 meses atrasado y freshness falsa | Dice "diciembre 2025 (última cifra disponible del INE)"; la serie termina en 2025-12 | INE publicó agosto 2026 (+3,6% acumulado 2026) | Ingesta INE con `latest_period` y fail-closed si hay lag |
| F05 | P1 | CONFIRMED | `/calculadoras/apv/` | Retiro anticipado Régimen B como "impuesto + 3%" | Tabla/texto "sobretasa del 3%" | Art. 42 bis: 3 pp + **1,1 ×** tasa incremental | Mostrar fórmula legal y excepciones |
| F06 | P1 | CONFIRMED | `/calculadoras/simulador-renegociacion/` | Filtro omite el requisito de dos acreedores distintos | Solo montos/días; sin identidad de acreedor | SuperIR exige "dos o más acreedores distintos" | Añadir acreedor y deduplicar; exigir ≥2 |
| F07 | P1 | CONFIRMED | SuperIR / DICOM | Atribución legal y regla de eliminación erróneas | Atribuye a Ley 21.214 la regla "$2,5M pagados" y 5 años desde pago | Ley 21.214 es "Educación sin DICOM"; Ley 19.628: 5 años desde exigibilidad y no comunicar tras el pago | Reescribir desde Ley 19.628 + 21.214 solo para deudas educacionales |
| F08 | P2 | CONFIRMED | `/calculadoras/sueldo-liquido/` | Ejemplo estático contradice el motor; AFC ambigua | Ejemplo $973.560 / IUSC $0 vs runtime $973.347 / $213 (reproducido) | SP: plazo fijo/obra = 3% empleador; indefinido trabajador 0,6% | Generar ejemplos desde el motor; distinguir `worker_rate`/`employer_rate` |
| F09 | P2 | CONFIRMED (parcial) | `/calculadoras/conversor-utm/` | UTA $834.504 sin indicar período | Valor correcto (dic-2025) y etiquetado "(12 × UTM de diciembre)", sin año | SII: UTA sep-2026 $860.652; $834.504 = dic-2025 para AT2026 | Etiquetar período en toda renderización |
| F10 | P2 | CONFIRMED | Hipotecario / prepago | "Prepago sin costo" mientras el propio sitio modela comisión | `dividendo-hipotecario.astro` rotula "Portabilidad Financiera (prepago sin costo)" | Ley 18.010 admite comisión hasta 1 mes (no reajustables) / 1,5 meses (reajustables) | "Derecho a prepago sujeto a reglas/comisión aplicable" |

## Verificación local del repo (2026-09-28)

Triage hecho contra el código antes de planificar:

- **F01 confirmado**: `SimulateOperacionRenta.ts:75` deriva `uta = utm × 12` con
  la UTM vigente (snapshot sep-2026 $71.721) en vez de la UTA AT2026
  ($834.504, `indicatorUpdatedAt.uta = 2025-12-01`). Reproduce $255.248.
- **F02 confirmado**: `operacion-renta.astro:341` ("año tributario 2025") vs
  `:78` ("año tributario 2026"); PPM 15,25% en `:196/:363` vs ejemplo
  `SimulateOperacionRenta.methodology.ts` ($1,45M/$10M = 14,5%).
- **F03 confirmado a nivel código/texto**: `CalculateTermDeposit.ts:6-7`
  (`INTEREST_WITHHOLDING_RATE = 0.04`, art. 59 N°4) y FAQ/UI. Corrección legal
  pendiente de fuente primaria SII.
- **F04 confirmado**: `src/data/economic-history/ipc-historico.json` termina en
  `2025-12-01`; `actualizador-inflacion.astro:188` muestra "última cifra
  disponible del INE" pese al IPC 2026-08 en el snapshot.
- **F05 confirmado a nivel texto** (`apv.astro:56/403/566`); fórmula legal
  pendiente de BCN.
- **F06 confirmado**: sin modelo de acreedor en
  `SimulateDebtRenegotiation` ni en la página.
- **F07 confirmado a nivel texto** (`simulador-renegociacion.astro:368`);
  atribución legal pendiente de verificación BCN.
- **F08 confirmado y reproducido**: runtime $973.347 / $213 (tramo 4%) vs
  ejemplo estático `sueldo-liquido.astro:545` ($973.560 / $0).
- **F09 parcial**: el valor es correcto y está fechado internamente
  (`indicatorUpdatedAt.uta`); falta el año en la etiqueta visible.
- **F10 confirmado**: `dividendo-hipotecario.astro:414`.

## Matriz de calculadoras (extracto)

| Caso | Esperado independiente | Observado | Resultado |
|---|---:|---:|---|
| IUSC $968.233 / $968.234 (frontera) | $0 / marginal 4% | $0 / 4% | PASS |
| IUSC $2.151.630 / $2.151.631 | $47.336 / 8% | $47.336 / 8% | PASS |
| IUSC $10.000.000 | $1.827.466 | $1.827.466 | PASS |
| Sueldo $1,2M runtime | $973.347 / IUSC $213 | $973.347 / $213 | PASS |
| Sueldo $1,2M ejemplo estático | $973.347 / $213 | $973.560 / $0 | FAIL (F08) |
| DAP $5M 90 días 6% | $73.973 sin retención general | neto $71.014 (−4%) | FAIL (F03) |
| Operación Renta $18M (supuesto del sitio) | $269.368 AT2026 | $255.248 | FAIL (F01) |
| IPC $1M dic-25 → ago-26 | ≈ $1.036.000 | serie termina dic-25 | FAIL (F04) |
| UTM 10 UTM sep-26 | $717.210 | $717.210 | PASS |
| Hipotecario 2.400 UF 4,5% 25a | 13,217364 UF | 13,2174 UF | PASS |

## Riesgos sistémicos

1. **Parámetros "latest" en cálculos históricos** (F01/F02/F09): constantes
   globales actualizadas al build pueden cambiar retroactivamente un cálculo
   tributario.
2. **Duplicación runtime/ejemplos/FAQ/metodología** (F08): el motor puede estar
   correcto mientras el contenido estático queda atrás.
3. **Legal claims como texto libre** (F03/F05/F07): una atribución jurídica
   incorrecta sobrevive a cualquier cobertura de tests.
4. **"Precisión aparente"**: una devolución al peso sobre una entrada que no
   reconstruye la base tributaria.
5. **Freshness metadata desacoplada del dato** (F04): fecha de revisión reciente
   no prueba dataset actualizado.

## Secuencia recomendada

1. **F01** (P0): contrato AT2026 congelado + input de renta neta + vectores SII.
2. **F03 DAP**: retirar la retención automática (verificación SII previa).
3. **Registry effective-dated** (`value_effective_for(context)` con
   `commercial_year`/`tax_year`/`filing_year`).
4. **F04 IPC**: ingesta INE + freshness assertion.
5. **F06/F07/F05**: acreedores, DICOM (Ley 19.628) y fórmula APV.
6. **Paridad contenido/runtime**: ejemplos generados desde el motor.

## Zonas no auditadas por el informe original

Fuzzing completo de las 22 herramientas, supuestos actuariales de jubilación,
todas las tasas/comisiones AFP por fecha, CAE/TMC, causales/topes completos de
finiquito, gratificación, y excepciones tributarias de APV/Operación Renta.
