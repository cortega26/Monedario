# AUDIT-INBOX — Reconciliación y manifiesto (2026-10-20)

**Estado:** paso 0 completado; calibración 15/15 (14 confirmados + 1 conflicto).
**Fuente:** carpeta externa `Monedario-Audit-Inbox` (Google Drive).
**Plan:** `docs/backlog/PLAN-audit-inbox-reconciliation-2026-10-20.md`.
**Manifiesto:** `docs/reports/AUDIT-INBOX-MANIFEST-2026-10-20.csv`.
**Calibración:** `docs/reports/AUDIT-CALIBRATION-WORKSHEET-2026-10-20.md`.

## 1. Snapshot

| Métrica | Valor |
| --- | --- |
| Informes | 46 archivos Markdown |
| Slots | 1–48 de 53; faltan 2 y 23; 49–53 pendientes |
| Slugs únicos | 46 |
| Veredicto | 46 `FAIL`; 0 `PASS` |
| Estado declarado en cabecera | 1 `AUDITADO`, 1 `MIXTO`, 10 `INVESTIGADO`, 7 `INVESTIGADO_PARCIAL`, 1 `PUBLICADO`, 26 sin campo uniforme |
| Registro en hoja | 0; los informes declaran `PENDIENTE` o `REGISTRADO_SHEET=NO` |
| Cierre con revisión independiente + firma | 0 |
| Riesgo declarado | 28 R4, 10 R3, 6 R2, 2 sin nivel explícito |
| Encabezados | ~190 `ERROR CONFIRMADO`, 43 `SOSPECHA`, 24 `NO VERIFICABLE`, 8 `SIN ERROR` |

El “0/54” del issue #688 mide el writeback a la hoja canónica, no la
existencia de informes. La lectura correcta es: **46 auditadas, 0 registradas,
0 cerradas**. El estado de la hoja no se pudo verificar directamente porque
sigue restringida; se usa lo que declaran los informes.

## 2. Distribución por clúster

| Clúster | Informes |
| --- | ---: |
| Remuneraciones | 8 |
| Impuestos / renta | 7 |
| Deudas / crédito | 7 |
| Inversión / ahorro | 6 |
| Previsión / AFP | 4 |
| Migrantes / presupuesto | 3 |
| UF / IPC / reajuste | 3 |
| AFC / seguro | 2 |
| Beneficios / seguros | 2 |
| Salud | 1 |
| Fraude / estafas | 1 |
| Otros | 2 |

La distribución es orientativa. No se usa para abrir 11 PRs: se usa para elegir
**causas** de corrección y evitar canibalización.

## 3. Solapamiento con auditorías previas

Ocho slugs ya tienen un informe en `docs/reports/AUDIT-*`:

- `indemnizacion-anos-de-servicio-chile`
- `tarjeta-credito-costo-real-chile`
- `fonasa-vs-isapre-comparativa`
- `como-hacer-presupuesto-mensual-chile`
- `como-salir-boletin-comercial-chile`
- `credito-hipotecario-chile-guia-completa`
- `el-poder-del-interes-compuesto`
- `fondos-afp-a-b-c-d-e`

Antes de tratar un hallazgo como nuevo, hay que comprobar si ya está en esos
informes, en `src/data/correcciones.json` o en un artefacto
`docs/editorial/audits/**`. El manifiesto incluye las columnas `prior_audit` y
`correction` para ese cotejo.

## 4. Supersesión conocida

Ninguna auditoría completa está superseded. Hay correcciones parciales:

| PR / corrección | Qué cubre | Qué no cubre |
| --- | --- | --- |
| **#712** (2026-10-20) | `fraude-tarjeta`: plazo de 3 días desde la restitución | F-01 (30 días), F-02 (billeteras), F-06 (ficha Ley 20.009) |
| **#711** (2026-10-20) | `fondos-mutuos`: rescate en 10 días, metadatos/hero | H01–H03 tributarios, H04 doble cómputo, H05–H07 |
| **#696** (2026-10-19) | `liquidacion-de-sueldo`: enlace art. 54 | F01/F02 (AFC y sindicato), topes, FAQ |
| **#705** (2026-10-19) | `devolucion` y `rentas-mixtas`: parte de las correcciones | Observaciones SII, exceso de pago, APV B |
| **#713** (2026-10-20) | `interes-compuesto`: hero de siete hitos | H1 benchmark, H3 tasa nominal/efectiva, H4 contexto |
| **#709** (2026-10-20) | Tablas UF/UTM server-side | Afirmaciones legales y frescura de `que-es-la-uf` |
| **#685** (cerrado 2026-10-19) | Nada: cerró sin merge | Seguro de cesantía, CIC/FCS, finiquito |

La regla es: **un PR fusionado no cierra la auditoría completa**. Solo cierra el
hallazgo cuya superficie fue verificada. Si el audit habla del motor y el PR
tocó el artículo, no está superseded.

## 5. Qué no es evidencia cerrada

- Un encabezado `ERROR CONFIRMADO` es una **alegación del auditor**, no una
  verdad verificada por el repo.
- 24 afirmaciones están marcadas `NO VERIFICABLE` y 43 `SOSPECHA`; no deben
  entrar al backlog como bugs.
- Hay un “posible falso positivo” explícito en `fraude F-01`: SERNAC reproduce
  la formulación del artículo; el conflicto con la Ley 20.009 es real, pero no
  prueba que Monedario haya inventado la regla.
