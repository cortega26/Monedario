# SEO roadmap 2026

Fecha: 2026-05-01

## Alcance

Roadmap editorial/tecnico para convertir oportunidades SEO en trabajo ejecutable sin degradar owners, rutas publicas ni controles YMYL.

## Fuentes usadas

- Los dos informes SEO entregados.
- Matriz `docs/operations/reports/seo/monedario-seo-opportunity-matrix-2026.md`.
- Owner map `docs/editorial/seo-owner-map-2026.md`.
- Repo local, scripts de package.json y auditoria `audit:topic-overlap`.

## Limitaciones

- No reemplaza el backlog de producto ni autoriza publicar contenido.
- Los sprints editoriales requieren briefs, dossier oficial, math audit/compliance cuando aplique.
- Las fechas son orden operativo, no compromiso de release.

## 5. Roadmap priorizado

### Sprint 0 - Verificacion y limpieza

Objetivo: evitar construir encima de datos falsos o duplicados.

Tareas:
- Verificar rutas actuales con inventario de `src/pages/guias/**`, `src/pages/calculadoras/**` y `src/data/blog/**`.
- Ejecutar `pnpm run audit:topic-overlap` y resolver candidatos fuertes.
- Resolver owner `operacion-renta-centro` vs `operacion-renta-f22-checklist`.
- Confirmar owners existentes en `src/config/editorial-topic-policy.mjs`.
- Revisar frontmatter `topicRole` y `canonicalTopic` en clusters endurecidos.
- Revisar calculadoras existentes antes de proponer nuevas.
- Confirmar que `credito-consumo`, `dividendo-hipotecario` y `finiquito-indemnizacion` ya existen.
- Crear tickets para gaps reales: PGU, gratificacion, sueldo imponible, IGC, contribuciones, fondo emergencia.

Salida esperada:
- Lista de owners confirmados.
- Lista de conflictos a consolidar.
- Briefs autorizables para P1.

### Sprint 1 - Consolidaciones de alto impacto

Temas ya cubiertos, pero con mejora o riesgo de dispersion:
- Sueldo liquido: reforzar relacion calculadora/articulo/liquidacion/descuentos; no crear segunda guia.
- Operacion Renta: separar hub, F22, devolucion, boleta y calculadora; decidir canonical anual.
- Boleta de honorarios: revisar consistencia metodologica y tasa visible; enlazar a OR y rentas mixtas.
- Seguro de cesantia: ampliar saldo AFC, CIC/FCS y subsidio fallback sin romper owner.
- DICOM/CMF: mantener diferencia entre informe oficial, DICOM coloquial y Boletin Comercial.
- APV/Cuenta 2: reforzar comparacion sin duplicar owner ni recomendar instrumento.
- UF/IPC/reajuste arriendo: mantener como cluster `uf-costo-de-vida`; no competir por dato puro.
- Finiquito: auditar calculadora, tests y owner antes de expandir vacaciones/indemnizacion.

### Sprint 2 - Gaps editoriales P1

Oportunidades con alto fit y baja/media complejidad:
- PGU: owner evergreen con requisitos, monto, calendario y fuente oficial.
- Gratificacion legal: owner con calculadora o brief de calculadora.
- Sueldo imponible: guia puente para sueldo/liquidacion/impuesto/APV.
- Impuesto Global Complementario: owner para personas naturales/rentas mixtas.
- Credito de consumo: owner editorial para calculadora existente.
- Contribuciones: tramite explicado para bienes raices, fechas y canales oficiales.
- Fondo de emergencia: owner de presupuesto/control financiero.
- Vacaciones proporcionales: satelite/tool vinculado a finiquito.
- Licencia medica rechazada: satelite si el owner actual no resuelve el caso.
- Subsidio de cesantia: fallback del cluster empleo.

### Sprint 3 - Calculadoras y herramientas

Prioridad de herramientas:

| Herramienta | Modelo conceptual | Fuentes oficiales necesarias | Inputs | Outputs | Edge cases | Disclaimers | Tests minimos | Valores actualizables | Riesgo de error | Prioridad |
|---|---|---|---|---|---|---|---|---|---|---|
| Gratificacion legal | Comparar modalidad legal y tope segun IMM | DT/BCN/Mintrab | Sueldo, meses, tipo contrato, IMM | Gratificacion estimada, tope, explicacion | Mes parcial, variable, empresa sin utilidad | Orientativo; contrato y modalidad pueden variar | Tope anual/mensual, cero, mes parcial | IMM | Medio | P1 |
| Vacaciones proporcionales | Dias devengados menos usados por periodo trabajado | DT/BCN | Fechas, dias usados, jornada | Dias y monto orientativo | Fraccion de mes, sueldo variable, feriado progresivo | No reemplaza finiquito oficial | Fechas limite, redondeo, negativos | Sueldo base usuario | Medio | P1 |
| Horas extras | Valor hora y recargo legal por jornada | DT/Codigo Trabajo | Sueldo, jornada, horas extra, recargo | Monto extra bruto | Jornada parcial, domingos/feriados, pactos | Depende de contrato/jornada | Recargo 50%, cero, jornada invalida | No central | Medio | P2 |
| Interes compuesto | Capitalizacion periodica con aportes | No normativa; metodologia interna | Inicial, aporte, tasa, plazo, frecuencia | Saldo proyectado, aportes, interes | Tasa negativa, inflacion, impuestos | No promete rentabilidad | Cero tasa, aporte mensual, frecuencia | Supuestos usuario | Medio | P1 |
| Deposito a plazo | Interes simple/compuesto por plazo/tasa | CMF/bancos si hay tasas reales | Monto, tasa, plazo, moneda | Interes bruto/neto orientativo | UF vs pesos, impuestos, renovacion | Tasas no son oferta | Plazos, tasa cero, impuesto | UF/tasas si se integran | Medio/Alto | P2 |
| Presupuesto mensual | Distribucion ingreso-gasto-meta | Metodologia editorial | Ingresos, gastos, metas, deuda | Flujo libre, categorias, alerta | Ingresos irregulares, deuda alta | Educativo, no asesor | Sumas, negativos, categorias vacias | No | Bajo | P2 |
| Capacidad de endeudamiento | Ratio cuota/ingreso y escenarios | CMF/educacion financiera | Ingreso, deudas, pie, tasa, plazo | Cuota maxima, rango vivienda | Ingreso variable, deudas omitidas | No aprueba credito | Ratio, cero ingreso, UF | UF/tasa usuario | Alto | P2 |
| IGC | Tramos anuales y creditos | SII | Rentas, retenciones, APV, creditos | Impuesto estimado/pago/devolucion | Rentas mixtas, arriendos, creditos | No reemplaza F22 | Tramos, exento, maximo | UTA/tramos | Alto | P2 |

