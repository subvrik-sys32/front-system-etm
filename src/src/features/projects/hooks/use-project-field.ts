"use client"

import {
  useProjects,
} from "./use-projects"

import type {
  Project,
} from "../types/project.types"

import type {
  UpdateProjectDto,
} from "../types/project.dto"

export function useProjectField(){

  const{
    update,
  }=useProjects()

  return async(

    projectId:string,

    dto:UpdateProjectDto,

    optimistic?:Partial<Project>,

  )=>{

    await update({

      id:projectId,

      dto,

      optimistic,

    })

  }

}