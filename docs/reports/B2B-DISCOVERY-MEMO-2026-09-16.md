# B2B discovery memo — kit de ejecución (F2 monetización)

**Owner:** `docs/backlog/PLAN-monetization-reevaluation-2026-09-16.md` (F2) ·
**Fecha:** 2026-09-16 · **Actualizado:** 2026-09-25 (kit)
**Estado:** kit listo, pendiente de ejecución del owner (meta: 10 conversaciones
antes del 2026-11-02).
**Regla FOCO:** discovery estrictamente documental. Sin código de API, widget,
embed, auth, billing, white-label ni pilotos hasta decisión explícita + gate
de excepción (`UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`: 10 conversaciones →
2 demos → 1 piloto pagado).
**Paquete de decisión:** `docs/backlog/DECISION-monetization-2026-11-02.md`.

## Hipótesis de valor (a validar, no a afirmar)

1. **Payroll / software de remuneraciones chileno:** calculadoras verificadas
   (sueldo líquido, gratificación, finiquito, UTM/UF) como motor embebible
   con trazabilidad a fuentes oficiales (SII, CMF, BCCh).
2. **HR / beneficios:** APV, seguro de cesantía y simulador de jubilación
   como educación financiera para colaboradores, con métricas agregadas.
3. **Fintech / comparadores:** datos de intención agregada (qué calculan
   los usuarios) como señal de demanda — nunca datos individuales (no
   existen; no se crearán).

## Perfil objetivo (ICP borrador)

Empresas operando en Chile con nómina local o producto financiero retail,
que hoy mantienen sus propias calculadoras desactualizadas o responden
preguntas repetitivas de usuarios/colaboradores.

**Categorías a explorar (ejemplos de categoría, no endorsements):**

| Categoría | Ejemplos de categoría | Dolor esperado |
|---|---|---|
| Payroll SaaS | Buk, Rankmi, Softland, Defontana | calculadoras propias que envejecen con cada reforma |
| RRHH/beneficios | áreas de Personas en empresas 200+ | preguntas repetitivas de colaboradores sobre sueldo/APV/finiquito |
| Fintech retail | apps de crédito, inversión, cuentas | contenido explicativo desactualizado y sin fuentes auditable |
| Medios/prensa económica | portales que publican indicadores | reescribir la explicación de UTM/UF cada mes |
| Consultoras de remuneraciones | boutique de RRHH | dependencia de planillas propias sin SLA de exactitud |

**Fuera de perfil:** lead buyers que pidan datos individuales, afiliación
encubierta, sponsors que exijan ranking o veredictos.

## Cómo conseguir las 10 conversaciones

1. **Lista de partida (10 nombres):** 3 payroll SaaS, 2 RRHH/beneficios, 2
   fintech, 2 medios, 1 consultora. Anotar en el tracker con nombre y cargo.
2. **Canal:** LinkedIn al responsable de Producto/Personas/Contenido; email
   de contacto del sitio; intro tibia cuando exista. Sin secuencias masivas:
   una persona, un mensaje, un follow-up máximo.
3. **Formato:** 25 minutos por videollamada. No es una demo ni una venta; es
   discovery. Si piden precio antes de la conversación, responder que el
   precio depende del alcance que se defina en la llamada.
4. **Registro:** pegar las notas en el tracker el mismo día (plantilla abajo).
5. **Meta de calendario:** 2 conversaciones/semana desde 2026-10-13; cierre
   el 2026-10-30.

## Mensaje de contacto (plantilla `es-CL`)

> Hola [nombre]:
>
> Soy Carlos Ortega, mantengo monedario.cl, un sitio chileno de calculadoras
> financieras verificables (sueldo líquido, finiquito, crédito, UTM/UF) con
> fuentes oficiales y auditoría editorial. Estoy investigando cómo equipos
> como [empresa] mantienen hoy sus propias calculadoras o responden consultas
> repetidas de [nómina / usuarios], y me gustaría escuchar su experiencia en
> 25 minutos. No vengo a vender nada en la llamada: quiero entender el
> problema y el costo de mantenerlo. ¿Le acomoda esta semana o la próxima?
>
> Gracias, Carlos.

## Guía de entrevista (25 minutos)

| Bloque | Tiempo | Preguntas |
|---|---|---|
| Contexto | 5 min | ¿Qué calculan hoy y con qué herramienta? ¿Quién la mantiene? |
| Dolor | 8 min | ¿Qué pasa cuando cambia la norma (reforma, UTM, UTA)? ¿Cuánto tiempo/dinero costó el último cambio? ¿Cuántas consultas repetidas reciben al mes? |
| Confianza | 5 min | ¿Cómo validan que el cálculo es correcto y está vigente? ¿Les piden fuentes los usuarios/auditores? |
| Compra | 5 min | ¿Pagarían por exactitud verificada + cero mantención? ¿Qué exigirían por contrato (frescura, fuentes, SLA)? ¿Quién firma y con qué presupuesto? |
| Cierre | 2 min | ¿A quién más debería preguntarle? ¿Puedo volver con una propuesta concreta si hay interés? |

Preguntas base del plan original: ¿qué calculan hoy y con qué costo de
mantención? ¿qué pasa cuando la norma cambia? ¿pagarían por exactitud
verificada + cero mantención? ¿qué contrato de calidad exigirían?

## Plantilla de notas por conversación

```text
Empresa / contacto / cargo:
Fecha y duración:
Herramienta actual:
Dolor principal (cita textual):
Costo declarado de mantención:
Disposición a pagar: sí / no / condicional (detalle):
Exigencias de contrato (frescura, fuentes, SLA):
Objeciones:
Siguiente paso y fecha:
```

