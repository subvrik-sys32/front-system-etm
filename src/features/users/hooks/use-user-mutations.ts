"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import type {
  UserForm,
} from "../types/user-form.types"

import {
  usersService,
} from "../services/users.service"

export function useUserMutations(){

  const queryClient=
    useQueryClient()

  const createUser=
    useMutation({

      mutationFn:(
        dto:UserForm,
      )=>

        usersService.create(
          dto,
        ),

      onSuccess:()=>{

        queryClient.invalidateQueries({

          queryKey:[
            "users",
          ],

        })

      },

    })

  const updateUser=
    useMutation({

      mutationFn:({
        id,
        dto,
      }:{
        id:string
        dto:Partial<UserForm>
      })=>

        usersService.update(
          id,
          dto,
        ),

      onSuccess:()=>{

        queryClient.invalidateQueries({

          queryKey:[
            "users",
          ],

        })

      },

    })

  const deleteUser=
    useMutation({

      mutationFn:(
        id:string,
      )=>

        usersService.remove(
          id,
        ),

      onSuccess:()=>{

        queryClient.invalidateQueries({

          queryKey:[
            "users",
          ],

        })

      },

    })

  return{

    createUser,

    updateUser,

    deleteUser,

  }

}