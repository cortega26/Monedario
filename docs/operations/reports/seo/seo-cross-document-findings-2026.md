# SEO cross-document findings 2026

Fecha: 2026-05-01

## Alcance

Cruce critico entre:
- Doc 1: `/home/carlos/Descargas/Monedario.cl_ Oportunidades SEO Financieras.md`
- Doc 2: `/home/carlos/Descargas/deep-research-report (7).md`
- Repo Monedario al 2026-05-01.

Este artefacto no autoriza publicar contenido YMYL. Cualquier nueva pieza o refresh sustantivo requiere `docs/editorial/NORMA_YMYL.md` y `context/EDITORIAL_AI_PIPELINE.md`.

## Fuentes usadas

- Informes externos entregados por el usuario.
- `docs/AI_ENGINEERING_CONSTITUTION.md`
- `context/INVARIANTS.md`
- `context/CONTRACTS.md`
- `context/EDITORIAL_AI_PIPELINE.md`
- `docs/editorial/NORMA_YMYL.md`
- `docs/editorial/NON_CANNIBALIZATION_PROCESS.md`
- `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`
- `docs/research/seo/strategy/topic_ownership_matrix.md`
- `src/config/editorial-topic-policy.mjs`
- `src/config/clusters.ts`
- `src/config/editorial-hub-model.mjs`
- `src/config/calculatorPortfolio.ts`
- `src/data/blog/**`
- `src/pages/guias/**`
- `src/pages/calculadoras/**`
- `package.json`
- Salida local de `pnpm run audit:topic-overlap`

## Limitaciones

- No se usaron datos directos de Google Ads, Ahrefs, Semrush ni GSC en esta fase.
- No se verificaron montos, tasas ni reglas 2026 en fuentes oficiales externas; quedan como dependencias antes de publicar.
- La cobertura se verifico contra repo local, no contra indexacion real ni rankings actuales.
- Los informes externos son insumos estrategicos, no fuentes normativas.

## 1. Perfil critico de los dos documentos

| Documento | Fortalezas | Debilidades | Mejor uso | Riesgo si se usa mal | Peso recomendado |
|---|---|---|---|---|---|
| Doc 1: `Monedario.cl_ Oportunidades SEO Financieras.md` | Radar amplio de demanda; buen universo semantico; identifica estacionalidad, calculadoras y temas laborales/tributarios/previsionales; explicita no competir con tramites puramente oficiales. | Declara crawl fallido y asume "Brecha Total"; usa volumentria estimada como si fuera mas firme de lo que el repo permite; algunas fuentes son competidores o secundarias; alto riesgo de duplicar activos ya existentes. | Radar de demanda, taxonomia de oportunidades, senales de estacionalidad, inspiracion para calculadoras y anti-requisitos. | Crear articulos o herramientas que ya existen; sobreponderar keywords gigantes como `valor UF hoy`; romper owners por perseguir volumen. | 35% para demanda y packaging; 10% para cobertura actual. |
| Doc 2: `deep-research-report (7).md` | Mucho mas preciso sobre arquitectura actual: hubs, calculadoras, clusters, owners y cobertura; evita volumenes exactos inventados; detecta canibalizacion y "segundo clic"; prioriza gaps de intencion. | Tambien tiene desfases frente al repo actual: algunas calculadoras que marca ausentes ya existen (`finiquito-indemnizacion`, `credito-consumo`, `dividendo-hipotecario`); algunas URLs quedan no confirmadas aunque existen localmente. | Cobertura actual, priorizacion, owner map, reglas de canibalizacion, decisiones entre crear/mejorar/consolidar. | Tratar su inventario como definitivo sin inspeccion del repo; crear owners editoriales para tools que ya existen pero carecen de articulo o hub entry. | 65% para cobertura y priorizacion; 35% para demanda cualitativa. |

### 1.1 Senales fuertes coincidentes

