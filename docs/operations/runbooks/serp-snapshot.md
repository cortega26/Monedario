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
| Contexto de negocio | Cubre una pregunta concreta y acotada (zero-click en UTM, UF e IPC). Con 11 consultas y cadencia por tier gasta ~31 búsquedas al mes (12 % del plan). |

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

## 4. Uso

```bash
pnpm run growth:collect:serp                          # plan: qué toca y cuánto presupuesto queda (no gasta)
pnpm run growth:collect:serp -- --run                 # captura las consultas vencidas
pnpm run growth:collect:serp -- --run --query "uf hoy"   # una consulta suelta (cuenta contra el tope)
pnpm run growth:collect:serp -- --run --force         # ignora cadencia y caché (gasta cupo)
pnpm run growth:collect:serp -- --report              # reconstruye brief y archivo agregado sin llamar a la API
```

- **Cadencia:** tier 1 = semanal, tier 2 = mensual (`src/config/serp-watchlist.json`). Solo se capturan las consultas vencidas.
- **Caché:** 7 días por consulta y mercado. Una consulta en caché no gasta cupo.
- **Tope:** 60 búsquedas al mes (`SERP_MONTHLY_CAP`), nunca por encima del límite del plan (250). El script avisa al 80 % y se detiene al llegar al tope.
- **Errores:** ante 401/403 (clave) o 429 (límite) se detiene de inmediato.
- **CI:** se omite siempre (contrato de inteligencia externa: sin APIs externas desde CI).

## 5. Salidas (todas `internal-only`, gitignoreadas)

| Archivo | Contenido |
|---|---|
| `output/external-intelligence/serp/brief-<semana>.md` | Tabla y detalle por consulta, legible para pasar a `/seo sxo` |
| `output/external-intelligence/<semana>.json` | `serpFeatures` (consulta, volumen y CTR propios de GSC, funciones del SERP) y `freeSources: ["serpapi-google-cl"]` |
| `output/external-intelligence/serp/normalized/<consulta>.json` | Última captura normalizada por consulta |
| `output/external-intelligence/serp/raw/` | Respuesta cruda para la caché (nunca se commitea) |
| `output/external-intelligence/serp/ledger.json` | Libro de búsquedas gastadas por mes |

## 6. Cómo se aprovecha

- **Growth Engine:** `growth:detect` ya consume `serpFeatures`. El detector `serp_feature_risk` marca consultas con AI Overview, volumen ≥ 200 y CTR propio ≤ 2 % (observacional, nivel A0).
- **`/seo sxo`:** ejecutar el colector antes y pasar el brief como evidencia de SERP es-CL (el `WebSearch` del plugin no lo es).
- **Experimentos CTR:** el brief aporta el contexto SERP que pide la revisión de cuatro semanas antes de tocar title o meta. No autoriza cambios por sí solo.

## 7. Reglas

- Es un hallazgo heurístico: una captura es una muestra puntual y Google personaliza y cambia el SERP. No es una medición de ranking.
- No cambia contenido, títulos ni rutas. Texto YMYL pasa por el pipeline editorial; una URL nueva exige excepción del freeze.
- Si la lista crece, sube el gasto: cada consulta nueva cuesta 1 búsqueda por captura. Mantenerla corta.
- Los datos no entran en prompts de terceros ni en reportes públicos (`license: internal-only`).

## 8. Experimento de 30 días y criterio de salida

El reloj arranca con la primera captura real. A los 30 días se decide:

- **Mantener** si hay al menos un hallazgo accionable aceptado (por ejemplo, un AI Overview o widget que explique una brecha de CTR y cambie una decisión sobre una página dueña) y no se superó el tope.
- **Apagar** si el servicio fue inestable (errores repetidos), si hubo un cambio legal que afecte al proveedor, o si no apareció ningún hallazgo accionable.

Apagar = dejar de ejecutarlo; no hay nada que revertir en producción.

## 9. Mantenimiento

- Verificar precios y cupo del plan gratuito en serpapi.com/pricing al registrarse y cada trimestre; las condiciones de terceros cambian sin aviso.
- Primera captura real: revisar que el esquema de respuesta coincida (`organic_results`, `ai_overview`, `answer_box`, `related_questions`). Si un campo cambió, ajustar `normalizeSerp` en `scripts/collect-serp-snapshot.mjs`.
- Si SerpApi sale del juego, el colector queda intacto: basta cambiar `fetchSerp` y la normalización por otro proveedor.
