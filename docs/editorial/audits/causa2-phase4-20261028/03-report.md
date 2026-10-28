# Auditoría adversarial de cumplimiento — causa 2, fase 4

**Veredicto: FAIL**  
**Riesgo:** R4  
**Commit auditado:** 7a001163179467efef5c14f3bfd1f59141f66aad  
**Base:** main, 32ac7dc76c06c71ac2de68533efdd417a43d825f  
**Fecha:** 2026-10-28  
**Auditor:** GPT-6, familia OpenAI/Codex; sesión 01a180a1-0cc9-7a63-96b4-fabf82f9f4d4  
**Independencia:** verificada frente a la familia DeepSeek de la sesión redactora. El runtime no expone identificador de build/minor adicional a GPT-6.

## Alcance y método

Verifiqué primero rama y SHA; coinciden con el objetivo. Leí el plan, ADR, waiver, AI_AUDIT_PROTOCOL v1, NORMA_YMYL, registros de AFP y nómina, artículos corregidos y diff completo. Para el clúster revisé también dos artículos enlazados que no se cambiaron: la guía de cotización voluntaria/independiente y la guía de sueldo imponible. No reaudité la pieza descuentos-de-sueldo.md.

Consulté el 2026-10-28 fuentes oficiales de BCN (API LeyChile), DT, SP, SII, AFC y Superintendencia de Salud. Las URL, extractos literales y fechas están en [extractos de fuentes](evidence/web-extracts-2026-10-28.txt) y [extractos oficiales](evidence/official-source-extracts-2026-10-28.txt); respuestas de la API BCN se conservan en JSON y texto. La SPA de LeyChile devolvió una pantalla de compatibilidad; la API oficial indicada por el prompt respondió HTTP 200 para las tres normas.

Recalculé los valores con Python desde los montos publicados y los registros vigentes en el commit. Corrí el gate de consistencia, su mutación en una fixture temporal, la revisión de no-post-id, rutas y RSS, y los tres checks de metadatos de portada. El entorno fue Linux x86_64, Node 24.19.0, pnpm 11.7.0 y Python 3.13.12. El repositorio documenta Node 22; por tanto, el resultado local del gate está probado en Node 24, no en Node 22. No ejecuté build ni suite completa.

El validador de artefactos del proyecto, pnpm run check:audit-artifacts, pasó y reconoció este resultado FAIL como válido; su salida está en [check-audit-artifacts.txt](evidence/check-audit-artifacts.txt).

## Resultado por claim

