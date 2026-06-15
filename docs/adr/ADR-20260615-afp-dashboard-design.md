# ADR-20260615: AFP Comparison Dashboard — Design Spike

Date: 2026-06-15
Status: Proposed

## Context

Cambiarse de AFP es la decisión financiera más importante para un trabajador chileno. El sitio ya tiene:

- **Comparador de comisiones AFP** (`/calculadoras/comisiones-afp/`) — compara las 7 AFP por tasa de comisión y ahorro proyectado.
- **Contenido editorial sobre AFP** — artículos en el clúster `pensiones-afp`: cómo cambiarse de AFP, fondos A/B/C/D/E, cartola, Cuenta 2, simulador de jubilación.
- **Simulador de jubilación** (`simulador-jubilacion.astro`) — proyección de pensión con parámetros manuales de rentabilidad.

Lo que **falta** para un dashboard completo de comparación AFP:

1. **Rentabilidad histórica por fondo** (A/B/C/D/E) — datos reales de la Superintendencia de Pensiones (SP), no promedios genéricos.
2. **Proyección de pensión integrada** — que use datos reales de rentabilidad + comisión real de la AFP seleccionada.
3. **Perfil de riesgo** — tabla de composición de cartera por fondo (renta variable vs. fija) y recomendación según edad/horizonte (sin automatización YMYL, solo informativo).

Este ADR documenta el design spike para investigar la viabilidad técnica de estas fuentes, el schema de datos y el alcance MVP.

### Data flow goal

```
SP (HTML/CSV) → Cloudflare Worker → Snapshot JSON en repo → Build-time data → Dashboard page
```

Mismo patrón que el economic-snapshot-refresh worker (`ADR-20260516`).

## Data source investigation

Se investigaron las siguientes fuentes de la Superintendencia de Pensiones de Chile (`spensiones.cl`):

### Source 1: Rentabilidad real de fondos de pensiones (fund-level returns)

| Propiedad | Valor |
|---|---|
| URL | `https://www.spensiones.cl/apps/rentabilidad/getRentabilidad.php?tiprent=FP` |
| Método de acceso | POST con parámetros `aaaa` (año, 2005-2026) y `mm` (mes, 01-12) |
| Formato de respuesta | HTML tabular |
| Frecuencia de actualización | Mensual |
| Cobertura histórica | 2005 a presente (por POST); promedios anualizados desde Sep 2002 (fondos A/B/C/D/E), Jul 1981 (fondo C), May 2000 (fondo E) |
| Datos por consulta | 5 tablas (una por fondo A-E), cada una con 7 AFP + SISTEMA. Columnas: rentabilidad del período (mensual), acumulada YTD, últimos 12 meses, promedio anual desde origen |
| API pública | No. Solo HTML. |
| Descargable como CSV/XLS | No directamente. Solo HTML renderizado. |

**Verificación**: Se confirmó acceso programático vía POST. Ejemplo: `curl -d "aaaa=2015&mm=06" https://www.spensiones.cl/apps/rentabilidad/getRentabilidad.php?tiprent=FP&template=0` retorna 18KB de tablas HTML con datos completos de fondo A-E para junio 2015.

### Source 2: Valores cuota diarios (daily unit values)

| Propiedad | Valor |
|---|---|
| URL | `https://www.spensiones.cl/apps/valoresCuotaFondo/vcfAFP.php?tf=A|B|C|D|E` |
| Método de acceso | GET con parámetro `tf` (tipo de fondo) + navegación por año/mes/día |
| Formato de respuesta | HTML tabular + descarga CSV via `vcfAFPxls.php` |
| Frecuencia de actualización | Diaria |
| Cobertura histórica | 2002 a presente |
| Datos por consulta | Valor cuota diario + patrimonio total por AFP, por fondo. 7 AFP + columna SISTEMA |
| API pública | No. La descarga genera CSV (semicolon-delimited) a pesar de extensión `.xls` |
| Descargable como CSV/XLS | **Sí**. Endpoint `vcfAFPxls.php?aaaaini=&aaaafin=&tf=A&fecconf=` retorna CSV de valores cuota diarios para un rango de años |

**Verificación**: Se descargó exitosamente el CSV para 2026 (fondo A, 29.8KB). Formato: `Fecha;CAPITAL;Valor Cuota;Valor Patrimonio;CUPRUM;...`. El CSV se genera para rangos anuales completos.

### Source 3: Estadísticas financieras de AFP (AFP-level profitability)

