import { commentsApi } from "../api/comments.api"

export const commentsService={
  getTaskComments:commentsApi.getTaskComments,
  getWorkflowStepComments:commentsApi.getWorkflowStepComments,
  createTaskComment:commentsApi.createTaskComment,
  createWorkflowStepComment:commentsApi.createWorkflowStepComment,
  updateComment:commentsApi.updateComment,
  deleteComment:commentsApi.deleteComment,
}