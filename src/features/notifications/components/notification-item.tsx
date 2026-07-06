"use client"

import { AtSign, MessageSquare } from "lucide-react"
import { formatNotificationDate } from "../utils/format-notification-date"
import { WORKFLOW_STATUS_DEFINITIONS } from "@/features/workflow/constants/workflow-status-definitions"
import { DynamicBadge } from "@/shared/ui/badge/dynamic-badge"
import type { Notification } from "../types/notification.types"

type Props = {
  notification: Notification
  onClick: (notification: Notification) => void
}

export function NotificationItem({ notification, onClick }: Props) {

  const { actor, task, workflowStep } = notification
  const isMention = notification.type === "MENTION"

  const contextLabel = `${task.project.projectCode} | ${task.project.name}`

  const status = workflowStep
    ? WORKFLOW_STATUS_DEFINITIONS[workflowStep.status]
    : undefined

  return (

    <button
      type="button"
      onClick={() => onClick(notification)}
      className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-white/5"
    >

      <div className="relative shrink-0">

        <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-white/10 to-white/5 ring-1 ring-white/8 text-xs font-semibold text-white shadow-inner">

          {actor.avatarUrl ? (
            <img src={actor.avatarUrl} alt={actor.name} className="h-full w-full object-cover" />
          ) : (
            actor.name.charAt(0).toUpperCase()
          )}

        </div>

        <div className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#101012] ${isMention ? "bg-cyan-500" : "bg-neutral-600"}`}>
          {isMention
            ? <AtSign size={9} strokeWidth={3} className="text-white" />
            : <MessageSquare size={9} strokeWidth={3} className="text-white" />}
        </div>

      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-start justify-between gap-2">

          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-neutral-200">
              {actor.name}
            </span>
            <span className="block text-sm text-neutral-400">
              {isMention ? "te mencionó" : "comentó"}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">

            {status && (
              <div className="origin-right scale-[0.8]">
                <DynamicBadge
                  compact
                  label={status.label}
                  color={status.color}
                  icon={status.icon}
                />
              </div>
            )}

            {!notification.read && (
              <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400" />
            )}

          </div>

        </div>

        <p className="mt-1 truncate text-xs text-neutral-500">{contextLabel}</p>

        <p className="mt-1 line-clamp-2 text-sm text-neutral-400">{notification.messageSnippet}</p>

        <p className="mt-1 text-[11px] text-neutral-600">{formatNotificationDate(notification.createdAt)}</p>

      </div>

    </button>

  )

}