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

      queryClient.setQueryData<number>(
        ["notifications", "unread-count"],
        current => (current ?? 0) + 1,
      )

      return

    }

  }

}