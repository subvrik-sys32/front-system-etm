"use client"

import {
  Check,
  CheckCheck,
  Pencil,
  Reply,
  Trash2,
  User,
  type LucideIcon,
} from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { cn } from "@/shared/utils/utils"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { useResponsive } from "@/shared/responsive/hooks/use-responsive"
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
 * Acción compacta para burbuja (size-6).
 * IconAction de rows es size-7 + shadow — demasiado grande aquí.
 */
function BubbleAction({
  icon: Icon,
  danger,
  isOwner,
  onClick,
  label,
}: {
  icon: LucideIcon
  danger?: boolean
  isOwner: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
        // Reposo unificado (edit = trash). Rojo solo en hover (IconAction rows).
        isOwner
          ? "text-background/70 hover:bg-background/12 hover:text-background"
          : "text-muted-foreground hover:bg-foreground/8 hover:text-foreground",
        danger &&
          "hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400",
      )}
    >
      <Icon size={13} strokeWidth={2.2} />
    </button>
  )
}

/**
 * Chat message:
 * - Avatar chrome (bg-muted, sin ring).
 * - Texto → edit/delete compactos expanden en X.
 * - Responder siempre visible debajo.
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
  const { isMobile } = useResponsive()
  const { user } = comment
  const isPending = Boolean(comment.pending)
  const isDeleting = Boolean(comment.deleting)
  const isOwner = currentUser?.id === user.id
  const canDeleteAny = has(PermissionCode.COMMENT_DELETE_ANY)
  const canEdit = isOwner && !isPending && !isDeleting
  const canDelete = (isOwner || canDeleteAny) && !isPending && !isDeleting
  const canReply = has(PermissionCode.COMMENT_CREATE) && !isPending && !isDeleting
  const showInlineActions = canEdit || canDelete

  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  const { data: readStatus } = useQuery({
    queryKey: ["comment-read-status", comment.id],
    queryFn: () => commentsService.getReadStatus(comment.id),
    enabled: isOwner && !isPending && !isDeleting,
  })

  const trailingActions = showInlineActions ? (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5 overflow-hidden transition-[max-width,opacity,padding] duration-200 ease-out",
        isMobile
          ? "max-w-20 opacity-100 pl-1.5"
          : "max-w-0 opacity-0 group-hover/bubble:max-w-20 group-hover/bubble:opacity-100 group-hover/bubble:pl-1.5",
      )}
    >
      <span
        className={cn(
          "mr-0.5 h-3.5 w-px shrink-0",
          isOwner ? "bg-background/15" : "bg-foreground/10",
        )}
        aria-hidden
      />
      {canEdit && (
        <BubbleAction
          icon={Pencil}
          isOwner={isOwner}
          label="Editar"
          onClick={() => onEdit?.(comment)}
        />
      )}
      {canDelete && (
        <BubbleAction
          icon={Trash2}
          danger
          isOwner={isOwner}
          label="Eliminar"
          onClick={() => onDelete?.(comment)}
        />
      )}
    </div>
  ) : null

  return (
    <div
      className={cn(
        "group animate-comment-in flex w-full items-center gap-2.5",
        isOwner ? "flex-row-reverse" : "flex-row",
        isReply && !isOwner && "pl-6",
        (isPending || isDeleting) && "opacity-60",
      )}
    >
      {/* Avatar chrome — centrado a la burbuja, size-9 (evita pixelado) */}
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-xs",
          isOwner ? "bg-foreground text-background" : "bg-muted text-foreground",
        )}
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="size-full object-cover"
            draggable={false}
          />
        ) : (
          <User className="size-4" strokeWidth={2.2} />
        )}
      </div>

      <div
        className={cn(
          "flex w-fit max-w-[min(85%,22rem)] flex-col gap-1",
          isOwner ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-1.5 px-1",
            isOwner && "flex-row-reverse",
          )}
        >
          {!isOwner && (
            <span className="truncate text-[11px] font-medium tracking-tight text-muted-foreground">
              {user.name}
            </span>
          )}
          {isPending ? (
            <span className="text-[11px] text-muted-foreground">Enviando…</span>
          ) : isDeleting ? (
            <span className="text-[11px] text-destructive">Eliminando…</span>
          ) : (
            <span className="text-[11px] tabular-nums text-muted-foreground/80">
              {formatCommentDate(comment.createdAt)}
            </span>
          )}
          {isOwner && !isPending && !isDeleting && readStatus && (
            <span
              className="inline-flex"
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
                <Check
                  size={12}
                  strokeWidth={2.5}
                  className="text-green-700 dark:text-green-400"
                />
              )}
              {readStatus.status === "READ_ALL" && (
                <CheckCheck size={12} strokeWidth={2.5} className="text-primary" />
              )}
            </span>
          )}
        </div>

        <div
          className={cn(
            "group/bubble flex w-fit max-w-full min-h-9 flex-row items-center rounded-2xl py-2 shadow-xs",
            isOwner
              ? "bg-foreground pl-3 pr-1.5 text-background"
              : "bg-muted/80 pl-3 pr-1.5 text-foreground dark:bg-foreground/[0.06]",
          )}
        >
          <div className="min-w-0 max-w-full py-0.5 text-[13px] leading-relaxed">
            {comment.parent && (
              <div
                className={cn(
                  "mb-1.5 flex items-start gap-1.5 rounded-lg px-2 py-1 text-[11px]",
                  isOwner
                    ? "bg-background/10 text-background/70"
                    : "bg-foreground/5 text-muted-foreground",
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

          {trailingActions}
        </div>

        {/* Responder — siempre visible, tipografía de chat no botón de fila */}
        {canReply && (
          <button
            type="button"
            onClick={() => onReply?.(comment)}
            className="inline-flex items-center gap-1 px-1 text-[11px] font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            <Reply size={12} strokeWidth={2.2} />
            Responder
          </button>
        )}
      </div>

      <CommentImageDialog
        imageUrl={imageDialogOpen ? comment.imageUrl : null}
        onClose={() => setImageDialogOpen(false)}
      />
    </div>
  )
}
