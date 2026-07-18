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
  taskId:string|null
  projectId:string|null
  workflowStepId:string|null
  userId:string
  message:string
  imageUrl:string|null
  createdAt:string
  updatedAt:string
  user:CommentUser
}

export interface CreateCommentDto{
  // Opcional: un comentario puede ser solo una foto, sin texto.
  message?:string
  imageBase64?:string
}

export interface UpdateCommentDto{
  message:string
}

export type CommentTarget=
  | { scope:"task"; taskId:string }
  | { scope:"workflowStep"; workflowStepId:string }
  | { scope:"project"; projectId:string }

export type CommentReadState =
  | "SENT"
  | "READ_PARTIAL"
  | "READ_ALL"

export interface CommentReadStatus{
  total:number
  readCount:number
  status:CommentReadState
}