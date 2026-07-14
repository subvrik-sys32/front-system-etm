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

  const stepStatus =
    processTask.workflowStep?.status ?? "QUEUE"

  const finalized =
    isWorkflowCompleted(task.workflowSteps)

  // Esta etapa todavía no le llegó el turno a la tarea.
  const isFutureStage =
    stepStatus === "QUEUE"

  // Esta etapa puntual ya fue revisada/cerrada (aunque la tarea
  // completa siga en curso por otras etapas posteriores).
  const isCompletedStage =
    stepStatus === "REVIEWED"

  // Se atenúan visualmente, pero se mantienen clickeables/expandibles.
  const isDimmed =
    !finalized &&
    (isFutureStage || isCompletedStage)

  const isReachedStage =
    !isFutureStage

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
            isDimmed && "opacity-50",
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