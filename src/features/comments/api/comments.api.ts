import { api } from "@/lib/api"
import type {
  Comment,
  CommentReadStatus,
  CreateCommentDto,
  UpdateCommentDto,
} from "../types/comment.types"

export const commentsApi={
  async getTaskComments(taskId:string,signal?:AbortSignal){
    const response=await api.get<Comment[]>(`/tasks/${taskId}/comments`,{ signal })
    return response.data
  },
  async getWorkflowStepComments(workflowStepId:string,signal?:AbortSignal){
    const response=await api.get<Comment[]>(`/workflow-steps/${workflowStepId}/comments`,{ signal })
    return response.data
  },
  async createTaskComment(taskId:string,dto:CreateCommentDto){
    const response=await api.post<Comment>(`/tasks/${taskId}/comments`,dto)
    return response.data
  },
  async createWorkflowStepComment(workflowStepId:string,dto:CreateCommentDto){
    const response=await api.post<Comment>(`/workflow-steps/${workflowStepId}/comments`,dto)
    return response.data
  },
  async updateComment(id:string,dto:UpdateCommentDto){
    const response=await api.patch<Comment>(`/comments/${id}`,dto)
    return response.data
  },
  async deleteComment(id:string){
    await api.delete(`/comments/${id}`)
  },
  async getReadStatus(id:string){
    const response=await api.get<CommentReadStatus>(`/comments/${id}/read-status`)
    return response.data
  },

  async markTaskCommentsAsRead(taskId:string){
    await api.patch(`/tasks/${taskId}/comments/read`)
  },
  async markWorkflowStepCommentsAsRead(workflowStepId:string){
    await api.patch(`/workflow-steps/${workflowStepId}/comments/read`)
  },
}