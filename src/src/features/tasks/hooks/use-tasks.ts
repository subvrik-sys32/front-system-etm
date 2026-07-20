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
  Task,
} from "../types/task.types"

import type {
  CreateTaskDto,
  UpdateTaskDto,
} from "../types/task.dto"

import {
  taskService,
} from "../services/task.service"

export function useTasks(){

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

    Task,

    CreateTaskDto,

    UpdateTaskDto

  >(

    "tasks",

    taskService,

    {

      onCreate:
        addEntity,

      onUpdate:
        replaceEntity,

      onRemove:
        removeEntity,

    },

  )

  const reorderTasks=async(
    tasks:Task[],
  )=>{

    const reordered=

      tasks.map(
        (
          task,
          index,
        )=>({

          ...task,

          position:index+1,

        }),
      )

    queryClient.setQueryData<Task[]>(

      ["tasks"],

      reordered,

    )

    await taskService.reorder(

      reordered.map(
        task=>({

          id:task.id,

          position:task.position,

        }),
      ),

    )

  }

  return{

    tasks:
      items,

    loading,

    refreshing,

    create,

    update,

    reorderTasks,

    remove,

  }

}