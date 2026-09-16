# B2B discovery memo — esqueleto de trabajo (F2 monetización)

**Owner:** `docs/backlog/PLAN-monetization-reevaluation-2026-09-16.md` (F2) ·
**Fecha:** 2026-09-16 · **Estado:** esqueleto, pendiente de ejecución del owner
**Regla FOCO:** discovery estrictamente documental. Sin código de API, widget,
embed, auth, billing, white-label ni pilotos hasta decisión explícita + gate
de excepción (`UTILITY_LED_BLOCKED_PENDING_EVIDENCE.md`: 10 conversaciones →
2 demos → 1 piloto pagado).

## Hipótesis de valor (a validar, no a afirmar)

1. **Payroll / software de remuneraciones chileno:** calculadoras verificadas
   (sueldo líquido, gratificación, finiquito, UTM/UF) como motor embebible
   con trazabilidad a fuentes oficiales (SII, CMF, BCCh).
2. **HR / beneficios:** APV, seguro de cesantía y simulador de jubilación
   como educación financiera para colaboradores, con métricas agregadas.
3. **Fintech / comparadores:** datos de intención agregada (qué calculan
   los usuarios) como señal de demanda — nunca datos individuales (no
   existen; no se crearán).

## Perfil objetivo (ICP borrador)

Empresas operando en Chile con nómina local o producto financiero retail,
que hoy mantienen sus propias calculadoras desactualizadas o responden
preguntas repetitivas de usuarios/colaboradores. Fuera de perfil: lead
buyers que pidan datos individuales, afiliación encubierta, sponsors que
exijan ranking o veredictos.

## Tracker de conversaciones (meta: 10)

| # | Empresa / contacto | Hipótesis | Fecha | Resultado | Siguiente paso |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |
| 6 | | | | | |
| 7 | | | | | |
| 8 | | | | | |
| 9 | | | | | |
| 10 | | | | | |

Preguntas base por conversación: ¿qué calculan hoy y con qué costo de
mantención? ¿qué pasa cuando la norma cambia (reforma, UTM)? ¿pagarían por
exactitud verificada + cero mantención? ¿qué contrato de calidad exigirían
(frescura, fuentes, SLA)?

## Criterios demo → piloto

- **Demo (meta: 2):** solo si ≥3 conversaciones confirman el mismo dolor con
  presupuesto. Demo = walkthrough de calculadoras existentes, sin código
  nuevo.
- **Piloto pagado (meta: 1):** requiere excepción aprobada
  (`url-freeze-exceptions.json` completa) + ADR + contrato de calidad de
  datos (frescura vía snapshot, fuentes primarias, SLO de exactitud) +
  precio que cubra mantención. Sin pago no hay piloto.

## Costo de mantener (a completar con evidencia)

Horas/semana del responsable, costo infra (Cloudflare/R2, despreciable hoy),
carga de refresco normativo (reformas, UTM mensual, UTA), costo de
auditoría YMYL por superficie expuesta. Un piloto que no cubra su mantención
+ margen se rechaza aunque haya interés.

## Kill criteria

Sin 10 conversaciones al 2026-11-02 → la vía B2B queda `SIN DATOS
SUFICIENTES`, no se infiere desinterés del mercado. Sin 2 demos → no hay
piloto. Cualquier pedido de datos individuales, ranking pagado o tracking
extra → fin de la conversación + registro del motivo.

## Salida hacia la revisión 2026-11-02

Este memo alimenta la decisión perseverar / pilotar B o D / pausar junto a
la evidencia F1 (funnel voluntario) y Gate D (sostenibilidad). Sin este
memo completo, la opción D no es elegible.
