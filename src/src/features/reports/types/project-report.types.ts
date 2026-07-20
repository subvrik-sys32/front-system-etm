import type{
  TimeTrackingRow,
}from"./reports.types"

export interface ProjectReport{

  projectName:string

  clientName:string

  tasks:number

  operators:number

  processes:number

  completed:number

  reviewed:number

  pending:number

  progress:number

  paused:number

  queue:number

  totalPiecesExpected:number

  totalPiecesOutput:number

  totalDurationMinutes:number

  rows:TimeTrackingRow[]

}