"use client"

import { useQuery } from "@tanstack/react-query"
import { commentsService } from "../services/comments.service"
import { commentsQueryKey } from "../utils/comment-target"
import type { CommentTarget } from "../types/comment.types"

export function useComments(target:CommentTarget){

  const query=useQuery({
    queryKey:commentsQueryKey(target),
    queryFn:()=>
      target.scope==="task"
        ?commentsService.getTaskComments(target.taskId)
        :commentsService.getWorkflowStepComments(target.workflowStepId),
  })

  return{
    comments:query.data??[],
    loading:query.isLoading,
    refreshing:query.isFetching,
  }

}