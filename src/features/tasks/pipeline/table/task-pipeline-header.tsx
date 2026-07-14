"use client"

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Puzzle,
} from "lucide-react"

import type { Task } from "@/features/tasks/types/task.types"

import { ProcessMiniCard } from "@/shared/ui/mini-card/process-mini-card"

import { getPipelineKpis } from "../utils/get-pipeline-kpis"
import { PIPELINE_KPI_COLORS } from "../utils/process-columns"

type Props = {
  tasks: Task[]
}

export function TaskPipelineHeader({
  tasks,
}: Props) {

  const kpis = getPipelineKpis(tasks)

  return (

    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

      <ProcessMiniCard
        label="Tareas"
        icon={ClipboardList}
        color={PIPELINE_KPI_COLORS.tasks}
        rows={[
          {
            label: "Total",
            value: kpis.totalTasks,
          },
          {
            label: "En proceso",
            value: kpis.inProgressCount,
          },
        ]}
      />

      <ProcessMiniCard
        label="Piezas"
        icon={Puzzle}
        color={PIPELINE_KPI_COLORS.pieces}
        rows={[
          {
            label: "Total",
            value: kpis.totalPieces,
          },
          {
            label: "Promedio",
            value: kpis.totalTasks > 0
              ? Math.round(kpis.totalPieces / kpis.totalTasks)
              : 0,
          },
        ]}
      />

      <ProcessMiniCard
        label="Urgentes"
        icon={AlertTriangle}
        color={PIPELINE_KPI_COLORS.urgent}
        rows={[
          {
            label: "Total",
            value: kpis.urgentCount,
          },
          {
            label: "Porcentaje",
            value: kpis.totalTasks > 0
              ? `${Math.round((kpis.urgentCount / kpis.totalTasks) * 100)}%`
              : "0%",
          },
        ]}
      />

      <ProcessMiniCard
        label="Avance"
        icon={CheckCircle2}
        color={PIPELINE_KPI_COLORS.progress}
        rows={[
          {
            label: "Finalizadas",
            value: kpis.completedCount,
          },
          {
            label: "Progreso",
            value: `${kpis.progressPercent}%`,
          },
        ]}
      />

    </div>

  )

}