# Verificación adversarial — diff `renegociacion-superir` (2026-09-17)

- **Archivo bajo revisión:** `src/data/blog/renegociacion-superir.md`
- **Base de comparación:** `git diff` del workdir (no commiteado) contra `HEAD`.
- **Contexto leído:** `docs/reports/AUDIT-renegociacion-superir-2026-09-17.md`.
- **Rol:** ComplianceAgent en sesión fresca; no se escribió el diff revisado.
- **Método:** adversarial (intento de rechazo por hunk). Nada se aceptó
  de memoria: aritmética recomputada, texto legal re-extraído, ficha
  ChileAtiende re-fetcheada, remanentes grepeados.

## 1. Diff bajo revisión (5 hunks, 5 inserciones / 5 eliminaciones)

```text
-updatedDate: 2026-03-12T18:45:00Z
+updatedDate: 2026-09-17T18:45:00Z
-  validAsOf: 2026-04-12
+  validAsOf: 2026-09-17
-...con el Estado como árbitro.
+...con el Estado como mediador.
-(~$3.500.000 aproximadamente, según el valor del día)
+(~$3.276.072 con la UF al 2026-09-17; valor referencial, verifica el valor del día)
-Sí. La renegociación no congela tus cuentas ni te impide operar financieramente mientras el proceso avanza.
+Sí. Solicitarla no congela tus cuentas por sí solo, pero el banco puede suspender tus líneas de crédito o sobregiro y no puedes disponer de tus bienes embargables mientras el proceso avanza (art. 264 N°4 y N°6, Ley 20.720).
```

## 2. Disposición por hunk

### H1 — `updatedDate: 2026-03-12` → `2026-09-17` — ACCEPT

Cambio de frontmatter declarado ("frontmatter dates only"). La fecha
coincide con la fecha de la pasada de remediación y con
`indicatorUpdatedAt.uf = 2026-09-17` del snapshot, por lo que el
re-atestiguado es coherente con la figura F1 del mismo diff. Hora
`18:45:00Z` posterior a `capturedAt 2026-09-17T18:15:30.379Z` del
snapshot: orden cronológico plausible (primero se capturó el
indicador, luego se editó). Sin objeción.

### H2 — `validAsOf: 2026-04-12` → `2026-09-17` — ACCEPT

Segundo cambio de frontmatter declarado. Resuelve la observación F11
del audit (corte de 5 meses en contenido de insolvencia) al
re-atestiguar el corte a la fecha de remediación. No se altera
`reviewPolicy` (sigue `cadenceLabel annual / maxDays 365`), por lo que
`dueDate` se recalcula a 2027-09-17 sin cambio de cadencia. Sin objeción.

### H3 — F10: `árbitro` → `mediador` (L72) — ACCEPT

Verificación propia: fetcheada la ficha ChileAtiende
`fichas/37401-renegociacion-de-las-deudas-de-una-persona` en esta
sesión. Texto literal vigente:

> "La Superintendencia de Insolvencia y Reemprendimiento (Superir)
> actúa como **facilitadora**, ayudándote a ti y a tus acreedores a
> llegar a un acuerdo que sea conveniente para ambas partes."

La ficha dice "facilitadora", no "mediadora" literal. Intento de
rechazo evaluado: ¿es "mediador" una sustitución infiel? No. "Árbitro"
implica potestad decisoria, que la Superir no tiene en renegociación
(el acuerdo lo votan deudor + acreedores, arts. 265–267); tanto
"facilitadora" (ficha oficial) como "mediadora" (cuerpo del artículo,
L70: "actúa como mediadora"; FAQ L252: "actúa como mediadora")
denotan rol no decisorio. El swap elimina la caracterización falsa y
converge con la terminología oficial y con el resto del artículo.
Nota menor (no bloqueante): "facilitadora" sería la cita literal de
la ficha; "mediadora" es sinónimo aceptable y consistente con L70/L252.

### H4 — F1: `~$3.500.000` → `~$3.276.072 con la UF al 2026-09-17` — ACCEPT

Recomputación propia desde
`src/infrastructure/economic/economic-parameters.snapshot.json`:

- `uf = 40950.90`, `indicatorUpdatedAt.uf = "2026-09-17"`,
  `lastUpdated = "2026-09-17"`, `capturedAt = "2026-09-17T18:15:30.379Z"`.
