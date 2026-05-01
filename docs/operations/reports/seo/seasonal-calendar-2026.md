# Seasonal SEO calendar 2026

Fecha: 2026-05-01

## Alcance

Calendario editorial estacional para temas financieros chilenos con demanda concentrada o dependencia normativa.

## Fuentes usadas

- Informes SEO entregados.
- `src/data/blog/**`
- `src/pages/calculadoras/**`
- `docs/editorial/NORMA_YMYL.md`
- `context/EDITORIAL_AI_PIPELINE.md`

## Limitaciones

- Fechas especificas deben verificarse contra fuentes oficiales antes de publicar.
- Este calendario no autoriza crear paginas anuales sin decision canonical.

| Tema | Mes de preparacion | Mes de publicacion/actualizacion | Fecha de revision | Dueno editorial | Dependencia normativa | Fuentes oficiales | URL recomendada | Estrategia canonical |
|---|---|---|---|---|---|---|---|---|
| Operacion Renta 2026 | Enero-Febrero | Marzo-Abril | Semanal entre marzo y mayo | Impuestos personas | Calendario SII/TGR | SII, TGR, ChileAtiende | Hub OR actual + F22/devolucion | Hub evergreen/anual controlado; evitar duplicar F22 |
| Devolucion de impuestos | Febrero-Marzo | Abril-Mayo | Semanal durante pagos | Impuestos personas | Fechas de pago y compensaciones | SII, TGR | `/posts/devolucion-impuestos-fechas-compensaciones/` | Satelite anual bajo OR |
| Formulario 22 | Enero-Febrero | Marzo-Abril | Semanal en abril | Impuestos personas | Instrucciones F22 | SII | `/posts/operacion-renta-f22-checklist/` | Checklist, no hub competidor |
| Retencion boletas | Diciembre-Enero | Enero-Abril | Mensual Q1 | Impuestos personas | Tasa anual retencion/cotizaciones | SII, Prevision Social | `/posts/boleta-honorarios-2026-retencion-cobertura/` | URL anual si tasa en slug; planificar version siguiente |
| Sueldo minimo | Mes previo a ley/hito | Enero/Julio o hito legal | Ante publicacion oficial | Sueldo remuneraciones | Ley de reajuste IMM | Mintrab, Gob, DT, BCN | `/posts/sueldo-minimo-chile/` | Evergreen con tabla historica; no slug anual |
| Gratificacion legal | Enero y ante cambio IMM | Permanente | Cuando cambie IMM | Sueldo remuneraciones | IMM y Codigo del Trabajo | DT, BCN, Mintrab | Propuesta `/posts/gratificacion-legal-chile/` | Evergreen; valores actualizados |
| Contribuciones | Marzo, Junio, Septiembre, Noviembre | Mes de cuota | Antes de cada cuota | Impuestos personas | Calendario SII/TGR | SII, TGR, ChileAtiende | Propuesta `/posts/contribuciones-bienes-raices-chile/` | Evergreen con calendario vigente |
| UTM/UTA | Mensual | Mensual | Primeros dias del mes | UF/costo de vida + impuestos | Valores SII | SII | `/posts/utm-chile-que-es-como-funciona/` | Evergreen; evitar "hoy" si no hay auto update |
| IPC | Mensual | Mensual | Tras publicacion INE | UF/costo de vida | IPC oficial | INE, Banco Central | `/posts/que-es-el-ipc-chile-como-se-calcula/` | Evergreen con ejemplos actualizados |
| UF | Diario si se muestra valor; editorial mensual | Permanente | Mensual editorial | UF/costo de vida | Valor UF oficial | Banco Central, SII | `/posts/que-es-la-uf/`, `/calculadoras/conversor-uf/` | Tool para dato; articulo para concepto |
| Reajuste arriendo | Enero-Marzo y meses de renovacion | Permanente | Trimestral | UF/costo de vida | Contratos/IPC/UF | INE, Banco Central, BCN si aplica | `/posts/reajuste-arriendo-uf-ipc-chile/` | Evergreen; no anual |
| PGU/reforma previsional | Antes de hitos oficiales | Segun implementacion | Mensual durante cambios | Pensiones AFP | Reforma, montos, elegibilidad | IPS, ChileAtiende, SPensiones, BCN | Propuesta `/posts/pgu-pension-garantizada-universal/` | Evergreen con fecha de corte visible |
| Aguinaldos | Agosto | Septiembre | Al publicarse norma/monto | Beneficios si se decide | Ley/pago anual | IPS, Gob, ChileAtiende | Solo si se aprueba cobertura | URL anual o evergreen segun recurrencia |
| Aporte Familiar Permanente | Enero | Febrero-Marzo | Al publicarse nomina/fechas | Beneficios si se decide | Calendario IPS | IPS, ChileAtiende | Solo si se aprueba cobertura | Evergreen con ano en seccion, no necesariamente slug |

## Decisiones

- Operacion Renta requiere limpieza de owner antes de la proxima ola.
- Sueldo minimo debe ser evergreen, no una URL por ano.
- `valor hoy` solo se prioriza si existe mecanismo de actualizacion y valor agregado.

## Pendientes

- Confirmar fuentes oficiales por fecha exacta.
- Definir si beneficios estatales entran al scope editorial 2026.
- Crear runbook de actualizacion mensual para UTM/IPC/UF si se muestran valores.

## Criterios de actualizacion

- Revisar mensualmente.
- Actualizar inmediatamente ante cambios oficiales de impuestos, pensiones, sueldo minimo o valores indexados.
