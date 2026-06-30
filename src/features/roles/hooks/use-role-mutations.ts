"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import type {
  RoleForm,
} from "../types/role-form.types"

import {
  rolesService,
} from "../services/roles.service"

export function useRoleMutations(){

  const queryClient=
    useQueryClient()

  const createRole=
    useMutation({

      mutationFn:(
        dto:Partial<RoleForm>,
      )=>

        rolesService.create(
          dto,
        ),

      onSuccess:()=>{

        queryClient.invalidateQueries({

          queryKey:[
            "roles",
          ],

        })

      },

    })

  const updateRole=
    useMutation({

      mutationFn:({
        id,
        dto,
      }:{
        id:string
        dto:Partial<RoleForm>
      })=>

        rolesService.update(
          id,
          dto,
        ),

      onSuccess:()=>{

        queryClient.invalidateQueries({

          queryKey:[
            "roles",
          ],

        })

      },

    })

  const deleteRole=
    useMutation({

      mutationFn:(
        id:string,
      )=>

        rolesService.remove(
          id,
        ),

      onSuccess:()=>{

        queryClient.invalidateQueries({

          queryKey:[
            "roles",
          ],

        })

      },

    })

  return{

    createRole,

    updateRole,

    deleteRole,

  }

}