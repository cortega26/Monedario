# Content Refresh Cadence — Monedario

**Version:** 1.0 — 2026-04-11  
**Scope:** Todos los clusters del sitio (9 hubs activos)  
**Relacionado:** `docs/development/BACKLOG_EDITORIAL.md`, `context/CURRENT_STATE.md`

---

## 1. Principio rector

Refrescar cuando cambia algo real: una cifra oficial, una ley, un plazo, un proceso. No por calendario arbitrario ni por señales de engagement. Un artículo financiero chileno es correcto hasta que deja de serlo — el trigger son los datos, no el tiempo transcurrido.

El criterio operativo es: si un usuario aplica hoy lo que dice el artículo y obtiene un resultado diferente al esperado porque la norma o cifra cambió, el artículo debe actualizarse antes de que eso ocurra.

---

## 2. Triggers de refresh obligatorio (fuera de ciclo)

Estos eventos obligan a revisar los artículos y calculadoras afectados **de inmediato**, independientemente de la cadencia programada.

### 2.1 Cambio de tasas AFP (comisiones y cotización obligatoria)

- **Fuente oficial:** [Superintendencia de Pensiones — Comisiones vigentes](https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9908.html)
- **Frecuencia de publicación:** 2 veces al año (enero y julio)
- **Artículos a revisar:** `como-calcular-sueldo-liquido`, `cuanto-descuenta-la-afp-de-tu-sueldo`, `fondos-afp-a-b-c-d-e`
- **Calculadoras a verificar:** `/calculadoras/sueldo-liquido/`, `/calculadoras/comisiones-afp/`, `/calculadoras/simulador-jubilacion/`

### 2.2 Cambio de UF/UTM/UTA mensual (si afecta topes o ejemplos)

