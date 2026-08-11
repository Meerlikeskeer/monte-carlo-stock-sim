import { describe, expect, it } from "vitest"
import {
  buildHistogram,
  computeLogReturns,
  estimateDriftAndVolatility,
  percentile,
  probabilityOfLoss,
  summarizeDistribution,
} from "./stats"

describe("computeLogReturns", () => {
  it("computes log returns between consecutive closes", () => {
    const returns = computeLogReturns([100, 110, 99])
    expect(returns).toHaveLength(2)
    expect(returns[0]).toBeCloseTo(Math.log(1.1), 10)
    expect(returns[1]).toBeCloseTo(Math.log(99 / 110), 10)
  })
})

describe("estimateDriftAndVolatility", () => {
  it("matches a hand-computed fixture", () => {
    // Closes chosen so log returns are exactly [0.1, -0.1, 0.05] (approximately, via exp).
    const closes = [100, 100 * Math.exp(0.1), 100 * Math.exp(0.1) * Math.exp(-0.1), 100 * Math.exp(0.1) * Math.exp(-0.1) * Math.exp(0.05)]
    const { mu, sigma } = estimateDriftAndVolatility(closes)
    const expectedMu = (0.1 - 0.1 + 0.05) / 3
    expect(mu).toBeCloseTo(expectedMu, 10)
    expect(sigma).toBeGreaterThan(0)
  })

  it("throws with fewer than 2 closes", () => {
    expect(() => estimateDriftAndVolatility([100])).toThrow()
  })
})

describe("percentile", () => {
  const sorted = [10, 20, 30, 40, 50]

  it("handles p=0 and p=1 as min/max", () => {
    expect(percentile(sorted, 0)).toBe(10)
    expect(percentile(sorted, 1)).toBe(50)
  })

  it("handles p=0.5 as the median", () => {
    expect(percentile(sorted, 0.5)).toBe(30)
  })

  it("linearly interpolates between ranks", () => {
    // rank = 0.25 * 4 = 1.0 -> exactly index 1
    expect(percentile(sorted, 0.25)).toBe(20)
  })
})

describe("summarizeDistribution", () => {
  it("computes mean/median/stdev/min/max correctly", () => {
    const summary = summarizeDistribution([1, 2, 3, 4, 5])
    expect(summary.mean).toBe(3)
    expect(summary.median).toBe(3)
    expect(summary.min).toBe(1)
    expect(summary.max).toBe(5)
    expect(summary.stdev).toBeCloseTo(Math.sqrt(2), 10)
  })
})

describe("probabilityOfLoss", () => {
  it("computes the fraction of final prices below the start price", () => {
    const prob = probabilityOfLoss([90, 95, 100, 105, 110], 100)
    expect(prob).toBeCloseTo(0.4, 10) // 90 and 95 are below 100
  })
})

describe("buildHistogram", () => {
  it("bins sum to the input length and span the full min-max range", () => {
    const values = Array.from({ length: 1000 }, (_, i) => i)
    const bins = buildHistogram(values, 20)
    expect(bins).toHaveLength(20)
    expect(bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(1000)
    expect(bins[0].binStart).toBe(0)
    expect(bins[bins.length - 1].binEnd).toBe(999)
  })

  it("handles a constant input as a single bin", () => {
    const bins = buildHistogram([5, 5, 5], 20)
    expect(bins).toHaveLength(1)
    expect(bins[0].count).toBe(3)
  })
})
