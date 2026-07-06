"use client"

import { AtSign, MessageSquare } from "lucide-react"
import { formatNotificationDate } from "../utils/format-notification-date"
import type { Notification } from "../types/notification.types"

type Props = {
  notification: Notification
  onClick: (notification: Notification) => void
}

export function NotificationItem({ notification, onClick }: Props) {

  const { actor } = notification
  const isMention = notification.type === "MENTION"

  const contextLabel = notification.workflowStep
    ? `${notification.task.reference} · ${notification.workflowStep.processCode}`
    : notification.task.reference

  return (

    <button
      type="button"
      onClick={() => onClick(notification)}
      className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
    >

      <div className="relative shrink-0">

        {actor.avatarUrl ? (
          <img src={actor.avatarUrl} alt={actor.name} className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: actor.color }}
          >
            {actor.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-neutral-900 ${isMention ? "bg-red-500" : "bg-neutral-600"}`}>
          {isMention
            ? <AtSign size={9} strokeWidth={3} className="text-white" />
            : <MessageSquare size={9} strokeWidth={3} className="text-white" />}
        </div>

      </div>

      <div className="min-w-0 flex-1">

        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-neutral-200">
            <span className="font-semibold">{actor.name}</span>
            {isMention ? " te mencionó" : " comentó"}
          </span>

          {!notification.read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-400" />
          )}
        </div>

        <p className="mt-0.5 truncate text-xs text-neutral-500">{contextLabel}</p>

        <p className="mt-1 line-clamp-2 text-sm text-neutral-400">{notification.messageSnippet}</p>

        <p className="mt-1 text-[11px] text-neutral-600">{formatNotificationDate(notification.createdAt)}</p>

      </div>

    </button>

  )

}