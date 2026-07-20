import type { Task, ProcessCode } from "@/features/tasks/types/task.types"

export function getProcessInput(
  task: Task,
  processCode: ProcessCode
) {
  const routeIndex = task.route.findIndex(
    code => code === processCode
  )

  if (routeIndex === -1) return null

  if (routeIndex === 0) return task.pieces

  const previousProcessCode = task.route[routeIndex - 1]

  const previousStep = task.workflowSteps.find(
    step => step.processCode === previousProcessCode
  )

  return previousStep?.piecesOutput ?? null
}