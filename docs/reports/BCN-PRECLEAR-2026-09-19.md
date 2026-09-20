# BCN pre-clearquidación — 9 checklists HUMAN-VERIFY (2026-09-19)

Solo ítems BCN/LeyChile. Sin edición de artículos, configs ni fuentes.
Método: `node scripts/bcn-cite.mjs` (fail-closed) por ítem, adjudicación
estricta: un literal que responde OTRA pregunta no pre-limpia.
Versiones: `latest` salvo pin explícito (`idVersion=2026-09-01` donde el
checklist exige ventana 01-09-2026–31-03-2027). Fechas derivadas por
aritmética se marcan `[DERIVADO]` — el literal trae meses relativos.

## 1. `el-poder-del-interes-compuesto` (BCN: C, D, E)

### PRECLEARED

| Ítem | idNorma / locator / versión | Literal |
| ---- | --------------------------- | ------- |
| C1 — IMM $529.000 desde 01-05-2025 (Ley 21.751) | 1214530, art. 1, idParte 10553389, latest (pub. 2025-06-28) | "A contar del 1 de mayo de 2025, elévase a $529.000 el ingreso mínimo mensual para los trabajadores y las trabajadoras mayores de 18 años de edad y hasta de 65 años de edad. A partir del 1 de enero de 2026, el ingreso mínimo mensual para los trabajadores referidos ascenderá a $539.000." |
| E — reajuste automático ene-2025 por IPC (Ley 21.578), con CORRECCIÓN de locator: no es art. 1 inc. 4 sino inc. 5 | 1192720, art. 1 inc. 5, idParte 10434406, latest (pub. 2023-05-30) | "A contar del 1 de enero de 2025, reajústase el ingreso mínimo mensual para los trabajadores y las trabajadoras mayores de 18 y de hasta 65 años conforme a la variación acumulada por el Índice de Precios al Consumidor, determinada e informada por el Instituto Nacional de Estadísticas entre el 1 de julio de 2024 y el 31 de diciembre de 2024." |

Nota E: el inc. 4 del mismo artículo es la cláusula condicional del 6%
("$470.000 a contar del 1-ene-2024 si el IPC a dic-2023 supera 6%"), y el
art. 10 alude a ese "inciso cuarto" para el subsidio — el excerpt BCN del
checklist estaba desplazado en uno. El mecanismo ene-2025 queda confirmado
con locator corregido.

### STILL-HUMAN