- **Fuente oficial:** [SII — Valor UF, UTM, UTA](https://www.sii.cl/valores_y_fechas/uf/uf2026.htm)
- **Frecuencia de publicación:** La UF cambia diariamente; la UTM/UTA se actualiza mensualmente
- **Artículos a revisar:** `que-es-la-uf`, `reajuste-arriendo-uf-ipc-chile`, cualquier artículo con topes expresados en UF (`como-calcular-sueldo-liquido` para tope imponible AFP/AFC)
- **Calculadoras a verificar:** `/calculadoras/conversor-uf/`, `/calculadoras/reajuste-arriendo/`, `/calculadoras/sueldo-liquido/`

### 2.3 Cambio legislativo (decreto, circular SII, reforma)

- **Fuentes oficiales:**
  - [BCN — Biblioteca del Congreso Nacional](https://www.bcn.cl/leychile/)
  - [SII — Normativa y legislación](https://www.sii.cl/normativa_legislacion/)
  - [CMF — Normativa](https://www.cmfchile.cl/portal/principal/605/w3-channel.html)
  - [Dirección del Trabajo](https://www.dt.gob.cl/portal/1626/w3-channel.html)
- **Artículos a revisar:** Depende de la reforma; usar `context/MODULE_INDEX.md` para identificar qué artículo cubre el tema impactado
- **Acción:** Revisar `canonicalTopic` del artículo afectado y actualizar `updatedDate` + `validAsOf` + contenido

### 2.4 Cambio de retención boleta de honorarios (tabla transitoria anual)

- **Fuente oficial:** [SII — Aumento gradual de retención boletas](https://www.sii.cl/destacados/boletas_honorarios/aumento_gradual.html)
- **Frecuencia:** Cambia el 1 de enero de cada año (hasta 2028, cuando llega a régimen permanente del 17%)
- **Artículos a revisar:** `boleta-honorarios-2026-retencion-cobertura`
- **Calculadoras a verificar:** `/calculadoras/boleta-honorarios-liquido/`
- **Acción inmediata cada 1 de enero:** Actualizar porcentaje de retención, tabla de cronograma y año en el slug del artículo si corresponde

### 2.5 Apertura/cierre de Operación Renta (plazos SII)

- **Fuente oficial:** [SII — Operación Renta](https://www.sii.cl/destacados/renta/)
- **Frecuencia:** Generalmente abril–junio de cada año; el SII publica el calendario a partir de enero
- **Artículos a revisar:** `operacion-renta-f22-checklist`, `devolucion-impuestos-fechas-compensaciones`, `boleta-honorarios-2026-retencion-cobertura`
- **Calculadoras a verificar:** `/calculadoras/operacion-renta/`
- **Acción:** Actualizar fechas del calendario F22, ventanas de devolución y ejemplos del año en curso antes de que abra la temporada

---

## 3. Cadencia programada por cluster

| Cluster | Revisión programada | Qué verificar | Fuente(s) principal(es) |
|---|---|---|---|
| `impuestos-personas` | **Trimestral** (enero, abril, julio, octubre) | Porcentaje de retención de honorarios, plazos OR, cambios circulares SII, tasa impuesto segunda categoría (tabla escalas) | [SII](https://www.sii.cl/), [BCN](https://www.bcn.cl/leychile/) |
| `pensiones-afp` | **Semestral** (enero y julio) | Comisiones AFP vigentes, cronograma de reforma previsional, fondos generacionales, tasas de cotización del empleador para la nueva ley | [Superintendencia de Pensiones](https://www.spensiones.cl/), [SPS — seguimiento reforma](https://www.spensiones.cl/portal/institucional/594/w3-channel.html) |
| `sueldo-remuneraciones` | **Semestral** (enero y julio) | Topes imponibles en UF (AFP y AFC), tabla impuesto único, ingreso mínimo mensual, comisiones AFP que afectan ejemplos | [SII](https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/), [Superintendencia de Pensiones](https://www.spensiones.cl/), [Dirección del Trabajo](https://www.dt.gob.cl/) |
| `empleo-ingresos` | **Semestral** (enero y agosto) | Montos del seguro de cesantía (FCS), reformas laborales en tramitación o aprobadas, cambios en causales de término o plazos de licencia médica | [AFC Chile](https://www.afc.cl/), [Dirección del Trabajo](https://www.dt.gob.cl/), [BCN](https://www.bcn.cl/leychile/) |
| `deuda-credito` | **Anual** (enero) | Tasas máximas convencionales CMF, cambios en normativa de renegociación (Superir), requisitos del informe CMF | [CMF — Tasas de interés](https://www.cmfchile.cl/), [Superir](https://www.superir.gob.cl/) |
| `uf-costo-de-vida` | **Mensual ligero** (primer martes del mes) | IPC publicado por INE; verificar que los artículos no usan un IPC puntual desactualizado como referencia vigente; la UF del conversor se actualiza vía API automáticamente | [INE — IPC](https://www.ine.gob.cl/estadisticas/economia/indices-de-precio-e-inflacion/ipc), [Banco Central — UF](https://si3.bcentral.cl/Indicadoressiic) |
| `ahorro-e-inversion` | **Semestral** (enero y julio) | Tasas de depósito a plazo de referencia, reglas vigentes del APV (límites de aporte y cambio de mecanismo de beneficio), comisiones de fondos mutuos en ejemplos, normativa CMF sobre custodia de ETFs | [CMF](https://www.cmfchile.cl/), [SII — APV](https://www.sii.cl/contribuyentes/renta/ahorro_tributario_apv.htm), [Banco Central](https://www.bcentral.cl/) |
| `seguridad-financiera` | **Anual** (enero) | Vigencia de Ley 20.009 (responsabilidad en fraudes), instrucciones CMF sobre RCN y fraudes electrónicos, PDI para denuncias de suplantación, canales activos de denuncia | [CMF — Circular 3.658 y ss.](https://www.cmfchile.cl/), [PDI](https://www.pdichile.cl/), [BCN — Ley 20.009](https://www.bcn.cl/leychile/navegar?idNorma=236366) |
| `presupuesto-control-financiero` | **Anual** (enero) | Ingreso mínimo mensual, referencias de distribución de gastos (porcentaje de arriendo en salario mínimo en Santiago), cambios en metodología de educación financiera aplicables | [Dirección del Trabajo — IRM](https://www.dt.gob.cl/), [INE](https://www.ine.gob.cl/) |

---

## 4. Proceso de revisión (checklist por ciclo)

Aplicar para cada revisión programada o trigger obligatorio:

- [ ] Verificar cifras clave del cluster contra fuente oficial (ver columna "Qué verificar" de la tabla anterior)
- [ ] Verificar que `updatedDate` es correcto en frontmatter de los artículos revisados
- [ ] Verificar que `updatedDate`, `validAsOf` y cualquier bloque visible de "Revisado el" o "Vigencia" resuelven a la misma fecha calendario para el lector
- [ ] Verificar que `validAsOf` (si existe en `articleLead`) no ha expirado (>90 días)
- [ ] Verificar que los links a fuentes oficiales no están rotos (`pnpm run check:urls` o revisión manual)
- [ ] Verificar que las calculadoras asociadas usan los datos actualizados (revisar constantes del cluster en `src/data/` o `src/config/`)
- [ ] Si hubo cambio material en un artículo, registrar la revisión en `docs/development/BACKLOG_EDITORIAL.md` (tabla de revisiones) con fecha, slug y naturaleza del cambio
- [ ] Si el cambio es significativo (fórmula, porcentaje, proceso regulatorio), hacer commit con mensaje tipo `chore(content): refresh [cluster] — [descripción corta]`

---

## 5. Regla de ownership

El corpus de Monedario es unipersonal. No hay owners distintos por sección: quien publica es responsible del refresh. La cadencia de este runbook es el contrato de base para esa responsabilidad.

Si en el futuro se incorporan colaboradores editoriales, este documento es el punto de partida: cada colaborador asume la cadencia y checklists correspondientes a los clusters que edite. Cualquier cambio a cadencias o fuentes debe actualizarse en este archivo antes de aplicarse.

---

## Historial de cambios

| Fecha | Cambio |
|---|---|
| 2026-04-11 | Versión inicial — 9 clusters cubiertos, triggers obligatorios documentados |
