"use client"

import { useQuery } from "@tanstack/react-query"
import { activityLogService } from "../services/activity-log.service"

export const activityTypesQueryKey = (includeInactive: boolean) =>
  ["activity-types", { includeInactive }] as const

export function useActivityTypes(includeInactive = false) {

  const { data, isLoading } = useQuery({
    queryKey: activityTypesQueryKey(includeInactive),
    queryFn: ({ signal }) => activityLogService.getTypes(includeInactive, signal),
    // Es una lista chica que casi no cambia — no hace falta
    // refrescarla todo el tiempo, el que la edite (admin) va a
    // notarlo la próxima vez que alguien la abra igual.
    staleTime: 1000 * 60 * 10,
  })

  return {
    types: data ?? [],
    loading: isLoading,
  }

}