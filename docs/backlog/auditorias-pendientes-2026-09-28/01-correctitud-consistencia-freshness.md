# Auditoría adversarial de correctitud, consistencia y freshness — monedario.cl

Actúa como un equipo combinado de **QA Engineer especializado en black-box/property-based testing, analista financiero/previsional, auditor YMYL e investigador adversarial**.

Tu objetivo es intentar demostrar que algún cálculo, dato, regla, explicación, supuesto o afirmación publicada en `https://monedario.cl` es **incorrecta, inconsistente, ambigua, incompleta o desactualizada**.

No confíes en la implementación, tests internos ni explicaciones del propio sitio. Monedario es la caja negra a auditar, no la fuente de verdad.

## 1. Cobertura

Descubre y clasifica tantas páginas públicas como sea razonablemente posible:

- calculadoras;
- hubs;
- guías y artículos;
- FAQs;
- tablas;
- páginas que describan leyes, tasas, topes, plazos o condiciones.

Construye un inventario de conceptos repetidos: UF, UTM, IPC, sueldo, AFP, salud, AFC, APV, impuestos, seguro de cesantía, deuda, tasas, topes, pensiones, indemnizaciones, fechas legales, requisitos y plazos.

Al final declara URLs descubiertas/auditadas, calculadoras probadas, reglas verificadas, fuentes primarias consultadas y zonas no auditadas.

## 2. Correctitud black-box de calculadoras

Para cada calculadora relevante:

1. Identifica exactamente qué pretende calcular.
2. Reconstruye de forma independiente las reglas y parámetros usando **fuentes primarias/oficiales**.
3. Calcula por separado el resultado esperado.
4. Compara con el resultado de Monedario.
5. Registra inputs, esperado, observado, diferencia absoluta/relativa y explicación.

Nunca derives el resultado esperado desde el código o explicación de Monedario.

### Casos normales

Prueba varios escenarios representativos y realistas.

### Boundary testing

Para cada tramo, tope, umbral, fecha o cambio de porcentaje, prueba:

- justo debajo;
- exactamente en el límite;
- justo encima.

Presta atención a errores de redondeo, discontinuidades y off-by-one.

### Edge cases

Cuando el formulario lo permita, prueba:

- cero;
- negativos;
- vacío;
- decimales;
- valores extremadamente altos;
- separadores de miles/decimales;
- valores parcialmente ingresados;
- combinaciones raras pero válidas;
- combinaciones incompatibles.

Distingue entre input inválido bien rechazado, inválido aceptado, válido rechazado y resultado silenciosamente incorrecto.

### Propiedades e invariantes

Busca propiedades que deberían cumplirse aunque no conozcas el resultado exacto:

- monotonicidad cuando corresponda;
- continuidad salvo cambios legales reales;
- ausencia de resultados negativos imposibles;
- consistencia de redondeo;
- conservación de unidades;
- misma entrada ⇒ misma salida;
- opciones irrelevantes no deberían alterar el resultado;
- un parámetro solo debería afectar componentes que dependan de él;
- reversibilidad aproximada en calculadoras directa/inversa, si aplica.

Genera casos automáticamente cuando sea útil.

## 3. Consistencia global

Trata el sitio como una base de conocimiento.

Extrae afirmaciones con esta estructura:

`entidad → propiedad → valor → vigencia → fuente → URL`

Busca contradicciones entre:

- calculadora vs artículo;
- artículo vs FAQ;
- hub vs calculadora;
- tabla vs texto;
- ejemplo vs explicación;
- dos páginas sobre el mismo concepto;
- fecha declarada de actualización vs contenido efectivo.

No marques como contradicción diferencias justificadas por fecha, régimen, segmento o condición.

## 4. Freshness y vigencia

Para cada dato o regla sensible al tiempo:

1. identifica fecha de vigencia;
2. verifica la fuente primaria más reciente;
3. compara con Monedario;
4. comprueba que el sitio comunique correctamente desde cuándo aplica;
5. revisa también ejemplos y cálculos que dependan de ese valor.

Busca especialmente tasas, parámetros anuales, topes, UF/UTM, tablas tributarias, cambios previsionales, beneficios, plazos y leyes modificadas.

Una fecha reciente visible **no demuestra** que el contenido esté actualizado.

## 5. Fuentes

Prioriza:

1. organismos públicos responsables;
2. legislación oficial;
3. normativa/circulares oficiales;
4. documentación institucional primaria.

Para cada afirmación crítica verifica que la fuente realmente la respalde, esté vigente y corresponda al periodo correcto.

## 6. Riesgo de precisión aparente

Busca:

- resultados al peso cuando existen supuestos no definidos;
- aproximaciones presentadas como exactas;
- omisión de excepciones materialmente relevantes;
- cálculos dependientes de datos que el usuario no proporcionó;
- simplificaciones sin advertencia suficiente.

No penalices simplificaciones razonables si están comunicadas claramente.

## 7. Severidad

- **P0:** resultado materialmente erróneo que puede inducir una decisión financiera incorrecta.
- **P1:** regla desactualizada, contradicción o supuesto omitido con impacto importante.
- **P2:** inconsistencia/ambigüedad real de impacto limitado.
- **P3:** precisión editorial o detalle de baja consecuencia.

Estado: `CONFIRMED`, `PROBABLE`, `HYPOTHESIS`.

## 8. Entregable

### Executive summary
Estado general, riesgo de resultados incorrectos, freshness, consistencia y findings principales.

### Cobertura
Inventario, calculadoras, reglas, fuentes y fecha de auditoría.

### Findings

| ID | Severidad | Estado | URL/componente | Problema | Evidencia | Fuente independiente | Causa probable | Fix | Test de regresión |
|---|---|---|---|---|---|---|---|---|---|

### Matriz de calculadoras
Casos probados, esperado, observado, diferencias y `PASS/FAIL/PARTIAL`.

### Contradicciones internas
Lista normalizada `afirmación A ↔ afirmación B`, con contexto.

### Riesgos sistémicos
Agrupa problemas derivados de parámetros duplicados, valores hardcoded, lógica divergente, contenido no sincronizado, redondeos o actualización manual.

### Fixes priorizados
Prioriza por impacto, alcance, facilidad y capacidad de prevenir errores futuros.

### Regression suite propuesta
Convierte cada defecto relevante en un test reproducible.

## 9. Reglas

- No confíes en Monedario para verificar Monedario.
- No confundas coincidencia con corrección.
- Ataca especialmente fronteras, supuestos y vigencia.
- Busca causas sistémicas antes que síntomas repetidos.
- Toda conclusión importante debe tener evidencia.
- Si algo no puede verificarse, dilo explícitamente.

Pregunta final:

> **¿Puede un usuario obtener hoy una respuesta materialmente incorrecta, desactualizada o contradictoria de Monedario sin darse cuenta?**
