# Auditoría adversarial de resiliencia y performance observable — monedario.cl

Actúa como un **Senior Web Reliability Engineer, Frontend Performance Engineer y QA adversarial**.

Tu objetivo es descubrir cómo se degrada `https://monedario.cl` cuando el entorno deja de ser ideal.

No repitas una auditoría UX/UI general. Concéntrate en:

- robustez;
- dependencias;
- degradación graceful;
- errores de carga;
- performance observable;
- navegación;
- caché;
- redes lentas;
- bloqueo de recursos;
- estabilidad de layout;
- comportamiento de calculadoras bajo condiciones adversas.

## 1. Baseline

Antes de degradar nada registra, para varias páginas representativas:

- carga inicial;
- requests;
- peso transferido;
- número de recursos;
- JS;
- CSS;
- imágenes;
- fuentes;
- third parties;
- tiempos principales;
- Core Web Vitals disponibles;
- comportamiento normal de las calculadoras.

Incluye como mínimo:

- home;
- hub;
- artículo;
- calculadora simple;
- calculadora compleja.

## 2. Redes degradadas

Prueba, cuando las herramientas lo permitan:

- Fast 3G;
- Slow 3G;
- latencia elevada;
- bandwidth limitado.

Busca:

- contenido invisible demasiado tiempo;
- bloqueo de interacción;
- layout shifts;
- elementos que aparecen tarde;
- inputs inutilizables;
- botones que parecen no responder;
- doble acción por impaciencia;
- resultados tardíos sin feedback.

## 3. Recursos bloqueados

Bloquea individualmente, desde el cliente, categorías de recursos:

- analytics;
- fuentes externas;
- imágenes;
- scripts third-party;
- recursos no esenciales.

Pregunta:

> ¿Qué dependencia no esencial puede romper una función esencial?

Una calculadora, por ejemplo, no debería dejar de funcionar únicamente porque analytics no carga.

No ataques ni envíes tráfico anómalo a servicios externos.

## 4. JavaScript

Prueba:

- JS deshabilitado;
- JS que tarda en cargar;
- fallo simulado/local de un script externo cuando sea viable.

Clasifica:

- funcionalidad imposible sin JS pero explicada;
- degradación razonable;
- pantalla rota;
- contenido inaccesible;
- fallo silencioso.

No exijas que una calculadora compleja funcione sin JS si eso no es un requisito razonable.

## 5. Cookies y storage

Prueba:

- cookies bloqueadas;
- localStorage no disponible;
- sessionStorage no disponible.

Busca:

- excepciones;
- páginas que no cargan;
- loops;
- pérdida de funcionalidad no relacionada;
- estados corruptos.

## 6. Caché y navegación

Prueba:

- reload;
- hard reload;
- back;
- forward;
- nueva pestaña;
- restauración de pestaña;
- volver a una calculadora parcialmente completada.

Busca:

- estados incoherentes;
- resultados viejos;
- formularios corruptos;
- acciones duplicadas;
- navegación que restaura información incorrecta.

## 7. Interacción adversarial segura

Sin fuzzing agresivo, prueba:

- doble click;
- clicks rápidos;
- cambiar input inmediatamente antes de calcular;
- modificar opciones después del resultado;
- calcular repetidas veces;
- borrar campos durante interacción;
- Enter;
- navegación por teclado;
- copiar/pegar valores;
- valores largos.

Busca race conditions observables o estados imposibles.

## 8. Viewports y zoom

Prueba resiliencia técnica con:

- 320 px;
- 360–390 px;
- tablet;
- desktop;
- zoom 200%;
- zoom 400% cuando sea razonable.

Busca:

- overflow que impida operar;
- controles fuera de pantalla;
- contenido imposible de alcanzar;
- elementos fixed que bloqueen acciones.

No repitas findings puramente estéticos ya cubiertos por UX/UI.

## 9. Performance

Mide de forma comparativa:

- LCP;
- CLS;
- INP o señales equivalentes;
- TTFB;
- recursos render-blocking;
- peso JS;
- peso/imágenes;
- fuentes;
- overhead de terceros.

Distingue entre:

- laboratorio;
- observación local;
- field data público, si existe.

No presentes Lighthouse como verdad absoluta ni conviertas diferencias mínimas en findings importantes.

## 10. Layout stability

Busca shifts tardíos causados por:

- fuentes;
- imágenes sin dimensiones;
- widgets;
- banners;
- contenido dinámico;
- resultados de calculadoras.

Determina si pueden producir:

- click accidental;
- pérdida de contexto;
- dificultad de lectura;
- desplazamiento del control que el usuario estaba usando.

## 11. Failure surfaces

Busca:

- 404;
- 5xx visibles;
- soft 404;
- assets ausentes;
- imágenes rotas;
- fallos de fetch;
- errores JS;
- errores de consola relevantes;
- retries infinitos;
- spinners eternos.

## 12. Dependencias críticas

Construye un mapa:

`función → recurso/dependencia`

Ejemplo conceptual:

`calcular → bundle JS first-party`

Detecta funciones esenciales que dependan accidentalmente de:

- analytics;
- CDN externo;
- fuente;
- widget;
- recurso decorativo;
- third party.

## 13. Severidad

- **P0:** tarea principal inutilizable en condiciones razonables o fallo que produce resultado incorrecto.
- **P1:** degradación severa ante una condición común.
- **P2:** degradación real pero recuperable.
- **P3:** optimización o robustez adicional.

Estado: `CONFIRMED`, `PROBABLE`, `HYPOTHESIS`.

## 14. Entregable

### Executive summary

### Matriz de escenarios

| Escenario | Home | Hub | Artículo | Calculadora simple | Calculadora compleja |
|---|---|---|---|---|---|

Estados: `PASS`, `DEGRADED`, `FAIL`.

### Findings

| ID | Severidad | Estado | Escenario | URL/componente | Problema | Evidencia | Causa probable | Fix | Regression test |
|---|---|---|---|---|---|---|---|---|---|

### Performance baseline

### Dependencias críticas

### Failure-mode analysis

### Quick wins

### Mejoras estructurales

### Regression suite

Convierte los fallos relevantes en pruebas reproducibles y automatizables siempre que sea posible.

## 15. Reglas

- No confundas “más rápido sería mejor” con un defecto.
- No infles pequeñas diferencias de métricas.
- Busca fallos que cambien funcionalidad o experiencia.
- No repitas problemas puramente visuales cubiertos por UX/UI.
- Simula fallos de forma segura desde el cliente.
- No ataques servicios externos.
- Prioriza dependencias innecesarias y fallos silenciosos.

Pregunta final:

> **¿Qué condición razonablemente común puede degradar o romper Monedario, y qué dependencia convierte ese fallo en algo evitable?**
