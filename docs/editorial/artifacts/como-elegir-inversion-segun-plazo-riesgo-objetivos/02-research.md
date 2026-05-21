# Gate 02 — Research Dossier: como-elegir-inversion-segun-plazo-riesgo-objetivos

Status: DRAFT — pending human verification of TODO:SOURCE items
Role: ResearchAgent (Claude Code — ED-016)
Slug: como-elegir-inversion-segun-plazo-riesgo-objetivos
Fecha de recuperación: 2026-05-21
requires_calculation: false
regulatory_sensitivity: media
math_audit_required: false (no cálculos numéricos; escalar si en drafting se agregan retornos o proyecciones)

---

## Official Sources

| # | Fuente | URL | Tipo | Estado |
|---|---|---|---|---|
| S1 | CMF Educa — Portal de educación financiera | https://www.cmfchile.cl/educa/ | official_source | TODO:VERIFY_URL — navegar y ubicar sección de ahorro/inversión e instrumentos |
| S2 | CMF Educa — Fondo de emergencia / ahorro de precaución | https://www.cmfchile.cl/educa/621/w3-propertyvalue-48004.html | official_source | TODO:VERIFY_URL — confirmar que resuelve y es sección vigente |
| S3 | CMF Educa — Perfil de riesgo del inversionista | https://www.cmfchile.cl/educa/ | official_source | TODO:VERIFY_URL — ubicar sección de tolerancia al riesgo y conceptos de renta variable/fija |
| S4 | CMF — Registro de entidades supervisadas (corredoras, administradoras de fondos mutuos) | https://www.cmfchile.cl/institucional/mercados/entidades.php | official_source | Referencia para sección "verificar intermediario habilitado" |
| S5 | CMF — Norma fondos mutuos: plazo máximo de rescate | Circular CMF aplicable a fondos mutuos (NCG sobre fondos de inversión) | official_source | TODO:VERIFY_URL — confirmar circular vigente y plazo máximo de rescate (referencia habitual: ≤ 10 días hábiles) |
| S6 | SII — Tratamiento tributario de instrumentos de ahorro e inversión | https://www.sii.cl/ | official_source | TODO:VERIFY_URL — ubicar sección de personas naturales, Art. 17 N°8, Art. 22 bis y Art. 107 LIR |
| S7 | SII — Art. 107 LIR: exención de impuesto a la ganancia de capital en acciones y ETFs de bolsa | https://www.sii.cl/ | official_source | TODO:SOURCE — verificar condiciones exactas del Art. 107 para ETFs listados en Bolsa de Santiago vs ETFs extranjeros |
| S8 | Ley de Impuesto a la Renta (LIR) — Art. 17 N°8 letra a): mayor valor en enajenación de acciones | https://www.bcn.cl/leychile/navegar?idNorma=15774 | official_source | TODO:VERIFY_URL — BCN texto consolidado vigente |
| S9 | Superintendencia de Pensiones — APV: beneficio tributario Art. 42 bis LIR | https://www.spensiones.cl/ | official_source | Referencia de contexto únicamente; Art. 42 bis se menciona solo si APV aparece en la pieza como contexto |
| S10 | Banco Central de Chile — Informe de Estabilidad Financiera (contexto macroeconómico) | https://www.bcentral.cl/ | context_reference | No fuente de claims normativos; solo contexto sobre mercado financiero chileno |

---

## Claims Catalogue

### Dimensión 1 — Prerequisito base: fondo de emergencia

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C1 | Un fondo de emergencia debe mantenerse separado del capital destinado a inversión | S1/S2 (CMF Educa — principio de liquidez) | VERIFIED (principio educativo estándar, no claim numérico) | Sin número de circular; es principio de política financiera personal universalmente aceptado |
| C2 | El rango de referencia de un fondo de emergencia es 3 a 6 meses de gastos esenciales | S2 (CMF Educa) | TODO:SOURCE — verificar si CMF usa exactamente "3 a 6 meses" o un rango distinto | Rango ampliamente citado en educación financiera; la pieza debe citar la fuente exacta o usar lenguaje condicional si no hay fuente oficial chilena que lo fije |
| C3 | "Gastos esenciales" incluye arriendo o dividendo, alimentación, salud, transporte y servicios básicos | — | VERIFIED (definición educativa estándar; no hay norma legal chilena que lo defina) | Presentar como orientación, no como definición normativa |
| C4 | Invertir el fondo de emergencia en instrumentos de renta variable implica riesgo de tener que rescatar con pérdida en el peor momento | S1 (CMF Educa — principio de liquidez vs riesgo) | VERIFIED (razonamiento de consecuencia lógica, no claim estadístico) | No agregar datos de pérdidas históricas sin MathAuditAgent |

