# Verificación de remediación — `indemnizacion-anos-de-servicio-chile` (2026-09-17)

- **Artículo:** `src/data/blog/indemnizacion-anos-de-servicio-chile.md`
- **Auditoría base:** `docs/reports/AUDIT-indemnizacion-anos-de-servicio-chile-2026-09-17.md`
  (5 alta F1–F5, 6 media F6–F11, 3 baja F12–F14; 8 NHV; OBS-1/OBS-2 fuera de alcance)
- **Alcance del diff revisado:** `git diff` del artículo, +25/−12 líneas, sin commit.
- **Rol:** ComplianceAgent, sesión fresca, adversarial. No se redactó el diff.
- **Fecha de verificación:** 2026-09-17 (UTC)
- **Regla de decisión:** un hunk se RECHAZA solo si su nueva redacción afirma
  algo que la fuente espejo citada no dice literalmente, o si introduce una
  afirmación solo-verificable-en-BCN. Simplificaciones fieles se aceptan con
  observación. Omisiones de detalle sugerido no son rechazo.

## Veredicto

**ACCEPT DIFF — sin bloqueadores.**

11 hunks reclamados revisados: 11 ACCEPT, 0 REJECT. Fuentes re-fetcheadas hoy:
DT 60585, DT 60593, SUSESO art. 163, SUSESO art. 168, SUSESO art. 172,
SII Ord. N°009/2017. Ningún hunk introduce afirmaciones solo-BCN.
Ningún remanente prohibido. OBS-1, OBS-2 y la calculadora intactos.
F10 estructural no fue contrabandeado. Flag informativo: la línea `limits`
del frontmatter ahora contradice el cuerpo (no bloquea por sí sola).

## 1. Disposición por hunk

### F1 — Horas extra a exclusiones (L128) — ACCEPT

Nueva redacción: "Se excluye: horas extraordinarias (aun pagadas en forma
mensual)". DT 60585 literal: "aun cuando sean pagados en forma mensual no
deben incluirse: Las horas extras". Art. 172 (espejo SUSESO 69871) literal:
"con exclusión de la asignación familiar legal, pagos por sobretiempo y
beneficios o asignaciones que se otorguen en forma esporádica o por una sola
vez al año". Dentro de fuente. El remanente prohibido
"horas extraordinarias si son habituales" está ausente (grep §3).

### F2 — Tope 90 UF en la fórmula (L101) — ACCEPT

Nueva redacción: "no se considera una remuneración mensual superior a 90 UF
del último día del mes anterior al pago (art. 172)". Art. 172 literal: "no se
considerará una remuneración mensual superior a 90 unidades de fomento del
último día del mes anterior al pago". Cita textual en paráfrasis fiel.
La fórmula del bloque (>L99) sigue sin el tope inline, pero el párrafo del
tope la sigue inmediatamente; no hay fórmula sin tope. SII Ord. 009 corrobora
la medición ("límite de las 90 UF del último día del mes anterior").

### F3 — Requisito 1 año mínimo (L60, L64) — ACCEPT

