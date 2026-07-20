import type { WorkflowStep } from "../types/workflow.types"
import { getCurrentStep } from "../selectors/get-current-step"
import { isWorkflowCompleted } from "../selectors/is-completed"

export function createWorkflowView(workflow: WorkflowStep[]) {

  const completedSteps =
    workflow.filter(s => s.status === "REVIEWED").length

  const totalSteps = workflow.length

  const progress =
    totalSteps === 0
      ? 0
      : Math.round((completedSteps * 100) / totalSteps)

  const currentStep = getCurrentStep(workflow)

  const completed = isWorkflowCompleted(workflow)

  return {
    completedSteps,
    totalSteps,
    progress,
    completed,
    currentStep,
    currentProcess: currentStep?.processCode ?? null,
    currentStatus: currentStep?.status ?? null,
  }
}