# VERIFY — `fonasa-vs-isapre-comparativa` (remediation pass)

- **Fecha de verificación:** 2026-09-18 (UTC)
- **Archivo verificado:**
  `src/data/blog/fonasa-vs-isapre-comparativa.md`
- **Alcance del verificador:** READ-ONLY sobre el artículo + este
  reporte. No se editó el artículo ni ningún otro archivo
  (en particular NO `scripts/bcn-cite.mjs`). No se hizo commit.
- **Diff inspeccionado:**
  `git diff -- src/data/blog/fonasa-vs-isapre-comparativa.md`
  (trabajo NO commiteado en workdir; 1 archivo, 29 inserciones,
  29 eliminaciones).
- **Contexto leído:**
  `docs/reports/AUDIT-fonasa-vs-isapre-comparativa-2026-09-18.md`
  (veredicto FINDINGS: 3 altas / 6 medias / 5 bajas; F1–F14, NHV-1–8).
- **Disposición:** **ACCEPT** — cada hunk declarado (Copago Cero F1,
  sexo/TUF F2, desahucio 1 año F3, copagos GES F4, régimen ICSA F5,
  cargas F7, FPS→RSH F8, fechas de frontmatter) está dentro de su
  fuente citada, ver §1–§3. Intento adversarial de rechazo: falla
  en todos los hunks.
- **Pero el archivo NO queda limpio:** L63 conserva fecha corporal
  stale (§5, residual R1) y quedan fuera ítems bajos/medios no
  declarados (§6). Se requiere pase de seguimiento; nada de eso
  justifica REJECT del pase actual.

## 1. bcn-cite.mjs read-only (exit 0 + coincidencia literal)

Comandos corridos por este verificador (solo lectura, sin editar
el script):

- `node scripts/bcn-cite.mjs 249177 --art 197 --json` → EXIT 0,
  `locator.idParteResolved: "8654056"`, norma DFL-1 (título
  refundido 2006). Literal (inciso 2, extracto):

  > "El cotizante podrá, una vez transcurrido un año de vigencia de
  > beneficios contractuales, desahuciar el contrato, para lo cual
  > bastará una comunicación escrita a la Institución con copia al
  > empleador o a la entidad pagadora de la pensión, según
  > corresponda, dada con una antelación de, a lo menos, un mes del
  > cumplimiento del primer año o de la fecha posterior en que se
  > hará efectiva la desafiliación…"

  La redacción nueva del artículo (H9) es paráfrasis fiel: "una vez
  transcurrido un año de vigencia de beneficios contractuales" +
  "comunicación escrita … con copia a tu empleador o entidad
  pagadora, con al menos un mes de anticipación". Coincidencia
  literal de los tres elementos (año / escrita+copia / un mes).
  El `idParte 8654056` coincide con el citado por la auditoría
  (§9 del AUDIT).

- `node scripts/bcn-cite.mjs 1203779 --art 2 --json` → EXIT 0,
  `locator.idParteResolved: "10501377"`, Ley 21.674 pub. 2024-05-24.
  Literal (numeral 4, extracto):

  > "4) La obligación de restituir … las cantidades percibidas por
  > las Instituciones de Salud Previsional por concepto de cobro de
  > cargas no natas y menores de dos años de edad, desde el 1 de
  > diciembre de 2022. Estos cobros no podrán ser exigidos o
  > realizados de manera retroactiva, una vez que la persona
  > beneficiaria cumpla dos años de edad."

  Respalda "prohibido cobrar cargas no natas y menores de 2 años
  desde el 01-12-2022" (H6/H7/H12). El `idParte 10501377` coincide
  con el citado por la auditoría.

No se tocó `scripts/bcn-cite.mjs`; no hizo falta fallback a
mirrors (ambos exits fueron 0).

## 2. Re-fetch de fuentes primarias (este verificador, 2026-09-18)

- **Fonasa — Tramos**
  (`fonasa.cl/sites/fonasa/beneficiarios/informacion-general/tramos`):

  > "Desde septiembre de 2022, existe el Copago Cero en la
  > Modalidad de Atención Institucional (Centros de Salud,
  > Consultorios, Postas y Hospitales Públicos)."

  > "Tramo A — Personas carentes de recursos. Causantes de subsidio
  > familiar (Ley 18.020). – Tienen Copago Cero … (MAI). – No tienen
  > acceso a comprar bonos … (MLE)."

  > "Tramo B/C/D – Tienen Copago Cero … (MAI)" + "Con 3 o más
  > cargas familiares pasará a Tramo B" (C) / "pasará a Tramo C" (D),
  > tramos "actualizados al 1 de mayo de 2026 según la ley 21.830".

