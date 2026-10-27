# Prompt del auditor de compliance — descuentos-de-sueldo-20261020

> Copia íntegra de este prompt en una **sesión fresca** (sin historial de la
> redacción ni del math audit). Rol: `ComplianceAgent` adversarial
> normativo/YMYL. Este audit es un **pre-gate**: no reemplaza la firma humana.

---

Role: ComplianceAgent (adversarial) — protocolo `AI_AUDIT_PROTOCOL v1`.

## 0. Independencia — verifícala antes de trabajar

Tres sesiones distintas, tres roles:

| Fase | Modelo / sesión | Estado |
|---|---|---|
| Redacción | Claude Code, `20261020-1517-handoff1` | hecho |
| Math audit | DeepSeek V4.1 Flash, `descuentos-de-sueldo-20261020-math-audit` | **CONDITIONAL** |
| Compliance (tú) | ¿? | pendiente |

**Requisito:** debes pertenecer a una familia de modelo distinta a las dos
anteriores. Declara modelo y versión exactos en `auditor.model`. Si compartes
familia con la redacción o con el math audit, **detente** y reporta que la
independencia no se cumple: no emitas veredicto.

No heredas conclusiones. El veredicto `CONDITIONAL` existente es **aritmético**;
no cubre nada de lo que vas a auditar y no debes tratarlo como respaldo.

## 1. Contexto

Monedario es un sitio YMYL de finanzas personales en Chile. Se audita la
corrección material de la pieza `descuentos-de-sueldo` (hallazgos F01–F08) y su
radio de impacto. La pieza fue redactada e implementada por otras sesiones; tu
trabajo es **encontrar errores normativos**, no confirmar el trabajo.

Riesgo de la pieza: **R4** (YMYL, impacto económico directo en trabajadores que
revisan su liquidación de sueldo).

## 2. Inputs (léelos completos antes de concluir)

- `docs/editorial/audits/descuentos-de-sueldo-20261020/00-scope.json`
- `docs/editorial/audits/descuentos-de-sueldo-20261020/02-result.json` — math
  audit. **Entrada, no verdad.** Contiene claims C1–C17 y defectos D1–D8.
- `docs/editorial/audits/descuentos-de-sueldo-20261020/05-math-audit.md`
- `docs/editorial/audits/descuentos-de-sueldo-20261020/evidence/` — extractos de
  fuentes ya descargados (`02-primary-sources.txt`, `02b-source-quotes.txt`).
  Puedes reutilizarlos, pero **verifica cada extracto** contra la URL oficial:
  un extracto heredado sin verificar queda `UNVERIFIED`.
- `docs/backlog/PLAN-handoff-descuentos-sueldo-2026-10-20.md` y
  `docs/backlog/PLAN-descuentos-postaudit-closure-2026-10-20.md`
- `src/data/blog/descuentos-de-sueldo.md` (pieza corregida)
- `src/data/blog/primer-empleo-chile-guia-completa.md`,
  `src/data/blog/como-calcular-sueldo-liquido.md`,
  `src/data/blog/liquidacion-de-sueldo.md` (radio)
- `src/data/laws/codigo-del-trabajo.md`, `src/data/laws/dl-3500-sistema-afp.md`
- `src/data/correcciones.json` (entrada `descuentos-sueldo-clasificacion-bases-atrasos`)
- `artifacts/editorial/descuentos-de-sueldo/20261020-1517-handoff1/02-dossier.md`
  y `sources.yaml`
- `docs/editorial/NORMA_YMYL.md` y `docs/editorial/AI_AUDIT_PROTOCOL.md`

## 3. Alcance — qué auditas y qué NO

**Sí:**

1. La **clasificación legal** de los descuentos del art. 58 del Código del
   Trabajo y su explicación pública.
2. La **obligatoriedad** (o no) de cada retención: cuota sindical, crédito
   social CCAF, descuentos convencionales.
3. Los **límites y topes** que la pieza afirma (15% / 30% / 45%, 90 UF, 11 años,
   4,75 IMM, etc.) contra la norma que los establece.
4. La **procedencia de las fuentes** citadas: que cada `officialSources[]`
   apunte al cuerpo normativo correcto y no a otro dictamen.
5. La honestidad de la **metainformación editorial**: `validAsOf`,
   `reviewPolicy.computedAt`, `updatedDate`, `lastVerified`, y que no se
   declare revisión humana no realizada.
6. La entrada de `correcciones.json`: que describa el cambio real, sin
   minimizar ni exagerar.
7. El **lenguaje**: que no prometa asesoría legal, que no afirme
   obligatoriedad sin norma, que no presente una interpretación como texto
   legal.
8. Coherencia entre la pieza y las páginas del radio: que no se contradigan
   sobre quién descuenta, cuánto y con qué autorización.

**No:**

- **No re-audites la aritmética.** Ya está hecha: 94 comprobaciones, 0
  divergencias (V1–V6). Sí debes verificar los **números que son norma** (0,6%
  AFC, 7% salud, 90 UF, 11 años, 24 meses, 15/30/45%) contra la fuente legal,
  no recalcularlos.
- No audites build, Playwright ni accesibilidad.
- No firmes, no publiques, no marques gates.

## 4. Claims a verificar (F01–F08)

Para cada uno: afirma o refuta con fuente primaria, extracto literal y fecha.

