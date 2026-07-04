"use client"

import {
  useEntityModule,
} from "@/shared/core/entity/use-entity-module"

import {
  usePermissions,
} from "@/features/permissions/hooks/use-permissions"

import {
  PermissionCode,
} from "@/shared/core/enums/permission-code.enum"

import {
  prioritiesService,
} from "../services/priorities.service"

export function usePriorities() {

  const { has } = usePermissions()

  const {

    items,

    loading,

    create,

    update,

    remove,

  } = useEntityModule(
    "priorities",
    prioritiesService,
    undefined,
    { enabled: has(PermissionCode.MASTER_DATA_READ) },
  )

  return {

    priorities: items,

    loading,

    create,

    update,

    remove,

  }

}