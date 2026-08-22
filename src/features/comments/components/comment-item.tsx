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

/** Acción textual compacta bajo la burbuja (misma fila que Responder). */
function FooterAction({
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
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "inline-flex items-center gap-1 px-1 text-[11px] font-medium transition-colors",
        danger
          ? "text-muted-foreground/70 hover:text-red-500 dark:hover:text-red-400"
          : "text-muted-foreground/70 hover:text-foreground",
      )}
    >
      <Icon size={12} strokeWidth={2.2} />
      {label}
    </button>
  )
}

/**
 * Avatar = mismo contrato que sidebar-profile:
 * overflow-hidden + rounded-full + gradient + shadow-inner
 * (evita “sierra” de shadow-xs en el círculo externo).
 */
function CommentAvatar({
  name,
  avatarUrl,
  isOwner,
}: {
  name: string
  avatarUrl?: string | null
  isOwner: boolean
}) {
  return (
    <div
      className={cn(
        "relative size-9 shrink-0 overflow-hidden rounded-full",
        isOwner ? "bg-foreground text-background" : "bg-muted text-foreground",
      )}
    >
      <div
        className={cn(
          "flex size-full items-center justify-center overflow-hidden rounded-full",
          "bg-linear-to-br from-white/10 to-foreground/5 shadow-inner",
        )}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            className="size-full rounded-full object-cover"
            draggable={false}
          />
        ) : (
          <User className="size-4" strokeWidth={2.2} />
        )}
      </div>
    </div>
  )
}

/**
 * Chat: burbuja = solo contenido (paridad CAD AI).
 * Acciones (Responder / Editar / Eliminar) en footer bajo la burbuja.
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
  const showFooter = canReply || canEdit || canDelete

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
      <CommentAvatar
        name={user.name}
        avatarUrl={user.avatarUrl}
        isOwner={isOwner}
      />

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

        {/* Burbuja: solo contenido — padding simétrico, texto centrado si es corto */}
        <div
          className={cn(
            "w-fit max-w-full min-h-9 rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed shadow-xs",
            isOwner
              ? "bg-foreground text-background"
              : "bg-muted/80 text-foreground dark:bg-foreground/[0.06]",
            !comment.parent && !comment.imageUrl && "text-center",
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

        {/* Footer: Responder + Editar + Eliminar — fuera de la burbuja */}
        {showFooter && (
          <div
            className={cn(
              "flex flex-wrap items-center gap-x-1 gap-y-0.5 px-0.5",
              isOwner && "flex-row-reverse",
            )}
          >
            {canReply && (
              <FooterAction
                icon={Reply}
                label="Responder"
                onClick={() => onReply?.(comment)}
              />
            )}
            {canEdit && (
              <FooterAction
                icon={Pencil}
                label="Editar"
                onClick={() => onEdit?.(comment)}
              />
            )}
            {canDelete && (
              <FooterAction
                icon={Trash2}
                label="Eliminar"
                danger
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
