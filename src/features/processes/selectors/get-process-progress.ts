import type { ProcessTask } from "@/features/processes/types/process.types"
import type { WorkflowStatus } from "@/features/workflow/types/workflow.types"

import { WORKFLOW_STATUS_DEFINITIONS } from "@/features/workflow/constants/workflow-status-definitions"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { workflowAccess } from "@/features/workflow/access/workflow-access"

const STATUS_PROGRESS: Record<WorkflowStatus, number> = {
  QUEUE: 0,
  PENDING: 25,
  PROGRESS: 50,
  PAUSED: 50,
  COMPLETED: 75,
  REVIEWED: 100,
}

export interface ProcessProgress {
  percent: number
  statusLabel: string
  nextProcessLabel: string
}

export function getProcessProgress(processTask: ProcessTask): ProcessProgress {

  const status =
    workflowAccess.status(processTask)

  const workflowStatus =
    WORKFLOW_STATUS_DEFINITIONS[status]

  const percent =
    STATUS_PROGRESS[status]

  const currentIndex =
    processTask.task.workflowSteps.findIndex(
      step => step.id === workflowAccess.stepId(processTask)
    )

  const nextStep =
    processTask.task.workflowSteps[currentIndex + 1]

  const nextProcessLabel =
    nextStep
      ? PROCESS_DEFINITIONS[nextStep.processCode].label
      : "Fin"

  return {
    percent,
    statusLabel: workflowStatus.label,
    nextProcessLabel,
  }

}