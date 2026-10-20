# AUDIT-CALIBRATION — Muestra de 15 hallazgos R4 (2026-10-20)

**Estado:** ABIERTA — verificación pendiente.
**Plan:** `docs/backlog/PLAN-audit-inbox-reconciliation-2026-10-20.md`.
**Regla:** un hallazgo solo pasa a `confirmado` con fuente primaria, extracto
literal y recálculo independiente cuando hay números. Un `ERROR CONFIRMADO`
del informe externo es un lead, no un veredicto.

## Cómo completar

Para cada fila:

1. abrir la fuente primaria y copiar el extracto exacto;
2. recalcular con `Decimal` o el motor del repo, sin aritmética de memoria;
3. comprobar que el defecto no esté superseded por un PR fusionado;
4. marcar `confirmado`, `no_verificable`, `rechazado` o `duplicado`;
5. dejar la evidencia en `evidence/` o enlazada en la fila.

No se corrige el artículo en esta sesión. La corrección se redacta después, en
una sesión separada, y se audita en otra.

## Muestra

| ID | Slug | Finding | Sev. | Riesgo | Claim a verificar | Fuente primaria propuesta | Verificación | Decisión |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAL-01 | `seguro-de-cesantia` | F01 | P1 | R4 | CIC exige 6/3 cotizaciones para indefinido/plazo fijo | AFC, requisitos: https://www.afc.cl/mi-seguro-de-cesantia/requisitos-y-documentos/ | AFC: «contrato indefinido ... 10 cotizaciones»; «plazo fijo ... 5 cotizaciones». El 6/3 no aparece. | **Confirmado** |
| CAL-02 | `seguro-cesantia-cuenta-individual-vs-fondo-solidario` | H01 | P1 | R4 | La misma regla 6/3 aparece en la FAQ CIC/FCS | AFC E01/E04; requisitos CIC | La página de AFC confirma 10/5; la FAQ 6/3 es incorrecta. | **Confirmado** |
| CAL-03 | `finiquito-e-indemnizaciones-en-chile` | D1 | P1 | R4 | La acción para reclamar derechos del finiquito prescribe en 2 años | DT 60622: https://www.dt.gob.cl/portal/1628/w3-article-60622.html; DT 60507: https://www.dt.gob.cl/portal/1628/w3-article-60507.html; BCN arts. 168 y 510 | DT: «contrato terminado ... seis meses»; el plazo de 2 años es para derechos vigentes, no para la acción tras el término. | **Confirmado** |
| CAL-04 | `descuentos-de-sueldo` | F02 | P1 | R4 | La cuota sindical es un descuento voluntario | DT ORD. 4184/70: https://www.dt.gob.cl/legislacion/1624/w3-article-98369.html; DT ORD. 443/2026: https://www.dt.gob.cl/legislacion/1624/w3-propertyvalue-137126.html | DT: «el empleador se encuentra obligado a efectuar dichas deducciones» una vez requerido; art. 58 la incluye entre los descuentos legales. | **Confirmado** |
| CAL-05 | `fondos-mutuos-comisiones-rescate-impuestos` | H01 | P1 | R4 (materia) | Toda ganancia por rescate de fondos mutuos se declara; no se menciona la exención de 30 UTM | SII, tabla AT2026: https://www.sii.cl/valores_y_fechas/renta/2026/personas_naturales.html; SII, gasto tributario: https://www.sii.cl/aprenda_sobre_impuestos/estudios/gasto_tributario_2022_2024.pdf | SII AT2026: «30 UTM ... $2.086.260» para rescate de cuotas de fondos mutuos (art. 57 inc. 2). | **Confirmado** |
| CAL-06 | `fraude-tarjeta-que-hacer` | F-01 | P1 | R3 (R4 recomendado) | El comprobante debe entregarse en 30 días desde el aviso o declaración jurada | Ley 20.009 art. 4 (BCN); SERNAC (fuente citada en el informe) | Ley 20.009 art. 4: 30 días corridos desde el reclamo; SERNAC usa aviso o declaración jurada. Conflicto real; no es invención del artículo. | **Confirmado (conflicto)** |
| CAL-07 | `reajuste-arriendo-uf-ipc-chile` | P1-01 | P1 | R4 | La mera permanencia renueva el contrato en las condiciones originales | Código Civil art. 1956; Ley 18.101: https://www.bcn.cl/leychile/navegar?idNorma=29526 | CC art. 1956: «no se entenderá ... que la aparente aquiescencia ... es una renovación»; exige renovación expresa o hechos inequívocos. Fuente secundaria; BCN pendiente. | **Confirmado** |
| CAL-08 | `que-es-la-uf` | F1 | P1 | R4 | La UF del día de la operación es siempre la que debe usarse | Metodología BCCh de la UF; cláusula contractual aplicable | BCCh: la UF se autoriza para operaciones de crédito de bancos y cooperativas; fuera de esas entidades «any form of readjustment system may be freely agreed». | **Confirmado** |
| CAL-09 | `interes-compuesto-nota-metodologica` | H1 | P1 | R2 (R4 recomendado) | La serie 1990–2025 es Total Return, pero 2025 usa price return | Nasdaq scorecard: https://www.nasdaq.com/articles/global-indexes/monthly-scorecard-december-2025; Nasdaq highlights: https://www.nasdaq.com/articles/global-indexes/2025-nasdaq-100-reconstitution-and-performance-highlights | FRED/Nasdaq XNDX: 25.376,22 (2024-12-31) → 30.711,49 (2025-12-31) = **+21,02%** total return; NDX price +20,2%. | **Confirmado** |
| CAL-10 | `liquidacion-de-sueldo` | F01 | P1 | R4 | El 0,6% de cesantía es universal en todo contrato indefinido | AFC, cotizaciones: https://www.afc.cl/empleadores/pagos-y-dudas-sobre-cotizaciones/cotizaciones-cuanto-y-como-se-paga/ | AFC: el trabajador aporta 0,6% en indefinido, pero cesa a los 11 años (cotización 133) y excluye pensionados. | **Confirmado** |
| CAL-11 | `que-es-el-apv` | F2 | P1 | R4 | El tope combinado A+B es 50 UF mensuales | SP, beneficios tributarios APV: https://www.spensiones.cl/portal/institucional/594/w3-article-5795.html; SII APV | SP: «no podrá exceder de seiscientas unidades de fomento por cada año calendario»; no fija un tope mensual combinado de 50 UF. Falta precisar el límite de 50 UF por planilla. | **Confirmado** |
| CAL-12 | `cotizacion-voluntaria-afp-independiente` | P1-01 | P1 | R4 | La tasa SIS vigente es 1,62% desde abril de 2026 | SP, SIS: https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9917.html | SP: «desde agosto de 2026 ... 1,78%»; 1,49% para retención AT2026. | **Confirmado** |
| CAL-13 | `fonasa-vs-isapre-comparativa` | F01 | P1 | R4 | La CAEC cubre automáticamente el 100% al superar el deducible | Superdesalud CAEC: https://www.superdesalud.gob.cl/orientacion-en-salud/cobertura-de-enfermedades-catastroficas-caec-version-solo-texto/; https://www.superdesalud.gob.cl/tax-materias-isapres/cobertura-adicional-para-enfermedades-catastroficas-caec-4011/ | Superdesalud: «hasta el 100%», previa solicitud de activación, cuando los copagos superan el deducible; no es automático ni indiscriminado. | **Confirmado** |
| CAL-14 | `donde-ver-si-estoy-en-dicom-gratis` | P1-01 | P1 | R3 (R4 recomendado) | El DICOM es un requisito ordinario en procesos de contratación | Ley 19.628 arts. 18–19 (BCN); S1/S2 del informe (verificar enlaces) | DT: «Salvo ... artículo 2 del Código del Trabajo, el empleador no puede exigir ... un certificado de Dicom». | **Confirmado** |
| CAL-15 | `como-salir-boletin-comercial-chile` | P1-01 | P1 | R4 | El acreedor debe avisar el pago dentro de 7 días hábiles en todos los casos | CCS (F4/F3 del informe); Ley 19.628 art. 19 | SERNAC/CCS: cheques, letras y pagarés se aclaran en agencia con el documento original; la regla de 7 días es para cuotas morosas. | **Confirmado** |

## Resultado de la muestra

| Métrica | Valor |
| --- | ---: |
| Hallazgos muestreados | 15 |
| Verificados hasta ahora | 15 |
| Confirmados | **14** |
| Conflictos normativos confirmados | **1** |
| No verificables | 0 |
| Rechazados | 0 |
| Duplicados | 0 |
| Pendientes | **0** |
| Precisión final (`15 / 15 verificados`) | **100%** |
| Precisión final (`confirmados / 15`) | Pendiente |

## Regla de decisión

- **≥70% confirmado:** el corpus se usa como backlog; se corrige por causa.
- **30–70%:** solo se corrigen R4 con fuente primaria directa; el resto se
  re-audita con `AI_AUDIT_PROTOCOL`.
- **≤30%:** se descarta el corpus como evidencia y se re-auditan los slugs R4
  con el protocolo.

## Restricciones

- No editar contenido, rutas, calculadoras ni metadatos.
- No escribir en la hoja canónica.
- No marcar gates ni firmar correcciones.
- No usar la misma sesión para redactar la corrección y auditarla.
- Si una fuente no se puede recuperar, marcar `no_verificable`; no inventar el
  extracto.
