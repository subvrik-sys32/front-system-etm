import type { Comment } from "@/features/comments/types/comment.types"

import { getQueryClient } from "@/lib/query-client"

import type { RealtimeEvent } from "../types/realtime-event"

function resolveQueryKey(comment: Comment) {

  if (comment.workflowStepId) {
    return ["comments", "workflowStep", comment.workflowStepId] as const
  }

  if (comment.projectId) {
    return ["comments", "project", comment.projectId] as const
  }

  return ["comments", "task", comment.taskId] as const

}

export function commentHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  switch (event.action) {

    case "CREATED": {

      const comment = event.payload as Comment
      const queryKey = resolveQueryKey(comment)

      queryClient.setQueryData<Comment[]>(
        queryKey,
        current => {

          if ((current ?? []).some(c => c.id === comment.id)) {
            return current
          }

          return [comment, ...(current ?? [])]

        },
      )

      return

    }

    case "UPDATED": {

      const comment = event.payload as Comment
      const queryKey = resolveQueryKey(comment)

      queryClient.setQueryData<Comment[]>(
        queryKey,
        current => (current ?? []).map(c => c.id === comment.id ? comment : c),
      )

      return

    }

    case "DELETED": {

      const payload = event.payload as
        | { id: string; taskId: string | null; workflowStepId: string | null; projectId: string | null }
        | undefined

      if (!payload) return

      const queryKey =
        payload.workflowStepId
          ? (["comments", "workflowStep", payload.workflowStepId] as const)
          : payload.projectId
            ? (["comments", "project", payload.projectId] as const)
            : (["comments", "task", payload.taskId] as const)

      queryClient.setQueryData<Comment[]>(
        queryKey,
        current => (current ?? []).filter(c => c.id !== payload.id),
      )

      return

    }

  }

}