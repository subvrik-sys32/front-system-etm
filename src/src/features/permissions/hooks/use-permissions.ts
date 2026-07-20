"use client"

import {
  usePermissionStore,
} from "../store/permission-store"

import {
  PermissionCode,
} from "@/shared/core/enums/permission-code.enum"

export function usePermissions(){

  const hasPermission=
    usePermissionStore(
      state=>state.has,
    )

  return{

    has:(

      permission:PermissionCode,

    )=>

      hasPermission(
        permission,
      ),

    hasAny:(

      ...permissions:PermissionCode[]

    )=>

      permissions.some(

        permission=>

          hasPermission(
            permission,
          ),

      ),

    hasAll:(

      ...permissions:PermissionCode[]

    )=>

      permissions.every(

        permission=>

          hasPermission(
            permission,
          ),

      ),

  }

}