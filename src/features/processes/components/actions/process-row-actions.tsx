"use client"

import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { PermissionCode } from "@/shared/core/enums/permission-code.enum"
import { WorkflowAction } from "@/shared/ui/actions/workflow-action"
import { usePermissions } from "@/features/permissions/hooks/use-permissions"
import { useWorkflow } from "@/features/workflow/hooks/use-workflow"
import { useWorkflowRequirements } from "@/features/workflow/hooks/use-workflow-requirements"
import { isWorkflowCompleted } from "@/features/workflow/selectors/is-completed"
import { canCompleteStep } from "@/features/workflow/selectors/can-complete"
import { workflowGuard } from "@/features/workflow/domain/workflow-guard"
import {
  useWorkflowFieldErrorsStore,
  type WorkflowFieldKey,
} from "@/features/workflow/store/workflow-field-errors-store"
import { getCurrentStep } from "@/features/workflow/selectors/get-current-step"
import type { ProcessCode, Task } from "@/features/tasks/types/task.types"
import type { ProcessTask } from "@/features/processes/types/process.types"
import { PROCESS_DEFINITIONS } from "@/features/processes/constants/process-definitions"
import { useFocusNavStore } from "@/shared/focus/store/focus-nav-store"
import { setProcessNavigationOrigin } from "@/features/processes/components/actions/back-to-process-button"
import { EntityChip } from "@/shared/ui/entity-chip/entity-chip"
import type { WorkflowStatus } from "@/features/workflow/types/workflow.types"

