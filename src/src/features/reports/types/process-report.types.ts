import type{
  ProcessCode,
}from"@/features/tasks/types/task.types"

import type{
  TimeTrackingRow,
}from"./reports.types"

export interface ProcessReport{

  processCode:ProcessCode

  processLabel:string

  operators:number

  tasks:number

  completed:number

  reviewed:number

  pending:number

  progress:number

  paused:number

  queue:number

  totalDurationMinutes:number

  totalPiecesOutput:number

  rows:TimeTrackingRow[]

}