import { toast } from "sonner"

import { commentsApi } from "../api/comments.api"
import type { CommentTarget } from "../types/comment.types"

// Evita mostrar el mismo toast de error una y otra vez si el
// endpoint está caído y el usuario abre varios comment timelines
// seguidos. Se resetea solo al recargar la página (module-level).
let hasNotifiedProjectReadFailure = false

export const commentsService = {
  getTaskComments: commentsApi.getTaskComments,
  getWorkflowStepComments: commentsApi.getWorkflowStepComments,
  getProjectComments: commentsApi.getProjectComments,
  createTaskComment: commentsApi.createTaskComment,
  createWorkflowStepComment: commentsApi.createWorkflowStepComment,
  createProjectComment: commentsApi.createProjectComment,
  updateComment: commentsApi.updateComment,
  deleteComment: commentsApi.deleteComment,
  getReadStatus: commentsApi.getReadStatus,
  markCommentsAsRead(target: CommentTarget) {
    if (target.scope === "task") {
      return commentsApi.markTaskCommentsAsRead(target.taskId)
    }
    if (target.scope === "workflowStep") {
      return commentsApi.markWorkflowStepCommentsAsRead(target.workflowStepId)
    }
    // Los comentarios de proyecto ahora sí generan notificaciones
    // (backend expone POST /projects/:id/comments con menciones y
    // PATCH /projects/:id/comments/read, igual que tasks/workflow-steps).
    return commentsApi.markProjectCommentsAsRead(target.projectId)
      .catch((error) => {

        console.error(
          "[commentsService] markProjectCommentsAsRead failed",
          { projectId: target.projectId, error },
        )

        if (!hasNotifiedProjectReadFailure) {

          hasNotifiedProjectReadFailure = true

          toast.error("No se pudo marcar el comentario como leído")

        }

      })
  },
}