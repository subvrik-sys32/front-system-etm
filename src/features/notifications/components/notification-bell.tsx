"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Eraser, Bell, History, Loader2 } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { useSidebarStore } from "@/shared/stores/sidebar-store"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { useNotifications } from "../hooks/use-notifications"
import { useUnreadCount } from "../hooks/use-unread-count"
import { useMarkNotificationRead } from "../hooks/use-mark-notification-read"
import { useMarkAllNotificationsRead } from "../hooks/use-mark-all-read"
import { NotificationItem } from "./notification-item"
import { NotificationHistoryDialog } from "./notification-history-dialog"
import { resolveNotificationHref } from "../utils/resolve-notification-href"

import type { Notification } from "../types/notification.types"
import { VerticalScroll } from "@/shared/ui/vertical-scroll/vertical-scroll"

type Props = {
  collapsed?: boolean
}

export function NotificationBell({ collapsed }: Props) {

  const [open, setOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectingId, setSelectingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  const router = useRouter()

  const sidebarMode = useSidebarStore(s => s.mode)

  const {
    notifications,
    loading,
    loadMore,
    hasMore,
    loadingMore,
  } = useNotifications()

  const { count } = useUnreadCount()

  const { markAsRead } = useMarkNotificationRead()

  const { markAllAsRead } = useMarkAllNotificationsRead()

  const visibleNotifications =
    notifications.filter(n => !n.read)

  useEffect(() => {

    if (sidebarMode === "closed") {

      setOpen(false)

    }

  }, [
    sidebarMode,
  ])

  const handleSelect = async (
    notification: Notification,
  ) => {

    if (notification.route.history) {

      setConfirmingId(notification.id)

      return

    }

    await proceedToNotification(notification)

  }

  const proceedToNotification = async (
    notification: Notification,
    fromConfirm = false,
  ) => {

    setSelectingId(notification.id)
    setConfirmingId(null)

    try {

      if (!notification.read) {

        await markAsRead(
          notification.id,
        )

      }

      setOpen(false)

      router.push(
        resolveNotificationHref(notification, { history: fromConfirm }),
      )

    } finally {

      setSelectingId(null)

    }

  }

  const handleOpenHistory = () => {

    setOpen(false)

    setHistoryOpen(true)

  }

  return (

    <>

      <Popover
        open={open}
        onOpenChange={setOpen}
      >

        <PopoverTrigger asChild>

          <button
            type="button"
            title={collapsed ? "Notificaciones" : undefined}
            className={cn(
              "flex h-8 items-center rounded-md text-sm font-medium transition-colors",
              collapsed
                ? "w-8 justify-center px-0"
                : "mx-1 w-[calc(100%-8px)] gap-2 px-3",
              open
                ? "bg-white/6 text-white"
                : "text-neutral-400 hover:bg-white/4 hover:text-white",
            )}
          >

            <span className="relative flex items-center justify-center">

              <Bell size={14} />

              {collapsed && count > 0 && (

                <span className="absolute -right-3 -top-3 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-semibold text-white">

                  {count > 9
                    ? "9+"
                    : count}

                </span>

              )}

            </span>

            {!collapsed && (

              <span>
                Notificaciones
              </span>

            )}

            {!collapsed && count > 0 && (

              <span className="ml-auto flex h-6 w-8 items-center justify-center rounded-lg bg-cyan-500 text-xs font-semibold text-white animate-pulse">

                {count > 9
                  ? "9+"
                  : count}

              </span>

            )}

          </button>

        </PopoverTrigger>

        <PopoverContent
          data-sidebar-popover
          side="right"
          align="start"
          sideOffset={8}
          className="z-90 w-80 border border-white/10 bg-[#101012] p-0"
        >

          <div className="flex items-center justify-between px-3.5 py-3">

            <span className="text-sm font-semibold text-neutral-200">

              Notificaciones

            </span>

            <button
              type="button"
              onClick={() => markAllAsRead()}
              disabled={visibleNotifications.length === 0}
              title="Limpiar notificaciones"
              className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/8 hover:text-cyan-300 disabled:cursor-not-allowed disabled:text-neutral-700 disabled:hover:bg-transparent"
            >

              <Eraser size={14} />

            </button>

          </div>

          <VerticalScroll className="px-2 pb-2" style={{ maxHeight: 384 }}>

            {loading ? (

              <div className="flex items-center justify-center py-8">

                <p className="text-sm text-neutral-500">

                  Cargando...

                </p>

              </div>

            ) : visibleNotifications.length === 0 ? (

              <div className="flex flex-col items-center justify-center gap-1.5 py-8 text-center">

                <Bell
                  size={20}
                  className="text-neutral-700"
                />

                <p className="text-sm text-neutral-500">

                  No tienes notificaciones

                </p>

              </div>

            ) : (

              <div className="space-y-1">

                {visibleNotifications.map(notification => (

                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isHistorical={notification.route.history}
                    onClick={handleSelect}
                    onMarkRead={markAsRead}
                    isSelecting={selectingId === notification.id}
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

          <div className="border-t border-white/5 p-2">

            <button
              type="button"
              onClick={handleOpenHistory}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-200"
            >

              <History size={13} />

              Ver historial

            </button>

          </div>

        </PopoverContent>

      </Popover>

      <NotificationHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />

    </>

  )

}