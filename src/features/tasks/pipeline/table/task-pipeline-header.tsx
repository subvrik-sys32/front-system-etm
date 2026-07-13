// features/tasks/pipeline/task-pipeline-header.tsx
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
        color={"#afafaf"}
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
        color={"#a6c7d4"}
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
        color={"#EF4444"}
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
        color={"#22C55E"}
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