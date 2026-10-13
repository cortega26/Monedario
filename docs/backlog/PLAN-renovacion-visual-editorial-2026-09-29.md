# Renovación visual-editorial de Monedario

Fecha: 2026-09-29 (ampliación 2026-10-12)
Estado: 53 portadas v5 aceptadas; una portada conservada hasta auditoría independiente. Despliegue fuera de alcance.
Autorización: plan aprobado explícitamente por el usuario; generación y curación delegadas.

## Objetivo y alcance

Identidad editorial cercana, reconocible y profesional. Cada imagen debe reforzar
la promesa del artículo, sin datos inventados ni metáforas engañosas. Engagement
y continuidad se medirán de forma observacional; no se promete mejora causal.

En alcance: briefs de los 54 artículos, generador y workspace de imágenes,
23 portadas, reparación de primer empleo, gráficos de interés compuesto,
derivados responsive/OG, accesibilidad, analítica relacionada, pruebas y docs.
Fuera: rutas públicas, redacción ajena a gráficos/alternativas textuales,
calculadoras, finiquito y auditoría plan-115 con sus cambios concurrentes.

Autoridad: Constitución > AGENTS > context > código. Constitución §§1, 2.2,
4.1 y 7: cambio acotado, I/O en límites, contratos explícitos y caché explícita.
Se preservan URL.PUBLIC.NO_POST_ID, ROUTES.NO_SILENT_CHANGES,
RSS.NO_REMOVALS e INVARIANT.EDITORIAL.SEPARATION_OF_DUTIES.

## Decisiones

- Estilo `monedario-editorial-v5`: navy/teal, papel cálido, acentos contenidos,
  formas naturales, caras simplificadas opcionales y sombras suaves.
- Una situación por portada. Alternar escenas, manos/objetos, comparaciones y
  mecanismos. No sellos oficiales inventados ni riqueza garantizada.
- Brief respaldado por artículo completo o extracción estructurada de todo su
  cuerpo; nunca selección aprobada por primera keyword o slug solamente.
- Prompt final único: lo visto/copied/validado coincide byte por byte y se hashea.
  Las notas P0 operativas no se concatenan al prompt.
- Registrar versión de estilo, hash de fuente editorial, prompt y hash, original
  raster, hash del asset y revisión. Drift editorial requiere nueva revisión.
- Generación explícita con herramienta imagegen; ninguna llamada generativa en
  build/CI. Un original por imagen final, curado antes de publicar.
- Entrega AVIF 1200×630, 800×420 y 600×315, máximo 80 KiB; un OG por slug.
  URLs de derivados con hash de contenido y canónicos preservados para gates.
- Originales nuevos en `scripts/hero-images/sources/`; rollback del estado previo
  mediante Git y copia local en `output/hero-images/visual-v5/before/`.
- Hero alt opcional; tarjetas con título redundante usan alt vacío. Gráficos
  incluyen descripción y datos accesibles en el mismo artículo.

## Lotes

Piloto: presupuesto mensual, descuento AFP, APV, PGU, renegociación Superir, UF.

Lote 2: devolución impuestos, DAP UF/pesos, IPC, hipotecario, reforma previsional,
Cuenta 2, seguro cesantía, liquidación, fondos AFP, indemnización, cotización
voluntaria, guía general ahorro/inversión, interés compuesto, CIC/FCS, Operación
Renta centro, boletín comercial y UTM.

Primer empleo: corregir bandas negras/encuadre conservando el concepto.
Resto: renovar en lote complementario autorizado el 2026-10-12; preservar los criterios y la trazabilidad v5.

Gráficos: fuente común y render determinista; reconciliar series y FX antes de
reemplazar. No ajustar una curva a un headline deseado. Preparar paquete de
auditoría independiente y mantener firmas humanas pendientes.

## Secuencia y aceptación

1. Inventariar estado anterior, preservar cambios del usuario y guardar este plan.
2. Unificar briefs/prompts/workspace, revisar y generar piloto de seis.
3. Revisar miniaturas y conjunto; producir lote 2 y reparar primer empleo.
4. Reconciliar gráficos, revisar límites y preparar auditoría independiente.
5. Construir entrega por hash, OG, alt y presentación responsive.
6. Reutilizar analítica sin identificadores persistentes nuevos; documentar
   comparación de 28 días y limitaciones de tráfico/causalidad.
7. Tests, build, rutas/RSS, revisión independiente de spec/diff y galería final.

Una imagen pasa si representa el artículo, se distingue de vecinas, funciona
en miniatura y no tiene artefactos, datos inventados o símbolos engañosos.
No se marcan gates humanos ni se despliega como parte de esta tarea.

## Verificación

| Evidencia | Comando / criterio |
| --- | --- |
| Prompt único, briefs y drift | Vitest focalizado + `pnpm run check:hero-prompts` |
| Derivados coherentes y hash | Tests entrega + `pnpm run check:hero-images` |
| Documentación y esquemas | `check:docs`, `check:context`, `check:frontmatter` |
| Calidad de código | `pnpm run check:ci` |
| Sitio completo | `pnpm run build`, `check:rss`, `check:routes` |
| Visual | Galería antes/después, 300 px, mobile y desktop |
| Gráficos | Dataset/supuestos, comandos reproducibles, audit separado |

## Registro de ejecución

- Inicio: existen cambios del usuario en audit plan-115 y tres OG no rastreados
  de cotización voluntaria. Se preservan. No hay cambios iniciales de fuente
  editorial ni de imágenes canónicas.
- Sandbox local falla con `mountinfo path is not absolute`; herramientas
  escaladas vuelven a funcionar. No se evita la revisión de aprobación.
- Implementación dividida en generador/briefs, entrega y gráficos; root coordina
  arte, documentación, integración, medición y cierre.

