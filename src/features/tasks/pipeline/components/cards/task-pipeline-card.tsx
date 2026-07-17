"use client"

import {
  useCallback,
  useMemo,
} from "react"

import {
  cn,
} from "@/shared/utils/utils"

import {
  KanbanCardFromTask,
} from "@/features/tasks/components/kanban-card/kanban-card-from-task"

import type {
  ProcessCode,
  Task,
} from "@/features/tasks/types/task.types"

import {
  isWorkflowCompleted,
} from "@/features/workflow/selectors/is-completed"

import {
  getProcessTask,
} from "../../utils/get-process-task"

import {
  useTaskCardOverlay,
} from "../../hooks/use-task-card-overlay"

import {
  TaskPipelineCardCompact,
} from "./task-pipeline-card-compact"

import {
  TaskWorkflowOverlay,
} from "../tasks/task-workflow-overlay"

type Props = {
  task: Task
  processCode: ProcessCode
  expanded: boolean
  onToggle: () => void
  overlayLocked: boolean
  onOverlayOpenChange: (
    isOpen: boolean,
  ) => void
}

export function TaskPipelineCard({
  task,
  processCode,
  expanded,
  onToggle,
  overlayLocked,
  onOverlayOpenChange,
}: Props) {
  const processTask =
    useMemo(
      () =>
        getProcessTask(
          task,
          processCode,
        ),
      [
        task,
        processCode,
      ],
    )

  const stepStatus =
    processTask.workflowStep?.status ??
    "QUEUE"

  const finalized =
    isWorkflowCompleted(
      task.workflowSteps,
    )

  const isFutureStage =
    stepStatus === "QUEUE"

  const isCompletedStage =
    stepStatus === "REVIEWED"

  const isDimmed =
    !finalized &&
    (
      isFutureStage ||
      isCompletedStage
    )

  const isReachedStage =
    !isFutureStage &&
    !isCompletedStage

  const handleOverlayOpenChange =
    useCallback(
      (isOpen: boolean) => {
        onOverlayOpenChange(isOpen)
      },
      [
        onOverlayOpenChange,
      ],
    )

  const {
    bind,
    pressed,
    overlayOpen,
    closeOverlay,
  } =
    useTaskCardOverlay({
      enabled:
        expanded &&
        !finalized &&
        isReachedStage &&
        !overlayLocked,
      onOpenChange:
        handleOverlayOpenChange,
    })

  const longPressEnabled =
    expanded &&
    !finalized &&
    isReachedStage

  return (
    <div
      {...(
        longPressEnabled
          ? bind
          : {}
      )}
      className="relative"
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={
          overlayOpen ||
          overlayLocked
        }
        className="block w-full text-left"
      >
        <div
          className={cn(
            "overflow-hidden rounded-xl transition-all duration-200 ease-out",
            expanded && "shadow-xl",
            longPressEnabled &&
              pressed &&
              !overlayOpen &&
              "scale-[0.98] shadow-lg",
            isDimmed &&
              "opacity-50",
            overlayLocked &&
              "opacity-40",
          )}
        >
          {expanded ? (
            <KanbanCardFromTask
              task={task}
              processCode={processCode}
            />
          ) : (
            <TaskPipelineCardCompact
              processTask={processTask}
            />
          )}
        </div>
      </button>

      {!finalized &&
        isReachedStage && (
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