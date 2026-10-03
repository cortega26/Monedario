# Publish Packet — operacion-renta-f22-checklist

- Run id: `20260812-1312-lote0b`
- Slug: `operacion-renta-f22-checklist`
- Source article: `src/data/blog/operacion-renta-f22-checklist.md`
- Origen: remediacion Fase B sobre hallazgo de
  `output/audits/corpus-2026-08-12/fichas/operacion-renta-f22-checklist.md`
  (verdicto FAIL, R2 vigencia)
- Autor de este paquete: DraftAgent (Claude Code), sesion `20260812-1312-lote0b`

## Estado del paquete

- [ ] Brief listo (`01-brief.yaml`)
- [ ] Dossier listo (`02-dossier.md`)
- [ ] Outline listo (`03-outline.md`)
- [ ] Draft listo (`04-draft.md`)
- [ ] Math audit listo o no aplica (`requires_calculation=false`; no se genera
      `05-math-audit.md` en esta sesion — separacion de funciones)
- [ ] Compliance listo (no se genera `06-compliance.md` en esta sesion —
      separacion de funciones; corresponde a ComplianceAgent en sesion fresca,
      Fase C del plan)
- [ ] Fuentes completas (ver `02-dossier.md`: 2 fuentes ya verificadas por la
      auditoria + 2 FAQ SII refetcheadas para este run; las 3 URLs de FAQ ya
      estaban en "Fuentes y referencias primarias" del articulo publicado)
- [ ] Benchmark observations separadas de fuentes oficiales (N/A — este run no
      usa benchmark externo)
- [ ] `localDelta` visible en el entregable final (N/A — no es adaptacion
      competitiva; el delta es la declaracion explicita de cierre de ventana
      en la primera pantalla, ver `03-outline.md`)
- [ ] Ownership/no-canibalizacion revisado (sin cambio: sigue siendo owner de
      `canonicalTopic: f22-revisar-enviar`)
- [ ] Fecha de corte visible para lectores (`articleLead.validAsOf:
      2026-08-12` + "Revisado el: 2026-08-12" en el cuerpo)
- [ ] Prompt-injection review completo: las fuentes externas fetcheadas
      (SII) fueron tratadas como untrusted source content; ninguna
      instruccion embebida en ellas modifico rol, alcance, formato,
      herramientas, gates, citas o decision editorial. No se encontro texto
      sospechoso que requiriera etiqueta `PROMPT_INJECTION_CANDIDATE`.
- [ ] VERIFIED carry-forward confirmado (N/A formalmente — no hay
      `05-math-audit.md` de este run porque `requires_calculation=false`; las
      cifras R5 que se conservan ya estaban verificadas por la auditoria de
      origen y no se modificaron)
- [ ] Separacion de funciones documentada: TriageAgent/ComplianceAgent
      (auditoria, sesion previa, 2026-08-12) ≠ DraftAgent (este run) ≠
      ComplianceAgent de Fase C (sesion fresca, pendiente) ≠ HumanEditor
      (firma pendiente)
- [ ] Registro NORMA §5.3 presente en `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`
      §17 (pendiente de agregar por el orquestador del plan tras este run)
- [ ] `HumanEditor` sign-off

## Gates ejecutados por este agente (evidencia, no reemplaza el sign-off)

Ver salida literal en el reporte final de la sesion. Comandos ejecutados:
`pnpm run check:frontmatter`, `pnpm run check:editorial`,
`pnpm run check:dialect`, `pnpm run check:editorial-timeliness`,
`pnpm run check:links`, `pnpm vitest run`, `pnpm run format:check`.

## Nota

Ningun gate de esta lista esta marcado `[X]`. Solo el editor humano firma
(`AGENTS.md` §2.9, `EDITORIAL_AI_PIPELINE.md` §9.5). Este DraftAgent no
declara la pieza publicable ni cierra el SLA de `check:editorial-timeliness`;
ese gate permanecera en rojo hasta la firma humana, lo cual es el
comportamiento correcto en este punto del pipeline. Pendiente para Fase C:
`06-compliance.md` en sesion fresca de `ComplianceAgent` + firma humana de
este archivo.

## Ronda 2 — remediación de DEFECT #1-3 (compliance FAIL 6,05/10)

