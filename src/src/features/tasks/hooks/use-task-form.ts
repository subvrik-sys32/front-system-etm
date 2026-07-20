"use client"

import { useEffect, useState } from "react"

import { taskService } from "../services/task.service"
import type { ProcessCode, Task } from "../types/task.types"

export type TaskFormValue = {
  projectId: string
  reference: string
  pieces: number
  lotNumber: number
  assemblyCount: number
  paintKg: number
  route: ProcessCode[]
  priorityId: string
  materialId: string
  thicknessId: string
  colorId: string | null
  plRt: string | null
  deliveryDate: string | null
}

const initialForm: TaskFormValue = {
  projectId: "",
  reference: "",
  pieces: 1,
  lotNumber: 1,
  assemblyCount: 1,
  paintKg: 0,
  route: [],
  priorityId: "",
  materialId: "",
  thicknessId: "",
  colorId: null,
  plRt: null,
  deliveryDate: null,
}

const mapTaskToForm = (task: Task): TaskFormValue => ({
  projectId: task.project.id,
  reference: task.reference,
  pieces: task.pieces,
  lotNumber: task.lotNumber,
  assemblyCount: task.assemblyCount,
  paintKg: task.paintKg,
  route: task.route,
  priorityId: task.priority.id,
  materialId: task.material.id,
  thicknessId: task.thickness.id,
  colorId: task.color?.id ?? null,
  plRt: task.plRt,
  deliveryDate: task.deliveryDate?.slice(0, 10) ?? null,
})

const getInitialForm = (task?: Task, projectId?: string): TaskFormValue =>
  task
    ? mapTaskToForm(task)
    : { ...initialForm, projectId: projectId ?? "" }

export function useTaskForm(task?: Task, projectId?: string) {
  const [form, setForm] = useState<TaskFormValue>(() =>
    getInitialForm(task, projectId),
  )

  useEffect(() => {
    setForm(getInitialForm(task, projectId))
  }, [task, projectId])

  useEffect(() => {
    if (task || !form.projectId) return

    let cancelled = false

    void taskService
      .getNextLot(form.projectId)
      .then(({ nextLot }) => {
        if (!cancelled) {
          setForm(current => ({
            ...current,
            lotNumber: nextLot,
          }))
        }
      })
      .catch(console.error)

    return () => {
      cancelled = true
    }
  }, [task, form.projectId])

  const update = (data: Partial<TaskFormValue>) => {
    setForm(current => ({ ...current, ...data }))
  }

  const reset = () => {
    setForm(getInitialForm(task, projectId))
  }

  const requiresAssembly = form.route.includes("EN")
  const requiresPaint = form.route.includes("PT")

  const canSave =
    Boolean(
      form.projectId &&
        form.reference.trim() &&
        form.lotNumber > 0 &&
        form.route.length &&
        form.priorityId &&
        form.materialId &&
        form.thicknessId &&
        form.pieces > 0 &&
        form.deliveryDate,
    ) &&
    (!requiresAssembly || form.assemblyCount > 0) &&
    (!requiresPaint || (Boolean(form.colorId) && form.paintKg > 0))

  const buildTask = () => {
    const data = { ...form }

    if (task && JSON.stringify(form.route) === JSON.stringify(task.route)) {
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