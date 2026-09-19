# Auditoría — `utm-chile-que-es-como-funciona`

- **Fecha de auditoría:** 2026-09-18 (UTC)
- **Archivo auditado:** `src/data/blog/utm-chile-que-es-como-funciona.md`
- **Frontmatter:** pubDate = updatedDate = 2026-04-09 · 162 días de antigüedad
- **Tipo:** READ-ONLY. No se modificó ningún archivo existente. Alcance: solo artículo
  (calculadora `/calculadoras/conversor-utm/`, snippets y medición: fuera de alcance).
- **Veredicto:** **FINDINGS** — 1 HIGH · 3 MEDIUM · 3 LOW · 3 NEEDS-HUMAN-VERIFY

## 1. Resumen ejecutivo

La definición estructural (qué es la UTM, reajuste por IPC, publicación mensual del
SII, usos, diferencia con UF/UTA) es **estable y correcta**. Todas las cifras en
pesos ancladas a la UTM de **abril 2026 ($69.889)** eran exactas a fecha de
publicación (verificado contra tablas SII), pero hoy están **obsoletas**: la UTM
vigente es **$71.721 (septiembre 2026)** y octubre 2026 (**$72.151**) ya está
publicada. El bloque de respuesta ancla ("Valor vigente: $69.889") es hoy
fácticamente falso para un lector que llega desde Google, aunque el artículo lo
etiqueta con vigencia de abril. Además hay un hallazgo de precisión YMYL real
(APV Régimen A: cita legal incorrecta + mes base incorrecto + cifra que nunca fue
correcta) y una contradicción interna sobre la UTA. Los 6 gates corren en verde y
ninguno señala este slug (falso negativo parcial documentado en §5).

## 2. Tabla de hallazgos

