import type {
  Material,
} from "../types/material.types"

import type {
  EntityForm,
} from "@/shared/ui/entity-dialog/entity-dialog.types"

import {
  api,
} from "@/lib/api"

export const materialsService={

  async findAll():Promise<Material[]>{

    const response=
      await api.get<Material[]>(
        "/materials",
      )

    return response.data

  },

  async create(
    dto:EntityForm,
  ):Promise<Material>{

    const response=
      await api.post<Material>(
        "/materials",
        dto,
      )

    return response.data

  },

  async update(
    id:string,
    dto:EntityForm,
  ):Promise<Material>{

    const response=
      await api.patch<Material>(
        `/materials/${id}`,
        dto,
      )

    return response.data

  },

  async remove(
    id:string,
  ):Promise<void>{

    await api.delete(
      `/materials/${id}`,
    )

  },

}