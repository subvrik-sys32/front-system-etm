"use client"

import type { QueryClient } from "@tanstack/react-query"

import type { Task } from "@/features/tasks/types/task.types"
import type { WorkflowStep } from "../types/workflow.types"

import type { WorkflowResponse } from "../services/workflow.services"

function mergeSteps(
  currentSteps: WorkflowStep[],
  updated: Partial<WorkflowStep>[],
): WorkflowStep[] {

  return currentSteps.map(step => {

    const patch = updated.find(u => u.id === step.id)

    return patch
      ? { ...step, ...patch }
      : step

  })

}

export function propagateWorkflowUpdate(
  queryClient: QueryClient,
  response: WorkflowResponse,
) {

  const { taskId, updated } = response

  if (!updated || updated.length === 0) {
    return
  }

  queryClient.setQueryData<Task[]>(

    ["tasks"],

    current => {

      if (!current) return current

      return current.map(task =>

        task.id === taskId

          ? {
              ...task,
              workflowSteps: mergeSteps(
                task.workflowSteps,
                updated,
              ),
            }

          : task,

      )

    },

  )

  const cachedTask = queryClient.getQueryData<Task>(
    ["task", taskId],
  )

  if (cachedTask) {

    queryClient.setQueryData<Task>(

      ["task", taskId],

      {
        ...cachedTask,
        workflowSteps: mergeSteps(
          cachedTask.workflowSteps,
          updated,
        ),
      },

    )

  }

}