import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { TooltipContentProps } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type PathsChartProps = {
  paths: number[][]
  totalPaths: number
  revealedCount: number
  startPrice: number
  ticker: string
}

type ChartPoint = { day: number } & Record<string, number>

function buildChartData(paths: number[][]): ChartPoint[] {
  const length = paths[0]?.length ?? 0
  const data: ChartPoint[] = []
  for (let day = 0; day < length; day++) {
    const point = { day } as ChartPoint
    paths.forEach((path, i) => {
      point[`p${i}`] = path[day]
    })
    data.push(point)
  }
  return data
}

/** No day-by-day median is computed server-side, so we approximate the "anchor line"
 * as the single simulated path whose final price lands closest to the median final price. */
function findClosestToMedianIndex(paths: number[][]): number {
  if (paths.length === 0) return -1
  const finals = paths.map((path) => path[path.length - 1])
  const sorted = [...finals].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  let bestIndex = 0
  let bestDiff = Infinity
  finals.forEach((value, i) => {
    const diff = Math.abs(value - median)
    if (diff < bestDiff) {
      bestDiff = diff
      bestIndex = i
    }
  })
  return bestIndex
}

function PathsTooltip({ active, payload, label, medianKey }: TooltipContentProps & { medianKey: string }) {
  if (!active || !payload) return null
  const medianEntry = payload.find((entry) => entry.dataKey === medianKey)
  if (!medianEntry || typeof medianEntry.value !== "number") return null
  return (
    <div className="rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
      <div className="text-muted-foreground">Session {label}</div>
      <div className="font-medium">Median-outcome path: ${medianEntry.value.toFixed(2)}</div>
    </div>
  )
}

export function PathsChart({ paths, totalPaths, revealedCount, startPrice, ticker }: PathsChartProps) {
  const visiblePaths = paths.slice(0, revealedCount)
  const data = buildChartData(visiblePaths)
  const medianIndex = findClosestToMedianIndex(paths)
  const medianKey = `p${medianIndex}`
  const isSampled = paths.length < totalPaths

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulated price paths — {ticker}</CardTitle>
        <CardDescription>
          {isSampled ? `${paths.length} of ${totalPaths} simulated paths shown` : `${totalPaths} simulated paths`} over
          the chosen horizon; the highlighted line is the path closest to the median outcome.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                width={64}
                tickFormatter={(value: number) => `$${Math.round(value)}`}
              />
              <Tooltip content={(props) => <PathsTooltip {...props} medianKey={medianKey} />} />
              <ReferenceLine
                y={startPrice}
                stroke="var(--muted-foreground)"
                label={{ value: `Start $${startPrice.toFixed(2)}`, position: "insideTopLeft", fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              {visiblePaths.map((_, i) =>
                i === medianIndex ? null : (
                  <Line
                    key={i}
                    type="monotone"
                    dataKey={`p${i}`}
                    stroke="var(--viz-blue-wash)"
                    strokeWidth={1}
                    strokeOpacity={0.35}
                    dot={false}
                    isAnimationActive={false}
                  />
                ),
              )}
              {medianIndex >= 0 && medianIndex < visiblePaths.length && (
                <Line
                  type="monotone"
                  dataKey={medianKey}
                  stroke="var(--viz-blue)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