| Senal coincidente | Lectura operativa |
|---|---|
| Sueldos y remuneraciones tienen demanda recurrente y alto fit | Mantener `sueldo-liquido` como activo estrella; crecer por satelites diferenciados: gratificacion, sueldo imponible, horas extra, vacaciones proporcionales. |
| Operacion Renta y boletas son estacionales y YMYL alto | Consolidar hub anual, calendario y owner de F22/devolucion/honorarios; no abrir URLs anuales sin politica canonical. |
| Pensiones, AFP, PGU y reforma tienen demanda fuerte por cambios regulatorios | Crear owner PGU solo con fuentes oficiales y fecha de corte; reforzar reforma/fondos/comisiones sin recomendar AFP. |
| Deuda, DICOM, CMF y credito tienen dolor usuario alto | Consolidar DICOM/CMF como diagnostico; credito de consumo requiere owner editorial aunque la calculadora ya existe. |
| Calculadoras son moat editorial | Priorizar calculadoras donde la intencion sea numerica, pero revisar primero el portafolio existente para no duplicar. |
| Seguridad financiera debe ser defensiva y accionable | Mantener foco en protocolos y ley de fraudes; evitar promesas de recuperacion o asesorias legales personalizadas. |
| Evitar keywords navegacionales puras | No competir con logins bancarios, ClaveUnica pura, portales oficiales de ejecucion o widgets sin contexto. |

### 1.2 Senales complementarias

| Caso | Aporte doc 1 | Aporte doc 2 / repo | Decision |
|---|---|---|---|
| `gratificacion legal` | Demanda alta y calculo recurrente. | No aparece como owner ni calculadora en repo; existe glosario `gratificacion`. | Crear P1 con calculadora + owner satelite bajo sueldo. |
| `PGU` | Demanda alta por reforma. | Cluster pensiones existe, pero no owner PGU. | Crear P1 evergreen con calendario y fuentes IPS/ChileAtiende/SPensiones. |
| `sueldo liquido` | Head term masivo. | Repo ya tiene articulo owner y calculadora. | Mejorar/consolidar, no crear nuevo. |
| `finiquito` | Necesidad de calculadora. | Repo ya tiene articulo owner y calculadora; auditoria previa detecto bug P1 historico. | Consolidar y auditar antes de ampliar. |
| `dividendo hipotecario` | Tool intent fuerte. | Repo ya tiene calculadora y articulo hipotecario. | Crear/mejorar owner satelite editorial para la calculadora, no otra tool. |
| `credito de consumo` | Demanda y comparacion CAE. | Repo ya tiene calculadora; falta owner editorial fuerte. | Crear owner editorial P1 y enlazar calculadora. |
| `interes compuesto` | Tool evergreen. | Repo tiene articulo owner + nota metodologica; no calculadora dedicada. | Convertir en calculadora P1/P2 con disclaimers. |
| `presupuesto mensual` | Buen TOFU de control financiero. | Hub existe; `como-hacer-presupuesto-mensual-chile` migró a `cluster: presupuesto-control-financiero` el 2026-05-11 y `fondo-emergencia-chile` actúa como satélite publicado. | No duplicar guía; siguiente mejora natural sería herramienta/checklist de presupuesto si hay señal suficiente. |

### 1.3 Senales conflictivas

| Conflicto | Resolucion con repo | Accion |
|---|---|---|
| Doc 1 asume gap total para todo Monedario. | Repo tiene 44 articulos, 9 hubs tematicos y 16 calculadoras publicas. | Usar doc 1 solo como radar; toda cobertura se decide por repo. |
| Doc 1 propone crear sueldo liquido, boleta, operacion renta, seguro cesantia, DICOM/CMF, APV y UF como si no existieran. | Todos tienen cobertura o herramientas existentes. | Mejorar/consolidar, no crear duplicados. |
| Doc 2 marca algunas tools como ausentes o no inequivocas. | Repo confirma `/calculadoras/finiquito-indemnizacion/`, `/calculadoras/credito-consumo/`, `/calculadoras/dividendo-hipotecario/`, `/calculadoras/tarjeta-credito/`. | Actualizar roadmap: prioridad es owner/editorial integration, no desarrollo desde cero. |
| Ambos empujan Operacion Renta, pero repo tiene varias superficies (`operacion-renta-centro`, F22, devolucion, calculadora). | `audit:topic-overlap` detecta posible same-intent `operacion-renta-centro` vs `operacion-renta-f22-checklist`. | Sprint 0 debe resolver owner hub vs checklist antes de crear mas. |
| Ambos ven inversion/APV como oportunidad alta. | Policy local dice APV vive en `ahorro-e-inversion`; pensiones solo lo enlaza como related. | Respetar owner APV y no duplicarlo en pensiones. |
| Doc 1 propone competir por `valor UF hoy` y `valor UTM`. | Repo tiene `uf-costo-de-vida`, conversor UF y UTM; SERP de dato puro tiene moat bajo. | Enfocar en segundo clic: contratos, arriendo, impuestos, calculadoras con metodologia. |

## 3. Oportunidades reforzadas por cruce de documentos

