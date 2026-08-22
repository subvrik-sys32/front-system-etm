"use client"

import {
  Check,
  CheckCheck,
  Pencil,
  Reply,
  Trash2,
  User,
} from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { cn } from "@/shared/utils/utils"
import { IconAction } from "@/shared/ui/actions/icon-action"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { formatCommentDate } from "../utils/format-comment-date"
import { commentsService } from "../services/comments.service"
import { CommentImageDialog } from "./comment-image-dialog"
import type { Comment } from "../types/comment.types"

type Props = {
  comment: Comment
  onEdit?: (comment: Comment) => void
  onDelete?: (comment: Comment) => void
  onReply?: (comment: Comment) => void
  isReply?: boolean
}

/**
 * Burbuja de mensaje — mismo contrato visual que CAD AI (iteration-panel):
 * avatar size-7 + burbuja max-w-[85%], propios a la derecha.
 * Acciones: chrome de fila (IconAction), fuera de la burbuja, no botones oscuros encima del fill.
 */
export function CommentItem({
  comment,
  onEdit,
  onDelete,
  onReply,
  isReply,
}: Props) {
  const currentUser = useAuthStore(s => s.user)
  const { has } = usePermissions()
  const { user } = comment
  const isPending = Boolean(comment.pending)
  const isDeleting = Boolean(comment.deleting)
  const isOwner = currentUser?.id === user.id
  const canDeleteAny = has(PermissionCode.COMMENT_DELETE_ANY)
  const canEdit = isOwner && !isPending && !isDeleting
  const canDelete = (isOwner || canDeleteAny) && !isPending && !isDeleting
  const canReply = has(PermissionCode.COMMENT_CREATE) && !isPending && !isDeleting

  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  const { data: readStatus } = useQuery({
    queryKey: ["comment-read-status", comment.id],
    queryFn: () => commentsService.getReadStatus(comment.id),
    enabled: isOwner && !isPending && !isDeleting,
  })

  const showActions = canEdit || canDelete || canReply

  return (
    <div
      className={cn(
        "group animate-comment-in flex w-full gap-2.5",
        isOwner ? "flex-row-reverse" : "flex-row",
        isReply && !isOwner && "pl-6",
        (isPending || isDeleting) && "opacity-60",
      )}
    >
      {/* Avatar — size-7 como CAD AI */}
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-xs",
          isOwner
            ? "bg-foreground text-background"
            : "bg-foreground/[0.06] text-foreground",
        )}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="size-full object-cover"
          />
        ) : (
          <User className="size-3.5" strokeWidth={2.2} />
        )}
      </div>

      <div
        className={cn(
          "flex min-w-0 max-w-[85%] flex-col gap-1",
          isOwner ? "items-end" : "items-start",
        )}
      >
        {/* Meta fuera de la burbuja (CAD no mete acciones en el fill) */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-0.5",
            isOwner && "flex-row-reverse",
          )}
        >
          {!isOwner && (
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              {user.name}
            </span>
          )}
          {isPending ? (
            <span className="text-[11px] text-muted-foreground">Enviando…</span>
          ) : isDeleting ? (
            <span className="text-[11px] text-destructive">Eliminando…</span>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              {formatCommentDate(comment.createdAt)}
            </span>
          )}
          {isOwner && !isPending && !isDeleting && readStatus && (
            <span
              title={
                readStatus.status === "SENT"
                  ? "Enviado"
                  : readStatus.status === "READ_PARTIAL"
                    ? `Visto por ${readStatus.readCount}/${readStatus.total}`
                    : "Visto por todos"
              }
            >
              {readStatus.status === "SENT" && (
                <Check size={12} strokeWidth={2.5} className="text-muted-foreground" />
              )}
              {readStatus.status === "READ_PARTIAL" && (
                <Check size={12} strokeWidth={2.5} className="text-green-700 dark:text-green-400" />
              )}
              {readStatus.status === "READ_ALL" && (
                <CheckCheck size={12} strokeWidth={2.5} className="text-primary" />
              )}
            </span>
          )}
        </div>

        {/* Burbuja — solo contenido */}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-xs",
            isOwner
              ? "bg-foreground text-background"
              : "bg-foreground/[0.05] text-foreground",
          )}
        >
          {comment.parent && (
            <div
              className={cn(
                "mb-1.5 flex items-start gap-1.5 rounded-lg px-2 py-1 text-[11px]",
                isOwner ? "bg-background/10 text-background/70" : "bg-foreground/5 text-muted-foreground",
              )}
            >
              <Reply size={11} className="mt-0.5 shrink-0 -scale-x-100" />
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">
                {comment.parent.deletedAt
                  ? "Comentario eliminado"
                  : `${comment.parent.user.name}: ${comment.parent.message || "Foto"}`}
              </span>
            </div>
          )}

          {comment.message ? (
            <p className="whitespace-pre-wrap break-words">{comment.message}</p>
          ) : null}

          {comment.imageUrl ? (
            <button
              type="button"
              onClick={() => setImageDialogOpen(true)}
              disabled={isDeleting}
              className="mt-2 block max-w-[min(100%,16rem)] overflow-hidden rounded-xl text-left disabled:opacity-60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={comment.imageUrl}
                alt="Foto adjunta"
                className="aspect-[4/5] max-h-64 w-full object-cover"
              />
            </button>
          ) : null}
        </div>

        {/* Acciones chrome de fila — fuera de la burbuja */}
        {showActions && (
          <div
            className={cn(
              "flex items-center gap-0.5 opacity-100 transition-opacity tablet:opacity-0 tablet:group-hover:opacity-100",
              isOwner && "flex-row-reverse",
            )}
          >
            {canReply && (
              <IconAction icon={Reply} onClick={() => onReply?.(comment)} />
            )}
            {canEdit && (
              <IconAction icon={Pencil} onClick={() => onEdit?.(comment)} />
            )}
            {canDelete && (
              <IconAction
                icon={Trash2}
                variant="danger"
                onClick={() => onDelete?.(comment)}
              />
            )}
          </div>
        )}
      </div>

      <CommentImageDialog
        imageUrl={imageDialogOpen ? comment.imageUrl : null}
        onClose={() => setImageDialogOpen(false)}
      />
    </div>
  )
}
