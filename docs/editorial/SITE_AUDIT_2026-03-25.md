# Auditoría Integral de Carga Cognitiva, Arquitectura Editorial y Difusión Interna

Fecha de corte: 2026-03-25

Authority Check:
1. `docs/AI_ENGINEERING_CONSTITUTION.md`
2. `AGENTS.md`
3. `context/*.md`
4. `source code/comments`

Base de evidencia:
- Source audit en `src/pages/**`, `src/components/**`, `src/layouts/**`, `src/config/**`.
- Render audit en `dist/**/index.html`.
- Señales de ownership y overlap en `pnpm run audit:topic-overlap`.

## 1. Veredicto ejecutivo global

Monedario no tiene un problema aislado de una o dos páginas: tiene un patrón sistémico de sobre-orientación que termina generando desorientación. El sitio intenta ayudar demasiado en demasiadas capas a la vez: home, hubs, índices, módulos contextuales y artículos vuelven a ofrecer rutas vecinas o idénticas sin cambiar materialmente la decisión del usuario.

La falla estructural principal es doble:
- el mismo destino compite consigo mismo dentro de una misma vista;
- los componentes reutilizables de contexto (`ContextLinkSection`, `RelatedPosts`, `ArticleDecisionIntro`, `CalculatorCard`) reinyectan rutas vecinas y vuelven borrosa la frontera entre owner, support, reference y tool.

El resultado es inflación de opciones percibidas, canibalización editorial interna, sobrepromoción de ciertos owners y pérdida de una ruta dominante clara. Monedario hoy funciona mejor como inventario editorial que como sistema de orientación editorial profesional.

La corrección principal no es “agregar claridad visual” ni “mejorar copies” de forma cosmética. La corrección principal es rediseñar la arquitectura de decisión del sitio:
- una necesidad principal = una salida principal;
- un hub = una matriz de decisión, no tres;
- una herramienta = un paso concreto, no una opción repetida en varias capas;
- un artículo owner = una promesa dominante, no una pieza que compite con sus propias salidas soporte.

## 2. Hallazgos sistémicos priorizados por severidad

### Crítico — El sitio ofrece más opciones aparentes que opciones reales
- **Qué detectamos:** al menos 46 vistas renderizadas repiten uno o más destinos dentro de la misma página. El patrón aparece en `home`, hubs de guías, índice de calculadoras, índice de leyes y múltiples artículos.
- **Por qué es un problema:** el usuario percibe amplitud, pero recibe reiteración. La interfaz aparenta ayudar, pero en realidad lo obliga a validar si varias opciones son distintas o no.
- **Impacto concreto en el usuario:** relee, compara bloques semánticamente redundantes, duda antes de hacer clic y pierde el hilo de decisión.
- **Impacto editorial/arquitectónico:** mala distribución de atención, owners hiperpromocionados y baja eficiencia de descubrimiento del resto del corpus.
- **Principio violado:** “más opciones percibidas = más costo cognitivo”.
- **Recomendación precisa:** reducir la arquitectura de distribución a una sola capa dominante por vista. Si una página ya resolvió la decisión, no debe volver a resolverla en otro bloque.

### Crítico — Los hubs compiten con sus propias piezas núcleo
- **Qué detectamos:** `/guias/impuestos-personas/`, `/guias/pensiones-afp/`, `/guias/ahorro-e-inversion/`, `/guias/seguridad-financiera/`, `/guias/empleo-ingresos/` y `/guias/uf-costo-de-vida/` repiten sus owners dentro de listados, bloques “Empieza aquí” y bloques relacionados.
- **Por qué es un problema:** un hub profesional orienta; no enumera y reenumera la misma salida.
- **Impacto concreto en el usuario:** la página deja de tener una ruta principal inequívoca.
- **Impacto editorial/arquitectónico:** pseudo-hubs inflados. Se pierde la separación entre `core`, `related` y `bridge`.
- **Principio violado:** “todo bloque debe tener una función única”.
- **Recomendación precisa:** cada hub debe quedarse con tres zonas máximas: entrada, rutas núcleo, desvíos legítimos. Eliminar listados duplicados y bloques de onboarding redundantes.

