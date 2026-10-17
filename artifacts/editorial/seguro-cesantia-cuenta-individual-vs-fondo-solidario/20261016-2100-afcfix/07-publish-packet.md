# Publish packet — seguro-cesantia-cuenta-individual-vs-fondo-solidario

**Status: BLOCKED — pending MathAuditAgent, ComplianceAgent and human sign-off.**
Run: 20261016-2100-afcfix; cut-off: 2026-10-16.

## Roles (evidencia de separación)
- ResearchAgent: ChatGPT, actual sesión.
- DraftAgent: ChatGPT, actual sesión (autor de este borrador).
- MathAuditAgent: **NO EJECUTADO**; requiere instancia independiente del redactor.
- ComplianceAgent: **NO EJECUTADO**; requiere Claude Code, sesión nueva adversarial.
- HumanEditor: **NO FIRMADO**.

## Publication gates — exclusivamente revisión/firma humana
- [ ] Math audit independiente: `05-math-audit.md` PASS, sin TODO.
- [ ] Compliance independiente: `06-compliance.md` PASS, score NORMA_YMYL >= 9.5.
- [ ] Todos los hallazgos resueltos y VERIFIED trasladados al texto.
- [ ] `check:frontmatter`, `check:correcciones`, `check:editorial`, `check:hero-images`, `check:hero-prompts`, tests, CI.
- [ ] Evaluar coherencia de la guía completa y fecha efectiva del registro.
- [ ] Aprobación final por HumanEditor.

Ningún gate se marca como satisfecho por el agente redactor.
