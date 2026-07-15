"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eraser, Loader2, Search, Trash2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"
import { preventNestedDialogClose } from "@/shared/ui/dialogs/prevent-nested-dialog-close"

import { useNotifications } from "../hooks/use-notifications"
import { useMarkNotificationRead } from "../hooks/use-mark-notification-read"
import { useMarkAllNotificationsRead } from "../hooks/use-mark-all-read"
import { useDeleteNotification } from "../hooks/use-delete-notification"
import { useDeleteAllNotifications } from "../hooks/use-delete-all-notifications"
import { NotificationItem } from "./notification-item"
import { resolveNotificationHref } from "../utils/resolve-notification-href"

import type { Notification } from "../types/notification.types"
import { VerticalScroll } from "@/shared/ui/vertical-scroll/vertical-scroll"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationHistoryDialog({ open, onOpenChange }: Props) {

  const [search, setSearch] = useState("")
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Notification | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const router = useRouter()

  const { notifications, loading, loadMore, hasMore, loadingMore } = useNotifications()
  const { markAsRead } = useMarkNotificationRead()
  const { markAllAsRead } = useMarkAllNotificationsRead()
  const { deleteNotification } = useDeleteNotification()
  const { deleteAll } = useDeleteAllNotifications()

  const filteredNotifications = search.trim()
    ? notifications.filter(n =>
        n.messageSnippet.toLowerCase().includes(search.toLowerCase()) ||
        n.actor.name.toLowerCase().includes(search.toLowerCase()) ||
        n.task.project.name.toLowerCase().includes(search.toLowerCase()) ||
        n.task.project.projectCode.toLowerCase().includes(search.toLowerCase()),
      )
    : notifications

  const hasUnread = notifications.some(n => !n.read)
  const hasAny = notifications.length > 0

  const handleSelect = (notification: Notification) => {

  if (notification.route.history) {

    setConfirmingId(notification.id)

    return

  }

    proceedToNotification(notification)

  }

  const proceedToNotification = (
    notification: Notification,
    fromConfirm = false,
  ) => {

    setConfirmingId(null)

    if (!notification.read) {
      markAsRead(notification.id)
    }

    onOpenChange(false)

    router.push(
      resolveNotificationHref(notification, { history: fromConfirm }),
    )

  }

  const handleConfirmDeleteAll = async () => {

    await deleteAll()

    setConfirmDeleteAll(false)

  }

  const handleConfirmDeleteOne = async () => {

    if (!pendingDelete) {
      return
    }

    await deleteNotification(
      pendingDelete,
    )

    setPendingDelete(
      null,
    )

  }

  return (

    <>

      <Dialog open={open} onOpenChange={onOpenChange}>

        <DialogContent
          className="flex h-[70vh] max-w-lg flex-col gap-0 overflow-hidden p-0"
          onPointerDownOutside={preventNestedDialogClose}
          onInteractOutside={preventNestedDialogClose}
        >

          <DialogHeader className="flex-row items-center justify-between border-b border-white/5 px-4 py-3.5 space-y-0">

          <DialogTitle className="text-sm font-semibold text-neutral-200">
              Historial de notificaciones
          </DialogTitle>

          <DialogDescription className="sr-only">
              Historial completo de notificaciones
          </DialogDescription>

          <div className="mr-8 flex items-center gap-1">

            {hasUnread && (
                <button
                type="button"
                onClick={() => markAllAsRead()}
                title="Marcar todas como leídas"
                className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/8 hover:text-cyan-300"
                >
                <Eraser size={14} />
                </button>
            )}

            {hasAny && (
                <button
                type="button"
                onClick={() => setConfirmDeleteAll(true)}
                title="Eliminar todas las notificaciones"
                className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                <Trash2 size={14} />
                </button>
            )}

          </div>

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

          <VerticalScroll
            containerClassName="flex min-h-0 flex-1 flex-col"
            className="min-h-0 flex-1 px-2 py-2"
          >

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
                    isHistorical={notification.route.history}
                    onClick={handleSelect}
                    onMarkRead={markAsRead}
                    onDelete={setPendingDelete}
                    isConfirming={confirmingId === notification.id}
                    onConfirm={n => proceedToNotification(n, true)}
                    onCancelConfirm={() => setConfirmingId(null)}
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

          </VerticalScroll>

        </DialogContent>

      </Dialog>

      <ActionDialog
        open={confirmDeleteAll}
        title="Eliminar todas las notificaciones"
        description="¿Eliminar todas las notificaciones? Esta acción no se puede deshacer."
        icon={Trash2}
        confirmLabel="Eliminar todas"
        variant="danger"
        onClose={() => setConfirmDeleteAll(false)}
        onConfirm={handleConfirmDeleteAll}
      />

      <ActionDialog
        open={!!pendingDelete}
        title="Eliminar notificación"
        description={
          pendingDelete
            ? `¿Eliminar la notificación de ${pendingDelete.actor.name}? Esta acción no se puede deshacer.`
            : ""
        }
        icon={Trash2}
        confirmLabel="Eliminar"
        variant="danger"
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDeleteOne}
      />

    </>

  )

}