# Auditoría de dirección prioritaria de crecimiento — 2026-06-28

## Ficha de control

- **Estado:** Final
- **Tipo:** Auditoría estratégica read-only
- **Commit auditado:** `efa3d819`
- **Fecha de corte de datos:** 2026-W25 (`2026-06-15` a `2026-06-21`)
- **Repositorio:** Monedario.cl
- **Decisión derivada:** crecimiento liderado por calculadoras existentes, con
  instrumentación agregada y respetuosa de la privacidad como primer habilitador
- **Plan de ejecución canónico:**
  `docs/backlog/PLAN-calculator-led-growth-2026-06-28.md`

Este documento conserva la evidencia, los cálculos, los hallazgos, las opciones
descartadas y el razonamiento de priorización. No autoriza cambios por sí solo.
Toda implementación debe ejecutarse desde el plan canónico, respetando sus gates,
condiciones de parada y registro de progreso.

---

## 1. Pregunta de decisión

> ¿Cuál es la dirección prioritaria en la que debería caminar Monedario.cl ahora
> mismo para crecer con recursos limitados?

La auditoría no buscó producir una lista extensa de mejoras. Comparó direcciones
mutuamente excluyentes o competidoras por capacidad:

1. profundizar el portafolio de calculadoras existente;
2. capturar demanda SEO ya visible;
3. producir más contenidos o hubs;
4. crear nuevas herramientas o superficies programáticas;
5. expandir GEO;
6. añadir retención mediante newsletter, alertas o perfiles;
7. acelerar monetización.

---

## 2. Veredicto

> **Monedario debe priorizar crecimiento liderado por calculadoras, cerrando
> primero el loop de medición y optimizando los journeys de las herramientas que
> ya demuestran demanda.**

La secuencia correcta es:

```text
medir de forma agregada y sin PII
  → establecer baseline por calculadora
  → mejorar 3–5 journeys ganadores
  → capturar demanda SEO existente
  → medir recurrencia y apoyo
  → decidir expansión o monetización
```

No significa convertir Monedario en un SaaS, añadir features a todas las
calculadoras ni perseguir cada impresión. Significa gestionar como producto los
activos que ya muestran pull.

---

## 3. Alcance y metodología

### 3.1 Incluido

- arquitectura Astro y estructura de rutas;
- portafolio y UX de calculadoras;
- artículos, glosario, leyes y hubs;
- metadata, sitemap, robots, schema y archivos GEO;
- Search Console versionado en el repo;
- Cloudflare traffic/RUM versionado;
- analytics client-side y scorecard de búsqueda;
- workflows, tests, quality gates y runbooks;
- gobernanza editorial, privacidad, monetización y backlog;
- auditorías y planes recientes.

### 3.2 No incluido

- dashboards privados de Cloudflare, Search Console, Ko-fi o Bing;
- revenue o montos de donación no presentes en el repo;
- inspección de producción en navegador;
- entrevistas o feedback directo de usuarios;
- auditoría de seguridad completa;
- datos de backlinks de Ahrefs, bloqueados por licencia;
- volúmenes externos de keywords no versionados.

### 3.3 Método

1. Reconstrucción de arquitectura y superficies con CodeGraph y archivos
   canónicos.
2. Lectura de Constitución, invariantes, contratos, criterio de viabilidad y
   políticas editoriales.
3. Agregación local de snapshots GSC W16–W25 disponibles.
4. Comparación por tipo de superficie: calculadoras, posts, guías, glosario,
   leyes y otras.
5. Revisión de eventos emitidos, destino de analytics y consumo del scorecard.
6. Revisión de cobertura SEO/GEO, confianza, frescura, recurrencia y
   monetización.
7. Ejecución de gates read-only:
   - `pnpm run check:frontmatter`;
   - `EDITORIAL_ENFORCE=1 pnpm run check:editorial-artifacts`;
   - `pnpm run check:editorial-timeliness`;
   - `pnpm run check:links`;
   - `pnpm run audit:cannibalization`.
8. Priorización ponderada por impacto, probabilidad, velocidad, costo,
   defendibilidad, mantenibilidad, riesgo y aprendizaje.

---

