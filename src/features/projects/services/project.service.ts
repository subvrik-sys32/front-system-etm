import {
  api,
} from "@/lib/api"

import type {
  CreateProjectDto,
  UpdateProjectDto,
} from "../types/project.dto"

export const projectService={

  async findAll(){

    const response=
      await api.get(
        "/projects",
      )

    return response.data

  },

  async findOne(
    id:string,
  ){

    const response=
      await api.get(
        `/projects/${id}`,
      )

    return response.data

  },

  async create(
    dto:CreateProjectDto,
  ){

    const response=
      await api.post(
        "/projects",
        dto,
      )

    return response.data

  },

  async update(
    id:string,
    dto:UpdateProjectDto,
  ){

    const response=
      await api.patch(
        `/projects/${id}`,
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
      await api.patch(
        "/projects/reorder",
        {
          items,
        },
      )

    return response.data

  },

  async remove(
    id:string,
  ){

    await api.delete(
      `/projects/${id}`,
    )

  },

}