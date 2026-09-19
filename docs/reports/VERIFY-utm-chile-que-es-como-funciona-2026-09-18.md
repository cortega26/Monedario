# VERIFY — `utm-chile-que-es-como-funciona` (2026-09-18)

- **Rol:** ComplianceAgent, sesión fresca, sin contexto previo. No escribí los cambios.
- **Alcance ordenado:** solo `src/data/blog/utm-chile-que-es-como-funciona.md`
  (diff workdir NO commiteado). No tocar `/calculadoras/conversor-utm/` ni medición.
- **Contexto leído:** `docs/reports/AUDIT-utm-chile-que-es-como-funciona-2026-09-18.md`.
- **Fuentes primarias recuperadas por mí (2026-09-18, UTC):**
  - `https://www.sii.cl/valores_y_fechas/utm/utm2026.htm` (tabla UTM 2026)
  - `https://www.sii.cl/valores_y_fechas/utm/utm2025.htm` (UTM dic-2025)
  - `https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm`
    (tramos 2da categoría, sección Septiembre 2026)
  - `https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html`
    (UTA anual, exención IGC 13,5 UTA, bonificación APV art. 20 O DL 3500)
  - Snapshot determinista: `src/infrastructure/economic/economic-parameters.snapshot.json`
- **Archivos modificados por mí:** solo este reporte. Artículo intacto. Sin commits.

## 1. Recomputación independiente (mi aritmética vs SII vs artículo)

Valores base extraídos por mí del SII:

- UTM sep-2026 = **$71.721**; UTM oct-2026 = **$72.151** (ya publicada).
- UTM dic-2025 = **$69.542** (nov-2025 = dic-2025 = $69.542 por IPC-nov −0,2%).

| Magnitud | Mi cálculo | SII oficial | Artículo (nuevo) | Match |
| --- | --- | --- | --- | --- |
| 1 UTM sep-2026 | 71.721 | 71.721 | $71.721 | SÍ |
| 2 UTM | 143.442 | — (derivado) | ~$143.442 | SÍ |
| 5 UTM | 358.605 | — (derivado) | ~$358.605 | SÍ |
| 13,5 UTM sep | 71.721 × 13,5 = 968.233,5 | $968.233,50 (tabla 2da cat. sep) | $968.233 (rotulado "aproximado") | SÍ (redondeo declarado) |
| 30 UTM sep | 2.151.630 | $2.151.630,00 | $2.151.630 | SÍ |
| 50 UTM sep | 3.586.050 | $3.586.050,00 | $3.586.050 | SÍ |
| 70 UTM sep | 5.020.470 | $5.020.470,00 | $5.020.470 | SÍ |
| 90 UTM sep | 6.454.890 | $6.454.890,00 | $6.454.890 | SÍ |
| 120 UTM sep | 8.606.520 | $8.606.520,00 | $8.606.520 | SÍ |
| 310 UTM sep | 22.233.510 | $22.233.510,00 | $22.233.510 | SÍ |
| UTA anual AT2026 | 69.542 × 12 = 834.504 | $834.504 ("1 UTA del mes dic. de 2025") | $834.504 (= 12 × $69.542) | SÍ |
| 6 UTM dic-2025 (APV) | 69.542 × 6 = 417.252 | $417.252 ("6 UTM dic. de 2025", art. 20 letra O DL 3500) | $417.252 | SÍ |
| 13,5 UTA (IGC) | 834.504 × 13,5 = 11.265.804 | $11.265.804 ("13,5 UTA del mes dic. de 2025") | $11.265.804 (AT2026) | SÍ |

Convención de bordes de la tabla 2da categoría: el SII publica
`$968.233,51` como inicio del tramo 4%; el artículo usa `$968.234`. Misma
convención (+$1 por redondeo al peso) en los 7 bordes. Correcto.

Snapshot cruza bien: `utm: 71721`, `uta: 834504` — idénticos a mi extracción SII.

## 2. Remanentes prohibidos (grep sobre el artículo en workdir)

