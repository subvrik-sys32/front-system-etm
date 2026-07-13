"use client"

import { ENTITY_ICONS } from "@/shared/constants/entity-icons"
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

    <section className="flex h-full min-h-0 w-72 shrink-0 flex-col overflow-hidden">

      <div className="flex shrink-0 flex-col">

        <header className="flex items-center gap-2 border-b px-3 py-3" style={{ borderColor: definition.color }}>

          <span className="flex size-6 items-center justify-center rounded-md text-xs font-bold" style={{ color: badge.text, backgroundColor: badge.background }}>
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

        </header>

        {onCreateTask && (

          <div className="border-b border-white/5 p-2">

            <TaskPipelinePlaceholder
              processCode={processCode}
              tasks={tasks}
            />

          </div>

        )}

      </div>

      <div className="erp-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2 py-2">

        <div className="flex flex-col gap-2 pb-2">

          {tasks.map(task => (

            <TaskPipelineCard
              key={task.id}
              task={task}
              expanded={expandedTaskId === task.id}
              onToggle={() => onToggleTask(task.id)}
            />

          ))}

          {tasks.length === 0 && (

            <div className="rounded-lg border border-dashed border-white/10 py-6 text-center text-xs text-neutral-600">
              Sin tareas
            </div>

          )}

        </div>

      </div>

    </section>

  )

}