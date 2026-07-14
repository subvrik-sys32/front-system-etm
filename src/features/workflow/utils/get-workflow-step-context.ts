import type { ProcessTask } from "@/features/processes/types/process.types"
import { workflowAccess } from "../access/workflow-access"

export function getWorkflowStepContext(processTask: ProcessTask){

  const stepId =
    workflowAccess.stepId(processTask)

  const status =
    workflowAccess.status(processTask)

  // Un step deja de ser editable en cuanto se completó,
  // sin importar si el resto de la tarea sigue abierto.
  const locked =
    status === "COMPLETED" ||
    status === "REVIEWED"

  return {
    stepId,
    locked,
    status,
    processCode: workflowAccess.processCode(processTask),
  }
}