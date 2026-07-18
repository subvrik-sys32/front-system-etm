"use client"

import { useState } from "react"
import { CommentComposer } from "@/features/comments/components/comment-composer"
import { CommentTimeline } from "@/features/comments/components/comment-timeline"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"
import type { Comment } from "@/features/comments/types/comment.types"

type Props = { taskId: string }

export function TaskCommentsPanel({ taskId }: Props) {

  const { isMobile } = useResponsive()

  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const target = { scope: "task" as const, taskId }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col rounded-xl bg-white/2 p-3">
      <div
        className={cn(
          "grid min-h-0 flex-1 gap-3",
          // Apilado en mobile: 2 columnas fijas quedaban apretadas en
          // pantallas angostas — antes esto no tenía ningún chequeo
          // de ancho, siempre 2 columnas sin importar el espacio real.
          isMobile ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        <div className="flex min-h-0 flex-col gap-3">
          <CommentComposer
            target={target}
            editingComment={editingComment}
            onCancelEdit={() => setEditingComment(null)}
          />
        </div>
        <CommentTimeline target={target} onEditComment={setEditingComment} />
      </div>
    </div>

  )

}