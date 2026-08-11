import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatFractionAsPercent, formatPercentValue } from "@/lib/formatters"
import type { SimulationResult } from "../../../convex/lib/types"

function StatTile({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className="text-lg font-semibold"
        style={tone ? { color: tone === "good" ? "var(--viz-good)" : "var(--viz-critical)" } : undefined}
      >
        {value}
      </div>
    </div>
  )
}

export function SummaryStatsPanel({ result }: { result: SimulationResult }) {
  const { probabilityOfLoss, dollarOutcomeStats, returnStats } = result

  return (
    <Card>
      <CardHeader>
        <CardTitle>Outcome summary</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Probability of loss"
          value={formatFractionAsPercent(probabilityOfLoss)}
          tone={probabilityOfLoss >= 0.5 ? "bad" : "good"}
        />
        <StatTile label="Median outcome" value={formatCurrency(dollarOutcomeStats.median)} />
        <StatTile label="5th percentile" value={formatCurrency(dollarOutcomeStats.p5)} />
        <StatTile label="95th percentile" value={formatCurrency(dollarOutcomeStats.p95)} />
        <StatTile label="Median return" value={formatPercentValue(returnStats.median)} />
        <StatTile label="Best case (p95)" value={formatPercentValue(returnStats.p95)} />
        <StatTile label="Worst case (p5)" value={formatPercentValue(returnStats.p5)} />
        <StatTile label="Return volatility" value={`±${returnStats.stdev.toFixed(1)}%`} />
      </CardContent>
    </Card>
  )
}
