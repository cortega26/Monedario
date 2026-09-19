# Auditoría YMYL — `cae-costo-real-credito-chile` (2026-09-18)

- **Archivo auditado:** `src/data/blog/cae-costo-real-credito-chile.md`
- **Frontmatter:** `updatedDate: 2026-04-12` / `validAsOf: 2026-04-12` /
  `topicRole: owner` / `canonicalTopic: cae-costo-real` /
  `cluster: deuda-credito` / `reviewPolicy: annual, maxDays 365`
- **Modo:** solo lectura (adversarial). No se editó ningún archivo existente.
- **Veredicto:** **FINDINGS — 1 HIGH · 2 MEDIUM · 7 LOW · 7 NEEDS-HUMAN-VERIFY**

## 1. Resumen

La guía es estructuralmente sólida (gates verdes, hero OK, links OK,
frontera con el artículo de tarjetas limpia) y sus reglas conceptuales
centrales (CAE para comparar, costo total en pesos, TMC como techo) están
alineadas con SERNAC y CMF Educa. Pero **los dos ejemplos numéricos con
cuota/CAE están mal calculados**: la Tabla 2 (`$3.000.000`, 36 cuotas)
subestima ambas cuotas entre ~5% y ~7%, presenta una inconsistencia interna
de $65.000 (doble conteo de gastos) y declara `CAE ≈ 24,2%` donde la
recomputación da **~29,1%**; peor aún, con números correctos la narrativa
pedagógica ("cuota más baja pero costo total mayor") **se invierte**. La
Tabla 1 (`$2.000.000`, 24 cuotas) tiene errores menores (~1%) más un problema
de presentación: el "Total pagado" excluye la comisión inicial de $80.000.
Además, la sección de prepago sobregeneraliza un derecho que la propia fuente
citada (CMF Educa) condiciona a dos excepciones legales, y varias
atribuciones institucionales dicen "CMF" donde la autoridad es
SERNAC/Ley 19.496. Ningún hallazgo requiere cambio de slug, cluster ni
canonicalTopic.

## 2. Tabla de hallazgos

