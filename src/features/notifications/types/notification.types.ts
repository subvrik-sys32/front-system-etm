import type { ProcessCode } from "@/features/tasks/types/task.types"

export type NotificationType = "MENTION" | "COMMENT"

export type WorkflowStatusValue =
  | "QUEUE"
  | "PENDING"
  | "PROGRESS"
  | "PAUSED"
  | "COMPLETED"
  | "REVIEWED"

export interface NotificationRoute {
  module: "tasks" | "processes"
  history: boolean
  processCode?: ProcessCode
}

export interface NotificationActor {
  id: string
  username: string | null
  name: string
  avatarUrl: string | null
  color: string
}

export interface Notification {
  id: string
  type: NotificationType
  read: boolean
  createdAt: string
  taskId: string
  workflowStepId: string | null
  commentId: string
  messageSnippet: string

  route: NotificationRoute

  actor: NotificationActor

  task: {
    id: string
    reference: string
    taskNumber: number
    project: {
      projectCode: string
      name: string
    }
  }

  workflowStep: {
    id: string
    processCode: string
    status: WorkflowStatusValue
  } | null
}

export interface NotificationsPage {
  items: Notification[]
  nextCursor: string | null
}