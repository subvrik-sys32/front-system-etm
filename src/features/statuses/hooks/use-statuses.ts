"use client"

import { useEntityModule } from "@/shared/core/entity/use-entity-module"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { statusesService } from "../services/statuses.service"

export function useStatuses() {

  const { has } = usePermissions()

  const {
    items,
    loading,
    create,
    update,
    remove,
  } = useEntityModule(
    "statuses",
    statusesService,
    undefined,
    { enabled: has(PermissionCode.MASTER_DATA_READ) },
  )

  return {
    statuses: items,
    loading,
    create,
    update,
    remove,
  }
}