# Verificación adversarial — remediación el-poder-del-interes-compuesto (2026-09-17)

**Rol:** ComplianceAgent, sesión fresca, sin contexto previo. No escribí los cambios revisados.
**Alcance:** diffs sin commitear en `src/data/blog/el-poder-del-interes-compuesto.mdx`
(owner) y `src/data/blog/interes-compuesto-nota-metodologica.md` (nota hermana).
Contexto leído: `docs/reports/AUDIT-el-poder-del-interes-compuesto-2026-09-17.md`
(F1–F4 en alcance del pass; F5–F15 + NHV-1..8 diferidos por diseño).
**Método:** re-derivación independiente desde fuentes primarias recuperadas por mí
hoy (SII dólar/UF, Mintrab/Hacienda/DOE/BCN para IMM), cómputo propio en §2,
grep de remanentes prohibidos, inspección de alcance y consistencia cruzada.

## 1. Fuentes primarias recuperadas por el verificador

- SII dólar observado 2025: `https://www.sii.cl/valores_y_fechas/dolar/dolar2025.htm`
  (recuperada 2026-09-17). Diciembre: día 1 = 928,16 (máximo mensual);
  29-dic = 904,54; **30-dic = 911,18 (último observado)**; 31-dic = celda vacía
  (feriado); **promedio mensual $916,16**. Ningún día de diciembre tocó 970.
- SII UF 2025: `https://www.sii.cl/valores_y_fechas/uf/uf2025.htm`
  (recuperada 2026-09-17). **31-dic-2025 = 39.727,96**.
- IMM: Mintrab `mintrab.gob.cl/reajuste-al-ingreso-minimo-mensual/` confirma
  Ley N°21.751 (DO 28.06.2025); Mintrab 30-06-2025 + Hacienda + DOE Actualidad
  Jurídica + Senado (Boletín 17.508-05): **$529.000 desde el 01-05-2025
  (retroactivo), $539.000 desde el 01-01-2026**. BCN Decreto 1783 literal:
  "En el periodo entre mayo y diciembre de 2025, cuando el ingreso mínimo
  mensual correspondía a $529.000". Dic-2025 cae en esa ventana → **$529.000**.

## 2. Aritmética propia (tolerancia: redondeo a la precisión declarada)

```text
FX cierre   = 911,18 (SII 30-dic-2025, último observado)
Headline    = 129.495 × 911,18 = 117.993.254,10 → $117.993.254 / ~$118,0M ✓
UF          = 117.993.254,10 / 39.727,96 = 2.970,03 → ~2.970 UF ✓
802 × 911,18 = 730.766,36 → ~$731.000 ✓
771 × 911,18 = 702.519,78 → ~$703.000 ✓
746 × 911,18 = 679.740,28 → ~$680.000 ✓
Colchón      = 12.950 × 911,18 = 11.799.781 → ~$11,8M ✓
Conclusión   = mín. mensualidad 679.740 > IMM 529.000 ✓ (direccional intacta)
```

Chequeo de coherencia del pasado (confirma que lo viejo estaba mal):
`129.495 × 970 = 125.610.150` (la nota vieja decía 125.610.531, ni siquiera
exacta); `125.610.531 / 38.500 = 3.262,6 → 3.263` (consistente con texto viejo).

## 3. Disposición por hunk — owner (`el-poder-del-interes-compuesto.mdx`)

| # | Hunk | Disposición + razón |
|---|---|---|
| H-O1 | title `$125M` → `$118M` | **ACCEPT** — 117,99M redondea a $118M (§2). |
| H-O2 | description `$125,6M` → `$118,0M` | **ACCEPT** — exacto a 1 decimal. |
| H-O3 | `updatedDate` 2026-03-07 → 2026-09-17 | **ACCEPT** — fecha real de revisión, dentro del alcance frontmatter. |
| H-O4 | `articleLead.answer` `$125M` → `$118M` | **ACCEPT** — misma aritmética. |
| H-O5 | `validAsOf` 2026-04-22 → 2026-09-17 | **ACCEPT** — dentro del alcance frontmatter. |
| H-O6 | Respuesta rápida `~$125,6M` → `~$118,0M` (USD 129.495 intacto) | **ACCEPT** — USD base no tocado, conversión exacta. |
| H-O7 | Resultado `$125,6M` → `$118,0M` | **ACCEPT**. |
| H-O8 | Tabla década Dic-2025 `~$125,6M` → `~$118,0M` | **ACCEPT** — filas previas intactas. |
| H-O9 | Párrafo nominal `$125,6M` → `$118,0M` | **ACCEPT**. |
| H-O10 | `S&P 500` → `NASDAQ-100` (L131, F4) | **ACCEPT** — coherente con título, supuestos L81 y nota §5. |
| H-O11 | Heading retiro `$125M` → `$118M` | **ACCEPT** — corrección de cifra en heading existente, sin sección nueva. |
| H-O12 | Mensualidades 778/748/723 → 731/703/680 (USD 802/771/746 intactos) | **ACCEPT** — coincide con mi cómputo al peso (§2). |
| H-O13 | IMM dic-2025 `$500.000` → `$529.000` (F2) | **ACCEPT** — verificado vs Ley 21.751/DOE/Hacienda, no vs el audit (§1). |
| H-O14 | Críticas nominal `$125,6M` → `$118,0M` | **ACCEPT**. |
| H-O15 | Depto `$125,6M` → `$118,0M` | **ACCEPT**. |
| H-O16 | `3.263 UF` → `2.970 UF` (F3) | **ACCEPT** — 2.970,03 → 2.970 (§2). |

## 4. Disposición por hunk — nota (`interes-compuesto-nota-metodologica.md`)

