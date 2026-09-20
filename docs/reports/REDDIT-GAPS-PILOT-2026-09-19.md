# Piloto: monitor de Reddit bidireccional (oportunidades y brechas)

Fecha: 2026-09-19 · Estado: **resultados del piloto; enfoque mensual adoptado el 2026-09-20; validación de temas pendiente** · Plan: `docs/adr/ADR-20260919-reddit-single-monitor.md` (dirección bidireccional)

## Pregunta

¿Comparar los hilos de Reddit con el catálogo de Monedario usando embeddings (MiniLM) sirve para (a) **sugerir la página adecuada** en un hilo y (b) **detectar brechas de contenido** (temas recurrentes sin página)? El piloto es de solo lectura y no modificó producción.

## Método

- **Catálogo:** `scripts/export-reddit-catalog.mjs` → `reddit-monitor/catalog.json` (se genera al correr el piloto y **no se versiona**): 163 páginas (53 artículos, 22 calculadoras, 11 guías, 54 términos de glosario, 23 leyes). URL siempre derivada del `slug`/ruta.
- **Corpus:** `spike_gaps.py` en la VM. Paginó `/new` de los 10 subs del monitor (≈1.000 posts por sub) y aplicó filtros: últimos 180 días, sin posts fijados ni hilos plantilla (título repetido ≥5 veces con dígitos normalizados), sin cuentas propias, y **relevancia financiera** = sub 100 % financiero (`FinanzasChile`, `ChileInversiones`) o keyword del monitor.
- **Resultado del filtrado:** 8.516 crudos → 7.017 recientes → 6.950 sin plantillas → **2.104 analizados** (≈82 por semana en 25,6 semanas).
- **Análisis:** similitud coseno con MiniLM (`embed:paraphrase-multilingual-MiniLM-L12-v2:v1`); agrupación jerárquica (enlace promedio, similitud ≥0,55).
- **Iteraciones:** la primera corrida usó "parecido al catálogo" como filtro de relevancia y dejó pasar turismo, autos y música. Se descartó y se sustituyó por el filtro de arriba.
- **Evaluación:** hecha por el asistente a partir de los propios hilos; **pendiente de confirmar por Carlos** (ver "Decisiones").

## Hallazgos

### 1. Volumen: la oferta está concentrada
| Sub | Posts financieros (180 d) |
|---|---|
| FinanzasChile | 845 |
| ChileInversiones | 573 |
| RepublicadeChile, chile_autos, ChileIT, chile, AskChile, Santiago, derechoenchile, ChileStartup | 32–120 cada uno |

El 67 % del volumen financiero sale de dos subs. Los otros ocho aportan poco cada uno (los generalistas como `chile` o `Santiago` casi no hablan de finanzas personales). Además, con keywords sobre el título el volumen habría parecido de solo ~34 posts por semana: **el sesgo por léxico oculta más de la mitad**.

### 2. Sugerencias automáticas (oportunidades): NO pasan el criterio
- Solo **48 de 2.104** posts (2,3 %) superan 0,70 de similitud con una página "completa"; 22 superan 0,75 (≈1 a 2 por semana).
- **Precisión de las 30 mejores: ≈14 apropiadas (≈47 %)**, frente al 70 % exigido. Ejemplos correctos: "Fondo de emergencia" → guía de fondo de emergencia; "ETF Fintual o Racional" → artículo de instrumentos; "despido art. 161 + finiquito" → indemnización. Errores típicos: "PIB en rojo" → calculadora de sueldo líquido; "mejor tarjeta" → guía hipotecaria; "curso de inversiones" → simulador de jubilación.
- **Efecto imán:** el 40 % de las sugerencias (19 de 48) apunta a solo dos páginas genéricas (`/guias/finanzas-migrantes/` y la guía hipotecaria). 8 de los 16 errores caen en la de migrantes. Los títulos cortos ("Bancos chilenos") generan vectores ruidosos.

### 3. Brechas: SÍ pasan, con correcciones
De los 10 grupos mayores, unos 7 son demanda real de contenido (agrupados en ~5 temas distintos, porque el agrupamiento los fragmenta):

| Tema de demanda | Hilos | Señal | ¿Ya cubierto? (a verificar) |
|---|---|---|---|
| Qué hacer con un monto de dinero / por dónde empezar (8M, 40 palos, "0 educación financiera") | 74 + 25 + 18 | Muy alta | Parcial: guía de ahorro e inversión |
| Opiniones y revisión de portafolio / primeras inversiones | 78 (+39 "muestren sus portafolios") | Muy alta | Parcial |
| Estrategia de ETF tras la "megareforma" (DCA, Art. 107 LIR) | 31 | Alta, y actual | Artículo de instrumentos (general) |
| Jubilación anticipada / independencia financiera con APV | 19 | Media | Artículo de APV + simulador |
| Invertir en departamentos ("¿aún vale la pena?") | 18 | Media | Sin página propia evidente |
| Crédito automotriz vs consumo vs tarjeta | 14 | Media | Sin página propia evidente |
| Incidentes bancarios (Tenpo, cajero, cargos) | 12 | Baja | Artículo de fraude |