Nueva redacción: "el contrato tiene que haber estado vigente un año o más" y
"la fracción superior a seis meses cuenta como un año adicional, una vez
cumplido el primer año". DT 60593 literal: "Existe el derecho cuando el
contrato de trabajo ha durado un año o más… y, además, la causal… es
necesidades de la empresa o el desahucio". SUSESO art. 163 literal: "Si el
contrato hubiere estado vigente un año o más y el empleador le pusiere
término en conformidad al artículo 161". La fracción > 6 meses vive dentro
de ese mismo inciso ("por cada año de servicio y fracción superior a seis
meses"), por lo que el calificador "una vez cumplido el primer año" es
síntesis respaldada, no invención.

### F4 — Obra/faena 2,5 días (L90) — ACCEPT con observación

Nueva redacción: "indemnización especial de 2,5 días de remuneración por cada
mes trabajado y fracción superior a 15 días, si el contrato estuvo vigente un
mes o más y se puso término por esa causal (base según art. 172)". SUSESO
art. 163 literal: "una indemnización equivalente a dos y medio días de
remuneración por cada mes trabajado y fracción superior a quince días",
"hubiere estado vigente por un mes o más", "calculada en conformidad a lo
establecido en el artículo 172", "si se pusiere término al contrato por la
causal contemplada en el número 5 del artículo 159". Cada elemento está
literalmente respaldado. Observación: se omitió la incompatibilidad con las
acciones del art. 168 inc. 1 que la auditoría sugirió ("El ejercicio del
derecho… es incompatible…"); ver residual R1. Omisión, no falsedad.

### F5 — Caducidad 60/90 días hábiles (L157) — ACCEPT

Nueva redacción: "dentro de 60 días hábiles desde la separación; el plazo se
suspende si se reclama ante la Inspección del Trabajo, con un tope absoluto
de 90 días hábiles desde la separación (art. 168)". SUSESO art. 168 literal:
"podrá recurrir al juzgado competente, dentro del plazo de sesenta días
hábiles, contado desde la separación", "El plazo… se suspenderá cuando…
interponga un reclamo… ante la Inspección del Trabajo", "en ningún caso podrá
recurrirse al tribunal transcurridos noventa días hábiles desde la
separación". Fiel. El plazo de 2 años queda correctamente degradado a
"prescripción general" (L163) sin presentarlo como plazo de la acción.

### F6 — Colación/movilización por mensualidad (L126–L128) — ACCEPT

Nueva redacción: incluye "gratificaciones proporcionales cuando se pagan mes
a mes, asignaciones de colación y movilización cuando se pagan mensualmente,
comisiones y bonos mensuales"; excluye horas extra, asignación familiar,
aguinaldos/gratificación anual y bonos esporádicos. DT 60585 literal: "si la
gratificación es pagada mes a mes… debe incluirse", "Lo mismo ocurre con las
asignaciones de colación, movilización… si tales beneficios son pagados en
forma mensual", "no deben incluirse: Las horas extras, Las asignaciones
familiares… Los pagos que no son mensuales… y aquellos que se pagan una vez
al año". El default quedó correctamente invertido a inclusión-por-mensualidad.

### F7 — Promedio 3 meses variables (L130) — ACCEPT

Nueva redacción: "la base es el promedio de lo percibido en los últimos tres
meses calendario (art. 172)". Art. 172 literal: "Si se tratare de
remuneraciones variables, la indemnización se calculará sobre la base del
promedio percibido por el trabajador en los últimos tres meses calendario".
Ejemplo aritmético verificado: (600.000 + 900.000 + 750.000) / 3 = 750.000.
Sin deferral al empleador como única vía.

### F8 — Tabla de recargos 30/50/80/100 (L76–L83) — ACCEPT

Filas contra SUSESO art. 168 literal: letra a) "En un treinta por ciento, si
se hubiere dado término por aplicación improcedente del artículo 161";
letra b) "En un cincuenta por ciento… injustificada de las causales del
artículo 159 o no se hubiere invocado ninguna causa legal"; letra c) "En un
ochenta por ciento… indebida de las causales del artículo 160"; 100% "Si el
empleador hubiese invocado las causales señaladas en los números 1, 5 y 6
del artículo 160 y el despido fuere además declarado carente de motivo
plausible". Las cuatro filas coinciden. Ningún "20–80%" (grep §3).

### F9 — Desahucio como causal habilitante (L73) — ACCEPT con observación

Nueva redacción: "Desahucio del empleador (art. 161…)". DT 60593 literal: la
causal es "necesidades de la empresa o el desahucio del empleador" y el
art. 163 aplica "por necesidades de la empresa… o por desahucio". Respaldado
por espejo, no es afirmación solo-BCN. Observación: sin nota de alcance
(cargos de confianza / casa particular); ver residual R2.

### F11 — FAQ tributario reescrito (L160) — ACCEPT con observaciones

