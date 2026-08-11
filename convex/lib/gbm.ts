import { createRng, sampleStandardNormal } from "./rng"

export type GbmParams = {
  startPrice: number
  mu: number // daily drift, from historical log returns
  sigma: number // daily volatility, from historical log returns
  dt: number // time step in days (1 for daily steps)
  horizonDays: number
  nPaths: number
  seed?: number
}

/**
 * Generates `nPaths` synthetic price paths via Geometric Brownian Motion:
 * S[t+1] = S[t] * exp((mu - 0.5*sigma^2)*dt + sigma*sqrt(dt)*Z), Z ~ N(0,1).
 * Returns nPaths arrays, each of length horizonDays+1 with index 0 = startPrice.
 */
export function generateGbmPaths(params: GbmParams): number[][] {
  const { startPrice, mu, sigma, dt, horizonDays, nPaths, seed } = params
  if (startPrice <= 0) throw new Error("startPrice must be > 0")
  if (nPaths < 1) throw new Error("nPaths must be >= 1")
  if (horizonDays < 1) throw new Error("horizonDays must be >= 1")

  const rng = createRng(seed)
  const drift = (mu - 0.5 * sigma * sigma) * dt
  const diffusionScale = sigma * Math.sqrt(dt)

  const paths: number[][] = []
  for (let p = 0; p < nPaths; p++) {
    const path = new Array<number>(horizonDays + 1)
    path[0] = startPrice
    let price = startPrice
    for (let t = 1; t <= horizonDays; t++) {
      const z = sampleStandardNormal(rng)
      price = price * Math.exp(drift + diffusionScale * z)
      path[t] = price
    }
    paths.push(path)
  }
  return paths
}
