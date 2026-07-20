"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { activityLogService } from "../services/activity-log.service"
import { myActivityLogQueryKey } from "./use-my-activity-log"
import type { ActivityLog } from "../types/activity-log.types"

export function useDeleteActivityLog() {

  const queryClient = useQueryClient()

  const mutation = useMutation({

    mutationFn: (id: string) => activityLogService.remove(id),

    onMutate: async (id) => {

      await queryClient.cancelQueries({ queryKey: myActivityLogQueryKey })

      const previous = queryClient.getQueryData<ActivityLog[]>(myActivityLogQueryKey) ?? []

      queryClient.setQueryData<ActivityLog[]>(
        myActivityLogQueryKey,
        previous.filter((log) => log.id !== id),
      )

      return { previous }

    },

    onError: (_err, _id, context) => {
      if (context) {
        queryClient.setQueryData(myActivityLogQueryKey, context.previous)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myActivityLogQueryKey })
    },

  })

  return {
    deleteLog: mutation.mutateAsync,
    deleting: mutation.isPending,
  }

}