### Crítico — El sistema de componentes amplifica ruido editorial en vez de contenerlo
- **Qué detectamos:** `src/components/ContextLinkSection.astro`, `src/components/RelatedPosts.astro`, `src/components/ArticleDecisionIntro.astro` y `src/components/CalculatorCard.astro` introducen o repiten salidas vecinas sin un control central de saturación por destino.
- **Por qué es un problema:** aunque una página esté bien planteada, estos componentes pueden volver a inflarla.
- **Impacto concreto en el usuario:** múltiples invitaciones a rutas cercanas que parecen todas “el siguiente paso correcto”.
- **Impacto editorial/arquitectónico:** la causa del problema ya no vive solo en páginas individuales; vive en el sistema de linking contextual.
- **Principio violado:** “todo CTA debe justificar su existencia”.
- **Recomendación precisa:** agregar política de budget de salidas por vista y budget por destino, más reglas para que `related/context/intro` no puedan repetir owners ya expuestos en la misma pantalla.

### Alto — El índice de calculadoras funciona como inventario multiplicado, no como selector eficiente
- **Qué detectamos:** `dist/calculadoras/index.html` repite varias calculadoras 3 a 5 veces entre “Empieza por tu situación” y el grid por familias.
- **Por qué es un problema:** una calculadora ya sugerida como decisión principal no necesita volver a competir como tarjeta normal sin cambio de contexto.
- **Impacto concreto en el usuario:** vuelve a evaluar herramientas ya sugeridas y aumenta esfuerzo de comparación.
- **Impacto editorial/arquitectónico:** el índice prioriza cobertura visual sobre economía de decisión.
- **Principio violado:** “una misma URL no debe competir varias veces por la misma decisión”.
- **Recomendación precisa:** mantener la guía rápida o el catálogo, pero no ambos con igual prominencia; si coexisten, el catálogo debe degradarse visualmente.

### Alto — La portada concentra y repite zonas editoriales ganadoras
- **Qué detectamos:** `dist/index.html` promociona guías principales en el hero lateral y vuelve a mandar varias de esas mismas secciones en zonas posteriores.
- **Por qué es un problema:** la home debería distribuir atención; hoy refuerza principalmente los mismos clusters duros.
- **Impacto concreto en el usuario:** sesgo hacia secciones ya dominantes y menor descubrimiento de superficies secundarias.
- **Impacto editorial/arquitectónico:** mala difusión del corpus completo.
- **Principio violado:** “la arquitectura debe distribuir atención, no concentrarla torpemente”.
- **Recomendación precisa:** desacoplar portada hero, rail de hubs y updates recientes para que cada zona cumpla una función distinta y no repita foco de cluster.

### Alto — El índice de leyes y algunas fichas usan duplicación mecánica como patrón de UI
- **Qué detectamos:** `src/pages/leyes/index.astro` enlaza cada ley desde el título y además desde `Ver ficha →`, duplicando el mismo destino en todas las tarjetas.
- **Por qué es un problema:** no agrega decisión; solo añade una segunda llamada idéntica.
- **Impacto concreto en el usuario:** más ruido clickeable por tarjeta.
- **Impacto editorial/arquitectónico:** normaliza la duplicación innecesaria como convención de catálogo.
- **Principio violado:** “una necesidad principal = una salida principal”.
- **Recomendación precisa:** hacer clickeable toda la tarjeta o el título, pero no duplicar un CTA textual al mismo destino.

