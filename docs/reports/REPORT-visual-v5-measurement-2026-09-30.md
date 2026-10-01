# Medición de la renovación visual v5

Fecha: 2026-09-30. Estado: definición operativa; no es un resultado de impacto.
Plan: `docs/backlog/PLAN-renovacion-visual-editorial-2026-09-29.md`.
Implementación: recolector first-party existente, contrato en
`src/contracts/analytics-events.ts` y tracker en `src/scripts/analytics.ts`.
No se consultaron datos externos ni se añadió una plataforma.

## Objetivos y señales

| Objetivo | Señal | Límite de interpretación |
| --- | --- | --- |
| Interés por el contenido | Clics / impresiones de cards con la misma combinación de dimensiones. | Razón de eventos agregados; el texto, posición y tráfico también influyen. |
| Continuidad de lectura | Clics / impresiones en `related_posts`. | No prueba que el destino se leyó ni identifica usuarios que vuelven. |
| Progreso de lectura | Conteos existentes de `article_scroll_depth`, segmentados por hero/version. | Es scroll del documento completo; no mide atención activa ni comprensión. |
| Claridad y profesionalismo | Revisión imagen+artículo, miniatura de 300 px, coherencia entre piezas y registro de defectos. | Evaluación cualitativa; no se convierte en uplift estadístico. |

La métrica primaria es la razón de eventos de clic sobre impresión de tarjetas.
Separar `article_card` de `related_posts`; no mezclar ambas exposiciones. El hero
solo tiene impresiones y contexto para scroll; no tiene un CTR propio.

## Denominador y dimensiones

`editorial_image_impression` exige imagen cargada, pestaña visible y al menos
50% del área visible durante 1.000 ms continuos. Hay una excepción declarada:
si el lector activa el enlace antes de ese tiempo con ≥50% visible, el tracker
registra primero una impresión por interacción y luego el clic. El denominador
incluye ambas vías; no describirlo como «todas las imágenes vistas por un segundo».

Ambos eventos se deduplican en memoria por vista DOM, slug, superficie y versión.
Una tarjeta repetida con esa misma combinación no duplica el conteo de la vista.
`editorial_image_click` no se emite para un hero no interactivo ni para una
activación sin impresión previa y sin imagen suficientemente visible.

Dimensiones conservadas:

- `article_slug` y `image_surface`: `article_card`, `related_posts`, `article_hero`.
- `image_version`: 16 hex del hash del hero con formato
  `img-xxxx-xxxx-xxxx-xxxx`; el agrupamiento evita falsos positivos del filtro
  anti-PII de secuencias de dígitos.
- `device_class`: viewport al iniciar la vista, `mobile` <768 px, `tablet`
  768–1023 px, `desktop` ≥1024 px. No es una identidad del dispositivo.
- `page_type` y `app_version`: contexto existente del producto.

El export compatible mantiene `schemaVersion: 2`. Para eventos de imagen, el
slug de artículo ocupa la columna histórica `calculator_id`; interpretar esa
columna junto con el nombre del evento. Las dimensiones se conservan en el
formato versionado del export. No sumar esos eventos como uso de calculadoras.

## Lectura de 28 días

1. Fijar la fecha de despliegue efectivo y el hash del asset. Usar días completos
   según `America/Santiago`, como el recolector y sus exportes semanales.
2. Agregar 28 días sin superposición por artículo, superficie, clase de viewport,
   versión y tipo de página. Registrar `app_version` y cambios simultáneos.
3. Mostrar impresiones, clics y razón. Con denominador cero, reportar «sin
   exposición medible» y dejar la razón sin valor; nunca sustituirla por cero.
4. Comparar solo grupos equivalentes. Mostrar diferencias en puntos porcentuales
   junto a los conteos; no promediar tasas de artículos con distintos volúmenes.
5. Revisar al cierre de la ventana sin elegir retrospectivamente fechas que
   favorezcan el resultado. No ajustar ilustraciones repetidamente por cambios
   diarios ruidosos.

Las imágenes anteriores carecen de este denominador/versionado. Si instrumentación
y renovación se despliegan juntas, los primeros 28 días establecen la baseline
v5; no permiten calcular el efecto causal del cambio desde v4. Las ventanas
posteriores describen evolución observable y revisiones futuras. Los conteos
antiguos de CTA/scroll pueden dar contexto, pero no reconstruyen exposiciones.

No se calculan usuarios únicos, cohortes, retorno entre visitas, duración activa
ni retención longitudinal. Para afirmar mejora de claridad, acompañar los eventos
con revisión cualitativa. Una caída del scroll tampoco prueba por sí sola fracaso:
puede coincidir con una respuesta más directa u otros cambios editoriales.

## Tráfico bajo y guardrails

Mostrar siempre el volumen por grupo. Como umbral operativo conservador, si una
ventana comparable tiene menos de 100 impresiones, marcar «volumen bajo» y no
seleccionar un ganador cuantitativo. Es una regla de lectura, no un cálculo de
potencia ni de significancia; superar 100 tampoco autoriza conclusiones causales.
Con señal escasa, mantener la imagen que pasa la revisión editorial y continuar
observando sin retrasar correcciones evidentes de exactitud o accesibilidad.

Guardrails:

- Sin hechos inventados, señales institucionales falsas, claims de rentabilidad o
  gráficos publicados con auditoría pendiente.
- Sin degradar alternativas textuales, recorte móvil, dimensiones reservadas ni
  los límites de peso de la entrega. Conservar checks de rendimiento existentes.
- Revisar denominadores, rechazos de payload y deduplicación antes de interpretar
  tasas anómalas. El transporte puede perder eventos; no reconstruir personas.
- No introducir cookies, fingerprints ni IDs persistentes. La granularidad
  propuesta permanece en eventos y dimensiones acotadas del producto.

Una corrección editorial evidente no requiere esperar una ventana. Un aumento de
clics nunca compensa una imagen engañosa o datos incorrectos.

## Evidencia y seguimiento

El [runbook](../operations/runbooks/hero-images-runbook.md) describe contrato,
operación y diagnóstico. El [ADR](../adr/ADR-20260930-editorial-image-delivery.md)
registra la extensión compatible del sistema. Los resultados observados se
adjuntarán a este plan cuando existan ventanas completas; hoy no se afirma una
mejora medida de engagement, continuidad o retención.
