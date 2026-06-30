"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"

import { KanbanCardView } from "@/features/tasks/components/kanban-card/kanban-card-view"

import type { Task } from "@/features/tasks/types/task.types"
import type { EntityBase } from "@/shared/types/entity-base.types"

import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { WORKFLOW_STATUS_DEFINITIONS } from "@/features/workflow/constants/workflow-status-definitions"

import { getCurrentStep } from "@/features/workflow/selectors/get-current-step"
import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

type Props = {
  task: Task
}

export function ProjectTaskRow({ task }: Props) {

  const router = useRouter()

  const { stage, status } = useMemo(() => {

    const currentStep = getCurrentStep(task.workflowSteps)

    const stage: EntityBase | undefined =
      isWorkflowCompleted(task.workflowSteps)
        ? {
            id: "finalized",
            name: "Finalizada",
            icon: "check",
            color:"#22C55E",
          }
        : currentStep
          ? {
              id: currentStep.processCode,
              name: PROCESS_DEFINITIONS[currentStep.processCode].label,
              icon: PROCESS_DEFINITIONS[currentStep.processCode].icon,
              color: PROCESS_DEFINITIONS[currentStep.processCode].color,
            }
          : undefined

    const status: EntityBase | undefined =
      isWorkflowCompleted(task.workflowSteps)
        ? {
            id: "finalized",
            name: "Finalizado",
            icon: "check",
            color:"#22C55E",
          }
        : currentStep
          ? {
              id: currentStep.status,
              name: WORKFLOW_STATUS_DEFINITIONS[currentStep.status].label,
              icon: WORKFLOW_STATUS_DEFINITIONS[currentStep.status].icon,
              color: WORKFLOW_STATUS_DEFINITIONS[currentStep.status].color,
            }
          : undefined

    return { stage, status }

  }, [task.workflowSteps])

  const handleOpenTask = () => {
    sessionStorage.setItem(
      "task-origin-project-id",
      task.project.id,
    )

    router.push(`/tasks?taskId=${task.id}`)
  }

  return (
    <div onClick={handleOpenTask} className="cursor-pointer">

      <KanbanCardView

        priorityName={task.priority.name}
        priorityColor={task.priority.color}

        deliveryDate={task.deliveryDate}
        reference={task.reference}
        lotNumber={task.lotNumber}

        materialName={task.material.name}
        thicknessName={task.thickness.name}
        pieces={task.pieces}

        colorName={task.color?.name}

        colorHex={
          task.color?.color
        }

        stageName={stage?.name}
        stageColor={stage?.color}
        stageIcon={stage?.icon}

        statusName={status?.name}
        statusColor={status?.color}
        statusIcon={status?.icon}

        taskNumber={task.taskNumber}

      />

    </div>
  )
}