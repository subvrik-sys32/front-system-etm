import type { StepExecution } from "./workflow.types"

export type WorkflowActionPayload = {
  piecesOutput?: number | null
  plRtReal?: number | null
  paintKgReal?: number | null
}

export type WorkflowUpdatePayload = {
  operatorId?: string | null
  coOperatorIds?: string[]
  execution?: StepExecution
  piecesOutput?: number | null
  plRtReal?: number | null
  paintKgReal?: number | null
}
