"use client"

import {
  useState,
} from "react"

import {
  Pencil,
  Trash2,
} from "lucide-react"

import {
  PermissionCode,
} from "@/shared/core/enums/permission-code.enum"

import {
  usePermissions,
} from "@/features/permissions/hooks/use-permissions"

import {
  IconAction,
} from "@/shared/ui/actions/icon-action"

import {
  ActionDialog,
} from "@/shared/ui/dialogs/action-dialog/action-dialog"

import {
  ProjectDialog,
} from "../dialog/project-dialog"

import {
  useTasks,
} from "@/features/tasks/hooks/use-tasks"

import {
  useProjects,
} from "../../hooks/use-projects"

import type{
  Project,
}from"../../types/project.types"

type Props={

  project:Project

}

const ACTIVE_STATUSES=[

  "PROGRESS",

  "PAUSED",

]as const

export function ProjectRowActions({

  project,

}:Props){

  const{
    remove,
  }=
    useProjects()

  const{
    has,
  }=
    usePermissions()

  const canUpdate=
    has(
      PermissionCode.PROJECT_UPDATE,
    )

  const canDelete=
    has(
      PermissionCode.PROJECT_DELETE,
    )

  const[
    editOpen,
    setEditOpen,
  ]=
    useState(false)

  const[
    deleteOpen,
    setDeleteOpen,
  ]=
    useState(false)

  const[
    error,
    setError,
  ]=
    useState<string|null>(
      null,
    )

  const{
    tasks,
  }=
    useTasks()

  const handleDelete=
    async()=>{

      if(!canDelete){
        return
      }

      const projectTasks=

        tasks.filter(

          task=>

            task.project.id===project.id,

        )

      const hasActiveTasks=

        projectTasks.some(

          task=>

            task.workflowSteps.some(

              step=>

                ACTIVE_STATUSES.includes(

                  step.status as (typeof ACTIVE_STATUSES)[number],

                ),

            ),

        )

      if(hasActiveTasks){

        setError(
          "No se puede eliminar: hay tareas en proceso.",
        )

        return

      }

      try{

        await remove(
          project.id,
        )

        setDeleteOpen(false)

        setError(null)

      }catch(error){

        console.error(
          "PROJECT DELETE ERROR",
          error,
        )

      }

    }

  return(

    <>

      <div className="ml-3 flex items-center gap-6">

        <IconAction

          icon={Pencil}

          disabled={!canUpdate}

          onClick={()=>{

            if(!canUpdate){
              return
            }

            setEditOpen(true)

          }}

        />

        <IconAction

          icon={Trash2}

          variant="danger"

          disabled={!canDelete}

          onClick={()=>{

            if(!canDelete){
              return
            }

            setDeleteOpen(true)

          }}

        />

      </div>

      <ProjectDialog

        open={
          canUpdate&&
          editOpen
        }

        project={project}

        onClose={()=>
          setEditOpen(false)
        }

      />

      <ActionDialog

        open={
          canDelete&&
          deleteOpen
        }

        title="Eliminar proyecto"

        description={
          error
            ?error
            :`Se eliminará "${project.name}".`
        }

        confirmLabel="Eliminar"

        variant="danger"

        onClose={()=>{

          setDeleteOpen(false)

          setError(null)

        }}

        onConfirm={handleDelete}

      />

    </>

  )

}