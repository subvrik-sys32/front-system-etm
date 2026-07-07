"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Search } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useNotifications } from "../hooks/use-notifications"
import { useMarkNotificationRead } from "../hooks/use-mark-notification-read"
import { useMarkAllNotificationsRead } from "../hooks/use-mark-all-read"
import { NotificationItem } from "./notification-item"
import type { Notification } from "../types/notification.types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function resolveNotificationHref(notification: Notification) {

  if (notification.workflowStep) {

    const code = notification.workflowStep.processCode.toLowerCase()

    return `/processes?code=${code}&taskId=${notification.taskId}`

  }

  return `/tasks?taskId=${notification.taskId}`

}

export function NotificationHistoryDialog({ open, onOpenChange }: Props) {

  const [search, setSearch] = useState("")
  const router = useRouter()

  const { notifications, loading, loadMore, hasMore, loadingMore } = useNotifications()
  const { markAsRead } = useMarkNotificationRead()
  const { markAllAsRead } = useMarkAllNotificationsRead()

  const filteredNotifications = search.trim()
    ? notifications.filter(n =>
        n.messageSnippet.toLowerCase().includes(search.toLowerCase()) ||
        n.actor.name.toLowerCase().includes(search.toLowerCase()) ||
        n.task.project.name.toLowerCase().includes(search.toLowerCase()) ||
        n.task.project.projectCode.toLowerCase().includes(search.toLowerCase()),
      )
    : notifications

  const hasUnread = notifications.some(n => !n.read)

  const handleSelect = (notification: Notification) => {

    if (!notification.read) {
      markAsRead(notification.id)
    }

    onOpenChange(false)

    router.push(resolveNotificationHref(notification))

  }

  return (

    <Dialog open={open} onOpenChange={onOpenChange}>

      <DialogContent className="flex h-[70vh] max-w-lg flex-col gap-0 overflow-hidden p-0">

        <DialogHeader className="flex-row items-center justify-between border-b border-white/5 px-4 py-3.5 space-y-0">

          <DialogTitle className="text-sm font-semibold text-neutral-200">
            Historial de notificaciones
          </DialogTitle>

          <DialogDescription className="sr-only">
            Historial completo de notificaciones
          </DialogDescription>

          {hasUnread && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="mr-6 text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200"
            >
              Limpiar
            </button>
          )}

        </DialogHeader>

        <div className="border-b border-white/5 px-4 py-2.5">

          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <Search size={15} className="shrink-0 text-neutral-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en notificaciones..."
              className="w-full bg-transparent text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
            />
          </div>

        </div>

        <div className="min-h-0 flex-1 overflow-y-auto erp-scrollbar px-2 py-2">

          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-neutral-500">Cargando...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center">
              <p className="text-sm text-neutral-500">No hay notificaciones</p>
            </div>
          ) : (
            <div className="space-y-1">

              {filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleSelect}
                  onMarkRead={markAsRead}
                />
              ))}

              {hasMore && (
                <button
                  type="button"
                  onClick={() => loadMore()}
                  disabled={loadingMore}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-200 disabled:opacity-50"
                >
                  {loadingMore
                    ? <Loader2 size={12} className="animate-spin" />
                    : "Cargar más"}
                </button>
              )}

            </div>
          )}

        </div>

      </DialogContent>

    </Dialog>

  )

}