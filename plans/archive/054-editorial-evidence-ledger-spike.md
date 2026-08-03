# Plan 054 (spike de dirección): Ledger de evidencia del pipeline editorial — inventario 3/53 y veredicto sobre el claim público

> **Instrucciones para el ejecutor**: este es un plan de **spike de diseño y
> evidencia**, no de implementación. NO construyes features ni tocas código de
> producto. Tu entregable es un **documento de auditoría read-only** en
> `docs/reports/` que inventaría la evidencia editorial post a post, reproduce
> el comportamiento del checker automatizado, compara claim público vs.
> evidencia y recomienda opciones — **deteniéndose en una compuerta de decisión
> humana**. Corre cada verificación y honra las condiciones de STOP. Al
> terminar, actualiza la fila de este plan en `plans/README.md`, salvo que un
> revisor te diga que él mantiene el índice.
>
> **Drift check (córrelo primero)**:
> ```bash
> git diff --stat 0bd51540..HEAD -- \
>   src/pages/metodologia.astro \
>   src/pages/acerca-de.astro \
>   scripts/check-editorial-artifacts.mjs \
>   src/content.config.ts \
>   src/data/blog \
>   artifacts/editorial
> ```
> Si algún archivo citado en "Current state" cambió, revalida los extractos
> antes de escribir el documento. Mismatch = condición de STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW (spike read-only; la sensibilidad es de proceso, no de código — las recomendaciones se detienen en compuerta humana)
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `0bd51540`, 2026-08-02

## Por qué importa

El memo de viabilidad estratégica del 2026-08-02
(`output/audits/strategic-viability-2026-08-02/monedario-strategic-viability-audit.html`,
untracked) marca una "contradicción de confianza": la metodología pública
describe un proceso editorial de siete etapas, pero en el repo solo existen
tres `07-publish-packet.md` y tres `06-compliance.md` frente a 53 artículos
publicados; además, el chequeo automatizado declararía "47/47 piezas YMYL
conformes" operando en modo advertencia. El memo recomienda "auditar la
discrepancia del pipeline editorial" y "eliminar claims editoriales no
trazables".

La evidencia parcial ya revisada sugiere que la contradicción es **menos severa
de lo que el memo parece implicar** — la página de metodología desclama
explícitamente la retroactividad (`metodologia.astro:132`) — pero nadie ha
medido el gap real: cuántos posts están en alcance del claim (nuevos o
actualizados sustantivamente desde el 2026-04-25), cuántos de esos tienen
evidencia trazable, y si el checker mide lo que el claim promete. Este spike
produce ese ledger y deja la decisión de backfill vs. ajuste del claim en manos
del operador.

## Estado actual (verificado el 2026-08-02)

- **Posts**: 53 archivos en `src/data/blog/*.md(x)` (conteo verificado:
  `ls src/data/blog/ | wc -l` → 53). El blog se carga desde ahí
  (`src/content.config.ts:5`: `const BLOG_PATH = "src/data/blog";`).
  Frontmatter relevante: `pubDate: z.date()` y `updatedDate: z.date().optional().nullable()`
  (`src/content.config.ts:17,19`). Un muestreo manual muestra fechas ISO con
  zona horaria, p. ej. `updatedDate: 2026-05-11T00:00:00Z` en
  `boleta-honorarios-2026-retencion-cobertura.md`.

