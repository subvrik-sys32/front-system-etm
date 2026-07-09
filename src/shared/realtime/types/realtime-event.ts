export type RealtimeEntity=
  |"PROJECT"
  |"TASK"
  |"WORKFLOW"
  |"PROCESS"
  |"USER"
  |"ROLE"
  |"PERMISSION"
  |"CLIENT"
  |"COMMENT_READ_STATUS"

export type RealtimeAction=
  |"CREATED"
  |"UPDATED"
  |"BULK_READ"  
  |"DELETED"
  |"DELETED_ALL"
  |"REORDERED"  

export interface RealtimeEvent{

  entity:RealtimeEntity

  action:RealtimeAction

  id:string

  payload?:unknown

  timestamp?:number

}