| Ítem | Razón | URL + pregunta exacta |
| ---- | ----- | --------------------- |
| C2 — $510.636 ene–abr 2025 | La cifra es computada (500.000 × IPC jul–dic 2024), no está en el texto legal | Vía INE: confirmar IPC acumulado 1-jul-2024–31-dic-2024 ≈ 2,1272% tal que 500.000 → 510.636. Si difiere, recalcular escalón. (~2 min) |
| D — serie IMM 1990–2024 + anomalía 2006 ($155.510) | Síntesis multi-ley, fuera del alcance de un literal | LeyChile por año (ej. <https://www.bcn.cl/leychile/navegar?idNorma=1192720> solo cubre escalones 2023–2025: 440.000 / 460.000 / 500.000 + reajustes). Confirmar fila por fila, foco 2006: ¿$155.510 real o tipeo por $155.000? Fallback del checklist si no hay serie completa. (~5 min) |
| A, B, F, G, H, I, J, K | No-BCN (SII, INE, Nasdaq, prensa, SPensiones, tarea repo) | Ver checklist original; nada que pre-limpiar aquí. (~33 min) |

## 2. `indemnizacion-anos-de-servicio-chile` (BCN: A–F; base 207436)

### PRECLEARED

| Ítem | idNorma / locator / versión | Literal |
| ---- | --------------------------- | ------- |
| A(a) — contrato vigente 1 año o más | 207436, art. 163 inc. 1, idParte 8512021, latest (pub. 2003-01-16) | "Si el contrato hubiere estado vigente un año o más y el empleador le pusiere término en conformidad al artículo 161, deberá pagar al trabajador, la indemnización por años de servicio…" |
| A(b)(c)(d) — 30 días; fracción > 6 meses = año; tope 330 días | 207436, art. 163 inc. 2 | "…el empleador deberá pagar al trabajador una indemnización equivalente a treinta días de la última remuneración mensual devengada por cada año de servicio y fracción superior a seis meses, prestados continuamente a dicho empleador. Esta indemnización tendrá un límite máximo de trescientos treinta días de remuneración." ("11 años" = 330/30 [DERIVADO].) |
| A(e) — obra/faena ≥ 1 mes, causal N°5, 2,5 días/mes + fracción > 15 días | 207436, art. 163 inc. 3 | "Si el contrato celebrado para una obra o faena determinada hubiere estado vigente por un mes o más… una indemnización equivalente a dos y medio días de remuneración por cada mes trabajado y fracción superior a quince días… Sólo corresponderá… si se pusiere término al contrato por la causal contemplada en el número 5 del artículo 159." |
| A(f) — casa particular a todo evento | 207436, art. 163 incs. 5–6 | "Lo dispuesto en los incisos anteriores no se aplicará en el caso de terminación del contrato de los trabajadores de casa particular… a) Tendrán derecho, cualquiera que sea la causa que origine la terminación del contrato, a una indemnización a todo evento que se financiará con un aporte del empleador, equivalente al 1,11% de la remuneración mensual imponible… b) La obligación de efectuar el aporte tendrá una duración de once años…" |
| B(a)(b)(c) — exclusión sobretiempo; promedio 3 meses; tope 90 UF último día mes anterior | 207436, art. 172 incs. 1–3, idParte 8512030 | "…con exclusión de la asignación familiar legal, pagos por sobretiempo y beneficios o asignaciones que se otorguen en forma esporádica o por una sola vez al año, tales como gratificaciones y aguinaldos de navidad." / "Si se tratare de remuneraciones variables, la indemnización se calculará sobre la base del promedio percibido por el trabajador en los últimos tres meses calendario." / "…no se considerará una remuneración mensual superior a 90 unidades de fomento del último día del mes anterior al pago…" |
| C — 159 N°4/N°5, 160, desahucio 161 inc. 2 | 207436, arts. 159/160/161, idPartes 8512015/8512017/8512018 | 159: "4.- Vencimiento del plazo convenido en el contrato… 5.- Conclusión del trabajo o servicio que dio origen al contrato." (nota: el N°5 dice "conclusión del trabajo o servicio", no "obra/faena" — ajustar redacción). 160: "El contrato de trabajo termina sin derecho a indemnización alguna cuando el empleador le ponga término invocando…" (siete causales). 161 inc. 2: "…el contrato de trabajo podrá, además, terminar por desahucio escrito del empleador, el que deberá darse con treinta días de anticipación, a lo menos, con copia a la Inspección del Trabajo respectiva…" |
| D — recargos 30/50/80/100 + 60 días hábiles, suspensión, tope 90 | 207436, art. 168, idParte 8512026 | "…podrá recurrir al juzgado competente, dentro del plazo de sesenta días hábiles, contado desde la separación…" / "a) En un treinta por ciento, si se hubiere dado término por aplicación improcedente del artículo 161;" / "b) En un cincuenta por ciento, si se hubiere dado término por aplicación injustificada de las causales del artículo 159 o no se hubiere invocado ninguna causa legal…" / "c) En un ochenta por ciento, si se hubiere dado término por aplicación indebida de las causales del artículo 160." / "Si el empleador hubiese invocado las causales señaladas en los números 1, 5 y 6 del artículo 160 y el despido fuere además declarado carente de motivo plausible… se incrementará en un cien por ciento." / "El plazo… se suspenderá cuando… el trabajador interponga un reclamo… ante la Inspección del Trabajo… en ningún caso podrá recurrirse al tribunal transcurridos noventa días hábiles desde la separación…" |
| E — prescripción 2 años | 207436, art. 510 inc. 1, idParte 8512398 | "Los derechos regidos por este Código prescribirán en el plazo de dos años contados desde la fecha en que se hicieron exigibles." |
| F(a) — contratados antes del 14-08-1981 sin tope | 207436, art. 7 transitorio, idParte 8512409 | "Art. 7.o Los trabajadores con contrato de trabajo vigente al 1.° de diciembre de 1990 y que hubieren sido contratados con anterioridad al 14 de agosto de 1981, tendrán derecho a las indemnizaciones que les correspondan conforme a ella, sin el límite máximo a que se refiere el artículo 163." |
| F(b) — art. 178 no renta | 207436, art. 178 inc. 1, idParte 8512036 | "Las indemnizaciones por término de funciones o de contratos de trabajo establecidas por ley… no constituirán renta para ningún efecto tributario." |
| F(c) — LIR 17 N°13 exceso voluntario, promedio 24 meses | 6368 (LIR DL 824), art. 17 N°13 = inc. 69, idParte 8656042, latest (pub. 1974-12-31), combinado con CT art. 178 inc. 2 ("…deberán sumarse éstas a aquéllas con el único objeto de aplicarles lo dispuesto en el Nº 13 del artículo 17 de la ley sobre Impuesto a la Renta…") | "13°.- La asignación familiar, los beneficios previsionales y la indemnización por desahucio y la de retiro hasta un máximo de un mes de remuneración por cada año de servicio o fracción superior a seis meses. Tratándose de dependientes del sector privado, se considerará remuneración mensual el promedio de lo ganado en los últimos 24 meses, excluyendo gratificaciones, participaciones, bonos y otras remuneraciones extraordinarias y reajustando previamente cada remuneración de acuerdo a la variación que haya experimentado el Indice de Precios al Consumidor…" |

### STILL-HUMAN

| Ítem | Razón | URL + pregunta exacta |
| ---- | ----- | --------------------- |
| B(d) — colación/movilización y gratificaciones mensual vs anual | El artículo no las distingue por nombre; el checklist ya prevé verificar contra DT 60585 (fetcheado) | Nada que abrir: confirmar en DT 60585 tratamiento de colación/movilización. (~2 min) |
| G — iniciativa elimina-tope-330 | No-BCN (Cámara) | <https://camara.cl/verDOC.aspx?prmFICHATIPO=DIP&prmID=82391&prmLOCAL=0&prmTipo=FICHAPARLAMENTARIA>: ¿sigue en trámite/no aprobada? (~2 min) |
| H — calculadora en producción | Tarea repo, no navegador | Auditar `/calculadoras/finiquito-indemnizacion/`: tope 90 UF, exclusión sobretiempo, exigencia 1 año. (~15 min) |

## 3. `reforma-previsional-2025` (BCN: B–E; base 1212060)

### PRECLEARED

| Ítem | idNorma / locator / versión | Literal |
| ---- | --------------------------- | ------- |
| B(a) — promulgación 20-03-2025 | 1212060, Promulgación, idParte 10542993, latest (pub. 2025-03-26) | "Santiago, 20 de marzo de 2025.- GABRIEL BORIC FONT, Presidente de la República…" (publicación 26-03-2025 = metadato `fecha_publicacion` de la norma, no literal.) |
| B(b) — vigencia general diferida al 01-04-2027 | 1212060, art. primero transitorio, idParte 10542939 (+`--resolve-dates` → 2027-04-01, regla "el primer día del vigésimo quinto mes siguiente a su publicación", ancla 2025-03-26) | "Las normas de la presente ley entrarán en vigencia el primer día del vigésimo quinto mes siguiente a su publicación en el Diario Oficial. Lo anterior es sin perjuicio de lo dispuesto en los artículos siguientes." (01-04-2027 [DERIVADO] vía resolvedDate del tool.) |
| C — calendario gradual + 8,5% total empleador + endpoint agosto 2033 [DERIVADO] | 1212060, art. cuarto transitorio, idParte 10542943; y art. 1, idParte 10542845 | Cronograma (meses relativos a pub. 26-03-2025; fechas absolutas [DERIVADO]): a) 5° mes → 1-ago-2025: 1,0% (0,1 + 0,9); b) 17° → 1-ago-2026: 3,5% (0,1 + 0,9 + 2,5); c) 29° → 1-ago-2027: 4,25%; d) 41° → 1-ago-2028: 5,0%; e) 53° → 1-ago-2029: 5,7%; f) 65° → 1-ago-2030: 6,4%; g) 77° → 1-ago-2031: 7,1%; h) 89° → 1-ago-2032: 7,8%; i) 101° → 1-ago-2033: 8,5% (4,5 + 1,5 + 2,5). Literal base: "La tasa de la cotización establecida en el artículo 1, se aplicará gradualmente de acuerdo al siguiente cronograma:…" + art. 1: "Establécese una cotización de cargo de los empleadores de un 8,5%… 1. Un 6,0%… 2. Un 2,5%… destinado al Fondo Autónomo de Protección Previsional… (SIS + CEV)". Nota: el literal compone 6,0 + 2,5 = 8,5; el encuadre "7% nuevo + SIS" del checklist no calza con el texto — corregir a 6,0 (4,5 cuenta individual + 1,5 CRP) + 2,5 (FAPP: SIS/CEV). Escenario alternativo letras e)–i) (5,5→7,5%) + j)–k) si la evaluación externa de la ley 21.713 muestra menor recaudación: consta en el mismo literal. |
| D(a) — fondos generacionales por cohortes + elección | 1212060, art. 67 incs. 52 y 54 (reemplazo incisos DL 3500 art. 23), idParte 10542923 | "Cada Administradora mantendrá Fondos Generacionales, estructurados según cohortes de afiliados de acuerdo a rangos etarios. Los portafolios de cada Fondo se diferenciarán por nivel de riesgo y retorno, y seguirán un criterio de ciclo de vida… Las cotizaciones obligatorias se depositarán en el Fondo Generacional que corresponda según la edad del afiliado." / "Asimismo, los saldos totales por cotizaciones de ahorros voluntarios… se depositarán en el Fondo Generacional que haya elegido el afiliado. Si no ha elegido, sus ahorros se depositarán en el Fondo Generacional correspondiente al de su cotización obligatoria." (Elección literal solo para ahorro voluntario; obligatorias por edad.) |

