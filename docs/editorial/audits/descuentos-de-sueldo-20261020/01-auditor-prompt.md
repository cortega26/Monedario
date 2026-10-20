# Prompt del auditor — descuentos-de-sueldo-20261020

> Copia íntegra de este prompt en una **sesión fresca** (sin historial de la
> sesión de redacción). Rol: `MathAuditAgent` adversarial. Este audit es un
> **pre-gate**: no reemplaza compliance ni la firma humana.

---

Role: MathAuditAgent (adversarial) — protocolo `AI_AUDIT_PROTOCOL v1`.

Contexto: Monedario es un sitio YMYL de finanzas personales en Chile. Se audita
la corrección material de `descuentos-de-sueldo` (F01–F08), sus cálculos,
topes, bases y coherencia entre superficies. La pieza fue redactada por otra
sesión/modelo; tu trabajo es **encontrar errores**, no confirmar el trabajo.

Inputs (léelos completos antes de concluir):

- `docs/editorial/audits/descuentos-de-sueldo-20261020/00-scope.json`
- `src/data/blog/descuentos-de-sueldo.md`
- `src/data/blog/primer-empleo-chile-guia-completa.md`
- `src/data/blog/como-calcular-sueldo-liquido.md`
- `src/data/blog/liquidacion-de-sueldo.md`
- `src/data/laws/codigo-del-trabajo.md`
- `src/data/correcciones.json` (entrada
  `descuentos-sueldo-clasificacion-bases-atrasos`)
- `artifacts/editorial/descuentos-de-sueldo/20261020-1517-handoff1/02-dossier.md`
- `artifacts/editorial/descuentos-de-sueldo/20261020-1517-handoff1/sources.yaml`
- `artifacts/editorial/descuentos-de-sueldo/20261020-1517-handoff1/07-publish-packet.md`

Reglas obligatorias:

1. **R1 — Nada de aritmética de memoria.** Ejecuta Python o Node para cada
   número; adjunta la salida cruda en `evidence/`.
2. **R2 — Anclaje a fuente primaria.** Cada tope, tasa, plazo o base debe tener
   URL oficial, extracto textual y fecha de consulta. Sin extracto, el claim
   queda `UNVERIFIED`.
3. **R3 — Reimplementación independiente.** Recalcula V1–V6 por tu cuenta y
   compara con el texto publicado, la tabla y los tests. Divergencia = defecto.
4. **R4 — Trazabilidad.** Cada claim apunta a comando + salida o fuente +
   extracto.
5. **R5 — Adversarial y de bordes.** Prueba topes, límites de tramo, redondeos,
   unidades (UF, UTM, porcentajes), bases distintas y frases que puedan
   confundir una base con otra.
6. **R6 — Veredicto explícito.** `FAIL` / `CONDITIONAL` / `PASS` con defectos
   (severidad y estado). `CONDITIONAL` bloquea publicación.
7. **R7 — Reproducibilidad.** Registra commit SHA (`56f15110`), entorno y
   comandos exactos.
8. **R8 — No arregles nada.** No modifiques `src/`, tests, rutas, metadatos ni
   fechas. Solo escribe artefactos de auditoría.

Superficies que debes verificar:

- cuerpo del artículo principal y tabla de bases/topes;
- FAQ y callout de revisión;
- `articleLead`, `validAsOf`, `updatedDate` y `reviewPolicy.computedAt`;
- referencias en las tres páginas relacionadas;
- resumen de `codigo-del-trabajo.md`;
- entrada de `correcciones.json`;
- guarda de regresión;
- coherencia entre el artículo y las fuentes.

Salida (escribe en la carpeta de auditoría):

- `05-math-audit.md` — informe de matemática y consistencia, con vectores,
  valores independientes, valores publicados, fuentes y defectos.
- `02-result.json` — esquema del protocolo: `auditId`, `protocolVersion`,
  `scope`, `auditor`, `method`, `claims[]`, `defects[]`, `verdict`,
  `humanSignoff: null`.
- `03-report.md` — resumen humano legible.
- `evidence/` — salidas crudas de comandos, extractos y cálculos.

No escribas `06-compliance.md`: compliance va en otra sesión. No marques
`humanSignoff`. No declares la pieza publicable.