## 4. Inventario y baseline

### 4.1 Oferta actual

| Activo | Cantidad observada | Fuente |
|---|---:|---|
| Calculadoras registradas | 22 | `src/config/calculatorPortfolio.ts` |
| Artículos publicados | 53 | `src/data/blog/*.{md,mdx}` |
| Artículos YMYL con artefactos estrictos | 47/47 | ejecución de `check:editorial-artifacts` |
| Entradas de glosario | 54 | `src/data/glossary/*.md` |
| Leyes | 23 | `src/data/laws/*.md` |
| Guías/páginas bajo `guias/` | 16 | `src/pages/guias/**/*.astro` |
| Links internos entre artículos | 261, sin rotos | ejecución de `check:links` |
| Artículos huérfanos detectados | 2 | `bancos-y-fintech-chile`, `como-elegir-inversion...` |

### 4.2 Crecimiento orgánico semanal

Agregación de `output/operations/data-signals/gsc/*-pages.json`:

| Semana | Clics | Impresiones | Páginas con datos |
|---|---:|---:|---:|
| W16 | 9 | 1.412 | 49 |
| W17 | 12 | 1.814 | 82 |
| W18 | 15 | 2.374 | 93 |
| W19 | 5 | 1.670 | 70 |
| W21 | 14 | 2.562 | 98 |
| W22 | 46 | 7.009 | 132 |
| W23 | 49 | 8.697 | 136 |
| W24 | 87 | 10.674 | 128 |
| W25 | 136 | 15.041 | 129 |

No existe snapshot W20. Los valores son absolutos por semana y no sustituyen una
comparación causal antes/después.

### 4.3 Distribución por superficie

#### W25

| Superficie | Clics | Impresiones | CTR agregado |
|---|---:|---:|---:|
| Calculadoras | 126 | 12.345 | 1,02% |
| Posts | 6 | 1.373 | 0,44% |
| Otras | 3 | 67 | 4,48% |
| Guías | 1 | 222 | 0,45% |
| Glosario | 0 | 840 | 0% |
| Leyes | 0 | 194 | 0% |

#### Acumulado de snapshots disponibles W16–W25

| Superficie | Clics | Impresiones | Participación de clics |
|---|---:|---:|---:|
| Calculadoras | 333 | 37.441 | 89,3% |
| Posts | 20 | 8.253 | 5,4% |
| Otras | 7 | 222 | 1,9% |
| Leyes | 5 | 1.731 | 1,3% |
| Glosario | 4 | 2.638 | 1,1% |
| Guías | 4 | 968 | 1,1% |

### 4.4 Ganadores W25

| Página | Clics | Impresiones | CTR | Posición |
|---|---:|---:|---:|---:|
| `/calculadoras/seguro-cesantia/` | 64 | 807 | 7,93% | 7,45 |
| `/calculadoras/operacion-renta/` | 18 | 215 | 8,37% | 4,98 |
| `/calculadoras/prepago-credito/` | 13 | 195 | 6,67% | 6,44 |
| `/calculadoras/conversor-utm/` | 7 | 4.453 | 0,16% | 7,84 |
| `/calculadoras/credito-consumo/` | 6 | 310 | 1,94% | 7,54 |
| `/calculadoras/conversor-uf/` | 3 | 2.375 | 0,13% | 14,65 |
| `/calculadoras/comisiones-afp/` | 3 | 2.099 | 0,14% | 9,09 |

Fuente: `output/operations/data-signals/gsc/2026-W25-pages.json`.

### 4.5 Señal conductual disponible

El sitio emite eventos client-side:

- `calculator_start`;
- `calculator_complete` y `calculator_completed`;
- clicks de CTA;
- `next_best_step_shown` y `next_best_step_click`;
- scroll editorial;
- share, resume y acciones postresultado.

Sin embargo, `src/scripts/analytics.ts:24-31` solo inserta los eventos en
`window.dataLayer`. La decisión de `TD-0084` removió GA/GTM y documentó que los
eventos no se envían a terceros. Por tanto, la adquisición es observable, pero
completion, navegación y recurrencia no lo son.