### Alto — Hay clusters sanos en ownership, pero no en experiencia de navegación
- **Qué detectamos:** `pnpm run audit:topic-overlap` muestra ownership endurecido y owners únicos en varios frentes, pero la experiencia visible sigue reintroduciendo piezas vecinas como si todas fueran puertas de entrada equivalentes.
- **Por qué es un problema:** la política editorial está más madura que la UX real que la representa.
- **Impacto concreto en el usuario:** confunde piezas owner con support/reference/bridge.
- **Impacto editorial/arquitectónico:** la capa de navegación erosiona la política de no canibalización.
- **Principio violado:** “un owner no debe sobrerrepresentarse a costa de piezas hermanas” y “las demás piezas existen solo si cambian la necesidad”.
- **Recomendación precisa:** alinear todos los hubs y módulos contextuales con `TOPIC_OWNERSHIP_POLICY.md` y `NON_CANNIBALIZATION_PROCESS.md`.

### Medio — Múltiples artículos reinyectan siempre el mismo siguiente paso
- **Qué detectamos:** artículos como `cae-costo-real-credito-chile`, `renegociacion-superir`, `informe-deudas-cmf-vs-dicom`, `que-es-el-apv`, `liquidacion-de-sueldo` y otros repiten sistemáticamente links hacia vecinos duros varias veces en la misma vista.
- **Por qué es un problema:** transforma el artículo en un hub parcial, aunque ya existe un hub para eso.
- **Impacto concreto en el usuario:** pierde foco en la respuesta actual y se expone pronto a caminos laterales.
- **Impacto editorial/arquitectónico:** superposición entre artículos owner y hubs de cluster.
- **Principio violado:** “la repetición solo se tolera si cambia materialmente el contexto de decisión”.
- **Recomendación precisa:** limitar a un solo bloque de siguiente paso y un solo bloque de related real. No permitir repetición del mismo destino a través de intro + contexto + related + texto cuerpo.

## 3. Mapa global de duplicaciones y solapamientos

### Superficies con repetición visible del mismo destino en una misma vista

| Superficie | Ejemplo visible | Destino repetido | Repeticiones | Veredicto |
|---|---|---:|---:|---|
| `/guias/impuestos-personas/` | checklist F22 en listado + 2 bloques de inicio | `/posts/operacion-renta-f22-checklist/` | 3 | Eliminar duplicación dañina |
| `/guias/pensiones-afp/` | Cuenta 2 en hero + core + listado + “empieza aquí” | `/posts/que-es-la-cuenta-2-afp/` | 4 | Reestructurar hub |
| `/guias/pensiones-afp/` | reforma, fondos, APV, cambio AFP reaparecen 3 veces | varios owners | 3 | Fusionar bloques |
| `/guias/ahorro-e-inversion/` | todos los owners se repiten en listado + “Empieza aquí” | varios owners | 2 | Simplificar |
| `/guias/seguridad-financiera/` | las 3 piezas se repiten en listado + “Empieza aquí” | varios owners | 2 | Simplificar |
| `/guias/empleo-ingresos/` | los 3 owners se repiten en listado + “Empieza aquí” | varios owners | 2 | Simplificar |
| `/guias/uf-costo-de-vida/` | UF, IPC y arriendo aparecen como base + “Empieza aquí” | varios owners | 2 | Reducir |
| `/calculadoras/` | mismas calculadoras en guía rápida + catálogo por familia | varias tools | 3 a 5 | Reordenar IA |
| `/leyes/` | título de ficha + CTA “Ver ficha →” | cada ley | 2 | Eliminar CTA duplicado |
| `/guias/` | mismas secciones enlazadas desde navegación superior y tarjetas internas | hubs | 2 | Tolerable, pero revisar |
| `/` | hubs en rail + hubs reforzados indirectamente por portada y recientes | hubs principales | 2 | Rebalancear |

### Páginas individuales con reinyectado fuerte de rutas vecinas

