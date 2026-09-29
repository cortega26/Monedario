# Protocolo de auditoría independiente por IA (AI_AUDIT_PROTOCOL)

Versión: v1 (2026-09-29)
Ámbito: cálculos, datos y claims YMYL de Monedario (calculadoras, dominio,
contenido editorial).
Base: `docs/adr/ADR-20260929-ai-independent-audit-protocol.md`,
`context/EDITORIAL_AI_PIPELINE.md` (roles y separación de funciones).

> La auditoría por IA es un **pre-gate**: antecede a la firma humana y no la
> reemplaza. Un veredicto `FAIL` o `CONDITIONAL` bloquea la publicación.

## 1. Independencia (separación de funciones)

- El agente que redactó/implementó **no puede** auditar la misma pieza, en la
  misma sesión ni en la misma familia de modelo (preferencia: otra familia).
- La sesión auditora arranca **fresca**, sin historial del draft; solo recibe
  el paquete de auditoría (`00-scope`, packet, fuentes).
- Roles: `MathAuditAgent` (adversarial numérico) y `ComplianceAgent`
  (adversarial normativo/YMYL), según `EDITORIAL_AI_PIPELINE.md`.

## 2. Reglas anti-alucinación (R1–R8)

| # | Regla | Cómo se verifica |
|---|---|---|
| R1 | **Nada de aritmética de memoria.** Todo número se obtiene ejecutando código (node/python) y se adjunta la salida cruda. | Cada claim numérico apunta a un comando + salida en `evidence/`. |
| R2 | **Anclaje a fuente primaria.** Cada parámetro (UTA, UF, IMM, tasas, plazos) con URL oficial, extracto textual y fecha de consulta. | Campos `source.url`, `source.quote`, `source.retrievedAt` completos. |
| R3 | **Reimplementación independiente.** El auditor recalcula cada vector por su cuenta y compara con el motor; divergencia = defecto. | `claims[].independentValue` + comparación exacta (tolerancia 0; redondeos documentados). |
| R4 | **Trazabilidad claim→evidencia.** Ninguna afirmación sin evidencia asociada. | Sin `evidenceRef` → claim inválido. |
| R5 | **Adversarial, no confirmatorio.** El objetivo es encontrar errores: bordes (topes, límites de tramo, exenciones, negativos, redondeos, períodos). | Lista de casos borde ejecutados en el artefacto. |
| R6 | **Veredicto explícito.** `FAIL` / `CONDITIONAL` / `PASS` + defectos con severidad y estado. | `verdict` y `defects[]` obligatorios. |
| R7 | **Reproducibilidad.** Commit SHA, entorno y comandos exactos; un tercero debe poder repetir el audit. | Campos `scope.commit`, `method.commands`. |
| R8 | **No arreglar durante el audit.** Los hallazgos se registran; el fix va en otro cambio con su propio ciclo. | El audit no modifica `src/`. |

## 3. Artefacto de auditoría

Carpeta por scope: `docs/editorial/audits/<scope-id>/`.

```
<scope-id>/
├── 00-scope.json          # alcance machine-readable (commits, archivos, vectores, fuentes)
├── 01-auditor-prompt.md   # prompt exacto para la sesión auditora (rol + R1–R8 + formato)
├── 02-result.json         # resultado estructurado (lo llena el auditor)
├── 03-report.md           # resumen humano-legible del resultado
└── evidence/              # salidas crudas de comandos, capturas, extractos
```

### Esquema de `02-result.json`

```json
{
  "auditId": "plan-115-correctitud",
  "protocolVersion": "v1",
  "scope": { "commit": "<sha>", "files": ["..."], "vectors": ["..."] },
  "auditor": { "role": "MathAuditAgent", "model": "<modelo+version>", "session": "<id>", "date": "YYYY-MM-DD" },
  "method": { "commands": ["..."], "edgeCases": ["..."] },
  "claims": [
    {
      "id": "C1",
      "claim": "<afirmación verificada>",
      "source": { "url": "https://...", "quote": "<extracto>", "retrievedAt": "YYYY-MM-DD" },
      "reproduction": { "command": "...", "output": "evidence/C1.txt" },
      "independentValue": "<valor recalculado>",
      "engineValue": "<valor del motor>",
      "status": "OK | DIVERGENT | UNVERIFIED"
    }
  ],
  "defects": [
    { "id": "D1", "severity": "alta|media|baja", "description": "...", "evidence": "evidence/D1.txt", "status": "open|resolved" }
  ],
  "verdict": "FAIL | CONDITIONAL | PASS",
  "humanSignoff": null
}
```

Reglas de cierre: `PASS` solo sin defectos abiertos; `CONDITIONAL` bloquea
hasta resolver; `humanSignoff` se completa con la revisión humana (fecha +
responsable) antes de cualquier divulgación pública.

## 4. Divulgación pública (plantilla aprobada)

Se permite afirmar únicamente lo verificable:

> Verificación adversarial independiente por IA — modelo `<modelo>`,
> protocolo `AI_AUDIT_PROTOCOL v1`, commit `<sha>`, fecha `<fecha>`.
> Revisión humana: `<pendiente|realizada el YYYY-MM-DD>`.

Prohibido: "certificado", "auditado por expertos", "independiente" sin
especificar que la auditoría fue por IA, o cualquier claim sin artefacto
enlazado. Dónde publicar: bloque de verificación en URLs existentes; una
página dedicada de auditorías es URL nueva (FOCO ESTRICTO hasta 2026-11-02 o
excepción aprobada).

## 5. Integración

- **Pipeline editorial** (`src/data/blog`): el resultado reemplaza/complementa
  `05-math-audit.md` en `docs/editorial/artifacts/editorial/<slug>/<run-id>/`.
- **Calculadoras/dominio**: carpeta propia en `docs/editorial/audits/` (este
  protocolo).
- **Fase 2 (pendiente)**: `check:audit-artifacts` en CI valida el esquema de
  `02-result.json` y que `humanSignoff` exista antes de divulgar.
