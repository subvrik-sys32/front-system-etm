import type { InfiniteData } from "@tanstack/react-query"
import type { Notification, NotificationsPage } from "@/features/notifications/types/notification.types"

import { getQueryClient } from "@/lib/query-client"

import type { RealtimeEvent } from "../types/realtime-event"
import { consumePendingSelfDeletion } from "../pending-self-deletions"

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

      // Si el propio usuario ya la borró desde la UI (use-delete-
      // notification.ts), ese hook ya descontó el contador al toque
      // usando el objeto real que tenía en mano, y ya la sacó de la
      // lista. Este evento es apenas el eco que el backend le manda
      // de vuelta al mismo usuario — no hay que tocar nada más.
      if (consumePendingSelfDeletion(payload.id)) {
        return
      }

      // A partir de acá, es un borrado del que nos enteramos por
      // primera vez por SSE (p.ej. alguien eliminó el comentario de
      // origen). Buscamos el estado real ANTES de sacarlo de la
      // caché, porque una vez filtrado ya no lo vamos a poder leer.
      //
      // La lista paginada completa (["notifications"]) solo está en
      // caché si en esta sesión se abrió el popover o el historial
      // (es "enabled:open"); si nunca se abrió, no hay forma de saber
      // acá el estado real de "read". Ante esa falta de certeza
      // asumimos que SÍ estaba sin leer: restar de más en el peor
      // caso es inofensivo (Math.max(0, …) protege, y el próximo
      // refetch real corrige cualquier desvío), mientras que no
      // restar nunca deja contadores fantasma que se acumulan con
      // cada comentario borrado — que es justo el bug reportado.
      let wasUnread = true

      const cachedList = queryClient.getQueryData<InfiniteData<NotificationsPage>>(["notifications"])

      if (cachedList) {

        const cached = cachedList.pages
          .flatMap(page => page.items)
          .find(n => n.id === payload.id)

        // Si estaba en caché, confiamos en su estado real por sobre
        // el default. Si no estaba (nunca se cargó esa página, o ya
        // se había limpiado), nos quedamos con el default = true.
        if (cached) {
          wasUnread = !cached.read
        }

      }

      queryClient.setQueryData<InfiniteData<NotificationsPage>>(
        ["notifications"],
        current => {

          if (!current) return current

          return {
            ...current,
            pages: current.pages.map(page => ({
              ...page,
              items: page.items.filter(n => n.id !== payload.id),
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