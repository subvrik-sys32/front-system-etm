import type { CommentTarget } from "@/features/comments/types/comment.types"
import type { Notification } from "../types/notification.types"

/**
 * Target de comentarios para prefetch al navegar desde una noti
 * de COMMENT / MENTION / MESSAGE.
 */
export function commentTargetFromNotification(
  notification: Notification,
): CommentTarget | null {
  const type = notification.type?.toUpperCase() ?? ""
  const isComment =
    type.includes("COMMENT") ||
    type.includes("MENTION") ||
    type.includes("MESSAGE")
  if (!isComment) return null

  if (notification.workflowStepId) {
    return {
      scope: "workflowStep",
      workflowStepId: notification.workflowStepId,
    }
  }
  if (notification.taskId) {
    return { scope: "task", taskId: notification.taskId }
  }
  if (notification.projectId) {
    return { scope: "project", projectId: notification.projectId }
  }
  return null
}
