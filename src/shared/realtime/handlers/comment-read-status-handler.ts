import { getQueryClient } from "@/lib/query-client"
import type { RealtimeEvent } from "../types/realtime-event"
import type { CommentReadStatus } from "@/features/comments/types/comment.types"

export function commentReadStatusHandler(
  event: RealtimeEvent,
) {
  if (event.action !== "UPDATED") return

  const payload = event.payload as CommentReadStatus & { commentId: string }
  const queryClient = getQueryClient()

  queryClient.setQueryData<CommentReadStatus>(
    ["comment-read-status", payload.commentId],
    {
      total: payload.total,
      readCount: payload.readCount,
      allRead: payload.allRead,
    },
  )
}