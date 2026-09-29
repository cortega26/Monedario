# Auditoría adversarial de privacidad y seguridad externa pasiva — monedario.cl

Fecha de recepción: 2026-09-29
Brief: `docs/backlog/auditorias-pendientes-2026-09-28/03-privacidad-seguridad-pasiva.md`
Método: pruebas exclusivamente pasivas y seguras, con canarios para verificar
si salarios, deudas, saldos o resultados abandonan el navegador; sin fuzzing,
explotación ni enumeración de rutas.

## Executive summary

El resultado es **considerablemente mejor que el de la auditoría SEO y que el
de correctness/YMYL**.

No encontré ningún P0 ni P1 de privacidad. En las cuatro calculadoras que
sometí a valores canario, **no observé transmisión de los inputs financieros ni
de sus resultados a terceros, a parámetros de URL, a requests de red o a
storage persistente** durante el uso normal:

| Calculadora | Canario | Resultado |
|---|---:|---|
| Sueldo líquido | `7319421` | **LOCAL_ONLY** |
| Crédito consumo | `8627139` | **LOCAL_ONLY** |
| Renegociación SuperIR | `5942681` | **LOCAL_ONLY** |
| Jubilación | `4173829` | **LOCAL_ONLY** |

Esto es particularmente importante porque Monedario afirma públicamente que la
telemetría propia **no transmite sueldo, deuda, pensión, AFP, monto, impuesto
ni resultados financieros**. En las cuatro pruebas adversariales esa promesa se
sostuvo.

Tampoco observé:

- cookies publicitarias;
- identificadores persistentes;
- hosts de advertising;
- Google Analytics/Tag Manager;
- fuentes externas;
- mixed content HTTP;
- sourcemaps explícitamente referenciados;
- requests a APIs externas durante el cálculo;
- valores financieros introducidos en query strings;
- exposición del canario al browser history vía URL.

El hallazgo más interesante es, de hecho, de signo contrario: **la producción
observada transmite incluso menos telemetría de la que las políticas
describen**. La política dice que Cloudflare Web Analytics está activo y que un
endpoint propio recibe eventos categóricos de calculadoras, pero durante la
navegación y cuatro cálculos completos **no observé ningún evento analytics**.
Esto no es una fuga de privacidad; es una posible divergencia
documentación/runtime o un problema de observabilidad/instrumentación que
conviene investigar.

La limitación principal de esta auditoría es que el navegador de inspección no
expuso los response headers HTTP. Por ello **no voy a certificar ni rechazar**
los claims públicos de HSTS, CSP, `Referrer-Policy`, `Permissions-Policy`, etc.
La política afirma expresamente que existen HSTS, security headers y CSP, pero
esa afirmación quedó **UNVERIFIED**, no FAIL.

---

# Mapa de datos

## Uso ordinario de calculadoras observado

```text
dato financiero introducido
        ↓
input DOM
        ↓
JavaScript cliente
        ↓
cálculo local
        ↓
resultado DOM
        │
        ├──X── URL/query string
        ├──X── request de red observado
        ├──X── third party observado
        └──X── storage persistente observado
```

La propiedad más relevante del diseño actual es que **el dato financiero no
necesita abandonar el dispositivo para realizar el cálculo**.

Eso reduce radicalmente la superficie de privacidad.

## Datos técnicos declarados

La política describe separadamente:

```text
page view / datos técnicos
        ↓
Cloudflare Web Analytics
        ↓
métricas agregadas
```

y:

```text
acción sobre calculadora
        ↓
evento categórico
        ↓
Cloudflare Worker de Monedario
        ↓
contador agregado
```

La documentación declara expresamente que el segundo flujo no incluye inputs
ni resultados financieros, texto libre, RUT, email, nombre, teléfono, cookies,
sesión, fingerprint o user ID.

**Ese flujo analytics no apareció en las sesiones instrumentadas**, por lo que
pude verificar la ausencia de fuga pero no validar la estructura concreta del
payload descrito.

---

# Pruebas con canarios

## 1. Sueldo líquido

Entrada:

```text
Sueldo bruto: 7.319.421
Contrato: indefinido
Salud: Fonasa
AFP: Habitat
```

Resultado calculado aproximadamente:

```text
Líquido: $5.877.996
```

Observaciones:

- `7319421` no apareció en requests observables.
- No apareció en URL.
- No apareció en query params.
- No apareció en localStorage/sessionStorage durante el cálculo normal.
- No apareció en ningún host de terceros.
- No se observaron eventos analytics asociados.

