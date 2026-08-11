import { HistogramChart } from "./HistogramChart"
import type { HistogramBin } from "../../../convex/lib/types"

export function ReturnHistogramChart({ bins, totalCount }: { bins: HistogramBin[]; totalCount: number }) {
  return (
    <HistogramChart
      title="Return distribution"
      description="Percent return across all simulated paths."
      bins={bins}
      totalCount={totalCount}
      splitValue={0}
      splitLabel="0%"
      formatBinLabel={(start, end) => `${start.toFixed(1)}% to ${end.toFixed(1)}%`}
      formatAxisTick={(value) => `${value.toFixed(0)}%`}
    />
  )
}
