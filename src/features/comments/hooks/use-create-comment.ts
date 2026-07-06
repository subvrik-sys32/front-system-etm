"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { commentsService } from "../services/comments.service"
import { commentsQueryKey } from "../utils/comment-target"
import type { Comment, CommentTarget, CreateCommentDto } from "../types/comment.types"

export function useCreateComment(target:CommentTarget){

  const queryClient=useQueryClient()
  const queryKey=commentsQueryKey(target)

  const mutation=useMutation({

    mutationFn:(dto:CreateCommentDto)=>
      target.scope==="task"
        ?commentsService.createTaskComment(target.taskId,dto)
        :commentsService.createWorkflowStepComment(target.workflowStepId,dto),

    onSuccess:created=>{
      queryClient.setQueryData<Comment[]>(
        queryKey,
        current=>[created,...(current??[])],
      )
    },

  })

  return{
    createComment:mutation.mutateAsync,
    creating:mutation.isPending,
  }

}