import type { InfiniteData } from "@tanstack/react-query"
import type { Notification, NotificationsPage } from "@/features/notifications/types/notification.types"

import { getQueryClient } from "@/lib/query-client"

import type { RealtimeEvent } from "../types/realtime-event"

export function notificationHandler(
  event: RealtimeEvent,
) {

  const queryClient = getQueryClient()

  switch (event.action) {

    case "CREATED": {

      const notification = event.payload as Notification

      // Antes esto solo subía si la lista completa (["notifications"])
      // ya tenía algo en caché — y esa lista es "enabled:open" (solo
      // se pide una vez que se abrió la campana al menos una vez en
      // esta sesión). En un dispositivo/sesión donde nunca se tocó la
      // campana, el contador se quedaba pegado sin importar cuántas
      // notificaciones nuevas llegaran por tiempo real. El contador
      // ahora es independiente de si esa lista existe o no.
      queryClient.setQueryData<number>(
        ["notifications", "unread-count"],
        current => (current ?? 0) + 1,
      )

      queryClient.setQueryData<InfiniteData<NotificationsPage>>(
        ["notifications"],
        current => {

          if (!current) return current

          const alreadyExists = current.pages.some(page =>
            page.items.some(n => n.id === notification.id),
          )

          if (alreadyExists) return current

          const [firstPage, ...rest] = current.pages

          return {
            ...current,
            pages: [
              { ...firstPage, items: [notification, ...firstPage.items] },
              ...rest,
            ],
          }

        },
      )

      return

    }

    case "BULK_READ": {
      const payload = event.payload as { ids: string[] } | undefined
      if (!payload) return
      const idSet = new Set(payload.ids)
      let readNowCount = 0
      queryClient.setQueryData<InfiniteData<NotificationsPage>>(
        ["notifications"],
        current => {
          if (!current) return current
          return {
            ...current,
            pages: current.pages.map(page => ({
              ...page,
              items: page.items.map(n => {
                if (idSet.has(n.id) && !n.read) {
                  readNowCount += 1
                  return { ...n, read: true }
                }
                return n
              }),
            })),
          }
        },
      )
      if (readNowCount > 0) {
        queryClient.setQueryData<number>(
          ["notifications", "unread-count"],
          current => Math.max(0, (current ?? 0) - readNowCount),
        )
      }
      return
    }

    case "DELETED": {

      const payload = event.payload as { id: string } | undefined

      if (!payload) return

      let wasUnread = false

      queryClient.setQueryData<InfiniteData<NotificationsPage>>(
        ["notifications"],
        current => {

          if (!current) return current

          return {
            ...current,
            pages: current.pages.map(page => ({
              ...page,
              items: page.items.filter(n => {
                if (n.id === payload.id) {
                  wasUnread = !n.read
                  return false
                }
                return true
              }),
            })),
          }

        },
      )

      if (wasUnread) {
        queryClient.setQueryData<number>(
          ["notifications", "unread-count"],
          current => Math.max(0, (current ?? 0) - 1),
        )
      }

      return

    }

    case "DELETED_ALL": {

      queryClient.setQueryData<InfiniteData<NotificationsPage>>(
        ["notifications"],
        current => {

          if (!current) return current

          return {
            ...current,
            pages: current.pages.map(page => ({ ...page, items: [] })),
          }

        },
      )

      queryClient.setQueryData<number>(["notifications", "unread-count"], 0)

      return

    }

  }

}