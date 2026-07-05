"use client"

import { useEntityModule } from "@/shared/core/entity/use-entity-module"
import { statusesService } from "../services/statuses.service"

export function useStatuses() {
  const {
    items,
    loading,
    create,
    update,
    remove,
  } = useEntityModule("statuses", statusesService)

  return {
    statuses: items,
    loading,
    create,
    update,
    remove,
  }
}