import type {
  Thickness,
} from "../types/thickness.types"

import type {
  EntityForm,
} from "@/shared/ui/entity-dialog/entity-dialog.types"

import {
  api,
} from "@/lib/api"

export const thicknessesService={

  async findAll():Promise<Thickness[]>{

    const response=
      await api.get<Thickness[]>(
        "/thicknesses",
      )

    return response.data

  },

  async create(
    dto:EntityForm,
  ):Promise<Thickness>{

    const response=
      await api.post<Thickness>(
        "/thicknesses",
        dto,
      )

    return response.data

  },

  async update(
    id:string,
    dto:EntityForm,
  ):Promise<Thickness>{

    const response=
      await api.patch<Thickness>(
        `/thicknesses/${id}`,
        dto,
      )

    return response.data

  },

  async remove(
    id:string,
  ):Promise<void>{

    await api.delete(
      `/thicknesses/${id}`,
    )

  },

}