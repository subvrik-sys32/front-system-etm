"use client"

import { AtSign, MessageSquare, X } from "lucide-react"

import type { Notification } from "../types/notification.types"
import {
  getNotificationActionLabel,
  isMentionNotification,
} from "../utils/notification-action-label"

type Props = {
  notification: Notification
  onNavigate: () => void
  onDismiss?: () => void
}

export function NotificationToast({
  notification,
  onNavigate,
  onDismiss,
}: Props) {
  const { actor, task, project } = notification

  const isMention = isMentionNotification(notification.type)
  const actionLabel = getNotificationActionLabel(notification.type)

  const contextLabel = task
    ? `${task.project.projectCode} · ${task.project.name}`
    : project
      ? `${project.projectCode} · ${project.name}`
      : ""

  return (
    <div className="relative w-[min(100vw-2rem,22rem)] rounded-xl border border-border bg-card text-left text-foreground shadow-toast overflow-hidden">
      {/* Botón de cierre único */}
      {onDismiss && (
        <button
          type="button"
          aria-label="Cerrar notificación"
          onClick={e => {
            e.stopPropagation()
            onDismiss()
          }}
          className="absolute right-2.5 top-2.5 z-20 flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X size={13} strokeWidth={2} />
        </button>
      )}

      {/* Disposición en Grid centrada verticalmente */}
      <button
        type="button"
        onClick={onNavigate}
        className="grid w-full grid-cols-[auto_1fr] items-center gap-3 p-3.5 pr-8 text-left outline-none cursor-pointer"
      >
        {/* Avatar / Indicador de tipo */}
        <div className="relative shrink-0">
          <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border">
            {actor.avatarUrl ? (
              <img
                src={actor.avatarUrl}
                alt={actor.name}
                className="size-full object-cover"
              />
            ) : (
              actor.name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-card ring-1 ring-border">
            {isMention ? (
              <AtSign size={9} strokeWidth={3} className="text-primary" />
            ) : (
              <MessageSquare
                size={9}
                strokeWidth={3}
                className="text-muted-foreground"
              />
            )}
          </span>
        </div>

        {/* Información textual */}
        <div className="min-w-0 space-y-0.5">
          <p className="truncate text-xs leading-4">
            <span className="font-semibold text-foreground">
              {actor.name}
            </span>
            <span className="ml-1 text-muted-foreground">{actionLabel}</span>
          </p>

          {contextLabel && (
            <p className="truncate text-[11px] font-medium leading-4 text-muted-foreground">
              {contextLabel}
            </p>
          )}

          {notification.messageSnippet && (
            <p className="line-clamp-2 text-xs leading-4 text-foreground/90">
              {notification.messageSnippet}
            </p>
          )}
        </div>
      </button>
    </div>
  )
}