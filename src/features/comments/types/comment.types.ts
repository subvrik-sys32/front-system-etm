import { EntityIcon } from "@/shared/constants/entity-icons"

export interface CommentUser{
  id:string
  username:string|null
  name:string
  avatarUrl:string|null
  color:string
  icon:EntityIcon
}

export interface Comment{
  id:string
  taskId:string
  workflowStepId:string|null
  userId:string
  message:string
  createdAt:string
  updatedAt:string
  user:CommentUser
}

export interface CreateCommentDto{
  message:string
}

export interface UpdateCommentDto{
  message:string
}

export type CommentTarget=
  | { scope:"task"; taskId:string }
  | { scope:"workflowStep"; workflowStepId:string }