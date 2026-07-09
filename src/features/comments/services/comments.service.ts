import { commentsApi } from "../api/comments.api"
import type { CommentTarget } from "../types/comment.types"

export const commentsService={
  getTaskComments:commentsApi.getTaskComments,
  getWorkflowStepComments:commentsApi.getWorkflowStepComments,
  createTaskComment:commentsApi.createTaskComment,
  createWorkflowStepComment:commentsApi.createWorkflowStepComment,
  updateComment:commentsApi.updateComment,
  deleteComment:commentsApi.deleteComment,
  getReadStatus:commentsApi.getReadStatus,
  markCommentsAsRead(target:CommentTarget){
    return target.scope==="task"
      ?commentsApi.markTaskCommentsAsRead(target.taskId)
      :commentsApi.markWorkflowStepCommentsAsRead(target.workflowStepId)
  },
}