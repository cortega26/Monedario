# ADR: Manual approval gate for repo-managed deploy workflow (historical)

- **Date:** 2026-04-08
- **Status:** Superseded
- **Context:** Monedario.cl is a YMYL financial site. On 2026-04-08 the repository still assumed a repo-managed GitHub Actions deployment path via `.github/workflows/deploy.yml`, so an automated publish on push to `main` needed a human approval gate. The current tree no longer contains an active repo-managed deploy workflow; production publication is handled by Cloudflare Pages consuming this repository.
- **Decision:** Preserve this record as historical context for the retired `deploy.yml` path. There is no active workflow in the current tree that consumes a GitHub `production` Environment approval before publish.
- **Consequences:** This ADR no longer changes runtime behavior in the repository as checked in today. If Monedario reintroduces a repo-managed deploy workflow in the future, a human approval gate remains the default YMYL baseline, but it should be captured in a new ADR aligned with the actual delivery path.
- **Alternatives considered:** External deployment approval services — rejected as overkill for the original static-site workflow.
- **Setup required:** None while the repo-managed `deploy.yml` workflow remains absent from the tree.
