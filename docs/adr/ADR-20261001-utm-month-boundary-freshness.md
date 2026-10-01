# ADR-20261001 UTM month-boundary freshness

Date: 2026-10-01
Status: Accepted (documents existing behavior; does not change runtime policy)

## Context

Monedario treats UTM as a critical monthly economic parameter. The current freshness contract accepts the current calendar month as fresh and, during the first seven days of a new month, accepts the immediately previous month as `grace`. From day 8 onward, the previous month is stale. Future-dated UTM months are rejected.

This behavior is implemented and tested in `src/utils/economicFreshness.ts` and mirrored by `scripts/check-economic-snapshot-freshness.mjs`. The original gate was introduced as part of the UTM freshness/provenance validation work. Its documented design intent was to detect a dead refresh pipeline without chasing every publication lag.

The repository history establishes the seven-day value as deliberate implemented policy, but does not preserve enough evidence to claim a more specific rationale for why exactly seven days, rather than another bounded interval, was selected. This ADR does not invent one retroactively.

A 2026-10-01 portfolio review initially classified a September UTM snapshot on October 1 as stale. Inspection of the canonical Monedario contract showed that this was a false positive: October 1 is intentionally inside the existing grace period. That incident demonstrated that the policy itself needs a durable project-local decision record.

## Decision

Preserve the existing UTM month-boundary contract:

- current Chilean calendar month: `fresh`;
- immediately previous month through local calendar day 7: `grace`;
- immediately previous month from day 8: `stale`;
- any older month: `stale`;
- future month: `stale`;
- calendar interpretation uses `America/Santiago`.

The seven-day threshold remains the current contract, not a claim that seven is intrinsically optimal.

Monedario remains independently responsible for UTM provenance and freshness against its configured authoritative/fallback sources. Another portfolio project must not become a transitive runtime authority for this YMYL value merely to share freshness semantics.

## Consequences

Positive:

- The existing tested behavior is explicit and discoverable beside the code it governs.
- Audits can distinguish deliberate grace from actual stale-data drift.
- Repeated observation of previous-month UTM during days 1–7 is not, by itself, evidence of a defect.
- Monedario retains independent source verification and avoids cross-project YMYL coupling.

Trade-offs:

- A seven-day grace can temporarily expose the previous month's value after a newer official value is already available.
- A fixed threshold is simpler and more resilient than source-availability-aware freshness, but may be less precise.
- Preserving the current threshold carries forward an exact numeric choice whose original detailed rationale is not recoverable from repository evidence.

## Alternatives considered

### Fail immediately at calendar-month rollover

Rejected for the current contract. It would turn any publication, fetch, propagation, or refresh delay at the boundary into an immediate hard failure and conflicts with the existing gate's resilience intent.

### Replace the fixed grace with authoritative-source-availability-aware freshness

Not adopted by this ADR. It is a valid hypothesis for research, but requires evidence that it materially improves correctness exposure without introducing brittle source coupling or false alarms. It must proceed through normal intake rather than being smuggled into a documentation change.

### Reuse chile-hub as Monedario's runtime freshness authority

Rejected. Both projects already have project-specific provenance/freshness mechanisms, and making another repository a transitive authority would add unnecessary supply-chain and availability coupling to a YMYL path.

## Review triggers

Revisit this decision if at least one of the following occurs:

- evidence shows SII reliably publishes the applicable UTM early enough that the seven-day grace creates material stale-value exposure;
- a real incident shows seven days is too short for robust publication/fetch/propagation;
- source-availability-aware freshness can be demonstrated to be deterministic and materially safer than the fixed threshold;
- the authoritative UTM source or publication semantics change;
- the UTM refresh architecture or its source-of-truth contract materially changes.

Repeated observation of previous-month UTM during days 1–7, without one of these conditions, is not a review trigger.

## Verification

This ADR documents existing behavior and intentionally changes no runtime code.

Existing executable evidence:

- `src/utils/economicFreshness.ts`
- `scripts/check-economic-snapshot-freshness.mjs`
- `tests/utils/economicFreshness.test.ts`
- tests for the economic snapshot freshness gate

The pending portfolio hypothesis about whether seven days remains the optimal SLA is research intake; it does not supersede this ADR unless evidence satisfies a review trigger and Monedario records a subsequent decision.
