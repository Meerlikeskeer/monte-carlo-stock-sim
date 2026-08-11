import { describe, expect, it } from "vitest"
import { samplePathsForDisplay } from "./sampling"

describe("samplePathsForDisplay", () => {
  it("returns all paths unchanged when under the cap", () => {
    const paths = [[1], [2], [3]]
    expect(samplePathsForDisplay(paths, 100)).toEqual(paths)
  })

  it("returns exactly `cap` items when over the cap, deterministically", () => {
    const paths = Array.from({ length: 200 }, (_, i) => [i])
    const a = samplePathsForDisplay(paths, 100)
    const b = samplePathsForDisplay(paths, 100)
    expect(a).toHaveLength(100)
    expect(a).toEqual(b)
  })

  it("includes the first path and stays within bounds", () => {
    const paths = Array.from({ length: 37 }, (_, i) => [i])
    const sampled = samplePathsForDisplay(paths, 10)
    expect(sampled).toHaveLength(10)
    expect(sampled[0]).toEqual([0])
  })
})
