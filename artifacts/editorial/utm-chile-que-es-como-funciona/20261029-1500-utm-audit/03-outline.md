# Outline de corrección acotada

## Respuesta ancla

- Citar primero el fragmento literal del artículo cuarto transitorio del DL 830: “se reajustará mensualmente […] en el segundo mes que anteceda al correspondiente a la actualización de dicha unidad”.
- Explicar en lenguaje simple que el IPC considerado para una UTM corresponde al segundo mes anterior al mes de actualización (M−2), con ejemplo octubre → IPC de agosto.
- No inventar el día exacto del mes: la norma establece el mes del IPC, no un día calendario de entrada en vigor.
- Responder el valor vigente al corte con la tabla oficial SII: octubre de 2026, $72.151. Conservar septiembre de 2026, $71.721, solo como ejemplo histórico.
- La fecha visible debe acotar la revisión al reajuste UTM y al valor de octubre; los otros ejemplos tributarios no se actualizan ni se consideran auditados en esta corrección.

## Diferenciación / alcance

- Corrección de integridad en tres superficies existentes; no usar benchmark.
- No tocar titular SEO, slug, rutas, fórmulas, snapshot ni valores históricos.
- Citar la norma primaria para el mecanismo y la tabla SII para el monto vigente.

## Secciones/superficies

1. `articleLead.answer`, `validAsOf`, FAQs y cuerpo de la guía.
2. Tabla comparativa, aviso de vigencia, bloque “Dónde ver el valor” y resumen.
3. FAQ, explicación visible y fallback sin JavaScript del conversor.
4. `MethodologyBlock`: nota sobre procedencia del valor y fuentes.
5. Glosario UTM: explicación general y referencia al SII.
6. Entrada nueva de correcciones materiales enlazada a guía, conversor y glosario.

## Auditoría prevista

- MathAudit: confirmar que el diff no cambia cifras, fórmulas ni resultados; inspeccionar las cifras existentes que el escritor modifique incidentalmente.
- Compliance: revisar la precisión de los claims cambiados, fecha visible, coherencia entre superficies, citas y límites.
- HumanEditor: decisión de publicación manual; dejar los gates humanos sin marcar.
