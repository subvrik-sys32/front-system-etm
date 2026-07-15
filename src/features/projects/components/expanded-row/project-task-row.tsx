"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { KanbanCardView } from "@/features/tasks/components/kanban-card/kanban-card-view"
import { TaskPipelineCardCompact } from "@/features/tasks/pipeline/components/task-pipeline-card-compact"

import type { Task } from "@/features/tasks/types/task.types"
import type { EntityBase } from "@/shared/types/entity-base.types"
import type { ProcessTask } from "@/features/processes/types/process.types"

import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { WORKFLOW_STATUS_DEFINITIONS } from "@/features/workflow/constants/workflow-status-definitions"

import { getCurrentStep } from "@/features/workflow/selectors/get-current-step"
import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

type Props = {
  task: Task
}

type StageEntity = EntityBase & {
  code?: string
}

export function ProjectTaskRow({ task }: Props) {

  const router = useRouter()

  const { isMobile } = useResponsive()

  const { stage, status } = useMemo(() => {

    const currentStep = getCurrentStep(task.workflowSteps)

    const stage: StageEntity | undefined =
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
              code: PROCESS_DEFINITIONS[currentStep.processCode].code,
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

  // Igual que TaskPipelineCardCompact necesita en el pipeline, pero
  // acá no hay un "proceso activo" único (esta lista mezcla tareas
  // de cualquier proceso) — se usa el step actual real de la tarea
  // (o, si ya está finalizada, el último step real del array, que
  // ya viene con status "REVIEWED" en ese caso) en vez de inventar
  // un WorkflowStep sintético.
  const processTask: ProcessTask = useMemo(() => {

    const workflowStep =
      isWorkflowCompleted(task.workflowSteps)
        ? task.workflowSteps[task.workflowSteps.length - 1] ?? null
        : getCurrentStep(task.workflowSteps)

    return {
      task,
      workflowStep,
      paintStep: null,
      inputQuantity: null,
    }

  }, [task])

  const handleOpenTask = () => {
    sessionStorage.setItem(
      "task-origin-project-id",
      task.project.id,
    )

    router.push(`/tasks?taskId=${task.id}`)
  }

  return (
    <div onClick={handleOpenTask} className="cursor-pointer">

      {isMobile ? (

        // Compacta, sin overlay: TaskPipelineCardCompact es puro
        // display (el overlay de iniciar/completar vive en el
        // componente PADRE del pipeline, TaskPipelineCard, que acá
        // no se usa) — mismo componente que el pipeline, sin
        // duplicar su lógica ni su JSX.
        <TaskPipelineCardCompact processTask={processTask} />

      ) : (

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
          stageCode={stage?.code}
          stageColor={stage?.color}
          stageIcon={stage?.icon}

          statusName={status?.name}
          statusColor={status?.color}
          statusIcon={status?.icon}

          taskNumber={task.taskNumber}

        />

      )}

    </div>
  )
}