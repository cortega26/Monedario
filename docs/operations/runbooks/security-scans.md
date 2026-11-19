# Security scans runbook

Status: active (2026-09-30). Owner: Carlos Ortega. Contexto: `TD-0110`.

Authority: `.github/workflows/security-scans.yml`, `.gitleaks.toml`.

## Qué corre y cuándo

| Superficie                              | Job           | Disparador                    | Bloqueante |
| --------------------------------------- | ------------- | ----------------------------- | ---------- |
| Secrets (diff del PR)                   | `gitleaks-pr` | `pull_request`                | Sí         |
| Secrets (árbol completo)                | `gitleaks`    | schedule semanal / dispatch   | No         |
| SAST (Opengrep)                         | `opengrep`    | schedule semanal / dispatch   | No         |
| Dependencias + misconfig (Trivy fs)     | `trivy`       | schedule semanal / dispatch   | No         |
| Dependencias Python (pip-audit)         | `python-audit`| schedule semanal / dispatch   | No         |

Schedule: miércoles 05:30 UTC. Dispatch manual:
`gh workflow run "Security Scans"` (o Actions → Run workflow).

## CodeQL / code scanning (repo público desde 2026-11-18)

Mientras el repo fue privado, `code scanning` respondía 403 (`Code scanning is
not enabled`) porque GitHub Advanced Security no estaba disponible en el plan
Free/User. Con el repositorio público, code scanning y CodeQL sí están
disponibles sin GHAS. La configuración actual sigue siendo **Opengrep
semanal** más `gitleaks-pr` bloqueante; si se habilita CodeQL, actualizar esta
sección y la matriz de cobertura.

### Auditoría de historia completa (2026-11-18)

Al pasar el repositorio a público se corrió una vez
`gitleaks detect --source . --log-opts="--all"`: 324 coincidencias, todas
`AIDA…` (identificadores de usuario IAM de AWS) dentro de reportes históricos de
Lighthouse en `.lighthouseci/` y `artifacts/`, ya eliminados y en `.gitignore`.
No se encontraron claves `AKIA…`/`ASIA…` ni credenciales activas. Repetir esta
auditoría antes de un rewrite de historia o si se vuelve a exponer un artefacto
generado.

Además, para no consumir minutos de Actions, en PRs **solo** corre el escaneo
de secrets del diff (`gitleaks-pr`, bloqueante); el resto es semanal o manual.
Con el repo público los minutos de GitHub-hosted son gratuitos, así que evaluar
mover Opengrep/Trivy/pip-audit a PRs. Consecuencia actual: una vulnerabilidad
introducida en un PR puede esperar hasta el siguiente miércoles (o un dispatch
manual). Mitigación: revisión de código + gates del repo + `gitleaks-pr`
bloqueante + Dependabot.

## Cómo correr cada scan localmente

- Gitleaks (mismo config que CI):
  `gitleaks dir . --config .gitleaks.toml --redact`.
- Trivy:
  `trivy fs --scanners vuln,misconfig --severity HIGH,CRITICAL --ignore-unfixed .`.
- Opengrep: binario `opengrep scan .` (CI usa v1.21.0).
- pip-audit: `uv run pip-audit`.

## Artefactos y divulgación

Los reportes (SARIF/txt) quedan como artifacts del run con retención de 14 días
y los hallazgos se resumen en el job summary. Nada de esto se publica en el
sitio: la divulgación pública de seguridad se rige por el protocolo de
auditorías y solo afirma lo verificable.