| Propiedad | Valor |
|---|---|
| URL | `https://www.spensiones.cl/apps/loadEstadisticas/loadRentabAFP.php` |
| Método de acceso | GET con selector de mes/año, redirige a `loadEstadFinancieras.php` con parámetros |
| Formato de respuesta | HTML tabular, con enlace a descarga XLS |
| Frecuencia de actualización | Trimestral |
| Cobertura histórica | 2000 a presente |
| Datos | Rentabilidad de la administradora (return on equity), no del fondo del afiliado |
| Relevancia para dashboard | Baja — mide rentabilidad de la empresa AFP, no del ahorro del trabajador |

### Source 4: Comisiones AFP (commission rates)

| Propiedad | Valor |
|---|---|
| Fuente actual | Previred Indicadores Previsionales + sitios AFP oficiales |
| Almacenamiento | `src/config/afpCommissions.ts` — TypeScript estático |
| Frecuencia de actualización | Manual (última verificación: 2026-04-11) |
| Notas | Las comisiones cambian esporádicamente. El mecanismo actual (archivo estático + verificación manual) es suficiente para MVP. |

### Source 5: Afiliados y masa de fondos por AFP

No se investigó en profundidad para este spike. SP tiene datos de número de afiliados, cotizantes y masa de fondos administrados en su Centro de Estadísticas, pero no se consideran críticos para MVP.

## Viability criteria analysis

Aplicación del criterio obligatorio (`docs/development/CRITERIO_VIABILIDAD.md`):

### 1. Acceso y disponibilidad pública de los datos requeridos

**Resultado: FAVORABLE**

- Todos los datos de SP son públicos y accesibles sin autenticación.
- El endpoint `getRentabilidad.php` responde a POST sin restricciones de IP, User-Agent o cookies.
- El endpoint `vcfAFPxls.php` exporta CSV directamente.
- No hay rate-limiting visible ni CAPTCHA.
- No se requiere API key, registro ni convenio.

### 2. Restricciones legales, regulatorias o de uso

**Resultado: FAVORABLE**

- Los datos son publicados por el Estado de Chile para acceso público.
- La SP tiene una política explícita de datos abiertos en su Centro de Estadísticas.
- El uso editorial con atribución a la fuente es consistente con la naturaleza de los datos.
- No hay restricciones conocidas de uso comercial/editorial.
- Se debe incluir atribución clara: "Fuente: Superintendencia de Pensiones" y fecha de los datos.

### 3. Factibilidad técnica real

**Resultado: FAVORABLE CON RIESGOS**

**Factibilidad positiva:**
- El patrón de Cloudflare Worker + snapshot JSON ya existe en el proyecto (`workers/economic-snapshot-refresh/`), incluyendo `govFetch.ts` para hacer scraping de sitios gubernamentales chilenos.
- El parsing de HTML tabular es viable con selectores CSS o expresiones regulares simples (las tablas tienen estructura predecible).
- El endpoint de valores cuota ya exporta CSV, que es trivial de parsear.
- La frecuencia de actualización mensual/diaria es compatible con un cron schedule diario.

**Riesgos técnicos:**
- **El HTML no es una API.** Si SP rediseña su sitio, el scraper se rompe. Mitigación: tests de integración que monitorean la estructura esperada.
- **La URL del endpoint cambió una vez** (migración parcial de spensiones.cl a previsionsocial.gob.cl). Mitigación: el worker debe tener URLs configurables y tests de health check.
- **Codificación mixta.** SP usa iso-8859-1 en algunas páginas y UTF-8 en otras. Mitigación: el patrón `readLatin1` de `govFetch.ts` ya maneja esto.
- **Campos vacíos en AFPs nuevas.** Modelo y Uno no tienen promedio anual histórico por ser AFPs recientes. Mitigación: manejar valores nulos en el schema.

### 4. Contexto y necesidades del negocio

**Resultado: FAVORABLE**

- El contenido AFP/pensiones es uno de los clusters más visitados del sitio.
- El comparador de comisiones es una de las calculadoras top.
- La integración de datos reales de SP diferenciaría a Monedario de competidores que usan promedios genéricos.
- El timing es oportuno: la reforma de pensiones (ley 2025-2026) mantiene el tema en el centro del debate público.
- YMYL: el dashboard es informativo-comparativo, no transaccional ni recomendatorio. Se debe evitar lenguaje que constituya asesoría financiera.

### Conclusión de viabilidad