**Resultado: PASS — LOCAL_ONLY.**

Esto satisface directamente uno de los objetivos centrales del archivo:
comprobar si salario/monto/resultado acaba transmitido inesperadamente.

---

## 2. Crédito de consumo

Entrada:

```text
Monto: $8.627.139
Plazo: 37 meses
Tasa: 1,73% mensual
```

El valor existe obviamente en el DOM porque el usuario lo introdujo.

Pero:

```text
8627139 ∉ URL
8627139 ∉ requests observados
8627139 ∉ third-party traffic
8627139 ∉ storage observado
```

**Resultado: PASS — LOCAL_ONLY.**

Para este tipo de página, esto es particularmente valioso: un monto de crédito
real puede revelar información financiera sensible aunque no sea jurídicamente
una categoría especial de datos.

---

## 3. Simulador de renegociación

Canario principal:

```text
Deuda: $5.942.681
```

Se completó un escenario válido hasta obtener diagnóstico.

No apareció el monto en:

- URL;
- query string;
- requests observables;
- terceros;
- storage observado.

**Resultado: PASS — LOCAL_ONLY.**

Es probablemente la prueba más importante del conjunto desde privacidad: una
deuda individual tiene mayor expectativa razonable de confidencialidad que, por
ejemplo, convertir UF.

---

## 4. Simulador de jubilación

Canario:

```text
Saldo AFP: $4.173.829
```

Se generó la proyección normalmente.

No apareció el saldo en:

- URL;
- requests;
- terceros;
- storage observado.

**Resultado: PASS — LOCAL_ONLY.**

---

# Inventario de terceros observado

En las páginas y flujos de calculadoras auditados:

| Host | Tipo | Observado |
|---|---|---|
| `monedario.cl` | first-party | Sí |
| Advertising networks | terceros | **No** |
| Google Analytics/GTM | terceros | **No** |
| Google Fonts | terceros | **No** |
| otros CDNs JS | terceros | **No** |
| APIs financieras client-side | terceros | **No** |

Esto es coherente con otra decisión arquitectónica observable: los indicadores
se preparan aguas arriba y las páginas consumen snapshots, en vez de llamar a
APIs externas desde el navegador del usuario. La página "Cómo usamos los datos"
describe precisamente un Worker que actualiza el snapshot y páginas/calculadoras
que lo consumen posteriormente.

En términos de privacidad eso es mejor que:

```text
usuario
 → calculadora
 → mindicador.cl / API externa
```

porque la IP y el contexto de navegación del usuario no necesitan llegar al
proveedor de datos.

---

# Cookies y Web Storage

La política distingue correctamente cookies de `localStorage`/`sessionStorage`
y afirma que estos últimos se utilizan para preferencias, páginas recientes y
continuidad de calculadoras, manteniéndose en el navegador.

### Observación inicial

En una carga limpia:

```text
cookies observadas:        0
localStorage observado:    vacío
sessionStorage observado:  vacío
```

No apareció un identificador de sesión o tracking.

Eso es consistente con las afirmaciones:

- sin cuentas;
- sin registro;
- sin cookies publicitarias;
- sin identificadores analytics persistentes.

### "Guardar escenario"

Hice además una prueba explícita con el botón **Guardar escenario** de Sueldo
Líquido.

No se produjo ningún request que contuviera el canario financiero.

La inspección automatizada tampoco recuperó posteriormente una entrada en
`localStorage`/`sessionStorage`, pero **no considero esto prueba de que no
exista persistencia local**, porque esa sesión terminó con una limitación del
entorno del navegador y la propia interfaz declara explícitamente que los
escenarios guardados permanecen "solo en este navegador".

Por ello:

**Privacidad del save:** PASS respecto de transmisión.
**Mecanismo/persistencia concreta:** INCONCLUSIVE.

No voy a transformar una limitación del instrumento en un finding contra el
sitio.

---

# Telemetría

Aquí apareció la única anomalía sistémica interesante.

La política pública dice que hay dos capas:

1. **Cloudflare Web Analytics**;
2. endpoint propio de eventos de calculadoras.

Sin embargo, en:

- carga de home;
- cálculo de sueldo;
- cálculo de crédito;
- cálculo SuperIR;
- cálculo jubilación;

la inspección no registró **ninguna request analytics**.

Por tanto existen varias explicaciones posibles:

```text
A. instrumentación actualmente desactivada
B. environment/browser excluido
C. eventos enviados por mecanismo no expuesto por el inspector
D. política adelantada respecto del deployment
E. fallo real de analytics
```

