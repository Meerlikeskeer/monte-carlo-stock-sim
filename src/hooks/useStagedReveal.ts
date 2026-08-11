import { useEffect, useRef, useState } from "react"
import type { SimulationResult } from "../../convex/lib/types"

export type StepStatus = "pending" | "active" | "done"

export type RevealState = {
  stepStatus: Record<string, StepStatus>
  revealedPathCount: number
  distributionsRevealed: boolean
}

const STEP_DELAY_MS = 600
const BATCH_SIZE = 5
const LINE_INTERVAL_MS = 50

function emptyState(): RevealState {
  return { stepStatus: {}, revealedPathCount: 0, distributionsRevealed: false }
}

/**
 * Drives a fake "watch it compute" animation on top of an already-complete result:
 * steps advance one at a time, then display paths reveal in small batches, then
 * distributions fade in. Every timer is tracked so a new result (re-running mid
 * animation) cancels cleanly instead of leaving stale timers firing into new state.
 */
export function useStagedReveal(result: SimulationResult | null): RevealState {
  const [state, setState] = useState<RevealState>(emptyState)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []

    if (!result) {
      setState(emptyState())
      return
    }

    const stepStatus: Record<string, StepStatus> = {}
    for (const step of result.steps) stepStatus[step.id] = "pending"
    setState({ stepStatus, revealedPathCount: 0, distributionsRevealed: false })

    let elapsed = 0
    for (const step of result.steps) {
      const activateAt = elapsed
      elapsed += STEP_DELAY_MS
      const doneAt = elapsed

      timers.current.push(
        setTimeout(() => {
          setState((prev) => ({ ...prev, stepStatus: { ...prev.stepStatus, [step.id]: "active" } }))
        }, activateAt),
      )
      timers.current.push(
        setTimeout(() => {
          setState((prev) => ({ ...prev, stepStatus: { ...prev.stepStatus, [step.id]: "done" } }))
        }, doneAt),
      )
    }

    const allStepsDoneAt = elapsed
    const totalPaths = result.displayPaths.length
    let revealed = 0
    let batchIndex = 0
    while (revealed < totalPaths) {
      revealed = Math.min(totalPaths, revealed + BATCH_SIZE)
      batchIndex += 1
      const revealedSnapshot = revealed
      timers.current.push(
        setTimeout(
          () => {
            setState((prev) => ({ ...prev, revealedPathCount: revealedSnapshot }))
          },
          allStepsDoneAt + batchIndex * LINE_INTERVAL_MS,
        ),
      )
    }

    const distributionsAt = allStepsDoneAt + (batchIndex + 1) * LINE_INTERVAL_MS + 200
    timers.current.push(
      setTimeout(() => {
        setState((prev) => ({ ...prev, distributionsRevealed: true }))
      }, distributionsAt),
    )

    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [result])

  return state
}
