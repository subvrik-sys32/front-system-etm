import {
  api,
} from "@/lib/api"

import type {
  Task,
} from "../types/task.types"

import type {
  CreateTaskDto,
  UpdateTaskDto,
} from "../types/task.dto"

export const taskService={

  async findAll(signal?:AbortSignal){

    const response=
      await api.get<Task[]>(
        "/tasks",
        { signal },
      )

    return response.data

  },

  async findOne(
    id:string,
  ){

    const response=
      await api.get<Task>(
        `/tasks/${id}`,
      )

    return response.data

  },

  async create(
    dto:CreateTaskDto,
  ){

    const response=
      await api.post<Task>(
        "/tasks",
        dto,
      )

    return response.data

  },

  async update(
    id:string,
    dto:UpdateTaskDto,
  ){

    const response=
      await api.patch<Task>(
        `/tasks/${id}`,
        dto,
      )

    return response.data

  },

  async reorder(
    items:{
      id:string
      position:number
    }[],
  ){

    const response=
      await api.patch<Task[]>(
        "/tasks/reorder",
        { items },
      )

    return response.data

  },

  async remove(
    id:string,
  ){

    await api.delete(
      `/tasks/${id}`,
    )

  },

}