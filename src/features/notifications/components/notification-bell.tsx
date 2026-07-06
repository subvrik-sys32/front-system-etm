"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Bell, Loader2 } from "lucide-react"

import { cn } from "@/shared/utils/utils"

import { useNotifications } from "../hooks/use-notifications"
import { useUnreadCount } from "../hooks/use-unread-count"
import { useMarkNotificationRead } from "../hooks/use-mark-notification-read"
import { useMarkAllNotificationsRead } from "../hooks/use-mark-all-read"
import { NotificationItem } from "./notification-item"
import type { Notification } from "../types/notification.types"

const PANEL_WIDTH = 320
const GAP = 8

function resolveNotificationHref(notification: Notification) {

  // Comentario dentro de un paso de proceso (Corte, Plegado, etc.)
  if (notification.workflowStep) {

    const code = notification.workflowStep.processCode.toLowerCase()

    return `/processes?code=${code}&taskId=${notification.taskId}`

  }

  // Comentario a nivel tarea general
  return `/tasks?taskId=${notification.taskId}`

}

export function NotificationBell() {

  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { notifications, loading, loadMore, hasMore, loadingMore } = useNotifications()
  const { count } = useUnreadCount()
  const { markAsRead } = useMarkNotificationRead()
  const { markAllAsRead } = useMarkAllNotificationsRead()

  useLayoutEffect(() => {

    if (!open || !triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()

    const left = Math.min(
      rect.right + GAP,
      window.innerWidth - PANEL_WIDTH - GAP,
    )

    const top = Math.min(
      rect.top,
      window.innerHeight - 420,
    )

    setCoords({ top: Math.max(top, GAP), left: Math.max(left, GAP) })

  }, [open])

  useEffect(() => {

    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {

      const target = e.target as Node

      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return
      }

      setOpen(false)

    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)

  }, [open])

  const handleSelect = (notification: Notification) => {

    if (!notification.read) {
      markAsRead(notification.id)
    }

    setOpen(false)

    router.push(resolveNotificationHref(notification))

  }

  return (

    <>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className={cn(
          "mx-1 flex h-8 w-[calc(100%-8px)] items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
          open
            ? "bg-white/6 text-white"
            : "text-neutral-400 hover:bg-white/4 hover:text-white",
        )}
      >

        <Bell size={14} />

        <span>Notificaciones</span>

        {count > 0 && (
          <span
            className={cn(
              "ml-auto flex h-6 w-8 items-center justify-center rounded-lg text-xs font-semibold text-white",
              "bg-cyan-500 animate-pulse",
            )}
          >
            {count > 9 ? "9+" : count}
          </span>
        )}

      </button>

      {open && createPortal(

        <div
          ref={panelRef}
          style={{ top: coords.top, left: coords.left, width: PANEL_WIDTH }}
          className="fixed z-[100] animate-comment-in overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl"
        >

          <div className="flex items-center justify-between border-b border-white/5 px-3.5 py-3">
            <span className="text-sm font-semibold text-neutral-200">Notificaciones</span>

            {count > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-neutral-500">Cargando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 py-8 text-center">
                <Bell size={20} className="text-neutral-700" />
                <p className="text-sm text-neutral-500">No tenés notificaciones</p>
              </div>
            ) : (
              <>

                {notifications.map(notification => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleSelect}
                  />
                ))}

                {hasMore && (
                  <button
                    type="button"
                    onClick={() => loadMore()}
                    disabled={loadingMore}
                    className="flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-200 disabled:opacity-50"
                  >
                    {loadingMore
                      ? <Loader2 size={12} className="animate-spin" />
                      : "Cargar más"}
                  </button>
                )}

              </>
            )}

          </div>

        </div>,

        document.body,

      )}

    </>

  )

}