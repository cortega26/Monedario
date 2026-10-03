# Compliance review — round 5 — rentas-mixtas-sueldo-honorarios

Status: FAIL — DEFECTS FOUND

Role: ComplianceAgent (Codex — fresh independent session, adversarial)

Audit cut-off: 2026-10-02

## 0. Alcance

Revisé `docs/editorial/NORMA_YMYL.md` §§1.1, 5.1–5.4 y 7; `docs/editorial/DEFINITION_OF_DONE.md` §2; `context/EDITORIAL_AI_PIPELINE.md`; el artículo actual y `git diff HEAD`; el Addendum 2026-10-02 de `07-publish-packet.md`; `draft-fix-CHANGELOG.md`; el extracto AT2026 de Línea 23; la entrada `rentas-mixtas-apv-y-convenios` en `src/data/correcciones.json`; y la ronda 4 solo como contexto histórico.

El único archivo escrito en esta sesión es este informe. No edité el artículo, el paquete, el changelog, el extracto, el registro ni un archivo `05-*`; tampoco marqué gates. No vi un número nuevo derivado ni una operación aritmética nueva en el diff del artículo. `$11.265.804` se conserva y el SII lo publica directamente como 13,5 UTA para AT2026. No solicité ni creé un MathAudit para esta ronda, conforme al encargo.

## 1. Resultado

El bloque APV corregido coincide con la prelación y los topes de la instrucción SII que sí pude recuperar para AT2025, y con las reglas generales vigentes del Compendio de la Superintendencia de Pensiones. La tasa de 14,5% quedó limitada a boletas emitidas en 2025 para AT2026. Las fechas de `updatedDate`, `articleLead.validAsOf` y revisión visible coinciden en 2026-10-02. El slug, título, H1 y canonical no cambian en el diff. La corrección material está registrada.

La versión auditada **no cumple el ejemplo/caso exigido por DoD §2 y por la instrucción R5-05**: hay escenarios cualitativos, incluido “Dos empleadores simultáneos y además boletas”, pero no un ejemplo trabajado de F22. Además, el fetch web independiente del PDF SII AT2026 y del URL TGR solicitado no me entregó el contenido íntegro. El paquete local sí conserva la extracción de cinco páginas AT2026; el navegador del root reportó el texto del producto TGR, pero esa pestaña ya está vinculada a su sesión y no pude leerla desde esta instancia. Mantengo diferenciadas esas evidencias.

## 2. Verificación adversarial de claims

| Claim / control | Resultado y evidencia independiente | Estado |
|---|---|---|
| Límite agregado de 600 UF entre A/B; prelación B mensual → B directo → A; exceso inhábil para ambos regímenes; máximo mensual de 50 UF para B por planilla | El PDF SII AT2025 recuperado directamente tiene cinco páginas. §§23.2 y 23.4 confirman el límite mensual de 50 UF, el agregado de 600 UF al 31 de diciembre, el orden de imputación solicitado y que el exceso no se acoge a ninguno de los regímenes. El extracto local rotulado AT2026 tiene 274 líneas, 3.228 palabras y cinco segmentos separados por saltos de página; empieza en “Línea 23” y termina con §23.8. Sus §23.4 reproducen la misma regla. El URL AT2026 exacto devolvió “not accessible”/“Internal Error” en `web.run`; `curl` no resolvió el host desde este entorno. No presento el extracto del artefacto como un refetch propio del binario. | CONDICIONAL: falta mi fetch web del PDF AT2026 exacto; la regla está corroborada por AT2025 y por el extracto íntegro local. |
| Bonificación APV A: 15%, tope de 6 UTM y condición de 10 veces las cotizaciones obligatorias | El Capítulo XII del Compendio SP (APV general, Libro II, Título II) confirma 15%, máximo de 6 UTM y elegibilidad conjunta de aportes del año hasta 10 veces las cotizaciones obligatorias del mismo año. También dice que TGR deposita la bonificación en la cuenta APV. El Capítulo XI (Libro II, Título IV) se limita a APVC; el artículo lo identifica como APVC y enlaza el Capítulo XII para APV general. La FAQ SII actualizada el 2025-07-23 distingue A (sin rebaja al depositar) de B (rebaja de base). | VERIFICADO. |
| Retención 14,5% | La página oficial SII de boletas muestra 14,5% para 2025, 15,25% para 2026 y 16% para 2027. En el artículo, las menciones de 14,5% quedan vinculadas a boletas emitidas en 2025 y al F22 AT2026; no encontré una generalización a 2026 o años siguientes. | VERIFICADO. |
| Exención IGC `$11.265.804` | La tabla SII AT2026 declara el tramo exento hasta `$11.265.804` y, en la tabla de límites, 13,5 UTA de diciembre de 2025 por ese mismo monto. Es un valor publicado, no un cálculo nuevo de esta ronda. | VERIFICADO. |
| Calendario AT2027 | La landing oficial consultada sigue titulada Operación Renta 2026; el índice de noticias 2026 no mostró “2027” y la búsqueda restringida a SII no devolvió calendario AT2027. La frase del artículo dice que no encontró calendario en esas páginas al 2026-10-02, sin afirmar una fecha futura. | VERIFICADO para esas páginas y fecha de consulta. |
| Convenio TGR: 10%–30% y garantía | El URL exacto `https://tgr.gob.cl/convenios-de-pago/` devolvió error interno en mi fetch web; la variante `www.tgr.cl` devolvió página no encontrada. El Centro de Ayuda TGR, página oficial actualmente accesible, confirma el producto para deudas fiscales y aduaneras vencidas, mínimo de 1 UTM y hasta 24 meses; explica que condiciones y plazo dependen de factores del caso, pero no publica allí el 10%–30% ni el criterio de garantía. El root informó que un acordeón visible en Chrome en el URL exacto muestra 10%–30%, hasta 24 cuotas, 1 UTM mínimo y que pie/cuotas dependen del comportamiento de pago y de si hay garantía. Vi en inventario que esa pestaña existe, pero no pude vincularla ni inspeccionar su contenido desde esta sesión. | CONDICIONAL: el alcance del texto está acotado al producto correcto; no pude verificar independientemente el rango ni la garantía con mi fetch. No concluyo que sean falsos. |

