import type {
  ProcessCode,
} from "@/features/tasks/types/task.types"

import type {
  WorkflowStatus,
} from "@/features/workflow/types/workflow.types"

export interface TimeTrackingRow{

  stepIndex: number
 
  isFinalStep: boolean

  taskId:string

  taskNumber:number

  projectCode:string

  projectName:string

  clientName:string

  reference:string

  priorityName:string

  materialName:string

  thicknessName:string

  lotNumber:number

  processCode:ProcessCode

  processLabel:string

  operatorName:string

  status:WorkflowStatus

  startedAt:string|null

  completedAt:string|null

  reviewedAt:string|null

  durationMinutes:number|null

  piecesExpected:number

  piecesOutput:number|null

  paintKgExpected:number

  paintKgReal:number|null

  plRtExpected:string|null

  plRtReal:number|null

  deliveryDate:string|null

}

export interface OperatorSummaryRow{

  operatorName:string

  stepsAssigned:number

  stepsCompleted:number

  totalDurationMinutes:number

  avgDurationMinutes:number

  totalPiecesOutput:number

  piecesPerHour:number

}