### STILL-HUMAN

| Ítem | Razón | URL + pregunta exacta |
| ---- | ----- | --------------------- |
| D(b)-resto — "esquema anual por Operación Renta" | Arquitectura voluntaria confirmada (art. 19: independientes no-42N2 no-dependientes, mensual, idParte 10542873; art. 15: 42N2, idParte 10542868; cuarto transitorio final: mismo cronograma para arts. 15 y 19; inicio ago-2025 [DERIVADO] de letra a), pero "anual por Operación Renta" no está escrito | <https://www.bcn.cl/leychile/navegar?idNorma=1212060>: confirmar si algún artículo/transitorio fija esquema anual vía Operación Renta para 42N2, o RETIRAR esa frase y dejar "cotización voluntaria con gradualidad del cuarto transitorio". (~2 min) |
| E — aporte por tipo de contrato (plazo fijo/indefinido/parcial) | Búsqueda negativa: "plazo fijo" 0 hits, "jornada parcial" 0 hits en 1212060; único "contrato de trabajo" es art. 4 (incapacidad/subsidio) | <https://www.bcn.cl/leychile/navegar?idNorma=1212060>: si no hay norma de proporcionalidad por tipo de contrato, RETIRAR (candidata a falsa). (~3 min) |
| A, F | No-BCN (SP, IPS/prensa) | Ver checklist original. (~8 min) |