No tengo evidencia suficiente para escoger una.

Lo importante para esta auditoría:

> No encontré un caso en que la telemetría estuviera recibiendo "demasiado".
> Encontré un caso en que no pude observar que estuviera recibiendo nada.

---

# Findings

| ID | Severidad | Estado | Superficie | Problema | Evidencia | Riesgo | Causa probable | Fix | Verificación |
|---|---|---|---|---|---|---|---|---|---|
| PRIV-01 | **P3** | **PROBABLE** | Analytics/documentación | La política describe Cloudflare Web Analytics + endpoint propio, pero ninguno fue observable durante home + 4 cálculos | 0 eventos analytics y 0 hosts analytics registrados durante las sesiones; política dice que ambos existen | Principalmente integridad/observabilidad, no pérdida de privacidad. Podrías estar tomando decisiones con métricas incompletas o documentando un tratamiento que no está activo | instrumentación deshabilitada, filtro del entorno, regression o drift documentación/deploy | verificar directamente en DevTools/Cloudflare si llegan `calc_start`, `calc_complete`, etc.; mantener policy generada desde config | test E2E captura 1 evento esperado y valida allowlist estricta del payload |
| PRIV-02 | **P3** | **HYPOTHESIS** | Storage de escenarios | El comportamiento documentado de "Guardar escenario" no pudo verificarse como persistencia en `localStorage/sessionStorage` | El save no generó red —bien—, pero el inspector tampoco encontró entrada persistida y terminó con limitación de entorno | No es fuga. Riesgo funcional/documental únicamente | IndexedDB/otro estado local, save no ejecutado realmente o limitación del inspector | test unit/E2E específico del storage | guardar → recargar → escenario reaparece; ninguna red; key/TTL documentados |
| PRIV-03 | — | **UNVERIFIED** | HTTP headers | La política afirma HSTS + security headers + CSP, pero esta auditoría no pudo capturar los headers HTTP de respuesta | claim público explícito; herramienta de browser no expuso headers | No es legítimo asignar severidad sin comprobar configuración real | limitación de instrumento, no del sitio | comprobar con `curl -I`/DevTools/CDN config desde entorno con acceso | snapshot CI de headers de producción |

Importante: **PRIV-03 no es un P3**. Es una cobertura pendiente, no una
vulnerabilidad.

---

# Promesas públicas de privacidad

| Claim | Resultado | Evidencia |
|---|---|---|
| No requiere cuenta/registro | **PASS** | navegación y calculadoras funcionan sin identidad; política lo declara explícitamente. |
| Los cálculos no requieren enviar datos financieros | **PASS en 4/4 probadas** | cuatro canarios permanecieron locales |
| Analytics propio no envía inputs financieros | **PASS respecto de ausencia de fuga / PARTIAL respecto del endpoint** | no apareció ningún canario en red; el endpoint analytics tampoco fue observable |
| No usa cookies publicitarias | **PASS en superficies auditadas** | cero cookies/tracking publicitario observado; política declara lo mismo. |
| No usa identificadores persistentes analytics | **PASS en superficies auditadas** | ninguno observado |
| Estado local no se envía al servidor | **PASS para inputs canario observados** | cero requests con canarios |
| Ko-fi solo interviene al aportar/interactuar | **NO VERIFICADO suficientemente** | la sesión adicional quedó limitada antes de producir evidencia fiable |
| HTTPS | **PASS** | toda navegación y recursos observados fueron HTTPS; 0 mixed content |
| HSTS | **UNVERIFIED** | requiere inspección HTTP headers |
| CSP | **UNVERIFIED** | idem |
| Security headers | **UNVERIFIED** | idem |

---

# Exposición accidental

No observé durante las superficies revisadas:

- stack traces;
- rutas locales de filesystem;
- credenciales;
- tokens;
- secretos;
- config privada;
- API keys;
- nombres de hosts internos;
- endpoints administrativos;
- sourcemaps referenciados;
- requests HTTP;
- errores verbose de backend.

No realicé búsquedas de:

```text
/.env
/.git/
/admin
/config
/backups
```

ni similares, porque la especificación prohíbe expresamente enumeración de paths
por fuerza bruta y limita esta sección a recursos públicos o referenciados.

---

# Referrer leakage

No encontré estados financieros codificados en URL durante ninguna de las
cuatro pruebas:

```text
?salary=...
?debt=...
?balance=...
#result=...
```

