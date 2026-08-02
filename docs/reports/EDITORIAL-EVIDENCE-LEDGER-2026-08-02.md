# Ledger de evidencia del pipeline editorial — inventario 3/53 y veredicto sobre el claim público

- **Fecha de reproducción**: 2026-08-02
- **SHA del repo al reproducir**: `3c343e00` (chore(data-signals): backfill GSC export 2026-W29, plan 053)
- **Rama**: `advisor/054-editorial-evidence-ledger`
- **Tipo**: spike de dirección, documento de auditoría read-only (sin cambios de código ni artefactos)
- **Fuente del problema**: memo de viabilidad estratégica 2026-08-02 (`output/audits/strategic-viability-2026-08-02/monedario-strategic-viability-audit.html`, untracked en el repo principal), que marca una "contradicción de confianza": metodología pública de siete etapas vs. 3 `07-publish-packet.md` y 3 `06-compliance.md` frente a 53 artículos, y un chequeo automatizado que declararía "47/47 piezas YMYL conformes" operando en modo advertencia.
- **Objetivo**: medir el gap real (posts en alcance del claim vs. evidencia trazable), reproducir el checker, comparar claim público vs. evidencia y dejar la decisión de backfill vs. ajuste en una compuerta humana.

---

## 1. Inventario de posts en alcance del claim

**Método**: se listaron los 53 archivos de `src/data/blog/*.md(x)` (`ls src/data/blog/*.md* | wc -l` → 53; el blog se carga desde `src/content.config.ts:5`, `const BLOG_PATH = "src/data/blog";`). Se extrajeron `pubDate` y `updatedDate` del frontmatter (esquema `pubDate: z.date()` y `updatedDate: z.date().optional().nullable()` en `src/content.config.ts:43-44`) y se comparó por prefijo `YYYY-MM-DD`. Clasificación: **en_alcance** si `pubDate ≥ 2026-04-25` O `updatedDate ≥ 2026-04-25` (fecha del claim: "25 de abril de 2026"); **historico** en caso contrario. Sub-motivos: `nuevo` (pubDate en alcance), `actualizado` (updatedDate en alcance), `ambos`.