Nueva redacción: (i) legales + pactadas en contratos/convenios colectivos no
constituyen renta (art. 178); (ii) tope 90 UF del último día del mes anterior
limita la base legal (art. 172); (iii) el exceso es voluntario y tributa por
art. 17 N°13 LIR sobre promedio reajustado de últimas 24 remuneraciones.
SII Ord. 009 cita art. 178 ("establecidas por ley, las pactadas en contratos
colectivos… o en convenios colectivos… no constituirán renta"), Circ. 10/1999
(90 UF solo para indemnizaciones legales: inc. 2° art. 163 + sustitutiva de
aviso previo), y el régimen 17 N°13 (promedio 24 meses, reajuste IPC, IUSC
art. 46 devengado en 12 meses). La dirección es correcta en los tres puntos.
Observaciones (imprecisiones, no falsedades): comprime "contratos colectivos"
a "contratos" y omite el calificador de convenios ("que complementen,
modifiquen o reemplacen…"); omite las exclusiones del promedio (gratifica-
ciones, participaciones, bonos) y el detalle IPC/IUSC; no agrega las citas
Circ. 29/1991 ni Circ. 10/1999 que la auditoría sugirió. Ver residual R3.

### F12 — Redacción del tope de 11 (L136) — ACCEPT

Nueva redacción: "El tope de 11 años es el máximo del régimen legal
supletorio; las partes pueden pactar más, y el pacto solo reemplaza a la
regla legal si la supera". SUSESO art. 163 literal: pacto aplicable "siempre
que ésta fuere de un monto superior" y, en su defecto, 30 días con "límite
máximo de trescientos treinta días". La inversión "el tope es el piso" está
ausente (grep §3).

### Frontmatter — `updatedDate` + `validAsOf` → 2026-09-17 — ACCEPT parcial

Ambos sellos avanzan al día del cambio sustantivo; `validAsOf` deja de estar
un mes huérfano por delante de `updatedDate` (anomalía F13 cerrada en fechas).
Pendiente: la línea de registro de 1 línea (§5 NORMA) no se agregó; ver R4.

## 2. Chequeo solo-BCN (artículos 159/160/161/510, transitorios, circulares)

El diff no agrega ninguna cita a Circ. 29/1991, Circ. 10/1999, transitorios ni
texto del art. 510. Afirmaciones con número de artículo introducidas por el
diff y su respaldo espejo: desahucio→art. 161 (DT 60593); recargos 30/50/80 +
100% N°1/5/6 (SUSESO 168); obra N°5 + base art. 172 (SUSESO 163);
90 UF art. 172 (SUSESO 172 + SII 009); 60/90 días art. 168 (SUSESO 168);
promedio 3 meses art. 172 (SUSESO 172); no-renta art. 178 + 17 N°13
(SII 009). El mapeo N°1/N°2/N°4 (renuncia, mutuo, plazo) es preexistente, no
introducido. La frase de 2 años (art. 510, NHV-5) es preexistente y el diff
solo la califica como prescripción general frente a 60/90 días, calificación
que se sigue de SUSESO 168. **Ninguna afirmación solo-BCN escrita. PASS.**

## 3. Remanentes prohibidos (grep sobre el archivo actual)

- "horas extraordinarias si son habituales" en INCLUSIONES: ausente.
- Fórmula sin tope 90 UF: ausente (tope en L101 junto a la fórmula).
- Falta condición 1 año: ausente (L60 la exige).
- Obra "no corresponde": ausente (L90 da la indemnización especial; el único
  "no corresponde" restante es el genérico de L68, no el de obra).
- "hasta 2 años" como único plazo judicial: ausente (L157 + L163 dan el
  cuadro doble 60/90 vs. 2 años).
- Recargos "20–80%": ausente (tabla 30/50/80/100 en L78–L83).
- "el tope de 11 es el piso": ausente (L136 dice máximo supletorio).
- F10 contrabandeado: ausente — sin bloque de vigencia visible, sin etiqueta
  "orientativo", `officialSources` sigue con raíces genéricas (BCN + DT
  channel), sin deep links. **PASS.**

## 4. Disciplina de alcance

- Archivos custodiados sin modificar (`git status` vacío para los tres):
  `src/data/laws/codigo-del-trabajo.md` (OBS-1), `src/data/blog/` +
  `finiquito-e-indemnizaciones-en-chile.md` (OBS-2),
  `src/pages/calculadoras/finiquito-indemnizacion.astro` (calculadora).
- Diff del target: sin cambios de slug, canonical, título, hero, rutas ni
  código; frontmatter limitado a `updatedDate` y `validAsOf`.
- Nota: el workdir contiene otros `M` no relacionados (4 blogs ajenos:
  dicom, interés compuesto ×2, reforma previsional) y borrados masivos bajo
  `output/`. Ninguno pertenece a esta remediación; no se auditan aquí, pero
  contaminan el workdir y deben aislarse antes de cualquier commit.
- Flag informativo (no bloqueador): frontmatter `limits` L40 aún dice "No
  incorpora recargos judiciales" mientras el cuerpo ahora incorpora la tabla
  de recargos (L76–L83). Contradicción real introducida por el diff; requiere
  actualizar esa línea en un pase posterior. No bloquea porque `limits`
  describe cobertura orientativa, no una regla jurídica.

## 5. Residuales (no aplicados; ninguno bloquea este diff)

- **R1 (F4 resto):** agregar incompatibilidad de la indemnización de
  obra/faena con las acciones del art. 168 inc. 1. Aplicable con espejo
  (SUSESO 163) pero omitido.
- **R2 (F9 resto):** nota de alcance del desahucio (cargos de confianza /
  casa particular según régimen). Requiere espejo adicional; diferible.
- **R3 (F11 resto):** exclusiones del promedio 24 meses
  (gratificaciones/participaciones/bonos), reajuste IPC, devengo IUSC 12
  meses, y citas Circ. 29/1991 + Circ. 10/1999. Fielmente resumible desde
  SII Ord. 009; omitido.
- **R4 (F13 resto):** línea de registro de 1 línea (qué cambió / por qué /
  fuentes) exigida por §5 NORMA junto al bump de `updatedDate`.
- **R5 (F10, diferido por diseño):** bloque visible Respuesta rápida con
  vigencia, etiquetas "resumen orientativo" y deep links por regla
  (DT 60593, DT 60585, SUSESO 69844/69871/69859, SII ja009). Excluido
  a propósito de este pase; queda abierto y verificado-ausente.
- **R6 (F14, fuera de alcance genuino):** excepciones pre-14.08.1981 (requiere
  BCN transitorios, NHV-6), casa particular 1,11% y finiquito a disposición
  en 10 días hábiles. Lo último es aplicable con espejo (DT 60593 lo dice
  literal) y podría entrar en un micro-pase.
- **R7 (informativo §4):** actualizar `limits: "No incorpora recargos
  judiciales."` para que no contradiga la tabla de recargos del cuerpo.

## 6. Gates ejecutados

- `pnpm exec prettier --check` sobre este reporte: PASS (ver salida).
- `git diff --check`: PASS (sin errores de espacios).
- Re-fetch de fuentes (2026-09-17): DT 60585 OK, DT 60593 OK, SUSESO 163 OK,
  SUSESO 168 OK, SUSESO 172 OK, SII Ord. 009 OK. BCN LeyChile no intentado
  (bot-block documentado en la auditoría; nada del diff lo requiere).