## 4. `renegociacion-superir` (BCN: solo D; base 1058072)

Ningún pre-clear: el art. 260 dice "dos o más obligaciones vencidas por
más de 90 días corridos, actualmente exigibles, provenientes de
obligaciones diversas, cuyo monto total sea superior a 80 UF" (idParte
9398983) — exige obligaciones DIVERSAS, no "dos acreedores distintos", y no
resuelve el borde un-solo-acreedor. Es pregunta de práctica Superir.

### STILL-HUMAN

| Ítem | Razón | URL + pregunta exacta |
| ---- | ----- | --------------------- |
| D — un solo acreedor, varias obligaciones | Requiere criterio Superir, no literal | <https://www.bcn.cl/leychile/navegar?idNorma=1058072&idParte=9398983> como base + Superir/ChileAtiende: ¿múltiples obligaciones diversas con UN acreedor califican? Ajustar "dos acreedores distintos" o confirmar. (~5 min) |
| A, B, C, E | Práctica Superir / tramitación, no literales BCN | Ver checklist original. (~18 min) |

## 5. `fondos-afp-a-b-c-d-e` (BCN: A–D)

### PRECLEARED (todos con pin `idVersion=2026-09-01`, DL 3500 idNorma 7147 salvo reforma)

| Ítem | idNorma / locator / versión | Literal |
| ---- | --------------------------- | ------- |
| A-límites — RV A80/B60/C40/D20/E5 | 7147, art. 45 inc. 42, idParte 8674636, idVersion 2026-09-01 (pub. 1980-11-13) | "El límite máximo para la suma de las inversiones en los instrumentos señalados en las letras g) y h), como también para los de las letras j) y k), cuando se trate de instrumentos representativos de capital, será de un 80%, 60%, 40%, 20% y 5% del valor de los Fondos de Pensiones Tipos A, B, C, D y E, respectivamente." (Nota: el DL no escribe "renta variable"; el tope es sobre "instrumentos representativos de capital".) |
| A-elección — prohibición Fondo A 56H/51M; pensionados no A/B (= solo C-D-E) | 7147, art. 23 inc. 3, idParte 8674613, idVersion 2026-09-01 | "Los afiliados hombres hasta 55 años de edad y las mujeres hasta 50 años de edad, podrán optar por cualquiera de los Fondos… A su vez, los afiliados hombres desde 56 años de edad y las mujeres desde 51 años de edad, no podrán optar por el Fondo Tipo A, respecto de los saldos originados en cotizaciones obligatorias. Los afiliados pensionados por retiro programado y renta temporal y los afiliados declarados inválidos parciales mediante un primer dictamen, no podrán optar por los Fondos tipo A o B respecto de los saldos antes señalados." |
| B — calendario y 8,5% | 1212060, cuarto transitorio + art. 1 | Mismos literales que §3-C arriba (no se repiten). |
| C — vigencia diferida 01-04-2027 | 1212060, primero transitorio + resolvedDate | Mismo literal que §3-B(b) arriba (no se repite). |
| D-transición — FG entran en vigencia 25° mes (abril 2027 [DERIVADO]); multifondos siguen vigentes mientras tanto | 1212060, art. vigésimo transitorio, idParte 10542960, latest (pub. 2025-03-26) | "Los Fondos Generacionales a que se refiere el artículo 23 del decreto ley N° 3.500, de 1980, modificado por esta ley, entrarán en vigencia a partir del primer día del vigésimo quinto mes siguiente a la publicación de esta ley… Mientras no entren en vigencia los Fondos Generacionales, seguirá vigente el esquema de multifondos de Fondos de Pensiones establecido en el artículo 23 del decreto ley N° 3.500, de 1980, en su texto anterior a las modificaciones introducidas por esta ley, así como su normativa complementaria, en lo que corresponda." |

