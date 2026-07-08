"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { commentsService } from "../services/comments.service"
import { commentsQueryKey } from "../utils/comment-target"
import type { Comment, CommentTarget } from "../types/comment.types"

export function useDeleteComment(target: CommentTarget) {

  const queryClient = useQueryClient()
  const queryKey = commentsQueryKey(target)

  const mutation = useMutation({

    mutationFn: (comment: Comment) => commentsService.deleteComment(comment.id),

    // Desaparece de la lista al instante, sin esperar los ~1.3s de
    // confirmación del servidor.
    onMutate: async (comment) => {

      await queryClient.cancelQueries({ queryKey })

      const previousComments =
        queryClient.getQueryData<Comment[]>(queryKey)

      queryClient.setQueryData<Comment[]>(
        queryKey,
        current => (current ?? []).filter(c => c.id !== comment.id),
      )

      return { previousComments }

    },

    onError: (_err, _comment, context) => {

      // El borrado falló de verdad (permiso, comentario ajeno, etc.):
      // lo regresamos a la lista, no por lentitud sino porque de
      // verdad no se borró.
      if (context?.previousComments) {
        queryClient.setQueryData(queryKey, context.previousComments)
      }

    },

  })

  return {
    deleteComment: mutation.mutateAsync,
    deleting: mutation.isPending,
  }

}