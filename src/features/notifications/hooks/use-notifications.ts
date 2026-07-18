"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { notificationsService } from "../services/notifications.service"

const QUERY_KEY = ["notifications"] as const
const PAGE_SIZE = 20

// "enabled" (default true, para no romper otros usos existentes):
// la lista completa paginada (con tarea, proyecto, actor, mensaje —
// bastante más pesada que el simple número de useUnreadCount) solo
// hace falta cuando la UI que la muestra está realmente visible
// (el popover de la campanita abierto, o el diálogo de historial
// abierto) — no en cada carga de página solo porque el componente
// está montado.
export function useNotifications(enabled = true){

  const query = useInfiniteQuery({
    queryKey: QUERY_KEY,
    queryFn: ({ pageParam, signal }) =>
      notificationsService.getAll({ cursor: pageParam, take: PAGE_SIZE }, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  })

  const notifications = query.data?.pages.flatMap(page => page.items) ?? []

  return {
    notifications,
    loading: query.isLoading,
    loadMore: query.fetchNextPage,
    hasMore: !!query.hasNextPage,
    loadingMore: query.isFetchingNextPage,
  }

}

export const notificationsQueryKey = QUERY_KEY