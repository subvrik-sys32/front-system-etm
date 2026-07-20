import type {
  Color,
} from "../types/color.types"

import type {
  EntityForm,
} from "@/shared/ui/entity-dialog/entity-dialog.types"

import {
  api,
} from "@/lib/api"

export const colorsService={

  async findAll(signal?:AbortSignal):Promise<Color[]>{

    const response=
      await api.get<Color[]>(
        "/colors",
        { signal },
      )

    return response.data

  },

  async create(
    dto:EntityForm,
  ):Promise<Color>{

    const response=
      await api.post<Color>(
        "/colors",
        dto,
      )

    return response.data

  },

  async update(
    id:string,
    dto:EntityForm,
  ):Promise<Color>{

    const response=
      await api.patch<Color>(
        `/colors/${id}`,
        dto,
      )

    return response.data

  },

  async remove(
    id:string,
  ):Promise<void>{

    await api.delete(
      `/colors/${id}`,
    )

  },

}