type ProcessRowActionsProps = {
  task: Task
  stepId: string
  status: WorkflowStatus
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

export function ProcessRowActions({
  task,
  stepId,
  status,
  processCode,
}: ProcessRowActionsProps) {
  const {
    startStep,
    pauseStep,
    resumeStep,
    completeStep,
    reviewStep,
    isStarting,
    isPausing,
    isResuming,
    isCompleting,
    isReviewing,
  } = useWorkflow()
  const { has } = usePermissions()
  const router = useRouter()
  const { data: requirements } = useWorkflowRequirements()

  const currentStep = task.workflowSteps.find((s) => s.id === stepId)

  const canUpdate = has(PermissionCode.WORKFLOW_UPDATE)
  const canReview = has(PermissionCode.WORKFLOW_REVIEW)

  const canComplete = canCompleteStep(
    currentStep,
    requirements?.[processCode]
  )

  const safeRequest = async (
    action: () => Promise<unknown>,
    successMsg: string
  ) => {
    try {
      await action()
      toast.success(successMsg)
    } catch {
      // El toast de error ya lo muestra el interceptor global de Axios
    }
  }

  const handleStart = () => {
    if (!canUpdate) return
    return safeRequest(() => startStep(stepId), "Proceso iniciado.")
  }

  const handlePause = () => {
    if (!canUpdate) return
    return safeRequest(() => pauseStep(stepId), "Proceso pausado.")
  }

  const handleResume = () => {
    if (!canUpdate) return
    return safeRequest(() => resumeStep(stepId), "Proceso reanudado.")
  }

  const handleComplete = async () => {
    if (!canUpdate || !currentStep || currentStep.status !== "PROGRESS") {
      return
    }

    const payload = {
      piecesOutput: currentStep.piecesOutput ?? null,
      plRtReal: currentStep.plRtReal ?? null,
      paintKgReal: currentStep.paintKgReal ?? null,
    }

    const processTask = {
      task,
      workflowStep: currentStep,
      paintStep: null,
      inputQuantity: null,
    } satisfies ProcessTask

    // Sonner de alerta si faltan piezas / PL-RT / kg pintura (mismo contrato que CT).
    if (!workflowGuard.validateProcessData(processTask, payload)) {
      // Resalta en rojo los pills "Ingresar" vacíos para contrastar.
      const missing: WorkflowFieldKey[] = []
      const code = processCode
      const empty = (v: number | null | undefined) => v == null || v <= 0

      if (code === "CT") {
        if (empty(payload.piecesOutput)) missing.push("piecesOutput")
        if (empty(payload.plRtReal)) missing.push("plRtReal")
      } else if (["PL", "SD", "EN", "DS"].includes(code)) {
        if (empty(payload.piecesOutput)) missing.push("piecesOutput")
      } else if (code === "PT") {
        if (empty(payload.paintKgReal)) missing.push("paintKgReal")
        if (empty(payload.piecesOutput)) missing.push("piecesOutput")
      }

      if (missing.length > 0) {
        useWorkflowFieldErrorsStore.getState().flash(stepId, missing)
      }
      return
    }

    await safeRequest(
      () =>
        completeStep({
          stepId,
          dto: {
            piecesOutput: currentStep.piecesOutput ?? undefined,
            plRtReal: currentStep.plRtReal ?? undefined,
            paintKgReal: currentStep.paintKgReal ?? undefined,
          },
        }),
      "Proceso completado."
    )
  }

  const handleReview = async () => {
    if (!canReview) return

    const currentIndex = task.workflowSteps.findIndex((s) => s.id === stepId)
    const wasCompleted = isWorkflowCompleted(task.workflowSteps)

    await safeRequest(
      () => reviewStep(stepId),
      !wasCompleted
        ? "Tarea finalizada."
        : `${PROCESS_NAMES[processCode]} revisado.`
    )

    const next = task.workflowSteps[currentIndex + 1]

    if (next) {
      toast.success(
        `${PROCESS_NAMES[processCode]} revisado. Enviado a ${PROCESS_NAMES[next.processCode]}`
      )
    }
  }

  if (status === "QUEUE") {
    /** Navega entre procesos; un solo back (proceso cancela ← Tarea). */
    function openProcessRoute(targetCode: ProcessCode) {
      const label =
        PROCESS_DEFINITIONS[targetCode]?.label ?? targetCode
      setProcessNavigationOrigin(processCode, task.id)
      useFocusNavStore.getState().start(`Abriendo ${label}…`)
      router.push(
        `/processes?code=${targetCode.toLowerCase()}&taskId=${encodeURIComponent(task.id)}`,
      )
    }

    // Chip = proceso ACTUAL de la tarea (dónde está ahora), no el paso previo.
    const current = getCurrentStep(task.workflowSteps)
    const currentCode = (current?.processCode ?? processCode) as ProcessCode
    const currentDef = PROCESS_DEFINITIONS[currentCode]

    if (currentDef) {
      return (
        <div className="flex w-full items-center justify-center">
          <QueueProcessChip
            code={currentCode}
            label={currentDef.label}
            color={currentDef.color}
            icon={currentDef.icon}
            onClick={() => openProcessRoute(currentCode)}
          />
        </div>
      )
    }

    return (
      <div className="flex w-full items-center justify-center">
        <button
          type="button"
          onClick={() => openProcessRoute(processCode)}
          title={`Abrir ${PROCESS_NAMES[processCode]}`}
          className="inline-flex h-9 w-28 items-center justify-center rounded-lg bg-foreground/5 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-foreground/10"
        >
          En cola
        </button>
      </div>
    )
  }

  if (status === "REVIEWED") {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="flex h-8 w-full items-center justify-center rounded-lg bg-emerald-500/20 dark:bg-emerald-500/5 px-4 text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300">
          Revisado
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
          compact
          disabled={!canUpdate}
          loading={isStarting}
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
            loading={isPausing}
            onClick={handlePause}
          />

          <WorkflowAction
            label="Completar"
            variant="complete"
            iconOnly
            disabled={!canUpdate}
            loading={isCompleting}
            onClick={handleComplete}
          />
        </>
      )}

      {status === "PAUSED" && (
        <WorkflowAction
          label="Reanudar"
          variant="start"
          compact
          disabled={!canUpdate}
          loading={isResuming}
          onClick={handleResume}
        />
      )}

      {status === "COMPLETED" && (
        <WorkflowAction
          label="Revisar"
          variant="review"
          compact
          disabled={!canReview}
          loading={isReviewing}
          onClick={handleReview}
        />
      )}
    </div>
  )
}

/** Chip de proceso previo: mismo tamaño que "Iniciar", click = ruta al proceso. */
function QueueProcessChip({
  code,
  label,
  color,
  icon,
  onClick,
}: {
  code: string
  label: string
  color: string
  icon?: import("@/shared/constants/entity-icons").EntityIcon
  onClick: () => void
}) {
  // Mismo contrato que status (EntityChip + useBadgeColors), no estilo a mano.
  return (
    <button
      type="button"
      onClick={onClick}
      title={`En ${label} — ir a ese proceso`}
      className="inline-flex h-9 w-28 items-center justify-center transition-transform select-none hover:brightness-110 active:brightness-95"
    >
      <EntityChip label={code} color={color} icon={icon} />
    </button>
  )
}
