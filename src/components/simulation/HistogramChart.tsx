import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { TooltipContentProps } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { HistogramBin } from "../../../convex/lib/types"

type HistogramChartProps = {
  title: string
  description: string
  bins: HistogramBin[]
  totalCount: number
  splitValue: number
  splitLabel: string
  formatBinLabel: (start: number, end: number) => string
  formatAxisTick: (value: number) => string
}

type ChartDatum = { midpoint: number; binStart: number; binEnd: number; count: number }

function HistogramTooltip({ active, payload, formatBinLabel, totalCount }: TooltipContentProps & {
  formatBinLabel: (start: number, end: number) => string
  totalCount: number
}) {
  if (!active || !payload || payload.length === 0) return null
  const datum = payload[0].payload as ChartDatum
  const pct = totalCount === 0 ? 0 : (datum.count / totalCount) * 100
  return (
    <div className="rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
      <div className="text-muted-foreground">{formatBinLabel(datum.binStart, datum.binEnd)}</div>
      <div className="font-medium">
        {datum.count} paths ({pct.toFixed(1)}%)
      </div>
    </div>
  )
}

export function HistogramChart({
  title,
  description,
  bins,
  totalCount,
  splitValue,
  splitLabel,
  formatBinLabel,
  formatAxisTick,
}: HistogramChartProps) {
  const data: ChartDatum[] = bins.map((bin) => ({
    midpoint: (bin.binStart + bin.binEnd) / 2,
    binStart: bin.binStart,
    binEnd: bin.binEnd,
    count: bin.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <XAxis
                dataKey="midpoint"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={formatAxisTick}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={36} allowDecimals={false} />
              <Tooltip
                content={(props) => <HistogramTooltip {...props} formatBinLabel={formatBinLabel} totalCount={totalCount} />}
                cursor={{ fill: "var(--muted)" }}
              />
              <ReferenceLine
                x={splitValue}
                stroke="var(--muted-foreground)"
                label={{ value: splitLabel, position: "top", fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                {data.map((datum, index) => (
                  <Cell key={index} fill={datum.midpoint >= splitValue ? "var(--viz-blue)" : "var(--viz-red)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
