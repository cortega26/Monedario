# Revisión integral de cumplimiento — rentas mixtas — round 10

Fecha de revisión: 2026-10-02  
Versión auditada: `src/data/blog/rentas-mixtas-sueldo-honorarios.md`, estado actual y `git diff HEAD`.  
Alcance de escritura: únicamente este informe. No edité artículo, registro, packet ni gates.

**Veredicto holístico: PASS — 9,58/10.** La versión revisada cumple los MUST de NORMA_YMYL §§1.1 y 5.1–5.4, la estructura y el ejemplo exigidos por DoD §2, y supera el umbral de §7. Registro y vigencia están alineados. Dejo documentados los límites de recuperación de tres fuentes y la consulta de AT2027; no cambian los claims centrales confirmados.

## Alcance y método

Contrasté el artículo actual con su `git diff HEAD`, el registro `src/data/correcciones.json`, la ruta `/correcciones/` y los changelogs del run. Apliqué `docs/editorial/NORMA_YMYL.md` §§1.1, 5.1–5.4 y 7, y `docs/editorial/DEFINITION_OF_DONE.md` §2. Los informes de rondas anteriores se consideraron solo contexto, nunca prueba de vigencia.

Refetcheé fuentes primarias oficiales el 2026-10-02. Ejecuté únicamente el gate solicitado `pnpm run check:correcciones`; no ejecuté tests ni creé o edité un `05-*`.

## Hallazgos y comprobaciones

### Estructura, respuesta y ejemplo

- Está presente el H2 `## Qué es y qué cambia con las rentas mixtas`. También están `Paso a paso`, `Casos frecuentes`, `Errores comunes`, `Preguntas frecuentes` y `Fuentes y vigencia normativa`, junto con un único título/H1 que corresponde a la intención del artículo.
- El resumen visible responde con el umbral AT2026 de 13,5 UTA / `$11.265.804`, la condición de otras obligaciones y la posibilidad de presentar para pedir devoluciones. La FAQ SII 0972, actualizada el 27-03-2026, fija la regla para honorarios en rentas imponibles antes de deducciones superiores a 13,5 UTA; la Guía Práctica SII AT2026 confirma el equivalente en pesos y la opción voluntaria bajo el umbral. La tabla anual oficial confirma que hasta `$11.265.804` el IGC está exento.
- El ejemplo AT2026 usa exactamente la cifra oficial del umbral y explica su efecto general. No produce monto de impuesto, saldo, devolución ni resultado individual; no encontré una cifra calculada nueva en el diff.
- La tabla de IGC en el artículo contiene los tramos en UTA y sus tasas marginales —incluidos 13,5/30/50/70/90/120/310 UTA y 4/8/13,5/23/30,4/35/40%— y ya no incluye la columna de máximas efectivas redondeadas. Coincide con la tabla anual AT2026 para personas naturales del SII. La tabla SII de Segunda Categoría 2026 también se refetcheó: es una tabla periódica de IUSC con factores y tasas marginales, y publica máximas efectivas con dos decimales; no se usó para sustituir la tabla anual de IGC, que está enlazada por separado. No detecté una tasa marginal o límite anual discordante.

### Claims tributarios y previsionales

