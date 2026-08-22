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

/** Chrome en burbuja owner (fill invertido). Danger usa hover rojo nativo de IconAction. */
function bubbleChromeClass(isOwner: boolean) {
  return isOwner
    ? "bg-background/12 text-background hover:bg-background/20 hover:text-background active:bg-background/25"
    : undefined
}

/**
 * Chat premium:
 * - Avatar con ring (sidebar profile).
 * - Burbuja: texto primero, luego edit/delete expanden en X.
 * - Reply debajo de la burbuja (no inline).
 * - Delete: hover rojo como rows (variant danger de IconAction).
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

  const chrome = bubbleChromeClass(isOwner)

  /** Edit + delete al final del mensaje (eje X). Nunca reply aquí. */
  const trailingActions = showInlineActions ? (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1 overflow-hidden transition-[max-width,opacity,padding] duration-200 ease-out",
        isMobile
          ? "max-w-24 opacity-100 pl-2"
          : "max-w-0 opacity-0 group-hover/bubble:max-w-24 group-hover/bubble:opacity-100 group-hover/bubble:pl-2",
      )}
    >
      <span
        className={cn(
          "mr-0.5 h-4 w-px shrink-0",
          isOwner ? "bg-background/20" : "bg-foreground/10",
        )}
        aria-hidden
      />
      {canEdit && (
        <IconAction
          icon={Pencil}
          className={chrome}
          onClick={() => onEdit?.(comment)}
        />
      )}
      {canDelete && (
        <IconAction
          icon={Trash2}
          variant="danger"
          // danger de IconAction ya pone rojo al hover; en owner
          // reforzamos fondo rojo suave sin anular el color del icono.
          className={cn(
            isOwner &&
              "bg-background/12 text-background hover:bg-red-500/20 hover:text-red-400 active:bg-red-500/25",
          )}
          onClick={() => onDelete?.(comment)}
        />
      )}
    </div>
  ) : null

  return (
    <div
      className={cn(
        "group animate-comment-in flex w-full gap-2.5",
        isOwner ? "flex-row-reverse" : "flex-row",
        isReply && !isOwner && "pl-6",
        (isPending || isDeleting) && "opacity-60",
      )}
    >
      {/* Avatar — ring sidebar-profile, clip limpio */}
      <div className="relative size-8 shrink-0 rounded-full shadow-xs ring-2 ring-background">
        <div
          className={cn(
            "size-full overflow-hidden rounded-full",
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
            <span className="flex size-full items-center justify-center">
              <User className="size-3.5" strokeWidth={2.2} />
            </span>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex min-w-0 max-w-[min(85%,22rem)] flex-col gap-1",
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

        {/* Burbuja: contenido → luego actions (siempre LTR dentro) */}
        <div
          className={cn(
            "group/bubble flex min-w-0 flex-row items-center rounded-2xl py-2 shadow-xs",
            isOwner
              ? "bg-foreground pl-3.5 pr-2 text-background"
              : "bg-muted/80 pl-3.5 pr-2 text-foreground dark:bg-foreground/[0.06]",
          )}
        >
          <div className="min-w-0 flex-1 py-0.5 text-[13px] leading-relaxed">
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

        {/* Reply debajo de la burbuja */}
        {canReply && (
          <button
            type="button"
            onClick={() => onReply?.(comment)}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors",
              "hover:bg-foreground/5 hover:text-foreground",
              isMobile
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100",
            )}
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