| URL | Destinos repetidos | Señal |
|---|---|---|
| `/posts/cae-costo-real-credito-chile/` | `renegociacion-superir`, `informe-deudas-cmf-vs-dicom` | Artículo funciona como pseudo-hub de deuda |
| `/posts/renegociacion-superir/` | `informe-deudas-cmf-vs-dicom`, `cae-costo-real-credito-chile` | Reinyección circular entre owners vecinos |
| `/posts/informe-deudas-cmf-vs-dicom/` | `donde-ver-si-estoy-en-dicom-gratis`, `renegociacion-superir`, hub deuda | Saturación contextual |
| `/posts/que-es-el-apv/` | `calculadoras/apv`, `que-es-la-cuenta-2-afp` | APV compite con support y tool en exceso |
| `/posts/cuanto-descuenta-la-afp-de-tu-sueldo/` | `descuentos-de-sueldo`, `como-calcular-sueldo-liquido`, `liquidacion-de-sueldo` | Cluster sueldo sobrerelacionado |
| `/posts/liquidacion-de-sueldo/` | `descuentos-de-sueldo`, `sueldo-liquido`, `como-calcular-sueldo-liquido` | Repetición vecina alta |
| `/posts/operacion-renta-f22-checklist/` | `devolucion-impuestos-fechas-compensaciones` | Devolución reaparece como siguiente paso dominante |

## 4. Auditoría global de carga cognitiva

Escala `1` a `5`, donde `1 = muy deficiente` y `5 = muy claro`.

| Criterio | Nota | Justificación |
|---|---:|---|
| Claridad del punto de entrada | 3 | Home y hubs sí expresan temas, pero a menudo abren varias puertas equivalentes demasiado pronto. |
| Facilidad para elegir | 2 | El sistema obliga a comparar bloques y no solo contenidos. |
| Cantidad de opciones percibidas | 1 | La percepción de inventario es significativamente mayor que la cantidad real de decisiones. |
| Redundancia estructural | 1 | Repetición visible en hubs, índices, artículos y componentes contextuales. |
| Esfuerzo de comparación | 2 | El usuario tiene que distinguir entre owner, support, tool y bridge sin ayuda explícita suficiente. |
| Riesgo de releer | 4 | Muy alto en hubs e índices con bloques semánticamente parecidos. |
| Escaneabilidad | 3 | El sitio es legible, pero el escaneo no siempre produce una decisión clara. |
| Orientación de flujo | 2 | Falta una secuencia editorial dominante estable por superficie. |
| Balance de difusión | 2 | Se hiperpromocionan ciertos frentes y el resto del corpus queda subdistribuido. |

## 5. Diagnóstico global de arquitectura de información

### Lo que sí está bien
- El sitio tiene clusters editoriales explícitos y una política de ownership razonablemente madura.
- Existen intents diferenciados en el corpus y una base útil de hubs, calculadoras, glosario y leyes.
- La taxonomía editorial y los controles de no canibalización ya están más avanzados que en muchas implementaciones similares.

### Lo que está mal resuelto
- La IA visible no representa bien esa política. Hay demasiadas superficies que intentan orientar al mismo tiempo.
- Los hubs no siempre actúan como hubs; a veces actúan como catálogo + onboarding + related + pseudo-decision tree superpuestos.
- Los artículos owner no saben cuándo dejar de enlazar. Con frecuencia se comportan como un mini-hub adicional.
- La portada privilegia clusters duros ya fuertes, pero no gestiona de forma sobria el resto del ecosistema.
- Leyes y calculadoras usan convenciones de catálogo que multiplican interacciones sin necesidad.

### Diagnóstico de fondo
Monedario tiene una arquitectura editorial conceptualmente más ordenada que su UX real. La capa estratégica existe, pero la capa de interfaz todavía funciona con lógica acumulativa: si una salida es importante, se vuelve a mostrar. Ese criterio es incorrecto para un sistema orientado a decisión. En un sitio como Monedario, reforzar no es repetir; reforzar es clarificar el contexto exacto donde una salida sí corresponde.

## 6. Propuesta de reestructuración óptima del sistema editorial

### Regla madre
Cada vista debe elegir un solo rol dominante:
- **distribuir**
- **decidir**
- **explicar**
- **resolver**

No debe intentar cumplir más de dos a la vez.

### Reestructuración por nivel

#### Home
- Mantener hero + un rail de clusters + una zona de actualizaciones.
- Evitar que la misma sección/hub quede reforzada otra vez si ya domina el hero.
- Introducir rotación o budget de exposición para clusters no visibles en hero.