El propio runbook pospuso `analytics-events.csv` hasta superar
aproximadamente 100 clics semanales. W25 llegó a 136; la condición de reapertura
ya se cumplió al menos una vez.

---

## 5. Hallazgos aceptados

### GROWTH-001 — Gestionar calculadoras como principal motor de crecimiento

- **Categoría:** dirección/producto
- **Evidencia:**
  - `output/operations/data-signals/gsc/2026-W25-pages.json:12-44`;
  - agregación W16–W25: 333/373 clics en calculadoras;
  - `src/config/calculatorPortfolio.ts:16-30` define JTBD, cuándo usar, límites y
    alternativas.
- **Impacto:** concentra recursos en la superficie con pull demostrado y mayor
  diferenciación frente a un blog financiero genérico.
- **Esfuerzo:** M por 3–5 journeys; L si se expande indiscriminadamente.
- **Riesgo:** MED; seguro de cesantía concentra 47% de los clics W25 y puede ser
  un pico.
- **Confianza:** HIGH.
- **Decisión:** aceptado como tesis principal, limitado inicialmente a
  `seguro-cesantia`, `operacion-renta`, `prepago-credito` y
  `credito-consumo`.

### GROWTH-002 — Cerrar la medición conductual antes de añadir producto

- **Categoría:** analytics/aprendizaje
- **Evidencia:**
  - `src/scripts/analytics.ts:24-31`;
  - `docs/TECH_DEBT_BACKLOG.md:273-293`;
  - `docs/operations/runbooks/weekly-search-performance-ritual.md:32-34`;
  - scorecards sin `analytics-events.csv`.
- **Impacto:** permite distinguir adquisición de utilidad y priorizar UX,
  retención o contenido con evidencia.
- **Esfuerzo:** M.
- **Riesgo:** MED por privacidad, seguridad y cambio de promesa pública.
- **Confianza:** HIGH.
- **Decisión:** aceptado como primer habilitador. La implementación debe ser
  first-party, agregada, sin PII, sin inputs ni identificadores persistentes.

### GROWTH-003 — Capturar demanda SEO existente antes de abrir más URLs

- **Categoría:** SEO
- **Evidencia:**
  - conversor UTM: 4.453 impresiones, posición 7,84;
  - comisiones AFP: 2.099 impresiones, posición 9,09;
  - conversor UF: 2.375 impresiones, posición 14,65;
  - `docs/backlog/README.md:14-20` ya recomienda striking distance.
- **Impacto:** puede elevar clics con cambios pequeños en assets existentes.
- **Esfuerzo:** S por experimento.
- **Riesgo:** MED; conversiones numéricas suelen resolverse sin click.
- **Confianza:** HIGH sobre existencia de oportunidad; MED sobre magnitud.
- **Decisión:** aceptado como apuesta secundaria. Los objetivos deben variar por
  intención; no imponer un CTR uniforme.

### GROWTH-004 — Usar contenido como soporte de tools ganadoras

- **Categoría:** editorial/autoridad
- **Evidencia:**
  - 53 artículos existentes;
  - 47/47 YMYL cumplen gate estricto;
  - solo 20 clics de posts en snapshots disponibles;
  - 2 huérfanos, sin enlaces rotos.
- **Impacto:** preserva autoridad y contexto regulatorio sin multiplicar
  mantenimiento.
- **Esfuerzo:** M por cluster.
- **Riesgo:** MED por refresh YMYL y canibalización.
- **Confianza:** HIGH.
- **Decisión:** aceptado. Nueva pieza solo si una query real muestra una
  subintención no resuelta y pasa ownership/intake.

### GROWTH-005 — Corregir contaminación de señales Cloudflare

- **Categoría:** datos/observabilidad
- **Evidencia:**
  - `scripts/data-signals/cloudflare-fetch.mjs:139-161` consulta RUM por cuenta,
    no por hostname;
  - W25 contiene `/llaveros/` y `/limpiezayaseo/`;
  - traffic reporta 9.696 pageviews y 28.315 requests sin distinguir humanos.
