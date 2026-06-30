import type { Task, ProcessCode } from "@/features/tasks/types/task.types"

export function getProcessInput(
  task: Task,
  processCode: ProcessCode
) {
  const steps = task.workflowSteps

  const index = steps.findIndex(
    step => step.processCode === processCode
  )

  if (index === -1) return null

  if (index === 0) return task.pieces

  return steps[index - 1]?.piecesOutput ?? null
}