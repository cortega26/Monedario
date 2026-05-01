# SEO owner map 2026

Fecha: 2026-05-01

## Alcance

Mapa operativo de owners canonicos para priorizar crecimiento SEO sin canibalizar hubs, articulos, calculadoras ni glosario.

## Fuentes usadas

- `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`
- `docs/editorial/NON_CANNIBALIZATION_PROCESS.md`
- `docs/research/seo/strategy/topic_ownership_matrix.md`
- `src/config/editorial-topic-policy.mjs`
- `src/config/clusters.ts`
- `src/config/editorial-hub-model.mjs`
- `src/config/calculatorPortfolio.ts`
- `src/data/blog/**`
- `src/pages/guias/**`
- `src/pages/calculadoras/**`
- Los dos informes SEO entregados por el usuario.

## Limitaciones

- Las URLs propuestas no quedan autorizadas para publicacion.
- Nuevas piezas YMYL requieren pipeline completo, fuentes oficiales y revision humana cuando aplique.
- La frecuencia de revision es editorial; no reemplaza controles CI.

| Cluster | Hub actual/propuesto | Owner canonico | Intencion principal | Satelites permitidos | Calculadoras asociadas | Contenidos que NO deben competir | Reglas de enlazado interno | Riesgo YMYL | Frecuencia de revision |
|---|---|---|---|---|---|---|---|---|---|
| Sueldos y remuneraciones | `/guias/sueldo-remuneraciones/` | `/calculadoras/sueldo-liquido/` para calculo; `/posts/como-calcular-sueldo-liquido/` para explicacion | Traducir sueldo bruto/imponible a liquido mensual y entender descuentos | `sueldo-imponible`, `gratificacion-legal`, `horas-extras`, `sueldo-minimo`, `liquidacion-de-sueldo`, `descuentos-de-sueldo` | `sueldo-liquido`, `impuesto-segunda-categoria`; propuestas: `gratificacion-legal`, `horas-extras` | Satelites no deben prometer "calcular sueldo liquido completo" | Hub -> calculadora + owner + satelites; satelites -> owner sueldo + calculadora; intercluster a pensiones solo como descuento AFP | Medio | Mensual para tramos/datos; trimestral editorial |
| Empleo e ingresos | `/guias/empleo-ingresos/` | `/posts/seguro-de-cesantia/` para cesantia; `/posts/finiquito-e-indemnizaciones-en-chile/` para termino laboral | Resolver contingencias que cortan o alteran ingreso laboral | `vacaciones-proporcionales`, `subsidio-cesantia`, `licencia-medica-rechazada`, `saldo-afc`, `indemnizacion-anos-de-servicio` | `seguro-cesantia`, `finiquito-indemnizacion`; propuesta: `vacaciones-proporcionales` | No competir con sueldo liquido ni liquidacion mensual; no reemplazar asesor laboral | Cesantia/finiquito/licencia enlazados por "si tu caso es"; calculadoras desde owner, no como unica respuesta | Alto | Trimestral; inmediata ante cambios AFC/SUSESO/DT |
| Pensiones y AFP | `/guias/pensiones-afp/` | Owners actuales: `reforma-previsional`, `fondos-afp`, `cambio-afp`, `cuenta2`; owner faltante: PGU | Explicar sistema previsional obligatorio, reformas y decisiones AFP | `PGU`, `lagunas-previsionales`, `AFP-mas-barata`, `cartola-afp`, `certificado-afiliacion` | `comisiones-afp`, `simulador-jubilacion`; APV como related desde ahorro | No duplicar APV como core pensiones; no decir "que AFP conviene" como recomendacion personalizada | Hub pensiones -> reforma/fondos/cambio/cuenta2/PGU; APV se enlaza como related; sueldo AFP sale a sueldo-remuneraciones | Alto | Mensual durante reforma; trimestral estable |
| Ahorro e inversion | `/guias/ahorro-e-inversion/` | `/posts/ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026/`; APV owner `/posts/que-es-el-apv/` | Elegir instrumentos de ahorro/inversion por plazo, costo, riesgo e impuestos sin recomendar productos | `DAP`, `fondos-mutuos`, `ETF`, `interes-compuesto`, `fondo-emergencia`, `renta-fija` | `apv`, `simulador-jubilacion` related; propuestas: `interes-compuesto`, `deposito-a-plazo` | No competir con Cuenta 2 ni pensiones obligatorias; no crear rankings de "mejor inversion" sin metodologia | Owner general -> instrumentos; instrumentos -> owner general + calculadora; APV -> pensiones only related | Alto | Trimestral; inmediata ante cambios tributarios |
| Impuestos personas | `/guias/impuestos-personas/` y centro OR | Owner jerarquico pendiente: Operacion Renta centro vs F22 checklist | Declarar, revisar devolucion y entender obligaciones tributarias de personas naturales | `devolucion-impuestos`, `boleta-honorarios`, `IGC`, `rentas-mixtas`, `contribuciones`, `arriendos`, `impuesto-segunda` | `operacion-renta`, `boleta-honorarios-liquido`, `impuesto-segunda-categoria`; posible `IGC` | F22, devolucion y boletas no deben competir por "Operacion Renta" | Hub OR como entrada; satelites responden momento especifico; cada pieza con fecha de corte y fuente SII/TGR | Alto | Alta entre enero-mayo; mensual si hay valores UTM |
| Deuda y credito | `/guias/deuda-credito/` | `/posts/cae-costo-real-credito-chile/`; `/posts/informe-deudas-cmf-vs-dicom/`; owner faltante credito consumo | Diagnosticar deuda, costo real del credito y salidas formales | `credito-consumo`, `portabilidad-financiera`, `consolidacion-deudas`, `pago-minimo-tarjeta`, `prescripcion-deudas` | `credito-consumo`, `tarjeta-credito`, `prepago-credito`, `simulador-renegociacion`, `dividendo-hipotecario` | No confundir CAE credito con CAE universitario; DICOM no debe competir con CMF | Diagnostico -> costo -> decision -> salida formal; cada calculadora enlaza a owner conceptual | Alto | Trimestral; inmediata ante cambios CMF/SERNAC/Superir |
| UF, IPC y costo de vida | `/guias/uf-costo-de-vida/` | `/posts/que-es-la-uf/`; `/posts/que-es-el-ipc-chile-como-se-calcula/`; `/posts/reajuste-arriendo-uf-ipc-chile/` | Traducir indicadores a contratos y bolsillo | `UTM`, `IPC-acumulado`, `arriendo-vs-dividendo`, `reajuste-contratos` | `conversor-uf`, `reajuste-arriendo`, `dividendo-hipotecario` related | No competir por dato puro "UF hoy" si no agrega decision; no absorber credito hipotecario completo | UF/IPC -> aplicacion contractual; conversor no reemplaza explicacion; deuda solo como related | Bajo/Medio | Mensual para datos; trimestral editorial |
| Seguridad financiera | `/guias/seguridad-financiera/` | Definir owner principal: `/posts/fraude-tarjeta-que-hacer/` para cargo no reconocido | Ayudar a actuar ante fraude, cargo, estafa o suplantacion | `estafa-transferencia`, `phishing`, `suplantacion`, `bloqueo-tarjeta`, `reclamo-CMF-SERNAC` | No calculadora clasica; posibles checklists/flujos | No prometer recuperacion garantizada; no competir con DICOM salvo suplantacion con deudas | Emergencia 24h -> denuncia/reclamo -> prevencion; enlazar a CMF/DICOM solo si hay creditos no reconocidos | Alto | Trimestral; inmediata ante cambios Ley 20.009 |
| Presupuesto y control financiero | `/guias/presupuesto-control-financiero/` | `/posts/como-hacer-presupuesto-mensual-chile/` como owner canonico transitorio | Ordenar caja del hogar antes de invertir o endeudarse | `fondo-emergencia`, `gasto-hormiga`, `metodo-50-30-20`, `presupuesto-pareja`, `deuda-vs-ahorro` | Propuestas: `presupuesto-mensual`, `fondo-emergencia` checklist/tool | No competir con ahorro/inversion; no prometer rentabilidad ni salud financiera garantizada | Migrar desde transitional placement cuando exista segundo activo; owner presupuesto enlaza a ahorro/deuda como salidas | Bajo/Medio | Trimestral |
| Vivienda/hipotecario | Propuesto como subcluster bajo `deuda-credito` o `uf-costo-de-vida`; no abrir hub propio aun | `/posts/credito-hipotecario-chile-guia-completa/`; tool `/calculadoras/dividendo-hipotecario/` | Entender compra, dividendo, pie, seguros y capacidad responsable | `dividendo-hipotecario`, `capacidad-endeudamiento`, `arriendo-vs-dividendo`, `contribuciones` | `dividendo-hipotecario`, `prepago-credito`, `conversor-uf` | No competir con credito de consumo ni UF conceptual | Hipotecario general -> dividendo/capacidad/pie; UF como soporte; contribuciones a impuestos | Alto | Trimestral; mensual si tasas/datos usados |
| Beneficios estatales | No abrir hub propio todavia; usar paginas de tramite explicado solo si recurrencia anual | Sin owner global; candidatos `aporte-familiar`, `bono-hijo`, `aguinaldo` solo si fit | Explicar beneficios recurrentes con calendario oficial | Satelites de alta recurrencia y fuerte fit financiero | No aplica inicialmente | No convertirse en portal de bonos/noticias | Solo enlazar desde cluster pertinente; canonical anual o evergreen segun beneficio | Medio | Estacional por beneficio |

