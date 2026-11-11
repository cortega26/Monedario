# Registro de decisión del HumanEditor — publicación con pipeline incompleto

- Run id: `20261029-1500-utm-audit`
- Slug: `utm-chile-que-es-como-funciona`
- Fecha: 2026-11-10
- Commit publicado: el de la rama `fix/utm-reajuste-copy-correction` al momento de mergear el PR #774 (último commit de contenido auditado: `654fef06`).

## Decisión

El HumanEditor decidió, por instrucción directa en la sesión de trabajo del 2026-11-10, publicar el texto corregido hasta la sexta pasada **sin esperar** una nueva batería de auditorías, y realizar esas auditorías después. Esta decisión es suya; este documento solo la deja registrada.

Motivo declarado: el texto publicado hoy contiene afirmaciones sin respaldo que se comprobaron en el sitio en vivo el 2026-11-10 («se reajusta el primer día hábil de cada mes», «según la variación del IPC del mes anterior», «sube o baja con la inflación», umbral «bruto/mes»), y el texto corregido es superior.

## Estado del pipeline al publicar (sin modificar)

| Etapa | Estado |
|---|---|
| `05-math-audit.md` | **FAIL** (MathAudit 4, 64 filas, sobre `0ff3c4e1`). La sexta pasada de corrección no tiene auditoría independiente. |
| `06-compliance.md` | **FAIL / BLOCKED**, 8,20/10 (ComplianceAgent, sobre `9df66c6f`). Un defecto bloqueante (sin auditoría independiente del texto vigente), cinco mayores, siete menores. La quinta y la sexta pasada corrigen 12 de los 13 defectos. |
| `07-publish-packet.md` | **Sin ninguna casilla marcada. No se modificó.** Este registro no firma ninguna puerta ni sustituye el sign-off de `07`. |

## Pendiente conocido

1. Nueva batería de auditorías del HumanEditor: MathAudit sobre el HEAD publicado y ComplianceAgent en sesión limpia (con la inyección de claude-mem desactivada o declarada).
2. Defecto #4 de `06`: `02-dossier.md`, `sources.yaml`, `01-brief.yaml` y `metadata.yaml` siguen en el corte 2026-10-29 y sin las fuentes de las pasadas posteriores (APV, Ley de Tránsito, impuesto de segunda categoría, UF, Código Tributario art. 8 N.º 10 y 97 N.º 1).
3. Mapa de IDs de sesión por etapa en `07` (los de Research, brief/outline y MathAudit 1–4 no son recuperables).
4. DL 3.500, art. 20 O: solo se contrastó la versión 2025-09-01 de la BCN; la vigente no pudo compararse.
5. Los tramos del IGC no se incorporaron al artículo.
6. Decidir si se acota el alcance de la revisión (regla de reajuste, valor del mes y registro de correcciones) en lugar de re-auditar también los ejemplos preexistentes (APV, tabla del impuesto, UTA, multas).
7. Fuera de este run: `sueldo-imponible-chile` (`expectedValue` de UTM desfasado) y seis artículos con la ventana de revisión vencida.
