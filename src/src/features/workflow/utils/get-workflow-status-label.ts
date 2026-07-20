import type {
  WorkflowStatus,
} from "../../workflow/types/workflow.types"

const WORKFLOW_STATUS_LABELS:Record<WorkflowStatus,string>={
  QUEUE:"En cola",
  PENDING:"Pendiente",
  PROGRESS:"En proceso",
  PAUSED:"Pausado",
  COMPLETED:"Completado",
  REVIEWED:"Revisado",
}

export function getWorkflowStatusLabel(
  status:WorkflowStatus,
):string{

  const normalized =
    String(status).trim().toUpperCase() as WorkflowStatus

  return WORKFLOW_STATUS_LABELS[normalized] ?? String(status)

}