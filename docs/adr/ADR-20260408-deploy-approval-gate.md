# ADR: Add manual approval gate to deploy.yml

- **Date:** 2026-04-08
- **Status:** Accepted
- **Context:** Monedario.cl is a YMYL financial site. Automated deploy on push to `main` risks publishing broken builds to end users without human review.
- **Decision:** Add a `production` GitHub Environment with required reviewers to the `deploy` job in `.github/workflows/deploy.yml`.
- **Consequences:** Deploy requires at least one reviewer approval via GitHub's environment protection rules. Requires setting up the `production` environment in GitHub repo settings (Settings > Environments > production > Required reviewers).
- **Alternatives considered:** External deployment approval services — rejected as overkill for a static site.
- **Setup required:** Create the `production` environment in the repository settings before merging. Navigate to Settings > Environments > New environment > name it `production` > add Required reviewers. Without this step the deploy job will succeed without approval.
