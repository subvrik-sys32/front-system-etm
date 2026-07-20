import type { CommentTarget } from "../types/comment.types"

export function commentsQueryKey(target:CommentTarget){
  if(target.scope==="task"){
    return ["comments","task",target.taskId] as const
  }
  if(target.scope==="workflowStep"){
    return ["comments","workflowStep",target.workflowStepId] as const
  }
  return ["comments","project",target.projectId] as const
}