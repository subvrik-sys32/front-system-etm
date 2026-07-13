"use client"
import {
  ENTITY_ICONS,
} from "@/shared/constants/entity-icons"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import type { ProcessCode, Task } from "@/features/tasks/types/task.types"
import { getBadgeColors } from "@/shared/utils/badge-colors"
import { TaskPipelineCard } from "../components/task-pipeline-card"
import { TaskPipelinePlaceholder } from "../components/task-pipeline-placeholder"

type Props = {
  processCode: ProcessCode
  tasks: Task[]
  expandedTaskId: string | null
  onToggleTask: (taskId: string) => void
  onCreateTask?: () => void
}

export function TaskProcessColumn({
  processCode,
  tasks,
  expandedTaskId,
  onToggleTask,
  onCreateTask,
}: Props) {
  const definition = PROCESS_DEFINITIONS[processCode]
  const Icon = ENTITY_ICONS[definition.icon]
  const badge = getBadgeColors(definition.color, "subtle")

  return (
    <div className="flex h-full w-72 shrink-0 flex-col gap-3">
      <div
        className="flex shrink-0 items-center gap-2 border-b-2 pb-2"
        style={{ borderColor: definition.color }}
      >
        <span
          className="flex size-6 items-center justify-center rounded-md text-xs font-bold"
          style={{
            color: badge.text,
            backgroundColor: badge.background,
          }}
        >
          {processCode}
        </span>
        {Icon && (
          <Icon size={15} style={{ color: definition.color }} />
        )}
        <span className="text-sm font-bold uppercase tracking-wide text-neutral-200">
          {definition.label}
        </span>
        <span className="ml-auto text-xs font-semibold text-neutral-500">
          {tasks.length}
        </span>
      </div>

      <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none">
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskPipelineCard
              key={task.id}
              task={task}
              expanded={expandedTaskId === task.id}
              onToggle={() => onToggleTask(task.id)}
            />
          ))}
          {tasks.length === 0 && !onCreateTask && (
            <div className="rounded-lg border border-dashed border-white/10 py-6 text-center text-xs text-neutral-600">
              Sin tareas
            </div>
          )}
        </div>
      </div>

      {onCreateTask && (
        <div className="shrink-0">
          <TaskPipelinePlaceholder
            processCode={processCode}
            tasks={tasks}
          />
        </div>
      )}
    </div>
  )
}