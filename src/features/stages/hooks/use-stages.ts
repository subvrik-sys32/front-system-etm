"use client"

import { useEntityModule } from "@/shared/core/entity/use-entity-module"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { stagesService } from "../services/stages.service"

export function useStages() {

  const { has } = usePermissions()

  const {
    items,
    loading,
    create,
    update,
    remove,
  } = useEntityModule(
    "stages",
    stagesService,
    undefined,
    { enabled: has(PermissionCode.MASTER_DATA_READ) },
  )

  return {
    stages: items,
    loading,
    create,
    update,
    remove,
  }
}