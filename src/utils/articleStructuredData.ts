import { SITE } from "@/config";

/** Nombre con el que se firman los artículos del equipo editorial. */
const TEAM_AUTHOR_NAME = "Equipo Monedario";

export interface AuthorEntity {
  "@type": "Person" | "Organization";
  name: string;
  url: string;
  /** Solo en Person: imagen y perfiles profesionales. */
  image?: string;
  sameAs?: string[];
}

/**
 * Construye la entidad `author` del JSON-LD.
 *
 * 51 de 54 artículos están firmados por "Equipo Monedario", que es una
 * organización, no una persona. Emitirlo como `Person` es una afirmación falsa
 * en datos estructurados (defecto D18, detectado en la auditoría de
 * `descuentos-de-sueldo` y publicado hasta 2026-10-27).
 */
export function buildAuthorEntity(
  authorName: string | undefined,
  urls: { authorUrl: string; imageUrl: string }
): AuthorEntity {
  const name = authorName ?? SITE.authorFullName;

  if (name === TEAM_AUTHOR_NAME) {
    return { "@type": "Organization", name, url: urls.authorUrl };
  }

  return {
    "@type": "Person",
    name,
    url: urls.authorUrl,
    image: urls.imageUrl,
    sameAs: [SITE.authorLinkedIn, SITE.profile, SITE.authorPortfolio],
  };
}

export interface ReviewPolicyLike {
  computedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

/**
 * Construye `lastReviewed`/`reviewedBy` **solo** cuando existe una revisión
 * humana registrada.
 *
 * Antes se derivaba de `reviewPolicy.computedAt`, que es la fecha en que se
 * calculó la política de revisión — no una revisión. Eso publicaba una
 * afirmación de revisión que nadie había hecho (D18).
 */
export function buildReview(
  reviewPolicy: ReviewPolicyLike | undefined
): Record<string, unknown> {
  if (!reviewPolicy?.reviewedAt) return {};

  const reviewedAt = new Date(reviewPolicy.reviewedAt);
  if (Number.isNaN(reviewedAt.getTime())) return {};

  return {
    lastReviewed: reviewedAt.toISOString(),
    ...(reviewPolicy.reviewedBy
      ? { reviewedBy: { "@type": "Person", name: reviewPolicy.reviewedBy } }
      : {}),
  };
}