#### Hubs
- Estructura máxima:
  1. definición breve del problema del cluster
  2. bloque `Rutas principales`
  3. bloque `Si tu duda cambió`
  4. cierre de vigencia y errores comunes
- Eliminar listados completos cuando repliquen exactamente las rutas núcleo.
- `related` solo cuando cambie de verdad la necesidad o el momento del usuario.

#### Índice de calculadoras
- Mantener una guía de entrada o el catálogo por familias, pero no ambos con el mismo peso.
- Si se conserva la guía rápida, el catálogo debe convertirse en archivo secundario, no en segunda capa de decisión.

#### Índice de leyes
- Hacer la tarjeta o el título el único punto principal de entrada.
- Quitar el CTA redundante al mismo destino.

#### Artículos
- Permitir un solo bloque de “siguiente paso” y un solo bloque de “también puede interesarte”.
- Introducir un control de saturación para que el mismo destino no aparezca en:
  - intro de decisión
  - contexto
  - cuerpo
  - related
  dentro de una misma vista.

#### Sistemas de soporte
- `glosario`, `leyes`, `tags` y `search` deben dejar claro si son:
  - navegación de inventario
  - referencia
  - o guía de decisión
- `tags` debe permanecer noindex y utilitario, sin intentar competir con hubs.

## 7. Wireframe textual propuesto del sistema de navegación/editorial

### Home
- **Objetivo:** distribuir el sitio sin sobrerrepresentar un único cluster.
- **Contenido:** hero de entrada, 4-5 hubs máximo, 1 zona de recientes, 1 salida a calculadoras.
- **Cantidad recomendada de enlaces principales:** 7 a 10.
- **Función:** mapa editorial inicial.

### Hub
- **Objetivo:** convertir una duda temática en una decisión concreta.
- **Contenido:** intro breve, 3-5 rutas núcleo, 1 bloque de desvíos, cierre.
- **Cantidad recomendada de enlaces principales:** 4 a 6.
- **Función:** selector de ruta correcta.

### Artículo owner
- **Objetivo:** resolver la necesidad dominante.
- **Contenido:** respuesta rápida, contenido principal, un único siguiente paso.
- **Cantidad recomendada de enlaces de orientación principal:** 1 a 3.
- **Función:** resolución.

### Calculadora
- **Objetivo:** convertir lectura en acción.
- **Contenido:** framing, inputs, resultado, un puente editorial opcional.
- **Cantidad recomendada de enlaces secundarios:** 0 a 2.
- **Función:** ejecución puntual.

### Referencia
- **Objetivo:** definir o documentar sin competir por la decisión.
- **Contenido:** ficha, enlaces oficiales, salidas limitadas.
- **Cantidad recomendada de enlaces principales:** 1.
- **Función:** soporte.

## 8. Reescritura sugerida de labels, microcopy y CTAs críticos

### Patrones a eliminar
- `Temas que puedes revisar`
- `Empieza aquí si...` cuando ya existe otra capa de decisión arriba
- `Leer artículo` como CTA genérico en hubs
- `Ir a la guía relacionada` cuando la relación real no está explicitada
- `Ver ficha →` si el título ya enlaza al mismo destino

### Reemplazos sugeridos
- `Temas que puedes revisar` -> `Rutas principales`
- `Empieza aquí si...` -> `Si tu caso es este`
- `Leer artículo` -> `Resolver esta duda`
- `Ir a la guía relacionada` -> `Ir si tu duda cambió`
- `Ver ficha →` -> eliminar

### Principio de reescritura
Cada CTA debe decir:
- qué decisión ayuda a tomar;
- para quién corresponde;
- por qué ese destino y no otro.

## 9. Plan de cambios ejecutable por fases

### Fase 1 — Contención del ruido más costoso
- Rediseñar hubs con duplicación dañina: `impuestos-personas`, `pensiones-afp`, `ahorro-e-inversion`, `seguridad-financiera`, `empleo-ingresos`, `uf-costo-de-vida`.
- Eliminar repetición del mismo owner dentro de una misma vista.
- Quitar CTAs redundantes en `/leyes/`.

