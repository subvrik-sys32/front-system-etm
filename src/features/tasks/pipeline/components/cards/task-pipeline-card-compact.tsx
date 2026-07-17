"use client"

import { getBadgeColors } from "@/shared/utils/badge-colors"

import { cn } from "@/shared/utils/utils"

import { WORKFLOW_STATUS_DEFINITIONS } from "@/features/workflow/constants/workflow-status-definitions"

import type { ProcessTask } from "@/features/processes/types/process.types"

type Props = {
  processTask: ProcessTask
  // El pipeline (TaskPipelineCard) y Production Hub no tienen
  // ningún botón encima de la card — el badge de estado debe llegar
  // flush hasta el borde derecho (pr-3, igual que pl-3). Solo
  // ProjectTaskRow superpone un botón de chevron "absolute" sobre
  // la card, y ES el único consumidor que necesita este espacio
  // reservado para que el badge no quede tapado por ese botón.
  reserveActionsSpace?: boolean
}

export function TaskPipelineCardCompact({
  processTask,
  reserveActionsSpace = false,
}: Props) {

  const task = processTask.task

  // El status ya viene correcto por step (incluyendo "QUEUE"
  // cuando esta etapa todavía no le llegó el turno a la tarea).
  const stepStatus =
    processTask.workflowStep?.status ?? "QUEUE"

  const status =
    WORKFLOW_STATUS_DEFINITIONS[stepStatus]

  const badge =
    getBadgeColors(status.color, "subtle")

  return (

    <div
      className={cn(
        "flex h-12 items-center gap-2.5 rounded-xl bg-white/2 pl-3 transition hover:bg-white/4",
        reserveActionsSpace ? "pr-12" : "pr-3",
      )}
    >

      <span className="shrink-0 text-sm font-semibold text-neutral-100">
        #{String(task.taskNumber).padStart(3, "0")}
      </span>

      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{
          backgroundColor: task.priority.color,
        }}
      />

      <span
        title={task.reference}
        className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-300"
      >

        {task.reference}

      </span>

      <span
        className="flex h-5 shrink-0 items-center whitespace-nowrap rounded-md px-2 text-xs font-semibold leading-none"
        style={{
          color: badge.text,
          backgroundColor: badge.background,
        }}
      >

        {status.label}

      </span>

    </div>

  )

}