## Tracker de conversaciones (meta: 10)

Secuencia aprobada 2026-09-25 (híbrida, "velocidad de sí" primero; los 10 se
mantienen): **S1 6-10 oct** medios/fintech/consultora; **S2 12-16 oct**
payroll/HR (prueban el embed pagado); **S3 19-30 oct** follow-ups, intros
tibias y llamadas. Hook preferente: observación **verificada** de la
superficie pública del target; si no hay hallazgo, ir por
workflow/mantención — nunca inventar un error (auditorías:
`output/operations/b2b-audits-2026-09-25.md`).

| # | Empresa / contacto | Segmento | Hook | Semana | Resultado | Siguiente paso |
|---|---|---|---|---|---|---|
| 1 | Pauta (medio) — `pauta.cl` | medio | workflow: UF diaria con verificación manual | S1 | | contacto de Redacción |
| 2 | Diario Financiero (medio) — `df.cl` | medio | workflow: indicadores al día | S1 | | contacto de Datos/Redacción |
| 3 | Fintual (fintech) — `fintual.cl` | fintech | exactitud auditable | S1 | | LinkedIn de Contenido/Producto |
| 4 | Racional (fintech) — `racional.cl` | fintech | exactitud auditable | S1 | | LinkedIn de Contenido/Producto |
| 5 | Consultora boutique de remuneraciones | consultoría | planillas propias sin SLA | S1 | | red personal |
| 6 | Buk (payroll SaaS) — `buk.cl` | payroll SaaS | cobertura: calculadora al día, ¿quién la mantiene? | S2 | | LinkedIn de Producto / formulario del sitio |
| 7 | Rankmi (payroll/HR SaaS) — `rankmi.com` | payroll SaaS | mantención de cálculos y beneficios | S2 | | LinkedIn de Producto / formulario del sitio |
| 8 | Defontana (ERP/nómina) — `defontana.com` | ERP/nómina | fuente auditable en contenido | S2 | | LinkedIn de Producto / formulario del sitio |
| 9 | Softland (ERP/nómina) — `softland.cl` | ERP/nómina | cálculo legal al día | S2 | | LinkedIn de Producto / formulario del sitio |
| 10 | Empresa con nómina 200+ (retail/servicios) | HR | consultas repetidas de colaboradores | S2 | | elegir 1–2 casos por red (intro tibia) |

Funnel objetivo por semana: 5 envíos → 2 respuestas → 1-2 llamadas. Registrar
el **segmento** en cada fila para que la decisión del 2-nov lea qué segmento
respondió y cuál mostró disposición a pagar.

## Criterios demo → piloto

- **Demo (meta: 2):** solo si ≥3 conversaciones confirman el mismo dolor con
  presupuesto. Demo = walkthrough de calculadoras existentes, sin código
  nuevo. Guion: 10 min de problema → 10 min de recorrido (sueldo líquido,
  finiquito, UTM/UF) → 5 min de preguntas.
- **Piloto pagado (meta: 1):** requiere excepción aprobada
  (`url-freeze-exceptions.json` completa) + ADR + contrato de calidad de
  datos (frescura vía snapshot, fuentes primarias, SLO de exactitud) +
  precio que cubra mantención. Sin pago no hay piloto.

## Precio y contrato (borrador a validar en las conversaciones)

| Modelo | Cuándo | Referencia de precio |
|---|---|---|
| Piloto único (8–12 semanas) | primera validación | ≥ costo de mantención del período (E6) + margen |
| Suscripción embed mensual | uso continuo | costo mensual de mantención + margen; sin fee por usuario |
| Licencia de contenido/API | medios o fintech | por superficie y cadencia de refresco |

**Supuesto de tarifa (owner a confirmar):** CLP 30.000/h. Con Gate D
(8 h/semana de mantención) el piso de un embed con SLA completo es del orden
de **CLP 1,0 M/mes**; el piloto de 8–12 semanas se cotiza sobre ese piso más
margen. Sin tarifa declarada no se cotiza. Un piso que no cubra la mantención
+ margen se rechaza aunque haya interés.

El contrato de calidad debe fijar: cadencia de refresco (UTM mensual, UF
diaria, reformas), fuentes primarias por indicador, SLO de exactitud y
proceso de corrección con plazo. Un piloto que no cubra su mantención +
margen se rechaza aunque haya interés.

## Costo de mantener (a completar con evidencia)

Horas/semana del responsable, costo infra (Cloudflare/R2, despreciable hoy),
carga de refresco normativo (reformas, UTM mensual, UTA), costo de
auditoría YMYL por superficie expuesta. Fuente: Gate D semanal en
`output/operations/weekly-search-performance/<semana>/utility-led-ops.json`.

## Kill criteria

Sin 10 conversaciones al 2026-11-02 → la vía B2B queda `SIN DATOS
SUFICIENTES`, no se infiere desinterés del mercado. Sin 2 demos → no hay
piloto. Cualquier pedido de datos individuales, ranking pagado o tracking
extra → fin de la conversación + registro del motivo.

## Salida hacia la revisión 2026-11-02

Este memo alimenta la decisión perseverar / pilotar B o D / pausar junto a
la evidencia F1 (funnel voluntario) y Gate D (sostenibilidad). Sin este
memo completo, la opción D no es elegible. Matriz y umbrales:
`docs/backlog/DECISION-monetization-2026-11-02.md`.