Por tanto, incluso antes de considerar `Referrer-Policy`, el riesgo más
peligroso está eliminado por diseño:

> **el secreto no está en la URL.**

Eso evita fugas potenciales a:

- browser history;
- logs;
- screenshots;
- bookmarks;
- clipboard;
- `Referer`;
- herramientas de analytics.

La configuración exacta de `Referrer-Policy` queda pendiente junto a los demás
headers.

---

# CSP y headers defensivos

La política pública afirma:

> HTTPS + HSTS + encabezados de seguridad + Content Security Policy.

Pero no pude recuperar los headers mediante el navegador instrumentado y el
entorno de shell de esta sesión no dispone de resolución DNS externa directa.

Por tanto, no voy a escribir cosas como:

> "CSP ausente — P1"

o:

> "HSTS correctamente configurado — PASS"

sin evidencia.

Esto es precisamente lo que exigía la especificación: **no confundir hardening
con vulnerabilidad y respaldar cualquier afirmación con observación real.**

Sí dejaría como inspección manual inmediata estos valores:

```http
Strict-Transport-Security:
Content-Security-Policy:
X-Content-Type-Options:
Referrer-Policy:
Permissions-Policy:
Cache-Control:
```

y especialmente:

```http
frame-ancestors
object-src
base-uri
form-action
connect-src
script-src
```

por ser un sitio donde el código cliente procesa información financiera.

---

# Hardening recomendado

## Imprescindible

No tengo un fix de emergencia de privacidad. **No encontré una exposición
material que requiera apagar nada.**

Lo único que pondría como gate imprescindible es preservar la propiedad
actualmente observada:

```text
financial_input ∩ outbound_request_payload = ∅
financial_result ∩ outbound_request_payload = ∅
```

Ese debe convertirse en un **invariante**, no permanecer como una buena
intención.

## Recomendable

### 1. Payload allowlist de analytics

No construir eventos de esta forma:

```js
sendEvent("calc_complete", formState)
```

y luego eliminar cosas.

Construirlos positivamente:

```js
sendEvent({
  event: "calc_complete",
  calculator: "salary",
  variant: "gross_to_net",
  app_version
})
```

Es decir:

> allowlist, no denylist.

### 2. Canary regression tests

Por ejemplo:

```text
salary     = 7319421
debt       = 8627139
pension    = 4173829
tax        = 6831527
```

Tras cada E2E:

```text
assert canary not in URL
assert canary not in fetch payloads
assert canary not in beacon payloads
assert canary not in analytics payloads
assert canary not in cookies
assert canary not in accidental logs
```

### 3. Contract test para analytics

Además de comprobar **qué no sale**, comprobar que lo permitido sí funciona:

```text
calc_complete
calculator_id
categorical_dimension
app_version
```

La ausencia total de analytics durante esta auditoría justifica ese test.

### 4. Test explícito de headers en producción

Algo mínimo:

```text
GET /
GET /calculadoras/sueldo-liquido/
```

y assertions sobre los headers decididos como política.

---

# Defensa en profundidad

Un CSP apropiado tiene especial valor aquí no porque haya evidencia de XSS,
sino porque el navegador contiene temporalmente:

- sueldo;
- deuda;
- saldo AFP;
- ingresos;
- resultados financieros.

Una futura XSS tendría acceso al DOM y podría exfiltrar esos datos incluso
aunque hoy los cálculos sean 100% locales.

Por eso la privacidad actual depende de dos propiedades diferentes:

```text
1. aplicación no envía datos
2. código no autorizado tampoco puede enviarlos
```

El punto 1 quedó bastante bien demostrado.

El punto 2 depende en parte de CSP y otros controles y **no quedó verificado en
esta sesión**.

---

# Regression checklist

La convertiría prácticamente de forma literal en CI/E2E:

```text
PRIV-001  Canario de sueldo nunca aparece en requests.
PRIV-002  Canario de deuda nunca aparece en requests.
PRIV-003  Canario de saldo AFP nunca aparece en requests.
PRIV-004  Resultado calculado nunca aparece en analytics.
PRIV-005  Ningún input financiero puede aparecer en URL/search/hash.
PRIV-006  Analytics acepta solo claves allowlisted.
PRIV-007  Analytics rechaza claves desconocidas.
PRIV-008  Analytics rechaza números financieros arbitrarios.
PRIV-009  Analytics no incluye texto libre.
PRIV-010  Analytics no genera user/session ID.
PRIV-011  Cookies analytics/publicidad = 0.
PRIV-012  Saved scenarios generan 0 requests de red.
PRIV-013  Saved scenarios sobreviven reload solo localmente si esa es la intención.
PRIV-014  No third-party origin carga durante calculator interaction.
PRIV-015  No HTTP/mixed-content resources.
PRIV-016  No sourcemap público referenciado en production bundles salvo decisión explícita.
PRIV-017  Headers defensivos cumplen contrato.
PRIV-018  CSP connect-src coincide con allowlist real.
PRIV-019  External link desde calculadora nunca puede transportar estado financiero en Referer.
PRIV-020  Random financial canary scan de Network después de cada release.
```

