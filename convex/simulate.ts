import { ConvexError, v } from "convex/values"
import { action } from "./_generated/server"
import { generateGbmPaths } from "./lib/gbm"
import { samplePathsForDisplay } from "./lib/sampling"
import { buildHistogram, estimateDriftAndVolatility, probabilityOfLoss, summarizeDistribution } from "./lib/stats"
import type { SimulationResult } from "./lib/types"
import { InsufficientHistoryError, TickerNotFoundError, fetchYahooChart, parseYahooChart, selectRecentHistory } from "./lib/yahoo"

const TRADING_DAYS_PER_YEAR = 252
const DISPLAY_PATH_CAP = 100
const HISTOGRAM_BIN_COUNT = 20
const MIN_N_PATHS = 1
const MAX_N_PATHS = 200
const MIN_HORIZON_DAYS = 21
const MAX_HORIZON_DAYS = 252

export const runSimulation = action({
  args: {
    ticker: v.string(),
    nPaths: v.number(),
    horizonDays: v.number(),
    startingInvestment: v.number(),
    seed: v.optional(v.number()),
  },
  handler: async (_ctx, args): Promise<SimulationResult> => {
    const ticker = args.ticker.trim().toUpperCase()
    if (!ticker) {
      throw new ConvexError({ code: "INVALID_ARGS", message: "Ticker is required." })
    }
    if (args.nPaths < MIN_N_PATHS || args.nPaths > MAX_N_PATHS || !Number.isInteger(args.nPaths)) {
      throw new ConvexError({ code: "INVALID_ARGS", message: `nPaths must be an integer between ${MIN_N_PATHS} and ${MAX_N_PATHS}.` })
    }
    if (args.horizonDays < MIN_HORIZON_DAYS || args.horizonDays > MAX_HORIZON_DAYS || !Number.isInteger(args.horizonDays)) {
      throw new ConvexError({ code: "INVALID_ARGS", message: `horizonDays must be an integer between ${MIN_HORIZON_DAYS} and ${MAX_HORIZON_DAYS}.` })
    }
    if (!(args.startingInvestment > 0)) {
      throw new ConvexError({ code: "INVALID_ARGS", message: "startingInvestment must be > 0." })
    }

    let historyRows
    try {
      const chartJson = await fetchYahooChart(ticker)
      const parsed = parseYahooChart(chartJson, ticker)
      historyRows = selectRecentHistory(parsed, ticker)
    } catch (error) {
      if (error instanceof TickerNotFoundError) {
        throw new ConvexError({ code: "TICKER_NOT_FOUND", message: error.message })
      }
      if (error instanceof InsufficientHistoryError) {
        throw new ConvexError({ code: "INSUFFICIENT_HISTORY", message: error.message })
      }
      throw error
    }

    const closes = historyRows.map((row) => row.close)
    const startPrice = closes[closes.length - 1]
    const asOfDate = historyRows[historyRows.length - 1].date
    const { mu, sigma } = estimateDriftAndVolatility(closes)

    const seed = args.seed ?? Math.floor(Math.random() * 2 ** 31)
    const paths = generateGbmPaths({
      startPrice,
      mu,
      sigma,
      dt: 1,
      horizonDays: args.horizonDays,
      nPaths: args.nPaths,
      seed,
    })

    const allFinalPrices = paths.map((path) => path[path.length - 1])
    const allReturns = allFinalPrices.map((price) => (price / startPrice - 1) * 100)
    const dollarOutcomes = allReturns.map((returnPct) => args.startingInvestment * (1 + returnPct / 100))
    const sortedDollarOutcomes = [...dollarOutcomes].sort((a, b) => a - b)

    const finalPriceStats = summarizeDistribution(allFinalPrices)
    const returnStats = summarizeDistribution(allReturns)

    const result: SimulationResult = {
      ticker,
      startPrice,
      asOfDate,
      historyDaysUsed: historyRows.length,

      dailyDrift: mu,
      dailyVolatility: sigma,
      annualizedDrift: mu * TRADING_DAYS_PER_YEAR,
      annualizedVolatility: sigma * Math.sqrt(TRADING_DAYS_PER_YEAR),

      horizonDays: args.horizonDays,
      nPaths: args.nPaths,
      startingInvestment: args.startingInvestment,
      seed,

      displayPaths: samplePathsForDisplay(paths, DISPLAY_PATH_CAP),
      allFinalPrices,
      allReturns,

      finalPriceStats,
      returnStats,
      probabilityOfLoss: probabilityOfLoss(allFinalPrices, startPrice),

      finalPriceHistogram: buildHistogram(allFinalPrices, HISTOGRAM_BIN_COUNT),
      returnHistogram: buildHistogram(allReturns, HISTOGRAM_BIN_COUNT),

      dollarOutcomeStats: {
        mean: dollarOutcomes.reduce((sum, v) => sum + v, 0) / dollarOutcomes.length,
        median: sortedDollarOutcomes[Math.floor(sortedDollarOutcomes.length / 2)],
        p5: sortedDollarOutcomes[Math.floor(sortedDollarOutcomes.length * 0.05)],
        p95: sortedDollarOutcomes[Math.min(sortedDollarOutcomes.length - 1, Math.floor(sortedDollarOutcomes.length * 0.95))],
      },

      steps: [
        { id: "fetch", label: `Fetching historical prices for ${ticker}` },
        { id: "stats", label: "Computing drift & volatility from recent history" },
        { id: "simulate", label: `Simulating ${args.nPaths} price paths over ${args.horizonDays} sessions` },
        { id: "distributions", label: "Computing return & price distributions" },
      ],
    }

    return result
  },
})
