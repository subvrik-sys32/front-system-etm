"use client"

import {
  useQuery,
} from "@tanstack/react-query"

import {
  rolesService,
} from "../services/roles.service"

export function usePermissionCatalog(){

  const{
    data,
    isLoading,
  }=
    useQuery({

      queryKey:["permissions","catalog"],

      queryFn:
        ({signal})=>rolesService.getPermissionCatalog(signal),

      // El catálogo de permisos disponibles casi no cambia (son
      // los PermissionCode del enum) — no hace falta refrescarlo
      // todo el tiempo.
      staleTime:1000*60*10,

    })

  return{

    permissions:data??[],

    loading:isLoading,

  }

}