| #  | Claim + ubicación | Severidad | Evidencia / URL o NEEDS-HUMAN-VERIFY | Fix sugerido |
|----|-------------------|-----------|--------------------------------------|--------------|
| H1 | Tabla 2, L145–156: cuotas, totales y CAE del ejemplo `$3.000.000` / 36 cuotas | HIGH | Recomputación propia (sección 3): cuota A correcta $113.951 vs $108.800 declarados (−4,7%, −$185.454 en total); cuota B capital+interés correcta $108.457 vs $101.400 (−6,9%; la cuota declarada implica tasa ~1,10% mensual, no 1,50%); `101.400×36 = 3.650.400 ≠ 3.715.400` (doble conteo de los $65.000 de gastos); CAE B recomputado ~29,1% vs 24,2% declarado (~5pp); con números correctos la cuota de B con seguro ($117.957) **supera** a la de A ($113.951) y la frase L156 ("cuota más baja pero costo total mayor") queda invertida | Recalcular toda la tabla con fórmula francesa, hacer `cuota×n = total` exacto, separar gastos iniciales del subtotal sin duplicar, recomputar ambas CAE por TIR e invertir o reescribir la conclusión L156 según el resultado |
| M1 | Tabla 1, L104–117: cuotas, CAE y "Total pagado" del ejemplo `$2.000.000` / 24 cuotas | MEDIUM | Recomputación propia (sección 3): cuota A correcta $99.848 vs $98.900 (~−1%; implica tasa ~1,41%, no 1,50%); CAE B con los propios números del artículo (recibe $1.920.000, paga $102.400×24) = ~28,0% vs 26,8% declarado (~−1,2pp); `102.400×24 = 2.457.600` prueba que el "Total pagado" **excluye** la comisión de $80.000, pero la CAE sí la incluye: el verdadero desembolso es $2.537.600 y la brecha real vs A es ~$164.000, no $84.000. Agravante: esta tabla **no tiene** el descargo de "valores ilustrativos" que sí tiene la Tabla 2 (L158) | Recalcular cuotas/CAE, decidir y declarar si la comisión se paga al contado o se financia, incluirla en el "Total pagado" (o rotular la fila como "total en cuotas, sin gastos iniciales"), y agregar el mismo descargo ilustrativo de L158 |
| M2 | Prepago, L173–175: "derecho a prepagar **cualquier** crédito de consumo **en cualquier momento** (Ley N° 18.010)" + "tope legal" sin cifras | MEDIUM | Fuente primaria citada por el propio artículo, CMF Educa (fetch 2026-09-18, <https://www.cmfchile.cl/educa/621/w3-propertyvalue-43579.html>): "es posible anticipar el pago… en la gran mayoría de los créditos **siempre que se cumplan ciertas condiciones**. Sólo se necesita el consentimiento del acreedor si paga **menos del 10% del valor del capital** adeudado, o si el crédito es **superior a 5.000 UF**". Comisión pública en la misma página: **un mes de intereses** (no reajustable) o **mes y medio** (reajustable) sobre el capital prepagado. El artículo omite ambas excepciones y difiere cifras públicas (cfr. NORMA_YMYL §2.4) | Agregar las dos excepciones (10% / 5.000 UF), publicar los topes 1 mes / 1,5 meses con cita a CMF Educa, y número de artículo exacto de Ley 18.010 tras verificación humana (NHV-1) |
| L1 | L74: "Lo establece la CMF como estándar de comparación" | LOW | SERNAC, "¿Qué es la CAE?" (fetch 2026-09-18, <https://www.sernac.cl/portal/607/w3-article-2463.html>): la CAE es el indicador SERNAC-Financiero presente en "todas sus cotizaciones y contratos… incluso en la hoja resumen". La propia página CMF citada enlaza la hoja resumen a SERNAC, no a norma CMF | "La CAE es el indicador legal de comparación (SERNAC Financiero, Ley 19.496) que las entidades supervisadas por la CMF deben informar según su normativa" + citar artículo exacto tras NHV-2 |
| L2 | L141/L207/L215: "La CMF exige… Hoja de Información Precontractual" | LOW | CMF Educa (misma URL) documenta la "**hoja resumen**" (contenidos mínimos: monto, plazo, tasa anual, cuota, prima mensual, aseguradora) y enlaza su detalle a SERNAC (<https://www.sernac.cl/portal/618/w3-article-21676.html>). El deber es legal + SERNAC, complementado por normas CMF | Renombrar a "hoja resumen / información precontractual (deber SERNAC Financiero + normas CMF)" y verificar base legal exacta (NHV-2) |
| L3 | L88: "Seguros asociados **obligatorios** (desgravamen, por ejemplo)" | LOW | CMF Educa (misma URL): "se pueden contratar seguros… **Dichos seguros son voluntarios**" y se rigen por el art. 8 de la Ley 20.448 (libre elección de aseguradora, sin condicionar el crédito) | "Seguros exigidos como condición del crédito (la aseguradora la eliges tú, Ley 20.448)" + verificar artículo (NHV-3) |
| L4 | FAQ L235–236: deber de informar CAE solo en "reguladas por la CMF" (+ cajas/coops "supervisadas") | LOW | SERNAC (misma URL): "usted verá en **todas sus cotizaciones y contratos** de créditos… un apartado que dirá CAE". El universo SERNAC-Financiero incluye proveedores no bancarios (retail/casas comerciales), que el FAQ deja fuera | Ampliar a "todo proveedor de crédito (bancos, retail, cajas, cooperativas…)" + verificar alcance legal (NHV-2) |
| L5 | L252: "Los valores de TMC **cambian mensualmente**" | LOW | NEEDS-HUMAN-VERIFY (NHV-4). La página CMF de estadísticas confirma agenda de publicación TMC en Diario Oficial, pero el fetch no expuso la tabla de vigencias y la periodicidad no pudo confirmarse | Suavizar a "se actualizan periódicamente; verifica la vigente" o confirmar frecuencia y citar |
| L6 | L203/L224/L239: comparar "tasa **y cargos**" contra la TMC | LOW | El propio artículo (L121) define la TMC como "límite legal de **interés**". La TMC topa el interés, no es un comparador directo de cargos/comisiones; la redacción invita a una comparación metodológicamente incorrecta | "Compara la **tasa de interés** con la TMC de tu segmento; si sospechas elusión vía cargos, reclama con el contrato en mano (CMF/SERNAC)" + base legal (NHV-1) |
| L7 | L252 "vigente a marzo de 2026" vs `validAsOf: 2026-04-12` | LOW | Lectura directa del archivo: desfase de ~1 mes entre la vigencia declarada en cuerpo y el corte de frontmatter | Unificar a "abril de 2026" (o la fecha que corresponda al refresh) |

### NEEDS-HUMAN-VERIFY (7)

| ID | Qué confirmar | URL exacta | Criterio de cierre |
|----|---------------|------------|--------------------|
| NHV-1 | Ley 18.010: N° de artículo del derecho a prepago y sus topes de comisión; N° de artículo de la TMC y su ámbito (interés vs cargos) | <https://www.bcn.cl/leychile/navegar?idNorma=29438> (bot-blocked: LeyChile devuelve muro JS; fetch 2026-09-18 confirmado) | Extraer texto literal de ambos artículos; corregir L173–175 y L203/L224/L239 |
| NHV-2 | Ley 19.496 (SERNAC Financiero, Ley 20.555): artículos del deber de informar CAE y hoja resumen + alcance subjetivo (¿incluye retail no supervisado por CMF?) | <https://www.bcn.cl/leychile/navegar?idNorma=61438> (misma restricción bot) | Citar artículos; corregir L74, L141, FAQ L235–236 |
| NHV-3 | Ley 20.448 art. 8: seguros asociados voluntarios / libre elección de aseguradora | <https://www.leychile.cl/Navegar?idNorma=1016177> | Confirmar N° de artículo y texto; corregir L88 |
| NHV-4 | Periodicidad de actualización de la TMC ("mensualmente", L252) | Agenda CMF de publicación TMC en Diario Oficial (ver L252) | Confirmar frecuencia o suavizar redacción (cierra L5) |
| NHV-5 | L191: CAE de tarjetas como "operación de referencia (monto y plazo estándar según la CMF)" | CMF/SERNAC metodología de tarjetas (lead: simulador SERNAC citado en CMF Educa) | Confirmar monto/plazo estándar o calificar como "según la metodología de referencia del emisor/CMF" |
| NHV-6 | L222: portabilidad financiera entre bancos (ley y alcance; el artículo no cita norma) | Ley 21.236 (confirmar N° y vigencia en BCN) | Agregar cita o calificar |
| NHV-7 | FAQ L241–242: "la CAE incorpora el IVA de los seguros" (detalle metodológico sin fuente primaria a la vista) | Metodología CAE SERNAC (guías de alcance financiero, ej. <https://www.sernac.cl/portal/618/w3-propertyvalue-21073.html>) | Confirmar o calificar como "en general" |

### Verificado limpio (con fuente primaria)

- Disambiguación CAE indicador vs CAE estudiantil (L57–64): Comisión Ingresa
  administra el Crédito con Aval del Estado — ChileAtiende
  (<https://www.chileatiende.gob.cl/instituciones/comision-ingresa>) y BCN
  ("el ente estatal encargado de la administración del crédito con aval del
  Estado"). ✓
- Comparar solo a igual monto/plazo/tipo (L142): coincide con la "regla de oro"
  SERNAC ("en un mismo plazo y sobre un mismo monto… CAE más baja").
  ✓ La conversión nominal→efectiva sin cargos es exacta:
  1,8% mensual → 23,87% (≈23,9%, L78/L154); 1,5% → 19,56% (≈19,6%, L113). ✓
- Mecánica de gracia/amortización (L167–169, Caso 1 L183): CMF Educa confirma
  que en meses de gracia "se acumulan los intereses sobre el capital" y que la
  tabla de desarrollo tiene "comportamiento cruzado… forma una X" (intereses
  primero, capital después). ✓ (La afirmación "más común en Chile" para el
  sistema francés queda como consenso experto sin fuente primaria: INFO, no
  hallazgo.)
- Ruteo de reclamos SERNAC/CMF (L221, L239) y rol orientativo de TMC/CAE/costo
  total (L125–131): consistentes con ambas fuentes. ✓

## 3. Matemática recomputada (trabajo mostrado)

Método: cuota francesa `C = P·i / (1 − (1+i)^−n)`; CAE por TIR mensual
`P_recibido = Σ C_t/(1+r)^t`, anualizada `(1+r)^12 − 1` (bisección, precisión
1e-12). Supuesto documentado: comisiones/gastos iniciales se descuentan del
monto recibido (pago al contado); seguros mensuales se suman a la cuota.

### Tabla 1 — `$2.000.000`, 1,5% mensual, 24 meses (L104–117)

| Concepto | Artículo | Recomputado | Δ |
|----------|----------|-------------|---|
| Cuota A | $98.900 | **$99.848** | −$948/mes (−0,9%; la cuota declarada implica tasa ~1,41%, no 1,50%) |
| Total A | $2.373.600 | **$2.396.357** | −$22.757 |
| Cuota B (= A + $3.500) | $102.400 | **$103.348** | −$948/mes (consistente internamente con el error de A) |
| CAE B (recibe $1.920.000) | ~26,8% | **~28,0%** | −1,2pp |
| CAE B si comisión financiada ($2.080.000 al 1,5% + seguro) | — | ~28,8% (cuota $107.342) | la cuota declarada no corresponde a ningún tratamiento estándar de la comisión |
| "Diferencia total $84.000" | $84.000 | **~$164.000** de desembolso real si la comisión es al contado ($2.537.600 vs $2.373.600) | el "Total pagado" excluye los $80.000 |

### Tabla 2 — `$3.000.000`, 36 cuotas (L145–156)

| Concepto | Artículo | Recomputado | Δ |
|----------|----------|-------------|---|
| Cuota A (1,80%) | $108.800 | **$113.951** | −$5.151/mes (−4,5%) |
| Total A | $3.916.800 | **$4.102.254** | −$185.454 |
| Cuota B capital+interés (1,50%) | $101.400 | **$108.457** | −$7.057/mes (−6,5%; la cuota declarada implica tasa ~1,10%, no 1,50%) |
| Consistencia B | subtotal $3.715.400 | `101.400×36 = 3.650.400` (≠ subtotal; difiere exactamente en los $65.000 de gastos → doble conteo, luego vuelve a sumar $65.000) | inconsistencia interna |
| CAE B (recibe $2.935.000, paga $117.957) | 24,2% | **~29,1%** | ~−5pp |
| Narrativa L156 ("B tiene cuota más baja") | cuota B < cuota A | **$117.957 > $113.951**: con números correctos B tiene cuota MÁS ALTA | conclusión invertida |

Control de sanidad: la CAE de A sin cargos recomputada por TIR da 23,87% =
conversión nominal→efectiva exacta, por lo que el método está calibrado; el
error está en las cuotas/inputs del artículo, no en el método.

## 4. Frontera de overlap con `tarjeta-credito-costo-real-chile` (0.412)

Frontera limpia y sin canibalización: el artículo CAE es dueño del marco de
comparación ex-ante (CAE + costo total + TMC, `canonicalTopic: cae-costo-real`)
y el de tarjetas es dueño de la dinámica de deuda rotativa ex-post
(`tarjeta-credito-costo-interes`); se enlazan bidireccionalmente y el Caso 3
(L190–193) delega correctamente la profundidad al artículo de tarjetas en vez
de duplicarla. No se auditaron los números del artículo de tarjetas.

## 5. Frescura

`updatedDate = validAsOf = 2026-04-12` (coherentes entre sí; ver micro-deriva
L7); `reviewPolicy annual/maxDays 365, computedAt 2026-05-06` → ventana hasta
~2027-05-06, **no vencida** (159 días al 2026-09-18). `dataTriggers: []` pese a
referencias a la TMC — aceptable porque el artículo **no cita ningún valor
TMC** (difiere a CMF, buena práctica), pero el refresh debe mantener esa
disciplina o declarar el trigger. La metodología CAE es estable, así que la
antigüedad no es el problema: **los errores aritméticos (H1/M1) justifican un
refresh fuera de ciclo** aunque la ventana anual siga verde.

## 6. Checklist NORMA_YMYL aplicada

- MUST respuesta ancla ≤2 pantallas: PASS (`articleLead.answer` directa,
  renderizada con links a calculadora/siguiente paso).
- MUST vigencia explícita: PASS con nota (`validAsOf` → "fecha de corte"
  visible vía `ArticleDecisionIntro.astro`; micro-deriva L7).
- MUST fuentes oficiales por regla crítica: PASS parcial (lead con CMF Educa +
  BCN; cuerpo con 4 fuentes) — M2 documenta cifras públicas no extraídas
  (§2.4).
- MUST excepciones: FAIL puntual en prepago (M2); resto OK.
- MUST coherencia interna: FAIL en Tabla 2 (H1, doble conteo + narrativa
  invertida).
- MUST frontmatter/frescura: PASS.
- SHOULD ejemplo numérico: presente pero **mal calculado** (H1/M1) — el SHOULD
  se vuelve el hallazgo principal.
- Reformas/calendario e inferencias etiquetadas: N/A salvo descargo ilustrativo
  (presente en Tabla 2 L158, ausente en Tabla 1 — ver M1).

## 7. Requisitos explícitos de refresh (para el editor)

1. Recalcular Tabla 2 completa (H1) y corregir o reescribir L156.
2. Recalcular Tabla 1, transparentar tratamiento de la comisión y agregar
   descargo ilustrativo (M1).
3. Completar prepago: excepciones 10% / 5.000 UF + topes 1 mes / 1,5 meses +
   N° de artículo Ley 18.010 (M2 + NHV-1).
4. Re-atribuir CAE/hoja resumen a SERNAC Financiero + CMF (L1/L2/L4 + NHV-2).
5. Re-redactar "seguros obligatorios" (L3 + NHV-3) y "tasa y cargos vs TMC"
   (L6 + NHV-1).
6. Resolver NHV-4/5/6/7 o calificar las afirmaciones.
7. Unificar vigencia cuerpo vs frontmatter (L7) y fijar `updatedDate` con
   registro de cambio según §5.3 de la norma.

## 8. Gates (solo lectura, verbatim resumido)

- `check-frontmatter`: OK (54 artículos, 0 errores bloqueantes).
- `check-editorial-structure`: WARN solo en otros 2 slugs (descripciones
  largas de `bancos-y-fintech-chile`, `finanzas-para-migrantes-chile`); nada
  para este slug.
- `check-dialect`: OK (54/54).
- `check-editorial-timeliness`: OK (`stale=0 drift=0`).
- `check-internal-links`: OK, 0 rotos (274 links); los 7 destinos internos del
  artículo existen (`/calculadoras/{credito-consumo,tarjeta-credito,prepago-credito}`,
  `/posts/{renegociacion-superir,prepago-credito-cuando-conviene-chile,tarjeta-credito-costo-real-chile,credito-hipotecario-chile-guia-completa}`).
- `check-hero-images`: OK; existen `cae-costo-real-credito-chile.avif` +
  variantes `@mobile`/`@tablet` en `public/images/hero/`.
- `volatileData`: no declarado — N/A (sin valores volátiles citados en cuerpo).
