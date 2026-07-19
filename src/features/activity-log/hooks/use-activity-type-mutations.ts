"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { activityLogService } from "../services/activity-log.service"
import type { CreateActivityTypeDto, UpdateActivityTypeDto } from "../types/activity-log.types"

export function useActivityTypeMutations() {

  const queryClient = useQueryClient()

  function invalidateAll() {
    // Invalida las dos variantes de la key (con y sin inactivos) —
    // tanto el picker de la Bitácora como la pantalla de admin
    // dependen de la misma lista.
    queryClient.invalidateQueries({ queryKey: ["activity-types"] })
  }

  const createType = useMutation({
    mutationFn: (dto: CreateActivityTypeDto) => activityLogService.createType(dto),
    onSuccess: invalidateAll,
  })

  const updateType = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateActivityTypeDto }) =>
      activityLogService.updateType(id, dto),
    onSuccess: invalidateAll,
  })

  const removeType = useMutation({
    mutationFn: (id: string) => activityLogService.removeType(id),
    onSuccess: invalidateAll,
  })

  return {
    createType: createType.mutateAsync,
    creating: createType.isPending,
    updateType: updateType.mutateAsync,
    updating: updateType.isPending,
    removeType: removeType.mutateAsync,
    removing: removeType.isPending,
  }

}