### STILL-HUMAN

| Ítem | Razón | URL + pregunta exacta |
| ---- | ----- | --------------------- |
| D-resto — ¿Régimen de Inversión definitivo publicado? | Requiere normativa SPensiones, no LeyChile (deadline era 01-09-2026; al auditar solo propuesta en consulta) | Supersalud no; es SPensiones: buscar en normativa SP el Régimen de Inversión definitivo de FG. Si publicado: URL + fecha; si no: "mantener como propuesta". (~3 min) |

## 6. `como-hacer-presupuesto-mensual-chile`

Sin ítems BCN. STILL-HUMAN: A (banda SOAP 2026 SERNAC/CMF, ~6 min),
B (mención CAE, ~4 min). Ver checklist original.

## 7. `fonasa-vs-isapre-comparativa` (BCN: A, D, G, H; DFL-1 base 249177)

### PRECLEARED

| Ítem | idNorma / locator / versión | Literal |
| ---- | --------------------------- | ------- |
| A-desahucio — 1 año vigencia + aviso 1 mes (ojo: dice "un mes", no "30 días"); cesantía → nuevo plan o desafiliación | 249177, art. 197 incs. 2 y 1, idParte 8654056, latest (pub. 2006-04-24) | "El cotizante podrá, una vez transcurrido un año de vigencia de beneficios contractuales, desahuciar el contrato, para lo cual bastará una comunicación escrita a la Institución con copia al empleador o a la entidad pagadora de la pensión, según corresponda, dada con una antelación de, a lo menos, un mes del cumplimiento del primer año o de la fecha posterior en que se hará efectiva la desafiliación…" / "…la Institución deberá ofrecer un nuevo plan si este es requerido por el afiliado y se fundamenta en la cesantía o en una variación permanente de la cotización legal, o de la composición del grupo familiar del cotizante… Sin perjuicio de lo anterior, en caso de cesantía y no siendo aplicable el artículo 188 de esta Ley, la Institución deberá acceder a la desafiliación si esta es requerida por el afiliado." |
| H — Tramo A / 12 meses SÍ existe en Ley 21.674 art. 1° (numeral 6, modifica DFL-1 art. 164): B/C/D → A tras 12 meses sin cotizar | 1203779, art. 1° numeral 6, idParte 10501376, latest (pub. 2024-05-24) | "6) Agrégase, en el inciso final del artículo 164… el siguiente texto: '…El Fondo deberá reclasificar siempre a las personas afiliadas y beneficiarias que de ellas dependan pertenecientes a los grupos B, C y D, en el grupo A en el evento que dichas personas afiliadas dejen de enterar sus cotizaciones durante el período de doce meses consecutivos…'" (Cotejar contra la frase exacta del artículo: la regla es caída al A por no-cotización, no un "Tramo A por período limitado" genérico.) |

### STILL-HUMAN

