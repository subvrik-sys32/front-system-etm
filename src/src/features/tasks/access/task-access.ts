import type { Task } from "../types/task.types"

import type { WorkflowStatus } from "@/features/workflow/types/workflow.types"

import type { EntityIcon } from "@/shared/constants/entity-icons"

import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"

import { WORKFLOW_STATUS_DEFINITIONS } from "@/features/workflow/constants/workflow-status-definitions"

import { getCurrentStep } from "@/features/workflow/selectors/get-current-step"

import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

type StageLabel = {
  label: string
  code?: string
  icon: EntityIcon
  color: string
}

export const taskAccess = {

  isCompleted: (task: Task) =>

    isWorkflowCompleted(
      task.workflowSteps,
    ),

  hasStarted: (task: Task) =>

    task.workflowSteps.some(
      step => step.status !== "QUEUE",
    ),

  isInProgress: (task: Task) =>

    task.workflowSteps.some(
      step =>

        step.status === "PENDING" ||

        step.status === "PROGRESS" ||

        step.status === "PAUSED",
    ),

  status: (task: Task): WorkflowStatus | "QUEUE" => {

    if (taskAccess.isCompleted(task)) {

      return "REVIEWED"

    }

    return (

      getCurrentStep(
        task.workflowSteps,
      )?.status ??

      "QUEUE"

    )

  },

  statusLabel: (task: Task) => {

    return WORKFLOW_STATUS_DEFINITIONS[
      taskAccess.status(task)
    ]

  },

  stageLabel: (task: Task): StageLabel => {

    if (taskAccess.isCompleted(task)) {

      return {

        label: "Finalizada",

        icon: "check",

        color:"#22C55E",

      }

    }

    const step =

      getCurrentStep(
        task.workflowSteps,
      )

    if (!step) {

      return {

        label: "Sin etapa",

        icon: "circle",

        color:"#64748B",

      }

    }

    const definition =

      PROCESS_DEFINITIONS[
        step.processCode
      ]

    return {

      label: definition.label,

      code: definition.code,

      icon: definition.icon,

      color: definition.color,

    }

  },

}