| Post | pubDate | updatedDate | Clasificación |
|---|---|---|---|
| ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026 | 2026-02-28 | 2026-04-22 | historico |
| bancos-y-fintech-chile | 2026-06-17 | — | nuevo |
| boleta-honorarios-2026-retencion-cobertura | 2026-02-28 | 2026-05-11 | actualizado |
| cae-costo-real-credito-chile | 2026-03-02 | 2026-04-12 | historico |
| como-calcular-sueldo-liquido | 2026-02-24 | 2026-07-01 | actualizado |
| como-cambiarse-de-afp | 2026-02-23 | 2026-07-01 | actualizado |
| como-elegir-inversion-segun-plazo-riesgo-objetivos | 2026-06-25 | — | nuevo |
| como-hacer-presupuesto-mensual-chile | 2026-03-03 | 2026-04-08 | historico |
| como-invertir-en-etfs-desde-chile | 2026-02-28 | 2026-04-22 | historico |
| como-leer-cartola-afp-chile | 2026-04-09 | 2026-05-11 | actualizado |
| como-salir-boletin-comercial-chile | 2026-04-09 | 2026-04-12 | historico |
| contribuciones-bienes-raices-chile | 2026-05-03 | — | nuevo |
| credito-hipotecario-chile-guia-completa | 2026-04-09 | 2026-04-12 | historico |
| cuanto-descuenta-la-afp-de-tu-sueldo | 2026-02-23 | 2026-07-01 | actualizado |
| deposito-a-plazo-uf-vs-pesos | 2026-02-28 | 2026-03-30 | historico |
| descuentos-de-sueldo | 2026-03-08 | 2026-07-01 | actualizado |
| devolucion-impuestos-fechas-compensaciones | 2026-02-28 | 2026-05-11 | actualizado |
| donde-ver-si-estoy-en-dicom-gratis | 2026-03-12 | 2026-04-12 | historico |
| el-poder-del-interes-compuesto | 2026-03-06 | 2026-03-07 | historico |
| estafas-financieras-chile-vishing-smishing-marketplace | 2026-03-02 | 2026-04-22 | historico |
| finanzas-para-migrantes-chile | 2026-06-22 | — | nuevo |
| finiquito-e-indemnizaciones-en-chile | 2026-03-02 | 2026-05-11 | actualizado |
| fonasa-vs-isapre-comparativa | 2026-04-08 | 2026-04-08 | historico |
| fondo-emergencia-chile | 2026-05-03 | — | nuevo |
| fondos-afp-a-b-c-d-e | 2026-02-23 | 2026-03-12 | historico |
| fondos-mutuos-comisiones-rescate-impuestos | 2026-02-28 | 2026-04-22 | historico |
| fraude-tarjeta-que-hacer | 2026-02-24 | 2026-04-22 | historico |
| gratificacion-legal-chile | 2026-05-03 | — | nuevo |
| impuesto-global-complementario-chile | 2026-05-03 | 2026-07-01 | ambos |
| indemnizacion-anos-de-servicio-chile | 2026-03-12 | 2026-03-12 | historico |
| informe-deudas-cmf-vs-dicom | 2026-02-24 | 2026-04-12 | historico |
| interes-compuesto-nota-metodologica | 2026-03-06 | 2026-04-22 | historico |
| licencia-medica-desde-que-dia-pagan | 2026-03-02 | 2026-05-11 | actualizado |
| liquidacion-de-sueldo | 2026-03-08 | 2026-04-12 | historico |
| operacion-renta-centro | 2026-04-29 | 2026-04-29 | ambos |
| operacion-renta-f22-checklist | 2026-02-28 | 2026-05-11 | actualizado |
| pgu-pension-garantizada-universal | 2026-05-03 | — | nuevo |
| prepago-credito-cuando-conviene-chile | 2026-04-10 | — | historico |
| primer-empleo-chile-guia-completa | 2026-04-09 | — | historico |
| que-es-el-apv | 2026-02-23 | 2026-03-12 | historico |
| que-es-el-ipc-chile-como-se-calcula | 2026-03-03 | 2026-03-11 | historico |
| que-es-la-cuenta-2-afp | 2026-02-23 | 2026-04-12 | historico |
| que-es-la-uf | 2026-02-24 | 2026-04-04 | historico |
| reajuste-arriendo-uf-ipc-chile | 2026-03-12 | — | historico |
| reforma-previsional-2025-que-cambia-y-como-te-afecta | 2026-03-03 | 2026-03-12 | historico |
| renegociacion-superir | 2026-02-24 | 2026-03-12 | historico |
| rentas-mixtas-sueldo-honorarios | 2026-04-09 | 2026-05-11 | actualizado |
| seguro-cesantia-cuenta-individual-vs-fondo-solidario | 2026-03-12 | 2026-04-12 | historico |
| seguro-de-cesantia | 2026-02-25 | 2026-05-11 | actualizado |
| sueldo-imponible-chile | 2026-05-03 | 2026-07-01 | ambos |
| suplantacion-identidad-creditos-no-reconocidos | 2026-03-02 | 2026-04-22 | historico |
| tarjeta-credito-costo-real-chile | 2026-04-10 | 2026-04-12 | historico |
| utm-chile-que-es-como-funciona | 2026-04-09 | 2026-04-09 | historico |

(`—` = el post no tiene `updatedDate` en su frontmatter; 10 posts.)

**Conteos verificados** (script de clasificación sobre el frontmatter real):

| Conteo | Valor |
|---|---|
| Total posts | **53** |
| en_alcance (pubDate ≥ 2026-04-25 O updatedDate ≥ 2026-04-25) | **22** |
| — nuevo (solo pubDate en alcance) | 7 |
| — actualizado (solo updatedDate en alcance) | 12 |
| — ambos | 3 |
| historico | **31** |

Nota: la verificación previa citada en el plan encontró 15 posts con `updatedDate > 2026-04-25` y 10 con `pubDate > 2026-04-25`; el conteo real de este ledger es 15 y 10 respectivamente con `≥` (ningún post tiene exactamente la fecha de corte, así que `>` y `≥` no cambian el resultado). El total en alcance, 22, está dentro del rango esperado (~15–25).

---

## 2. Inventario de evidencia por post

**Estructura de `artifacts/editorial/`** (verificada con `find`):

