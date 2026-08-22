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
import { ChatAvatar } from "@/shared/ui/chat"
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

function MetaIcon({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon: LucideIcon
  label: string
  danger?: boolean
  onClick: () => void
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
        "inline-flex size-5 items-center justify-center rounded-md transition-colors",
        danger
          ? "text-muted-foreground/70 hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400"
          : "text-muted-foreground/70 hover:bg-foreground/8 hover:text-foreground",
      )}
    >
      <Icon size={12} strokeWidth={2.2} />
    </button>
  )
}

/**
 * Mensaje de chat — avatar vía ChatAvatar estándar del design system.
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
  const showOwnerActions = canEdit || canDelete

  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  const { data: readStatus } = useQuery({
    queryKey: ["comment-read-status", comment.id],
    queryFn: () => commentsService.getReadStatus(comment.id),
    enabled: isOwner && !isPending && !isDeleting,
  })

  return (
    <div
      className={cn(
        "group animate-comment-in flex w-full items-center gap-2",
        isOwner ? "flex-row-reverse" : "flex-row",
        isReply && !isOwner && "pl-6",
        (isPending || isDeleting) && "opacity-60",
      )}
    >
      <ChatAvatar
        src={user.avatarUrl}
        alt={user.name}
        tone={isOwner ? "inverse" : "muted"}
        fallback={<User className="size-4" strokeWidth={2.2} />}
      />

      <div
        className={cn(
          "flex w-fit max-w-[min(85%,22rem)] flex-col gap-1",
          isOwner ? "items-end" : "items-start",
        )}
      >
        {/* Meta: solo identidad + tiempo + estado */}
        <div className="flex items-center gap-1 px-0.5">
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

        {/* Burbuja + edit/delete en hover (desktop); siempre en móvil */}
        <div className="group/bubble relative">
          <div
            className={cn(
              "w-fit max-w-full min-h-9 rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-xs",
              isOwner
                ? "bg-foreground text-background"
                : "bg-muted/80 text-foreground dark:bg-foreground/[0.06]",
            )}
          >
            {comment.parent && (
              <div
                className={cn(
                  "mb-1.5 flex items-start gap-1.5 rounded-lg px-2 py-1 text-left text-[11px]",
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

          {showOwnerActions && (
            <div
              className={cn(
                "absolute top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 rounded-lg bg-card/95 px-0.5 py-0.5 shadow-xs backdrop-blur-sm",
                isOwner ? "right-full mr-1.5" : "left-full ml-1.5",
                isMobile
                  ? "opacity-100"
                  : "opacity-0 transition-opacity group-hover/bubble:opacity-100",
              )}
            >
              {canEdit && (
                <MetaIcon
                  icon={Pencil}
                  label="Editar"
                  onClick={() => onEdit?.(comment)}
                />
              )}
              {canDelete && (
                <MetaIcon
                  icon={Trash2}
                  label="Eliminar"
                  danger
                  onClick={() => onDelete?.(comment)}
                />
              )}
            </div>
          )}
        </div>

        {/* Responder debajo de la burbuja */}
        {canReply && (
          <button
            type="button"
            onClick={() => onReply?.(comment)}
            className="inline-flex items-center gap-1 px-0.5 text-[11px] font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
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
