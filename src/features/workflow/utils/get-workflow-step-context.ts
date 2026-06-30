import type { ProcessTask } from "@/features/processes/types/process.types"
import { workflowAccess } from "../access/workflow-access"

export function getWorkflowStepContext(processTask: ProcessTask){

  const stepId =
    workflowAccess.stepId(processTask)

  const locked =
    workflowAccess.isCompleted(processTask) ||
    workflowAccess.status(processTask) === "REVIEWED"

  return {
    stepId,
    locked,
    status: workflowAccess.status(processTask),
    processCode: workflowAccess.processCode(processTask),
  }
}