- **49 carpetas temáticas** (kebab-case por tópico, 1:1 con slugs de posts) + 1 carpeta `_intake` (50 directorios en total; el plan citaba "50 carpetas temáticas" — el conteo real es 49 temáticas + `_intake`).
- **46 subcarpetas `20260511-1000-backfill`**: backfill por lotes del 2026-05-11, contenido uniforme de 4 archivos por carpeta: `01-brief.yaml`, `02-dossier.md`, `metadata.yaml`, `sources.yaml` (verificado: 46 × 4 archivos, sin `03-outline`, `04-draft`, `05-math-audit`, ni `06`/`07` en ningún backfill).
- **3 subcarpetas de pipeline con cadena 01–07** (`find artifacts -name "07-publish-packet.md" | wc -l` → 3; `find artifacts -name "06-compliance.md" | wc -l` → 3):
  - `bancos-y-fintech-chile/20260617-1749-topic-intake/` → 01-brief, 02-dossier, 03-outline, 04-draft, 06-compliance, 07-publish-packet, HANDOFF-06-compliance, hero-prompt
  - `como-elegir-inversion-segun-plazo-riesgo-objetivos/20260625-1405-ed016/` → 01-brief, 02-dossier, 06-compliance, 07-publish-packet, metadata, sources
  - `finanzas-para-migrantes-chile/20260622-1330-pipeline/` → 01-brief, 02-dossier, 03-outline, 04-draft, 05-math-audit, 06-compliance, 07-publish-packet
- **`_intake/`**: 2 notas `00-topic-intake.md` (bancos-y-fintech-chile, finanzas-para-migrantes-chile); duplican evidencia ya cubierta por los packets de esos tópicos.
- **4 posts sin carpeta temática**: `como-hacer-presupuesto-mensual-chile`, `fondo-emergencia-chile`, `que-es-el-ipc-chile-como-se-calcula`, `reajuste-arriendo-uf-ipc-chile`.
- **Mapeo carpeta ↔ post**: exacto por slug para las 49 carpetas (0 mapeos ambiguos; ninguna carpeta sin post correspondiente).

**Formas de evidencia**: `packet_completo` (cadena 01–07 con `06-compliance.md` y `07-publish-packet.md`) / `evidencia_parcial` (subcarpeta fechada de backfill con brief+dossier+metadata+sources, sin 06/07) / `ninguna` (sin carpeta).

### Tabla (a): posts en alcance con su evidencia

| Post | pubDate | updatedDate | Carpeta en `artifacts/editorial/` | Subcarpeta | Forma de evidencia |
|---|---|---|---|---|---|
| bancos-y-fintech-chile | 2026-06-17 | — | bancos-y-fintech-chile | 20260617-1749-topic-intake | **packet_completo** |
| como-elegir-inversion-segun-plazo-riesgo-objetivos | 2026-06-25 | — | como-elegir-inversion-segun-plazo-riesgo-objetivos | 20260625-1405-ed016 | **packet_completo** |
| finanzas-para-migrantes-chile | 2026-06-22 | — | finanzas-para-migrantes-chile | 20260622-1330-pipeline | **packet_completo** |
| boleta-honorarios-2026-retencion-cobertura | 2026-02-28 | 2026-05-11 | boleta-honorarios-2026-retencion-cobertura | 20260511-1000-backfill | evidencia_parcial |
| como-calcular-sueldo-liquido | 2026-02-24 | 2026-07-01 | como-calcular-sueldo-liquido | 20260511-1000-backfill | evidencia_parcial |
| como-cambiarse-de-afp | 2026-02-23 | 2026-07-01 | como-cambiarse-de-afp | 20260511-1000-backfill | evidencia_parcial |
| como-leer-cartola-afp-chile | 2026-04-09 | 2026-05-11 | como-leer-cartola-afp-chile | 20260511-1000-backfill | evidencia_parcial |
| cuanto-descuenta-la-afp-de-tu-sueldo | 2026-02-23 | 2026-07-01 | cuanto-descuenta-la-afp-de-tu-sueldo | 20260511-1000-backfill | evidencia_parcial |
| descuentos-de-sueldo | 2026-03-08 | 2026-07-01 | descuentos-de-sueldo | 20260511-1000-backfill | evidencia_parcial |
| devolucion-impuestos-fechas-compensaciones | 2026-02-28 | 2026-05-11 | devolucion-impuestos-fechas-compensaciones | 20260511-1000-backfill | evidencia_parcial |
| finiquito-e-indemnizaciones-en-chile | 2026-03-02 | 2026-05-11 | finiquito-e-indemnizaciones-en-chile | 20260511-1000-backfill | evidencia_parcial |
| gratificacion-legal-chile | 2026-05-03 | — | gratificacion-legal-chile | 20260511-1000-backfill | evidencia_parcial |
| impuesto-global-complementario-chile | 2026-05-03 | 2026-07-01 | impuesto-global-complementario-chile | 20260511-1000-backfill | evidencia_parcial |
| licencia-medica-desde-que-dia-pagan | 2026-03-02 | 2026-05-11 | licencia-medica-desde-que-dia-pagan | 20260511-1000-backfill | evidencia_parcial |
| operacion-renta-centro | 2026-04-29 | 2026-04-29 | operacion-renta-centro | 20260511-1000-backfill | evidencia_parcial |
| operacion-renta-f22-checklist | 2026-02-28 | 2026-05-11 | operacion-renta-f22-checklist | 20260511-1000-backfill | evidencia_parcial |
| pgu-pension-garantizada-universal | 2026-05-03 | — | pgu-pension-garantizada-universal | 20260511-1000-backfill | evidencia_parcial |
| rentas-mixtas-sueldo-honorarios | 2026-04-09 | 2026-05-11 | rentas-mixtas-sueldo-honorarios | 20260511-1000-backfill | evidencia_parcial |
| seguro-de-cesantia | 2026-02-25 | 2026-05-11 | seguro-de-cesantia | 20260511-1000-backfill | evidencia_parcial |
| sueldo-imponible-chile | 2026-05-03 | 2026-07-01 | sueldo-imponible-chile | 20260511-1000-backfill | evidencia_parcial |
| contribuciones-bienes-raices-chile | 2026-05-03 | — | contribuciones-bienes-raices-chile | 20260511-1000-backfill | evidencia_parcial |
| fondo-emergencia-chile | 2026-05-03 | — | — (no existe) | — | **ninguna** |

