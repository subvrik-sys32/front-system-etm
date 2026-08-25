"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import { MessageSquare, Trash2 } from "lucide-react"
import { SearchField } from "@/shared/ui/search-field/search-field"
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
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
import { cn } from "@/shared/utils/utils"

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
  const { isMobile } = useResponsive()
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

  // 🚀 Optimización Senior: useMemo para que el filtrado no congele la UI al escribir en la búsqueda
  const filteredComments = useMemo(() => {
    if (!search.trim()) return comments
    const query = search.toLowerCase()
    return comments.filter(c =>
      c.message.toLowerCase().includes(query) ||
      c.user.name.toLowerCase().includes(query),
    )
  }, [comments, search])

  const threadEndRef = useRef<HTMLDivElement>(null)

  // Chat: anclar al final (mensajes nacen desde el input hacia arriba).
  useEffect(() => {
    if (!open || loading) return
    const id = requestAnimationFrame(() => {
      threadEndRef.current?.scrollIntoView({ block: "end" })
    })
    return () => cancelAnimationFrame(id)
  }, [open, loading, filteredComments.length])

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
          className={cn(
            "flex flex-col gap-0 overflow-hidden p-0 text-foreground shadow-xs bg-popover",
            // Mismo contrato FormDialog: mobile (portrait+landscape) full; desktop card.
            isMobile
              ? "h-full w-full max-w-none rounded-none"
              : "h-[min(40rem,85dvh)] max-h-[85dvh] w-full max-w-180 rounded-2xl",
          )}
          onPointerDownOutside={preventNestedDialogClose}
          onInteractOutside={preventNestedDialogClose}
        >
          {/* Barra fija del chat */}
          <DialogHeader className="z-10 shrink-0 border-b border-border/40 bg-popover px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground shadow-xs">
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
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Buscar en mensajes..."
              className="mt-2"
            />
          </DialogHeader>

          {/* Thread — área de burbujas */}
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex min-h-full flex-col px-4 py-4">
              {loading ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2.5">
                  <Spinner size={18} />
                  <p className="text-sm text-muted-foreground">Cargando...</p>
                </div>
              ) : filteredComments.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center">
                  <EmptyComments />
                </div>
              ) : (
                <div className="mt-auto flex flex-col gap-3">
                  <CommentList
                    comments={filteredComments}
                    onEdit={handleEdit}
                    onDelete={setPendingDelete}
                    onReply={readOnly ? undefined : setReplyingTo}
                  />
                  <div ref={threadEndRef} aria-hidden className="h-px w-full shrink-0" />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Composer abajo */}
          <div className="shrink-0 bg-card px-3 py-3">
            {readOnly && !editingComment ? (
              <p className="rounded-xl bg-foreground/5 px-3 py-2.5 text-center text-xs text-muted-foreground">
                Esta tarea ya está finalizada — se puede ver el historial, pero no agregar mensajes nuevos.
              </p>
            ) : (
              <CommentComposer
                target={target}
                editingComment={editingComment}
                onCancelEdit={() => setEditingComment(null)}
                replyingTo={readOnly ? null : replyingTo}
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