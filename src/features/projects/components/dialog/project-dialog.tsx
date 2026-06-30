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

type Props={
  open:boolean
  onClose:()=>void
  project?:Project
}

export function ProjectDialog({
  open,
  onClose,
  project,
}:Props){

  const{
    form,
    update: updateForm,
    reset,
    buildProject,
    canSave,
  }=useProjectForm(project)

  const{
    create,
    update,
  }=useProjects()

  const router=useRouter()

  const[
    confirmOpenProject,
    setConfirmOpenProject,
  ]=useState(false)

  const[
    createdProjectId,
    setCreatedProjectId,
  ]=useState<string|null>(null)

  const[
    saving,
    setSaving,
  ]=useState(false)

  const close=()=>{

    reset()

    onClose()

  }

  const save=async()=>{

    if(!canSave){

      return

    }

    setSaving(true)

    const dto=buildProject()

    try{

      if(project){

        await update({

          id:project.id,

          dto,

        })

        close()

        return

      }

      const createdProject=
        await create(dto)

      close()

      setCreatedProjectId(
        createdProject.id,
      )

      setConfirmOpenProject(
        true,
      )

    }catch(error){

      console.error(
        "PROJECT SAVE ERROR",
        error,
      )

    }finally{

      setSaving(false)

    }

  }

  return(

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
          !saving
        }
        saveLabel={
          project
            ? "Guardar cambios"
            : "Crear proyecto"
        }
        onClose={close}
        onSave={save}
      >

        <ProjectForm
          form={form}
          update={updateForm}
        />

      </FormDialog>

      <ActionDialog
        open={confirmOpenProject}
        title="Abrir proyecto"
        description="
          El proyecto fue creado correctamente.
          ¿Deseas abrirlo ahora?
        "
        cancelLabel="Más tarde"
        confirmLabel="Abrir"
        onClose={()=>{

          setCreatedProjectId(null)

          setConfirmOpenProject(false)

        }}
        onConfirm={()=>{

          if(createdProjectId){

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