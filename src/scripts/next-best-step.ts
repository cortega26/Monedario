// Client-side hydrator for Next Best Step contextual CTAs.
// Authoritative spec: docs/adr/ADR-20260416-next-best-step-framework.md

import { getProfile } from "@/utils/userProfile";
import { evaluate, type PageContext, type Suggestion } from "@/utils/nextBestStep";
import { RULES } from "@/data/nextBestStep/rules";
import { trackAnalyticsEvent } from "@/utils/analytics";

const YMYL_SOURCES: Readonly<Record<string, { label: string; url: string }>> = {
  tax: { label: "Servicio de Impuestos Internos", url: "https://www.sii.cl" },
  labor: {
    label: "Superintendencia de Seguridad Social",
    url: "https://www.suseso.gob.cl",
  },
  pension: {
    label: "Superintendencia de Seguridad Social",
    url: "https://www.suseso.gob.cl",
  },
  credit: {
    label: "Comisión para el Mercado Financiero",
    url: "https://www.cmfchile.cl/portal/principal/613/w3-channel.html",
  },
};

function buildCard(
  suggestion: Suggestion,
  position: number,
  calculatorSlug: string
): HTMLElement {
  const aside = document.createElement("aside");
  aside.className =
    "not-prose my-4 flex items-start gap-4 rounded-xl border border-accent/25 bg-accent/5 px-5 py-4";
  aside.setAttribute("aria-label", "Próximo paso sugerido");

  const icon = document.createElement("span");
  icon.className = "text-2xl leading-none";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "🧮";

  const body = document.createElement("div");
  body.className = "flex-1";

  const headline = document.createElement("p");
  headline.className = "text-sm font-semibold text-foreground";
  headline.textContent = suggestion.headline;

  const link = document.createElement("a");
  link.href = suggestion.href;
  link.className =
    "mt-3 inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-background transition-opacity hover:opacity-90";
  link.textContent = suggestion.ctaLabel;
  link.addEventListener("click", () => {
    trackAnalyticsEvent("next_best_step_click", {
      rule_id: suggestion.id,
      calculator_slug: calculatorSlug,
      target_href: suggestion.href,
      position,
    });
  });

  body.append(headline, link);

  if (suggestion.ymylTag) {
    const source = YMYL_SOURCES[suggestion.ymylTag];
    const disclaimer = document.createElement("p");
    disclaimer.className = "mt-1 text-xs text-gray-500";

    const disclaimerText = document.createTextNode(
      "Sugerencia orientativa — valida con fuente oficial: "
    );
    disclaimer.appendChild(disclaimerText);

    if (source) {
      const sourceLink = document.createElement("a");
      sourceLink.href = source.url;
      sourceLink.target = "_blank";
      sourceLink.rel = "noopener noreferrer";
      sourceLink.className = "underline";
      sourceLink.textContent = source.label;
      disclaimer.appendChild(sourceLink);
      disclaimer.appendChild(document.createTextNode("."));
    }

    body.appendChild(disclaimer);
  }

  aside.append(icon, body);
  return aside;
}

function init(): void {
  document
    .querySelectorAll<HTMLElement>("[data-next-best-step]")
    .forEach(section => {
      if (section.dataset.nbsHydrated === "true") return;
      section.dataset.nbsHydrated = "true";

      const slug = section.dataset.calculatorSlug ?? "";
      const ctx: PageContext = {
        calculatorSlug: slug,
        currentHref: window.location.pathname,
      };

      const profile = getProfile();
      const suggestions = evaluate(profile, ctx, RULES);

      if (suggestions.length === 0) return;

      suggestions.forEach((suggestion, index) => {
        const position = index + 1;
        section.appendChild(buildCard(suggestion, position, slug));
        trackAnalyticsEvent("next_best_step_shown", {
          rule_id: suggestion.id,
          calculator_slug: slug,
          profile_signal: suggestion.rationale,
          position,
        });
      });
    });
}

function schedule(): void {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(init, { timeout: 1200 });
    return;
  }
  setTimeout(init, 120);
}

schedule();
document.addEventListener("astro:page-load", () => {
  document
    .querySelectorAll<HTMLElement>("[data-next-best-step]")
    .forEach(section => {
      delete section.dataset.nbsHydrated;
    });
  schedule();
});
