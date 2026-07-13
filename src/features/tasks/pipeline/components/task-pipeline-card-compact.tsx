// features/tasks/pipeline/task-pipeline-card-compact.tsx
"use client"

import { taskAccess } from "@/features/tasks/access/task-access"

import type { Task } from "@/features/tasks/types/task.types"

type Props = {
  task: Task
}

export function TaskPipelineCardCompact({
  task,
}: Props) {

  const status =
    taskAccess.statusLabel(task)

  return (

    <div className="flex h-11 items-center gap-2.5 rounded-xl bg-white/2 px-3 transition hover:bg-white/4">

      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{
          backgroundColor: task.priority.color,
        }}
      />

      <span className="shrink-0 text-sm font-semibold text-neutral-100">
        #{String(task.taskNumber).padStart(3, "0")}
      </span>

      <span
        title={task.reference}
        className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-300"
      >

        {task.reference}

      </span>

      <span
        className="shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold"
        style={{
          color: status.color,
          backgroundColor: `${status.color}20`,
        }}
      >

        {status.label}

      </span>

    </div>

  )

}