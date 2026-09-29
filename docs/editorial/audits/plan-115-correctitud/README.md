# Auditoría independiente — plan 115 (correctitud)

Estado: **PENDIENTE DE EJECUCIÓN** (sesión fresca, modelo distinto al que
redactó).

Protocolo: `docs/editorial/AI_AUDIT_PROTOCOL.md` (v1) ·
ADR: `docs/adr/ADR-20260929-ai-independent-audit-protocol.md`.

## Cómo ejecutar

1. Abrir una **sesión fresca** (sin historial del draft) con un modelo de otra
   familia que la del agente redactor; pegar íntegro
   `01-auditor-prompt.md`.
2. Entregar como contexto los inputs listados en el prompt
   (`00-scope.json`, `MATH-AUDIT-PACKET`, informe de correctitud).
3. El auditor completa `02-result.json` y `03-report.md`, y adjunta en
   `evidence/` las salidas crudas (comandos, extractos de fuentes, diffs).
4. Revisión humana: completar `humanSignoff` (fecha + responsable) en
   `02-result.json`. **Sin firma humana no hay divulgación pública.**
5. Si el veredicto es `FAIL` o `CONDITIONAL`: abrir fix con su propio ciclo y
   re-auditar; no publicar.

## Reglas rápidas

- El agente redactor no audita su propia pieza (separación de funciones).
- R1–R8 del protocolo son obligatorias (nada de aritmética de memoria; fuente
  primaria con extracto; reimplementación independiente; veredicto explícito;
  no arreglar durante el audit).
- Divulgación pública solo con la plantilla aprobada del protocolo.

## Archivos

| Archivo | Quién lo llena |
|---|---|
| `00-scope.json` | Ya preparado (agente redactor) |
| `01-auditor-prompt.md` | Ya preparado |
| `02-result.json` | Auditor (sesión fresca) |
| `03-report.md` | Auditor (sesión fresca) |
| `evidence/` | Auditor |
| `humanSignoff` | Revisor humano |
