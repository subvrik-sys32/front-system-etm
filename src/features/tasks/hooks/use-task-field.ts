"use client"

import {
  useTasks,
} from "./use-tasks"

import type {
  Task,
} from "../types/task.types"

import type {
  UpdateTaskDto,
} from "../types/task.dto"

export function useTaskField(){

  const{
    update,
  }=useTasks()

  return async(

    taskId:string,

    dto:UpdateTaskDto,

    optimistic?:Partial<Task>,

  )=>{

    await update({

      id:taskId,

      dto,

      optimistic,

    })

  }

}