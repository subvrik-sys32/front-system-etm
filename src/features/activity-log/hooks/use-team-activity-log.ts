"use client"

import { useQuery } from "@tanstack/react-query"
import { activityLogService } from "../services/activity-log.service"

export type TeamActivityLogFilters = {
  userId?: string
  from?: string
  to?: string
}

export function useTeamActivityLog(filters: TeamActivityLogFilters) {

  const { data, isLoading } = useQuery({
    queryKey: ["activity-log", "team", filters],
    queryFn: ({ signal }) => activityLogService.getAll(filters, signal),
  })

  return {
    logs: data ?? [],
    loading: isLoading,
  }

}