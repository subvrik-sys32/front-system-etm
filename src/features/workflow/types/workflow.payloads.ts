export type WorkflowActionPayload = {
  piecesOutput?: number | null
  plRtReal?: number | null
  paintKgReal?: number | null
}

export type WorkflowUpdatePayload = {
  execution?: "IN_HOUSE" | "OUTSOURCED"
  operatorId?: string | null
  coOperatorIds?: string[]
  piecesOutput?: number | null
  plRtReal?: number | null
  paintKgReal?: number | null
}