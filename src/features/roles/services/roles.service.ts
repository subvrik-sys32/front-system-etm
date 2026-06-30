import type {
  Role,
} from "../types/role.types"

import type {
  RoleForm,
} from "../types/role-form.types"

import {
  api,
} from "@/lib/api"

export const rolesService={

  async findAll():Promise<Role[]>{

    const response=
      await api.get<Role[]>(
        "/roles",
      )

    return response.data

  },

  async create(
    data:Partial<RoleForm>,
  ):Promise<Role>{

    const response=
      await api.post<Role>(
        "/roles",
        data,
      )

    return response.data

  },

  async update(
    id:string,
    data:Partial<RoleForm>,
  ):Promise<Role>{

    const response=
      await api.patch<Role>(
        `/roles/${id}`,
        data,
      )

    return response.data

  },

  async remove(
    id:string,
  ):Promise<void>{

    await api.delete(
      `/roles/${id}`,
    )

  },

}