"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { useResponsive } from "@/shared/responsive/hooks/use-responsive"

import { FormDialog } from "@/shared/ui/dialogs/form-dialog/form-dialog"
import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"

import {
  ProjectForm,
  ProjectFormWizardProgress,
  PROJECT_FORM_STEP_COUNT,
} from "../form/project-form"

import { useProjectForm } from "../../hooks/use-project-form"
import { useProjects } from "../../hooks/use-projects"

import type { Project } from "../../types/project.types"
import type { ProjectFormErrors } from "../form/types"

type Props = {
  open: boolean
  onClose: () => void
  project?: Project
}

// Mismo formato que exige el backend (CreateProjectDto): 26-001-M
const PROJECT_CODE_REGEX = /^\d{2}-\d{3}-(?:M|E|EM)$/

function validateProject(
  form: {
    projectCode: string
    name: string
    clientId: string
    pmId: string
    stageId: string
    statusId: string
    deliveryDate: string | null
  },
): ProjectFormErrors {
  const errors: ProjectFormErrors = {}

  if (!form.projectCode.trim()) {
    errors.projectCode = "Falta completar"
  } else if (!PROJECT_CODE_REGEX.test(form.projectCode.trim())) {
    errors.projectCode = "Formato inválido (ej. 26-001-M)"
  }

  if (!form.name.trim()) {
    errors.name = "Falta completar"
  }

  if (!form.clientId) {
    errors.clientId = "Selecciona un cliente"
  }

  if (!form.pmId) {
    errors.pmId = "Selecciona un PM"
  }

  if (!form.stageId) {
    errors.stageId = "Selecciona una etapa"
  }

  if (!form.statusId) {
    errors.statusId = "Selecciona un estado"
  }

  if (!form.deliveryDate) {
    errors.deliveryDate = "Selecciona una fecha"
  }

  return errors
}

// Qué claves de error pertenecen a cada paso del wizard mobile —
// solo se usa cuando isMobile es true; en desktop todo el formulario
// se muestra junto y esta agrupación no aplica.
const STEP_ERROR_KEYS: Record<number, (keyof ProjectFormErrors)[]> = {
  0: ["projectCode", "name"],
  1: ["clientId", "pmId"],
  2: ["stageId", "statusId", "deliveryDate"],
}

export function ProjectDialog({
  open,
  onClose,
  project,
}: Props) {
  const {
    form,
    update: updateForm,
    reset,
    buildProject,
    canSave,
  } = useProjectForm(project)

  const {
    create,
    update,
  } = useProjects()

  const router = useRouter()

  const { isMobile } = useResponsive()

  // Estado del wizard — solo relevante en mobile. En desktop el
  // formulario completo se muestra siempre junto, como siempre.
  const [step, setStep] = useState(0)
  const [stepAttempted, setStepAttempted] = useState<Set<number>>(new Set())

  const [
    confirmOpenProject,
    setConfirmOpenProject,
  ] = useState(false)

  const [
    createdProjectId,
    setCreatedProjectId,
  ] = useState<string | null>(null)

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    attempted,
    setAttempted,
  ] = useState(false)

  const errors = validateProject(form)

  const isValid =
    Object.keys(errors).length === 0

  // Cada vez que el diálogo se abre, arranca el wizard desde el
  // primer paso — evita que quede "a mitad de camino" de una
  // apertura anterior.
  useEffect(() => {

    if (open) {
      setStep(0)
      setStepAttempted(new Set())
    }

  }, [open])

  const close = () => {
    reset()

    setAttempted(false)

    onClose()
  }

  const save = async () => {
    if (!isValid) {
      setAttempted(true)

      return
    }

    setSaving(true)

    const dto = buildProject()

    try {
      if (project) {
        await update({
          id: project.id,
          dto,
        })

        close()

        return
      }

      const createdProject =
        await create(dto)

      close()

      setCreatedProjectId(
        createdProject.id,
      )

      setConfirmOpenProject(
        true,
      )
    } catch (error) {
      // El toast de error lo muestra el interceptor global en api-client.ts
      console.error(
        "PROJECT SAVE ERROR",
        error,
      )
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

  const isLastStep = step === PROJECT_FORM_STEP_COUNT - 1

  // En mobile, mientras no sea el último paso, el footer de
  // FormDialog se reutiliza como navegación del wizard (Atrás /
  // Siguiente) en vez de Cancelar / Guardar. En desktop, o en el
  // último paso mobile, el comportamiento es el de siempre.
  const showWizardFooter = isMobile && !isLastStep

  const footerCancelLabel =
    isMobile && step > 0
      ? "Atrás"
      : "Cancelar"

  const footerOnCancelClick =
    isMobile && step > 0
      ? handleWizardBack
      : close

  const footerSaveLabel =
    showWizardFooter
      ? "Siguiente"
      : project
        ? "Guardar"
        : "Crear proyecto"

  const footerSavingLabel =
    project
      ? "Guardando..."
      : "Creando proyecto..."

  const footerCanSave =
    showWizardFooter
      ? !stepHasErrors(step)
      : canSave && isValid

  const footerOnSave =
    showWizardFooter
      ? handleWizardNext
      : save

  // Errores visibles: en desktop, solo tras el primer intento de
  // guardar (comportamiento sin cambios). En mobile, solo para el
  // paso actual, y solo si ya se intentó avanzar desde ese paso
  // estando inválido.
  const visibleErrors =
    isMobile
      ? (stepAttempted.has(step) ? errors : undefined)
      : (attempted ? errors : undefined)

  return (
    <>
      <FormDialog
        open={open}
        title={
          project
            ? "Editar proyecto"
            : "Nuevo proyecto"
        }
        icon={Plus}
        canSave={footerCanSave}
        saving={saving}
        saveLabel={footerSaveLabel}
        savingLabel={footerSavingLabel}
        cancelLabel={footerCancelLabel}
        onCancelClick={footerOnCancelClick}
        subHeader={isMobile ? <ProjectFormWizardProgress step={step} /> : undefined}
        onClose={close}
        onSave={footerOnSave}
      >
        <ProjectForm
          form={form}
          update={updateForm}
          step={step}
          errors={visibleErrors}
        />
      </FormDialog>

      <ActionDialog
        open={confirmOpenProject}
        title="Abrir proyecto"
        description="El proyecto fue creado correctamente. ¿Deseas abrirlo ahora?"
        cancelLabel="Más tarde"
        confirmLabel="Abrir"
        onClose={() => {
          setCreatedProjectId(null)

          setConfirmOpenProject(false)
        }}
        onConfirm={() => {
          if (createdProjectId) {
            router.push(
              `/projects?projectId=${createdProjectId}`,
            )
          }

          setCreatedProjectId(null)

          setConfirmOpenProject(false)
        }}
      />
    </>
  )
}