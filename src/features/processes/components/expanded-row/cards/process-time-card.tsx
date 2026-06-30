"use client"

import { Clock3 } from "lucide-react"

import { ProcessMiniCard } from "@/shared/ui/mini-card/process-mini-card"

import type { ProcessTask } from "../../../types/process.types"

import { workflowAccess } from "@/features/workflow/access/workflow-access"

type Props = {
  processTask: ProcessTask
}

function formatDate(value: string | null) {
  if (!value) return "-"

  return new Date(value).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatTime(value: string | null) {
  if (!value) return ""

  return new Date(value).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ProcessTimeCard({
  processTask,
}: Props) {

  return (
    <ProcessMiniCard
      label="Jornada"
      icon={Clock3}
      color={"#0EA5E9"}
      rows={[
        {
          label: "Inicio",
          value: formatTime(workflowAccess.startedAt(processTask)),
          secondary: formatDate(workflowAccess.startedAt(processTask)),
        },
        {
          label: "Fin",
          value: formatTime(workflowAccess.completedAt(processTask)),
          secondary: formatDate(workflowAccess.completedAt(processTask)),
        },
      ]}
    />
  )
}