Descartes correctos del piloto: grupos de ruido (p. ej. "salario de los redditores"), y "bancos" (ya cubierto por la guía).

### 4. Defectos a corregir antes de construir la Fase 3
- **Fragmentación:** un mismo tema aparece en 2 o 3 grupos. Falta una segunda pasada de fusión o un umbral mayor.
- **Etiquetas pobres:** el título con más engagement como etiqueta a veces es anecdótico ("Soy de izquierda y vivo de mis inversiones"). Mejor etiquetar con términos frecuentes del grupo.
- **La "página más cercana" no sirve como veredicto de cobertura** (mismo efecto imán). Debe mostrarse como ayuda para el humano, con las tres más cercanas y su similitud.
- **Recurrencia inflada por pocos autores o plantillas:** no se puede medir sin identificar autores. Opción: guardar un **hash con sal del autor** (irreversible, solo para contar solicitantes distintos) en lugar del nombre.
- **Historia antigua:** `/new` llega a 2015 en subs pequeños; el análisis debe limitarse a una ventana móvil.

### 5. Costos operativos
La corrida completa tardó ≈15 min en la VM (≈4 min de descarga y ≈10 min de embeddings y agrupación) sobre 8.700 posts. Con el filtro aplicado **antes** de embeber, y guardando embeddings para calcular solo lo nuevo, el trabajo semanal es viable en su propia unidad systemd (`MemoryMax` 1,5 GB).

## Conclusión (go/no-go)

| Componente | Veredicto | Motivo |
|---|---|---|
| **Brechas** de contenido | **GO**, como análisis mensual bajo demanda (ver "Enfoque adoptado") y con las correcciones del punto 4 | ≈70 % de los grupos mayores son demanda real; el filtro de relevancia funciona. |
| **Sugerencia automática por embeddings** en la cola | **NO-GO** | ≈47 % de precisión; el efecto imán a guías genéricas la vuelve ruido. |

Para **oportunidades**, el camino recomendado es ampliar el mapa por frases (`resource_map`, alta precisión, cobertura baja) con frases curadas por artículo y calculadora, y dejar los embeddings solo como ayuda de descubrimiento para el humano ("páginas posiblemente relacionadas", sin autocompletar). Un reordenador con LLM sobre los ~80 hilos semanales sería barato, pero exige clave de API y política de uso: **no se propone aún**.

## Enfoque adoptado (2026-09-20)

El plan original era infraestructura permanente: esquema v4, corpus persistente, análisis semanal, unidad systemd y página `/brechas`. Con ≈82 posts financieros por semana y un solo usuario, eso es más de lo que el problema justifica. Se adopta en su lugar:

1. **Análisis mensual bajo demanda** con este piloto (`spike_gaps.py`): unos 15 minutos sobre una ventana de 180 días. Salen 1 o 2 temas por mes, que se revisan con Carlos y se llevan a la Puerta 00.
2. **Disposición en `content_gaps`**, como fija el contrato de convergencia del 2026-09-19 (`docs/backlog/ROADMAP-reddit-monitor-2026-09-19.md`): mismo vocabulario (`detectado`, `en_backlog`, `publicado`, `descartado`) y sin tabla ni JSON paralelos. `catalog.json` es solo la entrada del análisis.
3. **Sin seguimiento por usuario:** la recurrencia se cuenta por hilos distintos, no por autores. Se descarta el hash de autor propuesto antes, porque contradice la regla de no crear seguimiento persistente a nivel de usuario.
4. **Sin corpus permanente de terceros:** los datos del análisis (título y 300 caracteres, sin autor) se borran al terminar.
5. **Sugerencias por embeddings descartadas.** Para oportunidades se amplía el `resource_map` con frases curadas por artículo y calculadora.

Se construirá la versión persistente solo si, tras 2 o 3 ciclos, la cadencia mensual resulta un cuello de botella. Limitación a vigilar: `/new` devuelve como máximo unos 1.000 posts por sub; con el volumen actual alcanza para 180 días, pero un sub más activo podría quedar cortado.

Correcciones pendientes en el propio análisis (punto 4 de los hallazgos): fusión de grupos, etiquetado por términos frecuentes y mostrar las tres páginas más cercanas como ayuda para el humano.

## Pendiente de Carlos

- **Validar los 7 temas** de la tabla del punto 3. Son candidatos a la Puerta 00; los dos sin página propia (portafolio y crédito automotriz) son los más claros.

## Limitaciones
- Evaluación manual y sin una segunda persona; los porcentajes son orientativos (muestra de 30 y de 10).
- Umbrales exploratorios, sin calibrar con las etiquetas de Carlos.
- Corpus de 25 semanas: cubre bien lo estable, pero un tema estacional (p. ej. Operación Renta) puede estar infrarrepresentado.
- Los datos de terceros usados en el piloto (título y fragmento de 300 caracteres, sin autor) se borraron de la VM al terminar.
