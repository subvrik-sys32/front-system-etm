"use client"

import {
  WorkflowAction,
} from "@/shared/ui/actions/workflow-action"

import {
  useWorkflowStepActions,
} from "@/features/processes/hooks/use-workflow-step-actions"

import type {
  ProcessCode,
  Task,
} from "@/features/tasks/types/task.types"

import type {
  WorkflowStatus,
} from "@/features/workflow/types/workflow.types"

type Props = {
  task: Task
  stepId: string
  status: WorkflowStatus
  processCode: ProcessCode
}

export function ProcessRowActions({
  task,
  stepId,
  status,
  processCode,
}: Props) {

  const {
    canUpdate,
    canReview,
    handleStart,
    handlePause,
    handleResume,
    handleComplete,
    handleReview,
  } = useWorkflowStepActions({
    task,
    stepId,
    processCode,
  })

  if (status === "QUEUE") {

    return (

      <div className="flex w-full items-center justify-center">

        <div className="flex h-8 min-w-30 items-center justify-center rounded-lg border-2 border-dashed border-neutral-600/40 bg-transparent">

          <div className="h-1.5 w-1.5 rounded-full bg-white/20" />

        </div>

      </div>

    )

  }

  if (status === "REVIEWED") {

    return (

      <div className="flex w-full items-center justify-center">

        <div className="flex h-8 min-w-30 items-center justify-center rounded-lg bg-emerald-500/5 px-4 text-xs font-semibold uppercase text-emerald-300">
          ✓ Revisado
        </div>

      </div>

    )

  }

  return (

    <div className="flex w-full items-center justify-center gap-2">

      {status === "PENDING" && (

        <WorkflowAction
          label="Iniciar"
          variant="start"
          disabled={!canUpdate}
          onClick={handleStart}
        />

      )}

      {status === "PROGRESS" && (

        <>

          <WorkflowAction
            label="Pausar"
            variant="pause"
            iconOnly
            disabled={!canUpdate}
            onClick={handlePause}
          />

          <WorkflowAction
            label="Completar"
            variant="complete"
            iconOnly
            disabled={!canUpdate}
            onClick={handleComplete}
          />

        </>

      )}

      {status === "PAUSED" && (

        <WorkflowAction
          label="Reanudar"
          variant="start"
          disabled={!canUpdate}
          onClick={handleResume}
        />

      )}

      {status === "COMPLETED" && (

        <WorkflowAction
          label="Revisar"
          variant="review"
          disabled={!canReview}
          onClick={handleReview}
        />

      )}

    </div>

  )

}