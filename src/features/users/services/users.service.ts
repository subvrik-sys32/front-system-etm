import type {
  User,
} from "../types/user.types"

import type {
  UserForm,
} from "../types/user-form.types"

import {
  api,
} from "@/lib/api"

export const usersService = {

  async directory(signal?:AbortSignal): Promise<User[]> {

    const response =
      await api.get<User[]>(
        "/users/directory",
        { signal },
      )

    return response.data

  },

  async findAll(signal?:AbortSignal): Promise<User[]> {

    const response =
      await api.get<User[]>(
        "/users",
        { signal },
      )

    return response.data

  },

  async create(
    data: UserForm,
  ): Promise<User> {

    const response =
      await api.post<User>(
        "/users",
        data,
      )

    return response.data

  },

  async update(
    id: string,
    data: Partial<UserForm>,
  ): Promise<User> {

    const response =
      await api.patch<User>(
        `/users/${id}`,
        data,
      )

    return response.data

  },

  async remove(
    id: string,
  ): Promise<void> {

    await api.delete(
      `/users/${id}`,
    )

  },

}