| Ítem | Razón | URL + pregunta exacta |
| ---- | ----- | --------------------- |
| A-resto — ¿Ley Corta tocó el año mínimo? + procedimiento Compendio (¿30 días vs 1 mes?) | Un literal confirma texto vigente, no historia; Compendio es Superintendencia | <https://www.bcn.cl/leychile/navegar?idNorma=249177&idVersion=2024-05-24> (versión pre-Ley-Corta) vs latest: ¿cambió el art. 197? + Compendio vigente: ¿exige 30 días o 1 mes? (~3 min) |
| D — GES embarazo + carencias no-GES | Requiere DS GES + Compendio Beneficios; el DFL-1 solo da el marco (art. 190 final: "No podrán existir períodos de espera… excepto las correspondientes al embarazo y a enfermedades preexistentes, en los términos señalados en el artículo 189, letra g)", idParte 8654049) | DFL-1/Compendio: condiciones GES de acceso por patología de embarazo + carencias no-GES en planes. Quotes o RETIRAR L121/L134/L173. (~4 min) |
| G — base legal del 7% | SIN literal "7%" en DFL-1 (búsquedas negativas documentadas: "siete" solo art. 36 = 7.000 UTM; "por ciento" solo arts. 113/186/198 bis; "7%"/"7 %" solo art. 88 = acreditación funcionarios). Pistas: DFL-1 art. 170 h → "cotización legal para salud" remite al art. 137 (sin %); único "siete por ciento… salud" hallado: DL 3500 art. 92 (independientes, idNorma 7147 idParte 8674688): "…a un siete por ciento destinado a financiar prestaciones de salud…" | Ubicar la frase-ejemplo del artículo (piso/prima/devolución TUF) y fijar su base real, o RETIRAR el ejemplo. (~3 min) |
| B, C, E, F | No-BCN (Supersalud/Minsal) | Ver checklist original. (~18 min) |

## 8. `utm-chile-que-es-como-funciona` (BCN: H-01, H-02, H-03)

### PRECLEARED

| Ítem | idNorma / locator / versión | Literal |
| ---- | --------------------------- | ------- |
| H-01 parcial — qué es UT e IPC según Código Tributario | 6374, art. 8 N°10 (= inc. 12) y N°11 (= inc. 14), idParte 8573327, latest (pub. 1974-12-31) | "10°.- Por 'unidad tributaria', la cantidad de dinero cuyo monto, determinado por ley y permanentemente actualizado, sirve como medida o como punto de referencia tributario…" / "11°.- Por 'índice de precios al consumidor', aquél fijado por el Instituto Nacional de Estadística." |
| H-03 — bonificación Régimen A 15% (DL 3500 art. 20 O) + 42 bis = rebate 600 UF (Régimen B) | 7147, art. 20 O inc. 2, idParte 8674937, idVersion 2026-09-01; y 6368, art. 42 bis num. 2 (= inc. 3), idParte 8656197 | "El monto de esta bonificación será el equivalente al quince por ciento de lo ahorrado por el trabajador por concepto de cotizaciones voluntarias, ahorro previsional voluntario o ahorro previsional voluntario colectivo… En todo caso, en cada año calendario, la bonificación no podrá ser superior a seis unidades tributarias mensuales…" / "2. Podrán reliquidar… rebajando de la base imponible el monto… hasta por un monto total máximo anual equivalente a la diferencia entre 600 unidades de fomento, según el valor de ésta al 31 de diciembre del año respectivo, menos el monto total del ahorro voluntario… acogidos al número 1 anterior." |

### STILL-HUMAN

| Ítem | Razón | URL + pregunta exacta |
| ---- | ----- | --------------------- |
| H-01 resto — redacción del reajuste (¿"IPC del mes anterior" o "último IPC publicado"?) + base primer día hábil | El art. 8 define, no regula el reajuste; el mecanismo mensual no está ahí | Ubicar el artículo que regula el reajuste mensual de la UTM (no es CT art. 8) y su base de primer día hábil; corregir L112–114 o ajustar redacción (F-06). (~4 min) |
| H-02 — multa UTM: ¿al pago o a la infracción? | Sin regla en Ley de Tránsito (1007469/29708: solo montos en UTM) ni en Ley 18.287 (arts. 22/23/24: solo "sus reajustes", art. 24 idParte 8198209). Además la URL del checklist está rota: `idNorma=1374` NO existe en LeyChile (NOT_FOUND documentado). Usar <https://www.bcn.cl/leychile/navegar?idNorma=1007469> (DFL-1 Transportes refundido) o <https://www.bcn.cl/leychile/navegar?idNorma=29708> (Ley 18.290 original). | En doctrina/JPL o Ley 18.287: ¿la multa en UTM se convierte al valor vigente al pago o a la infracción? Quote o RETIRAR L166. (~4 min) |

## 9. `cae-costo-real-credito-chile` (BCN: A–D)

### PRECLEARED

