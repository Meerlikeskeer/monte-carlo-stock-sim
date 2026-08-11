export class TickerNotFoundError extends Error {
  constructor(ticker: string) {
    super(`No price history found for ticker "${ticker}"`)
    this.name = "TickerNotFoundError"
  }
}

export class InsufficientHistoryError extends Error {
  constructor(ticker: string, daysAvailable: number, minDays: number) {
    super(`Only ${daysAvailable} days of history available for "${ticker}", need at least ${minDays}`)
    this.name = "InsufficientHistoryError"
  }
}

export type PriceRow = { date: string; close: number }

function buildYahooChartUrl(ticker: string): string {
  const symbol = encodeURIComponent(ticker.trim().toUpperCase())
  return `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=2y&interval=1d`
}

/** Fetches raw chart JSON from Yahoo Finance's unofficial chart API. Network only, no parsing. */
export async function fetchYahooChart(ticker: string): Promise<unknown> {
  const response = await fetch(buildYahooChartUrl(ticker), {
    headers: { "User-Agent": "Mozilla/5.0" },
  })
  if (!response.ok) {
    throw new TickerNotFoundError(ticker)
  }
  return response.json()
}

/** Parses Yahoo's chart JSON into ascending-by-date {date, close} rows, skipping null/missing closes. */
export function parseYahooChart(json: unknown, ticker: string): PriceRow[] {
  const chart = (json as { chart?: unknown })?.chart as
    | { result?: unknown[] | null; error?: { description?: string } | null }
    | undefined

  if (!chart || !chart.result || chart.result.length === 0 || chart.error) {
    throw new TickerNotFoundError(ticker)
  }

  const result = chart.result[0] as {
    timestamp?: number[]
    indicators?: { quote?: Array<{ close?: Array<number | null> }> }
  }
  const timestamps = result.timestamp
  const closes = result.indicators?.quote?.[0]?.close

  if (!timestamps || !closes || timestamps.length === 0) {
    throw new TickerNotFoundError(ticker)
  }

  const rows: PriceRow[] = []
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i]
    if (close === null || close === undefined) continue
    rows.push({ date: new Date(timestamps[i] * 1000).toISOString().slice(0, 10), close })
  }
  return rows
}

/** Returns the most recent `maxDays` rows, throwing if fewer than `minDays` are available. */
export function selectRecentHistory(rows: PriceRow[], ticker: string, minDays = 30, maxDays = 504): PriceRow[] {
  if (rows.length < minDays) {
    throw new InsufficientHistoryError(ticker, rows.length, minDays)
  }
  return rows.slice(-maxDays)
}
