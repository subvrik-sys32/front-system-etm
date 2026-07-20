import type { WorkflowStep } from "../types/workflow.types"

export function isWorkflowCompleted(workflow: WorkflowStep[] = []) {
  return workflow.length > 0 && workflow.every(
    step => step.status === "REVIEWED"
  )
}