| Patrón | Resultado |
| --- | --- |
| `$69.889` como valor vigente | **0 matches** — eliminado |
| `$838.668` (UTA mensual como anual) | **0 matches** — eliminado |
| `LIR Art. 42 bis` para el bono 6 UTM | **0 matches** — eliminado (solo subsiste `Art. 43 N°1 LIR` para 2da categoría, correcto y ajeno al bono) |
| `$419.334` | **0 matches** — eliminado |
| `Impuesto Única 2da` (typo F-05) | **0 matches** — corregido a `Impuesto Único` |

## 3. Disposición por hunk (diff `4119f2f3..a8d4e7b2`, 8 hunks)

- **H-1 — frontmatter `updatedDate`: 2026-04-09 → 2026-09-18.** ACCEPT.
  Fecha de refresh real; `pubDate` intacto. Sin otros cambios de frontmatter.
- **H-2 — `articleLead.validAsOf`: 2026-04-09 → 2026-09-18.** ACCEPT.
  Coherente con H-1 y con el ancla septiembre verificada en §1.
- **H-3 — FAQ "¿Cuánto vale la UTM hoy?": ($69.889/abril) → ($71.721/septiembre).**
  ACCEPT. $71.721 = UTM sep-2026 SII (§1). Redacción de vigencia mensual intacta.
- **H-4 — Respuesta rápida: valor + vigencia (abril/$69.889 → septiembre/$71.721).**
  ACCEPT. Corrige el HIGH F-01 (ancla fácticamente falsa). Fuente SII intacta.
- **H-5 — Bloque UTA: elimina ejemplo "UTA abril $838.668 = $69.889 × 12";**
  **pone UTA anual $834.504 = 12 × $69.542 (UTM dic-2025) + advertencia de que la**
  **columna mensual SII no sirve para el IGC.** ACCEPT. Resuelve F-02 y la
  contradicción interna MUST-8. Aritmética verificada en §1.
- **H-6 — Tabla multas 1/2/5 UTM re-anclada a $71.721.**
  ACCEPT. 2 × 71.721 = 143.442 ✓; 5 × 71.721 = 358.605 ✓ (§1).
