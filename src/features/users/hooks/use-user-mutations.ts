"use client"

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"

import type { UserForm } from "../types/user-form.types"
import type { User } from "../types/user.types"
import { usersService } from "../services/users.service"
import { propagateUserUpdate } from "../cache/propagate-user-update"

function patchUsersList(list: User[] | undefined, user: User): User[] | undefined {
  if (!list) return list
  const idx = list.findIndex(u => u.id === user.id)
  if (idx < 0) return [...list, user]
  const next = list.slice()
  next[idx] = { ...list[idx], ...user }
  return next
}

export function useUserMutations() {
  const queryClient = useQueryClient()

  const createUser = useMutation({
    mutationFn: (dto: UserForm) => usersService.create(dto),
    onSuccess: (user: User) => {
      queryClient.setQueriesData<User[]>({ queryKey: ["users"] }, list =>
        list ? [...list, user] : [user],
      )
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const updateUser = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string
      dto: Partial<UserForm>
    }) => usersService.update(id, dto),
    onSuccess: (user: User) => {
      // Pinta areas/roles al instante (sin esperar refetch / F5).
      queryClient.setQueriesData<User[]>({ queryKey: ["users"] }, list =>
        patchUsersList(list, user),
      )
      queryClient.invalidateQueries({ queryKey: ["users"] })
      propagateUserUpdate(queryClient, user)
    },
  })

  const deleteUser = useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: (_void, id) => {
      queryClient.setQueriesData<User[]>({ queryKey: ["users"] }, list =>
        list ? list.filter(u => u.id !== id) : list,
      )
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  return {
    createUser,
    updateUser,
    deleteUser,
  }
}
