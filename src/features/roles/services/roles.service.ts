import type {
  Permission,
  Role,
} from "../types/role.types"

import type {
  RoleForm,
} from "../types/role-form.types"

import {
  api,
} from "@/lib/api"

export const rolesService={

  async findAll(signal?:AbortSignal):Promise<Role[]>{

    const response=
      await api.get<Role[]>(
        "/roles",
        { signal },
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

  // Catálogo completo de permisos existentes en el sistema — para
  // poder mostrar TODOS como checkbox, marcados o no según lo que
  // ya tenga el rol.
  async getPermissionCatalog(signal?:AbortSignal):Promise<Permission[]>{

    const response=
      await api.get<Permission[]>(
        "/permissions",
        { signal },
      )

    return response.data

  },

  // Permisos actuales de UN rol puntual.
  async getRolePermissions(
    roleId:string,
    signal?:AbortSignal,
  ):Promise<Permission[]>{

    const response=
      await api.get<Permission[]>(
        `/roles/${roleId}/permissions`,
        { signal },
      )

    return response.data

  },

  // Reemplaza el set completo de permisos del rol — el backend
  // borra y recrea en una transacción, así que esto siempre manda
  // la lista COMPLETA deseada, no un diff.
  async updateRolePermissions(
    roleId:string,
    permissionIds:string[],
  ):Promise<Permission[]>{

    const response=
      await api.patch<Permission[]>(
        `/roles/${roleId}/permissions`,
        { permissionIds },
      )

    return response.data

  },

}