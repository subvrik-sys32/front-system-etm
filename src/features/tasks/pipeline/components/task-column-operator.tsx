"use client"

import { Clock, Zap } from "lucide-react"

import { ENTITY_ICONS } from "@/shared/constants/entity-icons"
import { getBadgeColors } from "@/shared/utils/badge-colors"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"

import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

type Props = {
  processCode: ProcessCode
  tasks: Task[]
}

function getActiveOperator(
  tasks: Task[],
  processCode: ProcessCode,
) {

  // Primero buscamos el step en PROGRESS
  for (const task of tasks) {

    const step = task.workflowSteps.find(
      s => s.processCode === processCode && s.status === "PROGRESS",
    )

    if (step?.operator) {
      return { operator: step.operator, status: "PROGRESS" as const }
    }

  }

  // Si no hay ninguno en PROGRESS, buscamos el último con operario asignado
  for (const task of tasks) {

    const step = task.workflowSteps.find(
      s => s.processCode === processCode && s.operator,
    )

    if (step?.operator) {
      return { operator: step.operator, status: step.status }
    }

  }

  return null

}

export function TaskColumnOperator({
  processCode,
  tasks,
}: Props) {

  const definition = PROCESS_DEFINITIONS[processCode]
  const badge = getBadgeColors(definition.color, "subtle")

  const active = getActiveOperator(tasks, processCode)

  if (!active) {

    return (

      <div className="flex h-10 items-center gap-2 px-1">

        <span className="text-xs font-medium text-neutral-600">
          Sin operario asignado
        </span>

      </div>

    )

  }

  const { operator, status } = active

  const isWorking = status === "PROGRESS"

  const OperatorIcon =
    operator.icon
      ? ENTITY_ICONS[operator.icon]
      : null

  const statusColor =
    isWorking ? "#22C55E" : "#64748B"

  const statusLabel =
    isWorking ? "Trabajando" : "En espera"

  const StatusIcon =
    isWorking ? Zap : Clock

  return (

    <div className="flex h-10 items-center justify-between gap-2 px-1">

      {/* Badge del operario */}
      <div
        className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2 py-1"
        style={{
          backgroundColor: `${operator.color ?? "#64748B"}14`,
        }}
      >

        {OperatorIcon ? (

          <OperatorIcon
            size={13}
            style={{ color: operator.color ?? "#64748B" }}
            className="shrink-0"
          />

        ) : (

          <span
            className="flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
            style={{
              backgroundColor: `${operator.color ?? "#64748B"}30`,
              color: operator.color ?? "#64748B",
            }}
          >
            {operator.name.charAt(0).toUpperCase()}
          </span>

        )}

        <span
          className="min-w-0 truncate text-xs font-semibold"
          style={{ color: operator.color ?? "#64748B" }}
        >
          {operator.name}
        </span>

      </div>

      {/* Badge de estado */}
      <div
        className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1"
        style={{
          backgroundColor: `${statusColor}14`,
          color: statusColor,
        }}
      >

        <StatusIcon size={11} className="shrink-0" />

        <span className="text-[10px] font-bold uppercase tracking-wide">
          {statusLabel}
        </span>

      </div>

    </div>

  )

}