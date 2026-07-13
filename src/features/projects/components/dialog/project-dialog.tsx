"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { FormDialog } from "@/shared/ui/dialogs/form-dialog/form-dialog"
import { ActionDialog } from "@/shared/ui/dialogs/action-dialog/action-dialog"

import { ProjectForm } from "../form/project-form"

import { useProjectForm } from "../../hooks/use-project-form"
import { useProjects } from "../../hooks/use-projects"

import type { Project } from "../../types/project.types"

type Props = {
  open: boolean
  onClose: () => void
  project?: Project
}

type ProjectErrors = Partial<
  Record<
    | "projectCode"
    | "name"
    | "clientId"
    | "pmId"
    | "stageId"
    | "statusId"
    | "deliveryDate",
    string
  >
>

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
): ProjectErrors {
  const errors: ProjectErrors = {}

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
        canSave={
          canSave &&
          isValid
        }
        saving={saving}
        saveLabel={
          project
            ? "Guardar cambios"
            : "Crear proyecto"
        }
        savingLabel={
          project
            ? "Guardando cambios..."
            : "Creando proyecto..."
        }
        onClose={close}
        onSave={save}
      >
        <ProjectForm
          form={form}
          update={updateForm}
          errors={
            attempted
              ? errors
              : undefined
          }
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