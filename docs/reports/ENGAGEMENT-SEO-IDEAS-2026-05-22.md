# Engagement & SEO ideas — roadmap

**Created:** 2026-05-22
**Status:** Idea backlog (not yet scoped into TDs or briefs)
**Scope:** Ideas to make monedario.cl more interactive, more engaging, and more SEO-friendly.

This is a brainstorm-and-rank document, not a commitment. Each item still needs
proper scoping (effort estimate, TD entry, and — for anything touching YMYL
article bodies — editorial pipeline + human sign-off per `NORMA_YMYL.md`).

---

## Implementation status check (2026-05-22)

Before scoping, verified what already exists:

- **Freshness signals on articles — DONE.** `dateModified` is emitted in
  `src/components/ArticleJsonLd.astro`; posts carry `updatedDate` frontmatter,
  rendered visibly via `src/components/Datetime.astro`.
- **Freshness signals on calculators — GAP.** No `dateModified` in calculator
  structured data (only `leyes/[slug].astro` and the operación-renta guide have
  it). Only 3 of 19 calculators show any visible "actualizado / datos al" text
  (conversor-utm, deposito-a-plazo, sueldo-liquido). `conversor-uf.astro` shows
  a `uf-fecha` line, but that is the *indicator value* date, not a page-freshness
  signal.
- **Reading progress bar, dark-mode theme button — DONE** (per prior UX rounds).

---

## Ranking by implementation horizon

Effort: S = days · M = 1–2 weeks · L = multi-week / ongoing.
Ordered by priority within each horizon.

### Short term (days — quick wins)

| Idea | Effort | Why first |
|---|---|---|
| ~~HowTo/FAQ schema expansion to leyes/glosario~~ **DONE 2026-05-22** | S | Glosario index `DefinedTermSet` + leyes `FAQPage` infra. Note: Google FAQ rich results are restricted to gov/health sites and HowTo is deprecated — value is AI-citation/semantic, not Google snippets. Leyes FAQ content fill is editorial. |
| Inline "what changed" deltas in calculators | S | High engagement-per-effort; no new state to persist |
| "Related calculators" cross-links | S | Internal-link depth + session length; mechanical to add |
| Freshness signals on calculators (`dateModified` + visible "actualizado el…") | S | Closes the gap above; YMYL/SEO value, low risk |
| Inline glossary tooltips in articles | S–M | Hover definitions linking to /glosario — engagement + internal links. Touches article rendering → editorial review |

### Mid term (1–2 weeks)

| Idea | Effort | Why |
|---|---|---|
| Save & compare scenarios in calculators | M | Biggest engagement lever; builds on `monedario_profile` persistence |
| Calculator router quiz ("¿qué calculadora necesito?") | M | Improves landing-page intent match; reduces bounce |
| Shareable result cards (image/URL) | M | Engagement + organic backlink bait |
| Interactive historical charts (UF/UTM/UTA) | M | Data already exists; charts pull long-dwell traffic |
| "Key takeaways" boxes in YMYL articles | S–M | Featured-snippet bait; **requires editorial review per YMYL norm** |
| Print/PDF export of calculator results | M | High utility for finance users (taxes, loans) |

### Long term (multi-week / ongoing)

| Idea | Effort | Why later |
|---|---|---|
| Programmatic comparison pages ("UF hoy vs hace un año") | L | High long-tail SEO yield, but adds content-maintenance load |
| Embeddable calculator widgets for other blogs | L | Strong link-building; needs versioning + analytics |
| Internal search + query logging | L | Needs infra; payoff is a continuous content-idea pipeline |
| PWA push notifications for UF/UTM updates | L | Service worker already exists; high retention, opt-in UX delicate |
| Email capture around data triggers ("avísame cuando cambie la UF") | L | Recurring engagement; needs a provider + consent flow |

---

## Other ideas worth noting

- **Speakable schema** on calculators/glossary — cheap voice-search hedge.
- **Data feed / public API** for UF/UTM history — attracts developer backlinks.
- **Contextual microcopy / tooltips** on calculator inputs — reduces confusion,
  lifts completion rate.
- **Article reactions** ("¿te sirvió?") — lightweight feedback signal, lower
  risk than full comments.
- **Annual recap pages** ("UF 2026: resumen del año") — evergreen + seasonal
  traffic spikes.

---

## Cross-cutting constraint

Anything touching YMYL article bodies (key-takeaways boxes, glossary tooltips,
article reactions placement) must pass the editorial pipeline + human sign-off.
"Short term" there is gated by review, not just dev time. See `CLAUDE.md`
hard-stops and `docs/editorial/NORMA_YMYL.md`.
