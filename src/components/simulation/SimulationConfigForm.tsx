import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export type SimulationParams = {
  ticker: string
  nPaths: number
  horizonDays: number
  startingInvestment: number
}

const MIN_N_PATHS = 1
const MAX_N_PATHS = 200
const MIN_HORIZON_DAYS = 21
const MAX_HORIZON_DAYS = 252

export function SimulationConfigForm({
  onRun,
  isRunning,
}: {
  onRun: (params: SimulationParams) => void
  isRunning: boolean
}) {
  const [ticker, setTicker] = useState("AAPL")
  const [nPaths, setNPaths] = useState(100)
  const [horizonDays, setHorizonDays] = useState(126)
  const [startingInvestment, setStartingInvestment] = useState(10000)

  const trimmedTicker = ticker.trim()
  const canSubmit = trimmedTicker.length > 0 && startingInvestment > 0 && !isRunning

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure simulation</CardTitle>
        <CardDescription>Pick a ticker and run a Monte Carlo simulation of its possible future price paths.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid grid-cols-1 gap-6 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canSubmit) return
            onRun({ ticker: trimmedTicker.toUpperCase(), nPaths, horizonDays, startingInvestment })
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="ticker">Ticker symbol</Label>
            <Input
              id="ticker"
              value={ticker}
              onChange={(event) => setTicker(event.target.value)}
              placeholder="AAPL"
              maxLength={10}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="investment">Starting investment</Label>
            <Input
              id="investment"
              type="number"
              min={1}
              value={startingInvestment}
              onChange={(event) => setStartingInvestment(Number(event.target.value))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="npaths">Simulated paths</Label>
              <span className="text-sm text-muted-foreground">{nPaths}</span>
            </div>
            <Slider
              id="npaths"
              min={MIN_N_PATHS}
              max={MAX_N_PATHS}
              step={1}
              value={[nPaths]}
              onValueChange={(value) => setNPaths(Array.isArray(value) ? value[0] : value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="horizon">Time horizon (trading sessions)</Label>
              <span className="text-sm text-muted-foreground">{horizonDays}</span>
            </div>
            <Slider
              id="horizon"
              min={MIN_HORIZON_DAYS}
              max={MAX_HORIZON_DAYS}
              step={1}
              value={[horizonDays]}
              onValueChange={(value) => setHorizonDays(Array.isArray(value) ? value[0] : value)}
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={!canSubmit} className="w-full md:w-auto">
              {isRunning ? "Simulating…" : "Run simulation"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
