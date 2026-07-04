"use client"

import {
  useQuery,
} from "@tanstack/react-query"

import type {
  User,
} from "../types/user.types"

import {
  usersService,
} from "../services/users.service"

export function useUsersDirectory() {

  const {

    data,

    isLoading,

    isFetching,

    error,

  } = useQuery<User[]>({

    queryKey: [
      "users",
      "directory",
    ],

    queryFn:
      usersService.directory,

  })

  return {

    users:
      data ?? [],

    loading:
      isLoading,

    refreshing:
      isFetching,

    error,

  }

}