- **Impacto:** evita usar una audiencia inflada para producto o monetización.
- **Esfuerzo:** S–M.
- **Riesgo:** LOW; los números reportados pueden caer, pero ganan veracidad.
- **Confianza:** HIGH para contaminación de RUM; MED para su efecto sobre traffic.
- **Decisión:** aceptado como parte del primer ciclo.

### GROWTH-006 — Mantener GEO como disciplina de medición, no como build-out

- **Categoría:** GEO
- **Evidencia:**
  - `llms.txt`, `llms-full.txt`, schema FAQ/speakable y robots ya existen;
  - `docs/reports/AI-CITATION-TRACKING.md:64-66` no tiene primera corrida.
- **Impacto:** establece si la infraestructura actual produce citaciones antes de
  añadir más artefactos.
- **Esfuerzo:** S por corrida mensual.
- **Riesgo:** LOW.
- **Confianza:** HIGH sobre la falta de baseline; LOW sobre impacto potencial.
- **Decisión:** aceptado como apuesta secundaria de medición.

### GROWTH-007 — Tratar recurrencia como experimento sobre pilotos existentes

- **Categoría:** retención
- **Evidencia:**
  - Next Best Step aparece en 8/22 calculadoras;
  - escenarios en 7/22;
  - ResumeWidget y perfil local ya existen;
  - calendario e históricos se cerraron en el plan de oportunidades del
    2026-06-25.
- **Impacto:** puede elevar sesiones útiles y retorno sin cuentas.
- **Esfuerzo:** S para medir; L si se despliega a todo el portafolio.
- **Riesgo:** MED por complejidad y medición de retorno compatible con privacidad.
- **Confianza:** HIGH sobre capacidades; MED sobre demanda recurrente.
- **Decisión:** aceptado después del baseline; no rollout masivo anticipado.

### GROWTH-008 — Mantener donaciones como único test económico inmediato

- **Categoría:** monetización
- **Evidencia:**
  - `/apoyar/` integra Ko-fi;
  - `src/pages/acerca-de.astro:177-190` declara independencia y financiamiento
    directo;
  - la propuesta pública destaca ausencia de publicidad y registro.
- **Impacto:** permite aprender willingness-to-support sin comprometer neutralidad.
- **Esfuerzo:** S para medir clicks; L para revenue attribution completa.
- **Riesgo:** LOW con CTA no agresivo; HIGH para afiliación/ads.
- **Confianza:** HIGH.
- **Decisión:** aceptado para fase tardía, tras instrumentación.

### GROWTH-009 — Endurecer frescura visible en superficies con demanda

- **Categoría:** confianza/YMYL
- **Evidencia:**
  - `src/data/blog/utm-chile-que-es-como-funciona.md:51-52` responde “hoy” con
    valor de abril;
  - líneas 79–83 lo presentan como valor vigente de abril;
  - `volatileData` está configurado como `sync: reference`, por lo que no actualiza
    automáticamente el texto.
- **Impacto:** evita que un owner con 341 impresiones semanales degrade confianza.
- **Esfuerzo:** S–M, con pipeline editorial.
- **Riesgo:** HIGH si se amplifica contenido que parece actual; LOW para el fix.
- **Confianza:** HIGH.
- **Decisión:** aceptado como corrección previa a amplificación SEO.

### GROWTH-010 — No usar merchandising estático como verdad operativa

- **Categoría:** UX/descubribilidad
- **Evidencia:**
  - sueldo líquido está marcado “Más usada” en
    `src/config/calculatorPortfolio.ts:82-91`;
  - la home lo prioriza en `src/components/HeroHomepage.astro:14-33`;
  - W25: sueldo líquido 1 clic; seguro de cesantía 64.
- **Impacto:** la home puede distribuir atención según una jerarquía desactualizada.
- **Esfuerzo:** S.
- **Riesgo:** MED; una semana no basta para cambiar navegación estable.
- **Confianza:** MED.
- **Decisión:** observar dos semanas adicionales y cambiar solo si la señal
  persiste.

### GROWTH-011 — Eliminar señales derivadas de perfil del futuro collector

- **Categoría:** privacidad
- **Evidencia:** `src/scripts/next-best-step.ts:116-121` emite
  `profile_signal: suggestion.rationale`.
- **Impacto:** una futura transmisión convertiría una explicación derivada de
  inputs locales en dato enviado.