### Tabla (b): resumen agregado

| Forma de evidencia | en_alcance | historico | Total |
|---|---|---|---|
| packet_completo (06 + 07) | 3 | 0 | 3 |
| evidencia_parcial (backfill 2026-05-11) | 18 | 28 | 46 |
| ninguna (sin carpeta) | 1 | 3 | 4 |
| **Total** | **22** | **31** | **53** |

Posts históricos sin carpeta: `como-hacer-presupuesto-mensual-chile`, `que-es-el-ipc-chile-como-se-calcula`, `reajuste-arriendo-uf-ipc-chile`.

**Verificación del plan**: los conteos de `06-compliance.md` y `07-publish-packet.md` del ledger (3 y 3) coinciden con `find artifacts -name … | wc -l` → 3 y 3.

---

## 3. Reproducción del checker y su semántica

Comando npm verificado en `package.json:38`: `"check:editorial-artifacts": "node scripts/check-editorial-artifacts.mjs"`. Reproducción realizada el 2026-08-02 en el SHA `3c343e00`.

### Salidas reales

**1) Modo advertencia (por defecto)** — `node scripts/check-editorial-artifacts.mjs` → exit 0:

```
[check-editorial-artifacts] mode=warn-only enforce=0 min_sources=1 allowlist_entries=0 scope=all
[check-editorial-artifacts] SUMMARY total_posts=53 ymyl_posts=47 compliant=47 non_compliant=0
[check-editorial-artifacts] WARN: Gate in warn-only mode. Set EDITORIAL_ENFORCE=1 to fail on violations.
```

**2) CI sin enforce** — `CI=1 node scripts/check-editorial-artifacts.mjs` → exit 1:

```
[check-editorial-artifacts] mode=warn-only enforce=0 min_sources=1 allowlist_entries=0 scope=all
[check-editorial-artifacts] SUMMARY total_posts=53 ymyl_posts=47 compliant=47 non_compliant=0
[check-editorial-artifacts] FAIL: CI environments must export EDITORIAL_ENFORCE=1. YMYL compliance cannot be bypassed.
```

**3) Modo estricto** — `EDITORIAL_ENFORCE=1 node scripts/check-editorial-artifacts.mjs` → exit 0:

```
[check-editorial-artifacts] mode=strict enforce=1 min_sources=1 allowlist_entries=0 scope=all
[check-editorial-artifacts] SUMMARY total_posts=53 ymyl_posts=47 compliant=47 non_compliant=0
[check-editorial-artifacts] OK: strict mode passed.
```

### Qué evalúa "compliant" (semántica del checker, citas de `scripts/check-editorial-artifacts.mjs`)

