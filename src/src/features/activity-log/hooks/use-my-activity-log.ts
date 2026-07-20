"use client"

import { useQuery } from "@tanstack/react-query"
import { activityLogService } from "../services/activity-log.service"

export const myActivityLogQueryKey = ["activity-log", "me", "today"] as const

export function useMyActivityLog() {

  const { data, isLoading } = useQuery({
    queryKey: myActivityLogQueryKey,
    queryFn: ({ signal }) => activityLogService.getMyToday(signal),
  })

  return {
    logs: data ?? [],
    loading: isLoading,
  }

}