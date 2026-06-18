# Topic Intake Policy — Gate 00

Fecha de corte: 2026-06-17

Autoridad aplicable:
1. `AGENTS.md`
2. `context/EDITORIAL_AI_PIPELINE.md`
3. `docs/editorial/TOPIC_OWNERSHIP_POLICY.md`
4. `docs/development/CRITERIO_VIABILIDAD.md`
5. `src/config/editorial-topic-policy.mjs` (`CANONICAL_TOPIC_REGISTRY`)

## 1. Propósito

El pipeline editorial **empieza en `01-brief.yaml`**: asume que ya se decidió que
un tema merece un artículo. Faltaba la etapa previa que decide **si** un tema
debe entrar al pipeline. **Gate 00 — Topic Intake & Scoring** cubre ese hueco.

Gate 00 es **pre-brief, pre-slug, pre-registro**. Su única salida es un veredicto
go/no-go más una recomendación de alcance que alimenta `01-brief.yaml`.

**Gate 00 NO:**
- crea slugs (los cambios de slug exigen snapshot de rutas/RSS + ADR — ver
  `ROUTES.NO_SILENT_CHANGES`, `RSS.NO_REMOVALS`);
- registra `canonicalTopic` ni modifica `editorial-topic-policy.mjs` (eso ocurre
  al decidir el owner, después del brief);
- reemplaza al `01-brief.yaml`; lo precede y lo alimenta.

## 2. Estructura: kill-switches primero, scoring después

El proceso es deliberadamente asimétrico. Primero se aplican kill-switches
binarios (baratos, descartan la mayoría); solo a los sobrevivientes se les aplica
el scoring 1–5 (más caro, requiere juicio). En el worked example de referencia,
**los kill-switches hicieron ~80% del trabajo**.

### 2.1 Fase A — Kill-switches (binarios, fail-any bloquea)

Cualquier `FAIL` detiene el candidato o fuerza un re-encuadre de alcance. Registra
la evidencia, no solo el veredicto.

| # | Kill-switch | Pregunta | Fuente |
|---|---|---|---|
| 1 | De-dup vs repo | ¿Existe contenido publicado que cubra esta intención? | `src/data/blog/`, glosario, leyes |
| 2 | Conflicto de autoridad | ¿La intención ya tiene owner en `CANONICAL_TOPIC_REGISTRY`? | `editorial-topic-policy.mjs` |
| 3 | Viabilidad | ¿Las fuentes requeridas son públicas, legales y suficientes? | `CRITERIO_VIABILIDAD.md` |
| 4 | Costo de mantención | ¿El **formato** evita datos volátiles o refresco insostenible? | esta política |
| 5 | ¿Resuelve una decisión? | ¿Ayuda a tomar o ejecutar una decisión financiera concreta? | esta política |

**Regla de re-encuadre:** los kill-switches 3 y 4 a menudo no matan el **tema**
sino un **alcance**. Si "comparador en vivo" falla por volatilidad pero "pilar
educativo" pasa, re-encuadra el alcance y vuelve a correr la Fase A. El veredicto
puede ser de alcance, no solo sí/no.

### 2.2 Fase B — Scoring 1–5 (solo sobrevivientes)

Escala 1 (muy débil) a 5 (muy fuerte). El promedio simple de las 6 dimensiones
da el puntaje del candidato.

| Dimensión | Qué mide |
|---|---|
| Vacío de cluster (gap) | Cuán ausente está la cobertura hoy en el sitio y el registro |
| Utilidad / decisión-resolvencia | Cuán fuerte y frecuente es la decisión que resuelve |
| Interlinking | Cuántos hubs/calculadoras existentes puede enlazar y recibir |
| Demanda / volumen | Tamaño estimado de la audiencia |
| Viabilidad de datos | Estabilidad y publicidad de las fuentes |
| Mantención (inverso) | 5 = bajo costo de refresco; 1 = alto |

