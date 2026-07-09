"use client"
import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"
import { useComments } from "../hooks/use-comments"
import { useDeleteComment } from "../hooks/use-delete-comment"
import { commentsService } from "../services/comments.service"
import { CommentList } from "./comment-list"
import { EmptyComments } from "./empty-comments"
import { CommentHistoryDialog } from "./comment-history-dialog"
import type {
  Comment,
  CommentTarget,
} from "../types/comment.types"
type Props={
  target:CommentTarget
  onEditComment?:(comment:Comment)=>void
}
export function CommentTimeline({
  target,
  onEditComment,
}:Props){
  const[
    historyOpen,
    setHistoryOpen,
  ]=useState(false)
  const[
    pendingDelete,
    setPendingDelete,
  ]=useState<Comment|null>(null)
  const{
    comments,
    loading,
  }=useComments(target)
  const{
    deleteComment,
  }=useDeleteComment(target)

  const targetId = target.scope === "task" ? target.taskId : target.workflowStepId

  // Los comentarios recientes se ven directamente acá, sin necesidad
  // de abrir "Ver historial". Si ya hay comentarios cargados, se
  // consideran vistos: marcamos como leídas las notificaciones de
  // este target igual que en CommentHistoryDialog.
  useEffect(() => {

    if (loading || comments.length === 0) return

    commentsService
      .markCommentsAsRead(target)
      .catch(() => {
        // no crítico
      })

  }, [loading, comments.length, target.scope, targetId])

  function handleConfirmDelete(){
    if(!pendingDelete){
      return
    }
    deleteComment(
      pendingDelete,
    )
    setPendingDelete(
      null,
    )
  }
  return(
    <>
      <div className="flex h-full min-h-0 flex-col rounded-xl bg-white/2">
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-300">
            Últimos comentarios
          </span>
          <button
            type="button"
            onClick={()=>
              setHistoryOpen(
                true,
              )
            }
            className="text-sm font-medium text-neutral-300 transition-colors hover:text-cyan-300"
          >
            Ver historial →
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          {loading?(
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-neutral-500">
                Cargando...
              </p>
            </div>
          ):comments.length===0?(
            <EmptyComments/>
          ):(
            <CommentList
              comments={comments}
              onEdit={onEditComment}
              onDelete={setPendingDelete}
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
      <ActionDialog
        open={!!pendingDelete}
        title="Eliminar comentario"
        description={
          pendingDelete
            ?`¿Eliminar el comentario de ${pendingDelete.user.name}? Esta acción no se puede deshacer.`
            :""
        }
        icon={Trash2}
        confirmLabel="Eliminar"
        variant="danger"
        onClose={()=>
          setPendingDelete(
            null,
          )
        }
        onConfirm={
          handleConfirmDelete
        }
      />
    </>
  )
}