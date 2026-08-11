/**
 * Caps how many paths get sent to the chart for display. Stats should still be computed
 * from the full path set — only rendering is capped, since 200 overlapping lines is
 * visually messy without an aggressive opacity/sampling trick.
 */
export function samplePathsForDisplay<T>(paths: T[], cap = 100): T[] {
  if (paths.length <= cap) return paths
  const step = paths.length / cap
  const sampled: T[] = []
  for (let i = 0; i < cap; i++) {
    sampled.push(paths[Math.floor(i * step)])
  }
  return sampled
}