- **Contexto:** `06-compliance.md` (ComplianceAgent, sesión fresca
  adversarial, sin exposición previa a este run) revisó la ronda 1 de este
  mismo run y emitió veredicto **FAIL (6,05/10)**. El reencuadre central de
  R2 (ventana AT2026 cerrada) quedó confirmado como correcto; se
  encontraron 3 defectos bloqueantes (DEFECT #1-3) y 2 no bloqueantes
  (DEFECT #4-5), todos concentrados en la sección nueva "Fuera de la ventana
  AT2026: qué puedes hacer hoy" y en `articleLead.answer`.
- **Sesión que ejecuta esta ronda:** DraftAgent, sesión nueva, sin
  exposición al draft original ni a la revisión de compliance más allá de
  leer `06-compliance.md` como insumo (instrucción explícita del brief de
  remediación).
- **DEFECT #1 (contradicción interna, CRÍTICO):** resuelto. Se investigó con
  fuentes SII en vivo si el portal normal acepta una declaración F22 nunca
  presentada fuera de la ventana. Se encontró y fetcheó SII FAQ
  001_140_0595, que confirma literalmente que sí, vía "Servicios online,
  Declaración de renta, opción Declarar renta (F22)". Se corrigió
  `articleLead.answer` (que decía "no puedes usar el flujo normal") para
  que diga lo mismo que el cuerpo, ambos citando esta fuente.
- **DEFECT #2 (afirmación procedural sin fuente, ALTO):** resuelto con la
  misma fuente (mecanismo) más SII FAQ 001_140_3095 (porcentajes de multa e
  interés — tabla pública, no cálculo derivado). El monto exacto para el
  lector y la elegibilidad de condonación quedan como deferral legítimo
  (NORMA §2.4 condición 2).
- **DEFECT #3 ("sigue abierto" sin fuente, ALTO):** resuelto por
  reformulación. No se encontró fuente que confirme ausencia de fecha de
  cierre del trámite de consulta/rectificatoria; la frase ya no afirma
  vigencia permanente como hecho, solo que la ficha oficial no publica
  fecha de cierre.
- **DEFECT #4 y #5 (Bucket C, bajo costo):** resueltos en esta misma sesión
  — ver `04-draft.md` sección "Ronda 2" para el detalle.
- **Archivos tocados:** `src/data/blog/operacion-renta-f22-checklist.md`,
  `02-dossier.md`, `04-draft.md`, este archivo (sección nueva, sin marcar
  gates). **No se editó** `06-compliance.md` (registro histórico del
  veredicto FAIL de ronda 1, preservado) ni
  `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`.
- **No se marcó ningún gate `[X]` en esta lista.** No se genera
  `06-compliance-round2.md` en esta sesión — corresponde a ComplianceAgent
  en sesión fresca (Fase C). El estado del paquete sigue pendiente de esa
  re-revisión y de la firma humana.

## Ronda 3 — cierre de Bucket C (TODO:SOURCE + DEFECT-NUEVO #1/#2)

- **Contexto:** `06-compliance-round2.md` (ComplianceAgent, sesión fresca,
  ronda 2, sin exposición al draft de ronda 2) emitió veredicto
  **CONDITIONAL (8,73/10)**. Los 3 defectos bloqueantes de ronda 1 seguían
  verificados como resueltos; no había defectos nuevos bloqueantes. Quedaban
  3 ítems Bucket C en la sección "Ruta de resolución" que impedían `PASS`.
- **Sesión que ejecuta esta ronda:** DraftAgent, sesión nueva, 2026-08-13.
- **Ítem 1 — `TODO:SOURCE` de `sii.cl/destacados/renta/2026/personas/`:**
  **RESUELTO** (no declarado irrecuperable). Se reintentó el fetch con una
  tercera técnica — renderizado headless con Playwright/Chromium, que
  ejecuta el JS de la SPA — tras confirmar que WebFetch y
  `scrapling extract get --impersonate chrome` (ambos GET estático) seguían
  devolviendo solo el shell SvelteKit vacío. Esta vez sí se obtuvo contenido
  (2692 caracteres). El contenido no contradice ni aporta datos que el
  artículo publicado necesite citar, así que el blog file no se modificó a
  partir de este fetch específico. Detalle completo en `04-draft.md` y
  `02-dossier.md`.
- **Ítem 2 — DEFECT-NUEVO #1 (cita frágil para el mecanismo AT2026-en-curso):**
  **RESUELTO.** Se refetcheó `https://www.sii.cl/contribuyentes/p7renta.htm`
  (Playwright), que confirma el mismo mecanismo de regularización sin la
  restricción "años anteriores" de `001_140_0595.htm`. Se agregó como
  fuente adicional en `articleLead.officialSources` y en "Fuentes y
  referencias primarias" del blog file. La nota de auto-revisión en
  `02-dossier.md` se simplificó: la cadena de tres fuentes de ronda 2 ya no
  es el único respaldo.
- **Ítem 3 — DEFECT-NUEVO #2 (modalidad "debes" no acotada):** **RESUELTO.**
  La misma fuente `p7renta.htm` condiciona textualmente la obligación de
  regularizar a "si usted... estaba obligado a hacerlo". Se matizó
  `articleLead.answer` y el bullet correspondiente del cuerpo de "igual
  debes hacerlo" a "si estabas obligado a declarar y no alcanzaste a
  hacerlo, igual debes regularizar", sin alterar el resto del significado
  ya verificado (mecanismo, multas, "No declarante F22").
- **Archivos tocados:** `src/data/blog/operacion-renta-f22-checklist.md`
  (fuente nueva + matiz de modalidad, sin tocar `updatedDate`),
  `02-dossier.md`, `04-draft.md`, este archivo (sección nueva, sin marcar
  gates). **No se editó** `06-compliance.md` ni `06-compliance-round2.md`
  (registro histórico preservado) ni
  `docs/backlog/PLAN-auditoria-corpus-publicado-2026-08-12.md`.
- **No se marcó ningún gate `[X]` en esta lista.** No se genera
  `06-compliance-round3.md` en esta sesión — corresponde a ComplianceAgent
en sesión fresca. Pendiente: compliance ronda 3 (sesión fresca) → firma
humana.

## Addendum 2026-10-02

Esta ronda corrigió las sanciones por resultado de F22, acotó la reliquidación
por empleadores simultáneos a sueldos afectos al IUSC, agregó la citación del
SII y añadió un ejemplo sin cálculo derivado. El registro de correcciones
materiales se actualizó bajo §5.4 en `src/data/correcciones.json`.

Evidencia de roles para esta ronda:

- DraftAgent: Codex (OpenAI GPT-6), instancia raíz `/root`; esta ejecución
  continuó con ediciones ya presentes en el worktree y revisó el artículo y su
  `git diff HEAD`. No se atribuye a una sesión sin exposición previa.
- ComplianceAgent: agente independiente `/root/compliance_f22_round6`, creado
  sin historial de conversación (`fork_turns=none`) y con verificación de
  fuentes en vivo; resultado en `06-compliance-round6.md`.
- No se creó MathAuditAgent para esta ronda: no hay cifra derivada nueva
  (`requires_calculation=false`). HumanEditor conserva la firma; no se marcó
  ningún gate `[X]`.
