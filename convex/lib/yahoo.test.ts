import { describe, expect, it } from "vitest"
import { InsufficientHistoryError, TickerNotFoundError, parseYahooChart, selectRecentHistory } from "./yahoo"

function fixtureChart(closes: Array<number | null>) {
  const timestamp = closes.map((_, i) => 1700000000 + i * 86400)
  return {
    chart: {
      result: [
        {
          timestamp,
          indicators: { quote: [{ close: closes }] },
        },
      ],
      error: null,
    },
  }
}

describe("parseYahooChart", () => {
  it("parses a valid chart response into ascending date/close rows", () => {
    const rows = parseYahooChart(fixtureChart([100, 101, 102]), "AAPL")
    expect(rows).toHaveLength(3)
    expect(rows[0].close).toBe(100)
    expect(rows[2].close).toBe(102)
    expect(rows[0].date < rows[2].date).toBe(true)
  })

  it("skips null closes", () => {
    const rows = parseYahooChart(fixtureChart([100, null, 102]), "AAPL")
    expect(rows).toHaveLength(2)
    expect(rows.map((r) => r.close)).toEqual([100, 102])
  })

  it("throws TickerNotFoundError when result is null with an error object", () => {
    const invalid = { chart: { result: null, error: { code: "Not Found", description: "No data found, symbol may be delisted" } } }
    expect(() => parseYahooChart(invalid, "ZZZZZZ")).toThrow(TickerNotFoundError)
  })

  it("throws TickerNotFoundError on an empty/malformed body", () => {
    expect(() => parseYahooChart({}, "ZZZZZZ")).toThrow(TickerNotFoundError)
    expect(() => parseYahooChart({ chart: { result: [] } }, "ZZZZZZ")).toThrow(TickerNotFoundError)
  })
})

describe("selectRecentHistory", () => {
  const rows = Array.from({ length: 40 }, (_, i) => ({ date: `2024-01-${i + 1}`, close: 100 + i }))

  it("returns the most recent maxDays rows", () => {
    const recent = selectRecentHistory(rows, "AAPL", 30, 10)
    expect(recent).toHaveLength(10)
    expect(recent[recent.length - 1]).toEqual(rows[rows.length - 1])
  })

  it("throws InsufficientHistoryError when fewer than minDays rows are available", () => {
    expect(() => selectRecentHistory(rows.slice(0, 5), "AAPL", 30, 504)).toThrow(InsufficientHistoryError)
  })
})
