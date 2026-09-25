# Diccionario de eventos utility-led

**Schema:** 2
**Fuente canónica:** `src/contracts/analytics-events.ts`
**Privacidad:** eventos agregables sin montos, resultados, texto libre, datos personales ni identificadores persistentes.

| Evento | Momento exacto | Dedupe |
|---|---|---|
| `calculator_view` | La calculadora se inicializa en una vista de página | una vez por vista |
| `calculator_start` | Primera interacción sustantiva con input o botón | una vez por vista |
| `calculator_complete` | Primer resultado válido renderizado | una vez por calculadora/vista; recalcular no suma |
| `calculator_error` | Un intento falla por validación, cálculo, red o fuente vencida | una vez por intento/categoría en el emisor. Estado: contract-defined, unemitted sitewide as of 2026-09-14 — zero values do not imply healthy; see DIAGNOSTICO §Qué NO se descartó and `docs/backlog/APV-ERROR-INSTRUMENTATION-2026-09-14.md` |
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
| `affiliate_click` | Activación de un slot de afiliado firmado | definido, pero no emitido hasta firma de contrato (ADR-20260921). El slot es un token de desarrollo; el mapeo slot→URL vive fuera del payload |
| `lead_submit` | Envío confirmado de un formulario propio (newsletter, alerta, contacto) | definido, pero no emitido hasta firma de contrato (ADR-20260921). `lead_type` es etiqueta, nunca datos del formulario |

### Eventos de interacción UI/CTA (plan 100)

Definidos en el mismo contrato, emitidos por el tracker global de CTAs y los
emisores de plan 100. Se listan aquí porque el export semanal los entrega y
`METRICS_AUTHORITY.md` exige cruzarlos con este diccionario.

| Evento | Momento exacto | Dedupe |
|---|---|---|
| `article_scroll_depth` | El artículo alcanza 25/50/75/100% de scroll | una vez por umbral/artículo y vista |
| `article_calculator_cta_click` | Activación del CTA a calculadora dentro de un artículo | cada activación |
| `calculator_mode_toggle` | Cambio de modo en una calculadora (bruto↔líquido, finiquito↔vacaciones) | cada activación |
| `calculator_copy_link` | Copia del enlace de la calculadora | cada activación |
| `calculator_copy_result` | Copia del resultado de la calculadora | cada activación |
| `calculator_print_click` | Impresión del resultado | cada activación |
| `calculator_share_click` | Compartir el resultado | cada activación |
| `resume_cleared` | El usuario limpia el estado persistido de la calculadora | una vez por limpieza |
| `cta_click` | Clic en cualquier `data-analytics-cta` sin evento propio (fallback del tracker global) | cada activación |
| `calculator_trust_link_click` | Clic en fuente/metodología desde una calculadora | cada activación |
| `hub_route_click` | Clic en una ruta de hub (header/footer/home) | cada activación |
| `related_content_click` | Clic en una tarjeta de contenido relacionado | cada activación |
| `search_chip_click` | Clic en un chip de búsqueda | cada activación |

Cero observado no es ausencia probada: `calculator_copy_link`,
`calculator_copy_result`, `calculator_print_click`, `calculator_share_click`,
`resume_cleared`, `calculator_trust_link_click` y `search_chip_click` no
registraron eventos en W38; verificar el export antes de concluir que no se
emiten.

Propiedades permitidas, sin excepciones: `calculator_id`, `page_type`, `cluster`, `interaction_variant`, `next_step_id`, `source_type`, `error_category`, `share_method`, `support_location`, `utm_source`, `utm_medium`, `utm_campaign`, `app_version`, `cta_type`, `cta_location`, `destination_url`, `outcome`, `mode`, `article_slug`, `scroll_depth_percent`, `affiliate_slot`, `lead_type`.

`destination_url` solo admite URLs internas de `monedario.cl` (el contrato las
valida); nunca destinos externos ni de partner.

Las etiquetas UTM solo miden activaciones de enlaces propios en agregado. No prueban que una persona volvió, no enlazan sesiones y no permiten cohortes 7/30 días. “Retorno” solo puede describirse como tráfico agregado etiquetado, nunca como usuario recurrente.

La IP se usa fuera del payload como clave efímera de rate limit por 120 segundos. No se exporta ni se cruza con contadores. El Worker rechaza payloads con campos desconocidos; el cliente los elimina antes de transmitir como defensa adicional.
