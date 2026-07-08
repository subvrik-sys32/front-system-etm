"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { useAuthStore } from "@/features/auth/store/auth-store"

import { commentsService } from "../services/comments.service"
import { commentsQueryKey } from "../utils/comment-target"
import type { Comment, CommentTarget, CreateCommentDto } from "../types/comment.types"

export function useCreateComment(target:CommentTarget){

  const queryClient=useQueryClient()
  const queryKey=commentsQueryKey(target)
  const currentUser=useAuthStore(s=>s.user)

  const mutation=useMutation({

    mutationFn:(dto:CreateCommentDto)=>
      target.scope==="task"
        ?commentsService.createTaskComment(target.taskId,dto)
        :commentsService.createWorkflowStepComment(target.workflowStepId,dto),

    // El comentario aparece YA en pantalla, sin esperar la confirmación
    // del servidor (que hoy tarda ~1.3s por latencia de infraestructura
    // de la base, algo ajeno al código de la app). Si el servidor
    // confirma, se reemplaza el temporal por el real sin parpadeo. Si
    // falla de verdad (no por lentitud), se revierte solo.
    onMutate: async (dto) => {

      await queryClient.cancelQueries({ queryKey })

      const previousComments =
        queryClient.getQueryData<Comment[]>(queryKey)

      const optimisticId = `optimistic-${crypto.randomUUID()}`
      const now = new Date().toISOString()

      // OJO: esto asume la forma de `user` en Comment (id, username,
      // name, avatarUrl, color, icon — ver commentUserSelect) y que
      // useAuthStore().user trae esos mismos campos. Si el store de auth
      // no tiene `username`/`color`/`icon`, este comentario optimista se
      // va a ver con esos valores en blanco/placeholder por una fracción
      // de segundo hasta que se reemplace por el real — avisame si es
      // el caso y ajusto los nombres de campo exactos.
      const optimisticComment = {
        id: optimisticId,
        taskId: target.scope === "task" ? target.taskId : (previousComments?.[0]?.taskId ?? ""),
        workflowStepId: target.scope === "workflowStep" ? target.workflowStepId : null,
        userId: currentUser?.id ?? "",
        message: dto.message.trim(),
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        user: {
          id: currentUser?.id ?? "",
          username: currentUser?.username ?? "",
          name: currentUser?.name ?? "",
          avatarUrl: currentUser?.avatarUrl ?? null,
          color: currentUser?.color ?? "#6B7280",
          icon: currentUser?.icon ?? "user",
        },
      } as unknown as Comment

      queryClient.setQueryData<Comment[]>(
        queryKey,
        current => [optimisticComment, ...(current ?? [])],
      )

      return { previousComments, optimisticId }

    },

    onError: (_err, _dto, context) => {

      // Falló de verdad (permiso, validación, red caída) — no por
      // lentitud del servidor. Revertimos al estado real anterior.
      if (context?.previousComments) {
        queryClient.setQueryData(queryKey, context.previousComments)
      }

    },

    onSuccess: (created, _dto, context) => {

      // Reemplazamos el temporal por el comentario real (con su id
      // definitivo del servidor), sin duplicar ni parpadear.
      queryClient.setQueryData<Comment[]>(
        queryKey,
        current =>
          (current ?? []).map(c =>
            c.id === context?.optimisticId ? created : c,
          ),
      )

    },

  })

  return {
    createComment: mutation.mutateAsync,
    creating: mutation.isPending,
  }

}