// Cross-run dedup backed by Cloudflare KV. Key = Reddit post id (t3_...),
// value = ISO timestamp first seen. Entries expire after RETENTION so the
// namespace stays small; a post older than that won't be alerted twice in
// practice because the search window (t=day) is far shorter.

const RETENTION_SECONDS = 7 * 24 * 60 * 60; // 7 days

export async function isSeen(kv: KVNamespace, id: string): Promise<boolean> {
  return (await kv.get(id)) !== null;
}

export async function markSeen(kv: KVNamespace, id: string, now = new Date()): Promise<void> {
  await kv.put(id, now.toISOString(), { expirationTtl: RETENTION_SECONDS });
}

/**
 * Filters posts to those not already in KV. Pure-ish: only reads KV (no writes),
 * so callers can decide when to mark seen (after a successful alert). Preserves
 * input order.
 */
export async function filterUnseen<T extends { id: string }>(
  kv: KVNamespace,
  posts: T[]
): Promise<T[]> {
  const results = await Promise.all(posts.map(p => isSeen(kv, p.id)));
  return posts.filter((_, i) => !results[i]);
}