### Fase 2 — Reordenamiento de superficies distribuidoras
- Rebalancear home para no reforzar dos veces los mismos clusters.
- Rehacer `/calculadoras/` como selector sobrio.
- Revisar `/guias/` para que actúe como mapa de entrada y no repita innecesariamente hubs ya dominantes.

### Fase 3 — Hardening del sistema de linking contextual
- Definir budget por vista para `ContextLinkSection`, `RelatedPosts`, `ArticleDecisionIntro`, `CalculatorCard`.
- Prohibir repetición del mismo destino entre módulos contextuales de una misma página.
- Distinguir explícitamente `owner`, `support`, `reference` y `tool` también en UX.

### Fase 4 — Limpieza del corpus de artículos
- Auditar owners con linking circular o reinyectado fuerte.
- Recortar módulos contextuales repetitivos.
- Reescribir microcopy de siguientes pasos para que cambie materialmente la necesidad o desaparezca.

## 10. Criterios de aceptación globales

- Ningún destino importante compite consigo mismo dentro de una misma vista sin justificación fuerte.
- Cada hub tiene una ruta principal inequívoca.
- Cada bloque de navegación tiene una función única y diferenciable.
- El sitio reduce decisiones percibidas en home, hubs, índices y artículos owner.
- Las piezas owner quedan claramente separadas de comparativas, tools y references.
- Los módulos contextuales no repiten un destino ya expuesto como ruta principal en la misma vista.
- El backlog deja trazabilidad clara y accionable de cada remediación.

---

## Anexos por superficie

### Anexo A — Home y navegación global
- **Defecto principal:** la home sí orienta, pero repite y refuerza frentes ya fuertes.
- **Competencia visible:** hubs principales vuelven a aparecer entre hero, rail y recientes.
- **Acción correctiva:** separar función de hero, rail temático y recientes.

### Anexo B — Hubs `/guias/**`
- **Defecto principal:** patrón repetido de listado + onboarding + related.
- **Casos más severos:** `pensiones-afp`, `impuestos-personas`, `ahorro-e-inversion`.
- **Acción correctiva:** simplificar a intro + rutas núcleo + desvíos legítimos.

### Anexo C — Índice de calculadoras
- **Defecto principal:** el mismo destino reaparece entre selector inicial y catálogo.
- **Acción correctiva:** conservar solo una capa primaria de decisión.

### Anexo D — Índice de leyes
- **Defecto principal:** duplicación mecánica de cada ficha.
- **Acción correctiva:** una sola salida primaria por tarjeta.

### Anexo E — Glosario, tags y search
- **Glosario:** funciona más como referencia que como orientación; no es el principal problema sistémico.
- **Tags:** mantener como utilitario, no como superficie de decisión.
- **Search:** superficie neutral; el riesgo principal es semántico, no estructural.

### Anexo F — Patrones en artículos individuales
- **Cluster deuda:** linking circular y saturación entre CMF, DICOM, renegociación y CAE.
- **Cluster sueldo:** owners vecinos se reinyectan entre sí demasiado pronto.
- **Cluster previsión/APV:** APV y Cuenta 2 compiten repetidamente.
- **Cluster impuestos:** F22 domina en exceso y absorbe dudas vecinas.

### Anexo G — Señales de canibalización/solapamiento del corpus
- `pnpm run audit:topic-overlap` detecta `21` candidatos de revisión.
- Pares de mayor vigilancia:
  - `seguro-de-cesantia` vs `seguro-cesantia-cuenta-individual-vs-fondo-solidario`
  - `como-calcular-sueldo-liquido` vs `descuentos-de-sueldo`
  - `que-es-el-ipc-chile-como-se-calcula` vs `que-es-la-uf`
  - `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026` vs `fondos-mutuos-comisiones-rescate-impuestos`
- **Lectura correcta:** no todos son duplicados; varios son owners/support válidos mal representados por la UX.
