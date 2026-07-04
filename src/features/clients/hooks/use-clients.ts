"use client"

import { useEntityModule } from "@/shared/core/entity/use-entity-module"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { clientsService } from "../services/clients.service"

export function useClients() {

  const { has } = usePermissions()

  const {
    items,
    loading,
    create,
    update,
    remove,
  } = useEntityModule(
    "clients",
    clientsService,
    undefined,
    { enabled: has(PermissionCode.MASTER_DATA_READ) },
  )

  return {
    clients: items,
    loading,
    create,
    update,
    remove,
  }
}