- Aritmética: `80 × 40950.90 = 3276072.00` → **$3.276.072** exacto,
  sin redondeo (verificado por ejecución, igualdad exacta).
- La cifra del artículo ($3.276.072) coincide con mi aritmética al peso.
- La datación del artículo ("con la UF al 2026-09-17") coincide con
  `indicatorUpdatedAt.uf` ("2026-09-17"). Match exacto.
- Fraseo como valor datado, no hecho atemporal: "valor referencial,
  verifica el valor del día" + fecha explícita. Cumple.
- Intento de rechazo evaluado: ¿debió registrarse `volatileData` en vez
  de fijar cifra? El audit ofrecía ambas vías (eliminar conversión o
  registrar `volatileData`). La remediación eligió una tercera vía —
  cifra datada con disclaimer — que es estrictamente mejor que el
  original ("según el valor del día" sin fecha, derivando ~6,8% por
  debajo de lo afirmado) y no introduce un hecho atemporal. La cifra
  volverá a derivar con el tiempo, pero la fecha + disclaimer lo hacen
  auditable en el próximo refresh. No bloqueante; se lista como
  residual de frescura (R-F1).

### H5 — F2: acotación de cuentas/operación con art. 264 N°4 y N°6 — ACCEPT

Verificación propia contra texto legal literal (Ley 20.720,
idNorma 1058072, "Última Versión", verificado en esta sesión):

- **Artículo 264**, encabezado: "Efectos de la Resolución de
  Admisibilidad. Desde la publicación de la Resolución de
  Admisibilidad y hasta el término del Procedimiento Concursal de
  Renegociación se producirán los siguientes efectos:" — número y
  rótulo correctos.
- **N°4** literal: "…con la **sola excepción de suspender las líneas
  de crédito o sobregiro** que se hubieren pactado." Respalda "el banco
  puede suspender tus líneas de crédito o sobregiro". (Actor: las
  líneas/sobregiros son productos bancarios; la atribución al banco es
  la lectura operativa que el propio audit recomendó.)
- **N°6** literal: "La Persona Deudora **no podrá ejecutar actos ni
  celebrar contratos relativos a sus bienes embargables**… bajo el
  apercibimiento de ser tenido por depositario alzado…". Respalda "no
  puedes disponer de tus bienes embargables".
- La nueva redacción además corrige el defecto temporal del original:
  "Solicitarla no congela tus cuentas **por sí solo**" + "**mientras
  el proceso avanza**" refleja que los efectos corren desde la
  publicación de la Admisibilidad (encabezado del art. 264), no desde
  la mera solicitud. La calificación "el banco **puede**" (facultad,
  no certeza) es fiel al carácter de excepción del N°4.
- Intento de rechazo evaluado: ¿"no congela tus cuentas" sigue
  demasiado amplio (ej. retenciones judiciales paralelas)? El hunk ya
  no afirma ausencia de toda restricción: enumera las dos restricciones
  legales pertinentes y cita fuente. Suficiente para el claim tal como
  está acotado. ACCEPT.

### Normalizador BCN — reporte de herramienta

- Existe `/tmp/opencode/bcn-spike/normalize.mjs` + `golden-set.json`:
  **sí, se prefirió**. `node normalize.mjs 1058072 --art 264 --json`
  **funcionó**: devolvió el art. 264 con bloques por numeral,
  texto sin notas marginales y ordinales 1.°–9.°.
- `node extract.mjs 1058072 --art 264` también funcionó pero con pegado
  de notas modificatorias en crudo ("5)Ley 21563…"); el normalizador es
  superior y sus citas N°4/N°6 son las usadas arriba. Nada se escribió
  en el repo (cwd del spike: `/tmp/opencode/bcn-spike`).

## 3. Remanentes prohibidos (grep sobre el artículo vigente)

| Patrón | Resultado |
|---|---|
| `~$3.500.000` / `3.500.000` / `3,500,000` | **Ausente.** Solo aparece `$3.276.072` (L94). |
| `no congela tus cuentas ni te impide operar` (forma no calificada) | **Ausente.** L258 trae la forma acotada con cita legal. |
| `árbitro` / `arbitro` (cualquier forma) | **Ausente.** `mediador` en L72; `mediadora` en L70/L252 (formas fix, no remanente). |

