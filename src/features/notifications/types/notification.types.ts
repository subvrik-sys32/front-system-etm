export type NotificationType = "MENTION" | "COMMENT"

export interface NotificationActor{
  id:string
  username:string|null
  name:string
  avatarUrl:string|null
  color:string
}

export interface Notification{
  id:string
  type:NotificationType
  read:boolean
  createdAt:string
  taskId:string
  workflowStepId:string|null
  commentId:string
  messageSnippet:string
  actor:NotificationActor
  task:{ id:string; reference:string; taskNumber:number }
  workflowStep:{ id:string; processCode:string }|null
}

export interface NotificationsPage{
  items:Notification[]
  nextCursor:string|null
}