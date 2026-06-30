import type {
  ProcessTask,
} from "@/features/processes/types/process.types"

import type {
  WorkflowStatus,
} from "@/features/workflow/types/workflow.types"

import {
  WORKFLOW_STATUS_DEFINITIONS,
} from "@/features/workflow/constants/workflow-status-definitions"

import type {
  EntityIcon,
} from "@/shared/constants/entity-icons"

export const workflowAccess = {

  step(item: ProcessTask) {
    return item.workflowStep ?? null
  },

  stepId(item: ProcessTask) {
    return item.workflowStep?.id ?? null
  },

  processCode(item: ProcessTask) {
    return item.workflowStep?.processCode ?? null
  },

  status(item: ProcessTask): WorkflowStatus | "QUEUE" {
    return item.workflowStep?.status ?? "QUEUE"
  },

  operatorId(item: ProcessTask) {
    return item.workflowStep?.operatorId ?? null
  },

  operator(item: ProcessTask) {
    return item.workflowStep?.operator ?? null
  },

  piecesOutput(item: ProcessTask) {
    return item.workflowStep?.piecesOutput ?? null
  },

  plRtReal(item: ProcessTask) {
    return item.workflowStep?.plRtReal ?? null
  },

  paintKgReal(item: ProcessTask) {
    return item.workflowStep?.paintKgReal ?? null
  },

  startedAt(item: ProcessTask) {
    return item.workflowStep?.startedAt ?? null
  },

  completedAt(item: ProcessTask) {
    return item.workflowStep?.completedAt ?? null
  },

  isCompleted(item: ProcessTask) {
    return item.workflowStep?.status === "REVIEWED"
  },

  isInProgress(item: ProcessTask) {
    return item.workflowStep?.status === "PROGRESS"
  },

  statusLabel(item: ProcessTask) {

    const statusKey =
      item.workflowStep?.status ?? "QUEUE"

    const definition =
      WORKFLOW_STATUS_DEFINITIONS[statusKey]

    return {

      label:
        definition.label,

      color:
        definition.color,

      icon:
        definition.icon as EntityIcon,

    }

  },

}