"use client"

import { AtSign, MessageSquare, X } from "lucide-react"

import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import { WORKFLOW_STATUS_DEFINITIONS } from "@/features/workflow/constants/workflow-status-definitions"

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
  const { actor, task, project, workflowStep } = notification

  const isMention = isMentionNotification(notification.type)
  const actionLabel = getNotificationActionLabel(notification.type)

  const contextLabel = task
    ? `${task.project.projectCode} · ${task.project.name}`
    : project
      ? `${project.projectCode} · ${project.name}`
      : ""

  const status = workflowStep
    ? WORKFLOW_STATUS_DEFINITIONS[workflowStep.status]
    : undefined

  return (
    <div className="relative flex w-[min(100vw-2rem,22rem)] items-center gap-3 rounded-xl border border-border bg-card p-3.5 pr-9 text-left text-foreground shadow-toast">
      {onDismiss && (
        <button
          type="button"
          aria-label="Cerrar"
          onClick={e => {
            e.stopPropagation()
            onDismiss()
          }}
          className="absolute right-2.5 top-2.5 z-10 flex size-5 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        >
          <X size={13} strokeWidth={2} />
        </button>
      )}

      <button
        type="button"
        onClick={onNavigate}
        className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none cursor-pointer my-auto"
      >
        {/* Avatar centrado verticalmente */}
        <div className="relative shrink-0 my-auto self-center">
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

        {/* Bloque central de texto */}
        <div className="min-w-0 flex-1 my-auto flex flex-col justify-center gap-0.5">
          <div className="flex items-center justify-between gap-1.5 pr-1">
            <p className="min-w-0 truncate text-xs leading-4">
              <span className="font-semibold text-foreground">
                {actor.name}
              </span>
              <span className="ml-1 text-muted-foreground">{actionLabel}</span>
            </p>
          </div>

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

        {/* DynamicBadge centrado verticalmente en el eje secundario */}
        {status && (
          <div className="shrink-0 my-auto self-center origin-right scale-90">
            <DynamicBadge
              compact
              label={status.label}
              color={status.color}
              icon={status.icon}
            />
          </div>
        )}
      </button>
    </div>
  )
}