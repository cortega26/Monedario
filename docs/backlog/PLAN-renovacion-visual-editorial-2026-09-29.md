# Renovación visual-editorial de Monedario

Fecha: 2026-09-29
Estado: En ejecución
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
Resto: conservar inicialmente; revisar brief, alt y derivados.

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

## Referencias

- [Plan editorial de imágenes](../../context/EDITORIAL_IMAGE_SYSTEM.md)
- [Auditoría independiente](../editorial/AI_AUDIT_PROTOCOL.md)
- [NN/g: imágenes relevantes](https://www.nngroup.com/articles/photos-as-web-content/)
- [W3C: imágenes complejas](https://www.w3.org/WAI/tutorials/images/complex/)
