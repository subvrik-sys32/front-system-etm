import type { WorkflowStatus } from "../types/workflow.types"

export const WORKFLOW_TRANSITIONS: Record<
  WorkflowStatus,
  WorkflowStatus[]
> = {
  QUEUE: [],
  PENDING: ["PROGRESS"],
  PROGRESS: ["PAUSED", "COMPLETED"],
  PAUSED: ["PROGRESS"],
  COMPLETED: ["REVIEWED"],
  REVIEWED: [],
}