## Renovación complementaria (autorizada el 12 de octubre de 2026)

El usuario amplió el alcance: completar la estética `monedario-editorial-v5`
en las 30 portadas aún sin revisión aceptada. Se conserva sin cambios el lote
aprobado de 24. Base aislada: `origin/main` en `00d372c8`. Para validar huellas y escenas
de `devolucion-impuestos-fechas-compensaciones` y
`rentas-mixtas-sueldo-honorarios`, se reflejó temporalmente en el checkout
aislado el texto local vigente de esos artículos; sus archivos editoriales no
forman parte del cambio ni se modificarán.

En alcance: prompts vigentes, generación manual explícita, curación contra el
artículo y sus vecinas, fuentes WebP lossless, originales raster, registro de
revisión, canónicos, derivados responsive y manifiesto de entrega. Fuera de
alcance: cuerpo y frontmatter, gráficos financieros, rutas/RSS y despliegue.
No se cambiarán las imágenes de los artículos con revisión aceptada.
Esta ampliación sí incluye `finiquito-e-indemnizaciones-en-chile`, que estaba
fuera del alcance del lote anterior.

Inventario pendiente (30):

- `bancos-y-fintech-chile`
- `boleta-honorarios-2026-retencion-cobertura`
- `cae-costo-real-credito-chile`
- `como-calcular-sueldo-liquido`
- `como-cambiarse-de-afp`
- `como-elegir-inversion-segun-plazo-riesgo-objetivos`
- `como-invertir-en-etfs-desde-chile`
- `como-leer-cartola-afp-chile`
- `contribuciones-bienes-raices-chile`
- `descuentos-de-sueldo`
- `donde-ver-si-estoy-en-dicom-gratis`
- `estafas-financieras-chile-vishing-smishing-marketplace`
- `finanzas-para-migrantes-chile`
- `finiquito-e-indemnizaciones-en-chile`
- `fonasa-vs-isapre-comparativa`
- `fondo-emergencia-chile`
- `fondos-mutuos-comisiones-rescate-impuestos`
- `fraude-tarjeta-que-hacer`
- `gratificacion-legal-chile`
- `impuesto-global-complementario-chile`
- `informe-deudas-cmf-vs-dicom`
- `interes-compuesto-nota-metodologica` (se conserva la portada actual hasta
  una auditoría independiente; su brief requiere un gráfico `data-render`
  derivado de datos verificados y prohíbe Imagegen)
- `licencia-medica-desde-que-dia-pagan`
- `operacion-renta-f22-checklist`
- `prepago-credito-cuando-conviene-chile`
- `reajuste-arriendo-uf-ipc-chile`
- `rentas-mixtas-sueldo-honorarios`
- `sueldo-imponible-chile`
- `suplantacion-identidad-creditos-no-reconocidos`
- `tarjeta-credito-costo-real-chile`

Criterios de aceptación de esta ampliación: 29 nuevas portadas aceptadas
(53/54 en total); la portada de interés compuesto queda explícitamente en
espera de auditoría independiente, sin reemplazo generado. Prompt/fuente/hash
coherentes para las 53 aceptadas; hero/tablet/móvil/OG derivados desde la fuente
seleccionada; miniatura reconocible y sin artefactos o promesas financieras
engañosas. `check:hero-prompts`, `check:image-curation`,
`build-delivery.mjs --check` y `check:hero-images` deben quedar conformes. La
inspección final cubre cada candidata aceptada a 300 px. Sin suite de tests ni
build general en este cambio de arte.

Registro de ejecución:

- Revalidación inicial sobre `origin/main`: 54 prompts, 24 curaciones, entrega
  54/54 sin cambios pendientes y 54 artículos conformes.
- Dos briefs se revalidaron contra el texto local vigente sin cambiar sus escenas; sus huellas se registran para que la curación no quede obsoleta.
- 29 portadas generativas se actualizaron, revisaron visualmente a 300 px y se
  integraron con su original PNG, fuente WebP lossless, revisión aceptada y
  variantes de entrega. La revisión total queda en 53/54.
- Para `cae-costo-real-credito-chile` se rechazaron dos candidatas con iconos
  de vivienda (SHA-256 `3ef56d05e869901d66fa2404398ad9e0e8c056d60cf34e686b830548df44cc0f`
  y `b358b48a6572a6e6e043cab4c4ddc5a787685235b31190394e534ba520b0c3b1`); la
  tercera candidata elimina esa asociación y fue aceptada (SHA-256
  `0e7b6f3f029f1de4852dcb51bdbb190274fd5d0d9989df281efa14e4412dc239`).
- Se descartó una candidata Imagegen de interés compuesto porque inventaba
  valores en un gráfico. Por indicación del usuario, la portada vigente se
  mantiene hasta auditoría independiente; el gráfico se reserva para el flujo
  `data-render` con fuentes verificadas.
- No se editó el contenido editorial ni se desplegó el sitio.
- Reconciliación para PR: `devolucion-impuestos-fechas-compensaciones` y `rentas-mixtas-sueldo-honorarios` quedaron rebaselados al texto publicado en `origin/main` (`00d372c8`); el brief de rentas y su asset se revalidaron contra esa versión. El artículo de interés compuesto conserva su portada sin cambios hasta auditoría independiente.

## Referencias

- [Plan editorial de imágenes](../../context/EDITORIAL_IMAGE_SYSTEM.md)
- [Auditoría independiente](../editorial/AI_AUDIT_PROTOCOL.md)
- [NN/g: imágenes relevantes](https://www.nngroup.com/articles/photos-as-web-content/)
- [W3C: imágenes complejas](https://www.w3.org/WAI/tutorials/images/complex/)
