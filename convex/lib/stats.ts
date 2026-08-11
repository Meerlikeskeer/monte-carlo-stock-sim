export function computeLogReturns(closes: number[]): number[] {
  const returns: number[] = []
  for (let i = 1; i < closes.length; i++) {
    returns.push(Math.log(closes[i] / closes[i - 1]))
  }
  return returns
}

/** Daily drift (mean) and volatility (stdev) estimated from historical log returns. */
export function estimateDriftAndVolatility(closes: number[]): { mu: number; sigma: number } {
  if (closes.length < 2) throw new Error("need at least 2 closes to estimate drift/volatility")
  const returns = computeLogReturns(closes)
  const mu = mean(returns)
  const sigma = Math.sqrt(mean(returns.map((r) => (r - mu) ** 2)))
  return { mu, sigma }
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

/** Linear-interpolated percentile; `p` in [0,1]; `sortedAsc` must already be sorted ascending. */
export function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) throw new Error("cannot compute a percentile of an empty array")
  if (p <= 0) return sortedAsc[0]
  if (p >= 1) return sortedAsc[sortedAsc.length - 1]
  const rank = p * (sortedAsc.length - 1)
  const lowerIndex = Math.floor(rank)
  const upperIndex = Math.ceil(rank)
  if (lowerIndex === upperIndex) return sortedAsc[lowerIndex]
  const weight = rank - lowerIndex
  return sortedAsc[lowerIndex] * (1 - weight) + sortedAsc[upperIndex] * weight
}

export type DistributionSummary = {
  mean: number
  median: number
  stdev: number
  min: number
  max: number
  p5: number
  p25: number
  p50: number
  p75: number
  p95: number
}

export function summarizeDistribution(values: number[]): DistributionSummary {
  if (values.length === 0) throw new Error("cannot summarize an empty distribution")
  const sorted = [...values].sort((a, b) => a - b)
  const avg = mean(values)
  const stdev = Math.sqrt(mean(values.map((v) => (v - avg) ** 2)))
  return {
    mean: avg,
    median: percentile(sorted, 0.5),
    stdev,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p5: percentile(sorted, 0.05),
    p25: percentile(sorted, 0.25),
    p50: percentile(sorted, 0.5),
    p75: percentile(sorted, 0.75),
    p95: percentile(sorted, 0.95),
  }
}

/** Fraction of paths whose final price ended below the starting price. */
export function probabilityOfLoss(finalPrices: number[], startPrice: number): number {
  if (finalPrices.length === 0) throw new Error("finalPrices must not be empty")
  const lossCount = finalPrices.filter((price) => price < startPrice).length
  return lossCount / finalPrices.length
}

export type HistogramBin = {
  binStart: number
  binEnd: number
  count: number
}

/** Equal-width histogram bins spanning [min(values), max(values)]. */
export function buildHistogram(values: number[], binCount = 20): HistogramBin[] {
  if (values.length === 0) throw new Error("cannot build a histogram of an empty array")
  if (binCount < 1) throw new Error("binCount must be >= 1")

  const min = Math.min(...values)
  const max = Math.max(...values)
  const bins: HistogramBin[] = []

  if (min === max) {
    return [{ binStart: min, binEnd: max, count: values.length }]
  }

  const width = (max - min) / binCount
  for (let i = 0; i < binCount; i++) {
    bins.push({ binStart: min + i * width, binEnd: min + (i + 1) * width, count: 0 })
  }
  for (const value of values) {
    const index = value === max ? binCount - 1 : Math.floor((value - min) / width)
    bins[index].count++
  }
  return bins
}