- **Supersalud — GES**
  (`superdesalud.gob.cl/orientacion-en-salud/garantias-explicitas-en-salud-ges/`):

  > "Garantía de Protección Financiera: Cancelar sólo el copago: 0%
  > Afiliados del Fonasa A y B; 10% grupo C y 20% grupo D y afiliados
  > a Isapres."

  (Nominal; el override a $0 en Fonasa lo da Copago Cero — ver
  ChileAtiende abajo. La página aún dice "80 problemas de salud";
  el artículo correctamente NO da conteo.)

- **ChileAtiende ficha 2464** (link citado por el artículo):

  > "Si perteneces a Fonasa, quedarás excluido o excluida de la
  > cotización mensual para el AUGE-GES, mientras que si estás
  > afiliado o afiliada a una Isapre debes pagar por cada
  > beneficiario o beneficiaria un monto mensual en pesos o [UF],
  > determinado por cada organismo."

  > "Al hacer uso de las garantías del AUGE-GES podrás acceder
  > gratuitamente a las atenciones en el sistema público de salud
  > producto del Copago Cero de Fonasa."
  > "Cobertura del 80%, es decir, los asegurados y aseguradas deben
  > pagar el 20% restante." (Isapre.)

- **Supersalud — Circular IF/N° 343** (link citado por el artículo):

  > "…creación de una tabla única de factores que elimina la
  > discriminación de precio basada en el sexo y restringe aquella
  > fundada en la edad… La presente circular entrará en vigencia a
  > contar del 1° de abril del 2020."

  La propia página advierte que la Circular IF/N° 468 (13-05-2024)
  modificó la TUF y remite al Compendio vigente (residual R3).

- **Supersalud — Alzas de precio base Isapres** (link citado por
  el artículo): tope 3,5% para 2026 ("plenamente justificado"),
  vigencia "a partir de la remuneración del mes de junio de 2026",
  reclamable si el alza supera 3,5% / plan con menos de un año /
  sin comunicación; plazo del afiliado hasta el 31-05-2026
  (aceptar / cambiarse / desafiliarse).

## 3. Disposición por hunk (adversarial — intento de rechazo)

Base: `git diff -U0`; 14 hunks de contenido + 2 de frontmatter.
Todos contra la versión previa del mismo archivo.

- **H1 `updatedDate: 2026-04-08 → 2026-09-18` — ACCEPT.**
  Cambio de frescura declarado; valor igual a la fecha del pase.
- **H2 `validAsOf: 2026-04-08 → 2026-09-18` — ACCEPT.**
  Idem. (Tensión con L63 corporal: residual R1, no rechazo.)
- **H3 (L76) Isapre: "edad, sexo y cargas" → "edad y cargas" +
  TUF/Circular 343 vigente 01-04-2020 — ACCEPT (F2).**
  Literal de la Circular 343 (§2) respalda "eliminó la
  diferenciación por sexo y restringe la de edad" y la fecha.
  Probe adversarial ("restringe la de edad" es vago; falta IF/468):
  no prospera como rechazo — la frase replica la fuente citada y
  la página citada avisa del update; se deja como residual R3.
- **H4 (tabla tramos A/B/C/D) — ACCEPT (F1+F7-parcial+F8).**
  Tramo A = "carentes de recursos y causantes de subsidio familiar
  (Ley 18.020)": verbatim Fonasa (§2). Columna MAI 0% Copago Cero
  en los cuatro tramos: verbatim por tramo (§2). Reclasificación
  "3 o más cargas → B/C": verbatim (§2). FPS eliminado: 0
  ocurrencias restantes (§4). El artículo no hardcodea umbrales
  (hoy Ley 21.830, §2) y difiere al link vivo: correcto.
- **H5 (nota Copago Cero sep-2022, red pública) — ACCEPT (F1).**
  "Desde septiembre de 2022 … MAI … todos los tramos 0%":
  verbatim Fonasa (§2). La enumeración CESFAM/postas/hospitales
  coincide con la fuente.
- **H6 (L104: factores sin sexo + prohibición <2 años desde
  01-12-2022) — ACCEPT (F2+F7).** Primera mitad: Circular 343
  (§2). Segunda mitad: Ley 21.674 art. 2° numeral 4) (§1).
  Observación (no rechazo): esta línea no lleva cita inline; la
  cita a Ley 21.674 aparece en H12 para el mismo hecho.
