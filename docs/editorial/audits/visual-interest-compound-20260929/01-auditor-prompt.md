# Auditoría adversarial pendiente — gráficos de interés compuesto

Inicia una sesión fresca de otra familia de modelos; el autor pertenece a GPT.
No cargues el historial del autor. Actúa como MathAuditAgent según
`docs/editorial/AI_AUDIT_PROTOCOL.md` y `context/EDITORIAL_AI_PIPELINE.md`.
Esta plantilla no es un dictamen ni una solicitud de firma automática.

Lee `00-scope.json`, los archivos delimitados, `evidence/01-sources.md`, los
candidatos y el protocolo. R1–R8 son obligatorios: ejecutar toda aritmética,
fuentes primarias con extracto y fecha, reimplementación independiente,
claim→evidencia, casos adversariales, veredicto explícito, reproducibilidad y
ninguna corrección durante el audit.

## Preguntas que debes resolver

1. Comprueba la transcripción de los siete checkpoints contra la tabla editorial.
   No confundas una transcripción correcta con una simulación validada.
2. Examina el origen de cada checkpoint y los límites del pass del 17-09.
   Si no puedes recalcular su origen con datos trazables, marca `UNVERIFIED` y
   explica qué evidencia falta. No ajustes retornos o aportes para alcanzar
   USD 129.495. No reconstruyas meses aleatorios solo desde una semilla sin
   conocer el procedimiento original.
3. Recupera la tabla oficial SII de dólar 2025 y verifica el valor del 30-12 y la
   ausencia de observación el 31-12. La lectura del autor no reemplaza la tuya.
4. Recalcula de forma independiente la conversión y los dos redondeos. Aceptar
   esa multiplicación no valida el resultado USD de la simulación original.
5. Inspecciona PNG/SVG: siete barras, orden temporal, escala lineal desde cero,
   valores visibles idénticos al dataset, sin curvas ni valores inventados.
   Comprueba que ambas variantes expresan las limitaciones y el estado pendiente.
6. Verifica que las alternativas textuales y CSV contienen los mismos datos, que
   no se cambiaron los artículos ni los assets publicados y que ningún archivo
   de este scope proclama `PASS` o firma humana sin evidencia independiente.
7. Reporta la condición editorial de reemplazo: la leyenda actual del artículo
   describe una curva, crisis y aportes mensuales y no sirve para estas barras.
   La integración debe cambiar texto alternativo/leyenda y conservar datos
   accesibles en el artículo, con revisión editorial independiente.

Escribe `02-result.json` y `03-report.md` con tu identidad, commit real, comandos,
salidas crudas, claims y defectos. No reutilices como resultado independiente la
salida de los tests del autor. Sin origen validado para los checkpoints, no
presentes el ejercicio financiero como verificado ni autorizable por un `PASS`
meramente gráfico. La firma humana sigue siendo `null`; no publiques ni cambies
archivos para arreglar defectos encontrados. ComplianceAgent debe revisar después
en su propia sesión fresca, conforme al pipeline.
