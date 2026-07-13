"use client"

import { KanbanCardFromTask } from "@/features/tasks/components/kanban-card/kanban-card-from-task"

import type { Task } from "@/features/tasks/types/task.types"

import { TaskPipelineCardCompact } from "./task-pipeline-card-compact"

type Props = {
  task: Task
  expanded: boolean
  onToggle: () => void
}

export function TaskPipelineCard({
  task,
  expanded,
  onToggle,
}: Props) {

  return (

    <button
      type="button"
      onClick={onToggle}
      className="block w-full overflow-hidden rounded-xl text-left transition-[max-height] duration-300 ease-out"
      style={{
        maxHeight: expanded ? 224 : 48,
      }}
    >

      {expanded ? (

        <KanbanCardFromTask
          task={task}
        />

      ) : (

        <TaskPipelineCardCompact
          task={task}
        />

      )}

    </button>

  )

}