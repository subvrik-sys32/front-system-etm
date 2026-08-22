"use client"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { WizardProgress } from "@/shared/ui/dialogs/form-dialog/wizard-progress"

import { TaskProjectSection } from "./task-project-section"
import { TaskInfoSection } from "./task-info-section"
import { TaskMaterialSection } from "./task-material-section"

import type { TaskFormSectionProps } from "./types"
import type { DetailAsset } from "@/features/detail-assets/types"

export const TASK_FORM_STEPS = [
  { label: "Proyecto" },
  { label: "Información" },
  { label: "Material" },
] as const

export const TASK_FORM_STEP_COUNT = TASK_FORM_STEPS.length

export function TaskFormWizardProgress({ step }: { step: number }) {
  return <WizardProgress steps={TASK_FORM_STEPS} step={step} />
}

type Props = TaskFormSectionProps & {
  step?: number
  lineDxfById?: Record<string, DetailAsset | null | undefined>
  pendingDxfByIndex?: Record<number, File | null | undefined>
  onPendingDxf?: (index: number, file: File | null) => void
  onDxfChanged?: () => void
}

export function TaskForm({
  form,
  update,
  projectLocked,
  routeLocked,
  lockedRouteCodes,
  errors,
  step = 0,
  lineDxfById,
  pendingDxfByIndex,
  onPendingDxf,
  onDxfChanged,
}: Props) {

  const { isMobile } = useResponsive()


  if (!isMobile) {

    return (

      <div className="space-y-3">

        <TaskProjectSection
          form={form}
          update={update}
          projectLocked={projectLocked}
          errors={errors}
        />

        <TaskInfoSection
          form={form}
          update={update}
          routeLocked={routeLocked}
          lockedRouteCodes={lockedRouteCodes}
          errors={errors}
        />

        <TaskMaterialSection
          form={form}
          update={update}
          errors={errors}
          lineDxfById={lineDxfById}
          pendingDxfByIndex={pendingDxfByIndex}
          onPendingDxf={onPendingDxf}
          onDxfChanged={onDxfChanged}
        />

      </div>

    )

  }

  return (

    <>

      {step === 0 && (

        <TaskProjectSection
          form={form}
          update={update}
          projectLocked={projectLocked}
          errors={errors}
        />

      )}

      {step === 1 && (

        <TaskInfoSection
          form={form}
          update={update}
          routeLocked={routeLocked}
          lockedRouteCodes={lockedRouteCodes}
          errors={errors}
        />

      )}

      {step === 2 && (

        <TaskMaterialSection
          form={form}
          update={update}
          errors={errors}
          lineDxfById={lineDxfById}
          pendingDxfByIndex={pendingDxfByIndex}
          onPendingDxf={onPendingDxf}
          onDxfChanged={onDxfChanged}
        />

      )}

    </>

  )

}