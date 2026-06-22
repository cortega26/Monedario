# 03-outline.md — finanzas para migrantes en Chile

**Status:** DRAFT
**Role:** OutlineAgent — Claude Sonnet 4.6 (sesión 2026-06-22)

---

## Intención y query ancla

**Query:** "cómo obtener RUT, abrir una cuenta y arrendar siendo extranjero en Chile"
**Tipo:** informacional + ejecutable (guía de trámites)
**Respuesta ancla:** "Para ordenar tus finanzas en Chile como migrante, el primer paso es
el RUT (que obtienes en el SII o Registro Civil según tu permiso), luego una cuenta
bancaria básica como la CuentaRUT (que BancoEstado otorga a extranjeros con cédula de
identidad vigente), y para arrendar necesitarás los documentos que el propietario exija —
generalmente meses de garantía adicional si no tienes historial crediticio local."

---

## Estructura propuesta

### [articleLead] Respuesta rápida (frontmatter)

- `answer`: tres pasos: RUT → cuenta bancaria → arriendo
- `validAsOf`: 2026-06-22
- `officialSources`: SII, BancoEstado, Ley 21.461 (BCN)
- `covers` / `limits`: declarar que NO cubre visados ni estatus migratorio

---

### H1: "Cómo ordenar tus finanzas en Chile siendo migrante" (título del artículo)

**Chapeau** (~3 oraciones): encuadrar la situación — llegaste a Chile y necesitas tres
cosas concretas para funcionar: identificación tributaria, cuenta, y dónde vivir.
No depende del tipo de visa. Foco en "qué hacer", no en "si puedes".

---

### H2: "Paso 1 — El RUT: tu llave para casi todo"

**Por qué este orden:** el RUT es prerrequisito para la cuenta corriente, el trabajo
formal y muchos arrendadores lo solicitan.

**Subsecciones:**
- ¿Qué es el RUT y por qué lo necesitas?
  - Una oración: "el RUT es el número con el que el Estado identifica a cualquier
    persona o empresa para efectos tributarios — es el mismo documento que cualquier
    chileno."
- ¿Cómo lo obtienes?
  - Si tienes residencia definitiva: Registro Civil → cédula de identidad de
    extranjero → tu RUN es tu RUT
  - Si tienes residencia temporaria o permiso de trabajo: SII → RUT de persona natural
    con pasaporte/permiso vigente
  - Nota: remitir a SII (sii.cl) y Registro Civil para el procedimiento exacto y
    documentos vigentes
- Respuesta rápida al FAQ más frecuente: "¿puedo obtener RUT solo con pasaporte?"
  → Sí, para el RUT del SII; para la cédula de extranjero necesitas permiso vigente.

**Resumen orientativo** + remisión a fuente oficial.

---

### H2: "Paso 2 — Cuenta bancaria: la CuentaRUT es la puerta de entrada"

**Por qué CuentaRUT:** es la cuenta más accesible (sin requisito de renta), aceptada
para recibir el sueldo, y BancoEstado la otorga a extranjeros con cédula de identidad
vigente.

**Subsecciones:**
- ¿Qué es la CuentaRUT? (en 2 oraciones, VERIFIED de dossier C2)
- ¿Qué necesitas para abrirla como extranjero?
  - Cédula de identidad vigente (incluye cédula de extranjero del Registro Civil)
  - App BancoEstado activada en Chile + número de celular chileno (para abrirla vía app)
  - Si solicitas por web: firma de contrato pendiente en sucursal (VERIFIED C2)
  - El plástico se entrega solo en territorio nacional (VERIFIED C2)
- ¿Hay otras opciones?
  - Otros bancos y fintech (mención cualitativa — sin afirmar condiciones específicas,
    TODO:SOURCE; recomendar verificar directamente con cada entidad)
- FAQ: "¿puede un extranjero sin cédula de extranjero abrir la CuentaRUT?" → Necesita
  la cédula de identidad vigente; sin ella, consultar directamente con BancoEstado.