- **Claim público** — `src/pages/metodologia.astro:110-133`:

  ```
  Para el contenido YMYL nuevo y las actualizaciones sustantivas cubiertas
  desde la fecha indicada abajo, Monedario exige un proceso de siete
  etapas y la firma de un editor humano antes de publicar. ...
  <aside ...>
    <strong ...>Alcance de esta promesa:</strong> la cadena
    formal de siete registros aplica prospectivamente a contenido YMYL nuevo y
    a actualizaciones sustantivas desde el 25 de abril de 2026. El corpus histórico
    fue creado mientras estos controles evolucionaban y no posee evidencia uniforme
    de las siete etapas; por eso Monedario no afirma que esa cadena exista retroactivamente. ...
  </aside>
  ```

  Y `src/pages/acerca-de.astro:105-113` (enlace al "proceso editorial de siete
  etapas desde el 25 de abril de 2026" + "sin atribuirle artefactos que no
  existen").

- **Artefactos**: `artifacts/editorial/` tiene 50 carpetas temáticas
  (una por tópico, kebab-case; p. ej. `boleta-honorarios-2026-retencion-cobertura`).
  Dentro, subcarpetas fechadas: p. ej.
  `artifacts/editorial/boleta-honorarios-2026-retencion-cobertura/20260511-1000-backfill/`.
  Los únicos `07-publish-packet.md` y `06-compliance.md` del árbol:
  `artifacts/editorial/bancos-y-fintech-chile/20260617-1749-topic-intake/`,
  `artifacts/editorial/como-elegir-inversion-segun-plazo-riesgo-objetivos/20260625-1405-ed016/`,
  `artifacts/editorial/finanzas-para-migrantes-chile/20260622-1330-pipeline/`
  (verificado con `find artifacts -name "07-publish-packet.md"` y `-name "06-compliance.md"`).

- **Checker automatizado** — `scripts/check-editorial-artifacts.mjs`:
  - Evalúa cada post contra una allowlist YMYL (`EDITORIAL_YMYL_ALLOWLIST.txt`)
    y requisitos (p. ej. fuentes, `MIN_SOURCES`).
  - Modo advertencia por defecto: imprime `SUMMARY total_posts=… ymyl_posts=… compliant=… non_compliant=…`
    y hace exit 0; con `CI=1` o `--ci` **falla** exigiendo `EDITORIAL_ENFORCE=1`
    (líneas 668-675); con `EDITORIAL_ENFORCE=1` entra en modo estricto y falla
    solo en violaciones `strictBlocking` (líneas 678-688). Ver bloque `run()`
    líneas 642-689.
  - `pnpm run check:editorial-artifacts` es el comando npm (package.json).

## Comandos que necesitarás

| Propósito | Comando | Salida esperada |
|---|---|---|
| Contar posts | `ls src/data/blog/*.md* \| wc -l` | 53 |
| Repro check (modo advertencia) | `node scripts/check-editorial-artifacts.mjs` | exit 0; línea `SUMMARY total_posts=53 ymyl_posts=… compliant=… non_compliant=…`; línea `WARN: Gate in warn-only mode.` |
| Repro check (CI sin enforce) | `CI=1 node scripts/check-editorial-artifacts.mjs` | exit 1; `FAIL: CI environments must export EDITORIAL_ENFORCE=1` |
| Repro check (estricto) | `EDITORIAL_ENFORCE=1 node scripts/check-editorial-artifacts.mjs` | exit 0 con `OK: strict mode passed.` o exit 1 con `FAIL: strict mode blocking violations=…` (registra el resultado real) |
| Contar packets | `find artifacts -name "07-publish-packet.md" \| wc -l` | 3 (estado actual; regístralo, no lo asumas) |
| Buscar posts en alcance | ver Steps 1–2 (frontmatter) | — |

## Alcance

**In scope** (únicos archivos que puedes crear/modificar):
- `docs/reports/EDITORIAL-EVIDENCE-LEDGER-2026-08-02.md` — el entregable (crear)
- `plans/README.md` — fila de estado (una línea)

**Out of scope** (NO tocar, aunque parezcan relacionados):
- Cualquier archivo en `src/`, `scripts/`, `workers/`, `artifacts/`,
  `context/`, `.github/` — este spike no cambia código, ni artefactos, ni
  flujos.
- Los archivos de `output/audits/strategic-viability-2026-08-02/` — fuente de
  contexto, no de edición (y están untracked).
- NO ejecutes el backfill de ningún artefacto editorial, ni edites
  `metodologia.astro` / `acerca-de.astro` para "arreglar" el claim — eso es
  decisión del operador después de leer el ledger.

## Git workflow

- Rama: `advisor/054-editorial-evidence-ledger`
- Commit único al final (estilo del repo — ver `git log --oneline -5`):
  `docs(reports): ledger de evidencia del pipeline editorial (spike 054)`
- NO hagas push ni abras PR salvo que el operador lo indique.

## Steps

### Step 1: inventario de posts en alcance del claim

1. Lista los 53 posts y extrae `pubDate` + `updatedDate` del frontmatter de cada
   uno (grep de las dos líneas; las fechas son ISO `YYYY-MM-DD` o
   `YYYY-MM-DDTHH:mm:ssZ` — compara por prefijo `YYYY-MM-DD`).
2. Clasifica cada post: **en_alcance** si `pubDate ≥ 2026-04-25` O
   `updatedDate ≥ 2026-04-25` (el claim: "nuevo o actualizado sustantivamente
   desde el 25 de abril de 2026"); **historico** en caso contrario.
   Registra también `pubDate`/`updatedDate` crudos por post (tabla del ledger).
3. Cuenta: total, en_alcance (por cada sub-motivo: nuevo / actualizado / ambos).

**Verify**: el conteo de total es 53; el de en_alcance está entre ~15 y ~25
(la verificación previa encontró 15 con `updatedDate > 2026-04-25` y 10 con
`pubDate > 2026-04-25`, con solape posible — no asumas el número, calcúlalo).

### Step 2: inventario de evidencia por post

1. Para cada post en alcance (y, en una columna aparte, para el resto):
   - ¿Existe una carpeta temática en `artifacts/editorial/` que corresponda al
     tópico? (las carpetas son kebab-case por tópico, no necesariamente iguales
     al slug del post — mapea por coincidencia razonable de tópico y documéntalo
     cuando el mapeo sea ambiguo).
   - ¿Qué subcarpetas fechadas tiene (p. ej. `20260511-1000-backfill`,
     `*-topic-intake`, `*-pipeline`, `*-edNNN`)?
   - ¿Contiene `06-compliance.md` o `07-publish-packet.md` en cualquier
     profundidad? (`find artifacts/editorial/<carpeta> -name "06-compliance.md" -o -name "07-publish-packet.md"`)
   - Registra la forma de evidencia encontrada: `packet_completo` /
     `evidencia_parcial` (subcarpetas fechadas sin 06/07) / `ninguna`.
2. Entrega dos tablas en el ledger: (a) posts en alcance con su evidencia;
   (b) resumen agregado (conteos por forma de evidencia, separando en_alcance /
   historico).

**Verify**: los conteos de `06-compliance.md` y `07-publish-packet.md` del
ledger coinciden con `find artifacts -name … | wc -l` → 3 y 3 (o el número que
resulte; registra el real).

### Step 3: reproducir el checker y registrar su semántica

1. Corre los tres comandos de la tabla de arriba y copia las líneas clave
   (SUMMARY + WARN/FAIL/OK) al ledger.
2. Lee `scripts/check-editorial-artifacts.mjs` (función `evaluatePost`, líneas
   ~290-320 y `run()` 642-689) y describe en el ledger **qué** evalúa
   "compliant": cuántas fuentes exige (`MIN_SOURCES`), qué campos del
   frontmatter, y si eso corresponde al claim público de "siete etapas con
   firma humana" o a un subconjunto (p. ej. solo fuentes + estructura).
   Cita las líneas exactas.
3. Responde en el ledger, con evidencia, a la afirmación del memo: "el chequeo
   automatizado declara 47/47 piezas YMYL conformes porque opera en modo de
   advertencia" — ¿el número real coincide? ¿el modo advertencia explica el
   resultado o el checker evalúa otra cosa?

**Verify**: cada comando de la tabla corrió y su salida quedó registrada en el
ledger (grep del doc → líneas SUMMARY/WARN presentes).

### Step 4: veredicto claim vs. evidencia

1. Cita el claim público completo (`metodologia.astro:110-133` y
   `acerca-de.astro:105-113`).
2. Evalúa con los datos de los Steps 1–3, explícitamente:
   - (a) ¿Los posts en_alcance tienen la evidencia que el claim promete?
   - (b) ¿El corpus histórico queda correctamente fuera del claim por el
     disclaimer del aside?
   - (c) ¿El checker mide lo que el claim promete, o hay un desajuste de
     semántica (checker = fuentes/estructura; claim = siete etapas + firma)?
3. Escribe una conclusión de una frase: "el gap real es X" (X = número de
   posts en alcance sin packet, si aplica).

**Verify**: el ledger contiene las tres evaluaciones (a), (b), (c) con citas de
archivo:línea.

### Step 5: recomendaciones + compuerta humana

1. Propón 2–3 opciones, cada una con esfuerzo (S/M/L), riesgo y trade-off:
   - **Opción A — Backfill de evidencia**: para los posts en alcance sin
     packet, reconstruir la evidencia (posible solo si existe, sin inventar
     fechas/firmas) o marcar explícitamente "evidencia parcial".
   - **Opción B — Ajustar el claim**: si el gap es estructural, estrechar el
     texto público (p. ej. al subconjunto con packet) manteniendo el
     disclaimer.
   - **Opción C — Ajustar el checker**: alinear la semántica de "compliant"
     con el claim (más estricto) o separar las métricas que reporta.
2. Cierra el documento con una **compuerta de decisión humana**: lista las
   preguntas que solo el operador puede responder (qué opción por gap, si
   conviene un plan de ejecución posterior) y qué evidencia nueva cambiaría el
   veredicto. NO implementes ninguna opción.

**Verify**: el ledger termina con la sección de compuerta humana (encabezado
explícito "Decisión del operador").

## Plan de test

Spike read-only: no hay tests de código. El equivalente de verificación son
los comandos de los Steps 1–3 con sus salidas registradas en el ledger, y el
`git status` final limpio salvo el entregable + la fila del índice.

**Verify**: `git status --short` → solo `docs/reports/EDITORIAL-EVIDENCE-LEDGER-2026-08-02.md`
y `plans/README.md` modificados (o la fila ya la mantiene el revisor).

## Criterios de terminado

Machine-checkable. ALL deben cumplirse:

- [ ] `docs/reports/EDITORIAL-EVIDENCE-LEDGER-2026-08-02.md` existe y contiene las 6 secciones: inventario en_alcance, inventario de evidencia, reproducción del checker, veredicto (a)(b)(c), recomendaciones A/B/C, compuerta humana
- [ ] Los conteos del ledger (posts 53; packets 06/07; compliant del checker) coinciden con los comandos de verificación
- [ ] Los tres comandos del checker quedaron reproducidos con su salida real copiada en el ledger
- [ ] `git status --short` limpio salvo el entregable + `plans/README.md`
- [ ] Ningún archivo de `src/`, `scripts/`, `workers/`, `artifacts/` modificado (verificado con `git status` y `git diff --stat`)
- [ ] Fila del plan en `plans/README.md` actualizada (salvo instrucción en contrario del reviewer)

## Condiciones de STOP

Detente y reporta (no improvises) si:

- Los archivos en "Estado actual" no coinciden con los extractos (drift desde `0bd51540`).
- `src/data/blog/` no contiene 53 posts (o el conteo real difiere de forma material) — revalida el punto de partida antes de escribir.
- `scripts/check-editorial-artifacts.mjs` no imprime la línea `SUMMARY` al correrlo — la semántica del checker cambió; reporta en vez de inferir.
- El mapeo carpeta-temática ↔ post es ambiguo para más de ~5 posts — documéntalo y detente antes de inventar correspondencias.
- Descubres evidencia que contradice el disclaimer público (p. ej. el claim afirma algo y los artefactos demuestran lo contrario de forma grave) — registra el hallazgo tal cual, sin suavizarlo, y márcalo como hallazgo de alta severidad en el ledger.

## Notas de mantenimiento

- Este ledger es el insumo del memo para "eliminar claims no trazables": si el
  operador elige la Opción A o B, el follow-up es un plan de ejecución
  separado con compuertas editoriales — no lo anticipes aquí.
- El número "47/47" citado por el memo debe verificarse contra la salida real
  del checker; si no coincide, el ledger debe decirlo (el memo mismo advierte
  que sus números son reconstruibles).
- Cualquier cambio futuro en `check-editorial-artifacts.mjs` (modo estricto,
  `MIN_SOURCES`) invalida la reproducción del Step 3 — el ledger registra la
  fecha y el SHA en que se reprodujo.
