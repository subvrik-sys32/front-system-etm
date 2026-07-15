"use client"

import { useQuery } from "@tanstack/react-query"
import { commentsService } from "../services/comments.service"
import { commentsQueryKey } from "../utils/comment-target"
import type { CommentTarget } from "../types/comment.types"

export function useComments(target:CommentTarget){

  const query=useQuery({
    queryKey:commentsQueryKey(target),
    queryFn:({signal})=>
      target.scope==="task"
        ?commentsService.getTaskComments(target.taskId,signal)
        :commentsService.getWorkflowStepComments(target.workflowStepId,signal),
  })

  return{
    comments:query.data??[],
    loading:query.isLoading,
    refreshing:query.isFetching,
  }

}