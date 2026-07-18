import { commentsApi } from "../api/comments.api"
import type { CommentTarget } from "../types/comment.types"

export const commentsService={
  getTaskComments:commentsApi.getTaskComments,
  getWorkflowStepComments:commentsApi.getWorkflowStepComments,
  getProjectComments:commentsApi.getProjectComments,
  createTaskComment:commentsApi.createTaskComment,
  createWorkflowStepComment:commentsApi.createWorkflowStepComment,
  createProjectComment:commentsApi.createProjectComment,
  updateComment:commentsApi.updateComment,
  deleteComment:commentsApi.deleteComment,
  getReadStatus:commentsApi.getReadStatus,
  markCommentsAsRead(target:CommentTarget){
    if(target.scope==="task"){
      return commentsApi.markTaskCommentsAsRead(target.taskId)
    }
    if(target.scope==="workflowStep"){
      return commentsApi.markWorkflowStepCommentsAsRead(target.workflowStepId)
    }
    // Los comentarios de proyecto no generan notificaciones (decisión
    // de diseño para no tocar el modelo Notification, que exige
    // taskId obligatorio) — por eso no hay "marcar como leído" a nivel
    // proyecto. No-op intencional.
    return Promise.resolve()
  },
}