Nota: el grep de `arbitr` sobre el artículo solo matchea
`mediadora/mediador` como subcadenas parciales en búsqueda laxa; no hay
ocurrencia de la raíz `árbitr-`. Otros archivos con "arbitrario/a"
(finanzas-migrantes, que-es-la-uf, etc.) son falsos positivos de palabra
distinta, fuera del alcance.

## 4. Alcance (scope)

- `git diff --stat`: **1 archivo, 5+/5-** en la ruta objetivo.
  Sin cambios de slug, `canonicalTopic`, título/`seoTitle`,
  `description`, `heroImage`, rutas, código o registros (grep del diff
  sobre `slug|canonical|title|hero|seoTitle|description`: sin
  coincidencias en líneas +/- salvo las 5 hunks listadas).
- Frontmatter: solo `updatedDate` + `articleLead.validAsOf`. Sin
  `volatileData`, sin etiquetas nuevas, sin bloques/secciones nuevas
  (268 líneas antes y después; sin encabezados añadidos).
- **Higiene de commit (STOP):** el workdir contiene OTRAS
  modificaciones no relacionadas y sin commitear
  (`src/components/NextSteps.astro`,
  `src/config/editorial-topic-policy.mjs`, otros posts,
  `cotizacion-voluntaria-afp-independiente.md` + hero assets nuevos,
  `reddit-monitor/`, borrados bajo `output/`). Esta verificación cubre
  **solo** el diff de `renegociacion-superir.md`. Cualquier commit debe
  seleccionar (stage) únicamente la ruta objetivo; no se autoriza ni se
  realizó commit alguno.

## 5. Residuales (no regresiones; refresh futuro del audit)

- **R-F1 (frescura):** la cifra $3.276.072 derivará con la UF; el
  próximo refresh deberá re-datadar o registrar
  `volatileData: [{id: economic.uf.value, sync: reference}]`.
- **R-F3 (Low, abierto):** L72 "No te van a quitar la casa por iniciar
  este proceso" conserva el defecto temporal (la protección rige desde
  la publicación de la Admisibilidad, art. 264 inc. 1°). No tocado por
  este diff; pendiente.
- **R-F4 (Low, abierto):** L202 "mínimo dos acreedores distintos" (la
  ley exige obligaciones diversas, art. 260). Pendiente.
- **R-F5 (Low, abierto):** 15 días hábiles sin atribución a práctica
  Superir + "debes empezar de cero" (L116, L176-178). Pendiente.
- **R-F6 (Low, abierto):** excluidos solo-alimentos (L238-242); faltan
  delitos/cuasidelitos y multas/sanciones (art. 260 inc. 3°). Pendiente.
- **R-F7 (Low, parcial):** el cuerpo sigue sin citar Ley 20.720 en
  requisitos; el diff añade una cita (art. 264, FAQ). Pendiente resto.
- **R-F8/F9 (Low/obs, abiertos):** sin etiqueta orientativa; omisiones
  YMYL (garantizados art. 266, rehabilitación art. 268, modificación
  única art. 272 A, término anticipado art. 269, plazos arts. 263/265).
- **R-H1–H5 (NEEDS-HUMAN-VERIFY del audit):** siguen abiertos
  (certificados 6 meses, re-postulación, reformas en trámite, borde
  un-acreedores, N° de meses de liquidaciones).

## 6. Veredicto

**ACCEPT DIFF** — 5/5 hunks ACCEPT, 0 REJECT, 0 bloqueantes.

- H1 (updatedDate) ACCEPT — fecha coherente con snapshot y remediación.
- H2 (validAsOf) ACCEPT — re-atestigua corte (cierra F11).
- H3 (F10 árbitro→mediador) ACCEPT — rol no decisorio confirmado por
  ficha ChileAtiende ("facilitadora") + consistencia L70/L252.
- H4 (F1 80 UF) ACCEPT — `80 × 40950.90 = 3276072.00` exacto;
  datación 2026-09-17 = `indicatorUpdatedAt.uf`; fraseo datado.
- H5 (F2 cuentas) ACCEPT — N°4 (líneas/sobregiro) y N°6 (bienes
  embargables) del art. 264, Ley 20.720, respaldan la redacción.
- Remanentes prohibidos: 0. Scope: limpio (1 archivo, frontmatter solo
  fechas, sin cambios protegidos).
- Residuales R-F1/R-F3–R-F9/R-H1–H5 quedan para el refresh de 30 días
  recomendado por el audit; ninguno lo convierte en REJECT.
