import type { QueryClient } from "@tanstack/react-query"

import { commentsService } from "../services/comments.service"
import type { CommentTarget } from "../types/comment.types"
import { commentsQueryKey } from "./comment-target"

/** Rellena la cache de comentarios antes de abrir el dialog (p. ej. desde notificaciones). */
export function prefetchComments(
  queryClient: QueryClient,
  target: CommentTarget,
) {
  return queryClient.prefetchQuery({
    queryKey: commentsQueryKey(target),
    queryFn: ({ signal }) => {
      if (target.scope === "task") {
        return commentsService.getTaskComments(target.taskId, signal)
      }
      if (target.scope === "workflowStep") {
        return commentsService.getWorkflowStepComments(
          target.workflowStepId,
          signal,
        )
      }
      return commentsService.getProjectComments(target.projectId, signal)
    },
  })
}