| #    | Afirmación + ubicación                              | Severidad | Evidencia / URL o NEEDS-HUMAN-VERIFY | Fix sugerido (solo refresh)                              |
| ---- | --------------------------------------------------- | --------- | ------------------------------------ | -------------------------------------------------------- |
| F-01 | "Valor vigente (abril 2026): $69.889" (línea 78, respuesta rápida); FAQ "($69.889) corresponde a abril 2026" (l. 52); ejemplos de multas 1/2/5 UTM (ll. 170-174); umbral 13,5 UTM = $943.501 + tabla completa de tramos 2da categoría (ll. 184-195); ejemplo APV 6 × $69.889 (l. 209); "válido durante todo abril 2026" (l. 82) | HIGH | SII tabla UTM 2026 (recuperada 2026-09-18): sep 2026 = **$71.721**, oct 2026 = **$72.151** — https://www.sii.cl/valores_y_fechas/utm/utm2026.htm. Snapshot determinista confirma UTM sep = 71721 (`src/infrastructure/economic/economic-parameters.snapshot.json`, `indicatorUpdatedAt.utm: 2026-09-01`). SII 2da categoría sep 2026: exento hasta **$968.233,50** (vs $943.501 del artículo) — https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm. Deriva: +2,6% (sep) / +3,2% (oct) | Re-anclar a mes vigente (o quitar cifras absolutas y derivar solo en UTM + enlace a conversor/SII). Actualizar `updatedDate` + `articleLead.validAsOf` |
| F-02 | "Referencia SII para UTA abril 2026: $838.668 (= $69.889 × 12)" (l. 136) contradice la definición propia "UTA = 12 × UTM de diciembre" (tabla l. 125, ll. 131, 246) | MEDIUM | Columna mensual "UTA" del SII es UTM×12 del mes (referencia), no la UTA anual tributaria. SII AT 2026 ancla la UTA anual a **diciembre 2025: $834.504** — https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html. El lector puede aplicar $838.668 como UTA anual (errónea) | Eliminar el ejemplo "UTA abril" o re-etiquetarlo explícitamente como referencia mensual no válida para IGC; dar la UTA anual vigente con su año tributario |
| F-03 | "APV Régimen A… 6 UTM anuales de subsidio máximo según LIR Art. 42 bis" + ejemplo "6 × $69.889 = ~$419.334" (ll. 207-209) | MEDIUM | SII AT 2026: "Límite bonificación fiscal **art. 20 letra O) del D.L. N° 3.500**: **6 UTM dic. de 2025 = $417.252**"; la rebaja **art. 42 bis LIR** es la de **600 UF** (Régimen B), no el bono de 6 UTM — https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html. Triple error: (a) cita legal incorrecta, (b) mes base incorrecto (abril vs diciembre), (c) $419.334 ≠ $417.252 oficial (nunca fue correcto) | Corregir cita a DL 3500 art. 20 O, base dic-año-anterior, cifra oficial; verificar tasa 15% (ver H-03) |
| F-04 | "El umbral estándar de exención [IGC] es 13,5 UTA anuales" (l. 203) sin ancla de año ni cifra en pesos | MEDIUM | Verificado el umbral como regla: SII AT 2026, "Exención de IGC (art. 52 y 52 bis): **13,5 UTA del mes dic. de 2025 = $11.265.804**" — https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html. Falta el ancla temporal que la propia NORMA_YMYL §1.1 MUST-3 exige | Añadir "…13,5 UTA de diciembre del año anterior ($11.265.804 para AT 2026)" + fuente |
| F-05 | "Fuente: SII — Impuesto Única 2da Categoría 2026" (l. 197) | LOW | Typo: "Única" → "Único" (el tributo es masculino; el SII lo titula "Impuesto Único") | Corrección ortográfica en refresh |
| F-06 | "Se reajusta cada mes según la variación del IPC del mes anterior" (ll. 30, 76, 104) | LOW (informativa) | Direccionalmente correcto, pero los datos primarios muestran que la UTM(M) replica el IPC(M−2): UTM-jun +1,3% = IPC-abr 1,3%; UTM-sep +0,1% = IPC-jul 0,1%; UTM-ago = UTM-jul con IPC-jun 0,0% — https://www.sii.cl/valores_y_fechas/utm/utm2026.htm. Es el desfase de publicación del IPC, redacción exacta en DL 830 pendiente (H-01) | Mantener simplificación o precisar "último IPC publicado"; no bloquear |
| F-07 | Hero solo en variante base (10 KB, sin `@mobile`/`@tablet`) | LOW (informativa) | `public/images/hero/utm-chile-que-es-como-funciona.avif` existe (10.326 B); el resto del catálogo publica 3 variantes. Gate `check-hero-images` en modo legacy-compatible: OK | Generar variantes responsive en refresh (oportunidad, no defecto) |

Verificaciones positivas (adversariales, contra fuente primaria el 2026-09-18):

- UTM abril 2026 = $69.889 y UTA mensual = $838.668: **exactos** en SII (el
  artículo era correcto a su fecha; la tabla SII muestra mar-2026 = abr-2026 =
  $69.889 por IPC-feb 0,0%).
- Tabla de tramos 2da categoría abril (umbrales $943.501 / $2.096.670 /
  $3.494.450 / $4.892.230 / $6.290.010 / $8.386.680 / $21.665.590 y tasas
  4 / 8 / 13,5 / 23 / 30,4 / 35 / 40%): **exacta** contra la sección "Abril 2026"
  de https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm
  (13,5 × 69.889 = $943.501,50 ✓; 30/50/70/90/120/310 UTM ✓).
- Snapshot determinista cruza bien: UTM 71721 = SII sep 2026; UTA 834504 = UTA
  anual dic-2025 ($69.542 × 12); prev UTM ago 71649 = SII ago 2026 ✓.
- Estructura 13,5 UTM exención mensual 2da categoría confirmada en el texto del
  SII ("…cuyo monto excede mensualmente las 13,5 UTM").

