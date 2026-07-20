"use client"

import {
  usePermissionStore,
} from "../store/permission-store"

import {
  PermissionCode,
} from "@/shared/core/enums/permission-code.enum"

export function usePermissions(){

  // OJO: antes esto seleccionaba `state.has` (la función), no
  // `state.permissions` (el Set). `has` se define UNA sola vez
  // adentro del store y nunca se reasigna — sigue siendo la MISMA
  // referencia en cada `setPermissions()`. Zustand solo re-renderiza
  // si el valor seleccionado cambia de referencia, así que ningún
  // componente que usaba este hook se enteraba cuando los permisos
  // cambiaban en vivo (ver role-permissions-handler.ts): el sidebar
  // se quedaba mostrando ítems ya sin permiso hasta que algo MÁS
  // forzara un re-render. Seleccionando el Set directamente, cada
  // `setPermissions` crea un Set nuevo → cambia de referencia → el
  // componente sí se re-renderiza.
  const permissions=
    usePermissionStore(
      state=>state.permissions,
    )

  return{

    has:(

      permission:PermissionCode,

    )=>

      permissions.has(
        permission,
      ),

    hasAny:(

      ...codes:PermissionCode[]

    )=>

      codes.some(

        permission=>

          permissions.has(
            permission,
          ),

      ),

    hasAll:(

      ...codes:PermissionCode[]

    )=>

      codes.every(

        permission=>

          permissions.has(
            permission,
          ),

      ),

  }

}