Y añadiría un test metamórfico especialmente poderoso:

```text
ejecutar exactamente la misma calculadora
con 20 montos aleatorios diferentes
```

El tráfico externo debería ser idéntico salvo categorías explícitamente
permitidas.

Si cambia el payload cuando cambia el sueldo/deuda/saldo, el test falla.

---

# Respuesta final

> **¿Puede información que un usuario razonablemente espera que permanezca
> local terminar transmitida, persistida o expuesta sin que lo sepa?**

**No encontré evidencia de que eso esté ocurriendo en los flujos auditados.**

En cuatro calculadoras materialmente sensibles —sueldo, crédito,
deuda/renegociación y jubilación— los canarios financieros **permanecieron
locales**. No llegaron a URLs, terceros, requests observables ni almacenamiento
persistente observado durante el cálculo.

Y hay una diferencia importante respecto de una conclusión simplemente "no
vimos nada":

> introdujimos cantidades únicas que habrían sido extremadamente fáciles de
> reconocer si se hubieran filtrado.

No aparecieron.

Por eso, dentro de la cobertura realizada, la arquitectura de privacidad de las
calculadoras merece un **PASS fuerte**.

La mayor incógnita no es una fuga: es verificar dos contratos operacionales que
hoy dependen de documentación más que de evidencia obtenida aquí:

1. que la telemetría agregada descrita realmente esté funcionando y exactamente
   con el schema declarado;
2. que HSTS/CSP y demás headers sean efectivamente los prometidos en
   producción.

Si solucionara una sola cosa después de esta auditoría, no cambiaría la
arquitectura: **convertiría las propiedades de privacidad que acabamos de
comprobar manualmente en invariantes automáticos de CI**. Así una futura
modificación en analytics, una nueva librería o una calculadora nueva no podrá
degradar silenciosamente una propiedad que hoy está funcionando muy bien.

---

## Verificación en repo y producción (agente, 2026-09-29)

- **PRIV-03 → RESUELTO con evidencia live** (`curl -sI https://monedario.cl/` y
  `/calculadoras/sueldo-liquido/`): `Strict-Transport-Security: max-age=31536000;
  includeSubDomains; preload`, `Content-Security-Policy` con hashes
  `sha256-…` + `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`,
  `connect-src 'self' https://static.cloudflareinsights.com
  https://api.web3forms.com`; `Referrer-Policy: strict-origin-when-cross-origin`;
  `Permissions-Policy` restrictiva; `X-Content-Type-Options: nosniff`;
  `X-Frame-Options: DENY`. Codificado en `scripts/check-headers-prod.mjs`
  (`pnpm run check:headers:prod`), verde en vivo.
- **PRIV-02 → RESUELTO**: `src/utils/calculatorScenarios.ts` persiste en
  `localStorage` con key `monedario_scenarios`, máximo 6 por calculadora, sin
  TTL. El E2E `tests/privacy/scenario-persistence.test.ts` verifica
  guardar → reload → reaparece con 0 requests con el monto.
- **PRIV-01 → RESUELTO (límite del inspector, no fallo del sitio)**:
  - Verificación en producción con navegador headless (2026-09-29):
    `POST https://monedario.cl/api/analytics/event` responde **202** con payload
    allowlisted (`{"event":"calculator_complete","params":{"page_type":
    "calculator","app_version":"5.5.1","calculator_id":"sueldo-liquido",
    "outcome":"success","mode":"bruto-a-liquido"}}`).
  - Beacon de Cloudflare Web Analytics presente
    (`static.cloudflareinsights.com`, 1 request) — único tercero observado.
  - Canarios financieros re-ejecutados contra producción: 4/4 LOCAL_ONLY
    (`tests/privacy/financial-canaries.test.ts`).
  - La ausencia de eventos del informe corresponde a una limitación del
    instrumento (explicaciones B/C del propio informe), no a instrumentación
    caída ni a drift de deploy.