## Reglas transversales

- Toda nueva URL indexable debe tener owner antes de brief.
- Todo satelite debe decir explicitamente que resuelve y que no resuelve.
- Toda calculadora debe enlazar a metodologia, fuentes y owner editorial.
- Toda pieza YMYL debe incluir fecha de corte visible.
- Las paginas de tramite explicado deben enviar al canal oficial, no reemplazarlo.

## Decisiones Sprint 0 - Verificacion y limpieza

| Caso | Decision | Owner / tratamiento | Motivo | Accion siguiente |
|---|---|---|---|---|
| `operacion-renta-centro` vs `operacion-renta-f22-checklist` | Pendiente con owner protegido | Mantener `/posts/operacion-renta-f22-checklist/` como owner operativo F22. `operacion-renta-centro` no debe competir como segundo articulo "guia completa" | `audit:topic-overlap` marca `candidate_same_intent`; ya existe hub publico `/guias/impuestos-personas/operacion-renta/` con la funcion de centro | Sprint 1 debe elegir una salida publica: convertir `operacion-renta-centro` en support no indexable, fusionar con el hub, o redirigir. No se cambia ruta en Sprint 0 |
| `el-poder-del-interes-compuesto` vs `interes-compuesto-nota-metodologica` | Mantener coexistencia valida | Owner: `/posts/el-poder-del-interes-compuesto/`; reference: `/posts/interes-compuesto-nota-metodologica/` | La nota ya declara `topicRole: reference`, `canonicalTopic: interes-compuesto-caso`, `unlisted: true` y enlaza de vuelta al caso | Ninguna accion de ownership; futura calculadora debe enlazar ambos sin prometer rentabilidad |
| Orphan `operacion-renta-centro` | Pendiente | No asignar inbound hasta decidir si se fusiona, redirige o queda support | Enlazar ahora podria reforzar una URL que compite con F22/hub | Resolver junto con decision Operacion Renta en Sprint 1 |
| Orphan `prepago-credito-cuando-conviene-chile` | Solo enlazar | Mantener owner actual de prepago; agregar inbound desde hub deuda, CAE o credito hipotecario en Sprint 1 | Ya declara `topicRole: owner` y `canonicalTopic: prepago-credito-calculo`; el problema es descubribilidad, no ownership | Corregir linking sin cambiar slug ni rol |
| Orphan `que-es-la-cuenta-2-afp` | Solo enlazar | Mantener owner actual Cuenta 2; enlazar desde hub pensiones y APV como related | Policy local mantiene APV en ahorro e inversion y Cuenta 2 en pensiones | Refuerzo de links en Sprint 1 |
| Orphan `reforma-previsional-2025-que-cambia-y-como-te-afecta` | Solo enlazar | Mantener owner actual reforma previsional | Falta inbound visible; no hay conflicto de owner detectado | Refuerzo de links desde hub pensiones y futura PGU |
| Orphan `tarjeta-credito-costo-real-chile` | Solo enlazar | Mantener owner actual de tarjeta; calculadora `/calculadoras/tarjeta-credito/` queda como tool | Ya declara owner y canonical topic; el problema es inbound | Refuerzo desde hub deuda, CAE y calculadora |
| `credito-consumo` | Crear futuro owner editorial | Tool actual `/calculadoras/credito-consumo/`; futuro owner `/posts/credito-consumo-chile-cae-costo-total/` si se abre P1 | La calculadora existe; falta entrada editorial propia sin reemplazar la guia CAE | Brief P1 con diferenciacion frente a `/posts/cae-costo-real-credito-chile/` |
| `dividendo-hipotecario` | Crear satelite futuro, no cluster nuevo | Tool actual `/calculadoras/dividendo-hipotecario/`; owner de proceso: `/posts/credito-hipotecario-chile-guia-completa/`; posible satelite `/posts/calcular-dividendo-hipotecario-chile/` | La herramienta existe y esta en portfolio; falta packaging editorial especifico, no una segunda calculadora | Brief satelite tool-led si Sprint 1/2 lo prioriza |
| `tarjeta-credito` | Mantener owner actual | `/posts/tarjeta-credito-costo-real-chile/` + `/calculadoras/tarjeta-credito/` | Owner ya existe y no debe ser recreado | Resolver orfandad con interlinks |
| `prepago-credito` | Mantener owner actual | `/posts/prepago-credito-cuando-conviene-chile/` + `/calculadoras/prepago-credito/` | Owner ya existe y no debe ser recreado | Resolver orfandad con interlinks |
| `simulador-renegociacion` | Mantener como tool de owner existente | `/posts/renegociacion-superir/` posee requisitos/proceso; `/calculadoras/simulador-renegociacion/` filtra escenario | Coexistencia valida articulo + calculadora | No crear owner adicional |
| PGU, gratificacion legal, sueldo imponible, IGC, contribuciones, fondo emergencia | Crear futuro owner antes de brief | Filas agregadas en `docs/research/seo/strategy/topic_ownership_matrix.md` | Son P1 sin owner publicado suficiente o con glosario insuficiente | Antes de publicar: brief YMYL, fuentes oficiales, fecha de corte y registro/config si el cluster endurecido lo exige |

## Decisiones

- No se abre cluster vivienda por ahora; hipotecario sigue en deuda/UF hasta que existan mas activos.
- Beneficios estatales se mantienen como baja prioridad salvo recurrencia anual y fit financiero directo.
- Presupuesto ya tiene hub, pero `como-hacer-presupuesto-mensual-chile` sigue documentado como transitional placement hasta completar cluster.

## Pendientes

- Resolver owner operativo de Operacion Renta centro.
- Definir owner de seguridad financiera principal en metadata si se endurece el cluster.
- Agregar canonical topics futuros antes de publicar P1 nuevos.

## Criterios de actualizacion

- Revisar cada vez que se cree una URL, calculadora o hub.
- Sincronizar con `src/config/editorial-topic-policy.mjs` y `docs/research/seo/strategy/topic_ownership_matrix.md`.
