# Dossier — Cómo elegir una inversión en Chile: plazo, riesgo y objetivos

- Slug: `como-elegir-inversion-segun-plazo-riesgo-objetivos`
- Backlog: ED-016
- Categoría: ahorro-inversion · Cluster: `ahorro-e-inversion` · topicRole: `support`
- canonicalTopic: `criterios-decision-inversion`
- Fecha de corte: 2026-06-25
- Run id: 20260625-1405-ed016
- Riesgo YMYL: medio · requires_calculation: false (sin math audit)

## Contexto editorial

Pieza de soporte del owner del cluster
(`ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026`). Ordena las preguntas
previas a elegir un instrumento —horizonte, liquidez, tolerancia a la pérdida y
tributación— sin entregar ranking de productos ni carteras modelo. Incluye un checklist
interactivo de preparación (`InversionReadinessChecklist`) cuyo resultado mapea preparación,
nunca recomendación de instrumento.

## Fuentes oficiales consultadas (verificación con fetch real, 2026-06-25)

- **CMF Chile** — [Perfil del inversionista](https://www.cmfchile.cl/educa/621/w3-article-1252.html) (2026-06-25): nueve factores, incluidos "edad y horizonte de inversión" y "tolerancia al riesgo". No enuncia literalmente "a mayor plazo, más riesgo tolerable".
- **CMF Chile** — [¿En qué instrumentos invertir?](https://www.cmfchile.cl/educa/621/w3-article-518.html) (2026-06-25): definición de renta fija (rentabilidad fija/conocida si se mantiene al vencimiento) y renta variable (rentabilidad incierta, puede ser negativa).
- **CMF Chile** — [Los distintos tipos de Fondos Mutuos](https://www.cmfchile.cl/educa/621/w3-article-1655.html) (2026-06-25): el plazo de rescate lo fija el reglamento interno de cada fondo.
- **SII** — [Intereses de persona natural (Art. 20 N°2 LIR)](https://www.sii.cl/preguntas_frecuentes/declaracion_renta/001_140_2738.htm) (2026-06-25): intereses de DAP son rentas de capitales mobiliarios, se declaran en Línea 8 del F22 y quedan afectos al IGC (exención 13,5 UTA / 20 UTM según el caso).
- **SII** — [Mayor valor en rescate de fondos mutuos (Art. 108 y 109 LIR)](https://www.sii.cl/normativa_legislacion/jurisprudencia_administrativa/ley_impuesto_renta/2018/ja1959.htm) (2026-06-25): fuera del Art. 107, exento de IDPC pero afecto a IGC/Adicional.
- **SII** — [Circular N°39 de 2022 (Art. 107 LIR, presencia bursátil)](https://www.sii.cl/normativa_legislacion/circulares/2022/circu39.pdf) (2026-06-25): mayor valor en venta de acciones/cuotas con presencia bursátil puede ser ingreso no renta si se cumplen los requisitos.
- **BCN** — [Ley sobre Impuesto a la Renta — DL 824, idNorma 6368](https://www.bcn.cl/leychile/navegar?idNorma=6368) (2026-06-25): texto consolidado de la LIR (corrige el idNorma erróneo 15774 del research inicial).

> El catálogo completo de claims (C1–C17, E1–E4), su estado de verificación y el log de
> consultas están en `docs/editorial/artifacts/como-elegir-inversion-segun-plazo-riesgo-objetivos/02-research.md`
> (§Verification Log, 2026-06-25). El outline (`03-outline.md`) y el draft (`04-draft.md`)
> también residen en esa carpeta legacy.

## Observaciones de benchmark (input estratégico, NO fuente factual)

- La query "dónde invertir mi dinero Chile" está dominada por comparadores de instrumentos
  y bancos; hay un hueco real en el ángulo de "prerequisitos y criterios previos".
- Diferenciación: encuadre "¿estás listo?" (preparación) frente a "¿qué es mejor?" (ranking).
- Varios competidores usan tests de perfil que terminan recomendando producto; esta pieza
  evita ese patrón: el checklist mapea preparación, no perfil ni producto.

## Gap / oportunidad

- Owner del cluster cubre instrumentos/costos/impuestos; falta la pieza de "criterios
  previos" como paso anterior. ED-016 ocupa ese hueco como `support`, con interlinking
  jerárquico hacia el owner y hacia fondo de emergencia, DAP, fondos mutuos y ETFs.

## Restricciones de tratamiento (verificadas)

- Umbrales "3 meses" (fondo de emergencia) y "12 meses" (horizonte): CMF NO los fija como
  norma → presentar como heurística educativa con lenguaje condicional.
- Tributación (DAP, fondos mutuos, ETFs): mencionar la existencia del tratamiento y el
  artículo aplicable, remitir al SII; NO detallar tasas ni condiciones cambiantes.
- Prohibido: rankings, carteras modelo por edad, porcentajes de asignación, nombres de
  instituciones como "mejores opciones", retornos/proyecciones (gatillarían math audit).

## Nota de gates

Gate 06 (ComplianceAgent) debe ejecutarse en una sesión fresca de Claude Code, adversarial,
sin contexto de la sesión de research/draft. Gate 07 (publish-packet) es exclusivamente del
editor humano (pubDate, heroImage, sign-off). Ningún gate humano se marca automáticamente.
