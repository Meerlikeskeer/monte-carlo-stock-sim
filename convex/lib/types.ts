import type { DistributionSummary, HistogramBin } from "./stats"

export type SimulationStep = { id: string; label: string }

export type SimulationResult = {
  ticker: string
  startPrice: number
  asOfDate: string
  historyDaysUsed: number

  dailyDrift: number
  dailyVolatility: number
  annualizedDrift: number
  annualizedVolatility: number

  horizonDays: number
  nPaths: number
  startingInvestment: number
  seed: number

  displayPaths: number[][]
  allFinalPrices: number[]
  allReturns: number[]

  finalPriceStats: DistributionSummary
  returnStats: DistributionSummary
  probabilityOfLoss: number

  finalPriceHistogram: HistogramBin[]
  returnHistogram: HistogramBin[]

  dollarOutcomeStats: { mean: number; median: number; p5: number; p95: number }

  steps: SimulationStep[]
}

export type { DistributionSummary, HistogramBin }
