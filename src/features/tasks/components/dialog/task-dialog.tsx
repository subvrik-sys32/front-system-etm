"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Package, Plus } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"
import { FormDialog } from "@/shared/ui/dialogs/form-dialog/form-dialog"

import { TaskFormValue, useTaskForm } from "../../hooks/use-task-form"
import { useTasks } from "../../hooks/use-tasks"

import {
  TaskForm,
  TASK_FORM_STEP_COUNT,
  TaskFormWizardProgress,
} from "../form/task-form"

import type { Task } from "../../types/task.types"
import type { DetailAsset } from "@/features/detail-assets/types"
import { detailAssetsApi } from "@/features/detail-assets/api/detail-assets.api"
import { invalidateDetailAssetCaches } from "@/features/detail-assets/hooks/use-detail-assets"
import { toast } from "sonner"
import type { TaskFormErrors } from "../form/types"

type Props = {
  open: boolean
  onClose: () => void
  projectId?: string
  task?: Task
  promptOpenAfterCreate?: boolean
}

function validateTask(
  form: TaskFormValue,
  projectLocked: boolean,
): TaskFormErrors {
  const errors: TaskFormErrors = {}

  if (!projectLocked && !form.projectId) {
    errors.projectId = "Selecciona un proyecto"
  }

  if (!form.reference.trim()) {
    errors.reference = "Falta completar"
  }

  if (form.lotNumber <= 0) {
    errors.lotNumber = "Falta completar"
  }

  if (form.route.length === 0) {
    errors.route = "Selecciona al menos un proceso"
  }

  if (!form.deliveryDate) {
    errors.deliveryDate = "Selecciona una fecha"
  }

  if (!form.priorityId) {
    errors.priorityId = "Selecciona una prioridad"
  }

  if (!form.materialId) {
    errors.materialId = "Selecciona un material"
  }

  if (!form.thicknessId) {
    errors.thicknessId = "Selecciona un espesor"
  }

  if (form.pieces <= 0) {
    errors.pieces = "Falta completar"
  }

  const requiresAssembly = form.route.includes("EN")
  const requiresPaint = form.route.includes("PT")

  if (requiresAssembly && form.assemblyCount <= 0) {
    errors.assemblyCount = "Ingresa la cantidad ensamblada"
  }

  if (requiresPaint && !form.colorId) {
    errors.colorId = "Selecciona un color"
  }

  if (requiresPaint && form.paintKg <= 0) {
    errors.paintKg = "Ingresa los kg de pintura"
  }

  return errors
}

const STEP_ERROR_KEYS: Record<number, (keyof TaskFormErrors)[]> = {
  0: ["projectId"],
  1: [
    "reference",
    "lotNumber",
    "route",
    "deliveryDate",
    "priorityId",
    "colorId",
    "paintKg",
    "assemblyCount",
  ],
  2: ["materialId", "thicknessId", "pieces"],
}

