# Financial Data Verification Policy

**Document path:** `docs/governance/FINANCIAL_DATA_VERIFICATION_POLICY.md`
**Status:** Active
**Fecha de creación:** 2026-04-11
**Última actualización:** 2026-04-11
**Applies to:** All financial rate configuration files and hardcoded financial values in calculator pages

---

## 1. Purpose

This policy establishes mandatory verification procedures for financial rate data published on this site. Its primary goal is to prevent incorrect financial data from reaching users.

**Trigger:** On 2026-04-10, `src/config/afpCommissions.ts` was created with 6 out of 7 AFP commission rates wrong. The values were never cross-checked against any official source before merging. This incident caused incorrect calculator outputs and incorrect range text across multiple pages.

This policy ensures this class of error cannot recur silently.

---

## 2. Scope

This policy covers **financial rate config files** — any file whose values are numerically consumed by calculators, displayed to users, or embedded in editorial content.

Governed files as of 2026-04-11:

| File | Data type | Criticality |
|------|-----------|-------------|
| `src/config/afpCommissions.ts` | AFP administration commission rates | CRITICAL — YMYL |
| `src/infrastructure/economic/economic-parameters.snapshot.json` | UF, UTM, TMC, IPC, topes | CRITICAL — YMYL |
| `src/application/use-cases/shared/retirementEmployerContributionSchedule.ts` | Employer contribution schedule | HIGH |
| `src/application/use-cases/shared/creditAmortization.ts` (legal rate refs) | Legal rate caps | HIGH |

When a new file with hardcoded financial rates is added, it **must** be registered in this table as part of the PR.

---

## 3. Classification: Critical Volatile Financial Data

Files classified as **critical volatile financial data** (CVFD) are:
- Directly consumed by user-facing calculator logic
- Subject to regulatory change on a predictable schedule (monthly, quarterly, annually)
- YMYL-adjacent: errors create material risk of incorrect financial decisions

The AFP commission rates in `src/config/afpCommissions.ts` are CVFD. These rates are set by the Superintendencia de Pensiones and typically change once or twice per year.

---

## 4. Mandatory Pre-Commit Verification Protocol

### Rule FDV-001 — Two-source minimum

**No CVFD value may be committed without verification against at least two independent official sources.**

Both sources must be cited in the file's header comment. Example:
```typescript
// AFP commission rates
// Verified: 2026-04-11
// Source 1 (primary):   Previred Indicadores Previsionales abril 2026
//                       https://www.previred.com/indicadores-previsionales/
// Source 2 (secondary): AFP Capital official commissions page (1.44% confirmed)
//                       https://www.afpcapital.cl/comisiones
//                       AFP Uno official commissions page (0.46% confirmed)
//                       https://www.uno.cl/sobre-uno/nuestras-comisiones
```

### Rule FDV-002 — AI-generated values are forbidden without human cross-check

**AI agents (including GitHub Copilot, Claude, ChatGPT, or any LLM) must never commit AFP commission rates or other CVFD values as final without explicit human verification against official sources.**

CVFD values proposed by an AI must be treated as provisional drafts. The commit author must verify each value against the sources listed in FDV-001 before merging.

This rule exists because AI models can confidently produce plausible but wrong financial rates — exactly what happened in the 2026-04-10 incident.

### Rule FDV-003 — Verification date must be in the file

Every CVFD file must include a `// Verified: YYYY-MM-DD` comment in its header. This date must be updated each time any value in the file is confirmed or changed.

### Rule FDV-004 — Hardcoded display values must be consistent with config

When a calculator page contains hardcoded display text that references a CVFD rate (e.g., a static example panel or explanatory range text), that text must be updated in the same commit as the config file change.

Search target when updating AFP rates:
```
grep -r "AFP\|comisi" src/pages/calculadoras/ --include="*.astro" -l
```

### Rule FDV-005 — Blog articles with hardcoded rates must be audited

