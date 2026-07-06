"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { notificationsService } from "../services/notifications.service"

const QUERY_KEY = ["notifications"] as const
const PAGE_SIZE = 20

export function useNotifications(){

  const query = useInfiniteQuery({
    queryKey: QUERY_KEY,
    queryFn: ({ pageParam }) =>
      notificationsService.getAll({ cursor: pageParam, take: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: 60_000, // fallback, ya no es la vía principal (llega por SSE)
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