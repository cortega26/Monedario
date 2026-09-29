# ADR-20260929-ai-independent-audit-protocol

Date: 2026-09-29
Status: Accepted

## Context

El pipeline editorial ya define roles de auditoría por IA
(`MathAuditAgent`/`ComplianceAgent` en `context/EDITORIAL_AI_PIPELINE.md`) con
separación de funciones, pero: (1) no existe un protocolo anti-alucinación
verificable (hoy la exigencia es "recalcular o trazar a la fuente", sin
artefacto estructurado ni evidencia adjunta); (2) no cubre cambios de
calculadoras/dominio como el plan 115; y (3) no hay reglas de divulgación
pública para no sobre-afirmar ("auditoría independiente" hecha por IA).

## Decision

Adoptar auditorías independientes por IA como **pre-gate** de publicación YMYL
bajo `docs/editorial/AI_AUDIT_PROTOCOL.md`:

- independencia real: otra sesión y, preferentemente, otra familia de modelo
  que la que redactó; el agente redactor no puede auditar su propia pieza;
- verificación ejecutable y anclada a fuente primaria (reglas R1–R8 del
  protocolo), con evidencia cruda adjunta;
- artefacto estructurado y reproducible por scope
  (`docs/editorial/audits/<scope>/`) con commit SHA, comandos y veredicto
  `FAIL/CONDITIONAL/PASS`;
- la firma humana se mantiene: la IA no reemplaza el gate humano de
  publicación, lo antecede con mejor evidencia;
- divulgación pública limitada a la plantilla aprobada (modelo, protocolo,
  versión, commit, fecha; revisión humana explícita), en URLs existentes
  (bloque de verificación) o página dedicada post-2026-11-02 por FOCO ESTRICTO.

## Consequences

- Positivas: evidencia reproducible y auditable; menos riesgo de alucinación
  por verificación ejecutable; base para el reporte público de confianza
  (E-E-A-T) sin sobre-claims.
- Trade-offs: costo operativo (sesiones externas + almacenar evidencia);
  la calidad del audit depende del prompt/protocolo, no solo del modelo.
- No cambia contratos de datos ni URLs.

## Alternatives considered

- Solo auditoría humana: válida pero con lead time y disponibilidad limitada.
- Auditoría IA sin protocolo: descartada por riesgo de alucinación y de
  afirmaciones públicas no verificables.
- No divulgar el método: descartada; en YMYL la transparencia del método es
  parte de la señal de confianza.

## Verification

- `docs/editorial/AI_AUDIT_PROTOCOL.md` publicado con reglas y esquema.
- Paquete piloto en `docs/editorial/audits/plan-115-correctitud/` listo para
  ejecutar en sesión fresca (scope + prompt + plantilla de resultado).
- Fase 2: checker de esquema del artefacto en CI (`check:audit-artifacts`).
- El veredicto del piloto y la firma humana se registran en el artefacto.