When a CVFD rate changes, search all blog articles for the old value:
```
grep -r "1\.44\|1\.27\|0\.46\|11\." src/data/blog/ --include="*.md" --include="*.mdx"
```
If an article contains the old specific rate as a factual claim, it must be updated or the discrepancy noted.

---

## 5. Official Sources for AFP Commissions

The authoritative source hierarchy for AFP commission rates is:

| Priority | Source | URL | Reliability |
|----------|--------|-----|-------------|
| 1 (Primary) | Previred Indicadores Previsionales | https://www.previred.com/indicadores-previsionales/ | Highest — used by Chilean payroll processors industry-wide |
| 2 (Secondary) | AFP Capital official page | https://www.afpcapital.cl/comisiones | High — server-side rendered, fetchable |
| 2 (Secondary) | AFP Uno official page | https://www.uno.cl/sobre-uno/nuestras-comisiones | High — server-side rendered, fetchable |
| 3 (Tertiary) | Superintendencia de Pensiones | https://www.spensiones.cl | High — official regulator |
| 3 (Tertiary) | AFP Habitat | https://www.afphabitat.cl/costos/comisiones/ | Medium — JavaScript-heavy, may not be programmatically fetchable |
| 3 (Tertiary) | AFP Cuprum | https://www.cuprum.cl | Medium — JavaScript-heavy |
| 3 (Tertiary) | AFP Modelo | https://www.afpmodelo.cl | Medium |
| 3 (Tertiary) | AFP PlanVital | https://www.planvital.cl/afiliado/informacion/comisiones | Medium — page may redirect |
| 3 (Tertiary) | AFP ProVida | https://www.provida.cl | Medium — JavaScript-heavy |

**Minimum requirement:** Previred (Priority 1) + at least one Priority 2 or 3 source.

### AFP commission rate structure

The total AFP deduction for a dependent worker (cargo trabajador dependiente) is:

```
total = 10.00%  (mandatory savings, same for all AFPs)
      + AFP administration commission (varies per AFP)
```

The `total` and `commission` fields in `afpCommissions.ts` reflect this split.

---

## 6. Automated Monthly Check

A GitHub Action runs on the **first day of each month** to validate all AFP commission rates against Previred:

- **Workflow:** `.github/workflows/check-afp-commissions.yml`
- **Script:** `scripts/check-afp-commissions.mjs`
- **Report output:** `output/validation/afp-commissions/report.json`
- **Manual trigger:** `pnpm run check:afp-commissions`

If a mismatch is detected, the workflow creates a GitHub issue labeled `data-freshness` and `financial-data` with a table of mismatches and links to this policy.

This automated check is the **first line of defense**. It does not replace the pre-commit human verification required by FDV-001.

---

## 7. Manual Review Schedule

| Cadence | Trigger | Action |
|---------|---------|--------|
| Monthly (automated) | 1st of each month | `check-afp-commissions.yml` workflow runs |
| Quarterly (manual) | January, April, July, October | Human reviewer opens Previred + 2 AFP sites, confirms all 7 rates |
| On regulatory change | AFP commission change announcement | Immediate update following FDV-001 through FDV-005 |
| On reform milestones | Reforma Previsional 2025 schedule events | Review all CVFD files for impact |

The quarterly manual review is required even when the automated check passes, because the automated check depends on Previred's HTML structure. If Previred changes its page structure, the automated check may pass without catching a drift.

---

## 8. Incident Record

| Date | File | Description | Status |
|------|------|-------------|--------|
| 2026-04-10 | `src/config/afpCommissions.ts` | File created with 6/7 AFP commission rates wrong. Values did not match any official source. No pre-commit verification was performed. | Fixed 2026-04-11 |

---

## 9. Enforcement

Violations of FDV-001 through FDV-005 are logged in `docs/TECH_DEBT_BACKLOG.md` with a minimum severity of 4. Any PR that changes a CVFD file without citing both sources in the file header comment may be rejected at review.

PRs that touch `src/config/afpCommissions.ts` must include in their description:
- The two verification sources used
- The date of verification
- Confirmation that all hardcoded display values were also updated
