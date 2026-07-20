import type { WorkflowStatus } from "../types/workflow.types"

export const WORKFLOW_STATUSES: WorkflowStatus[] = [
  "QUEUE",
  "PENDING",
  "PROGRESS",
  "PAUSED",
  "COMPLETED",
  "REVIEWED",
]