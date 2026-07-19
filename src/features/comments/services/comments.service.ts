import { toast } from "sonner"

import { commentsApi } from "../api/comments.api"
import type { CommentTarget } from "../types/comment.types"

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

        // No bloqueamos ni interrumpimos al usuario por esto (es
        // una acción de fondo, no algo que disparó activamente),
        // pero un toast discreto avisa que algo no sincronizó bien
        // en vez de fallar 100% invisible.
        toast.error("No se pudo marcar el comentario como leído", {
          description: "Se reintentará automáticamente más tarde.",
          duration: 4000,
        })

      })
  },
}