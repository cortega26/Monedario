# ADR-20260906: Integridad del resumen de auditoría Python

Date: 2026-09-12
Status: Accepted

## Context

El job `python-audit` de `.github/workflows/security-scans.yml` publica un
resumen con `vuln_count=$(jq 'length' output/security/python-audit.json)` y
declara `No vulnerabilities found. ✓` cuando el archivo no existe. El formato
JSON real de pip-audit es `{"dependencies": [...], "fixes": [...]}`: la raíz
tiene dos claves incluso con cero vulnerabilidades, de modo que una auditoría
limpia se reporta como 2 paquetes vulnerables. Peor: un fallo de ejecución
(archivo ausente) se reporta como limpieza. El `run` de auditoría usa
`uv run pip-audit ... || true`, que descarta el exit code (0 limpio,
1 vulnerabilidades, otro fallo operativo). Un error parece una auditoría
limpia. Constitución §1 exige alcance mínimo y §5 pruebas de comportamiento;
§9 exige ADR en cambios de contratos de CI.

## Decision

1. El step de auditoría (`id: audit`) elimina solo su reporte de esta corrida
   (`rm -f output/security/python-audit.json`), inicia `audit_exit=0`,
   ejecuta `uv run pip-audit --format json --output
   output/security/python-audit.json --desc on || audit_exit=$?` y publica
   `audit_exit` como output del step (`$GITHUB_OUTPUT`). Sin `|| true`.
2. El step resumen recibe el código por `env: AUDIT_EXIT_CODE:
   ${{ steps.audit.outputs.audit_exit }}` (sin interpolar `${{ ... }}` dentro
   del shell), valida JSON y forma (`object` con `dependencies: array`; cada
   entrada es `vulns: array` o `skip_reason`) antes de contar, y cuenta
   dependencias con array `vulns` no vacío — no CVEs ni claves raíz.
3. Tres estados observables:
   - `CLEAN` solo con exit 0 + JSON válido + cero paquetes vulnerables +
     cero omitidas.
   - `VULNERABILITIES` con exit 1 + reporte válido + al menos un paquete
     vulnerable; si además hay omitidas se muestran ambas sin ocultar
     hallazgos, con detalle JSON expandible.
   - `INCOMPLETE` en todo lo demás: reporte ausente, vacío, JSON roto, forma
     sin `dependencies`, entradas malformadas, fallo operativo (exit distinto
     de 0/1), código ausente (step omitido) o contradicción código/reporte
     (0 con hallazgos, 1 con lista limpia). Nunca contiene texto de limpieza.
   - Una dependencia con `skip_reason` es auditoría parcial explícita; nunca
     limpieza total.
4. Sin cambios de política: calendario semanal/manual, permisos
   `contents: read`, uploads de artefactos y `continue-on-error: true` del job
   quedan intactos. Sin scripts nuevos ni dependencias.

## Consequences

- El resumen distingue limpieza real, hallazgos y falta de evidencia; un fallo
  operativo ya no parece limpio y el conteo viejo (2 claves raíz) queda
  corregido a paquetes vulnerables reales.
- Costo operativo nulo: mismo job, mismos runners, Bash/jq ya disponibles.
- Riesgo residual: un formato futuro de pip-audit sin `dependencies` cae a
  `INCOMPLETE` por diseño (STOP del plan) en lugar de inventar
  compatibilidad; hay que revisar el ADR entonces.

## Alternatives considered

- Contar CVEs (`[.dependencies[].vulns[]] | length`): descartado, infla el
  titular (una dep con dos CVEs no son dos paquetes) y rompe el contrato
  `Found X vulnerabilities in Y packages` del propio pip-audit.
- `jq 'length'` sobre la raíz o `No vulnerabilities found` cuando falta el
  archivo: descartado, es el defecto que corrige este ADR.
- Script Python/Node nuevo para el resumen: descartado, el job ya dispone de
  Bash/jq y el plan prohíbe dependencias nuevas.
- Endurecer el job (quitar `continue-on-error`, bloquear PRs): descartado,
  fuera de alcance; la tolerancia semanal es deliberada.

## Verification

- `pnpm exec vitest run tests/static-analysis/python-audit-summary.test.ts`
  → exit 0: extrae los bloques `run` reales del YAML, sustituye `uv` por stub
  (códigos 0, 1 y 2 intactos al output, sin red) y ejecuta el resumen contra
  fixtures (2 sanas → CLEAN 0; 1 con dos CVEs + 1 sana → 1 no 2; vacío,
  ausente, roto o sin `dependencies` → INCOMPLETE; exit 2 o código ausente →
  INCOMPLETE sin limpieza; 0 con hallazgos o 1 limpio → INCOMPLETE;
  `skip_reason` → parcial, nunca CLEAN).
- `pnpm run lint`, `pnpm run format:check`, `pnpm run test`,
  `pnpm run check:ci`, `pnpm run check:policy-registry`,
  `pnpm run check:context`, `pnpm run check:docs` → exit 0.
- `continue-on-error`, triggers (`schedule`, `workflow_dispatch`) y permisos
  intactos; diff limitado al workflow + test nuevo + este ADR.
