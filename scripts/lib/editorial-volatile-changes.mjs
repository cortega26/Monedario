/**
 * Compares two editorial volatile-data snapshots and reports which datasets
 * actually changed their value.
 *
 * The review-policy generator must not treat a new observation date as a
 * content change: `lastObservedAt` can advance while the underlying value is
 * identical. Only a value change justifies bumping an article's `updatedDate`.
 */

export function detectChangedDatasetIds(previousSnapshot, currentSnapshot) {
  const previous = previousSnapshot?.datasets ?? {};
  const current = currentSnapshot?.datasets ?? {};
  const changed = new Set();

  for (const id of Object.keys(current)) {
    if (!Object.hasOwn(previous, id)) continue;
    if (!Object.hasOwn(current[id] ?? {}, "value")) continue;

    const before = previous[id]?.value;
    const after = current[id]?.value;
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      changed.add(id);
    }
  }

  return changed;
}

export function articleHasChangedTrigger(dataTriggers, changedDatasetIds) {
  if (!Array.isArray(dataTriggers) || dataTriggers.length === 0) return false;
  return dataTriggers.some(id => changedDatasetIds.has(id));
}