### Sprint 4 - Estacionales 2026

Ver tambien `seasonal-calendar-2026.md`.

Prioridad:
- Operacion Renta, F22 y devolucion: preparar enero-febrero, publicar/actualizar marzo-abril.
- Retencion boletas: preparar diciembre-enero.
- Sueldo minimo: preparar ante ley/hito oficial.
- Contribuciones: preparar un mes antes de cuotas.
- UTM/IPC: revisar mensual si se muestran valores.
- PGU/reforma previsional: revisar ante hitos de implementacion y pagos.
- Aguinaldos/aporte familiar: solo si se decide cobertura anual recurrente.

### Sprint 5 - Hardening YMYL/E-E-A-T

Tareas:
- Fecha de ultima actualizacion visible donde corresponda.
- Fecha de corte normativa visible en todo YMYL nuevo/refrescado.
- Fuentes oficiales primarias en reglas criticas.
- Advertencia de no asesoria personalizada.
- Bloque de metodologia para calculadoras.
- Revision editorial y publish packet.
- Schema apropiado sin duplicados.
- Enlaces a fuentes oficiales y canales de tramite.
- Criterios de actualizacion por topic.
- Tests contra regresiones de calculadoras.
- Revision de claims financieros.
- Separacion entre educacion, calculo y recomendacion.

## Validacion ejecutada

| Comando | Resultado | Observaciones |
|---|---|---|
| `pnpm run audit:topic-overlap` | Pasa | Detecto 31 candidatos; principales: OR centro/F22, interes compuesto/metodologia y varios pares de cluster. Sin bloqueo. |
| `pnpm run check:context` | Pasa | `[check-context] OK. validated=4 invariantIds=40 contractIds=29`. |
| `pnpm run check:no-postid-urls` | Pasa | Escaneo 177 source files; no patrones forbidden de `post.id` en URLs publicas. |
| `pnpm run check:frontmatter` | Pasa | 44 articulos; 0 errores; nota esperada sobre transitional placement de presupuesto. |
| `pnpm run check:links` | Pasa con warnings | Sin links rotos; 5 articulos huerfanos ya existentes/reportados. |
| `pnpm run check:routes` | Pasa con additions reportadas | 5 rutas agregadas frente al baseline; no removals. No se crearon rutas en este trabajo. |
| `pnpm exec astro check` | Pasa | 0 errors, 0 warnings, 0 hints. |
| `pnpm run check:boundaries` | Pasa | 4 domain files scanned; boundary check passed. |
| `pnpm run check:docs` | Falla por estado basal | Falla por `CLAUDE.md` y `output/operations/data-signals/README.md` fuera de directorios permitidos; no lista los artefactos nuevos. |
| `pnpm run format:check` | Falla por estado basal | Prettier reporta `.github/FUNDING.yml`, `src/components/HeroHomepage.astro`, `src/components/SupportCallout.astro`, `src/data/blog/operacion-renta-centro.md`, `src/pages/apoyar.astro`, `src/pages/guias/impuestos-personas/operacion-renta/index.astro`; no lista los reportes nuevos. |
| `pnpm run test` | Falla por estado basal | 5 tests fallan en `tests/integration/homepage-content.test.ts` por artefactos existentes de `operacion-renta-centro` con status `PUBLISHED/APPROVED/REMEDIATED` cuando el test espera `UNPUBLISHED/BLOCKED/DRAFT`. |
| `pnpm run build` | Pasa | Build completo OK: imagenes, hero images, frontmatter, legal citations, `astro check`, Astro build, TOC i18n, editorial guard, Pagefind y URL check. |

## Decisiones

- Consolidar antes que crear en clusters maduros.
- Usar tools existentes como activos SEO, no redescubrirlas desde informes.
- Priorizar P1 por intencion resoluble y fit, no por volumen aislado.

## Pendientes

- Actualizar esta tabla con validacion final.
- Convertir P1 en briefs individuales.
- Incorporar GSC.

## Criterios de actualizacion

- Revisar al terminar cada sprint.
- Reordenar tras cambios de repo o Search Console.