| Ítem | idNorma / locator / versión | Literal |
| ---- | --------------------------- | ------- |
| A-prepago — art. 10: derecho irrenunciable ≤ 5.000 UF; topes comisión 1 mes / 1,5 meses; <10% requiere consentimiento | 29438 (Ley 18.010), art. 10, idParte 8101667, latest (pub. 1981-06-27) | "…en las operaciones de crédito de dinero cuyo importe en capital no supere el equivalente a 5.000 unidades de fomento, el deudor… podrá anticipar su pago, aun contra la voluntad del acreedor, siempre que: a) Tratándose de operaciones no reajustables, pague el capital que se anticipa y los intereses pactados calculados hasta la fecha de pago efectivo, más la comisión de prepago. Dicha comisión, no podrá exceder el valor de un mes de intereses pactados calculados sobre el capital que se prepaga. b) Tratándose de operaciones reajustables… no podrá exceder el valor de un mes y medio de intereses pactados…" / "Los pagos anticipados que sean inferiores al 10% del saldo de la obligación, requerirán siempre del consentimiento del acreedor." / "El derecho a pagar anticipadamente en los términos de este artículo, es irrenunciable." |
| A-TMC — art. 6: TMC = interés máximo = max(1,5×TIC, TIC+2pp); solo topa interés (cargos van por transparencia 17 B, no por TMC) | 29438, art. 6, idParte 8101663 | "No podrá estipularse un interés que exceda el producto del capital respectivo y la cifra mayor entre: 1) 1,5 veces la tasa de interés corriente que rija al momento de la convención… y 2) la tasa de interés corriente que rija al momento de la convención incrementada en 2 puntos porcentuales anuales… Este límite de interés se denomina interés máximo convencional." / "No se podrá cobrar intereses por sobre aquella parte de la deuda que ya esté pagada." (Refuerzo tarjetas: art. 6 TER, idParte 9391967: TMC según monto/plazo de la línea, "vigente al momento a partir del cual se devenguen los respectivos intereses".) |
| B-alcance — incluye retail no-CMF (17 B); hoja resumen (17 C); deber CAE (17 D) | 61438, arts. 17 B (idParte 9210439), 17 C (9210440), 17 D inc. 1 (9210441), latest (pub. 1997-03-07) | 17 B: "Los contratos de adhesión de servicios crediticios, de seguros y, en general, de cualquier producto financiero, elaborados por bancos e instituciones financieras o por sociedades de apoyo a su giro, establecimientos comerciales, compañías de seguros, cajas de compensación, cooperativas de ahorro y crédito, y toda persona natural o jurídica proveedora de dichos servicios o productos, deberán especificar como mínimo…" (+ letra d: identificar qué conexos son "obligatorios por ley y cuáles voluntarios"). 17 C: "Los contratos de adhesión de productos y servicios financieros deberán contener al inicio una hoja con un resumen estandarizado de sus principales cláusulas y los proveedores deberán incluir esta hoja en sus cotizaciones…" 17 D: "Los proveedores… deberán comunicar periódicamente… la información… que le permita conocer:… la carga anual equivalente, si corresponde…" + certificado de liquidación debe contener "f) Carga anual equivalente." |
| C — seguros asociados voluntarios, libre elección (Ley 20.448 art. 8) | 1016177, art. 8, idParte 8964675, latest (pub. 2010-08-13) | "Los proveedores de créditos que exijan la contratación de seguros asociados a su otorgamiento no podrán condicionarlo, ni ofrecer condiciones de contratación distintas, a aquellos consumidores que contraten los seguros que tales proveedores ofrezcan o intermedien, pudiendo el deudor contratar libremente la póliza en cualesquiera de las entidades que los comercialicen…" (Sostiene el fix L214 "obligatorios" → voluntarios.) |
| D — TMC mensual | 29438, art. 6 inc. 2 | "Los promedios se establecerán en relación con las operaciones efectuadas durante cada mes calendario y las tasas resultantes se publicarán en la página web de la Comisión para el Mercado Financiero y en el Diario Oficial durante la primera quincena del mes siguiente, para tener vigencia hasta el día anterior a la próxima publicación." |

### STILL-HUMAN

| Ítem | Razón | URL + pregunta exacta |
| ---- | ----- | --------------------- |
| E (NHV-5/6/7) — IVA seguros, portabilidad, CAE tarjetas | No-BCN / reglamentario | URLs o RETIRAR menciones. (~5 min) |

## Resumen

- BCN ítems totales: 29.
- PRECLEARED íntegros: 17/29.
- PARCIALES (literal pre-limpia + resto humano): 6
  (interés-C; indemnización-B(d); reforma-D(b); fondos-D-régimen;
  fonasa-A-resto; utm-H-01-resto).