| Claim | Resultado | Evidencia y conclusión |
|---|---|---|
| D1 gratificación | OK | DT: “A contar del 01 de mayo de 2026 el Ingreso Mínimo Mensual es de: $553.553”. BCN art. 50: “no excederá de cuatro y tres cuartos (4,75) ingresos mínimos mensuales”. El recálculo da $2.629.376,75; el artículo identifica correctamente el límite anual. |
| D2 ejemplo líquido | **DIVERGENT** | SP confirma Capital 1,44%; SII abril ubica $1.092.960 en 4% y fija rebaja $37.740,06. Las contribuciones $257.040, RLI $1.092.960 y retención redondeada $5.978 son reproducibles. Sin embargo, las filas mostradas producen $1.386.982 si se suma la colación; el total impreso $1.236.982 la descuenta una sola vez. El supuesto además dice que la remuneración imponible “incluye” una colación no imponible. La tabla no es aritméticamente consistente. |
| D3 AFC | OK | Ley 19.728 arts. 5 y 9 y tabla AFC concuerdan: indefinido 0,6% trabajador + 1,6% CIC + 0,8% FCS patronal; plazo fijo 2,8% CIC + 0,2% FCS patronal; casa particular 2,2% CIC + 0,8% FCS patronal. No se detectó duplicación del 2,4% ni atribución de todo el 3% al FCS. |
| D4 SIS | **DIVERGENT en el clúster** | SP: desde agosto de 2026 la tasa vigente es 1,78%; para retención de impuestos de independientes, AT 2026, 1,49%. El párrafo nuevo separa esos regímenes. Pero cotizacion-voluntaria-afp-independiente.md aún presenta 1,62% como “tasa vigente” desde abril de 2026. No verifiqué con una captura histórica oficial el período exacto anterior de 1,62%; sí verifiqué que la afirmación de vigencia que hoy mantiene esa página contradice la ficha actual de SP. |
| D6 AFP y totales | **DIVERGENT en el clúster** | SP distingue ahorro obligatorio 10% y comisión 0,46%–1,45%. Los totales nuevos (18,06%–19,05%; casa particular 17,46%–18,45%) suman correctamente. La guía enlazada sueldo-imponible-chile.md aún afirma aproximadamente 10,5% de cotización obligatoria y calcula con 10,5%, más comisión. |
| D7 comisión | OK | SP y registro: mínimo Uno 0,46%; máximo Provida 1,45%. |
| D8 afiliación y traspaso | **DIVERGENT en elegibilidad** | SP define 24 meses para quien ingresa por primera vez al sistema obligatorio; las excepciones por alza de comisión o AFP más barata están respaldadas. La asignación a Uno sí está acotada al 01-10-2025–30-09-2027. DL 3.500 art. 165 permite traspasarse “en cualquier oportunidad”; art. 160 da 30 días corridos al grupo licitado para no integrarse. La frase del artículo “primer empleo formal” no equivale con precisión a “primera afiliación al sistema”: alguien pudo cotizar antes como independiente o afiliado voluntario. |
| D13 tabla de bases y topes | **DIVERGENT** | En la tabla modificada, los límites 90 UF/6,3 UF de salud, 135,2 UF AFC, 11 años CIC y 15%/30%/45% están sustentados. SII dice que la base del IUSC descuenta cotizaciones previsionales y de salud del trabajador; DT confirma que el 15% de descuentos convenidos se calcula sobre bruto antes de descuentos obligatorios. No obstante, la tabla omite que el 0,6% AFC trabajador no aplica a plazo fijo y omite la condición de pago directo al acreedor para el límite de 30%. Además, la guía enlazada de sueldo imponible aplica el IUSC a $1.200.000 brutos sin restar sus descuentos previsionales. |
| D14 salud | OK | Superintendencia de Salud: 7%, tope mensual 90 UF y máximo legal 6,3 UF desde remuneraciones de febrero de 2026. El ejemplo de $1.350.000 equivale a 32,746 UF y el 7% da $94.500, bajo tope. A 89/90/100 UF el cálculo da 6,23/6,30/6,30 UF. La fuente separa el precio de plan Isapre sobre el aporte legal del copago de cada prestación. |
| D16 corrección #719 | OK | El diff del commit 1f939ae4 muestra que el texto categórico sobre pérdidas de caja, herramientas y mercadería se sustituyó por el catálogo del art. 58 y la precisión de DT ORD. 4229/2015 sobre pérdidas de dinero sin asignación de caja. La entrada de correcciones.json resume ese cambio sin suavizarlo ni ampliarlo. |
| Gate | OK, con cobertura limitada | Está en check:ci. Baseline: exit 0. Una copia temporal que cambia Capital de 1,44%/11,44% a 0,58%/10,58% da exit 1 y detecta dos divergencias. Su cabecera declara que solo cubre comisiones AFP; SIS, ventana de cambio, impuesto y bases quedan fuera. |
| Metadatos | OK | Corte y actualizaciones se fechan 2026-10-28, coincidente con la consulta de fuentes. lastReviewed/reviewedBy quedan nulos. computedAt preexistentes no se usan como revisión humana. |
| Invariantes | Parcial / UNVERIFIED | Diff: 12 archivos, 136 inserciones y 84 eliminaciones. No cambian slug, canonical ni topicRole; descuentos-de-sueldo.md no aparece; no se marca [X]; diff --check y check:no-postid-urls pasan. El comparador de rutas pasa con 53/54 y una adición permitida: /posts/cotizacion-voluntaria-afp-independiente/. RSS compara 52/53 sin removidos, pero se basa en el dist/rss.xml existente y no prueba que se generara desde este SHA. |
| Portadas | OK (solo hashes/revisión) | Los checks de hero pasan; sourceContentHash, revisiones aceptadas y hashes AVIF registrados coinciden con archivos actuales. Los AVIF no cambiaron en el diff. No evalué calidad visual. |

Los recálculos crudos están en [recompute-output.txt](evidence/recompute-output.txt). Los comandos de invariantes y sus salidas están en [diff/invariantes](evidence/local-diff-invariants-and-cluster.txt), [no-post-id](evidence/check-no-postid-urls.txt), [rutas](evidence/check-routes-under-audit.txt) y [RSS](evidence/check-rss-under-audit.txt).

## Defectos abiertos

### Producto

- **P-D2-ROW-SUM — alta, D2:** la suma de filas y las etiquetas de base discrepan en $150.000. Para bruto total de $1.500.000 que ya contiene la asignación no imponible, la línea “+ colación” duplica esa suma. Si $1.500.000 fuese solo bruto imponible, el total pagado y líquido serían distintos. El ejemplo no deja una interpretación que haga consistentes todas sus filas.
- **P-D4-STALE-SIS-CLUSTER — media, D4:** una página enlazada conserva 1,62% como SIS vigente aunque la ficha SP consultada da 1,78% desde agosto de 2026.
- **P-D6-STALE-10_5 — media, D6:** la guía de sueldo imponible mantiene el 10,5% de ahorro AFP y lo usa en un cálculo, en conflicto con la fuente SP y la página corregida.
- **P-D8-ELIGIBILITY-WORDING — media, D8:** “primer empleo formal” ensancha el grupo frente al criterio de primera entrada al sistema obligatorio; el artículo tampoco muestra el fin de la adjudicación de AFP Uno el 30-09-2027.
- **P-D13-LINKED-TAX-BASE — media, D13/clúster:** la guía enlazada calcula IUSC sobre bruto sin restar AFP, salud y AFC trabajador. Sus tres deducciones enumeradas suman $217.200 y dejan $982.800 antes de comisión AFP. Con ahorro 10%, AFC 0,6%, salud 7% y comisión AFP del registro, la RLI queda entre $971.400 y $983.280 ($971.520 con Capital); usar el bruto como base sobrestima la base entre $216.720 y $228.600 y el impuesto entre $8.668,80 y $9.144 al 4%.
- **P-D13-AFC-AND-CREDIT-CAVEATS — baja, D13:** la tabla resume 0,6% AFC trabajador sin excluir contratos a plazo fijo y presenta el 30% de crédito de vivienda/educación sin la condición estatutaria de pago directo a la institución financiera o servicio educacional.

