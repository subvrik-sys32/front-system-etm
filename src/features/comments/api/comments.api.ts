import { api } from "@/lib/api"

import type {
  Comment,
  CreateCommentDto,
  UpdateCommentDto,
} from "../types/comment.types"

export const commentsApi={

  async getTaskComments(taskId:string){
    const response=await api.get<Comment[]>(`/tasks/${taskId}/comments`)
    return response.data
  },

  async getWorkflowStepComments(workflowStepId:string){
    const response=await api.get<Comment[]>(`/workflow-steps/${workflowStepId}/comments`)
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

}