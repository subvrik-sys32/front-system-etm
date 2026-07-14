"use client"

import { toast } from "sonner"

import { PermissionCode } from "@/shared/core/enums/permission-code.enum"

import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { useWorkflow } from "@/features/workflow/hooks/use-workflow"
import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"

import type { ProcessCode, Task } from "@/features/tasks/types/task.types"

type Params = {
  task: Task
  stepId: string
  processCode: ProcessCode
}

const PROCESS_NAMES: Record<ProcessCode, string> = {
  CT: "Corte",
  PL: "Plegado",
  SD: "Soldadura",
  PT: "Pintura",
  EN: "Ensamble",
  DS: "Despacho",
}

export function useWorkflowStepActions({
  task,
  stepId,
  processCode,
}: Params) {

  const {
    startStep,
    pauseStep,
    resumeStep,
    completeStep,
    reviewStep,
  } = useWorkflow()

  const { has } = usePermissions()

  const canUpdate = has(PermissionCode.WORKFLOW_UPDATE)
  const canReview = has(PermissionCode.WORKFLOW_REVIEW)

  async function safeRequest(
    action: () => Promise<unknown>,
    successMsg: string,
  ): Promise<boolean> {

    try {

      await action()

      toast.success(successMsg)

      return true

    } catch (error) {

      toast.error(
        error instanceof Error
          ? error.message
          : "Error inesperado.",
      )

      return false

    }

  }

  async function handleStart(): Promise<boolean> {

    if (!canUpdate) {
      return false
    }

    return safeRequest(
      () => startStep(stepId),
      "Proceso iniciado.",
    )

  }

  async function handlePause(): Promise<boolean> {

    if (!canUpdate) {
      return false
    }

    return safeRequest(
      () => pauseStep(stepId),
      "Proceso pausado.",
    )

  }

  async function handleResume(): Promise<boolean> {

    if (!canUpdate) {
      return false
    }

    return safeRequest(
      () => resumeStep(stepId),
      "Proceso reanudado.",
    )

  }

  async function handleComplete(): Promise<boolean> {

    if (!canUpdate) {
      return false
    }

    const currentStep = task.workflowSteps.find(
      s => s.id === stepId,
    )

    if (!currentStep || currentStep.status !== "PROGRESS") {
      return false
    }

    return safeRequest(

      () => completeStep({

        stepId,

        dto: {
          piecesOutput: currentStep.piecesOutput ?? undefined,
          plRtReal: currentStep.plRtReal ?? undefined,
          paintKgReal: currentStep.paintKgReal ?? undefined,
        },

      }),

      "Proceso completado.",

    )

  }

  async function handleReview(): Promise<boolean> {

    if (!canReview) {
      return false
    }

    const currentIndex = task.workflowSteps.findIndex(
      s => s.id === stepId,
    )

    const wasCompleted = isWorkflowCompleted(task.workflowSteps)

    const ok = await safeRequest(

      () => reviewStep(stepId),

      !wasCompleted
        ? "Tarea finalizada."
        : `${PROCESS_NAMES[processCode]} revisado.`,

    )

    if (!ok) {
      return false
    }

    const next = task.workflowSteps[currentIndex + 1]

    if (next) {

      toast.success(
        `${PROCESS_NAMES[processCode]} revisado. Enviado a ${PROCESS_NAMES[next.processCode]}`,
      )

    }

    return true

  }

  return {
    canUpdate,
    canReview,
    handleStart,
    handlePause,
    handleResume,
    handleComplete,
    handleReview,
  }

}