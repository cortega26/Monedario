# YMYL risk register 2026

Fecha: 2026-05-01

## Alcance

Registro de riesgos YMYL para oportunidades SEO 2026. Aplica a nuevos contenidos, refreshes sustantivos, calculadoras y paginas de tramite explicado.

## Fuentes usadas

- `docs/editorial/NORMA_YMYL.md`
- `context/EDITORIAL_AI_PIPELINE.md`
- `context/INVARIANTS.md`
- `context/CONTRACTS.md`
- `docs/governance/FINANCIAL_DATA_VERIFICATION_POLICY.md`
- Los dos informes SEO entregados.
- Repo local.

## Limitaciones

- No es auditoria legal ni tributaria.
- No valida formulas existentes.
- No reemplaza math audit, compliance review ni sign-off humano.

| Riesgo | Cluster afectado | Severidad | Probabilidad | Ejemplo | Mitigacion requerida | Gate |
|---|---|---|---|---|---|---|
| Publicar regla sin fecha de corte | Todos YMYL | Alta | Alta | PGU, IGC, sueldo minimo sin vigencia visible | Bloque "Fecha de corte" y fuentes oficiales | `CONTRACT.YMYL_RESPONSE_STRUCTURE` + review |
| Usar informe externo como fuente normativa | Todos | Alta | Media | Citar doc 1 para monto PGU o IMM | Dossier con SII/DT/IPS/CMF/BCN segun tema | Editorial pipeline |
| Duplicar owner y canibalizar | Sueldo, impuestos, AFP, deuda | Alta | Alta | Nuevo articulo "sueldo liquido 2026" paralelo | Owner decision antes de brief | `audit:topic-overlap` + policy |
| Calculadora con formula no auditada | Sueldo, empleo, impuestos, credito | Alta | Media | Gratificacion o vacaciones con redondeo incorrecto | Tests + math audit + metodologia | Unit tests + math audit |
| Recomendacion financiera personalizada | Ahorro, inversion, AFP, credito | Alta | Media | "Este APV/fondo/AFP conviene" | Lenguaje educativo, escenarios, disclaimer | Compliance review |
| Confundir tramite oficial con ejecucion | Impuestos, pensiones, beneficios | Media | Alta | "Paga contribuciones aqui" | Enviar a portal oficial; explicar pasos | Editorial review |
| Valores vivos obsoletos | UF, UTM, impuestos, AFP | Alta | Media | UTM/UF/tasas desactualizadas | Fuente, fecha, fallback y cadencia | Data policy |
| Reforma previsional mal temporalizada | Pensiones | Alta | Media | Decir que cambio ya aplica cuando no | Separar aprobado/vigencia/implementacion | NORMA_YMYL bloque reforma |
| Taxonomia enganosa por cluster incorrecto | Presupuesto, APV, UF | Media | Media | APV core en pensiones; presupuesto en empleo | Respetar topic ownership policy | `check:frontmatter` en clusters endurecidos |
| Prometer resultado ante fraude/deuda | Seguridad/deuda | Alta | Media | "Recupera tu plata" | Protocolo, plazos, excepciones, no garantia | Compliance review |
| Crear pagina anual sin canonical | Impuestos, beneficios | Media | Alta | `operacion-renta-2027` duplicando 2026 | Politica evergreen/anual documentada | Owner map + route review |
| Mezclar CAE credito con CAE universitario | Deuda/credito | Media | Media | Landing credito consumo ambigua | Title, intro y glosario diferenciados | Editorial review |
| Sobreusar fuentes secundarias | Todos | Alta | Media | Rankia/Buk como fuente de ley | Fuente primaria obligatoria para claims criticos | Dossier |
| Sobreoptimizar por volumen | UF, UTM, bonos | Media | Alta | Pagina "valor hoy" sin utilidad | Exigir moat: calculo, decision o checklist | SEO review |

## Criterios por tipo de activo

| Tipo de activo | Riesgo base | Requisitos minimos |
|---|---|---|
| Owner YMYL evergreen | Medio/Alto | Fecha de corte, fuentes oficiales, owner decision, no duplicacion |
| Pagina estacional anual | Alto | Politica canonical, calendario de revision, fuentes oficiales |
| Calculadora | Alto | Metodologia, tests, math audit, disclaimer, fuente de parametros |
| Comparativa financiera | Alto | Criterios transparentes, no ranking opaco, no recomendacion personalizada |
| Checklist/tramite explicado | Medio | Canal oficial visible, limites de alcance, actualizacion por fecha |
| Glosario | Bajo/Medio | No convertirse en owner si solo define |

## Decisiones

- Toda oportunidad P1 de impuestos, pensiones, credito o empleo se considera YMYL al menos medio.
- PGU, IGC, gratificacion, finiquito/vacaciones, credito de consumo y fraude requieren compliance fuerte.
- Interes compuesto y fondo emergencia pueden ser de riesgo medio/bajo si no prometen rentabilidad ni recomiendan productos.

## Pendientes

- Crear checklist de publish packet por cada P1.
- Confirmar si se integrara validacion automatica para fecha de corte visible.
- Revisar tickets de calculadoras con riesgo P1.

## Criterios de actualizacion

- Actualizar ante nuevos clusters, calculadoras o cambios regulatorios.
- Revisar despues de cada sprint SEO.
