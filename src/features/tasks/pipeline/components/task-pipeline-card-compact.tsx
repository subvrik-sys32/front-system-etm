"use client"

import { taskAccess } from "@/features/tasks/access/task-access"
import { getBadgeColors } from "@/shared/utils/badge-colors"

import type { Task } from "@/features/tasks/types/task.types"

type Props = {
  task: Task
}

export function TaskPipelineCardCompact({
  task,
}: Props) {

  const status =
    taskAccess.statusLabel(task)

  const badge =
    getBadgeColors(status.color, "subtle")

  return (

    <div className="flex h-12 items-center gap-2.5 rounded-xl bg-white/2 px-3 transition hover:bg-white/4">

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