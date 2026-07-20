"use client"

import { useEntityModule } from "@/shared/core/entity/use-entity-module"
import { stagesService } from "../services/stages.service"

export function useStages() {
  const {
    items,
    loading,
    create,
    update,
    remove,
  } = useEntityModule("stages", stagesService)

  return {
    stages: items,
    loading,
    create,
    update,
    remove,
  }
}