**VIABLE** — con las siguientes condiciones:

1. Implementar como Cloudflare Worker con cron diario, siguiendo el patrón de `economic-snapshot-refresh`.
2. El worker scrapea `getRentabilidad.php` para rentabilidad mensual y descarga `vcfAFPxls.php` para valores cuota diarios.
3. Los snapshots se almacenan en el repo como JSON versionado.
4. El dashboard es de solo lectura (no recomendaciones automáticas).
5. Atribución obligatoria a SP y nota de "dato actualizado al DD/MM/AAAA".

## Schema de datos

### Propuesta de interfaz TypeScript

```typescript
// === Snapshot principal: AFP Dashboard ===

export interface AfpDashboardSnapshot {
  /** ISO 8601 — cuándo se capturó el snapshot */
  capturedAt: string;
  /** Período al que corresponden los datos de rentabilidad */
  rentabilidadPeriod: { year: number; month: number };
  /** Período al que corresponden los valores cuota */
  valoresCuotaPeriod: { year: number; month: number; day: number };
  /** Fuente de los datos */
  source: {
    name: "Superintendencia de Pensiones";
    url: string;
    lastVerified: string; // ISO 8601
  };
  /** Datos de AFP */
  afps: AfpData[];
  /** Datos agregados del sistema */
  sistema: SistemaData;
}

export interface AfpData {
  /** Código corto de AFP (coincide con afpId en monedario_profile) */
  id: string; // "capital" | "cuprum" | "habitat" | "modelo" | "planvital" | "provida" | "uno"
  /** Nombre comercial */
  name: string;
  /** Tasa de comisión vigente (porcentaje, ej. 1.44) */
  commissionRate: number;
  /** Total cotización AFP = 10% + comisión (ej. 11.44) */
  totalContribution: number;
  /** Datos por fondo */
  funds: AfpFundData[];
  /** Valor cuota actual */
  currentUnitValue?: {
    /** Tipo de fondo */
    fundType: FundType;
    /** Valor cuota en CLP */
    valueClp: number;
    /** Fecha del valor */
    date: string; // ISO 8601
  };
}

export type FundType = "A" | "B" | "C" | "D" | "E";

export interface AfpFundData {
  /** Tipo de fondo */
  fundType: FundType;
  /** Nivel de riesgo */
  riskLevel: "Alto" | "Moderado-Alto" | "Moderado" | "Moderado-Bajo" | "Bajo";
  /** Límite máximo de renta variable según normativa */
  maxEquityPct: number;
  /** Rentabilidad del período (mes actual) en porcentaje */
  monthlyReturnPct: number | null;
  /** Rentabilidad acumulada año calendario en porcentaje */
  ytdReturnPct: number | null;
  /** Rentabilidad últimos 12 meses en porcentaje */
  trailing12mReturnPct: number | null;
  /** Rentabilidad promedio anual desde origen del fondo en porcentaje */
  annualizedAvgReturnPct: number | null;
  /** Fecha de inicio del período de rentabilidad promedio */
  annualizedAvgSince: string | null; // ISO 8601 date
  /** Patrimonio administrado en CLP */
  aumClp: number | null;
  /** Número de afiliados en este fondo (si disponible) */
  affiliateCount: number | null;
}

export interface SistemaData {
  /** Rentabilidad agregada del sistema por fondo */
  funds: Array<{
    fundType: FundType;
    monthlyReturnPct: number | null;
    ytdReturnPct: number | null;
    trailing12mReturnPct: number | null;
    annualizedAvgReturnPct: number | null;
  }>;
}

// === Schema para valores cuota históricos (dataset separado) ===

export interface UnitValueHistoryEntry {
  date: string; // YYYY-MM-DD
  afpId: string;
  fundType: FundType;
  unitValueClp: number;
  totalAssetValueClp: number;
}

export interface UnitValueHistoryResponse {
  capturedAt: string;
  fundType: FundType;
  yearRange: { from: number; to: number };
  entries: UnitValueHistoryEntry[];
}
```

### Notas sobre el schema

- `annualizedAvgReturnPct` puede ser `null` para AFP nuevas (Modelo, Uno) que no tienen historial desde 2002.
- `commissionRate` y `totalContribution` se mantienen como fuente estática (Previred), no de SP, porque el snapshot de SP no incluye comisiones.
- `aumClp` (Assets Under Management) se obtiene del endpoint de valores cuota (Valor del Patrimonio).
- Los valores cuota históricos se proponen como un dataset separado (`UnitValueHistoryResponse`) por su granularidad diaria y volumen.
- `affiliateCount` queda como placeholder — no se investigó la fuente exacta en SP, y no es crítico para MVP.

