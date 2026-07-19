"use client"

import { useState } from "react"
import { CommentComposer } from "@/features/comments/components/comment-composer"
import { CommentTimeline } from "@/features/comments/components/comment-timeline"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"
import type { Comment } from "@/features/comments/types/comment.types"

type Props = { projectId: string }

// Altura propia y fija (h-43.5, mismo valor que ProcessCommentsPanel) —
// a diferencia de TaskCommentsPanel, este panel NO vive dentro de un
// contenedor flex con min-h definido (ProjectExpandedRow apila las
// secciones verticalmente, sin ese wrapper), así que no puede depender
// de flex-1 del padre para acotar su altura. Sin esto, el composer y
// el timeline crecerían sin límite en vez de scrollear.
export function ProjectCommentsPanel({ projectId }: Props) {

  const { isMobile } = useResponsive()

  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const target = { scope: "project" as const, projectId }

  return (
    <div className="flex h-43.5 w-full flex-col rounded-xl bg-white/2 p-3">
      <div
        className={cn(
          "grid min-h-0 flex-1 gap-3",
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