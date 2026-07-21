"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import {
  rolesService,
} from "../services/roles.service"

export function useUpdateRolePermissions(roleId:string|null){

  const queryClient=useQueryClient()

  const mutation=
    useMutation({

      mutationFn:(permissionIds:string[])=>
        rolesService.updateRolePermissions(
          roleId as string,
          permissionIds,
        ),

      onSuccess:()=>{

        queryClient.invalidateQueries({
          queryKey:["roles",roleId,"permissions"],
        })

      },

    })

  return{

    updatePermissions:mutation.mutateAsync,

    saving:mutation.isPending,

  }

}