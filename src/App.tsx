import { useState } from "react"
import { useAction } from "convex/react"
import { ConvexError } from "convex/values"
import { toast } from "sonner"
import { api } from "../convex/_generated/api"
import type { SimulationResult } from "../convex/lib/types"
import { Toaster } from "@/components/ui/sonner"
import { SimulationConfigForm, type SimulationParams } from "@/components/simulation/SimulationConfigForm"
import { StagedRevealPanel } from "@/components/simulation/StagedRevealPanel"
import { PathsChart } from "@/components/simulation/PathsChart"
import { ReturnHistogramChart } from "@/components/simulation/ReturnHistogramChart"
import { FinalPriceHistogramChart } from "@/components/simulation/FinalPriceHistogramChart"
import { SummaryStatsPanel } from "@/components/simulation/SummaryStatsPanel"
import { useStagedReveal } from "@/hooks/useStagedReveal"

function App() {
  const runSimulation = useAction(api.simulate.runSimulation)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const reveal = useStagedReveal(result)

  async function handleRun(params: SimulationParams) {
    setIsRunning(true)
    try {
      const next = await runSimulation(params)
      setResult(next)
    } catch (error) {
      if (error instanceof ConvexError) {
        const data = error.data as { code?: string; message?: string }
        toast.error(data.message ?? "Simulation failed.")
      } else {
        toast.error("Something went wrong running the simulation.")
      }
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Monte Carlo Stock Simulator</h1>
        <p className="text-muted-foreground">
          Simulate a stock's possible future price paths using Geometric Brownian Motion, calibrated from its own
          recent history.
        </p>
      </div>

      <SimulationConfigForm onRun={handleRun} isRunning={isRunning} />

      {result && (
        <>
          <StagedRevealPanel steps={result.steps} stepStatus={reveal.stepStatus} />

          <PathsChart
            paths={result.displayPaths}
            totalPaths={result.nPaths}
            revealedCount={reveal.revealedPathCount}
            startPrice={result.startPrice}
            ticker={result.ticker}
          />

          {reveal.distributionsRevealed && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ReturnHistogramChart bins={result.returnHistogram} totalCount={result.nPaths} />
              <FinalPriceHistogramChart bins={result.finalPriceHistogram} totalCount={result.nPaths} startPrice={result.startPrice} />
            </div>
          )}

          {reveal.distributionsRevealed && <SummaryStatsPanel result={result} />}
        </>
      )}

      <Toaster />
    </main>
  )
}

export default App
