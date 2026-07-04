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
  TaskDialog,
} from "../dialog/task-dialog"

export function TaskActions(){

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
      PermissionCode.TASK_CREATE,
    )

  return(

    <>

      <PrimaryAction

        label="Nueva tarea"

        icon={Plus}

        disabled={!canCreate}

        onClick={()=>{

          if(!canCreate){
            return
          }

          setOpen(true)

        }}

      />

      {open&&(

        <TaskDialog

          open={open}

          promptOpenAfterCreate

          onClose={()=>
            setOpen(false)
          }

        />

      )}

    </>

  )

}