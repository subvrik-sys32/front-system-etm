"use client"

import { Activity } from "lucide-react"

import { ProcessMiniCard } from "@/shared/ui/mini-card/process-mini-card"
import { getProcessProgress } from "@/features/processes/selectors/get-process-progress"

import type { ProcessTask } from "../../../types/process.types"

type Props = {
  processTask: ProcessTask
  size?: "default" | "large"
}

export function ProcessProgressCard({
  processTask,
  size,
}: Props) {

  const { percent, statusLabel, nextProcessLabel } =
    getProcessProgress(processTask)

  return (
    <ProcessMiniCard
      size={size}
      label="Progreso"
      icon={Activity}
      color={"#22C55E"}
      rows={[
        {
          label: "Avance",
          value: `${percent}%`,
        },

        {
          label: "Estado",
          value: statusLabel,
        },

        {
          label: "Siguiente",
          value: nextProcessLabel,
        },
      ]}
    />
  )
}