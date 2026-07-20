"use client"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { WizardProgress } from "@/shared/ui/dialogs/form-dialog/wizard-progress"

import { ProjectInfoSection } from "./project-info-section"
import { ProjectRelationsSection } from "./project-relations-section"
import { ProjectControlSection } from "./project-control-section"

import type { ProjectFormSectionProps } from "./types"

// Un solo array define el wizard — agregar/quitar/reordenar un paso
// acá alcanza, no hay que tocar ProjectDialog para eso (solo la
// validación por paso, que vive en ProjectDialog junto al resto de
// las reglas de negocio del formulario). Mismo patrón que TaskForm.
export const PROJECT_FORM_STEPS = [
  { label: "Información principal" },
  { label: "Relaciones" },
  { label: "Control" },
] as const

export const PROJECT_FORM_STEP_COUNT = PROJECT_FORM_STEPS.length

export function ProjectFormWizardProgress({ step }: { step: number }) {
  return <WizardProgress steps={PROJECT_FORM_STEPS} step={step} />
}

type Props = ProjectFormSectionProps & {
  // Ignorado en desktop (siempre se muestran las 3 secciones juntas,
  // comportamiento sin cambios). En mobile, controla qué sección del
  // wizard está visible — el estado vive en ProjectDialog, junto con
  // el indicador de progreso y el footer (Atrás/Siguiente vs
  // Cancelar/Guardar).
  step?: number
}

export function ProjectForm({
  form,
  update,
  errors,
  step = 0,
}: Props) {

  const { isMobile } = useResponsive()

  if (!isMobile) {

    return (

      <div className="space-y-3">

        <ProjectInfoSection form={form} update={update} errors={errors} />

        <ProjectRelationsSection form={form} update={update} errors={errors} />

        <ProjectControlSection form={form} update={update} errors={errors} />

      </div>

    )

  }

  return (

    <>

      {step === 0 && (
        <ProjectInfoSection form={form} update={update} errors={errors} />
      )}

      {step === 1 && (
        <ProjectRelationsSection form={form} update={update} errors={errors} />
      )}

      {step === 2 && (
        <ProjectControlSection form={form} update={update} errors={errors} />
      )}

    </>

  )

}