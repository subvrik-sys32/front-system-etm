"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
  overlayLocked: boolean
  onOverlayOpenChange: (isOpen: boolean) => void
}

export function TaskPipelineCard({
  task,
  processCode,
  expanded,
  onToggle,
  overlayLocked,
  onOverlayOpenChange,
}: Props) {

  const [overlayOpen, setOverlayOpenState] = useState(false)

  const setOverlayOpen = useCallback(
    (isOpen: boolean) => {
      setOverlayOpenState(isOpen)
      onOverlayOpenChange(isOpen)
    },
    [onOverlayOpenChange],
  )

  const processTask = useMemo(
    () => getProcessTask(task, processCode),
    [task, processCode],
  )

  // El status ya viene correcto por step (incluyendo "QUEUE"
  // cuando esta etapa todavía no le llegó el turno a la tarea).
  const stepStatus =
    processTask.workflowStep?.status ?? "QUEUE"

  const finalized =
    isWorkflowCompleted(task.workflowSteps)

  const isFutureStage =
    stepStatus === "QUEUE"

  const isCompletedStage =
    stepStatus === "REVIEWED"

  const isDimmed =
    !finalized &&
    (isFutureStage || isCompletedStage)

  const isReachedStage =
    !isFutureStage && !isCompletedStage

  const closeOverlay = useCallback(
    () => setOverlayOpen(false),
    [setOverlayOpen],
  )

  // Si esta tarjeta se desmonta (ej. el usuario cambia de pestaña
  // de proceso en mobile) mientras su overlay seguía abierto, el
  // board nunca se enteraba — activeOverlayKey quedaba apuntando a
  // una clave que ya no existe, bloqueando (overlayLocked) TODAS
  // las demás tarjetas de cualquier proceso hasta recargar la
  // página. Este cleanup libera el lock al desmontar en ese caso.
  const overlayOpenRef = useRef(overlayOpen)

  overlayOpenRef.current = overlayOpen

  useEffect(() => {

    return () => {

      if (overlayOpenRef.current) {
        onOverlayOpenChange(false)
      }

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { bind, pressed } = useLongPress({
    onLongPress: () => {

      if (overlayLocked) {
        return
      }

      setOverlayOpen(true)

    },
  })

  const longPressEnabled =
    expanded && !finalized && isReachedStage

  // expanded nunca puede pasar a false mientras overlayOpen es true EN ESTA
  // MISMA card: el board bloquea esa transición externamente (activeOverlayKey).
  // Por eso ya no hace falta displayExpanded/pendingCollapse/onClosed:
  // el render es puramente derivado de las props, sin estado propio que
  // pueda desincronizarse.
  return (

    <div {...(longPressEnabled ? bind : {})} className="relative">

      <button
        type="button"
        onClick={onToggle}
        disabled={overlayOpen || overlayLocked}
        className="block w-full text-left"
      >

        <div
          className={cn(
            "overflow-hidden rounded-xl transition-all duration-200 ease-out",
            expanded && "shadow-xl",
            longPressEnabled && pressed && !overlayOpen && "scale-[0.98] shadow-lg",
            isDimmed && "opacity-50",
            overlayLocked && "opacity-40",
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