NEEDS-HUMAN-VERIFY (LeyChile bloqueó el fetch automatizado — la app BCN devuelve
muro JS sin contenido; URLs exactas + qué confirmar):

- **H-01** — https://www.bcn.cl/leychile/navegar?idNorma=6374 (DL 830, Código
  Tributario, aprox. arts. 24-30): confirmar texto de definición de UTM/UTA,
  mecánica de reajuste mensual por IPC (y redacción exacta del desfase, ver F-06)
  y si la publicación el "primer día hábil" tiene base normativa o es práctica
  SII. Nunca completar desde memoria.
- **H-02** — https://www.bcn.cl/leychile/navegar?idNorma=1374 (Ley de Tránsito
  N°18.290 — verificar idNorma en buscador BCN): confirmar que las sanciones se
  expresan en UTM y, crítico, la afirmación del artículo (l. 166) de que el pago
  usa **la UTM vigente al pago y no a la infracción**.
- **H-03** — DL N° 3.500 art. 20 letra O) vía buscador BCN (y LIR art. 42 bis
  para contraste): confirmar tasa del **15%** de bonificación Régimen A y tope de
  **6 UTM** (el tope/monto $417.252 ya está verificado en SII; falta la tasa y la
  atribución normativa exacta para cerrar F-03).

## 3. Evaluación de frescura

- Edad: 162 días (pub 2026-04-09). Política derivada: `semiannual` / 180 días
  (`reviewPolicy` coherente: `volatileData` en `sync: reference` —no `strict`— y
  sin shortcodes `[[utm` en el cuerpo, por lo que `dataTriggers: []` es correcto
  según `scripts/compute-review-policies.mjs`).
- Vencimiento: **2026-10-06 (18 días)**. El gate `check-editorial-timeliness`
  reporta `stale: false`, pero su registro para este slug muestra
  `snapshotValue: 71721` frente a $69.889 publicado con `valueMatches: null`:
  el gate **no compara valores**, solo cadencia — verde por calendario, rojo por
  economía. Los 6 gates están en verde sin señalar este slug (ver §5).
- Deriva económica acumulada: UTM +2,6% (sep) / +3,2% (oct ya publicada);
  todos los ejemplos en pesos del artículo subestiman la realidad actual
  (umbral exención: $943.501 vs $968.234 vigentes).
- Contrapesos existentes (correctos, deben conservarse): etiqueta de vigencia
  mensual en respuesta rápida (l. 82), banner "vigente al 2026-04-09" (l. 86),
  límites del `articleLead` ("tablas orientativas para el mes indicado"),
  `articleAdvisory`, aviso de valor cambiante (ll. 176, 238) y CTA al conversor
  para el valor exacto actual.

## 4. NORMA_YMYL (checklist aplicada)

- MUST-1/2 respuesta ancla ≤ 2 pantallas, afirmativa: **cumple en forma**
  (bloque "Respuesta rápida" con regla + valor + fuente), **falla en fondo**:
  el valor ancla ($69.889 "vigente") es falso hoy → principal causa del HIGH.
- MUST-3 vigencia explícita: **cumple** (abril 2026 etiquetado en 6+ lugares,
  `validAsOf: 2026-04-09`).
- MUST-4 fuentes oficiales mínimas: **cumple parcial** — 4 fuentes SII/BC/INE
  enlazadas y verificables; pero F-03 cita la norma equivocada y F-04 omite el
  ancla anual.
- MUST-5 excepciones: **cumple** (deflación, "puede variar por mes", orientación
  tributaria).
- MUST-7 inferencias etiquetadas: **cumple** ("orientativo" en ejemplos y
  tablas; tablas arancelarias con limitador).
- MUST-8 coherencia interna: **falla parcial** (F-02: definición UTA vs ejemplo
  "UTA abril").