| Claim revisado | Evidencia primaria recuperada | Resultado |
|---|---|---|
| Obligación y umbral | [SII FAQ 0972](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_0972.htm); [Guía Práctica AT2026](https://www.sii.cl/servicios_online/renta/guia_practica_renta_2026.pdf); [valores Personas Naturales AT2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html) | Correcto y acotado a AT2026. FAQ 0972 distingue rentas imponibles antes de deducciones; la guía y la tabla confirman el tramo exento y la opción voluntaria para recuperar retenciones/créditos. El texto conserva la salvedad de otras obligaciones. |
| Propuesta F22 | [SII FAQ 2772](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2772.htm), actualizada el 10-04-2026 | Correcto: la propuesta se confecciona con antecedentes enviados por agentes retenedores e informantes; si son incorrectos o incompletos, se puede pedir rectificación y modificar la propuesta. |
| Base imponible | [Guía Práctica AT2026](https://www.sii.cl/servicios_online/renta/guia_practica_renta_2026.pdf); [Formulario 22 AT2026](https://www.sii.cl/ayudas/formularios/f22_at2026.pdf) | Correcto: F22 separa honorarios e ingresos brutos de gastos efectivos/presuntos y del total de rentas. El artículo explica que el IGC se aplica a la base que corresponda, no directamente al bruto de boletas. |
| Tasa de boletas | [SII — Boletas de honorarios](https://www.sii.cl/destacados/boletas_honorarios/) | La página publica 14,5% para 2025, 15,25% para 2026 y 16% para 2027. Las menciones del artículo limitan 14,5% a boletas emitidas en 2025 y al AT2026. |
| APV Régimen A | [SPensiones, Compendio, Capítulo XII](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2909.html), nums. 5–7 | La página en vivo confirma destino de los aportes a anticipar/incrementar pensión, bonificación de 15%, tope de 6 UTM y límite elegible de 10 veces las cotizaciones obligatorias del mismo año. El artículo incluye las condiciones en el bloque APV y la FAQ. |
| APV Régimen B y límite agregado | [Instrucciones F22 AT2026, Línea 23](https://www.sii.cl/servicios_online/renta/2026/archivos/l23_instruccion.pdf), §23.4, más extracción local completa indicada abajo | La extracción confirma sublímite de 50 UF mensual para descuento por empleador, límite conjunto de 600 UF, orden APV B mensual vía empleador → APV B directo → APV A, y que el exceso no se acoge a esos regímenes. Coincide con el texto. |
| Capítulo XI | [SPensiones, Compendio, Capítulo XI](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html) | La fuente identifica el capítulo como tributación y bonificación del APV colectivo (APVC). El artículo lo usa solo para ese contexto y cita el Capítulo XII para APV general. |
| Convenio TGR | [TGR — Convenios de pago](https://tgr.gob.cl/convenios-de-pago/) y `source-observation-tgr-2026-10-02.txt` del run | La observación local de la página exacta registra el producto “Convenio para deudas vencidas de Impuestos Fiscales y Aduaneros”: hasta 24 cuotas y pie de 10–30% según comportamiento de pago y garantía. El artículo limita esas condiciones a ese producto y no las atribuye a todos los convenios TGR. |

### Fechas, frescura y registro público

- El calendario SII AT2026, publicado el 31-03-2026, confirma presentación con pago hasta el 30 de abril, período con devolución hasta el 8 de mayo y sus fechas de depósito. El texto trata el ciclo como ya cerrado.
- El claim AT2027 del artículo está formulado como observación fechada y limitada a las dos páginas nombradas, no como afirmación universal de que no exista calendario. En esta pasada abrí las URLs oficiales de Operación Renta 2026 e índice de noticias 2026, pero el lector devolvió 0 líneas para la primera y solo líneas de controles vacíos para la segunda. Por eso no pude reconfirmar independientemente en esta herramienta la ausencia de un calendario AT2027. Esta es una limitación de recuperación; no doy por probado el claim negativo más allá del alcance y fecha que expresa el artículo, ni inferí AT2027 en otra parte.
- `updatedDate`, `articleLead.validAsOf` y la fecha visible de revisión están alineados en `2026-10-02`. Los changelogs registran como cambios sustantivos el ajuste de obligación/base, correcciones APV/TGR, fuentes y estructura.
- La entrada `rentas-mixtas-apv-y-convenios` existe en `src/data/correcciones.json`, apunta a `/posts/rentas-mixtas-sueldo-honorarios/` y describe los cambios materiales revisados. `src/pages/correcciones.astro` importa el JSON y obtiene la colección de correcciones para `/correcciones/`.
- `pnpm run check:correcciones`: **OK**, 12 entradas válidas.

## Límites de acceso a fuentes

- La URL oficial del PDF de Línea 23 devolvió `Internal Error` al fetch en esta sesión. Contrasté la [extracción local completa del run](source-extract-l23-at2026.txt), de 274 líneas y 3.228 palabras, con el artículo. Es una extracción derivada del PDF, no una segunda respuesta legible del servidor oficial en este fetch.
- El fetch de la página TGR también devolvió error interno. Usé la observación local fechada del acordeón exacto, tal como solicita el encargo; no es una captura íntegra de la respuesta web, por lo que mantengo esa limitación explícita.
- La búsqueda AT2027 queda acotada por la limitación de extracción indicada arriba. No reutilicé el resultado afirmado en changelogs o informes previos como prueba.

## Separación de funciones y estado

El changelog identifica al DraftAgent como la instancia raíz que continuó edits ya existentes en el árbol de trabajo; no fue un DraftAgent fresco de exposición cero. Esta auditoría la realizó una instancia Compliance separada. Esa separación reduce el conflicto de rol, pero no cambia la procedencia declarada del trabajo de drafting. No se creó ni editó un `05-*`; no se marcó `[X]`, no se firmó y no se modificó ningún gate o publish packet. La aprobación editorial humana sigue pendiente.

## Scorecard — NORMA_YMYL §7

| Dimensión | Puntaje | Peso | Motivo |
|---|---:|---:|---|
| Respuesta ancla | 9,7 | 35% | Regla, umbral, AT2026 y salvedades aparecen en el resumen inicial. |
| Precisión y fuentes | 9,6 | 25% | Claims centrales concuerdan con fuentes primarias; APV/TGR se apoyan en artefactos locales debido a errores del fetch, con límites declarados. |
| Vigencia y calendario | 9,0 | 15% | Calendario AT2026 y marcas de frescura confirmados; el lector no permitió reconfirmar la búsqueda negativa acotada de AT2027. |
| Excepciones y cobertura | 9,7 | 15% | Incluye propuesta, base imponible, devolución voluntaria, dos empleadores y requisitos APV/TGR pertinentes. |
| Claridad y estructura | 9,8 | 10% | Cumple DoD §2; tabla limpia y ejemplo orientativo sin cálculo individual. |
| **Total ponderado** | **9,58/10** | **100%** | **Supera el mínimo 9,5.** |

**PASS holístico para la versión auditada.** Los límites de acceso quedan registrados y no se convierten en afirmaciones de fuente confirmada. No hay defecto material conocido en los claims de obligación, propuesta, base imponible, tasas, tabla IGC, APV o alcance TGR revisados en esta pasada.