- **Esfuerzo:** S.
- **Riesgo:** HIGH si se transmite; LOW para removerlo.
- **Confianza:** HIGH.
- **Decisión:** requisito bloqueante antes de activar transporte de eventos.

### GROWTH-012 — No confundir infraestructura SEO/GEO con estrategia

- **Categoría:** priorización
- **Evidencia:** canonicals, sitemap, schema, robots, `llms.txt`, FAQ, breadcrumbs,
  Pagefind, RSS e IndexNow ya están presentes.
- **Impacto:** evita invertir otra vez en una base que ya es suficiente mientras
  faltan señales de comportamiento.
- **Esfuerzo:** no aplica.
- **Riesgo:** LOW.
- **Confianza:** HIGH.
- **Decisión:** no abrir un “SEO técnico general” sin defecto o métrica concreta.

---

## 6. Opciones evaluadas y matriz

Escala 1–5. En costo y riesgo, 5 significa barato o bajo riesgo.

Ponderación:

- impacto: 20%;
- probabilidad: 15%;
- defendibilidad: 15%;
- velocidad, costo, mantenibilidad, riesgo y aprendizaje: 10% cada uno.

| Opción | Impacto | Prob. | Velocidad | Costo | Defend. | Mant. | Riesgo | Aprendizaje | Total |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Sistema medible de calculadoras | 5 | 5 | 4 | 4 | 5 | 4 | 4 | 5 | **4,60** |
| SEO striking-distance | 4 | 5 | 5 | 5 | 3 | 5 | 5 | 4 | **4,40** |
| Nuevas tools/programmatic | 4 | 3 | 2 | 2 | 5 | 3 | 3 | 4 | **3,40** |
| GEO adicional | 2 | 2 | 3 | 4 | 3 | 4 | 5 | 3 | **3,05** |
| Retención/newsletter | 3 | 3 | 2 | 2 | 4 | 3 | 2 | 5 | **3,05** |
| Monetización comercial | 2 | 2 | 3 | 4 | 2 | 4 | 2 | 4 | **2,70** |
| Expansión editorial amplia | 3 | 3 | 2 | 2 | 3 | 2 | 2 | 3 | **2,60** |

---

## 7. Findings considerados y rechazados o diferidos

| Propuesta | Estado | Razón |
|---|---|---|
| Más SEO técnico general | Rechazada | La base ya está implementada; falta explotación y medición |
| Más artículos de forma transversal | Rechazada ahora | Dilución de autoridad y alto costo YMYL |
| Nueva ola de calculadoras | Diferida | Exigir demanda y gap no cubierto |
| Programmatic conversion pages UF/UTM | Diferida | Alto zero-click y carga de mantenimiento |
| Newsletter inmediata | Diferida | Proveedor, consentimiento y promesa editorial sin resolver |
| Push notifications | Diferida | Retención no validada y UX delicada |
| Ads | Rechazada | Rompe promesa y diferenciación |
| Afiliación/leads financieros | Rechazada ahora | Riesgo de conflicto de interés y regulación |
| Comparador bancario en vivo | HOLD | Neutralidad, datos volátiles y monetización sin resolver |
| Ahrefs Advanced+ | Diferida | GSC y first-party todavía no se explotan plenamente |
| Rollout de escenarios a todo el portafolio | Rechazado ahora | Pilotos no medidos |
| Añadir más schema/archivos GEO | Diferido | No existe baseline de citación |
| Cambiar home por una semana de datos | Rechazado | Requiere persistencia de señal |

---

## 8. Métricas canónicas

### 8.1 Accionables

