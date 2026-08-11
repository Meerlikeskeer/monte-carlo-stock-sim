import { describe, expect, it } from "vitest"
import { generateGbmPaths } from "./gbm"

describe("generateGbmPaths", () => {
  it("produces identical output for the same seed", () => {
    const params = { startPrice: 100, mu: 0.0003, sigma: 0.02, dt: 1, horizonDays: 30, nPaths: 20, seed: 42 }
    const a = generateGbmPaths(params)
    const b = generateGbmPaths(params)
    expect(a).toEqual(b)
  })

  it("produces different output for different seeds", () => {
    const base = { startPrice: 100, mu: 0.0003, sigma: 0.02, dt: 1, horizonDays: 30, nPaths: 20 }
    const a = generateGbmPaths({ ...base, seed: 1 })
    const b = generateGbmPaths({ ...base, seed: 2 })
    expect(a).not.toEqual(b)
  })

  it("returns the requested shape with index 0 equal to startPrice", () => {
    const paths = generateGbmPaths({ startPrice: 250, mu: 0, sigma: 0.01, dt: 1, horizonDays: 60, nPaths: 15, seed: 7 })
    expect(paths).toHaveLength(15)
    for (const path of paths) {
      expect(path).toHaveLength(61)
      expect(path[0]).toBe(250)
    }
  })

  it("never produces NaN or non-finite prices for typical params", () => {
    const paths = generateGbmPaths({ startPrice: 50, mu: 0.0002, sigma: 0.03, dt: 1, horizonDays: 252, nPaths: 200, seed: 99 })
    for (const path of paths) {
      for (const price of path) {
        expect(Number.isFinite(price)).toBe(true)
        expect(price).toBeGreaterThan(0)
      }
    }
  })

  it("keeps the simulated log-return mean close to the theoretical drift over a large sample", () => {
    const mu = 0.0005
    const sigma = 0.02
    const horizonDays = 21
    const paths = generateGbmPaths({ startPrice: 100, mu, sigma, dt: 1, horizonDays, nPaths: 2000, seed: 123 })
    const finalLogReturns = paths.map((path) => Math.log(path[horizonDays] / path[0]))
    const sampleMean = finalLogReturns.reduce((sum, r) => sum + r, 0) / finalLogReturns.length
    const theoreticalMean = (mu - 0.5 * sigma * sigma) * horizonDays
    expect(sampleMean).toBeCloseTo(theoreticalMean, 1)
  })

  it("rejects invalid params", () => {
    const base = { startPrice: 100, mu: 0, sigma: 0.01, dt: 1, horizonDays: 10, nPaths: 5 }
    expect(() => generateGbmPaths({ ...base, startPrice: 0 })).toThrow()
    expect(() => generateGbmPaths({ ...base, nPaths: 0 })).toThrow()
    expect(() => generateGbmPaths({ ...base, horizonDays: 0 })).toThrow()
  })
})