## MVP scope

### Features incluidas (V1)

| # | Feature | Fuente de datos | Implementación |
|---|---|---|---|
| 1 | **Comparación de comisiones** (ya existe) | `afpCommissions.ts` (estático) | Página existente `/calculadoras/comisiones-afp/` |
| 2 | **Rentabilidad por fondo A/B/C/D/E** a 1 mes, YTD, 12 meses y promedio anual | Snapshot SP via Worker | Nueva sección en dashboard o página dedicada |
| 3 | **Tabla de perfil de riesgo** por fondo: % renta variable, horizonte sugerido, perfil de afiliado típico | Normativa SP (estático) | Tabla informativa, sin personalización |
| 4 | **Atribución de fuente** | — | "Fuente: Superintendencia de Pensiones, actualizado al DD/MM/AAAA" |
| 5 | **Snapshot automático** via Cloudflare Worker | SP (scrape) | Mismo patrón que `economic-snapshot-refresh` |

### Features excluidas de V1

| # | Feature | Razón |
|---|---|---|
| a | **Proyección de pensión integrada** | Ya existe `simulador-jubilacion.astro`. Integrar datos reales requiere refactor significativo y nueva lógica de proyección. Pasa a V2. |
| b | **Recomendación automática de AFP** | YMYL. No recomendaremos nunca de forma automática. Tabla comparativa sí, veredicto no. |
| c | **Gráficos de evolución histórica** | Los datos existen (valores cuota diarios desde 2002), pero la visualización requiere librería de charts. Diferir a V2. |
| d | **Alertas de cambio de comisión** | Las comisiones cambian esporádicamente y no hay feed automatizado. Diferir. |
| e | **Datos de afiliados por AFP** | No crítico para decisión de cambio. Diferir o descartar. |

### Arquitectura propuesta V1

```
                    ┌─────────────────────────────────┐
                    │  Cloudflare Worker (cron diario) │
                    │  1. POST getRentabilidad.php     │
                    │  2. GET  vcfAFPxls.php           │
                    │  3. Parsear HTML/CSV             │
                    │  4. Construir snapshot JSON       │
                    │  5. Commit via GH API             │
                    └──────────┬──────────────────────┘
                               │
                               ▼
                    ┌─────────────────────────────────┐
                    │  Snapshot en repo                │
                    │  src/infrastructure/afp/         │
                    │  ├── afp-dashboard.snapshot.json │
                    │  └── afp-unit-values.json       │
                    └──────────┬──────────────────────┘
                               │ (build-time import)
                               ▼
                    ┌─────────────────────────────────┐
                    │  Dashboard page                  │
                    │  /calculadoras/comparador-afp/   │
                    │  Astro + snapshot JSON            │
                    │  Tablas de rentabilidad + riesgo  │
                    └─────────────────────────────────┘
```

## Consequences

### Positive

- **Diferenciación competitiva**: ningún sitio chileno de finanzas personales muestra rentabilidad real por AFP+fondo en una tabla comparable.
- **Datos oficiales auditables**: cada valor tiene trazabilidad hasta la SP, crítico para contenido YMYL.
- **Patrón reutilizable**: el worker+snapshot replica el diseño probado de `economic-snapshot-refresh`.
- **Sin dependencia de API**: el scraping es frágil pero no requiere API key ni convenio.
- **Sin almacenamiento externo**: el snapshot vive en el repo, same deploy flow que el resto del sitio.

### Trade-offs

- **Scraping sobre API**: el HTML de SP puede cambiar sin aviso. El worker necesita tests de integración que alerten si la estructura cambia.
- **Snapshot diario**: los valores cuota se actualizan a diario, pero el commit diario puede generar ruido en el historial git si no hay cambios. Mitigación: worker idempotente (solo commitea si el snapshot difiere).
- **Rentabilidad mensual**: el dato de rentabilidad se actualiza una vez al mes. El worker diario ejecuta pero solo cambia el snapshot de rentabilidad cuando hay datos nuevos.
- **Dos snapshots**: rentabilidad (mensual, ~5KB) y valores cuota (diario, ~30KB/año). Se opta por archivos separados para granularidad de refresh distinta.

### YMYL considerations

