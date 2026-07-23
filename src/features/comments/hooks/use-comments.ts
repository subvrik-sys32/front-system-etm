"use client"

import { useQuery } from "@tanstack/react-query"
import { commentsService } from "../services/comments.service"
import { commentsQueryKey } from "../utils/comment-target"
import type { CommentTarget } from "../types/comment.types"

export function useComments(target:CommentTarget,enabled=true){

  const query=useQuery({
    queryKey:commentsQueryKey(target),
    enabled,
    queryFn:({signal})=>{
      if(target.scope==="task"){
        return commentsService.getTaskComments(target.taskId,signal)
      }
      if(target.scope==="workflowStep"){
        return commentsService.getWorkflowStepComments(target.workflowStepId,signal)
      }
      return commentsService.getProjectComments(target.projectId,signal)
    },
  })

  return{
    comments:query.data??[],
    loading:query.isLoading,
    refreshing:query.isFetching,
  }

}