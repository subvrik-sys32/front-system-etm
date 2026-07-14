"use client"

import { useCallback, useMemo, useState } from "react"

import { cn } from "@/shared/utils/utils"

import { KanbanCardFromTask } from "@/features/tasks/components/kanban-card/kanban-card-from-task"

import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

import { useLongPress } from "../hooks/use-long-press"
import { getProcessTask } from "../utils/get-process-task"

import { TaskPipelineCardCompact } from "./task-pipeline-card-compact"
import { TaskWorkflowOverlay } from "./task-workflow-overlay"

type Props = {
  task: Task
  processCode: ProcessCode
  expanded: boolean
  onToggle: () => void
}

export function TaskPipelineCard({
  task,
  processCode,
  expanded,
  onToggle,
}: Props) {

  const [overlayOpen, setOverlayOpen] = useState(false)

  const closeOverlay = useCallback(() => setOverlayOpen(false), [])

  const processTask = useMemo(
    () => getProcessTask(task, processCode),
    [task, processCode],
  )

  const { bind, pressed } = useLongPress({
    onLongPress: () => {

      setOverlayOpen(true)

    },
  })

  return (

    <div {...(expanded ? bind : {})} className="relative">

      <button
        type="button"
        onClick={onToggle}
        disabled={overlayOpen}
        className="block w-full text-left"
      >

        <div
          className={cn(
            "overflow-hidden rounded-xl transition-all duration-200 ease-out",
            expanded && "shadow-xl",
            expanded && pressed && !overlayOpen && "scale-[0.98] shadow-lg",
          )}
        >

          {expanded ? (
            <KanbanCardFromTask task={task} />
          ) : (
            <TaskPipelineCardCompact task={task} />
          )}

        </div>

      </button>

      <TaskWorkflowOverlay
        processTask={processTask}
        processCode={processCode}
        visible={overlayOpen}
        onClose={closeOverlay}
      />

    </div>

  )

}