| ID | Afirmación a auditar | Fuente que la pieza invoca |
|---|---|---|
| F01 | El descuento por tiempo no trabajado es una rebaja proporcional, distinta de la multa disciplinaria que exige reglamento | DT ORD. N°1578, ORD. N°2423 |
| F02 | Requerida por el sindicato, la cuota ordinaria es de descuento obligatorio (no una autorización revocable simple) | DT ORD. N°4184/70, ORD. N°443/2026, art. 58 CT |
| F03 | Constituida la obligación, el descuento por planilla del crédito social CCAF es obligatorio; el consentimiento nace al contratar | DT ORD. N°262/4, ORD. N°4527/93, art. 22 Ley 18.833 |
| F04 | No todos los descuentos se calculan sobre el sueldo imponible: bases y topes difieren (AFP/salud/AFC, Impuesto Único, convencionales) | DT, SII (tabla 2ª categoría 2026), DT |
| F05 | La fuente principal del art. 58 es el ORD. N°680 y no la consulta sobre indemnización por años de servicio | DT ORD. N°680 |
| F06 | El 0,6% AFC del trabajador tiene tope de 11 años; después aplica 0,8% patronal al FCS; hay exclusiones (p. ej. pensionados) | AFC |
| F07 | El 7% de salud se aplica sobre el imponible con tope de 90 UF, y el exceso Isapre es un adicional distinto | Superintendencia de Pensiones |
| F08 | Los descuentos convencionales tienen topes: 15% general, hasta 30% en supuestos de vivienda/educación, 45% global | DT ORD. 3456/37, ORD. 2897/33 |

Verifica también si la pieza **omite** una excepción que un lector necesitaría
para no equivocarse (p. ej. fuero, pluriempleo, semana corrida, gratificación,
pensionados, trabajadores exentos de AFC).

## 5. Reglas obligatorias

1. **R1 — Nada de derecho de memoria.** Cada afirmación normativa se apoya en
   el texto de la fuente, no en tu conocimiento previo. Adjunta el extracto
   crudo en `evidence/`.
2. **R2 — Anclaje a fuente primaria.** Jerarquía: texto legal (BCN LeyChile) >
   dictamen DT > organismo (SP, AFC, SII) > medios. URL + extracto literal +
   fecha de consulta. Sin extracto, el claim queda `UNVERIFIED`.
3. **R3 — Reclasificación independiente.** Reconstruye tú la clasificación
   legal de cada descuento (legal / convencional / prohibido) desde el texto y
   compara con la pieza. Divergencia = defecto.
4. **R4 — Trazabilidad.** Cada claim apunta a fuente + extracto, o a
   comando + salida cuando verifiques un dato numérico.
5. **R5 — Adversarial y de bordes.** Busca el caso que rompe la afirmación:
   trabajador no afiliado, pensionado, aprendiz, casa particular, jornada
   parcial, pluriempleo, sindicato minoritario, autorización revocada,
   empleador que retiene sin tope.
6. **R6 — Veredicto explícito.** `FAIL` / `CONDITIONAL` / `PASS` con defectos
   (severidad, superficie y estado). `CONDITIONAL` bloquea publicación.
7. **R7 — Reproducibilidad.** Registra commit SHA, entorno, comandos y fecha.
8. **R8 — No arregles nada.** No modifiques `src/`, tests, metadatos, fechas ni
   `correcciones.json`. Escribe solo artefactos de auditoría.

## 6. Superficies (protocolo §5)

Barre las seis buscando el hecho y **sus variantes** (15,25 vs 14,5; "4%" vs
"N°4"; 150 vs 310):

cuerpo · metadatos · datos estructurados (FAQPage/Article) · catálogo/LLM
(`calculatorPortfolio.ts`, `llms-full.txt`) · contenido relacionado · motor y
tests (no hay motor propio aquí; sí tests estáticos).

## 7. Salida

Escribe en `docs/editorial/audits/descuentos-de-sueldo-20261020/`:

- **`06-compliance.md`** — informe: método, claims normativos con fuente y
  extracto, defectos con evidencia, veredicto y limitaciones.
- **`02-result.json`** — **complétalo, no lo reemplaces**:
  - conserva `claims` C1–C17 y `defects` D1–D8 del math audit (no borres nada);
  - añade tus claims (C18+) y defectos (D9+) con `surface: "product"` o
    `"audit-package"` según corresponda;
  - añade un array `passes` con ambas pasadas (rol, modelo, sesión, fecha,
    veredicto) y deja `auditor` con **tu** rol y modelo, que es quien emite el
    veredicto vigente;
  - `verdict` = el peor de las dos pasadas (`FAIL` > `CONDITIONAL` > `PASS`);
  - `humanSignoff: null`. **No lo completas tú.**
- **`evidence/`** — salidas crudas, extractos literales y fecha de consulta.

## 8. Prohibido

- Declarar "cumple" sin extracto de la norma.
- Reutilizar un extracto heredado sin verificarlo contra la URL oficial.
- Emitir veredicto si la independencia de modelo no se cumple.
- Corregir la pieza, los tests o las fechas (R8).
- Completar `humanSignoff`.
- Declarar la pieza publicable.
- Afirmar en el informe que el repositorio es público o que los artefactos son
  accesibles externamente.