| Oportunidad | Doc 1 | Doc 2 | Valor del cruce | Decision editorial/tecnica | Owner propuesto | Activos relacionados | Riesgo canibalizacion | Primer paso implementable |
|---|---|---|---|---|---|---|---|---|
| Gratificacion legal | Alta demanda y calculadora con tope legal. | Gap claro high-fit. | Demanda + ausencia real. | Crear owner + calculadora. | `/posts/gratificacion-legal-chile/` + `/calculadoras/gratificacion-legal/` propuestos. | Sueldo liquido, liquidacion, sueldo minimo, glosario gratificacion. | Medio con sueldo liquido si promete calcular todo el sueldo. | Brief editorial + modelo de formula con DT/BCN. |
| PGU | Demanda por reforma y aumento. | Mayor gap previsional. | Tema masivo, institucional y enlazable desde reforma. | Crear guia evergreen con fecha de corte. | `/posts/pgu-pension-garantizada-universal/` propuesto. | Reforma previsional, simulador jubilacion, pensiones hub. | Medio con reforma previsional si repite calendario completo. | Dossier oficial IPS/ChileAtiende/SPensiones. |
| Sueldo liquido | Head term gigante. | Ya cubierto con articulo y calculadora. | No hay que crear, hay que defender owner. | Mejorar interlinking, long-tail y metodologia. | `/calculadoras/sueldo-liquido/` funcional; `/posts/como-calcular-sueldo-liquido/` explicativo. | Descuentos, liquidacion, AFP, impuesto segunda. | Alto si gratificacion/horas extra capturan head term. | Auditoria de title/meta e interlinks. |
| Operacion Renta | Pico masivo anual. | Cubierta pero con canibalizacion posible. | Prioridad es jerarquia, no volumen. | Consolidar hub y satelites. | Hub `/guias/impuestos-personas/` o centro OR; F22 como checklist. | Calculadora OR, boleta, devolucion, rentas mixtas. | Alto. | Resolver owner `operacion-renta-centro` vs `operacion-renta-f22-checklist`. |
| Credito de consumo | Oportunidad alta de decision. | Calculadora existe; owner editorial debil. | Crear articulo, no tool. | Crear owner evergreen y enlazar tool. | `/posts/credito-consumo-chile-cae-costo-total/` propuesto. | CAE, tarjeta, prepago, deuda hub. | Medio con CAE generico. | Brief owner con separacion CAE universitario. |
| Dividendo hipotecario | Tool intent alto. | Calculadora existe; articulo hipotecario existe. | Falta entrada editorial especifica. | Crear satelite tool-led. | `/posts/calcular-dividendo-hipotecario-chile/` propuesto. | Credito hipotecario, conversor UF, prepago. | Medio con credito hipotecario general. | Crear artifact brief, no cambiar calculadora. |
| Fondo de emergencia | Fit educativo y evergreen. | Gap en presupuesto/control. | Puede activar hub presupuesto sin YMYL duro. | Crear owner o satelite fundacional. | `/posts/fondo-emergencia-chile/` propuesto. | Presupuesto mensual, ahorro inversion, deuda. | Bajo. | Definir si es owner de mini-hub o satelite de presupuesto. |
| Interes compuesto | Tool evergreen en ahorro. | Articulo + metodologia existentes; falta calculadora. | Mejor convertir contenido en herramienta. | Crear calculadora; mantener articulo como owner pedagogico. | `/calculadoras/interes-compuesto/` propuesto; owner actual articulo. | APV, DAP, presupuesto, ahorro. | Medio si la calculadora promete rentabilidad. | Modelo conceptual con supuestos editables y disclaimer. |
| Vacaciones proporcionales | Calculo laboral recurrente. | Gap claro; puede vivir dentro de finiquito pero merece tool. | Mejor herramienta satelite, no nuevo pilar amplio. | Crear calculadora satelite o modulo dentro de finiquito. | `/calculadoras/vacaciones-proporcionales/` propuesto. | Finiquito, indemnizacion, empleo hub. | Medio con finiquito. | Decidir modulo vs route propia con owner finiquito. |
| Sueldo imponible | Concepto puente. | Gap owner. | Baja complejidad, alto efecto en comprehension. | Crear glosario ampliado o guia corta. | `/posts/sueldo-imponible-chile/` propuesto. | Sueldo liquido, impuesto segunda, AFP, salud. | Medio con bruto/liquido. | Definir como support de sueldo liquido. |

