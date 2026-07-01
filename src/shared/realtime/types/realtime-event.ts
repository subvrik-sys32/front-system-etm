export type RealtimeEntity=
  |"PROJECT"
  |"TASK"
  |"WORKFLOW"
  |"PROCESS"
  |"USER"
  |"ROLE"
  |"PERMISSION"

export type RealtimeAction=
  |"CREATED"
  |"UPDATED"
  |"DELETED"
  |"REORDERED"

export interface RealtimeEvent{

  entity:RealtimeEntity

  action:RealtimeAction

  id:string

  payload?:unknown

  timestamp?:number

}