"use client"

import {
  useQuery,
} from "@tanstack/react-query"

import {
  rolesService,
} from "../services/roles.service"

export function useRolePermissions(roleId:string|null){

  const{
    data,
    isLoading,
  }=
    useQuery({

      queryKey:["roles",roleId,"permissions"],

      queryFn:
        ({signal})=>rolesService.getRolePermissions(roleId as string,signal),

      enabled:!!roleId,

    })

  return{

    permissions:data??[],

    loading:isLoading,

  }

}