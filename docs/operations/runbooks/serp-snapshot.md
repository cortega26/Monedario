# SERP Chile bajo demanda (`growth:collect:serp`)

Fecha de corte: 2026-11-25 · Estado: **experimento de 30 días** (arranca con la primera captura real)

## 1. Para qué sirve

GSC dice cuánto aparece y cuánto se hace clic, pero no qué hay en la página de resultados. Este colector captura el SERP de Google Chile (`google.cl`, `gl=cl`, `hl=es`) para una lista corta de consultas y responde:

- ¿La consulta con buena posición y CTR casi nulo está absorbida por un AI Overview, un cuadro de respuesta o un widget?
- ¿Quién ocupa el top 10? ¿Hay fuentes oficiales (SII, INE, Banco Central)?
- ¿Aparecemos citados en el AI Overview?
- ¿Qué preguntas relacionadas muestra Google?

Brecha que cubre: el `WebSearch` de `/seo sxo` es solo de EE. UU. y no devuelve funciones del SERP. Caso que lo motiva: `conversor-uf` tuvo 390.726 impresiones y 73 clics en 28 días (CTR 0,02 %, posición 10,2), y el experimento CTR A2 de `actualizador-inflacion` necesita contexto SERP antes de tocar nada.

## 2. Viabilidad (CRITERIO_VIABILIDAD.md)