### Paquete de auditoría

- **A-R8-OUTSIDE-DIRECTORY — baja:** una ejecución anterior de check:rss escribió output/validation/rss_snapshot_after.json fuera del directorio autorizado. No pude determinar si el archivo ya existía y no lo borré. Detalle en [R8-deviation.txt](evidence/R8-deviation.txt).

## Respuestas a las preguntas adversariales

1. **SIS 1,78%:** sí. La ficha SP indica tasa vigente desde agosto de 2026 y señala que el seguro lo financian los empleadores; la ficha enumera a los dependientes como grupo cubierto. 1,49% se refiere aparte a retención de impuestos por cotización independiente en AT 2026.

2. **1,62% en el clúster:** sí, cotizacion-voluntaria-afp-independiente.md aún lo llama vigente. No verifico en una fuente histórica oficial que 1,62% rigiera exactamente abril–julio; la propia página actual SP basta para establecer la contradicción vigente. Es un defecto de producto de esta remediación porque el alcance exige coherencia del clúster de tasas, no un seguimiento editorial opcional.

3. **Ventana de 24 meses:** el plazo se aplica a quienes se afilian por primera vez al sistema obligatorio, sujeto a las excepciones de comisión; no solo al proceso 2025–2027. La asignación a AFP Uno sí corresponde a esa licitación y la SP fija su ventana hasta 30-09-2027. “Primer empleo formal” no es un criterio suficientemente preciso para identificar primera afiliación.

4. **Sin límite anual:** está respaldado para el cambio voluntario tras el periodo inicial o cuando opere una excepción. El art. 165 permite a los afiliados del grupo licitado traspasarse “en cualquier oportunidad”. Por tanto, no encontré una afirmación huérfana; el texto debe leerse junto con el periodo inicial de 24 meses.

5. **Mes y tramo IUSC:** sí usa abril 2026. Con Capital 1,44%, RLI $1.092.960 queda entre $943.501,51 y $2.096.670,00, tramo de factor 4%; el impuesto exacto es $5.978,34, redondeado a $5.978. Variar la comisión dentro de 0,46%–1,45% no desplaza este ejemplo fuera del tramo del 4%. La divergencia está en las filas y en el tratamiento de colación, no en el tramo elegido.

6. **Base D13:** la tabla nueva expresa correctamente la regla general del IUSC y las bases brutas de descuentos convenidos, pero omite dos condiciones de borde. La guía enlazada sí tiene una base errónea: calcula el impuesto sobre bruto sin las cotizaciones que el SII ordena deducir.

7. **Tope Fonasa:** sí, la fuente establece 7% sobre base con tope de 90 UF y máximo 6,3 UF. El ejemplo de $1.350.000 está bajo el tope y su 7% es $94.500. Los bordes 89, 90 y 100 UF dan 6,23, 6,30 y 6,30 UF.

8. **Correcciones #719:** describe el cambio real. El commit previo confirma la sustitución de la prohibición categórica por el texto legal y la precisión de DT sobre pérdidas de dinero en ausencia de asignación de caja.

9. **Gate:** está verde para lo que comprueba: comisiones AFP relacionadas por nombre con el registro. La mutación AFP lo hace fallar. Una tasa SIS errónea, ventana de traslado, base de impuesto o tope no causan fallo en este gate; su cabecera lo declara. El gate no ofrece evidencia sobre esos vectores.

10. **Invariantes:** no se cambian slugs, canonical ni topicRole; el artículo descuentos-de-sueldo.md no fue editado y el diff no marca [X]. Los comparadores de rutas y RSS aceptan una adición permitida para cotizacion-voluntaria-afp-independiente; el RSS no fue generado en esta auditoría desde el commit objetivo.

## Limitaciones y veredicto

Las fuentes oficiales y los cálculos principales se pudieron verificar. El periodo histórico exacto de la tasa 1,62% no quedó verificado, y el RSS usado en la comparación no tiene procedencia demostrada desde el SHA auditado. Esto no se rellena con memoria.

El veredicto es **FAIL** según AI_AUDIT_PROTOCOL v1: el ejemplo D2, cifra central para la liquidación de sueldo, no se reproduce al sumar sus filas; permanecen además afirmaciones incompatibles con fuentes vigentes en el clúster. Hay defectos de producto abiertos. No se completó humanSignoff, no se marcó ningún gate y este informe no declara publicable la pieza.

`humanSignoff` queda null. Sin revisión humana.

