import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

import { getCurrentStep } from "@/features/workflow/selectors/get-current-step"
import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

export function getTaskProcesses(
  task: Task,
): ProcessCode[] {

  if (
    isWorkflowCompleted(
      task.workflowSteps,
    )
  ) {

    const processCodes =
      task.workflowSteps.map(
        step => step.processCode,
      )

    return Array.from(
      new Set(processCodes),
    )

  }

  const currentStep =
    getCurrentStep(
      task.workflowSteps,
    )

  if (currentStep) {

    return [currentStep.processCode]

  }

  const lastStep =
    [...task.workflowSteps]
      .sort(
        (a, b) => a.order - b.order,
      )
      .at(-1)

  if (lastStep) {

    return [lastStep.processCode]

  }

  return task.route[0]
    ? [task.route[0]]
    : []

}