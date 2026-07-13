"use client"

import {
  ENTITY_ICONS,
} from "@/shared/constants/entity-icons"

import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"

import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

import { TaskPipelineCard } from "../components/task-pipeline-card"

type Props = {
  processCode: ProcessCode
  tasks: Task[]
  expandedTaskId: string | null
  onToggleTask: (taskId: string) => void
}

export function TaskProcessColumn({
  processCode,
  tasks,
  expandedTaskId,
  onToggleTask,
}: Props) {

  const definition =
    PROCESS_DEFINITIONS[processCode]

  const Icon =
    ENTITY_ICONS[definition.icon]

  return (

    <div className="flex w-72 shrink-0 flex-col gap-3">

      <div
        className="flex items-center gap-2 border-b-2 pb-2"
        style={{
          borderColor: definition.color,
        }}
      >

        <span
          className="flex size-6 items-center justify-center rounded-md text-xs font-bold"
          style={{
            color: definition.color,
            backgroundColor: `${definition.color}20`,
          }}
        >

          {processCode}

        </span>

        {Icon && (

          <Icon
            size={15}
            style={{
              color: definition.color,
            }}
          />

        )}

        <span className="text-sm font-bold uppercase tracking-wide text-neutral-200">
          {definition.label}
        </span>

        <span className="ml-auto text-xs font-semibold text-neutral-500">
          {tasks.length}
        </span>

      </div>

      <div className="hide-scrollbar flex max-h-[calc(100vh-320px)] flex-col gap-2 overflow-y-auto overscroll-contain scrollbar-none">

        {tasks.map(
          task => (

            <TaskPipelineCard
              key={task.id}
              task={task}
              expanded={expandedTaskId === task.id}
              onToggle={() =>
                onToggleTask(task.id)
              }
            />

          ),
        )}

        {tasks.length === 0 && (

          <div className="rounded-lg border border-dashed border-white/10 py-6 text-center text-xs text-neutral-600">
            Sin tareas
          </div>

        )}

      </div>

    </div>

  )

}