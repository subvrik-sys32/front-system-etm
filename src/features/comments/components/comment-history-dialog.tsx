"use client"

import { useEffect, useRef, useState } from "react"
import { MessageSquare, Search, Trash2 } from "lucide-react"
import { Spinner } from "@/shared/ui/spinner/spinner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"
import { preventNestedDialogClose } from "@/shared/ui/dialogs/prevent-nested-dialog-close"

import { useComments } from "../hooks/use-comments"
import { useDeleteComment } from "../hooks/use-delete-comment"
import { commentsService } from "../services/comments.service"
import { CommentComposer } from "./comment-composer"
import { CommentList } from "./comment-list"
import { EmptyComments } from "./empty-comments"
import type { Comment, CommentTarget } from "../types/comment.types"
import { ScrollArea } from "@/components/ui/scroll-area"

type Props = {
  target: CommentTarget
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditComment?: (comment: Comment) => void
  readOnly?: boolean
}

function getTargetId(target: CommentTarget) {
  if (target.scope === "task") return target.taskId
  if (target.scope === "workflowStep") return target.workflowStepId
  return target.projectId
}

export function CommentHistoryDialog({
  target,
  open,
  onOpenChange,
  onEditComment,
  readOnly = false,
}: Props) {
  const [search, setSearch] = useState("")
  const [pendingDelete, setPendingDelete] = useState<Comment | null>(null)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)

  const { comments, loading } = useComments(target, open)
  const { deleteComment } = useDeleteComment(target)

  const targetId = getTargetId(target)

  const markedReadRef = useRef<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (markedReadRef.current === targetId) return
    markedReadRef.current = targetId

    commentsService
      .markCommentsAsRead(target)
      .catch(() => {
        markedReadRef.current = null
      })
  }, [open, target.scope, targetId, target])

  const filteredComments = search.trim()
    ? comments.filter(c =>
        c.message.toLowerCase().includes(search.toLowerCase()) ||
        c.user.name.toLowerCase().includes(search.toLowerCase()),
      )
    : comments

  const handleEdit = (comment: Comment) => {
    if (onEditComment) {
      onEditComment(comment)
      onOpenChange(false)
      return
    }

    setEditingComment(comment)
  }

  const handleConfirmDelete = () => {
    if (!pendingDelete) return

    deleteComment(pendingDelete)
    setPendingDelete(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          size="large"
          className="flex h-[min(40rem,85dvh)] max-h-[85dvh] w-full max-w-180 flex-col gap-0 overflow-hidden rounded-2xl p-0 text-foreground shadow-xs"
          onPointerDownOutside={preventNestedDialogClose}
          onInteractOutside={preventNestedDialogClose}
        >
          {/* Header — mismo peso que CAD AI / FormDialog */}
          <DialogHeader className="shrink-0 border-b border-foreground/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground/5">
                <MessageSquare size={18} strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base font-semibold text-foreground">
                  Mensajes
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Conversación e historial de mensajes
                </DialogDescription>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-foreground/5 px-3 py-2">
              <Search size={15} className="shrink-0 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar en mensajes..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/80"
              />
            </div>
          </DialogHeader>

          {/* Thread — área de burbujas (como iteration-panel CAD) */}
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-3 px-4 py-4">
              {loading ? (
                <div className="flex min-h-48 flex-col items-center justify-center gap-2.5">
                  <Spinner size={18} />
                  <p className="text-sm text-muted-foreground">Cargando...</p>
                </div>
              ) : filteredComments.length === 0 ? (
                <div className="flex min-h-48 flex-col items-center justify-center">
                  <EmptyComments />
                </div>
              ) : (
                <CommentList
                  comments={filteredComments}
                  onEdit={readOnly ? undefined : handleEdit}
                  onDelete={readOnly ? undefined : setPendingDelete}
                  onReply={readOnly ? undefined : setReplyingTo}
                />
              )}
            </div>
          </ScrollArea>

          {/* Composer abajo — contrato chat */}
          <div className="shrink-0 border-t border-foreground/5 bg-card px-3 py-3">
            {readOnly ? (
              <p className="rounded-xl bg-foreground/5 px-3 py-2.5 text-center text-xs text-muted-foreground">
                Esta tarea ya está finalizada — se puede ver el historial, pero no agregar mensajes nuevos.
              </p>
            ) : (
              <CommentComposer
                target={target}
                editingComment={editingComment}
                onCancelEdit={() => setEditingComment(null)}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ActionDialog
        open={!!pendingDelete}
        title="Eliminar mensaje"
        description={
          pendingDelete
            ? `¿Eliminar el mensaje de ${pendingDelete.user.name}? Esta acción no se puede deshacer.`
            : ""
        }
        icon={Trash2}
        confirmLabel="Eliminar"
        variant="danger"
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}