### Dimensión 2 — Horizonte de inversión

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C5 | A mayor plazo de inversión, mayor es la capacidad de absorber volatilidad de corto plazo | S1/S3 (CMF Educa — concepto de riesgo temporal) | TODO:SOURCE — verificar que CMF Educa enuncia explícitamente este principio | Principio financiero básico; verificar que CMF lo menciona para evitar enunciarlo sin respaldo oficial |
| C6 | Los instrumentos de renta variable (ETFs, acciones, algunos fondos mutuos) son inadecuados para horizontes menores a 12 meses como regla general educativa | S3 (CMF Educa — perfil de riesgo) | TODO:SOURCE — CMF debe respaldar el umbral de 12 meses o equivalente | Si CMF no establece un umbral exacto, reformular como "horizonte corto" sin número fijo |
| C7 | El Depósito a Plazo (DAP) es un instrumento de renta fija adecuado para horizontes de corto plazo con fecha definida | S1 (CMF Educa) | VERIFIED (operatoria conocida del instrumento) | Referencia cruzada a `/posts/deposito-a-plazo-uf-vs-pesos/` para detalles |

### Dimensión 3 — Liquidez

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C8 | El retiro anticipado de un DAP conlleva penalización (pérdida parcial de intereses o condiciones originales) | S5 (Circular CMF aplicable a DAP) | TODO:SOURCE — identificar circular CMF vigente que regula la penalización por retiro anticipado | Mecanismo exacto varía por contrato; la pieza debe mencionar que "el contrato define las condiciones" y remitir a la entidad |
| C9 | Los fondos mutuos tienen plazo de rescate definido en su reglamento; la normativa CMF establece un máximo | S5 (NCG CMF sobre fondos mutuos) | TODO:SOURCE — verificar plazo máximo establecido por CMF (referencia habitual ≤ 10 días hábiles) | No afirmar "se rescatan en X días" sin citar el reglamento del fondo específico; la pieza debe explicar que el plazo varía por fondo |
| C10 | Los ETFs listados en bolsa se compran y venden en horario de mercado; la liquidez depende del volumen y del intermediario | S4 (CMF — entidades habilitadas) | VERIFIED (operatoria de mercado bursátil) | No equivale a liquidez inmediata; el spread y el horario del mercado son factores reales |

### Dimensión 4 — Tolerancia a la pérdida

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C11 | La renta variable implica que el capital puede disminuir (no solo dejar de crecer) | S3 (CMF Educa — riesgo de instrumento) | TODO:SOURCE — verificar que CMF Educa define explícitamente renta variable con posibilidad de pérdida de capital | Principio base; necesita respaldo oficial chileno para no quedar como afirmación sin fuente |
| C12 | La renta fija (DAP, bonos) tiene menor riesgo de pérdida de capital en condiciones normales, pero puede tener menor retorno esperado | S1/S3 (CMF Educa) | TODO:SOURCE — idem C11 | Debe matizarse con "en condiciones normales"; no prometer capital garantizado sin leer el contrato del instrumento específico |
| C13 | La tolerancia emocional a la volatilidad (no vender en caída) es un factor determinante del resultado real | — | VERIFIED (principio de finanzas conductuales; no requiere fuente normativa chilena) | Presentar como heurística educativa, no como regla normativa |

### Dimensión 5 — Tributación

| # | Claim | Fuente | Estado | Notas |
|---|---|---|---|---|
| C14 | Los intereses de un DAP son renta del capital y tributan como ingreso ordinario en el Impuesto Global Complementario (IGC) para personas naturales | S6 (SII — LIR) | TODO:SOURCE — verificar artículo exacto de la LIR aplicable a intereses de DAP (referencia: Art. 20 N°2 LIR) y tasas aplicables según tramo | No afirmar tasa concreta; remitir al SII |
| C15 | La mayor ganancia en rescate de fondos mutuos puede estar afecta a Art. 17 N°8 LIR según el tipo de fondo y las condiciones del rescate | S6/S8 (SII — LIR Art. 17 N°8) | TODO:SOURCE — verificar condiciones exactas para fondos mutuos de capital variable y fondos de inversión; diferencias según fondo accionario vs deuda | Muy sensible; no detallar sin MathAuditAgent si se incluyen ejemplos numéricos |
| C16 | Los ETFs listados en la Bolsa de Santiago pueden calificar para la exención del Art. 107 LIR bajo condiciones específicas de presencia bursátil | S7 (SII — Art. 107 LIR) | TODO:SOURCE — verificar condiciones exactas de presencia bursátil del 25% y requisito de plazo para ETFs chilenos vs. extranjeros | Muy sensible; la pieza debe mencionar la existencia del beneficio y remitir al SII, sin detallar condiciones que puedan haber cambiado |
| C17 | El APV tiene beneficio tributario bajo Art. 42 bis LIR (mención de contexto únicamente; no profundizar en esta pieza) | S9 (Superintendencia de Pensiones) | VERIFIED (norma conocida) | Solo mención contextual si APV aparece; remitir a `/posts/que-es-el-apv/` para detalle |

### Escenarios (Matriz orientativa)

