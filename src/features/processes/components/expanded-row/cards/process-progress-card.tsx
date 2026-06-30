"use client"

import { Activity } from "lucide-react"

import { ProcessMiniCard } from "@/shared/ui/mini-card/process-mini-card"
import { WORKFLOW_STATUS_DEFINITIONS } from "@/features/workflow/constants/workflow-status-definitions"

import type { ProcessTask } from "../../../types/process.types"

import { workflowAccess } from "@/features/workflow/access/workflow-access"

type Props = {
  processTask: ProcessTask
}

const STATUS_PROGRESS = {
  QUEUE: 0,
  PENDING: 25,
  PROGRESS: 50,
  PAUSED: 50,
  COMPLETED: 75,
  REVIEWED: 100,
} as const

const PROCESS_NAMES = {
  CT: "Corte",
  PL: "Plegado",
  SD: "Soldadura",
  PT: "Pintura",
  EN: "Ensamble",
  DS: "Despacho",
} as const

export function ProcessProgressCard({
  processTask,
}: Props) {

  const status =
    workflowAccess.status(processTask)

  const workflowStatus =
    WORKFLOW_STATUS_DEFINITIONS[status]

  const progress =
    STATUS_PROGRESS[status]

  const currentIndex =
    processTask.task.workflowSteps.findIndex(
      step => step.id === workflowAccess.stepId(processTask)
    )

  const nextStep =
    processTask.task.workflowSteps[currentIndex + 1]

  const nextProcess =
    nextStep
      ? PROCESS_NAMES[nextStep.processCode]
      : "FIN"

  return (
    <ProcessMiniCard
      label="Progreso"
      icon={Activity}
      color={"#22C55E"}
      rows={[
        {
          label: "Avance",
          value: `${progress}%`,
        },

        {
          label: "Estado",
          value: workflowStatus.label,
        },

        {
          label: "Siguiente",
          value: nextProcess,
        },
      ]}
    />
  )
}