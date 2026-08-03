# Diccionario de eventos utility-led

**Schema:** 2
**Fuente canónica:** `src/contracts/analytics-events.ts`
**Privacidad:** eventos agregables sin montos, resultados, texto libre, datos personales ni identificadores persistentes.

| Evento | Momento exacto | Dedupe |
|---|---|---|
| `calculator_view` | La calculadora se inicializa en una vista de página | una vez por vista |
| `calculator_start` | Primera interacción sustantiva con input o botón | una vez por vista |
| `calculator_complete` | Primer resultado válido renderizado | una vez por calculadora/vista; recalcular no suma |
| `calculator_error` | Un intento falla por validación, cálculo, red o fuente vencida | una vez por intento/categoría en el emisor |
| `next_step_shown` | El enlace contextual entra al menos 25% al viewport después de un resultado | una vez por `next_step_id`/vista |
| `next_step_click` | Activación del enlace contextual | cada activación explícita |
| `source_click` | Activación de una fuente oficial/metodología/snapshot | cada activación |
| `share_attempt` | Activación de copiar, WhatsApp o Web Share | cada intento |
| `share_success` | La API de clipboard/Web Share resuelve con éxito | solo confirmación técnica; una salida a WhatsApp no es éxito confirmado |
| `alert_interest_shown` | El bloque de interés entra 25% al viewport postresultado | una vez por vista |
| `alert_interest_submit` | Botón “Me interesa” activado | una vez por vista; el botón queda deshabilitado |
| `support_shown` | El bloque de apoyo entra 25% al viewport postresultado | una vez por vista |
| `support_click` | Activación del enlace interno a `/apoyar/` | cada activación explícita |
| `support_confirmed` | Confirmación fiable del proveedor, sin inferencia por salida | definido, pero no emitido hasta existir callback/webhook autorizado |

Propiedades permitidas, sin excepciones: `calculator_id`, `page_type`, `cluster`, `interaction_variant`, `next_step_id`, `source_type`, `error_category`, `share_method`, `support_location`, `utm_source`, `utm_medium`, `utm_campaign`, `app_version`.

Las etiquetas UTM solo miden activaciones de enlaces propios en agregado. No prueban que una persona volvió, no enlazan sesiones y no permiten cohortes 7/30 días. “Retorno” solo puede describirse como tráfico agregado etiquetado, nunca como usuario recurrente.

La IP se usa fuera del payload como clave efímera de rate limit por 120 segundos. No se exporta ni se cruza con contadores. El Worker rechaza payloads con campos desconocidos; el cliente los elimina antes de transmitir como defensa adicional.
