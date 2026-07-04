"use client"

import {
  useState,
} from "react"

import {
  Plus,
} from "lucide-react"

import {
  PermissionCode,
} from "@/shared/core/enums/permission-code.enum"

import {
  usePermissions,
} from "@/features/permissions/hooks/use-permissions"

import {
  PrimaryAction,
} from "@/shared/ui/actions/primary-action"

import {
  ProjectDialog,
} from "../dialog/project-dialog"

export function ProjectActions(){

  const[
    open,
    setOpen,
  ]=useState(false)

  const{
    has,
  }=
    usePermissions()

  const canCreate=
    has(
      PermissionCode.PROJECT_CREATE,
    )

  return(

    <>

      <PrimaryAction

        label="Nuevo proyecto"

        icon={Plus}

        disabled={!canCreate}

        onClick={()=>{

          if(!canCreate){
            return
          }

          setOpen(true)

        }}

      />

      <ProjectDialog

        open={open}

        onClose={()=>
          setOpen(false)
        }

      />

    </>

  )

}