| # | Hunk | Disposición + razón |
|---|---|---|
| H-N1 | `updatedDate` 2026-04-22 → 2026-09-17 | **ACCEPT** — único cambio de frontmatter. |
| H-N2 | Intro `$125M` → `$118M` | **ACCEPT**. |
| H-N3 | Línea 2026-03-07: CLP `125,6M` → `118,0M` (USD 104.018/129.495 intactos) | **ACCEPT** — registro histórico corregido sin reescribir historia. |
| H-N4 | Tabla IMM 2025 `$500.000` → `$529.000` | **ACCEPT** — §1. Fila bienal intacta en lo demás (F7 diferido). |
| H-N5 | Tabla FX 2025 `970` → `911,18` | **ACCEPT** — último observado SII dic-2025 (§1). |
| H-N6 | Frase cierre `970 CLP/USD` → `911,18 CLP/USD` | **ACCEPT** — idéntica fuente. |
| H-N7 | Tabla resultados: `CLP a 970 / $125.610.531 (~$125,6M)` → `CLP a 911,18 / $117.993.254 (~$118,0M)` | **ACCEPT** — 117.993.254,10 trunca/redondea al peso declarado (§2). |
| H-N8 | Colchón `~$12,6M` → `~$11,8M` (USD 12.950 intacto) | **ACCEPT** — 11.799.781 → $11,8M (§2). |
| H-N9 | Tabla mensualidades 778/748/723 → 731/703/680 | **ACCEPT** — coincide con §2 al peso. |
| H-N10 | UF `~$38.500 / 3.263` → `$39.727,96 al 31-dic / 2.970` | **ACCEPT** — ambos valores SII-verificados (§1, §2). |

**Conteo:** 26 hunks revisados — 26 ACCEPT, 0 REJECT.

## 5. Remanentes prohibidos (grep sobre ambos archivos en disco)

- `970` como cierre dic-2025: **ausente**. Única subcadena `970` restante está
  dentro de `2.970` (nueva cifra UF) en owner L178 y nota L257 — no es el FX.
- `$125,6` / `$125M`: **cero ocurrencias** en ambos archivos.
- `$500.000` como IMM dic-2025: **ausente**. La subcadena `$500.000` solo
  sobrevive dentro del rango de arriendos `$350.000 a $500.000` (owner L180,
  nota L259) — semántica distinta (arriendo, no IMM), preexistente, fuera de F2.
- `~$38.500`: **cero ocurrencias**.
- `3.263 UF`: **cero ocurrencias** (solo `2.970`).
- `S&P 500`: **cero ocurrencias** (L131 dice NASDAQ-100).

## 6. Disciplina de alcance

- Slug, canonical, `topicRole`/`canonicalTopic`, `heroImage`, rutas, código:
  **intactos** (diff no los toca; owner L5/L18-L19/L23, nota L5/L15-L16/L21
  verificados en disco).
- Frontmatter owner: solo title/description/`updatedDate`/`articleLead.validAsOf`.
  Frontmatter nota: solo `updatedDate`. `pubDate`, tags, `reviewPolicy`
  (`dataTriggers: []`, `computedAt: 2026-05-06`), `unlisted`, hero: intactos.
- Sin secciones, bloques, footnotes ni labels nuevos: headings idénticos salvo
  corrección de cifra en H-O11; nota §§1–11 sin adiciones.
- F5–F15/NHV no contrabandeados: `13,7x` se retiene sin múltiplo dual (F5
  diferido, correcto); sin explicación de numerario; sin prosa de changelog;
  sin tabla INE (F8/NHV-4); sin URLs inmobiliarias (F9/NHV-7, tabla §11
  intacta); sin footnote AFP (F10/NHV-8, §3 intacto al 17,6%); sin
  `volatileData`/triggers (F14 intacto `[]`); serie NDX y drawdown 78%
  intactos (F11–F12/NHV-5–6); lagunas `seed 42` intactas (F13/NHV-3);
  edad 54 sin aclaración AFP (F15 intacto).

## 7. Consistencia cruzada owner ↔ nota

Headline `$118,0M` / FX `911,18` (nota lo fija, owner lo referencia) /
UF `2.970 @ $39.727,96` / IMM `$529.000` / mensualidades
731/703/680 ↔ USD 802/771/746 / colchón `$11,8M` (nota; owner no lo declara):
**idénticos en ambos archivos, sin divergencias**.

## 8. Residuales (no bloqueantes; fuera del alcance F1–F4 del pass)

- R1: owner L200 `Revisado el: 2026-04-22` quedó desfasado vs
  `updatedDate`/`validAsOf` 2026-09-17 (cola de F6 en cuerpo).
- R2: `13,7x` junto a CLP implica 117,99M/6,18M ≈ 19,1x en CLP (F5 diferido).
- R3: checkpoints IMM bienales omiten escalones Ley 21.578/21.751 y el tramo
  $510.636 ene–abr 2025 (F7, NHV-1–NHV-3).
- R4: checkpoints FX históricos + interpolación lineal intactos salvo fila 2025.
- R5: F8–F15/NHV-4–NHV-8 intactos por diseño (INE, inmobiliario, AFP, TR, drawdown).
- R6: atribución FX sigue citando BCentral mientras el cierre se fija desde la
  serie observada publicada por SII (misma serie oficial; nota menor).
- R7: sin línea de changelog 2026-09-17 en cuerpo (pedido F6, fuera del alcance
  frontmatter pactado).

## 9. Veredicto

**ACCEPT DIFF.** Las 26 modificaciones F1–F4 son aritméticamente exactas contra
fuentes primarias recuperadas por el verificador, sin remanentes prohibidos,
sin quiebres de alcance y con consistencia cruzada total. Residuales R1–R7 son
ítems diferidos o menores, no bloqueantes para este pass.