export function TaskDialog({
  open,
  onClose,
  projectId,
  task,
  promptOpenAfterCreate = false,
}: Props) {
  const { form, update, buildTask, canSave } = useTaskForm(task, projectId)

  const { create, update: updateTask } = useTasks()

  const router = useRouter()
  const qc = useQueryClient()
  const { isMobile } = useResponsive()

  const [step, setStep] = useState(0)
  const [stepAttempted, setStepAttempted] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (open) {
      setStep(0)
      setStepAttempted(new Set())
    }
  }, [open])

  const [confirmOpenTask, setConfirmOpenTask] = useState(false)
  const [createdTaskId, setCreatedTaskId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [attempted, setAttempted] = useState(false)

  const projectLocked = !!projectId

  const routeStarted =
    !!task &&
    task.workflowSteps.some(
      step => step.status !== "PENDING" && step.status !== "QUEUE",
    )

  const lockedRouteCodes =
    routeStarted && task ? [...task.route] : []

  const routeLocked = false

  const errors = validateTask(form, projectLocked)
  const isValid = Object.keys(errors).length === 0

  const close = () => {
    setAttempted(false)
    onClose()
  }

  const [materialQty, setMaterialQty] = useState(1)
  const [pendingDxfByIndex, setPendingDxfByIndex] = useState<
    Record<number, File | null>
  >({})

  const lineDxfById: Record<string, DetailAsset | null> = {}
  if (task?.materialLines) {
    for (const line of task.materialLines) {
      const raw = line.detailAssets?.find(a => a.kind === "DXF")
      if (line.id) {
        lineDxfById[line.id] = raw
          ? {
              id: raw.id,
              kind: "DXF",
              publicUrl: raw.publicUrl ?? null,
              storageKey: raw.storageKey ?? null,
              originalName: raw.originalName ?? "",
              mimeType: "application/dxf",
              sizeBytes: 0,
              meta: null,
              sortOrder: 0,
              createdAt: "",
            }
          : null
      }
    }
  }

  const uploadPendingDxfs = async (
    materialLines: { id: string }[] | undefined,
    resolvedTaskId?: string,
  ) => {
    if (!materialLines?.length) return
    for (const [idxStr, file] of Object.entries(pendingDxfByIndex)) {
      if (!(file instanceof File)) continue
      const line = materialLines[Number(idxStr)]
      if (!line?.id) continue
      try {
        await detailAssetsApi.uploadMaterialLineDxf(line.id, file)
      } catch {
        toast.error(`No se pudo subir DXF de la línea ${Number(idxStr) + 1}`)
      }
    }
    setPendingDxfByIndex({})
    const id = resolvedTaskId ?? task?.id
    if (id) {
      invalidateDetailAssetCaches(qc, { taskId: id })
    }
  }

  const save = async () => {
    if (!isValid) {
      setAttempted(true)
      return
    }

    setSaving(true)

    try {
      if (task) {
        const data = buildTask()
        const updated = await updateTask({
          id: task.id,
          dto: data,
        })
        await uploadPendingDxfs(
          (updated as Task | undefined)?.materialLines ?? task.materialLines,
          task.id,
        )
        close()
        return
      }

      const createdTask = await create(buildTask())
      await uploadPendingDxfs(
        (createdTask as Task)?.materialLines,
        createdTask.id,
      )

      if (promptOpenAfterCreate) {
        setCreatedTaskId(createdTask.id)
        setConfirmOpenTask(true)
        setSaving(false)
        return
      }

      close()
    } catch (error) {
      console.error("TASK SAVE ERROR", error)
    } finally {
      setSaving(false)
    }
  }

  function stepHasErrors(stepIndex: number) {
    return STEP_ERROR_KEYS[stepIndex].some(key => errors[key])
  }

  function handleWizardNext() {
    if (stepHasErrors(step)) {
      setStepAttempted(prev => new Set(prev).add(step))
      return
    }
    setStep(current => current + 1)
  }

  function handleWizardBack() {
    setStep(current => Math.max(0, current - 1))
  }

  const isLastStep = step === TASK_FORM_STEP_COUNT - 1
  const showWizardFooter = isMobile && !isLastStep

  const footerCancelLabel =
    isMobile && step > 0 ? "Atrás" : "Cancelar"

  const footerOnCancelClick =
    isMobile && step > 0 ? handleWizardBack : close

  const footerSaveLabel = showWizardFooter
    ? "Siguiente"
    : task
      ? "Guardar"
      : "Crear tarea"

  const footerSavingLabel = task ? "Guardando..." : "Creando tarea..."

  const footerCanSave = showWizardFooter
    ? !stepHasErrors(step)
    : canSave && isValid

  const footerOnSave = showWizardFooter ? handleWizardNext : save

  const addMaterialLine = () => {
    const qty = Math.min(20, Math.max(1, Math.floor(materialQty) || 1))
    const current = form.materials?.length
      ? form.materials
      : [
          {
            materialId: form.materialId,
            thicknessId: form.thicknessId,
            pieces: form.pieces || 1,
          },
        ]
    const extra = Array.from({ length: qty }, () => ({
      materialId: "",
      thicknessId: "",
      pieces: 1,
    }))
    update({ materials: [...current, ...extra] })
    setMaterialQty(1)
  }

  const showAddMaterial = !isMobile || step === TASK_FORM_STEP_COUNT - 1

  const materialFooterStart = showAddMaterial ? (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="material-qty">
        Cantidad de materiales a añadir
      </label>
      <input
        id="material-qty"
        type="number"
        min={1}
        max={20}
        inputMode="numeric"
        value={materialQty}
        onChange={e => {
          const n = Number(e.target.value)
          if (Number.isNaN(n)) {
            setMaterialQty(1)
            return
          }
          setMaterialQty(Math.min(20, Math.max(1, n)))
        }}
        className="h-10 w-12 rounded-xl bg-foreground/5 text-center text-sm font-semibold tabular-nums text-foreground outline-none ring-0 transition focus:bg-foreground/10"
        title="Cuántas líneas de material añadir"
      />
      <button
        type="button"
        onClick={addMaterialLine}
        aria-label={
          materialQty > 1
            ? `Añadir ${materialQty} materiales`
            : "Añadir material"
        }
        title="Añadir material"
        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-foreground/5 px-3 text-sm font-medium text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
      >
        {isMobile ? (
          <>
            <Plus size={16} strokeWidth={2.5} />
            <Package size={16} strokeWidth={2} />
            {materialQty > 1 ? (
              <span className="text-xs font-semibold tabular-nums text-foreground/80">
                ×{materialQty}
              </span>
            ) : null}
          </>
        ) : (
          <>
            <Plus size={15} strokeWidth={2.5} />
            Añadir material
            {materialQty > 1 ? (
              <span className="tabular-nums text-foreground/80">
                ×{materialQty}
              </span>
            ) : null}
          </>
        )}
      </button>
    </div>
  ) : undefined

  const visibleErrors = isMobile
    ? stepAttempted.has(step)
      ? errors
      : undefined
    : attempted
      ? errors
      : undefined

  return (
    <>
      <FormDialog
        open={open}
        title={task ? "Editar tarea" : "Nueva tarea"}
        icon={Plus}
        canSave={footerCanSave}
        saving={saving}
        saveLabel={footerSaveLabel}
        savingLabel={footerSavingLabel}
        cancelLabel={footerCancelLabel}
        onCancelClick={footerOnCancelClick}
        subHeader={
          isMobile ? <TaskFormWizardProgress step={step} /> : undefined
        }
        onClose={close}
        onSave={footerOnSave}
        footerStart={materialFooterStart}
      >
        <TaskForm
          form={{
            ...form,
            projectId: projectId ?? form.projectId,
          }}
          update={update}
          projectLocked={projectLocked}
          routeLocked={routeLocked}
          lockedRouteCodes={lockedRouteCodes}
          step={step}
          errors={visibleErrors}
          taskId={task?.id}
          lineDxfById={lineDxfById}
          pendingDxfByIndex={pendingDxfByIndex}
          onPendingDxf={(index, file) =>
            setPendingDxfByIndex(prev => ({ ...prev, [index]: file }))
          }
        />
      </FormDialog>

      <ActionDialog
        open={confirmOpenTask}
        title="Abrir tarea"
        description="La tarea fue creada correctamente. ¿Deseas abrirla ahora?"
        cancelLabel="Más tarde"
        confirmLabel="Abrir"
        onClose={() => {
          setConfirmOpenTask(false)
          setCreatedTaskId(null)
          close()
        }}
        onConfirm={() => {
          if (createdTaskId) {
            router.push(`/tasks?taskId=${encodeURIComponent(createdTaskId)}`)
          }
          setConfirmOpenTask(false)
          setCreatedTaskId(null)
          close()
        }}
      />
    </>
  )
}