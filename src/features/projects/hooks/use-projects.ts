"use client"

import {
  useQueryClient,
} from "@tanstack/react-query"

import {
  useEntityModule,
} from "@/shared/core/entity/use-entity-module"

import {
  addEntity,
} from "@/shared/core/entity/cache/add-entity"

import {
  replaceEntity,
} from "@/shared/core/entity/cache/replace-entity"

import {
  removeEntity,
} from "@/shared/core/entity/cache/remove-entity"

import type {
  Project,
} from "../types/project.types"

import type {
  CreateProjectDto,
  UpdateProjectDto,
} from "../types/project.dto"

import {
  projectService,
} from "../services/project.service"

import {
  propagateProjectUpdate,
} from "../cache/propagate-project-update"

export function useProjects(){

  const queryClient=
    useQueryClient()

  const{

    items,

    loading,

    refreshing,

    create,

    update,

    remove,

  }=useEntityModule<

    Project,

    CreateProjectDto,

    UpdateProjectDto

  >(

    "projects",

    projectService,

    {

      onCreate:
        addEntity,

      onUpdate:
        replaceEntity,

      onRemove:
        removeEntity,

    },

  )

  const updateProject=async(input:{
    id:string
    dto:UpdateProjectDto
    optimistic?:Partial<Project>
  })=>{

    const project=
      await update(input)

    propagateProjectUpdate(
      queryClient,
      project,
    )

    return project

  }

  const reorderProjects=async(
    projects:Project[],
  )=>{

    const reordered=

      projects.map(
        (
          project,
          index,
        )=>({

          ...project,

          position:index+1,

        }),
      )

    queryClient.setQueryData<Project[]>(

      ["projects"],

      reordered,

    )

    await projectService.reorder(

      reordered.map(
        project=>({

          id:project.id,

          position:project.position,

        }),
      ),

    )

  }

  return{

    projects:
      items,

    loading,

    refreshing,

    create,

    update:
      updateProject,

    reorderProjects,

    remove,

  }

}