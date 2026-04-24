export type RelatedPostScoringInput = {
  tags: string[];
  cluster?: string;
  canonicalTopic?: string;
};

function normalizeText(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

export function scoreRelatedPostCandidate(
  current: RelatedPostScoringInput,
  candidate: RelatedPostScoringInput
): number {
  let score = 0;
  const currentCanonicalTopic = normalizeText(current.canonicalTopic);
  const candidateCanonicalTopic = normalizeText(candidate.canonicalTopic);
  const currentCluster = normalizeText(current.cluster);
  const candidateCluster = normalizeText(candidate.cluster);
  const currentTags = new Set(current.tags.map(tag => normalizeText(tag)));

  if (
    currentCanonicalTopic &&
    candidateCanonicalTopic &&
    currentCanonicalTopic === candidateCanonicalTopic
  ) {
    score += 100;
  }

  if (
    currentCluster &&
    candidateCluster &&
    currentCluster === candidateCluster
  ) {
    score += 40;
  }

  for (const tag of candidate.tags) {
    if (currentTags.has(normalizeText(tag))) score += 5;
  }

  return score;
}
