import type {
  Priority,
} from "../types/priority.types"

import type {
  EntityForm,
} from "@/shared/ui/entity-dialog/entity-dialog.types"

import {
  api,
} from "@/lib/api"

export const prioritiesService={

  async findAll(signal?:AbortSignal):Promise<Priority[]>{

    const response=
      await api.get<Priority[]>(
        "/priorities",
        { signal },
      )

    return response.data

  },

  async create(
    dto:EntityForm,
  ):Promise<Priority>{

    const response=
      await api.post<Priority>(
        "/priorities",
        dto,
      )

    return response.data

  },

  async update(
    id:string,
    dto:EntityForm,
  ):Promise<Priority>{

    const response=
      await api.patch<Priority>(
        `/priorities/${id}`,
        dto,
      )

    return response.data

  },

  async remove(
    id:string,
  ):Promise<void>{

    await api.delete(
      `/priorities/${id}`,
    )

  },

}