| Factor | Evaluación |
|---|---|
| Acceso a datos | Público vía API con clave gratuita. SerpApi lista un plan Free de **250 búsquedas al mes** ([serpapi.com/pricing](https://serpapi.com/pricing), verificado 2026-11-25). El cupo es mensual, no diario. |
| Restricciones legales | Zona gris con los términos de Google. [Google demandó a SerpApi en dic-2025](https://www.theregister.com/2026/02/21/serpapi_google_scraping_lawsuit/); hubo desestimaciones parciales en 2026 y el caso sigue abierto (estado no confirmado). El plan gratuito no incluye el "Legal Shield". Solo se envían consultas públicas, sin datos de usuarios ni financieros. |
| Factibilidad técnica | Alta: un script Node sin dependencias, probado con respuestas simuladas. El esquema real del proveedor se valida con la primera captura. |
| Contexto de negocio | Cubre una pregunta concreta y acotada (zero-click en UTM, UF e IPC). El gasto es adaptativo y no se fuerza: lo limitante es el número de consultas valiosas (~40), no el cupo (250 por ciclo). |

**Veredicto:** viable como experimento acotado, de bajo costo y reversible. No es una dependencia de la que dependa un proceso: si el proveedor cae o cambia, se apaga sin impacto.

Alternativas descartadas (verificadas 2026-11-25):

- Google Custom Search JSON API: [cerrada a clientes nuevos desde 2026-01-20; se apaga el 2027-01-01](https://blog.apify.com/google-custom-search-api-alternative/). Tampoco devuelve el SERP real.
- Brave Search API: [eliminó el plan gratuito en feb-2026](https://www.implicator.ai/brave-drops-free-search-api-tier-puts-all-developers-on-metered-billing/) y usa su propio índice, no el de Google.
- Serper: 2.500 consultas gratis, pero las fuentes discrepan entre pago único y mensual. Confirmar en serper.dev antes de considerarlo como respaldo.

## 3. Configuración (una vez)

1. Crear cuenta gratuita en SerpApi y copiar la API key (humano).
2. Guardarla sin mostrarla en pantalla:

```bash
read -rs -p "SERPAPI_API_KEY: " K; echo; printf 'SERPAPI_API_KEY=%s\n' "$K" >> .env.local; unset K
```

`.env.local` está en `.gitignore`. La clave nunca se imprime ni se escribe en las salidas.

## 4. Estrategia de uso del cupo

El plan gratuito da **250 búsquedas por ciclo de facturación** (renueva el día 25) y lo no usado se pierde. La medición del 2026-11-25 mostró que el factor limitante no es el cupo sino cuántas consultas valen la pena: con 4 semanas de GSC (consultas con ≥ 200 impresiones y CTR ≤ 2 %) hay unas **27 candidatas** fuera de la lista, y las 10 primeras concentran el 87 % de los clics perdidos. Por eso el cupo se reparte así:

- **Corridas fijas: lunes y jueves**, los días en que corre `data-signals`. Cada captura queda junto a los datos de GSC recién actualizados, y comparar lunes con lunes y jueves con jueves quita la variación por día de la semana (la estacionalidad semanal se puede mirar en el historial; no está demostrada para este sitio).
- **Lote adaptativo.** El tamaño de cada corrida sale del saldo real del proveedor (menos una reserva de 30) repartido entre las corridas que quedan hasta el cierre. Si se salta una corrida, las siguientes crecen; lo que no se usa se acumula.
- **Selección por valor esperado.** Cada consulta recibe un puntaje: clics perdidos estimados (impresiones × brecha entre el CTR esperado para su posición y el propio) × volatilidad del SERP (según el historial) × antigüedad. Lo estable y de poco volumen pierde prioridad sin intervención.
- **Cierre del ciclo (el día anterior a la renovación, no el fin de mes calendario).** Se barre todo el cupo restante menos un margen de 5, porque al renovar ya no hace falta la reserva. El 2026-12-24 es el primer cierre.
- **Descubrimiento.** Hasta el 40 % del lote se destina a consultas de GSC no conocidas, elegidas por clics perdidos y sin variantes casi idénticas. Las descubiertas pasan a seguimiento (tier 2) y compiten por cupo con el resto.
- **Duplicados.** Las variantes que comparten 7-9 de 10 resultados con su representante van en tier 3 (cada 27 días).
- **Uso del excedente.** Si sobra cupo porque no quedan consultas valiosas, no se fuerza el gasto. Usos que sí aportan: repetir las consultas clave con `device` móvil (la mayor parte del tráfico) o con otra ubicación, para medir cuánto varía el SERP.

## 5. Uso

```bash
pnpm run growth:collect:serp -- --auto                  # plan de hoy: lote, consultas elegidas y saldo (no gasta)
pnpm run growth:collect:serp -- --auto --run            # corrida de lunes/jueves o de cierre
pnpm run growth:collect:serp -- --run --query "uf hoy"  # una consulta suelta
pnpm run growth:collect:serp -- --discover 10           # plan de un barrido manual
pnpm run growth:collect:serp -- --auto --run --any-day  # fuera de lunes y jueves
pnpm run growth:collect:serp -- --report                # reconstruye brief y archivo agregado sin llamar a la API
```

- `--auto --run` se niega a correr si hoy no es lunes, jueves ni día de cierre (usa `--any-day` para forzarlo).
- **Separación mínima por consulta:** tier 1 = 3 días, tier 2 = 9, tier 3 = 27 (`cadenceDays` en `src/config/serp-watchlist.json`).
- **Caché:** 2 días, siempre menor que la separación mínima, para que cada corrida vea datos nuevos. Una consulta en caché no gasta cupo.
- **Tope:** el menor entre el tope propio (220 al mes), el saldo real del proveedor menos la reserva y el lote de la corrida. La consulta a la cuenta es gratuita.
- **Historial:** cada captura nueva agrega una línea a `output/external-intelligence/serp/history/<consulta>.jsonl` (funciones, nuestra posición, top 3). Alimenta el puntaje de las próximas corridas.
- **Errores:** ante 401/403 (clave) o 429 (límite) se detiene de inmediato.
- **CI:** se omite siempre (contrato de inteligencia externa: sin APIs externas desde CI).

## 6. Salidas (todas `internal-only`, gitignoreadas)

| Archivo (bajo `output/external-intelligence/`) | Contenido |
|---|---|
| `serp/brief-<semana>.md` | Tabla y detalle por consulta de la lista, legible para pasar a `/seo sxo` |
| `serp/discover-<semana>.md` | Mapa de cero clics de las consultas descubiertas: qué función del SERP manda en cada una |
| `<semana>.json` | `serpFeatures` (consulta, volumen y CTR propios de GSC en ventana de 28 días, funciones del SERP) y `freeSources: ["serpapi-google-cl"]` |
| `serp/normalized/<consulta>.json` | Última captura normalizada de cada consulta de la lista |
| `serp/discovered/<consulta>.json` | Última captura de cada consulta descubierta, con sus métricas de GSC |
| `serp/history/<consulta>.jsonl` | Una línea por captura: funciones, nuestra posición, top 3 |
| `serp/raw/` | Respuesta cruda para la caché (nunca se commitea) |
| `serp/ledger.json` | Libro de búsquedas gastadas por mes y tipo |

## 7. Cómo se aprovecha

- **Growth Engine:** `growth:detect` ya consume `serpFeatures`. El detector `serp_feature_risk` marca consultas con AI Overview, volumen ≥ 200 y CTR propio ≤ 2 % (observacional, nivel A0).
- **`/seo sxo`:** ejecutar el colector antes y pasar el brief como evidencia de SERP es-CL (el `WebSearch` del plugin no lo es).
- **Experimentos CTR:** el brief aporta el contexto SERP que pide la revisión de cuatro semanas antes de tocar title o meta. No autoriza cambios por sí solo.

## 8. Reglas

- Es un hallazgo heurístico: una captura es una muestra puntual y Google personaliza y cambia el SERP. No es una medición de ranking.
- No cambia contenido, títulos ni rutas. Texto YMYL pasa por el pipeline editorial; una URL nueva exige excepción del freeze.
- Si la lista crece, sube el gasto: cada consulta nueva cuesta 1 búsqueda por captura. Mantenerla corta.
- Los datos no entran en prompts de terceros ni en reportes públicos (`license: internal-only`).

## 9. Experimento de 30 días y criterio de salida

El reloj arrancó con la primera captura real (2026-11-25). La decisión cae en el cierre del primer ciclo (2026-12-24 o 25):

- **Mantener** si hay al menos un hallazgo accionable aceptado (por ejemplo, un AI Overview o widget que explique una brecha de CTR y cambie una decisión sobre una página dueña) y no se superó el tope.
- **Apagar** si el servicio fue inestable (errores repetidos), si hubo un cambio legal que afecte al proveedor, o si no apareció ningún hallazgo accionable.

Apagar = dejar de ejecutarlo; no hay nada que revertir en producción.

## 10. Mantenimiento

- Verificar precios y cupo del plan gratuito en serpapi.com/pricing al registrarse y cada trimestre; las condiciones de terceros cambian sin aviso.
- El esquema de respuesta (`organic_results`, `ai_overview`, `answer_box`, `related_questions`) se validó con capturas reales el 2026-11-25. Si un campo cambia, ajustar `normalizeSerp` en `scripts/collect-serp-snapshot.mjs`.
- Revisar el historial (`serp/history/`) tras 4 semanas: si una consulta nunca cambia, subirla de tier; si el SERP de una consulta cambia seguido, mantenerla en tier 1.
- Si SerpApi sale del juego, el colector queda intacto: basta cambiar `fetchSerp` y la normalización por otro proveedor.
