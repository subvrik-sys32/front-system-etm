"use client"

import {
  useEffect,
  useState,
} from "react"

import type {
  ProcessCode,
  Task,
} from "../types/task.types"

export type TaskFormValue={

  projectId:string

  reference:string

  pieces:number

  lotNumber:number

  assemblyCount:number

  paintKg:number

  route:ProcessCode[]

  priorityId:string

  materialId:string

  thicknessId:string

  colorId:string | null

  plRt:string | null

  deliveryDate:string | null

}

const initialForm:TaskFormValue={

  projectId:"",

  reference:"",

  pieces:1,

  lotNumber:1,

  assemblyCount:1,

  paintKg:0,

  route:[],

  priorityId:"",

  materialId:"",

  thicknessId:"",

  colorId:null,

  plRt:null,

  deliveryDate:null,

}

const mapTaskToForm=(task:Task):TaskFormValue=>({

  projectId:task.project.id,
  reference:task.reference,
  pieces:task.pieces,
  lotNumber:task.lotNumber,
  assemblyCount:task.assemblyCount,
  paintKg:task.paintKg,
  route:task.route,
  priorityId:task.priority.id,
  materialId:task.material.id,
  thicknessId:task.thickness.id,
  colorId:task.color?.id ?? null,
  plRt:task.plRt,
  deliveryDate:
    task.deliveryDate
      ? task.deliveryDate.slice(0,10)
      : null,

})

export function useTaskForm(
  task?: Task,
  projectId?: string
) {

  const [
    form,
    setForm,
  ] =
    useState<TaskFormValue>(
      task
        ? mapTaskToForm(task)
        : {
            ...initialForm,
            projectId:
              projectId ?? "",
          }
    )

  useEffect(() => {

    setForm(

      task
        ? mapTaskToForm(task)
        : {
            ...initialForm,
            projectId:
              projectId ?? "",
          }

    )

  }, [
    task,
    projectId,
  ])

  const update = (
    data: Partial<TaskFormValue>
  ) => {

    setForm(
      current => ({

        ...current,

        ...data,

      })
    )

  }

  const reset = () => {

    setForm(
      task
        ? mapTaskToForm(task)
        : initialForm
    )

  }

  const requiresAssembly =
    form.route.includes(
      "EN"
    )

  const requiresPaint =
    form.route.includes(
      "PT"
    )

  const hasRequiredFields =

    Boolean(

      form.projectId &&

      form.reference.trim() &&

      form.lotNumber > 0 &&

      form.route.length > 0 &&

      form.priorityId &&

      form.materialId &&

      form.thicknessId &&

      form.pieces > 0 &&

      form.deliveryDate

    )

  const isAssemblyValid=

    !requiresAssembly ||

    form.assemblyCount > 0

  const isPaintValid =
    !requiresPaint ||
    (
      Boolean(form.colorId) &&
      form.paintKg > 0
    )

  const canSave =

    hasRequiredFields &&

    isAssemblyValid &&

    isPaintValid

  const buildTask = () => {

    const data = { ...form }

    // Si la ruta no cambió respecto a la tarea original,
    // no la incluimos en el DTO — el backend interpreta
    // cualquier `route` en el payload como intento de cambio,
    // y rechaza con 400 si la producción ya inició.
    if (
      task &&
      JSON.stringify(form.route) ===
      JSON.stringify(task.route)
    ) {

      const { route: _route, ...rest } = data

      return rest

    }

    return data

  }

  return {

    form,

    update,

    reset,

    canSave,

    buildTask,

  }

}