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
  module: "tasks" | "processes" | "projects"
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

export interface NotificationProjectRef {
  id: string
  projectCode: string
  name: string
}

export interface Notification {
  id: string
  type: NotificationType
  read: boolean
  createdAt: string

  // Un comentario de proyecto no cuelga de ninguna tarea, así que
  // taskId/task son nulos en ese caso — usar `project` en su lugar.
  // (ver NotificationRoute.module==="projects")
  taskId: string | null
  projectId: string | null
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
  } | null

  // Presente cuando route.module==="projects" (o siempre, como
  // referencia rápida al proyecto sin tener que entrar a `task`).
  project: NotificationProjectRef | null

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