## 6. Clasificacion de acciones

### Crear ahora

P0/P1 sin cobertura suficiente y alto fit:
- PGU.
- Gratificacion legal.
- Sueldo imponible.
- Credito de consumo owner editorial.
- Fondo de emergencia.
- Impuesto Global Complementario owner.
- Contribuciones bienes raices como tramite explicado.

### Mejorar ahora

Contenidos existentes con demanda clara:
- Sueldo liquido.
- Operacion Renta/F22/devolucion.
- Boleta de honorarios.
- Seguro de cesantia.
- DICOM/CMF.
- APV/Cuenta 2.
- UF/IPC/reajuste arriendo.
- Finiquito e indemnizaciones.

### Consolidar antes de crear

Temas donde mas contenido puede empeorar el cluster:
- Operacion Renta vs F22 vs devolucion.
- Sueldo liquido vs liquidacion vs descuentos AFP.
- APV vs Cuenta 2 vs pensiones.
- DICOM gratis vs informe CMF vs boletin comercial.
- Interes compuesto articulo vs nota metodologica vs futura calculadora.

### Convertir en calculadora/herramienta

- Gratificacion legal.
- Vacaciones proporcionales.
- Horas extras.
- Interes compuesto.
- Deposito a plazo.
- Presupuesto mensual.
- Capacidad de endeudamiento.

### Dejar como satelite

- Bonos no imponibles.
- Colacion y movilizacion imponible.
- Saldo AFC.
- Licencia medica rechazada.
- AFP mas barata, si se resuelve como apoyo del comparador de comisiones.
- Arriendo vs dividendo, si no se abre cluster vivienda.

### No priorizar todavia

- Login bancario o SII/ClaveUnica pura.
- Cripto/trading/forex.
- Tramites oficiales sin capa explicativa propia.
- Noticias diarias de dolar/IPSA.
- Derecho laboral litigioso avanzado.
- Subsidios habitacionales profundos, hasta decidir si vivienda sera cluster propio.

## 7. Riesgos si se ejecuta mal

- Crear duplicados por creer el "gap absoluto" del doc 1.
- Diluir owners existentes con satelites que usen la misma promesa de H1.
- Competir contra SII, AFC, IPS, DT, CMF o ChileAtiende sin agregar calculo, checklist o decision.
- Usar volumenes especulativos como datos exactos.
- Sobredimensionar temas estacionales y dejar URLs muertas el resto del ano.
- Crear calculadoras sin modelo validado, edge cases ni fuentes oficiales.
- Publicar YMYL sin fecha de corte visible.
- Mezclar educacion financiera con recomendacion personalizada.
- Usar fuentes secundarias cuando existe fuente oficial.
- Crear paginas anuales sin politica canonical y sin regla de actualizacion.
- Debilitar clusters existentes por exceso de contenido.
- Asumir que toda herramienta ausente en un informe sigue ausente en repo.

## 7.1 Anti-requisitos

- No crear articulos nuevos para cada keyword sin revisar owner.
- No asumir gap total solo porque un documento lo dijo.
- No inventar volumenes exactos si no hay fuente directa.
- No recomendar AFP, APV, fondos, creditos o inversiones de forma personalizada.
- No crear paginas de "valor hoy" sin mecanismo de actualizacion.
- No competir con logins, certificados puramente navegacionales o portales oficiales de ejecucion.
- No romper rutas publicas ni derivar URLs desde `post.id` (`URL.PUBLIC.NO_POST_ID`).
- No cambiar arquitectura sin decision en owner map, matriz y backlog.
- No usar benchmarks o competidores como fuente de verdad YMYL.
- No marcar gates editoriales como aprobados sin separacion de deberes.

## Decisiones

- Doc 1 se usa como demanda y radar, con peso bajo para cobertura.
- Doc 2 se usa como cobertura/priorizacion, pero repo gana ante contradiccion.
- La estrategia prioriza owners y calculadoras existentes antes que expansion de URLs.

## Pendientes

- Cruce con Google Search Console real.
- Verificacion oficial de montos/reglas antes de briefs YMYL.
- Auditoria manual de SERP por P0/P1 antes de publicar.
- Resolver ownership de Operacion Renta centro vs F22.

## Criterios de actualizacion

- Actualizar despues de cada sprint editorial o cambio en `src/config/editorial-topic-policy.mjs`.
- Recalibrar prioridades cuando existan datos GSC por cluster.
- Revisar trimestralmente o ante cambios regulatorios mayores.
