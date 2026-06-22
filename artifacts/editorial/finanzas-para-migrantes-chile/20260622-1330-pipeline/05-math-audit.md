# 05-math-audit.md — finanzas para migrantes en Chile

**Role:** MathAuditAgent — Claude Opus 4.8 (sesión fresca e independiente 2026-06-22)
**Fecha:** 2026-06-22
**Pipeline slug:** finanzas-para-migrantes-chile
**Artefactos auditados:**

- `01-brief.yaml`
- `02-dossier.md` (incluye addendum 2026-06-22, claims C1–C6 y fuentes O9–O22)
- `source-research-addendum-c1-c6-20260622.md` (suplemento S1–S5 + criterio de cierre)
- `04-draft.md` — **quinta remediación** (borrador congelado)
- `05-math-audit.md` previo (auditoría de la cuarta remediación, como referencia)
- `06-compliance.md` (Gate 06 FAIL 8.86/10 — DEFECT #1–#4)

**Veredicto global:** PASS

---

## 1. Declaración de separación de funciones (SoD)

Esta sesión (MathAuditAgent 2026-06-22) NO produjo ninguno de los artefactos del run
(`01-brief.yaml`, `02-dossier.md`, `source-research-addendum-c1-c6-20260622.md`,
`03-outline.md`, `04-draft.md`) ni es continuación de ninguna sesión que los haya producido.
La auditoría se realizó leyendo los artefactos como archivos estáticos del repositorio, sin
acceso al historial de conversación que los generó.

**Verificación del encabezado del draft:** la línea 3 de `04-draft.md` declara
`Status: DRAFT — quinta remediación 2026-06-22; borrador congelado`. Coincide con el artefacto
que esta orden indica auditar; no hay discrepancia de versión.

**Nota sobre la concentración de stages:** los stages 01–04 se produjeron en una misma sesión
(2026-06-22). Ese defecto de proceso ya está declarado en el dossier (§Nota de rol) y en el
draft (§Role-concentration note), y registrado por Gate 06 (INFO #1). Gate 05 (esta auditoría)
se ejecuta en sesión fresca e independiente. Gate 06 (Compliance) DEBE re-ejecutarse en sesión
fresca distinta a esta y a la del draft.

---

## 2. Tabla de roles e independencia

| Rol                                       | Sesión                                | Relación con esta auditoría                                                  |
| ----------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------- |
| DraftAgent (stages 01–04 + remediaciones) | Sesión 2026-06-22                     | **Independiente** — sin acceso al contexto de esa conversación              |
| ResearchAgent (dossier + addendum)        | Sesión 2026-06-22                     | **Independiente**                                                            |
| MathAuditAgent (previo, cuarta remed.)    | Sesión fresca 2026-06-22              | Referencia; auditó la cuarta remediación (PASS)                             |
| ComplianceAgent (Gate 06, cuarta remed.)  | Codex, sesión fresca 2026-06-22       | Referencia; FAIL 8.86/10 con DEFECT #1–#4                                   |
| MathAuditAgent (esta auditoría)           | Claude Opus 4.8, sesión fresca        | **Independiente** — audita la quinta remediación (borrador congelado)        |

---

## 3. Verificación de los seis criterios de cierre del addendum

Referencia: `source-research-addendum-c1-c6-20260622.md`, sección "Criterio de cierre para la
próxima auditoría".

### Criterio 1 — C1 conserva la condición tributaria exacta "causas o puedes causar impuestos en Chile"

| Ubicación en el draft           | Texto                                                                                                                                                                | Resultado |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| `articleLead.answer` (línea 65) | "Si no tienes residencia y **causas o puedes causar impuestos en Chile**, puedes inscribirte en el RUT por internet en sii.cl."                                      | ✓         |
| Cuerpo Paso 1 (líneas 120–125)  | Subtítulo: "**Si no tienes residencia y causas o puedes causar impuestos en Chile:**" + "no para toda persona extranjera sin residencia".                            | ✓         |
| FAQ (líneas 277–279)            | "Si no tienes residencia y **causas o puedes causar impuestos en Chile**, el SII dispone de inscripción por internet… No es una vía abierta a toda persona extranjera." | ✓         |

Además, las tres ubicaciones NO presentan la inscripción en el RUT como disponible para toda
persona extranjera sin residencia (línea 122–123: "no para toda persona extranjera sin
residencia"; FAQ línea 279: "No es una vía abierta a toda persona extranjera sin residencia").
La condición de residentes con cédula —registro automático del SII con su RUN— se conserva en
el ancla (línea 65), en el cuerpo (líneas 112–115) y en la FAQ (líneas 275–277). Consistente
con C1/C1b VERIFIED-REFORMULADO y con S1.

**Criterio 1: CUMPLIDO.**

### Criterio 2 — C4 reproduce el alcance condicionado del art. 2 de la Ley N° 20.609

Bloque "Resumen orientativo — marco legal" (líneas 201–215):

- **Cita operativa literal primero** (líneas 208–210): "…define la discriminación arbitraria,
  según su texto, como toda "distinción, exclusión o restricción que carezca de justificación
  razonable, efectuada por agentes del Estado o particulares"". Coincide carácter por carácter
  con el extracto operativo de S2. ✓
- **Síntesis después de la cita** (líneas 210–212): "Esto no significa que toda distinción por
  nacionalidad sea automáticamente ilícita: para serlo debe carecer de justificación razonable
  y afectar el ejercicio legítimo de derechos fundamentales." Conserva las dos condiciones
  acumulativas (falta de justificación razonable + afectación de derechos fundamentales). ✓
- **Etiqueta "Resumen orientativo"** presente (línea 201) y **limitador** presente (líneas
  214–215): "Este resumen tiene fines orientativos, su aplicación depende de las circunstancias
  de cada caso y no reemplaza asesoría legal profesional." ✓
- **No** se convierte en prohibición absoluta: la formulación niega expresamente la lectura
  automática. ✓

**Criterio 2: CUMPLIDO.**

### Criterio 3 — `articleLead.officialSources` con URLs profundas por regla crítica (S3)

| Fuente del ancla (líneas 68–79)               | URL                                                                                              | ¿Profunda? |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------- |
| SII — Obtención de RUT (inscripción)          | `…/ciclo_vida_contribuyente/paso_01.html`                                                        | Sí ✓       |
| SII — Documentos para inscribirse en el RUT   | `…/preguntas_frecuentes/rut_inicio_actividades/001_105_0135.htm`                                 | Sí ✓       |
| ChileAtiende — Cédula de extranjeros (RUN)    | `…/fichas/3337`                                                                                  | Sí ✓       |
| BancoEstado — CuentaRUT                        | `start.bancoestado.cl/…/cuentarut.html`                                                          | Sí ✓       |
| ChileAtiende — CuentaRUT BancoEstado          | `…/fichas/70638-cuenta-rut-bancoestad`                                                           | Sí ✓       |
| BCN — Ley N° 20.609 (no discriminación)        | `…/leychile/navegar?idNorma=1042092`                                                             | Sí ✓       |

No quedan portadas institucionales genéricas en el ancla (resuelve DEFECT #3 de Gate 06). Cada
regla crítica del ancla (RUT, RUN, CuentaRUT, marco antidiscriminación) apunta a la página
específica que la respalda, coincidiendo con el inventario de S3.

**Criterio 3: CUMPLIDO.**

### Criterio 4 — Explicación de la UF según metodología del Banco Central (S4)

Bloque "¿El arriendo puede ir en UF?" (líneas 240–247):

- "su valor se reajusta diariamente entre el **día 10** de cada mes y el **día 9** del
  siguiente, de acuerdo con la variación del **IPC del mes calendario anterior**". Coincide con
  S4 y con la metodología del Banco Central. ✓
- Cita la fuente: "[Banco Central de Chile — metodología de la Unidad de Fomento]" (línea 247). ✓
- Efecto sobre el arriendo condicionado al contrato: "Si el contrato fija el arriendo en UF, su
  equivalente en pesos dependerá del valor vigente y de lo pactado en el contrato" (líneas
  243–245). ✓
- La frase absoluta "La UF sube con la inflación" (DEFECT #4 de Gate 06; Q9 INFO de la
  auditoría previa) fue **retirada** y reemplazada por la descripción metodológica trazada. ✓

**Criterio 4: CUMPLIDO.**

### Criterio 5 — C3 incluye la vía presencial para menores 12–17 extranjeros (S5)

Bloque "¿Hay edad mínima?" (líneas 165–169):

- Edad mínima de **12 años** conservada (línea 165). ✓
- Vía App declarada **no universal**: "Esa vía por App no es universal para todo menor migrante"
  (líneas 167–168). ✓
- Excepción presencial: "si el menor o su padre o madre son extranjeros, BancoEstado indica que
  debe acudirse a una sucursal con la documentación correspondiente" (líneas 168–169). Coincide
  con S5. ✓

**Criterio 5: CUMPLIDO.**

### Criterio 6 — No se introdujeron números, universalidades ni condiciones de elegibilidad nuevas sin fuente

El inventario de la sección 4 confirma que cada número, fecha operativa y cuantificador se
traza a un claim del dossier (C1–C6) o a un suplemento (S1–S5). No se detectaron cuantificadores
de frecuencia sin respaldo ("la mayoría", "habitual", "lo más común"), universalidades nuevas ni
condiciones de elegibilidad inéditas. Única observación de trazabilidad (no defecto), heredada de
la auditoría previa: la FAQ de arriendo afirma que la ley "no establece un requisito de historial
crediticio" (línea 286), inferencia negativa correcta a partir de la Ley 18.101 (no introduce una
condición de elegibilidad nueva; el dossier verifica la ausencia de requisito de nacionalidad y
no contradice la de historial). Se mantiene como INFO.

**Criterio 6: CUMPLIDO.**

---

## 4. Inventario matemático estándar (Gate 05)

Numeración de líneas recalculada sobre la quinta remediación (no copiada del 05 previo).

### 4.1 Números explícitos

| Código | Texto en draft (quinta remediación)                                    | Línea(s) | Fuente            | Veredicto    |
| ------ | ---------------------------------------------------------------------- | -------- | ----------------- | ------------ |
| N1     | "la CuentaRUT se puede abrir desde los **12 años**"                     | 165      | C3 / S5 (O17/O18) | **VERIFIED** |
| N2     | "Entre los **12 y 17 años** interviene un representante legal"          | 165–166  | C3 / S5 (O18)     | **VERIFIED** |
| N3     | "**día 10** de cada mes y el **día 9** del siguiente" (reajuste UF)     | 242–243  | S4 (Banco Central) | **VERIFIED** |
| N4     | Leyes citadas: **18.101**, **21.461**, **20.609 art. 2**               | 203–212  | C4 (O13/O14/O14b)  | **VERIFIED** |
| N5     | Fichas/identificadores en URLs: 3337, 70638, 5241                       | varias   | O12/O18/O22       | **VERIFIED** |
| N6     | Fecha de corte/vigencia **2026-06-22** (pubDate, validAsOf, notas)      | varias   | Dossier + addendum | **VERIFIED** |
| N7     | "base Scrapling **2026-06-17**" (recuperación BancoEstado)              | 162      | C2 (O1/O8)        | **VERIFIED** |

### 4.2 Fechas con significado operativo

| Código | Texto                                          | Línea | Fuente                | Veredicto    |
| ------ | ---------------------------------------------- | ----- | --------------------- | ------------ |
| F1     | `pubDate: 2026-06-22T12:00:00-04:00`           | 53    | Fecha de corte dossier | **VERIFIED** |
| F2     | `validAsOf: 2026-06-22`                         | 66    | Fecha de corte dossier | **VERIFIED** |
| F3     | "Información vigente al 2026-06-22"            | 93    | Dossier               | **VERIFIED** |
| F4     | "Verificado con fuente oficial al 2026-06-22" | 127   | Addendum C1           | **VERIFIED** |
| F5     | "BCN 2026-06-22" (marco legal arriendo)       | 201   | Addendum C4           | **VERIFIED** |
| F6     | "addendum humano 2026-06-22" (CuentaRUT)      | 162, 173 | Addendum C2/C3     | **VERIFIED** |

### 4.3 Cuantificadores y condiciones de elegibilidad

| Código | Texto                                                                              | Línea(s) | Fuente            | Veredicto         |
| ------ | --------------------------------------------------------------------------------- | -------- | ----------------- | ----------------- |
| Q1     | "**tres** cosas concretas para funcionar"                                          | 97       | Estructura (RUT/cuenta/arriendo) | **VERIFIED** (estructural) |
| Q2     | "el plástico de la CuentaRUT se entrega **solo** en territorio nacional"           | 158      | C2 (O17/O18)      | **VERIFIED**      |
| Q3     | "no impide por sí solo trabajar formalmente **ni** cotizar"                        | 133–134  | C6 (O15/O16/O22)  | **VERIFIED**      |
| Q4     | "Su página no garantiza que **toda** persona extranjera califique" (Santander)     | 181      | C5 (O19)          | **VERIFIED**      |
| Q5     | "puede ser un requisito **bloqueante**" (Tenpo, cédula chilena física)             | 184–185  | C5 (O21)          | **VERIFIED**      |
| Q6     | "**incluso** un turista extranjero puede figurar en un contrato privado"           | 198–199  | C4 (O11)          | **VERIFIED**      |
| Q7     | "no establece un requisito **general** de nacionalidad" (Ley 18.101)               | 204      | C4 (O13)          | **VERIFIED**      |
| Q8     | Art. 2 Ley 20.609: cita literal + condiciones acumulativas                          | 208–212  | C4 / S2 (O14b)    | **VERIFIED**      |
| Q9     | "su valor se reajusta diariamente… según el IPC del mes anterior" (UF condicionado)| 242–245  | S4 (Banco Central) | **VERIFIED**      |
| Q10    | "no es universal para todo menor migrante" + excepción sucursal                     | 167–169  | C3 / S5           | **VERIFIED**      |
| Q11    | "**Basta** con cédula de identidad vigente" (FAQ CuentaRUT)                         | 272      | C2 (O17/O18)      | **VERIFIED**      |
| Q12    | "no establece un requisito de historial crediticio **ni** de nacionalidad" (FAQ)   | 286–287  | C4 (O13)          | **VERIFIED** (INFO — ver §3, criterio 6) |

---

## 5. Verificación aritmética

No se detectaron operaciones aritméticas en el draft (sumas, restas, porcentajes, proporciones,
fórmulas, conversiones de unidades, proyecciones). Los valores numéricos son absolutos (edades,
fechas, días del mes, números de ley) o cuantificadores lógicos (universales, existenciales, de
suficiencia, de exclusión). El rango "12 y 17 años" es la explicitación de "menor de 18 con
representante legal" (O18), no un cálculo.

**Resultado: sin operaciones aritméticas auditables; sin errores aritméticos.**

---

## 6. Resolución de DEFECT #1–#4 de Gate 06 (alcance Gate 05)

Se confirma la resolución de los cuatro defectos de la cuarta remediación en lo que corresponde
a cuantificadores, condiciones y trazabilidad. Los juicios editoriales del scorecard de Gate 06
NO son competencia de esta auditoría.

| Defecto Gate 06                                                              | Severidad | Estado en quinta remediación                                                                                       |
| --------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| #1 — El ancla amplía la vía de RUT para no residentes                        | HIGH      | **RESUELTO** — el `articleLead.answer` (línea 65) restituye la condición "causas o puedes causar impuestos en Chile". |
| #2 — La conclusión legal no cita primero la cláusula operativa literal       | HIGH      | **RESUELTO** — cita literal del art. 2 antes de la síntesis (líneas 208–212), con limitador.                       |
| #3 — Las fuentes del ancla no son URLs específicas                           | MEDIUM    | **RESUELTO** — `officialSources` reemplazadas por URLs profundas (líneas 68–79); ver §3, criterio 3.              |
| #4 — La explicación de la UF es absoluta y no trazada                        | LOW       | **RESUELTO** — descripción metodológica del Banco Central con fuente (líneas 240–247); frase absoluta retirada.   |

---

## 7. Defectos

**No se encontraron defectos.**

Los seis criterios de cierre del addendum están cumplidos; los DEFECT #1–#4 de Gate 06 quedan
resueltos en el alcance de Gate 05; no hay errores aritméticos; no se introdujeron números,
universalidades ni condiciones de elegibilidad nuevas sin fuente. Única observación de
trazabilidad heredada (INFO, no defecto): inferencia negativa sobre "historial crediticio" en la
FAQ de arriendo (§3, criterio 6 / Q12).

---

## 8. Veredicto global: PASS

**Fundamento:**

1. **Seis criterios de cierre cumplidos:** C1 con condición tributaria exacta en ancla, cuerpo y
   FAQ; art. 2 de la Ley 20.609 con cita literal previa y condiciones conservadas; ancla con URLs
   profundas; UF descrita según el Banco Central y citada; C3 con excepción presencial para
   menores extranjeros; sin elementos nuevos sin fuente.
2. **Inventario trazado:** los números (N1–N7), fechas operativas (F1–F6) y cuantificadores
   (Q1–Q12) están respaldados por claims C1–C6 del dossier y por los suplementos S1–S5.
3. **Sin aritmética auditable:** el draft no contiene operaciones matemáticas; sin errores.
4. **DEFECT #1–#4 de Gate 06 resueltos** en el alcance de cuantificadores, condiciones y
   trazabilidad.
5. **Sin contradicciones** entre el draft y el dossier.

Esta auditoría NO autoriza publicación, NO ejecuta Gate 06 ni Gate 07 y NO asigna el scorecard
de Gate 06. El scorecard editorial (incluido el umbral 9.5/10) corresponde a una sesión fresca de
ComplianceAgent, que debe re-ejecutarse porque `04-draft.md` cambió respecto de la versión que
Gate 06 evaluó (FAIL 8.86/10).

---

## 9. Validación final

- [x] SoD declarada y acreditada (sesión fresca, sin participación en stages 01–04)
- [x] Encabezado del draft verificado ("quinta remediación")
- [x] Seis criterios de cierre del addendum verificados (todos cumplidos)
- [x] Inventario de números, fechas y cuantificadores recalculado sobre la quinta remediación
- [x] Cada elemento contrastado contra fuente del dossier (C1–C6) o suplemento (S1–S5)
- [x] Verificación aritmética completada (sin operaciones auditables)
- [x] DEFECT #1–#4 de Gate 06 verificados como resueltos en alcance de Gate 05
- [x] Veredicto explícito con justificación (PASS)
- [x] No se modificó `04-draft.md`, `06-compliance.md` ni las casillas de `07-publish-packet.md`
- [x] No se marcó ningún gate `[X]`