- STILL-HUMAN íntegros: 6
  (interés-D; reforma-E; renegociación-D; fonasa-D; fonasa-G; utm-H-02).
- Remanente humano estimado: ~147 min totales.
  Interés ~40 (C2: 2, D: 5, no-BCN: 33) · Indemnización ~19 (B(d): 2,
  G: 2, H: 15) · Reforma ~13 (A: 5, D(b): 2, E: 3, F: 3) ·
  Renegociación ~23 (A: 5, B: 5, C: 5, D: 5, E: 3) · Fondos D: 3 ·
  Presupuesto: 10 · Fonasa ~27 (A: 3, D: 4, G: 3, B: 5, C: 5, E: 4,
  F: 4) · UTM ~7 (H-01: 3, H-02: 4) · CAE E: 5.
- Fallos/ambigüedades del tool: 7 invocaciones fallidas + 7
  resoluciones-a-blanco-detectadas (ver log; ninguna oculta).

## FAIL-CLOSED log (todo lo que falló o ambigüó, sin ocultar)

1. `idNorma=1374` (URL checklist UTM H-02): NOT_FOUND — no existe en
   LeyChile. Corregidos: Ley 18.290 = 29708, DFL-1 Transportes = 1007469
   (vía websearch + fetch).
2. `207436 --transitorio segundo/septimo`: NOT_FOUND — los
   transitorios del CT se nombran con dígito ("Artículo 2 Transitorio").
   Rehecho por idParte (8512404/8512409/8512410): OK.
3. `1212060 --transitorio cuadragesimo sexto`: NOT_FOUND — el nombre
   lleva tilde ("cuadragésimo"). Rehecho por idParte 10542988: OK.
4. `61438 --art "17 C/D/B"`: el token con espacio se pierde (posicional
   ignorado) y las 3 llamadas resolvieron en silencio al art. 17 —
   detectado por bytes idénticos (2246). Rehechas por idParte
   (9210439/9210440/9210441): OK.
5. `29438 --art "6 TER"`: el prefijo calza con art. 6 (bytes idénticos
   4071). Rehecho por idParte 9391967: OK (art. 6 TER real).
6. `1212060 --transitorio vigesimo`: calzó con vigesimoprimero (el
   nombre nutrient "vigésimo" lleva tilde y no hizo match). El vigésimo
   real (idParte 10542960, transición FG) se extrajo por idParte: OK.
7. `1212060 --art 67 --numeral 4`: devolvió solo el encabezado
   ("4. En el artículo 23:"). Fragmentación por bloques: se usaron
   incisos 52/54 vía idParte: OK.
8. `6368 --idParte 8656163` ("Artículo 17"): era la ley de
   cooperativas inserta en la norma, NO LIR art. 17. El LIR real es
   "Artículo 17 (DEL ART 1)" idParte 8656042 (N°13 = inc. 69): OK.
9. Sondas de idNorma erradas: 6369 = IVA (no LIR; LIR = 6368,
   verificado por título), 6367 = sueldo vital 1974, 29702/29688 ≠ Ley
   18.287 (es 29705, vía websearch). Ley 21.751 = 1214530 y Ley
   21.674 = 1203779 (vía websearch; 1203779 ya estaba en caché).
10. Extracciones válidas que responden OTRA pregunta (no pre-limpian):
    CT 2° transitorio (feriado, no indemnización); Ley 21.578 arts. 10
    y 12 (subsidio pyme, no reajuste); DFL-1 art. 88 (acreditación
    funcionarios, no 7%); DFL-1 art. 137 (cotización sin %); reforma
    art. 4 (incapacidad) y t18 (encaje) para FG-elección; DL 3500
    art. 23 (elección, no límites RV — están en art. 45).
11. Búsquedas negativas con evidencia (caché local, sin red): "plazo
    fijo"/"jornada parcial" 0 hits en 1212060; "siete"/"por
    ciento"/"7%"/"7 %" sin "7% salud general" en DFL-1 (detalle §7-G);
    "abril de 2027"/"2033"/"ocho coma cinco" 0 hits en 1212060
    (redacción en meses relativos); "renta variable" 0 hits en DL 3500
    (tope vía "instrumentos representativos de capital"); "510.636" y
    "IPC" 0 hits en Ley 21.578 (cifra computada); "tramo" 0 hits en Ley
    21.674 salvo vía "doce meses" (2 reglas: MCC 12 meses y
    reclasificación art. 164).
12. Error operador (no del tool): primer batch con `cd` rompió la ruta
    relativa del script (18 module-not-found); rehecho con rutas
    absolutas, sin efecto en resultados.
