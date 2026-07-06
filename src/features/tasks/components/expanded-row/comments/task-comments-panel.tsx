"use client"

import { useState } from "react"
import { CommentComposer } from "@/features/comments/components/comment-composer"
import { CommentTimeline } from "@/features/comments/components/comment-timeline"
import type { Comment } from "@/features/comments/types/comment.types"

type Props = { taskId: string }

export function TaskCommentsPanel({ taskId }: Props) {

  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const target = { scope: "task" as const, taskId }

  return (
    <div className="flex h-43.5 w-full flex-col rounded-xl bg-white/2 p-3">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
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