- Scorecard estimado: respuesta ancla 6/10 · precisión+fuentes 7/10 ·
  vigencia+calendario 7/10 · excepciones+cobertura 9/10 · claridad 9/10 →
  **≈ 7,2/10 (< 9,5: no publicable como pieza nueva; requiere refresh)**.

## 5. Gates read-only (verbatim, nada señala este slug)

- `check-frontmatter`: `Scanned 54 articles … [check-frontmatter] OK (no blocking errors).`
- `check-editorial-structure`: WARN solo por 2 slugs ajenos (descripciones
  largas de `bancos-y-fintech-chile`, `finanzas-para-migrantes-chile` + sus
  0 intra-cluster links); este slug sin flags. Exit 0.
- `check-dialect`: `OK. validated=54 files skipped_by_marker=0`. Exit 0.
- `check-editorial-timeliness`: `published=54 stale=0 drift=0`. Exit 0.
  (Falso negativo parcial: registro del slug con `daysUntilDue: 18`,
  `volatileData[0].snapshotValue: 71721`, `valueMatches: null` — ver §3.)
- `check-internal-links`: `Scanned 54 published articles, 274 internal links.
  No broken links found.` (1 huérfano ajeno:
  `cotizacion-voluntaria-afp-independiente.md`). Exit 0.
- `check-hero-images`: `Checked published articles: 54 … OK` (modo
  legacy-compatible). Exit 0.

## 6. Enlaces internos y activos (solo lectura)

- Salientes del artículo (todos resuelven — gate verde):
  `/calculadoras/conversor-utm/`, `/calculadoras/impuesto-segunda-categoria/`,
  `/calculadoras/operacion-renta/`, `/calculadoras/conversor-uf/`,
  `/guias/uf-costo-de-vida/`, `/glosario/utm/`, `/glosario/uta/`,
  `/posts/que-es-el-ipc-chile-como-se-calcula/`, `/posts/que-es-la-uf/`.
- Entrantes: `src/pages/calculadoras/conversor-utm.astro` (vía `getPath`),
  `src/components/UtmPostResultActions.astro`, glosarios `utm`/`uta`/`inflacion`,
  `que-es-la-uf.md`, `que-es-el-ipc-chile-como-se-calcula.md`,
  `src/pages/calendario.astro`; `topicRole: owner` de `utm-uta-unidades-tributarias`
  consistente con `src/config/editorial-topic-policy.mjs`. No tocar en refresh.
- `volatileData` declara `economic.utm.value` + `economic.ipc.monthly_variation`
  (`sync: reference`): la UTM **sí está registrada** — no aplica flag de
  "volatile no registrado".

## 7. Requisitos explícitos de refresh (para la sesión de edición)

1. Re-anclar todas las cifras a la UTM del mes vigente al editar (hoy: sep 2026
   $71.721; verificar si ya rige oct 2026 $72.151) o convertir ejemplos a UTM
   puras + CTA al conversor; actualizar respuesta rápida, FAQ "¿Cuánto vale?",
   tabla 2da categoría, ejemplos de multas y APV.
2. Reescribir el bloque UTA (F-02): solo UTA anual con año tributario explícito.
3. Corregir bloque APV (F-03): cita DL 3500 art. 20 O, base diciembre año
   anterior, cifra oficial; cerrar H-03 para la tasa 15%.
4. Anclar IGC 13,5 UTA con año + pesos (F-04).
5. Cerrar H-01/H-02 con texto legal verificado por humano antes de reafirmar
   "primer día hábil" y "UTM al pago".
6. Corregir typo F-05; evaluar variantes hero responsive (F-07).
7. Actualizar `updatedDate` + `articleLead.validAsOf` + registro de cambio
   (NORMA_YMYL §5.3); considerar `sync: strict` o cadencia mensual dada la
   deriva observada (decisión de política, con ADR si cambia contratos).
8. Re-correr `pnpm run check:ci` + gates post-build tras el refresh.
