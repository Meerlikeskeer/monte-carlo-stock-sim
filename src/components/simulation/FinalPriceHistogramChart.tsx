import { HistogramChart } from "./HistogramChart"
import type { HistogramBin } from "../../../convex/lib/types"

export function FinalPriceHistogramChart({
  bins,
  totalCount,
  startPrice,
}: {
  bins: HistogramBin[]
  totalCount: number
  startPrice: number
}) {
  return (
    <HistogramChart
      title="Final price distribution"
      description="Where the price lands at the end of the simulated horizon, across all paths."
      bins={bins}
      totalCount={totalCount}
      splitValue={startPrice}
      splitLabel={`Current $${startPrice.toFixed(0)}`}
      formatBinLabel={(start, end) => `$${start.toFixed(2)} to $${end.toFixed(2)}`}
      formatAxisTick={(value) => `$${value.toFixed(0)}`}
    />
  )
}