| # | Escenario | Claim / criterio | Estado | Notas |
|---|---|---|---|---|
| E1 | Pie de departamento (horizonte 2–4 años) | El horizonte definido y la necesidad de liquidez al vencimiento hacen que la volatilidad de renta variable sea un riesgo real en este caso | VERIFIED (razonamiento de consecuencia lógica) | No mapear a producto específico |
| E2 | Jubilación complementaria / ahorro largo plazo (horizonte +10 años) | Un horizonte largo reduce el impacto de la volatilidad de corto plazo y permite tolerar mayor riesgo en términos de educación financiera básica | TODO:SOURCE — verificar que CMF o SP enuncian explícitamente este principio para horizonte largo | Si no hay fuente oficial, reformular como heurística educativa con lenguaje condicional |
| E3 | Excedente de ahorro sin objetivo definido | La ausencia de objetivo hace que la liquidez sea el criterio conservador por defecto hasta definir el horizonte | VERIFIED (razonamiento educativo) | No equivale a "mantenerlo en cuenta corriente"; remitir al pilar para ver instrumentos |
| E4 | Capital inicial pequeño (primer acercamiento a la inversión) | Los costos de transacción, custodia y comisiones impactan proporcionalmente más en montos pequeños | VERIFIED (consecuencia aritmética; no requiere datos específicos) | No nombrar umbrales mínimos de instituciones específicas |

---

## Benchmark Observations

> Separados explícitamente como input estratégico; no son fuente de claims factuales.

- La query "dónde invertir mi dinero Chile" está dominada por contenido de comparadores de instrumentos y bancos; hay un hueco real en el ángulo de "prerequisitos y criterios previos".
- La diferenciación de esta pieza vs. competidores: el ángulo es "¿estás listo?" (preparación), no "¿qué es mejor?" (ranking). Ese encuadre es editorialmente limpio y difícil de replicar sin asumir postura.
- Algunos sitios usan cuestionarios de perfil de riesgo que terminan recomendando productos. Esta pieza evita ese patrón: el checklist mapea preparación, no perfil ni producto.

---

## Nota técnica — Componente InversionReadinessChecklist

El componente interactivo es parte integral de la pieza. Su spec se detalla en el brief y
debe reproducirse en el outline (gate 03). Restricciones que el agente de drafting debe
respetar:

- Sin cookies ni almacenamiento de datos de usuario
- Sin llamadas a APIs externas
- El resultado nunca nombra productos, instituciones ni porcentajes de asignación
- El advisory YMYL debe estar visible dentro del componente, no solo en el artículo
- Implementar como Astro island mínimo (script inline o `client:idle`) sin dependencias JS externas

---

## Open Research Questions (TODO:SOURCE — bloqueantes para 07-publish-packet)

| # | Claim(s) | Acción requerida | ¿Bloqueante para drafting? | Agente |
|---|---|---|---|---|
| R1 | C2 — ¿Usa CMF exactamente "3 a 6 meses"? | Navegar CMF Educa y verificar sección de fondo de emergencia | No (puede usar lenguaje condicional en draft) | Human / ResearchAgent externo |
| R2 | C5, C6 — ¿Enuncia CMF el principio de horizonte y umbral de 12 meses? | Navegar CMF Educa sección riesgo/instrumentos | No (puede reformular como heurística si no hay fuente) | Human / ResearchAgent externo |
| R3 | C8 — Mecanismo de penalización retiro anticipado DAP | Identificar circular CMF vigente sobre DAP | No (la pieza puede decir "el contrato define las condiciones") | Human |
| R4 | C9 — Plazo máximo rescate fondos mutuos en normativa CMF | Identificar NCG vigente | No (puede decir "según reglamento del fondo") | Human |
| R5 | C11, C12 — Definición CMF de renta variable con pérdida de capital posible | Navegar CMF Educa sección instrumentos | No (principio conocido; reformular como educativo si no hay fuente exacta) | Human / ResearchAgent externo |
| R6 | C14 — Artículo exacto LIR para intereses DAP | SII o LIR consolidada | Sí — citar artículo o no afirmar tratamiento tributario | Human |
| R7 | C15 — Condiciones Art. 17 N°8 para rescate fondos mutuos | SII | Sí — muy sensible; no detallar sin verificación | Human |
| R8 | C16 — Condiciones Art. 107 LIR para ETFs | SII | Sí — muy sensible; mencionar existencia y remitir al SII sin detallar | Human |
| R9 | E2 — ¿CMF o SP enuncia explícitamente el principio de horizonte largo para tolerancia al riesgo? | Navegar CMF Educa / SP | No (puede usar lenguaje condicional) | Human / ResearchAgent externo |

---

## Context Notes

- `requires_calculation: false` — no hay fórmulas ni cálculos normativos. Si en drafting se agregan datos numéricos de retorno o proyecciones, escalar a MathAuditAgent antes de gate 06.
- `regulatory_sensitivity: media` — marco de decisión financiero. No hay beneficios estatales ni cálculos de impuesto; las menciones tributarias (C14–C16) son contextuales y deben remitir al SII sin detallar condiciones cambiantes.
- Los TODO:SOURCE de tributación (R6, R7, R8) son bloqueantes para el 07-publish-packet. Los demás permiten drafting con lenguaje condicional.
- El artículo debe incluir `Fecha de corte` visible en el cuerpo (`INVARIANT.EDITORIAL.CUT_OFF_DATE_REQUIRED`).
- Advisory YMYL requerido al inicio del artículo Y dentro del componente checklist.
