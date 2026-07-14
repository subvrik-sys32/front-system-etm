"use client"

import { useCallback, useMemo, useState } from "react"

import { cn } from "@/shared/utils/utils"

import { KanbanCardFromTask } from "@/features/tasks/components/kanban-card/kanban-card-from-task"

import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

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

  const finalized =
    isWorkflowCompleted(task.workflowSteps)

  // Mientras el step de esta columna esté en "QUEUE" (todavía no
  // le toca el turno a la tarea), no tiene sentido abrir el
  // overlay de acciones sobre él.
  const isReachedStage =
    processTask.workflowStep != null &&
    processTask.workflowStep.status !== "QUEUE"

  const { bind, pressed } = useLongPress({
    onLongPress: () => {

      setOverlayOpen(true)

    },
  })

  const longPressEnabled =
    expanded && !finalized && isReachedStage

  return (

    <div {...(longPressEnabled ? bind : {})} className="relative">

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
            longPressEnabled && pressed && !overlayOpen && "scale-[0.98] shadow-lg",
          )}
        >

          {expanded ? (
            <KanbanCardFromTask task={task} processCode={processCode} />
          ) : (
            <TaskPipelineCardCompact processTask={processTask} />
          )}

        </div>

      </button>

      {!finalized && isReachedStage && (

        <TaskWorkflowOverlay
          processTask={processTask}
          processCode={processCode}
          visible={overlayOpen}
          onClose={closeOverlay}
        />

      )}

    </div>

  )

}