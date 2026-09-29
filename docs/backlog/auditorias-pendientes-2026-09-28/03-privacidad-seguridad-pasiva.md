# Auditoría adversarial de privacidad y seguridad externa pasiva — monedario.cl

Actúa como un **Privacy Engineer, Application Security Reviewer y Web Platform Engineer**.

Audita `https://monedario.cl` exclusivamente mediante técnicas **pasivas, no destructivas y seguras para producción**.

Objetivos:

1. verificar que datos introducidos por usuarios no se filtren inesperadamente;
2. validar promesas públicas de privacidad observables desde navegador;
3. detectar configuraciones web defensivas ausentes o débiles;
4. identificar exposición accidental de información;
5. producir fixes verificables.

No realices explotación, fuzzing agresivo, credential attacks, DoS, evasión, enumeración invasiva ni pruebas destructivas.

## 1. Inventario de superficies

Identifica:

- dominios/subdominios observables desde la página;
- scripts first-party;
- scripts third-party;
- analytics;
- fuentes;
- CDNs;
- APIs;
- formularios;
- calculadoras;
- cookies;
- localStorage/sessionStorage;
- service workers;
- manifests;
- sourcemaps referenciados públicamente;
- endpoints visibles en JS.

No intentes acceder a sistemas no públicos.

## 2. Auditoría de privacidad de calculadoras

Para cada calculadora relevante:

1. introduce valores canarios únicos;
2. usa la herramienta normalmente;
3. inspecciona Network;
4. inspecciona URLs y query strings;
5. inspecciona payloads;
6. inspecciona cookies;
7. inspecciona localStorage/sessionStorage;
8. inspecciona eventos analytics observables.

Usa canarios inusuales y fácilmente identificables.

Busca:

- valor exacto;
- valor sin separadores;
- URL encoding;
- JSON;
- transformaciones triviales;
- nombres de parámetros que revelen semántica financiera.

Determina si se transmiten:

- salarios;
- deudas;
- ingresos;
- saldos;
- resultados;
- montos;
- combinaciones que revelen información financiera.

## 3. Telemetría

Documenta:

- event name;
- endpoint;
- proveedor;
- parámetros;
- momento del envío;
- acción que lo dispara.

Pregunta:

> ¿La telemetría necesita realmente cada dato que recibe?

Distingue métricas agregadas, metadata operativa y contenido financiero del usuario.

## 4. Cookies y storage

Para cada cookie, cuando sea observable:

- nombre;
- dominio;
- propósito aparente;
- duración;
- Secure;
- HttpOnly si aplica;
- SameSite.

Para Web Storage:

- claves;
- tipo de dato;
- persistencia;
- sensibilidad;
- necesidad.

Busca datos financieros persistidos sin necesidad clara.

## 5. Headers defensivos

Inspecciona cuando corresponda:

- Content-Security-Policy;
- Strict-Transport-Security;
- X-Content-Type-Options;
- Referrer-Policy;
- Permissions-Policy;
- `frame-ancestors` o equivalente;
- cache headers.

No conviertas automáticamente la ausencia de un header en vulnerabilidad. Explica amenaza, exposición y relevancia concreta.

## 6. CSP

Si existe:

- valida sintaxis;
- fuentes demasiado amplias;
- `unsafe-inline`;
- `unsafe-eval`;
- comodines;
- third parties;
- report-only;
- rutas permitidas.

Si no existe, evalúa la exposición real y propone una estrategia gradual que no rompa producción.

## 7. TLS y transporte

Verifica:

- HTTPS;
- redirects;
- mixed content;
- recursos inseguros;
- certificado;
- HSTS;
- requests HTTP residuales.

No realices ataques criptográficos.

## 8. Exposición accidental

Busca únicamente mediante recursos públicos/referenciados:

- comentarios sensibles en HTML/JS;
- información de entorno innecesaria;
- endpoints internos expuestos;
- rutas de desarrollo;
- sourcemaps;
- stack traces;
- versiones;
- archivos de configuración accidentalmente enlazados;
- nombres de infraestructura.

No enumeres paths por fuerza bruta.

## 9. Third parties

Lista cada dependencia externa cargada en navegador.

Para cada una:

- qué recibe;
- cuándo;
- para qué parece utilizarse;
- impacto de privacidad;
- impacto de seguridad;
- qué ocurre si se bloquea.

Presta especial atención a terceros innecesarios durante tareas financieras.

## 10. Referrer leakage

Prueba enlaces externos desde páginas que puedan contener parámetros o estado y verifica:

- `Referrer-Policy`;
- contenido del `Referer`;
- si una URL puede transportar información sensible.

## 11. Cache e historial

Comprueba si datos introducidos aparecen en:

- URL;
- browser history;
- DOM;
- storage;
- caches visibles;
- requests.

Explica por qué un dato concreto sería sensible antes de escalarlo.

## 12. Severidad

- **P0:** exposición directa y material de datos financieros/sensibles a terceros o públicamente.
- **P1:** fuga consistente o configuración con exposición significativa.
- **P2:** debilidad real con impacto limitado o condiciones adicionales.
- **P3:** hardening/hygiene de bajo riesgo.

Estado: `CONFIRMED`, `PROBABLE`, `HYPOTHESIS`.

## 13. Entregable

### Executive summary

### Mapa de datos

`dato → origen → procesamiento → almacenamiento → destino`

### Inventario de terceros

### Findings

| ID | Severidad | Estado | Superficie | Problema | Evidencia | Riesgo | Causa probable | Fix | Verificación |
|---|---|---|---|---|---|---|---|---|---|

### Verificación de promesas públicas de privacidad

Para cada claim observable:

- claim;
- resultado;
- `PASS/FAIL/PARTIAL`;
- evidencia.

### Hardening recomendado

Separar:

- imprescindible;
- recomendable;
- defensa en profundidad.

### Regression checklist

Incluye canarios y comprobaciones que puedan automatizarse.

## 14. Reglas

- Producción es un entorno real: cero acciones destructivas.
- No intentes explotar.
- No envíes carga excesiva.
- No pruebes credenciales.
- No enumeres agresivamente.
- No confundas hardening con vulnerabilidad.
- Toda afirmación de fuga debe estar respaldada por tráfico observable.
- Prioriza privacidad financiera y exposición a terceros.

Pregunta final:

> **¿Puede información que un usuario razonablemente espera que permanezca local terminar transmitida, persistida o expuesta sin que lo sepa?**
