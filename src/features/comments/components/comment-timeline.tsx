"use client"

import { useState } from "react"
import { useComments } from "../hooks/use-comments"
import { useDeleteComment } from "../hooks/use-delete-comment"
import { CommentList } from "./comment-list"
import { EmptyComments } from "./empty-comments"
import { CommentHistoryDialog } from "./comment-history-dialog"
import type { Comment, CommentTarget } from "../types/comment.types"

type Props = {
  target: CommentTarget
  onEditComment?: (comment: Comment) => void
}

export function CommentTimeline({ target, onEditComment }: Props) {

  const [historyOpen, setHistoryOpen] = useState(false)

  const { comments, loading } = useComments(target)
  const { deleteComment } = useDeleteComment(target)

  return (

    <div className="flex h-full min-h-0 flex-col rounded-xl bg-white/2">

      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-300">
          Últimos comentarios
        </span>
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="text-sm font-medium text-neutral-300 transition-colors hover:text-cyan-300"
        >
          Ver historial →
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">

        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-neutral-500">Cargando...</p>
          </div>
        ) : comments.length === 0 ? (
          <EmptyComments />
        ) : (
          <CommentList
            comments={comments}
            onEdit={onEditComment}
            onDelete={(comment) => deleteComment(comment.id)}
          />
        )}

      </div>

      <CommentHistoryDialog
        target={target}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onEditComment={onEditComment}
      />

    </div>

  )

}