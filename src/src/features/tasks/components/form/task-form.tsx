"use client"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { WizardProgress } from "@/shared/ui/dialogs/form-dialog/wizard-progress"

import { TaskProjectSection } from "./task-project-section"
import { TaskInfoSection } from "./task-info-section"
import { TaskMaterialSection } from "./task-material-section"

import type { TaskFormSectionProps } from "./types"

// Un solo array define el wizard: agregar/quitar/reordenar un paso
// acá alcanza, no hay que tocar TaskDialog para eso (solo la
// validación por paso, que vive en TaskDialog junto al resto de
// las reglas de negocio del formulario).
export const TASK_FORM_STEPS = [
  { label: "Proyecto" },
  { label: "Información" },
  { label: "Material" },
] as const

export const TASK_FORM_STEP_COUNT = TASK_FORM_STEPS.length

// Reexportado por compatibilidad — TaskDialog usa este componente
// como subHeader del wizard. Es un simple wrapper de WizardProgress
// con los steps de tareas ya aplicados.
export function TaskFormWizardProgress({ step }: { step: number }) {
  return <WizardProgress steps={TASK_FORM_STEPS} step={step} />
}

type Props = TaskFormSectionProps & {
  // Ignorado en desktop (siempre se muestran las 3 secciones juntas,
  // comportamiento sin cambios). En mobile, controla qué sección del
  // wizard está visible — el estado vive en TaskDialog porque ahí es
  // también donde vive el indicador de progreso (TaskFormWizardProgress)
  // y el footer (Atrás/Siguiente vs Cancelar/Guardar).
  step?: number
}

export function TaskForm({
  form,
  update,
  projectLocked,
  routeLocked,
  errors,
  step = 0,
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
          errors={errors}
        />

        <TaskMaterialSection
          form={form}
          update={update}
          errors={errors}
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
          errors={errors}
        />

      )}

      {step === 2 && (

        <TaskMaterialSection
          form={form}
          update={update}
          errors={errors}
        />

      )}

    </>

  )

}