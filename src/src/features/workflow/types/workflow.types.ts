import type { ProcessCode } from "@/features/tasks/types/task.types"
import type { User } from "@/features/users/types/user.types"

export type WorkflowStatus=
  |"QUEUE"
  |"PENDING"
  |"PROGRESS"
  |"PAUSED"
  |"COMPLETED"
  |"REVIEWED"

export type WorkflowAction=
  |"start"
  |"pause"
  |"resume"
  |"complete"
  |"review"
  |"reopen"

export interface WorkflowStep{

  id:string

  taskId:string

  processCode:ProcessCode

  order:number

  status:WorkflowStatus

  operatorId:string | null

  operator:User | null

  startedAt:string | null

  completedAt:string | null

  reviewedAt:string | null

  piecesOutput:number | null

  plRtReal:number | null

  paintKgReal:number | null

  createdAt:string

  updatedAt:string

}

export interface WorkflowHistoryEntry{

  id:string

  taskId:string

  workflowStepId:string

  processCode:ProcessCode

  action:WorkflowAction

  timestamp:string

}