- **H-7 — Bloque tributario + APV (hunk grande, subdisposición):**
  - **H-7a — Umbral 13,5 UTM ($943.501 → $968.233) + tabla 8 tramos 2da categoría.**
    ACCEPT. Los 7 topes coinciden peso a peso con la sección Septiembre 2026 del
    SII (968.233,50 / 2.151.630 / 3.586.050 / 5.020.470 / 6.454.890 / 8.606.520 /
    22.233.510); tasas 4 / 8 / 13,5 / 23 / 30,4 / 35 / 40% intactas y correctas.
  - **H-7b — Typo `Única` → `Único`.** ACCEPT. F-05 cerrado; `href` inalterado.
  - **H-7c — IGC: añade ancla "13,5 UTA de dic. año anterior: $11.265.804 (AT2026)".**
    ACCEPT. 834.504 × 13,5 = 11.265.804 ✓ contra tabla SII AT2026 (§1). Cierra F-04.
  - **H-7d — APV: `LIR Art. 42 bis` → `art. 20 letra O) del D.L. N° 3.500`;**
    **`6 × $69.889 = ~$419.334` → `6 × $69.542 (dic-2025) = $417.252`.** ACCEPT.
    Triple corrección F-03 verificada contra fuente primaria SII (concepto
    "Límite bonificación fiscal … art. 20 letra O) del D.L. N° 3.500 …
    6 UTM dic. de 2025 … $417.252"). Tasa 15% retenida sin cambios (ver R-3).
- **H-8 — Disclaimer final re-anclado ($69.889/abril → $71.721/septiembre).**
  ACCEPT. Sin debilitamiento del aviso; exige verificar en SII.cl.

**Conteo: 8/8 hunks ACCEPT (H-7 con 4 sub-ítems, todos ACCEPT). 0 REJECT.**

## 4. Alcance (scope)

- El diff del artículo toca **un solo archivo**; dentro de él: fechas (H-1/H-2),
  cifras re-ancladas, corrección legal APV, ancla IGC y typo. Nada más.
- Sin cambios de `slug`, `title`, `heroImage`, `category`, `cluster`, `topicRole`,
  `canonicalTopic`, rutas, links (`href` intactos) ni snippets.
- Sin diff en `src/pages/calculadoras/*`, `UtmPostResultActions.astro` ni
  calculadoras: verificado `git diff --name-only` (vacío en esas rutas).
- Otros diffs del workdir (`NextSteps.astro` cosmético `min-h-[24px]`→`min-h-6`,
  `editorial-topic-policy.mjs` entrada ajena de cotización voluntaria, otros
  artículos, `bcn-cite.mjs`, untracked) son **preexistentes y sin acople UTM**
  (grep `utm` sobre esos diffs: vacío). No se atribuyen a esta remediación
  ni se revisan aquí.

## 5. Contrabando H/F (debe NO haberse colado)

- **H-01** (base normativa DL 830 / desfase IPC / "primer día hábil"):
  no se añadió cita legal nueva; la frase "primer día hábil" y "IPC del mes
  anterior" subsisten como redacción preexistente. NO smuggled — sigue pendiente
  humano (R-3).
- **H-02** (multas: UTM al pago vs infracción): párrafo intacto (ll. 58, 165),
  sin nueva cita a Ley 18.290. NO smuggled — sigue pendiente humano (R-3).
- **H-03** (tasa 15% APV): retenida tal cual estaba; solo cambió la atribución
  (verificada en SII) y la base/monto. Retener ≠ afirmar de nuevo. NO smuggled —
  la tasa sigue pendiente de cierre humano vía BCN (R-3).
- **F-06** (simplificación IPC mes anterior): retenida, tal como la auditoría
  permitía ("mantener simplificación"). NO smuggled.
- **F-07** (hero responsive): `heroImage` intacto, sin variantes añadidas.
  NO smuggled (oportunidad, no defecto).

## 6. Residuales

- **R-1 (inconsistencia de banner, la señalada):** l. 86 conserva
  `Información vigente al 2026-04-09` mientras `updatedDate`/`validAsOf` dicen
  2026-09-18. Confirmado presente. Residual menor: el cuerpo ya etiqueta
  septiembre en 6+ lugares, pero el banner contradice la fecha de refresh.
- **R-2 (frescura):** SII ya publica UTM oct-2026 = **$72.151**. El ancla
  septiembre es correcta para `validAsOf: 2026-09-18`; deriva conocida, no rechazo.
- **R-3 (H-01/H-02/H-03):** siguen NEEDS-HUMAN-VERIFY (BCN bloquea fetch
  automatizado). Nada que la remediación pudiera cerrar con SII quedó abierto.
- **R-4 (redondeo declarado):** `$968.233` vs SII `$968.233,50`; el artículo lo
  rotula "aproximado"/"orientativo" y la tabla SII exacta está enlazada. Aceptable.
- **R-5 (F-07):** hero sigue en variante base única. Oportunidad, no defecto.
- **R-6 (cadencia):** `reviewPolicy semiannual`/`sync: reference` intactos; la
  deriva +2,6% en 5 meses sugiere evaluar `sync: strict` o cadencia mensual,
  pero es decisión de política con ADR — correctamente no tocada aquí.

## 7. No aplicado pero exigible (ítem 5 del mandato)

Revisada la §7 de la auditoría contra el diff: requisitos 1–4 y typo de 6
aplicados; H-01/H-02/H-03 correctamente reservados a humano; hero (F-07)
es tarea de assets, fuera de un refresh de valores. **Nada safely-applicable
quedó omitido.** Nota: no existe convención de "registro de cambio" NORMA_YMYL
§5.3 en los artículos del repo (grep vacío, incluidos los otros refreshes
hermanos en el workdir), por lo que su ausencia no es omisión.

## 8. Veredicto

**APROBADO — 8/8 hunks ACCEPT, 0 REJECT.** Cada cifra del artículo coincide con
mi aritmética independiente desde las tablas SII recuperadas por mí hoy
(UTM sep $71.721; UTA $834.504 = 12 × $69.542; APV $417.252 = 6 × $69.542;
IGC $11.265.804 = 13,5 × $834.504; tramos 30/50/70/90/120/310 UTM exactos).
Cero remanentes prohibidos. Alcance limpio de un archivo. Sin contrabando H/F.
Residuales: banner R-1 (menor), frescura oct-2026 R-2 (informativo),
verificaciones humanas BCN R-3 (preexistentes).

**STOP triggers activados: ninguno.**
