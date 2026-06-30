import type { Task, ProcessCode } from "@/features/tasks/types/task.types"

export function getWorkflowStep(
  task: Task,
  processCode: ProcessCode
) {
  return task.workflowSteps.find(
    step => step.processCode === processCode
  )
}