Fuentes consultadas el 2026-10-02:

- [SII — Instrucciones F22 AT2026, Línea 23, PDF exacto](https://www.sii.cl/servicios_online/renta/2026/archivos/l23_instruccion.pdf) — URL intentado directamente; el fetch de esta sesión no entregó el contenido.
- [SII — Instrucciones F22 Renta 2025, Línea 23](https://www.sii.cl/servicios_online/renta/2025/archivos/l23_instruccion.pdf) — cinco páginas recuperadas; §§23.2 y 23.4.
- [SP — Compendio, Capítulo XII, APV general](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2909.html) — §§2, 5–10.
- [SP — Compendio, Capítulo XI, APVC](https://www.spensiones.cl/portal/compendio/596/w3-propertyvalue-2929.html) — identificación bajo Título IV/APVC.
- [SII — FAQ 001.140.5883.011, regímenes tributarios A/B](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_5883.htm).
- [TGR — Convenio para deudas vencidas de Impuestos Fiscales y Aduaneros](https://tgr.gob.cl/convenios-de-pago/) — fetch web sin contenido; adicionalmente consulté la [guía oficial TGR sobre tipos de convenios](https://ayuda.tgr.gob.cl/ayuda/convenios-de-pago/que-es-un-convenio-de-pago-y-tipos-de-convenios), que acredita tipo, plazo máximo y mínimo, no el rango/garantía.
- [SII — Información para personas naturales, AT2026](https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html) — 13,5 UTA / `$11.265.804`.
- [SII — Retenciones de boletas de honorarios](https://www.sii.cl/destacados/boletas_honorarios/) — tabla 2025–2027.
- [SII — Operación Renta 2026](https://www.sii.cl/destacados/renta/2026/) y [índice de noticias 2026](https://www.sii.cl/noticias/2026/index.html) — consultados para el estado AT2027.

## 3. Hallazgos

**DEFECT #1 — [alta / bloquea cierre] — Falta el ejemplo trabajado de F22 requerido por DoD §2 y R5-05.** La sección de “Casos frecuentes” describe situaciones, pero no presenta un caso con entradas del F22 ni una demostración de cómo la tasa aplicable se refleja en retenciones/pagos. Los umbrales `$11.265.804`, 50/600 UF y 14,5% son hechos numéricos citados, no un ejemplo trabajado. **Resolución:** completar el ejemplo solicitado sin introducir un resultado derivado si el alcance sigue siendo `requires_calculation=false`; luego auditar la versión editada en una sesión Compliance fresca. No creé el ejemplo porque el artículo está fuera de mi alcance de escritura.

**DEFECT #2 — [media / fuente por confirmar] — No pude reproducir desde esta sesión el fetch web de las condiciones específicas del producto TGR.** El texto del artículo sí circunscribe 10%–30% y garantía a deudas vencidas de Impuestos Fiscales y Aduaneros; no extiende esas condiciones a otros productos. El artículo, el changelog y el root reportan el contenido en Chrome, pero mi web fetch del URL exacto falla y el Centro de Ayuda accesible no muestra los dos detalles. **Resolución:** conservar evidencia directa legible del acordeón del producto en el paquete, o repetir un fetch independiente exitoso del URL exacto; si no se obtiene, retirar o sustituir el rango/garantía por las condiciones que sí publica la fuente accesible.

**DEFECT #3 — [media / límite de verificación] — El PDF SII AT2026 exacto no fue recuperable por mi herramienta web.** La extracción local presenta cinco segmentos de página y cubre desde §23.1 hasta §23.8, por lo que el artefacto parece completo; además AT2025 confirma directamente el punto principal. Aun así, no certifiqué independientemente el origen del binario AT2026 en esta sesión. **Resolución:** guardar o adjuntar evidencia del PDF AT2026 directamente abierto/descargado junto al artefacto y mantener la URL directa en el artículo; no atribuir a esta ronda la descarga que hizo DraftAgent.

No encontré defecto en la prelación A/B, los límites APV, el límite 10x, la tasa de 2025/AT2026, la cifra IGC, la fecha de revisión o el alcance textual del producto TGR. Estas conclusiones están limitadas por las diferencias de acceso indicadas arriba.

## 4. Scorecard — NORMA_YMYL §7

| Dimensión | Peso | Nota | Aporte | Motivo |
|---|---:|---:|---:|---|
| Respuesta ancla | 35% | 9,5 | 3,325 | Regla principal y excepción de tramo exento al inicio; ciclo AT2026 claramente pasado. |
| Precisión + fuentes | 25% | 8,5 | 2,125 | APV y valores SII corroborados; no pude refetchear el PDF AT2026 exacto ni verificar el detalle TGR desde mi propio fetch. |
| Vigencia + calendario | 15% | 9,5 | 1,425 | Fechas de vigencia, revisión y AT2026 alineadas; AT2027 acotado a la consulta fechada. |
| Excepciones + cobertura | 15% | 8,0 | 1,200 | Incluye los límites APV y contexto de convenio; falta el caso F22 pedido y no se expone el uso previsional del saldo bonificado. |
| Claridad + estructura | 10% | 8,5 | 0,850 | H1 y los H2 requeridos están presentes; el bloque de caso no contiene ejemplo concreto. |
| **Total** | **100%** |  | **8,925 / 10 = 8,93 / 10** | **No alcanza el mínimo 9,5/10 de NORMA §7.** |

## 5. Fechas, identidad y registro de correcciones

- `updatedDate`, `articleLead.validAsOf` y la fecha visible “revisado el” están en 2026-10-02.
- El `git diff HEAD` no cambia título, slug, H1 ni canonical. Las actualizaciones de contenido APV/TGR y la precisión temporal de 14,5% sí son materiales.
- `src/data/correcciones.json` contiene `rentas-mixtas-apv-y-convenios`, fecha 2026-10-02 y describe los límites, la prelación, el alcance TGR y la retención acotada a 2025/AT2026. La entrada y sus fuentes corresponden a los cambios observados.
- El Addendum 2026-10-02 atribuye DraftAgent a Codex GPT-6, instancia raíz `/root`, y ComplianceAgent a la instancia independiente `/root/compliance_rentas_round5`, sin historial (`fork_turns=none`). El `draft-fix-CHANGELOG.md` también distingue a DraftAgent y ComplianceAgent; no presenta al DraftAgent como sesión sin exposición previa.
- HumanEditor permanece pendiente. El addendum declara que no se marcó ningún gate `[X]`; esta sesión no alteró esa condición.
- El cuerpo previo del paquete de publicación conserva `requires_calculation=true` para el run y el gate MathAudit pendiente; el addendum usa `requires_calculation=false` para el delta de esta ronda porque no añadió una cifra derivada. No interpreto el estado acotado de esta ronda como cierre del gate heredado del run. No se creó ni solicitó un MathAudit para esta ronda.

## 6. Separación de funciones

| Fase | Agente/sesión | Estado |
|---|---|---|
| Brief, dossier, outline y borrador | DraftAgent — Codex GPT-6, instancia raíz `/root`; retomó cambios existentes | Confirmado por changelog y addendum. |
| Math audit | No se creó instancia nueva para esta ronda; no se derivó una cifra nueva | Por instrucción del encargo; gate heredado del paquete no se considera cerrado. |
| Compliance | ComplianceAgent — `/root/compliance_rentas_round5`, instancia independiente sin historial | Este informe; verificación propia de las fuentes enumeradas. |
| HumanEditor | Humano | Pendiente; ningún gate firmado. |

## 7. Veredicto

**FAIL (versión auditada el 2026-10-02).** El bloque APV queda corregido y respaldado por fuentes oficiales accesibles, y el resto de las cifras visibles en el diff son literales de fuente, no resultados calculados. Sin embargo, falta el ejemplo/caso F22 exigido por DoD §2 y R5-05, el score es 8,93/10 (< 9,5), y el refetch independiente de las condiciones TGR específicas queda abierto. La ronda de Compliance no firma la publicación ni cierra gates; HumanEditor sigue pendiente.