- **Detección YMYL** — `detectYmyStatus`, líneas 295-318: un post es YMYL si el frontmatter tiene `ymyl: true` (no usado por ningún post), o su `category` está en `YMYL_CATEGORIES` (líneas 28-33), o algún `tag` está en `YMYL_TAGS` (líneas 35-59), o su id está en la allowlist. La allowlist se carga de `context/EDITORIAL_YMYL_ALLOWLIST.txt` (líneas 12-15); **ese archivo no existe** (verificado: no está en el árbol ni en `git ls-files`), y `loadAllowlist` devuelve un set vacío si falta (líneas 285-286: `if (!existsSync(filePath)) return new Set();`) → `allowlist_entries=0`. Los 47 YMYL salen de `category` (45 posts) y de `tag` (2 posts: `que-es-la-uf` por tag `creditos`, `utm-chile-que-es-como-funciona` por tag `impuestos`; ambos con `category: general`).
- **Chequeo de cumplimiento** — `evaluatePost`, líneas 481-610, sobre cada post YMYL:
  - Artefactos `brief` y `dossier` presentes en la carpeta temática del post (líneas 502-514).
  - Campo `fecha_corte` presente y con formato de fecha válido, tomado de `metadata.yaml`/`brief`/texto de sources/dossier (líneas 520-543).
  - Al menos 1 fuente válida (título, publicador/dominio, fecha, url) en `sources.yaml`/`sources.md`, o urls extraídas del dossier (líneas 545-574).
  - Advertencia no bloqueante si el cuerpo tiene claims numéricos y menos de `MIN_SOURCES` fuentes (líneas 576-582); `MIN_SOURCES = parsePositiveInt(env, 1)` → **1** por defecto (línea 20).
  - Cualquier violación → `nonCompliant = true` y `strictBlocking = nonCompliant` (líneas 584-590).
- **Modos** — `run()`, líneas 636-696: `compliant = ymylResults.length - nonCompliant.length` (línea 656); imprime el `SUMMARY` (línea 671); en modo advertencia falla solo si `CI` o `--ci` sin `EDITORIAL_ENFORCE=1` (líneas 674-680) y si no, imprime el `WARN` y sale 0 (líneas 681-685); en modo estricto falla solo ante violaciones `strictBlocking` (líneas 687-693) o imprime `OK: strict mode passed.` (línea 695).

**El checker no referencia en ningún punto** `06-compliance.md`, `07-publish-packet.md`, firma humana ni las siete etapas (grep sin coincidencias para `06-compliance|07-publish|firma|signoff|sign-off|signature|seven|siete` en el script).

### Respuesta a la afirmación del memo sobre "47/47"

La afirmación del memo tiene dos partes y solo una se confirma:

1. **¿El número coincide?** Sí. La salida real es `SUMMARY total_posts=53 ymyl_posts=47 compliant=47 non_compliant=0` — exactamente "47/47 piezas YMYL conformes".
2. **¿El modo advertencia explica el resultado?** No. El mismo `SUMMARY` 47/47 aparece en modo estricto y el gate pasa (`OK: strict mode passed.`, exit 0). El modo advertencia solo cambia el exit code cuando se corre en CI sin `EDITORIAL_ENFORCE=1` (FAIL). El conteo "47/47" refleja la definición propia del checker — "compliant" = sin violaciones de brief/dossier/fecha_corte/fuentes — no el modo en que opera.
3. **¿El checker mide lo que el claim promete?** No hay correspondencia directa: el checker mide estructura de artefactos de investigación + fuentes, y el claim público promete una cadena de siete etapas con firma humana. El checker no puede sostener el claim de la cadena de siete registros (ver sección 4c). Además, de los 47 posts YMYL, solo 1 (`como-elegir-inversion-segun-plazo-riesgo-objetivos`) tiene packet completo con `06`/`07`; los otros 2 packets (`bancos-y-fintech-chile`, `finanzas-para-migrantes-chile`) corresponden a posts que el checker no clasifica como YMYL (`category: general`, sin tags YMYL) y por tanto ni siquiera son evaluados.

**Verificación del plan**: los tres comandos de la tabla corrieron y sus líneas clave (SUMMARY, WARN, FAIL, OK) quedaron registradas arriba, con sus exit codes reales (0, 1, 0).

---

## 4. Veredicto claim vs. evidencia