**Umbral:** promedio **≥ 3.5** → candidato a `PROCEDER A BRIEF`. Si alguna
dimensión puntúa **1**, re-encuadra el alcance antes de proceder (no promedies
por encima de un bloqueo real).

## 3. Calibraciones (aprendidas en el worked example 2026-06-17)

1. **GSC es confirmatorio-solo a la escala actual.** A ~1.374 impresiones / 2
   clics por semana (solo 12 queries con ≥10 imp), casi todo es greenfield, así
   que striking-distance no discrimina. Usa GSC como confirmación una vez cruzado
   un umbral de impresiones; mientras tanto, estima demanda con **gap de cluster +
   SERP de competidores + Reddit**.
2. **`CANONICAL_TOPIC_REGISTRY` es el kill-switch más potente.** Atrapa temas que
   parecen nuevos pero ya están "owned" (independientes, jóvenes, ahorro
   conservador, fondo de emergencia no son clusters greenfield). Corre el
   kill-switch 2 antes de gastar juicio en scoring.
3. **Evalúa el alcance/formato, no solo el tema.** "Bancos y fintechs" pasa como
   pilar educativo pero falla como comparador en vivo (datos volátiles +
   neutralidad/monetización sin resolver). El veredicto de alcance es parte del
   producto de Gate 00.

## 4. Worked example de referencia — 2026-06-17

Corrida fundacional sobre un lote de temas candidatos. Los kill-switches
descartaron o reclasificaron la mayoría; dos sobrevivieron al scoring.

### 4.1 Descartados / reclasificados por kill-switches

| Candidato | Resultado | Motivo (kill-switch) |
|---|---|---|
| Independientes | Reorg/interlinking, no contenido nuevo | KS2: ya owned por `boleta-honorarios` + rentas mixtas |
| Jóvenes | Diferir | Support de `primer-empleo`, no pilar propio |
| Comparativa Fintual/Racional | HOLD | KS3/KS4: requiere política de monetización/neutralidad |
| "Dónde guardar plata" | Fold en owner | KS2: owned por `ahorro-e-inversion` |
| Ahorro conservador / fondo emergencia | Fold | KS2: ya en el registro |

### 4.2 Sobrevivientes — scoring

| Candidato | Gap | Utilidad | Interlink | Demanda | Viab. | Mant. | Prom. | Veredicto |
|---|---|---|---|---|---|---|---|---|
| `bancos-y-fintech-chile` (pilar educativo) | 5 | 4 | 5 | 4 | 4 | 4 | **4.33** | PROCEDER — prioridad alta; comparador en vivo diferido |
| `finanzas-para-migrantes-chile` | 5 | 4 | 3 | 2 | 5 | 5 | **4.00** | PROCEDER — prioridad media |

Artefactos de evaluación completos:
- [`artifacts/editorial/_intake/bancos-y-fintech-chile/00-topic-intake.md`](../../artifacts/editorial/_intake/bancos-y-fintech-chile/00-topic-intake.md)
- [`artifacts/editorial/_intake/finanzas-para-migrantes-chile/00-topic-intake.md`](../../artifacts/editorial/_intake/finanzas-para-migrantes-chile/00-topic-intake.md)

**Lectura del resultado:** `bancos-y-fintech` puntúa por encima de `migrantes`
(mayor gap aprovechable + interlinking + demanda), y ambos superan el umbral 3.5.
`bancos-y-fintech` pasa **como pilar educativo** y falla **como comparador en
vivo** — un veredicto de alcance, no un sí/no.

## 5. Operación

1. Copia `docs/editorial/templates/00-topic-intake.md` a
   `artifacts/editorial/_intake/<candidato>/00-topic-intake.md`.
2. Corre la Fase A; registra evidencia por kill-switch.
3. Para sobrevivientes, corre la Fase B y calcula el promedio.
4. Emite el veredicto (decisión + prioridad + alcance aprobado/diferido + próximo
   paso).
5. Solo si la decisión es `PROCEDER A BRIEF`, abre el `01-brief.yaml`
   correspondiente bajo `artifacts/editorial/<slug>/<run-id>/`.