---

### H2: "Paso 3 — Arrendar: qué te pueden pedir y cómo prepararte"

**Por qué este foco:** es el trámite con menos información oficial disponible; los
requisitos los fija el propietario, no la ley.

**Subsecciones:**
- ¿Hay alguna ley que prohíba arrendar a extranjeros? No. La Ley 21.461 ("Devuélveme
  mi casa") regula el proceso de recuperación de propiedad, no los requisitos para
  arrendar; aplica por igual a nacionales y extranjeros.
- ¿Qué documentos te puede pedir el propietario?
  - Cédula de identidad (chilena o de extranjero)
  - RUT (para verificar antecedentes comerciales o emitir boleta/factura)
  - Liquidaciones de sueldo o cotizaciones como prueba de ingresos
  - Garantías adicionales: 1–3 meses de arriendo, codeudor solidario, o seguro de
    arriendo (mención como práctica común, no como obligación legal)
- Consejo práctico: si no tienes historial crediticio en Chile, ofrecer proactivamente
  2 meses de garantía simplifica la negociación.
- FAQ: "¿el arriendo puede ir en UF?" → Sí; convertir UF a pesos con el conversor.
  **[Link: /calculadoras/conversor-uf]**

---

### H2: "Lo que viene después: más trámites, mismos principios"

**Propósito:** encadenar hacia contenido futuro y recursos existentes; no ampliar
el scope.

Breve mención de:
- AFP y cotizaciones de salud (scope diferido; remitir a futura guía cuando exista)
- Abrir cuenta corriente o producto de crédito (requiere historial; la CuentaRUT es
  el punto de partida) → [Link: /guias/bancos-fintech/] (cuando sea público)
- Remesas (scope diferido)
- Calculadora conversora de UF → [Link: /calculadoras/conversor-uf/]

---

### FAQ (5 preguntas)

1. "¿Necesito visa de residencia definitiva para abrir la CuentaRUT?" → No, basta
   cédula de identidad vigente (incluye la de extranjero con residencia temporaria).
2. "¿Puedo obtener RUT sin haber llegado a Chile?" → El RUT del SII se tramita
   presencialmente en Chile; verificar con SII si existe opción de trámite online.
3. "¿Cuánto tiempo tarda el RUT del Registro Civil?" → Variable según flujo de
   Registro Civil; verificar en la web oficial.
4. "¿Puedo arrendar si recién llegué y no tengo historial?" → Sí, con garantías
   adicionales; ofrecer proactivamente simplifica el proceso.
5. "¿Cuáles son las cuentas más fáciles de abrir para un migrante?" → La CuentaRUT
   de BancoEstado es la más documentada para extranjeros; para otras opciones verificar
   directamente con cada banco.

---

## Interlinking saliente

| Destino | Texto ancla | Motivo |
|---|---|---|
| /calculadoras/conversor-uf/ | "cuánto es ese arriendo en pesos" | arriendo en UF |
| /glosario/cuenta-rut/ | "qué es la CuentaRUT" | explicar el producto |
| /guias/bancos-fintech/ | "bancos y fintech en Chile" | cuando hub sea público |
| /posts/que-es-la-uf/ | "UF (Unidad de Fomento)" | contexto para arriendo en UF |

---

## Nota editorial

- El scope excluye visados y estatus migratorio por decisión de Gate 00 y alcance
  diferido. El artículo no debe interpretar si un permiso específico califica para
  ningún trámite.
- Los claims C1, C1b, C4, C5, C6 son TODO:SOURCE y deben tratarse en el draft con
  el nivel de precisión correspondiente (descripción del proceso sin afirmación de
  pasos específicos como hecho verificado).
- El único claim VERIFIED directamente en este run es C2 (CuentaRUT para extranjeros,
  carryover de bancos-y-fintech dossier, 2026-06-17).