- **H7 (tabla comparativa: cargas "salvo no natos y menores de
  2 años") — ACCEPT (F7).** Excepción = numeral 4) art. 2° (§1).
  Edición mínima, sin alterar el resto de la fila.
- **H8 (Tramos A/B/C "copagos bajos o nulos" → "no tiene copago
  (Copago Cero)") — ACCEPT (F1).** Consecuencia directa de H4/H5.
- **H9 (Isapre→Fonasa: "cualquier momento, 30 días" → 1 año +
  1 mes + copia empleador + cita DFL-1 art. 197) — ACCEPT (F3).**
  Los tres elementos calcan el literal bcn-cite (§1, exit 0).
  Remueve exactamente la falsedad que la auditoría marcó alta.
- **H10 (catastrófica Fonasa: "pagando el copago según tu tramo"
  → "sin copago … Copago Cero desde sep-2022") — ACCEPT (F1).**
  Fonasa Tramos (§2) + consistencia con H4/H5.
- **H11 (FAQ GES: "copagos máximos iguales" → copagos difieren +
  prima GES mensual por beneficiario + deep link GES) — ACCEPT
  (F4).** "Fonasa Copago Cero en red pública": ChileAtiende
  ("gratuitamente … producto del Copago Cero", excluido de
  cotización mensual) + Fonasa Tramos (§2). "Isapre 20%":
  Supersalud (20% afiliados Isapres) + ChileAtiende (80/20).
  "Prima mensual por beneficiario": ChileAtiende verbatim (§2).
  Probe adversarial (la nominal Supersalud dice C 10%/D 20%, el
  artículo resume "Copago Cero"): no prospera — con Copago Cero
  vigente el efecto práctico en red pública es $0 (la propia
  auditoría F4 lo formula así: "Fonasa GES ≈ $0"); se anota como
  simplificación consciente en R5.
- **H12 (FAQ cargas + "prohibido desde 01-12-2022" + cita Ley
  21.674 art. 2°) — ACCEPT (F7).** Literal §1 (numeral 4).
  Fecha "01-12-2022" = "desde el 1 de diciembre de 2022".
- **H13 (FAQ alzas: "tabla de factores + IPC anual" → adecuación
  anual tope ICSA + verificación + junio + <1 año exentos + "no
  existe reajuste por IPC" + cita APB) — ACCEPT (F5).**
  Positivo respaldado por la página APB (§2: 3,5% 2026, junio,
  reclamo <1 año). Probe adversarial ("ninguna fuente dice
  literalmente 'no IPC'"): no prospera — el régimen citado es el
  mecanismo exclusivo anual (DFL-1 art. 197 inc. 3 adecuación
  vía art. 198, §1; APB con techo y verificación); la frase
  anterior era falsedad sin fuente y su reemplazo describe el
  régimen real. Se anota el 31-05 y derechos del afiliado como
  residual R4.
- **H14 (FAQ Fonasa→Isapre: "siempre libre" → "libre una vez
  cumplido el año mínimo") — ACCEPT (coherencia F3).**
  Consistente con H9/art. 197; no introduce falsedad nueva.

Conteo: **14/14 ACCEPT, 0 REJECT.**

## 4. Remanentes prohibidos (grep sobre el archivo — PASS los 4)

- **Precio por sexo como vigente:** 2 ocurrencias de "sexo", ambas
  correctivas-históricas ("eliminó la diferenciación por sexo",
  "sin diferenciación por sexo"). Ninguna afirma cobro por sexo
  vigente. **PASS.**
- **"En cualquier momento + 30 días" (Isapre→Fonasa):** "30 días"
  = 0 ocurrencias. "cualquier momento" sobrevive solo en L161 y
  L208-primera-cláusula, ambas dirección Fonasa→Isapre (intentar
  un plan puede hacerse cuando sea; la Isapre puede rechazar) —
  uso correcto. La dirección Isapre→Fonasa quedó calificada con
  el año mínimo (H9/H14). **PASS.**
- **Reajuste IPC anual:** 1 ocurrencia, negación explícita ("no
  existe un reajuste por IPC", H13). **PASS.**
- **"Ficha de Protección Social" como vigente:** 0 ocurrencias
  (reemplazada por carentes + Ley 18.020, H4). **PASS.**

## 5. Alcance (scope gate)

- `git diff --stat -- <artículo>`: 1 archivo, 29+/29−. El pase
  bajo revisión toca **solo** el artículo objetivo.
- Frontmatter: solo `updatedDate` + `validAsOf` (H1/H2).
  Verificado sin cambios a `slug`, `title`, `description`,
  `pubDate`, `heroImage`, `canonicalTopic`, `category`, enlaces
  canónicos, rutas ni código (el target es markdown sin lógica).
- `officialSources`, `covers`, `limits`, `reviewPolicy`,
  `dataTriggers: []` intactos (siguen homepages genéricas y sin
  datasets — ver R6, no introducido por este pase).
- **F6 NO contrabandeado:** sin bloque MCC/Ley Corta/PPA en el
  cuerpo (grep `MCC|Modalidad de Cobertura Complementaria|Ley
  Corta|prima extraordinaria|devolución` = 0; la única mención a
  "21.674" es la cita art. 2° de cargas, H12). **F9 NO
  contrabandeado:** `volatileData` ausente/`dataTriggers: []`
  sin cambios; sin `labels` nuevas.
- Nota de workdir (fuera de alcance): existen otras
  modificaciones NO commiteadas ajenas a este pase (otros
  artículos, `NextSteps.astro`, `editorial-topic-policy.mjs`,
  `scripts/bcn-cite.mjs` untracked, etc.). No fueron introducidas
  ni evaluadas por esta verificación.
- **R1 (residual, marcado como exige el encargo):** L63 corporal
  "información vigente al **2026-04-08**" contradice el frontmatter
  2026-09-18 (H1/H2). Fijación trivial aplicable y omitida.

## 6. Lo no aplicado (¿genuinamente fuera de alcance?)

No declarados por el pase y correctamente NO exigibles para un
ACCEPT (falsedades altas/medias ya corregidas); quedan como
residuales de seguimiento, ninguno es rechazo:

- **F6 (MCC/Ley Corta/PPA):** bloque nuevo de contexto 2024–2026;
  excede un pase de corrección de falsedades. Fuera de alcance.
- **F9 (volatileData/datasets, dataTriggers):** decisión de
  gobierno de datos + humana (la auditoría ofrece opciones A/B).
  Fuera de alcance.
- **F10 (CAEC banda UF/red/activación), F11 (embarazo/GES vs
  carencias), F12 (liquidación→PPA), F13 (piso 7%/prima
  extraordinaria en ejemplo), F14 (reclasificación 12 meses):**
  precisiones bajas, no falsedades activas tras este pase. Fuera
  de alcance.
- **NHV-1–8:** verificación humana pendiente por definición; este
  pase no afirma lo que no puede probar (p. ej. no detalla
  TUF/IF-468 ni DS GES 90). Correcto no tocarlos.
- **Aplicables con seguridad pero omitidos (llamado explícito):**
  R1 L63 fecha corporal → alinear a 2026-09-18; R2 nota "Tramo A
  sin MLE" (verbatim Fonasa, una línea); R3 puntero IF/468 +
  Compendio junto a la cita 343 (la propia página lo exige); R4
  derechos ante adecuación (opciones + plazo 31-05, en la página
  APB citada); R5 matiz nominal GES 0/10/20 bajo Copago Cero;
  R6 profundizar `officialSources` a las páginas Tramos/GES/APB
  ya usadas en el cuerpo. Ninguno bloquea este veredicto.

## 7. Veredicto

- **Disposición: ACCEPT.** Lo declarado se hizo y cada hunk nuevo
  está dentro de su fuente (§1–§3); prohibidos eliminados (§4);
  alcance acotado sin contrabando F6/F9 (§5); lo omitido es
  genuinamente de seguimiento (§6).
- **El archivo NO queda limpio:** R1 (L63 vs frontmatter) es
  inconsistencia visible al lector; R2–R6 son mejoras pequeñas y
  seguras. Seguimiento recomendado en un pase aparte (quien
  redacte no firma compliance).
- **STOP triggers:** ninguno. Sin cambios de slug/URL canónica,
  sin URLs públicas nuevas, sin puertas de publicación firmadas,
  sin mezcla redacción/auditoría YMYL (verificación read-only +
  reporte).
- **Gates corridos por este verificador:**
  `pnpm exec prettier --check` sobre este reporte → PASS;
  `git diff --check` → PASS (ver salidas en mensaje final).
