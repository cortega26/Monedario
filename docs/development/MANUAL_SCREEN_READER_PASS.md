# Pasada manual con lector de pantalla (NVDA / VoiceOver)

Protocolo para el remanente humano del plan 114. Cubre lo que axe **no** puede
verificar: orden y visibilidad del foco, anuncios de estado en vivo, lectura
coherente de resultados y errores, y operabilidad completa por teclado.

Evidencia de esta pasada: `output/validation/a11y-manual/<YYYY-MM-DD>/`
(gitignored; enlazar hallazgos desde un reporte o TD).

## 1. Alcance

| Grupo | Superficies |
|---|---|
| Contenido | Home · 11 hubs (`/guias/<cluster>/`) · artículo de blog · glosario (índice + término) · leyes (índice + ley) · `/autor/` · `/metodologia/` · `/archives/` |
| Calculadoras | Las 22 de `/calculadoras/*` (lista real: `ls src/pages/calculadoras/*.astro`) |
| Utilitarias | `/buscar/` · paginación de `/posts/2/` · `/tags/<tag>/` · 404 |
| Estados | Tema claro y oscuro · resultado real · error de validación · escenario guardado |

Duración estimada: 2–3 h por combinación lector+plataforma; se acepta muestreo
dirigido (mínimo: home, un hub, un artículo, 4 calculadoras representativas
—sueldo, crédito, jubilación, renegociación—, glosario, búsqueda, error y
resultado).

## 2. Entornos y herramientas

| Combo | Cómo |
|---|---|
| NVDA + Firefox (Windows) | NVDA 2026.x; navegar con `H` (headings), `F` (formularios), `B` (botones), `K` (enlaces), `D` (landmarks), `Tab`; activar "Speech viewer" para capturar salida |
| VoiceOver + Safari (macOS) | `VO` = Ctrl+Option; rotor `VO+U` (headings, landmarks, forms); `VO+F5` para el panel de braille/notas |
| VoiceOver + Safari (iOS) | Rotor por deslizamiento; probar al menos home, artículo y una calculadora |
| Solo teclado (sin lector) | Chrome/Firefox: recorrer cada flujo únicamente con `Tab/Shift+Tab/Enter/Espacio/Flechas` |

Requisitos previos: build local servido (`pnpm exec astro preview --port 4321`)
o producción. Registrar versión de SO, navegador y lector en la evidencia.

## 3. Guion por flujo (qué probar y qué debe anunciarse)

### 3.1 Estructura y navegación (todas las plantillas)
1. Primer `Tab`: el enlace "Saltar al contenido" debe ser visible y, al
   activarlo, el foco entra al `<main id="main-content">`.
2. Rotor/lista de landmarks: deben aparecer `banner` (header), `navigation`
   (menú principal y footer), `main`, `contentinfo` (footer) y, donde aplique,
   `search` y `complementary` (TOC/escenarios).
3. Jerarquía de encabezados: un solo `h1` por página; sin saltos de nivel.
4. Menú desplegable "Guías": operable con teclado, `aria-expanded` correcto y
   cierre con `Escape`.

### 3.2 Calculadora — flujo principal
1. Encabezado y descripción: el nombre de la calculadora se anuncia una vez.
2. Formulario: cada campo anuncia **etiqueta + tipo + valor**; los hints se
   anuncian como descripción (`aria-describedby`), no como parte del nombre.
3. Botón "Calcular": accesible con `Tab` + `Enter`/`Espacio`; estado de carga
   anunciado (no un spinner mudo).
4. Resultado: al calcular, el panel debe anunciarse como región viva
   (`aria-live`) o recibir el foco; el lector debe leer el monto principal y
   sus componentes (AFP, salud, impuesto, líquido) en orden lógico.
5. "Ir al cálculo" (ancla): activarlo lleva el foco al formulario.

### 3.3 Errores y validación
1. Enviar con un campo requerido vacío: el error debe anunciarse de inmediato
   (región `alert`/`status`), asociarse al campo (`aria-describedby`) y marcar
   `aria-invalid="true"`.
2. Corregir el valor: el error desaparece y no queda anunciado.
3. El foco no debe quedar atrapado ni saltar fuera del formulario.

### 3.4 Escenarios guardados
1. "Guardar escenario actual" → formulario de nombre accesible; feedback
   anunciado ("Escenario guardado").
2. Lista de escenarios: cada ítem operable y con nombre; "Comparar escenarios"
   anuncia la tabla/resultado.
3. Al eliminar, el foco vuelve a un lugar predecible.

### 3.5 Contenido editorial
1. Artículo: se anuncian título, fecha, autor, tiempo de lectura y, al
   avanzar, encabezados y enlaces sin ruido (sin leer URLs completas).
2. Glosario/leyes: término y definición en orden; enlaces relacionados
   etiquetados con su destino real.
3. `/buscar/`: campo con etiqueta, resultados anunciados al filtrar, estado
   "sin resultados" anunciado.

### 3.6 Tema, zoom y viewport
1. Alternar tema (claro/oscuro) con teclado: el botón anuncia el estado
   correcto (`aria-pressed`/label).
2. Zoom 200% y 400% (o 320px de ancho efectivo): todo el flujo principal sigue
   operable; el botón "Volver arriba" no tapa contenido (plan 122).

## 4. Criterios WCAG 2.2 a registrar (los no automatizables)

| Criterio | Qué observar |
|---|---|
| 2.1.1 Teclado | Todo el flujo sin ratón |
| 2.4.3 Orden del foco | Orden visual = orden de tabulación |
| 2.4.7 Foco visible | Indicador visible en todos los controles |
| 2.4.11 Foco no oscurecido (AA) | El foco no queda bajo header/botones flotantes |
| 3.3.1 Error identificado | Mensaje de error en texto, no solo color |
| 3.3.2 Etiquetas/instrucciones | Todo campo con etiqueta persistente |
| 4.1.3 Mensajes de estado | Cálculos/errores/guardados anunciados sin mover el foco |
| 2.5.8 Tamaño del objetivo (AA) | Objetivos ≥24×24 px efectivos |

## 5. Registro y evidencia

Por plantilla, crear `output/validation/a11y-manual/<fecha>/<slug>.md` con:

```md
# <ruta> — <lector/plataforma>
Fecha: YYYY-MM-DD
Entorno: SO + navegador + versión lector

## Flujo probado
- [ ] Navegación por landmarks/encabezados
- [ ] Formulario y cálculo
- [ ] Resultado anunciado
- [ ] Error de validación
- [ ] Escenarios (si aplica)

## Hallazgos
| # | Criterio | Descripción | Severidad | Evidencia (captura/nota) |
|---|---|---|---|---|

## Veredicto
PASS | PASS con observaciones | FAIL
```

Capturas: incluir la ventana del lector (Speech viewer / panel VO) cuando el
hallazgo sea de anuncio.

## 6. Tratamiento de hallazgos

- **Bloqueante (impide completar el flujo o anuncia información falsa)**: abrir
  fix inmediato con regresión Playwright si es automatizable.
- **No bloqueante**: registrar en `docs/TECH_DEBT_BACKLOG.md` con severidad
  (2–3) y plantilla afectada.
- Cerrar el remanente del plan 114 actualizando su fila en `plans/README.md`
  con el enlace a la evidencia.

## 7. Criterio de cierre

- Al menos un lector de pantalla en una plataforma completa el guion de §3 en
  las superficies mínimas de §1, con evidencia por plantilla.
- 0 hallazgos bloqueantes abiertos; los no bloqueantes registrados como TD.