- `credito-hipotecario` usa una copia indexada antigua; no prueba un defecto de
  producción actual.
- `fonasa` observó 403, no 404, en el enlace viejo; el repo ya tiene el
  cotizador nuevo.
- `interes-compuesto` no refutó el valor final USD 129.495; el 13,7x y el
  sueldo mínimo sí son correctos.

## 6. Muestra de calibración (15)

Se seleccionaron 15 hallazgos R4 de páginas distintas:

| ID | Slug | Finding |
| --- | --- | --- |
| CAL-01 | `seguro-de-cesantia` | F01 |
| CAL-02 | `seguro-cesantia-cuenta-individual-vs-fondo-solidario` | H01 |
| CAL-03 | `finiquito-e-indemnizaciones-en-chile` | D1 |
| CAL-04 | `descuentos-de-sueldo` | F02 |
| CAL-05 | `fondos-mutuos-comisiones-rescate-impuestos` | H01 |
| CAL-06 | `fraude-tarjeta-que-hacer` | F-01 |
| CAL-07 | `reajuste-arriendo-uf-ipc-chile` | P1-01 |
| CAL-08 | `que-es-la-uf` | F1 |
| CAL-09 | `interes-compuesto-nota-metodologica` | H1 |
| CAL-10 | `liquidacion-de-sueldo` | F01 |
| CAL-11 | `que-es-el-apv` | F2 |
| CAL-12 | `cotizacion-voluntaria-afp-independiente` | P1-01 |
| CAL-13 | `fonasa-vs-isapre-comparativa` | F01 |
| CAL-14 | `donde-ver-si-estoy-en-dicom-gratis` | P1-01 |
| CAL-15 | `como-salir-boletin-comercial-chile` | P1-01 |

La hoja de trabajo contiene la afirmación, la fuente primaria propuesta y las
columnas de verificación. No se completa con una segunda pasada del mismo
auditor: se completa con fuente y recálculo.

**Muestra completa (15/15):** CAL-01 a CAL-15 quedaron **verificados** con
fuente oficial o secundaria identificada (14 errores confirmados + 1 conflicto
normativo): AFC 10/5, DT seis meses, DT cuota sindical obligatoria, SII 30 UTM,
Ley 20.009 vs SERNAC, CC art. 1956, AFC 0,6% con excepción de 11 años, SP 600
UF anuales, SP SIS 1,78%, Superdesalud CAEC, DT DICOM, BCCh UF, Nasdaq XNDX
+21,02% y CCS/SERNAC para cheques y letras.

### 6.1 Causas candidatas y orden propuesto

Con 15/15 hallazgos verificados (14 errores confirmados y 1 conflicto), el corpus no parece ruido. El
orden propuesto respeta el WIP máximo de 2 causas:

1. **`descuentos-de-sueldo`** — 5 P1 confirmados en una sola página, fuentes DT
   claras y alto impacto para trabajadores. Es el primer candidato a corrección.
2. **AFC / seguro de cesantía** — CAL-01, CAL-02 y CAL-10 confirmados;
   `#685` cerró sin merge; afecta dos guías y una calculadora. Requiere barrido
   de seis superficies.
3. **`finiquito-e-indemnizaciones-en-chile`** — CAL-03 confirmado; plazo de
   acción mal explicado. Se difiere hasta cerrar una de las dos causas
   anteriores.
4. **Fondos mutuos / APV** — CAL-05 y CAL-11 confirmados; mayor complejidad
   tributaria y revisión legal específica. Se difiere.
5. **Fraude Ley 20.009** — CAL-06 es un conflicto normativo real, no un error
   simple; requiere revisión jurídica independiente antes de tocar copy.
6. **DICOM / boletín** — CAL-14 confirmado; CAL-15 pendiente de fuente CCS.
   Se difiere.

No se abre corrección en esta sesión: la sesión que redacte debe ser distinta
de la que auditó.

## 7. Decisión que habilita la calibración

| Precisión de la muestra | Decisión |
| --- | --- |
| ≥70% confirmado | Usar el corpus como backlog y corregir por causa. |
| 30–70% | Corregir solo R4 con fuente primaria directa; re-auditar el resto. |
| ≤30% | Descartar el corpus como evidencia y re-auditar los R4 con el protocolo. |

La precisión no es un adorno estadístico: es el dato que decide si se invierte
en 190 hallazgos o en 26 páginas R4.

## 8. Límites de este informe

- No se verificaron las 46 auditorías ni sus fuentes primarias en esta sesión.
- La muestra de calibración no es aleatoria: se eligieron R4 con fuente
  concreta. El 12/12 no se extrapola a los ~190 encabezados; sirve para decidir
  si el corpus merece remediación, no para certificar todo el corpus.
- No se escribió en la hoja canónica ni en GitHub.
- No se modificó contenido, ruta, cálculo ni metadato.
- Los conteos por encabezado no son conteos de hallazgos únicos; algunos
  informes usan tablas y no son comparables.
- La calibración debe hacerse en una sesión de auditoría, no en la sesión que
  redacte la corrección.

## 9. Próxima acción

Completar `docs/reports/AUDIT-CALIBRATION-WORKSHEET-2026-10-20.md` con los 15
hallazgos y registrar la precisión. Después se eligen tres causas y se abre el
primer paquete de corrección, con revisión independiente y firma humana.
