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

## Limitación conocida: CodeQL / code scanning no disponible

En repo privado sin GitHub Advanced Security (plan Free/User), `code scanning`
responde 403 (`Code scanning is not enabled`): el workflow dinámico de CodeQL
que GitHub sugiere no puede habilitarse. El SAST del repositorio es **Opengrep
semanal**, no CodeQL por PR.

Además, para no consumir minutos de Actions, en PRs **solo** corre el escaneo
de secrets del diff (`gitleaks-pr`, bloqueante); el resto es semanal o manual.
Consecuencia: una vulnerabilidad introducida en un PR puede esperar hasta el
siguiente miércoles (o un dispatch manual) para ser vista por
SAST/Trivy/pip-audit. Mitigación: revisión de código + gates del repo +
`gitleaks-pr` bloqueante + Dependabot.

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