### Claim público (citas literales)

`src/pages/metodologia.astro:115-135`:

> "Para el contenido YMYL nuevo y las actualizaciones sustantivas cubiertas desde la fecha indicada abajo, Monedario exige un proceso de siete etapas y la firma de un editor humano antes de publicar. La auditoría de números y la revisión regulatoria corresponden a roles independientes de quien redactó. En algunas etapas usamos asistencia de inteligencia artificial; abajo está el alcance y qué decisiones siguen siendo humanas."
>
> "**Alcance de esta promesa:** la cadena formal de siete registros aplica prospectivamente a contenido YMYL nuevo y a actualizaciones sustantivas desde el 25 de abril de 2026. El corpus histórico fue creado mientras estos controles evolucionaban y no posee evidencia uniforme de las siete etapas; por eso Monedario no afirma que esa cadena exista retroactivamente. Las piezas históricas siguen sujetas a fuentes, vigencia, estructura, pruebas y retroauditoría por riesgo."

`src/pages/acerca-de.astro:106-116`:

> "El contenido YMYL nuevo y sus actualizaciones sustantivas siguen un [proceso editorial de siete etapas] desde el 25 de abril de 2026: investigación de fuentes oficiales, cálculo verificable, auditoría independiente y decisión humana. El corpus histórico se somete a controles verificables y retroauditoría por riesgo, sin atribuirle artefactos que no existen."

### Evaluaciones

**(a) ¿Los posts en alcance tienen la evidencia que el claim promete?** No en su mayoría. El claim promete la cadena formal de siete registros para los 22 posts en alcance, pero solo 3/22 tienen `packet_completo` (los tres posts nuevos de junio 2026: bancos-y-fintech, como-elegir-inversion, finanzas-para-migrantes). 18/22 tienen solo evidencia_parcial (backfill del 2026-05-11 con brief, dossier, metadata, sources — sin `06-compliance` ni `07-publish-packet`) y 1/22 (`fondo-emergencia-chile`, publicado 2026-05-03, dentro del alcance) no tiene carpeta ni evidencia alguna. O sea: **19 de 22 posts en alcance no tienen la cadena de siete registros que el claim promete**.

**(b) ¿El corpus histórico queda correctamente fuera del claim por el disclaimer del aside?** Sí. El aside (`metodologia.astro:128-134`) excluye explícitamente el corpus histórico de la afirmación de la cadena ("Monedario no afirma que esa cadena exista retroactivamente"), y la evidencia es consistente con ese disclaimer: 0 de 31 posts históricos tienen packet, 28 tienen evidencia_parcial uniforme (backfill) y 3 no tienen carpeta. No se encontró evidencia que contradiga el disclaimer de forma grave; el backfill del 2026-05-11 es uniforme, posterior a la fecha de corte y no falsifica etapas ausentes (no contiene 06/07).

**(c) ¿El checker mide lo que el claim promete?** No; hay un desajuste de semántica estructural. El claim promete "proceso de siete etapas y la firma de un editor humano" (`metodologia.astro:117-119`) y "la cadena formal de siete registros" (`metodologia.astro:128-129`); el checker evalúa presencia de `brief`+`dossier`, `fecha_corte` y ≥1 fuente válida (`check-editorial-artifacts.mjs:502-574`), sin examinar `06-compliance.md` ni `07-publish-packet.md` ni firma ni etapas. Por eso un post puede ser "compliant" para el checker (47/47) y a la vez no tener la cadena de siete registros del claim (solo 1 de los 47 YMYL la tiene en `06`/`07`). La métrica del checker respalda un subconjunto del claim (fuentes + estructura), no el claim completo.

### Conclusión

> **El gap real es 19**: de los 22 posts en alcance del claim, 19 no tienen packet completo de siete registros (18 con evidencia parcial de backfill y 1 sin evidencia), y el checker reporta 47/47 "conformes" con una definición estructural que no mide las siete etapas ni la firma humana.

---

## 5. Recomendaciones (opciones para el operador)

Ninguna se implementa en este spike; son insumo para la compuerta de la sección 6.

