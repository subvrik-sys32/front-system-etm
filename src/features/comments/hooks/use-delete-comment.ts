"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { commentsService } from "../services/comments.service"
import { commentsQueryKey } from "../utils/comment-target"
import type { Comment, CommentTarget } from "../types/comment.types"

export function useDeleteComment(target:CommentTarget){

  const queryClient=useQueryClient()
  const queryKey=commentsQueryKey(target)

  const mutation=useMutation({

    mutationFn:(id:string)=>commentsService.deleteComment(id),

    onSuccess:(_,id)=>{
      queryClient.setQueryData<Comment[]>(
        queryKey,
        current=>(current??[]).filter(c=>c.id!==id),
      )
    },

  })

  return{
    deleteComment:mutation.mutateAsync,
    deleting:mutation.isPending,
  }

}