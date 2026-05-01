# Calculator opportunities 2026

Fecha: 2026-05-01

## Alcance

Inventario de oportunidades de calculadoras y herramientas derivado del cruce entre informes SEO y repo actual.

## Fuentes usadas

- `src/pages/calculadoras/**`
- `src/config/calculatorPortfolio.ts`
- `docs/operations/reports/calculator-portfolio-audit-2026-04.md`
- Informes SEO entregados.
- `docs/editorial/NORMA_YMYL.md`

## Limitaciones

- No se auditaron formulas en este documento.
- Las prioridades no sustituyen auditorias tecnicas ni math audit.
- Algunas oportunidades son integracion editorial de calculadoras existentes, no nuevas herramientas.

## Inventario actual confirmado

Calculadoras publicas confirmadas:
- `/calculadoras/sueldo-liquido/`
- `/calculadoras/boleta-honorarios-liquido/`
- `/calculadoras/impuesto-segunda-categoria/`
- `/calculadoras/operacion-renta/`
- `/calculadoras/finiquito-indemnizacion/`
- `/calculadoras/seguro-cesantia/`
- `/calculadoras/apv/`
- `/calculadoras/simulador-jubilacion/`
- `/calculadoras/comisiones-afp/`
- `/calculadoras/credito-consumo/`
- `/calculadoras/tarjeta-credito/`
- `/calculadoras/prepago-credito/`
- `/calculadoras/simulador-renegociacion/`
- `/calculadoras/conversor-uf/`
- `/calculadoras/reajuste-arriendo/`
- `/calculadoras/dividendo-hipotecario/`

## Oportunidades

| Calculadora/herramienta | Estado repo | Accion | Formula/modelo conceptual | Fuentes oficiales necesarias | Inputs | Outputs | Edge cases | Disclaimers | Tests minimos | Dependencia actualizable | Riesgo | Prioridad |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Sueldo liquido | Existe | Mejorar/integrar | Haberes imponibles/no imponibles menos AFP, salud, cesantia, impuesto | SII, SPensiones, AFC, Fonasa/Isapre | Sueldo, AFP, salud, contrato, bonos | Liquido, descuentos, impuesto | Tope imponible, exento, Isapre UF | Estimacion; liquidacion oficial manda | Tramos, topes, cero, extremos | UTM, AFP, UF | Medio | P1 |
| Finiquito e indemnizacion | Existe | Auditar/consolidar | Pago final, indemnizacion, aviso, feriado proporcional | DT, Codigo Trabajo, BCN | Fechas, sueldo, causal, vacaciones | Estimacion por item | Fraccion >=6 meses, topes, causal | No asesoria laboral | Redondeo 6 meses, tope 11 anos, 90 UF | UF | Alto | P1 |
| Credito de consumo | Existe | Crear owner editorial | Amortizacion, cuota, CAE/costo total | CMF, ley credito | Monto, tasa, plazo, costos | Cuota, interes, costo total | Comisiones, seguros, tasa nominal/CAE | No oferta bancaria | Tasa cero, plazo, costos | UTM/UF si aplica | Alto | P1 |
| Dividendo hipotecario | Existe | Enlazar con satelite | Amortizacion UF/pesos, pie, tasa, plazo | CMF/bancos como referencia metodologica | Precio UF, pie, tasa, plazo, seguros | Dividendo, tabla, total | UF variable, seguros, tasa mixta | No aprobacion bancaria | Pie 0/100, tasa cero, plazo largo | UF | Alto | P1 |
| Gratificacion legal | No existe | Crear | 25% remuneraciones con tope o modalidad 30% utilidades como explicacion | DT, BCN, Mintrab | Sueldo, meses, IMM, modalidad | Monto estimado, tope | Mes parcial, remuneracion variable | Depende de contrato/empresa | Tope, meses, cero | IMM | Medio | P1 |
| Vacaciones proporcionales | No existe | Crear o modular en finiquito | Dias devengados proporcionales por periodo | DT, BCN | Fechas, dias usados, sueldo | Dias/monto | Feriado progresivo, parcial | Orientativo | Fechas, negativos, redondeo | Sueldo usuario | Medio | P1 |
| Interes compuesto | No existe como tool | Crear | Capitalizacion con aportes | Metodologia interna; CMF educativa opcional | Capital, aporte, tasa, plazo | Saldo, aportes, interes | Tasa negativa, impuestos, inflacion | Rentabilidad no garantizada | Tasa cero, frecuencia | No | Medio | P1 |
| Deposito a plazo | No existe | Crear | Interes por plazo/tasa; opcion UF/pesos | CMF/SII si impuestos; bancos solo si se muestran tasas | Monto, plazo, tasa, moneda | Interes, monto final | Renovacion, impuestos, UF | No ranking de bancos | Tasa cero, plazo corto | UF/tasas | Medio | P2 |
| Horas extras | No existe | Crear | Valor hora y recargo pactado/legal | DT/Codigo Trabajo | Sueldo, jornada, horas, recargo | Monto bruto | Parcial, jornada excepcional | Depende contrato | Recargo, jornada invalida | No | Medio | P2 |
| Presupuesto mensual | No existe | Crear | Flujo caja y asignacion categorias | Metodologia editorial | Ingresos, gastos, deuda, metas | Disponible, alertas | Ingreso irregular, sobregiro | Educativo | Sumas, negativos | No | Bajo | P2 |
| Capacidad endeudamiento | No existe | Verificar | Ratio cuota/ingreso + deudas | CMF/educacion financiera | Ingresos, deuda, tasa, plazo | Cuota max, rango | Ingresos variables | No aprobacion | Ratio, cero ingreso | UF/tasa usuario | Alto | P2 |
| IGC | Parcial via OR | Extender/verificar | Tramos progresivos anuales y creditos | SII | Rentas, creditos, retenciones | Impuesto estimado | Rentas complejas | No reemplaza F22 | Tramos, exento | UTA/tramos | Alto | P2 |

## Reglas de implementacion

- Toda calculadora YMYL debe tener metodologia visible.
- Toda formula con resultado monetario requiere tests de borde.
- Si usa valores vivos, debe declarar fuente, fecha y fallback.
- Si la herramienta produce resultado personal, debe evitar lenguaje de recomendacion.
- Cada calculadora debe tener owner editorial o al menos una pieza explicativa de entrada.

## Decisiones

- `credito-consumo`, `dividendo-hipotecario` y `finiquito-indemnizacion` no son gaps de desarrollo; son gaps de integracion/editorial o auditoria.
- Nuevas calculadoras P1 reales: gratificacion, vacaciones proporcionales e interes compuesto.

## Pendientes

- Auditar estado actual de tickets MON-501, MON-503, MON-507, MON-509 si siguen abiertos.
- Crear briefs tecnicos por calculadora nueva.
- Definir si vacaciones vive como route propia o modulo de finiquito.

## Criterios de actualizacion

- Actualizar tras cada cambio en `src/config/calculatorPortfolio.ts`.
- Recalibrar prioridades con Search Console y eventos de calculadora.
