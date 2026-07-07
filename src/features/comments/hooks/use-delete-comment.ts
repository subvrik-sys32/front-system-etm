"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { commentsService } from "../services/comments.service"
import { commentsQueryKey } from "../utils/comment-target"
import type { Comment, CommentTarget } from "../types/comment.types"

export function useDeleteComment(target: CommentTarget) {

  const queryClient = useQueryClient()

  const mutation = useMutation({

    mutationFn: (comment: Comment) => commentsService.deleteComment(comment.id),

    onSuccess: (_, comment) => {

      queryClient.setQueryData<Comment[]>(
        commentsQueryKey(target),
        current => (current ?? []).filter(c => c.id !== comment.id),
      )

    },

  })

  return {
    deleteComment: mutation.mutateAsync,
    deleting: mutation.isPending,
  }

}