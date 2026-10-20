# HANDOFF — Corrección de `descuentos-de-sueldo` (2026-10-20)

**Estado:** listo para una sesión de redacción distinta. **No ejecutar en la
sesión que auditó.**
**Página:** `src/data/blog/descuentos-de-sueldo.md`
**URL:** https://monedario.cl/posts/descuentos-de-sueldo/
**Riesgo:** R4.
**Auditoría fuente:** informe externo
`2026-10-19-0200-descuentos-de-sueldo.md`, calibración CAL-04.
**Registro:** `src/data/correcciones.json` si la corrección es material.

## 1. Por qué esta página primero

- 5 hallazgos P1 confirmados en una sola página.
- Fuentes DT claras y verificables.
- Alto impacto para trabajadores que revisan su liquidación.
- No requiere una URL nueva ni un cambio de slug.
- Es la causa más acotada para el primer ciclo de corrección.

## 2. Hallazgos que debe resolver la sesión de redacción

### F01 — P1 — atraso vs. tiempo no trabajado

El texto trata todo descuento por atraso como una multa que exige reglamento
interno. La DT distingue el descuento proporcional por tiempo no laborado de la
multa disciplinaria. Hay que separar ambos conceptos y explicar límites y
excepciones (atraso recuperado, causas no imputables).

Fuente: DT ORD. N°1578,
https://www.dt.gob.cl/legislacion/1624/w3-article-115035.html; ORD. N°2423,
https://dt.gob.cl/legislacion/1624/w3-article-112152.html.

### F02 — P1 — cuota sindical

El texto la incluye entre los descuentos “autorizados”. Una vez requerido por
el sindicato, el empleador está obligado a descontar la cuota ordinaria; la
afiliación y la procedencia tienen condiciones, pero no es una autorización
revocable simple.

Fuente: DT ORD. N°4184/70,
https://www.dt.gob.cl/legislacion/1624/w3-article-98369.html; ORD. N°443/2026,
https://www.dt.gob.cl/legislacion/1624/w3-propertyvalue-137126.html; art. 58
del Código del Trabajo.

### F03 — P1 — crédito social CCAF

El texto lo presenta como un descuento meramente autorizado. El consentimiento
nace al contratar el crédito, pero una vez constituida la obligación el
descuento por planilla es obligatorio para el empleador en las condiciones
legales. Hay que distinguir consentimiento inicial de retención legal.

Fuente: DT ORD. N°262/4,
https://www.dt.gob.cl/legislacion/1624/w3-article-100110.html; ORD. N°4527/93,
https://www.dt.gob.cl/legislacion/1624/w3-article-100008.html; art. 22 Ley
18.833.

### F04 — P1 — “todos se calculan sobre el sueldo imponible”

La afirmación mezcla bases distintas. AFP/salud y AFC tienen topes diferentes;
el Impuesto Único se calcula sobre renta líquida tributable; los descuentos
convencionales del art. 58 se calculan sobre el bruto total con sus propios
límites. Hay que reemplazar la regla única por una tabla de bases.

Fuente: DT,
https://dt.gob.cl/portal/1628/w3-article-60214.html; SII,
https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm;
DT, https://www.dt.gob.cl/legislacion/1624/w3-article-127125.html.

### F05 — P1 — fuente principal equivocada

`officialSources[0]` apunta a
`https://www.dt.gob.cl/portal/1628/w3-article-60593.html`, una consulta sobre
indemnización por años de servicio (arts. 161/163), no al art. 58. Reemplazar
por una fuente que reproduzca el art. 58 y comprobar el destino.

Fuente propuesta: DT ORD. N°680,
https://www.dt.gob.cl/legislacion/1624/w3-article-111170.html.

### F06 — P2 — 0,6% AFC no es universal

El 0,6% del trabajador tiene un máximo de 11 años por relación laboral
(cotización N°133); después corresponde el 0,8% patronal al FCS. También hay
exclusiones de afiliación, como pensionados. La tabla debe dejar de decir “Sí”
sin matices.

Fuente: AFC,
https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/.

### F07 — P2 — “Fonasa exactamente 7%” sin tope

El 7% se aplica sobre la base imponible con tope de 90 UF. Hay que explicar la
base y el tope, y mantener la diferencia entre cotización legal y precio
adicional del plan Isapre.

Fuente: SP,
https://www.spensiones.cl/portal/institucional/594/w3-article-16921.html.

### F08 — P2 — límites a descuentos convencionales

La autorización escrita no elimina los topes legales: 15% general, hasta 30%
en supuestos específicos de vivienda/educación y 45% global convencional, según
la DT. Hay que incorporar los límites y sus condiciones.

Fuente: DT ORD. 3456/37,
https://dt.gob.cl/legislacion/1624/w3-article-102449.html; ORD. 2897/33,
https://www.dt.gob.cl/legislacion/1624/w3-article-102341.html.

## 3. Superficies que debe barrer la corrección

1. **Cuerpo:** secciones “Tres categorías”, tabla de contrato, FAQ.
2. **Metadatos:** `description`, `articleLead`, `validAsOf`.
3. **Datos estructurados:** `FAQPage` y `Article` si cambian las respuestas.
4. **Catálogo/LLM:** `src/config/calculatorPortfolio.ts`,
   `llms-full.txt` y glosario si citan la regla.
5. **Contenido relacionado:** `liquidacion-de-sueldo`,
   `sueldo-imponible-chile`, `primer-empleo-chile-guia-completa` y
   `seguro-de-cesantia`.
6. **Motor/tests:** no hay motor propio en esta página; si se toca la
   calculadora enlazada, agregar vector de regresión.

## 4. Criterios de aceptación

- [ ] F01–F05 corregidos con fuente y explicación visible.
- [ ] F06–F08 corregidos o diferidos con razón explícita.
- [ ] Sin cambios de slug, URL, canonical ni `topicRole`.
- [ ] `pnpm run check:frontmatter`.
- [ ] `pnpm run check:editorial`.
- [ ] `pnpm run check:correcciones` si hay entrada nueva.
- [ ] `pnpm run check:links`.
- [ ] Revisión independiente en sesión/modelo distinto.
- [ ] `humanSignoff` antes de publicar.
- [ ] Entrada en `src/data/correcciones.json` si el cambio es material.

## 5. Lo que no debe hacer esta corrección

- No crear URLs nuevas.
- No cambiar el slug ni el canonical.
- No tocar `#652`, `#536` ni el experimento IPC.
- No marcar gates `[X]`.
- No corregir `seguro-de-cesantia` en el mismo PR: va en la causa siguiente.
- No usar la sesión de auditoría para redactar.

## 6. Rollback

Revert único del PR. Si se publicó y se revierte, retirar la entrada de
`correcciones.json` solo si la corrección material también se revierte.

## 7. Próxima sesión

Abrir una sesión limpia, con este handoff y el informe externo como alcance.
Redactar el diff mínimo; no auditarlo en esa misma sesión. Después, una sesión
distinta completa el `02-result.json` y el `humanSignoff`.
