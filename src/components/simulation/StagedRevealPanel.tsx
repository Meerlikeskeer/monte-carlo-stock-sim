import { CheckCircle2Icon, CircleDashedIcon, LoaderCircleIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { SimulationStep } from "../../../convex/lib/types"
import type { StepStatus } from "@/hooks/useStagedReveal"

export function StagedRevealPanel({
  steps,
  stepStatus,
}: {
  steps: SimulationStep[]
  stepStatus: Record<string, StepStatus>
}) {
  const doneCount = steps.filter((step) => stepStatus[step.id] === "done").length
  const progressValue = steps.length === 0 ? 0 : (doneCount / steps.length) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>How this simulation works</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressValue} />
        <ul className="space-y-2">
          {steps.map((step) => {
            const status = stepStatus[step.id] ?? "pending"
            return (
              <li key={step.id} className="flex items-center gap-2 text-sm">
                {status === "done" && <CheckCircle2Icon className="size-4 shrink-0 text-primary" />}
                {status === "active" && <LoaderCircleIcon className="size-4 shrink-0 animate-spin text-primary" />}
                {status === "pending" && <CircleDashedIcon className="size-4 shrink-0 text-muted-foreground" />}
                <span className={status === "pending" ? "text-muted-foreground" : "text-foreground"}>{step.label}</span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
