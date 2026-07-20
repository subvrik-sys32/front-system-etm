"use client"

import {
  useQuery,
} from "@tanstack/react-query"

import type {
  Role,
} from "../types/role.types"

import {
  rolesService,
} from "../services/roles.service"

export function useRoles(){

  const{

    data,

    isLoading,

    isFetching,

    error,

  }=
    useQuery<Role[]>({

      queryKey:[
        "roles",
      ],

      queryFn:
        ({signal})=>rolesService.findAll(signal),

    })

  return{

    roles:
      data??[],

    loading:
      isLoading,

    refreshing:
      isFetching,

    error,

  }

}