| Métrica | Fórmula | Fuente futura | Cadencia |
|---|---|---|---|
| Clicks orgánicos por tool | GSC clicks rolling 4 semanas | GSC JSON | semanal |
| CTR por intención | clicks / impressions, segmentado por query | GSC query-page | semanal |
| Start rate | `calculator_start / calculator_view` | eventos agregados | semanal |
| Completion rate | `calculator_complete / calculator_start` | eventos agregados | semanal |
| Error rate | `calculator_error / calculator_start` | eventos agregados | semanal |
| Next-step CTR | `next_step_click / calculator_complete` | eventos agregados | semanal |
| Share rate | `share_click / calculator_complete` | eventos agregados | semanal |
| Scenario adoption | `scenario_save / calculator_complete` | eventos agregados | quincenal |
| Resume adoption | `resume_click / eligible_home_view` | eventos agregados | quincenal |
| Support intent | `support_page_click / calculator_complete` | eventos agregados | mensual |
| GEO citation rate | combinaciones citadas / 48 | checklist fijo | mensual |
| Editorial SLA | artículos dentro de cadencia / total | timeliness report | semanal |
| Salud técnica | LCP/CLS/INP p75 de rutas válidas | Cloudflare RUM | semanal |

### 8.2 Vanidosas o no aptas para decisión

- pageviews Cloudflare sin saneamiento;
- requests CDN;
- número de URLs, artículos o herramientas;
- impresiones UF/UTM sin click o uso;
- eventos absolutos sin denominador;
- “GEO ready” por mera existencia de `llms.txt`;
- sitemap submitted como proxy de indexación;
- likes, shares o menciones sin visitas o completions atribuibles.

---

## 9. Riesgos estratégicos

### 9.1 Privacidad y confianza

La home afirma “sin recolección de datos” y la política limita analytics a datos
agregados Cloudflare. Cualquier collector debe:

- excluir inputs, montos, texto libre, perfil, email, IP, user-agent y user ID;
- no usar cookies ni identificadores persistentes;
- agregar antes de exposición operativa siempre que la plataforma lo permita;
- documentarse en privacidad/cookies antes de activarse;
- permanecer deshabilitado hasta aprobación humana/legal.

### 9.2 YMYL

Los journeys no pueden convertir una salida de cálculo en consejo personalizado.
Next Best Step debe:

- ser orientativo;
- explicar la razón de la sugerencia;
- respetar límites declarados;
- enlazar fuentes oficiales cuando corresponda;
- pasar pipeline editorial si cambia copy sustantivo.

### 9.3 Concentración

Seguro de cesantía produjo casi la mitad de los clics de W25. El programa debe
trabajar con un portfolio pequeño, no depender de una única URL ni extrapolar un
pico.

### 9.4 Zero-click

Queries como `550 uf` o `20 utm` pueden resolverse en la SERP. El éxito de esas
páginas puede incluir marca, citación, enlaces o navegación directa, no solo CTR.

### 9.5 Frescura

Los valores volátiles visibles deben derivarse de snapshots o quedar claramente
etiquetados como ejemplos históricos. Un gate de metadata no garantiza que el
copy no parezca vigente.

### 9.6 Monetización

Donaciones transparentes son compatibles con la propuesta. Ads, afiliación,
leads y rankings comerciales requieren una nueva política y pueden afectar
independencia, ToS de Reddit y confianza.

---

## 10. Datos faltantes

1. `calculator_view`, `start`, `complete`, `error` y acciones postresultado.
2. Conversión real de Ko-fi.
3. Referrers saneados y distinción humano/bot.
4. Uso de escenarios, perfil, ResumeWidget y calendario.
5. Feedback cualitativo sin datos sensibles.
6. Backlinks y dominios referentes.
7. Primera y siguientes corridas GEO.
8. Datos posteriores al lanzamiento de bancos/fintech y migrantes.
9. Dos semanas adicionales para confirmar seguro de cesantía.
10. Comparaciones de cuatro semanas antes/después por experimento.

---

## 11. Regla de reinterpretación futura

Esta auditoría debe reabrirse si ocurre cualquiera:

- calculadoras dejan de aportar al menos 60% de los clics durante 8 semanas;
- otra superficie supera consistentemente a tools en clicks y engagement;
- completion rate de las tools prioritarias es menor a 25% tras corregir errores
  de medición;
- el collector no puede implementarse sin PII o identificadores persistentes;
- cambios regulatorios hacen inviable mantener las tools prioritarias;
- un canal no orgánico aporta más completions que SEO de forma sostenida;
- monetización directa demuestra demanda suficiente para cambiar el modelo.

Hasta entonces, la tesis se considera vigente, no permanente.

