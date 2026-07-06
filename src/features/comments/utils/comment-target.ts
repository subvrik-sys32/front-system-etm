import type { CommentTarget } from "../types/comment.types"

export function commentsQueryKey(target:CommentTarget){
  return target.scope==="task"
    ?(["comments","task",target.taskId] as const)
    :(["comments","workflowStep",target.workflowStepId] as const)
}