**Opción A — Backfill de evidencia (o marcado explícito de parcialidad)**
- Esfuerzo: **M**. Riesgo: **medio** (riesgo reputacional si se reconstruyen artefactos con fechas/firmas que no existieron; prohibido inventar evidencia). Trade-off: cierra el gap para los 18 posts con backfill solo si se documenta honestamente qué etapas existieron y cuáles no (p. ej. marcar "evidencia parcial" en lugar de fabricar 06/07); el caso `fondo-emergencia-chile` requiere trabajo editorial completo desde cero, y 3 posts históricos quedarían igualmente fuera.
- Factibilidad: los backfills del 2026-05-11 ya contienen brief/dossier/sources/metadata; los 06/07 faltantes implican auditoría retrospectiva, no redacción.

**Opción B — Ajustar el claim público**
- Esfuerzo: **S**. Riesgo: **bajo** (el aside ya desclama retroactividad; se estrecharía el texto prospectivo). Trade-off: alinear el texto con la evidencia (p. ej. acotar la promesa de cadena completa al subconjunto con packet, manteniendo el disclaimer y la promesa de fuentes/estructura para el resto) elimina el claim no trazable sin tocar código; a cambio, la metodología pública queda menos ambiciosa y requiere re-auditoría editorial del texto (`metodologia.astro` y `acerca-de.astro`), con su snapshot de rutas/RSS si cambian slugs (no es el caso aquí: solo texto).

**Opción C — Ajustar el checker**
- Esfuerzo: **M**. Riesgo: **medio** (cambia el gate de CI y la semántica de "compliant"; exige re-validación del flujo editorial). Trade-off: alinear "compliant" con el claim (exigir evidencia de las etapas / 06-07 o separar métricas: "estructura+fuentes" vs. "cadena completa") haría que el número 47/47 deje de sobrevender cumplimiento; a cambio, muchos posts pasarían a non_compliant y el gate estricto bloquearía hasta decidir backfill o ajuste de claim. Opción complementaria, no sustituta, de A o B.

---

## Decisión del operador

Preguntas que solo el operador puede responder; este spike no implementa ninguna opción.

1. **Qué opción tomar por gap**: ¿Opción A (backfill/marcado de parcialidad), Opción B (estrechar el claim público), Opción C (redefinir "compliant" del checker) o una combinación (p. ej. B ahora + A parcial después)?
2. **Alcance del backfill**: para los 18 posts en alcance con evidencia_parcial, ¿se acepta marcar "evidencia parcial" en lugar de reconstruir 06/07? ¿Se autoriza trabajo editorial completo para `fondo-emergencia-chile` (sin carpeta, en alcance, sin evidencia)?
3. **Semántica del checker**: ¿conviene que el checker reporte por separado "estructura + fuentes" y "cadena de siete registros", o que `06/07` pasen a ser requisito en modo estricto? ¿Qué hacer con los 2 posts con packet completo que el checker hoy no clasifica como YMYL (`bancos-y-fintech-chile`, `finanzas-para-migrantes-chile`, ambos `category: general`)?
4. **Governance**: si se elige la Opción B, ¿quién re-audita el texto público y con qué compuertas (NORMA_YMYL, separación de roles)? ¿Se requiere un plan de ejecución posterior con compuertas editoriales?
5. **Evidencia nueva que cambiaría el veredicto**: la aparición de más `06-compliance.md`/`07-publish-packet.md` en los tópicos en alcance; la creación del archivo `context/EDITORIAL_YMYL_ALLOWLIST.txt` (hoy inexistente, `allowlist_entries=0`); un cambio en `MIN_SOURCES` o en el modo estricto del checker (invalida la reproducción de este ledger, que quedó registrada en el SHA `3c343e00`); o evidencia de que algún post histórico sí tuvo la cadena completa (revisaría la severidad del hallazgo 4c).

---

## Notas de mantenimiento

- La reproducción del checker (sección 3) es válida para el SHA `3c343e00` (2026-08-02); cualquier cambio futuro en `check-editorial-artifacts.mjs` (modo estricto, `MIN_SOURCES`, allowlist) invalida esta reproducción.
- Los números de este ledger provienen de ejecuciones reales en esta sesión: conteos de posts y carpetas (`ls`/`find`/script de clasificación), salidas del checker (3 modos con exit codes) y lecturas de fuente con números de línea verificados.
- El memo citaba "50 carpetas temáticas" en `artifacts/editorial/`: el conteo real es 49 temáticas + `_intake` (50 directorios). Se registra la precisión en la sección 2.
- El plan citaba `src/content.config.ts:17,19` para `pubDate`/`updatedDate`: las líneas reales son 43-44. Se cita lo real.
