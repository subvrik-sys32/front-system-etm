"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { activityLogService } from "../services/activity-log.service"
import { myActivityLogQueryKey } from "./use-my-activity-log"
import type { ActivityLog, ActivityType, CreateActivityLogDto } from "../types/activity-log.types"

// Misma franja que calcula el backend (getShiftForDate) — se
// duplica acá SOLO para el preview optimista; lo que realmente
// queda guardado es lo que devuelve el servidor.
function getShiftNow(): ActivityLog["shift"] {

  const hour = new Date().getHours()

  if (hour >= 6 && hour < 12) return "MORNING"
  if (hour >= 12 && hour < 18) return "AFTERNOON"

  return "NIGHT"

}

export function useCreateActivityLog(types: ActivityType[]) {

  const queryClient = useQueryClient()

  const mutation = useMutation({

    mutationFn: (dto: CreateActivityLogDto) => activityLogService.create(dto),

    onMutate: async (dto) => {

      await queryClient.cancelQueries({ queryKey: myActivityLogQueryKey })

      const previous = queryClient.getQueryData<ActivityLog[]>(myActivityLogQueryKey) ?? []

      const activityType = types.find(t => t.id === dto.activityTypeId)

      if (activityType) {

        const optimisticLog: ActivityLog = {
          id: `optimistic-${Date.now()}`,
          userId: "",
          activityTypeId: dto.activityTypeId,
          projectId: dto.projectId ?? null,
          taskId: dto.taskId ?? null,
          note: dto.note ?? null,
          shift: getShiftNow(),
          loggedAt: new Date().toISOString(),
          activityType,
          // El preview optimista no tiene los datos completos de
          // proyecto/tarea todavía (solo el id) — aparecen recién
          // cuando el servidor confirma y se invalida la query.
          project: null,
          task: null,
        }

        queryClient.setQueryData<ActivityLog[]>(
          myActivityLogQueryKey,
          [...previous, optimisticLog],
        )

      }

      return { previous }

    },

    onError: (_err, _dto, context) => {
      if (context) {
        queryClient.setQueryData(myActivityLogQueryKey, context.previous)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myActivityLogQueryKey })
    },

  })

  return {
    createLog: mutation.mutateAsync,
    creating: mutation.isPending,
  }

}