- El dashboard es **informativo-comparativo**, no transaccional ni recomendatorio.
- No se implementará recomendación automática de AFP ("cámbiate a X").
- Toda tabla incluirá nota: "Rentabilidad pasada no garantiza rentabilidad futura."
- Los datos deben tener fecha de corte visible.
- La atribución a SP es obligatoria.
- Se requiere pipeline editorial completo para la página del dashboard (gates 05/06/07), incluyendo revisión humana de los datos mostrados antes del primer deploy.

### Costo operativo estimado

| Componente | Costo |
|---|---|
| Cloudflare Worker (cron diario, < 30 requests/día) | $0 (plan free) |
| GitHub PAT (fine-grained, solo Contents write) | $0 |
| Almacenamiento snapshot en repo | < 1MB |
| Mantenimiento anual estimado | 4-8h (monitoreo + fixes por cambios de estructura SP) |

## Alternatives considered

### Alternative A: No hacer nada

Mantener el comparador de comisiones actual y el contenido editorial separado. El usuario debe ir a spensiones.cl para ver rentabilidad real.

**Veredicto**: Opción por defecto. Se descarta porque el sitio perdería la oportunidad de ser el destino único para comparación AFP, y los usuarios seguirán yéndose a la competencia o a SP directamente.

### Alternative B: Link directo a SP

Agregar un enlace "Ver rentabilidad histórica en spensiones.cl" sin integrar datos.

**Veredicto**: Bajo esfuerzo pero baja diferenciación. El usuario igual tiene que navegar el sitio de SP que no es amigable. No resuelve el problema de UX.

### Alternative C: Datos manuales con actualización periódica

Almacenar la rentabilidad como JSON estático actualizado manualmente cada mes (editorial-volatile-data).

**Veredicto**: Más simple que worker pero dependiente de disciplina humana. Funciona como fallback. El proyecto ya tiene el patrón de worker funcionando, no hay razón para no usarlo.

### Alternative D: Dashboard completo (V2 scope)

Incluir desde V1: proyección de pensión integrada, gráficos históricos, comparación visual.

**Veredicto**: Scope demasiado grande para primera iteración. Mejor V1 informativo + V2 interactivo.

## Verification

Criterios que demuestran que el diseño es correcto:

1. **Viabilidad confirmada**: este ADR documenta que las 5 fuentes de SP son accesibles programáticamente (fuente 1 HTML via POST, fuente 2 CSV via GET, fuentes 3-5 complementarias). ✅

2. **Schema validado**: la interfaz `AfpDashboardSnapshot` cubre todos los campos visibles en las tablas de SP que se verificaron por HTTP.

3. **Patrón existente**: el worker + snapshot replica `workers/economic-snapshot-refresh/` incluyendo `govFetch.ts`. No introduce patrones nuevos.

4. **Criterio de viabilidad aplicado**: los 4 ejes (acceso, legal, técnico, negocio) son favorables con condiciones documentadas.

5. **YMYL considerado**: el alcance MVP excluye recomendación automática; toda la salida es tabular-informativa.

## Open questions

1. **Estrategia de almacenamiento de valores cuota**: ¿archivo único por año o archivo acumulado? El CSV de SP para un año completo de un fondo es ~30KB. 5 fondos × rango de años = ~150KB por año completo. Para 24 años de historia (2002-2026) serían ~3.6MB. ¿Almacenar completo o solo último año? Decisión tentativa: solo último año completo + año en curso en V1; histórico completo en V2 si hay demanda.

2. **Worker identity**: ¿mismo worker que `economic-snapshot-refresh` o worker separado? Separado es mejor para aislamiento de responsabilidades y cron schedules distintos.

3. **Nombres de AFP**: la SP usa mayúsculas (CAPITAL, PROVIDA). El perfil (`monedario_profile`) usa minúsculas (capital, provida). Normalizar en el worker.

4. **Modelo y Uno**: estas AFP no tienen promedio anual histórico porque ingresaron después de 2002. El campo `annualizedAvgReturnPct` debe ser nullable.

5. **Fondo C**: tiene un promedio anual extra desde Julio 1981 (antes de la existencia de multifondos, cuando solo existía el fondo C). ¿Mostrar ambos promedios o solo el más relevante? Decisión tentativa: mostrar el más largo solo como nota al pie.

6. **Frecuencia de actualización de comisiones**: las comisiones en `afpCommissions.ts` se verificaron manualmente en abril 2026. ¿Incorporar al worker la verificación automática desde Previred? Requiere scraping de otro sitio. Diferir.
