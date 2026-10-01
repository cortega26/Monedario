# Política de riesgo editorial (R1–R4), incertidumbre y provenance

Fecha: 2026-10-01 · Estado: activa · Gate: `pnpm run check:risk-tiers`
Registro: `src/config/editorial-risk-registry.json`

Principio: la confiabilidad no se declara, se controla. La exigencia de
evidencia, verificación y trazabilidad crece con la consecuencia de un error.
Este documento es el documento canónico del criterio; el registro es su
aplicación verificable pieza por pieza.

## 1. Niveles de riesgo

| Nivel | Definición | Ejemplos |
|---|---|---|
| **R1** | Descriptivo o de baja consecuencia; un error no cambia una decisión económica. | Contenido histórico, entretención, contexto general. |
| **R2** | Informativo financiero de impacto limitado; orienta, no determina. | Educación de presupuesto, comparaciones generales, guías de entrada. |
| **R3** | Puede influir materialmente en una decisión económica, pero no depende de un parámetro, requisito o fecha de vigencia exactos. | Elegir instrumento de inversión, salir de deuda, hábitos de ahorro. |
| **R4** | Legal, tributario, previsional, laboral, fórmula, parámetro, requisito, límite o fecha cuya incorrección puede cambiar directamente una decisión (monto, plazo, elegibilidad, impuesto). | Tramos y tasas, UF/UTM/IPC, finiquito, APV, PGU, renegociación, retención de honorarios. |

Control proporcional:

| Nivel | Evidencia mínima | Verificación | Cadencia |
|---|---|---|---|
| R1 | Fuente razonable cuando hay afirmaciones fácticas | Revisión editorial normal | Por cambio sustantivo |
| R2 | Fuente citada | Revisión editorial normal | Por cambio sustantivo |
| R3 | Fuente primaria cuando exista; límites explícitos | Revisión editorial + spot-check de números | Por cambio de fuente o dato |
| R4 | Fuente primaria obligatoria; parámetro con vigencia y fuente | Auditoría de cálculo independiente cuando hay fórmula; revisión regulatoria cuando aplica | Event-driven (cambio legal, parámetro oficial, fuente, cálculo o finding) |

Una página R4 sin fuente primaria y sin fecha de corte no debe publicarse ni
actualizarse. Si la evidencia falta, ver §3.

## 2. Asignación y registro

- Cada artículo publicado y cada calculadora tienen exactamente un nivel en
  `src/config/editorial-risk-registry.json`.
- El nivel más alto de una afirmación manda: un artículo mayormente R2 con un
  requisito legal R4 se clasifica R4.
- Cambiar un nivel es un cambio editorial: requiere justificación en el PR.
  Subir de nivel no requiere ceremonia; bajar de nivel exige explicar por qué
  la consecuencia disminuyó.
- El gate `check:risk-tiers` verifica cobertura total, ausencia de entradas
  obsoletas, niveles válidos y los requisitos de evidencia de R4 (ver §4).
- Contenido nuevo sin nivel en el registro no pasa CI.

## 3. Política ante incertidumbre

La ausencia de evidencia suficiente nunca se resuelve inventando precisión.
Opciones válidas, en orden de preferencia:

1. reducir la precisión (rangos en vez de cifras exactas);
2. mostrar la incertidumbre de forma explícita;
3. rebajar el nivel de certeza del lenguaje;
4. mantener el valor previo claramente marcado como pendiente, con su fecha;
5. bloquear publicación o actualización si la pieza es R4 y la decisión del
   lector depende del dato faltante.

Prohibido: extrapolar de una fuente a un período que no cubre, presentar una
estimación como valor oficial, o actualizar fechas para aparentar frescura.

## 4. Provenance mínimo por nivel

Mapa entre los campos exigidos y los mecanismos del repositorio:

| Campo conceptual | Mecanismo real |
|---|---|
| `source`, `source_url` | `articleLead.officialSources[]`, `MethodologyBlock` en calculadoras |
| `effective_from` / `effective_to` | `reviewPolicy.dataTriggers`, `volatileData`, snapshot económico |
| `last_verified` | `articleLead.validAsOf`, `CalculatorDataFreshness` |
| `retrieved_at` | `provenance.verifiedAt` del snapshot económico y registro volátil |
| consumidores | `docs/operations/CALCULATOR-REGISTRY.md`, `src/config/editorial-volatile-data-registry.json` |
| incertidumbre / límites | `articleLead.limits`, `articleLead.covers` |

Requisitos por nivel:

- **R3:** al menos una fuente oficial cuando la afirmación sea numérica.
- **R4 artículos:** `articleLead.officialSources` no vacío **y**
  `articleLead.validAsOf` presente.
- **R4 calculadoras:** bloque visible de metodología y fuentes
  (`MethodologyBlock`) en la página.
- **Excepciones:** solo mediante `waivers` en el registro, con motivo y fecha
  de expiración. Un waiver vencido es error de gate; no se renueva sin
  resolver la causa.

## 5. Ownership y cadencias

Owners funcionales (no por página):

| Área | Owner |
|---|---|
| Contenido editorial y páginas institucionales | Carlos Ortega (editor) |
| Metodología y política de correcciones | Carlos Ortega (editor) |
| Parámetros de calculadoras y snapshot económico | Carlos Ortega + worker `economic-snapshot-refresh` |
| Fuentes y datasets volátiles | `src/config/editorial-volatile-data-registry.json` |
| Tests y gates editoriales | Responsable de CI del repo |
| Correcciones | Carlos Ortega (editor), registro en `/correcciones/` |
| Revisión regulatoria | Selectiva por dominio, según disponibilidad (§3 y `NORMA_YMYL.md`) |

Triggers event-driven (preferidos sobre calendarios artificiales): cambio
legal o normativo, actualización de parámetro oficial (UF/UTM/IPC/tasas),
cambio de fuente, cambio de fórmula o cálculo, finding de auditoría, reporte
de un lector. Las cadencias por artículo viven en `reviewPolicy` y no
reemplazan los triggers.

## 6. Piloto y alcance

Piloto 2026-10: cobertura completa de 54 artículos publicados y 22
calculadoras, con el gate verificando cobertura y requisitos R4. La auditoría
factual externa/interna pendiente (#629) usa este registro para priorizar y
para declarar la muestra por nivel de riesgo.

No-objetivos: no crear un score ni una página que declare cumplimiento; no
exigir revisión humana de cada frase; no sobrearquitecturar provenance para
contenido trivial.
