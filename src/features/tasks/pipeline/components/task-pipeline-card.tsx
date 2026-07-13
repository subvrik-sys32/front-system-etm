"use client"

import { cn } from "@/shared/utils/utils"

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
      className="block w-full text-left"
    >

      <div
        className={cn(
          "overflow-hidden rounded-xl transition-all duration-200 ease-out",
          expanded
            ? "shadow-xl"
            : "",
        )}
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

      </div>

    </button>

  )

}